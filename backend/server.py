from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import asyncio
import logging
import ipaddress
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
import bcrypt
import jwt
import httpx
from datetime import datetime, timezone, timedelta, date
from zoneinfo import ZoneInfo

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"
LOCKOUT_ATTEMPTS = 5
LOCKOUT_MINUTES = 15
EMERGENT_SESSION_DATA_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
SHOP_TZ = ZoneInfo("America/Montreal")

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ["EMERGENT_EMAIL_KEY"]
EMAIL_FROM_NAME = os.environ["EMAIL_FROM_NAME"]
NOTIFY_EMAILS = [e.strip() for e in os.environ.get("NOTIFY_EMAILS", "").split(",") if e.strip()]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def admin_emails() -> list:
    raw = os.environ.get("ADMIN_EMAILS") or os.environ.get("ADMIN_EMAIL", "")
    return [e.strip().lower() for e in raw.split(",") if e.strip()]


# --- Email guardrail gate (G2/G3) ---
_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str, reply_to: str | None = None) -> str | None:
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if reply_to:
        payload["contact_email"] = reply_to
    last_error = None
    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=30) as http:
                resp = await http.post(
                    f"{EMAIL_BASE_URL}/api/v1/email/send",
                    headers={"X-Email-Key": EMAIL_KEY},
                    json=payload,
                )
            if resp.status_code == 429 and attempt < 2:
                await asyncio.sleep(20 * (attempt + 1))
                continue
            resp.raise_for_status()
            return resp.json().get("id")
        except httpx.HTTPStatusError as e:
            logger.error("Email send failed: %s %s", e.response.status_code, e.response.text)
            raise
        except Exception as e:
            last_error = e
            logger.error("Email send error: %s", e)
            raise
    logger.error("Email send rate-limited after retries: %s", to)
    raise last_error or HTTPException(status_code=429, detail="Email rate limited")


def _notif_table(rows) -> str:
    body = "".join(
        f'<tr><td style="padding:6px 16px 6px 0;font-weight:bold;color:#888;vertical-align:top;white-space:nowrap">{escape(k)}</td>'
        f'<td style="padding:6px 0;color:#111">{escape(str(v))}</td></tr>'
        for k, v in rows if v
    )
    return f'<table role="presentation" style="font-family:Arial,sans-serif;font-size:14px">{body}</table>'


_OWNER_COPY = {
    "en": {
        "booking_subject": "New booking request — {bike}",
        "booking_title": "New booking request",
        "enquiry_subject": "New enquiry — {name}",
        "enquiry_title": "New enquiry from the website",
        "labels": {"Name": "Name", "Email": "Email", "Phone": "Phone", "Bike": "Bike", "Service": "Service", "Preferred": "Preferred", "Notes": "Notes", "Message": "Message", "Received": "Received"},
        "sent_by": "Sent by",
        "footer": "a new request came in through your website. Sign in to the admin dashboard to manage it.",
    },
    "fr": {
        "booking_subject": "Nouvelle demande de réservation — {bike}",
        "booking_title": "Nouvelle demande de réservation",
        "enquiry_subject": "Nouvelle demande — {name}",
        "enquiry_title": "Nouvelle demande depuis le site web",
        "labels": {"Name": "Nom", "Email": "E-mail", "Phone": "Téléphone", "Bike": "Moto", "Service": "Service", "Preferred": "Date souhaitée", "Notes": "Remarques", "Message": "Message", "Received": "Reçu le"},
        "sent_by": "Envoyé par",
        "footer": "une nouvelle demande est arrivée via votre site. Connectez-vous au tableau de bord admin pour la gérer.",
    },
}


def _owner_email(kind: str, name: str, rows, lang: str = "en", bike: str | None = None) -> tuple:
    copy = _OWNER_COPY.get(lang, _OWNER_COPY["en"])
    subject = copy[f"{kind}_subject"].format(name=name, bike=bike or "")
    title = copy[f"{kind}_title"]
    label_rows = [(copy["labels"].get(k, k), v) for k, v in rows]
    html = (
        '<table role="presentation" width="100%"><tr><td style="padding:24px;font-family:Arial,sans-serif">'
        f'<h2 style="margin:0 0 16px;font-family:Arial,sans-serif">{escape(title)}</h2>'
        + _notif_table(label_rows)
        + f'<p style="font-size:12px;color:#888;margin-top:24px">{escape(copy["sent_by"])} {escape(EMAIL_FROM_NAME)} — {escape(copy["footer"])}</p>'
        '</td></tr></table>'
    )
    return subject, html


_FR_MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]


def _fmt_date(iso: str, lang: str) -> str:
    try:
        d = date.fromisoformat(iso)
    except (ValueError, TypeError):
        return iso or ""
    if lang == "fr":
        return f"{d.day} {_FR_MONTHS[d.month - 1]} {d.year}"
    return f"{d.day} {d.strftime('%B')} {d.year}"


_CUSTOMER_COPY = {
    "en": {
        "booking_subject": "We've got your booking request — Local Moto",
        "booking_title": "Booking request received",
        "enquiry_subject": "We've got your message — Local Moto",
        "enquiry_title": "Message received",
        "intro": "Thanks {name} — your request is in. Here's what you sent us:",
        "closing": "We'll be in touch within one working day.",
        "labels": {"Bike": "Bike", "Service": "Service", "Preferred": "Preferred", "Notes": "Notes", "Message": "Message"},
        "sent_by": "Sent by",
        "footer": "We never ask for passwords or card details by email.",
        "reminder_subject": "Reminder: your Local Moto booking is tomorrow",
        "reminder_title": "Booking reminder",
        "reminder_intro": "Hi {name} — a quick reminder that your {bike} is booked in with us tomorrow, {date}. If anything has changed, just reply to this email or call 514 266 6607.",
    },
    "fr": {
        "booking_subject": "Votre demande de réservation est bien reçue — Local Moto",
        "booking_title": "Demande de réservation reçue",
        "enquiry_subject": "Nous avons bien reçu votre message — Local Moto",
        "enquiry_title": "Message bien reçu",
        "intro": "Merci {name} — votre demande est bien enregistrée. Voici ce que vous nous avez envoyé :",
        "closing": "Nous vous recontactons sous un jour ouvré.",
        "labels": {"Bike": "Moto", "Service": "Service", "Preferred": "Date souhaitée", "Notes": "Remarques", "Message": "Message"},
        "sent_by": "Envoyé par",
        "footer": "Nous ne demandons jamais de mot de passe ni de coordonnées bancaires par e-mail.",
        "reminder_subject": "Rappel : votre rendez-vous Local Moto, c'est demain",
        "reminder_title": "Rappel de rendez-vous",
        "reminder_intro": "Bonjour {name} — petit rappel : votre {bike} est attendue à l'atelier demain, {date}. Si quelque chose a changé, répondez à cet e-mail ou appelez le 514 266 6607.",
    },
}


def _customer_email(kind: str, name: str, rows, lang: str = "en") -> tuple:
    copy = _CUSTOMER_COPY.get(lang, _CUSTOMER_COPY["en"])
    subject = copy[f"{kind}_subject"]
    title = copy[f"{kind}_title"]
    label_rows = [(copy["labels"].get(k, k), v) for k, v in rows]
    html = (
        '<table role="presentation" width="100%"><tr><td style="padding:24px;font-family:Arial,sans-serif">'
        f'<h2 style="margin:0 0 16px;font-family:Arial,sans-serif">{escape(title)}</h2>'
        f'<p style="font-family:Arial,sans-serif;font-size:14px;color:#111">{escape(copy["intro"].format(name=name))}</p>'
        + _notif_table(label_rows)
        + f'<p style="font-family:Arial,sans-serif;font-size:14px;color:#111;margin-top:16px">{escape(copy["closing"])}</p>'
        + f'<p style="font-size:12px;color:#888;margin-top:24px">{escape(copy["sent_by"])} {escape(EMAIL_FROM_NAME)}. {escape(copy["footer"])}</p>'
        '</td></tr></table>'
    )
    return subject, html


def _reminder_email(name: str, bike: str, date_iso: str, lang: str = "en") -> tuple:
    copy = _CUSTOMER_COPY.get(lang, _CUSTOMER_COPY["en"])
    pretty = _fmt_date(date_iso, lang)
    intro = copy["reminder_intro"].format(name=escape(name), bike=escape(bike), date=escape(pretty))
    html = (
        '<table role="presentation" width="100%"><tr><td style="padding:24px;font-family:Arial,sans-serif">'
        f'<h2 style="margin:0 0 16px;font-family:Arial,sans-serif">{escape(copy["reminder_title"])}</h2>'
        f'<p style="font-family:Arial,sans-serif;font-size:14px;color:#111">{intro}</p>'
        f'<p style="font-size:12px;color:#888;margin-top:24px">{escape(copy["sent_by"])} {escape(EMAIL_FROM_NAME)}. {escape(copy["footer"])}</p>'
        '</td></tr></table>'
    )
    return copy["reminder_subject"], html


async def notify_customer(to: str, subject: str, html: str) -> None:
    try:
        await send_email(to=to, subject=subject, html=html, reply_to=NOTIFY_EMAILS[0] if NOTIFY_EMAILS else None)
        logger.info("Confirmation email sent to %s", to)
    except Exception as e:
        logger.error("Confirmation email to %s failed: %s", to, e)


async def notify_all(subject: str, html: str, reply_to: str | None = None) -> None:
    for to in NOTIFY_EMAILS:
        try:
            await send_email(to=to, subject=subject, html=html, reply_to=reply_to)
            logger.info("Notification email sent to %s", to)
        except Exception as e:
            logger.error("Notification email to %s failed: %s", to, e)


async def check_booking_reminders() -> None:
    tomorrow = (datetime.now(SHOP_TZ) + timedelta(days=1)).date().isoformat()
    due = await db.bookings.find(
        {"appointment_date": tomorrow, "reminder_sent": {"$ne": True}, "status": {"$ne": "done"}, "email": {"$ne": None}},
        {"_id": 0},
    ).to_list(200)
    for b in due:
        subject, html = _reminder_email(b["name"], b["bike_model"], b["appointment_date"], b.get("lang") or "en")
        await notify_customer(b["email"], subject, html)
        await db.bookings.update_one({"id": b["id"]}, {"$set": {"reminder_sent": True}})
    if due:
        logger.info("Sent %d booking reminder(s) for %s", len(due), tomorrow)


async def reminder_loop() -> None:
    while True:
        try:
            await check_booking_reminders()
        except Exception as e:
            logger.error("Reminder check failed: %s", e)
        await asyncio.sleep(3600)


# --- Auth helpers ---
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALGORITHM)


def public_user(user: dict) -> dict:
    return {"id": user["id"], "email": user["email"], "name": user.get("name", "Admin"), "role": user.get("role", "admin")}


async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    token = auth_header[7:] if auth_header.startswith("Bearer ") else request.cookies.get("session_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        pass

    session = await db.user_sessions.find_one({"session_token": token})
    if session:
        expires_at = session["expires_at"]
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Session expired")
        user = await db.users.find_one({"id": session["user_id"]}, {"_id": 0, "password_hash": 0})
        if user:
            return user
    raise HTTPException(status_code=401, detail="Invalid token")


async def seed_admin():
    admin_password = os.environ["ADMIN_PASSWORD"]
    allowed = admin_emails()
    for email in allowed:
        existing = await db.users.find_one({"email": email})
        if existing is None:
            await db.users.insert_one({
                "id": str(uuid.uuid4()),
                "email": email,
                "password_hash": hash_password(admin_password),
                "name": "Shop Admin",
                "role": "admin",
                "created_at": now_iso(),
            })
            logger.info("Admin user seeded: %s", email)
        elif not existing.get("password_hash") or not verify_password(admin_password, existing["password_hash"]):
            await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(admin_password)}})
            logger.info("Admin password updated from env: %s", email)
    removed = await db.users.delete_many({"role": "admin", "email": {"$nin": allowed}})
    if removed.deleted_count:
        logger.info("Removed %d stale admin user(s)", removed.deleted_count)


class Enquiry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    message: str = Field(min_length=1, max_length=3000)
    lang: Optional[str] = Field(default=None, max_length=5)
    status: str = "new"
    created_at: str = Field(default_factory=now_iso)


class EnquiryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    message: str = Field(min_length=1, max_length=3000)
    lang: Optional[str] = Field(default=None, max_length=5)


class Booking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(min_length=1, max_length=120)
    phone: str = Field(min_length=5, max_length=30)
    email: Optional[EmailStr] = None
    bike_model: str = Field(min_length=1, max_length=120)
    service_type: str = Field(min_length=1, max_length=120)
    preferred_date: Optional[str] = Field(default=None, max_length=120)
    notes: Optional[str] = Field(default=None, max_length=3000)
    budget_range: Optional[str] = Field(default=None, max_length=60)
    project_vision: Optional[str] = Field(default=None, max_length=3000)
    lang: Optional[str] = Field(default=None, max_length=5)
    appointment_date: Optional[str] = Field(default=None, max_length=10)
    reminder_sent: bool = False
    status: str = "new"
    created_at: str = Field(default_factory=now_iso)


class BookingCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    phone: str = Field(min_length=5, max_length=30)
    email: Optional[EmailStr] = None
    bike_model: str = Field(min_length=1, max_length=120)
    service_type: str = Field(min_length=1, max_length=120)
    preferred_date: Optional[str] = Field(default=None, max_length=120)
    notes: Optional[str] = Field(default=None, max_length=3000)
    budget_range: Optional[str] = Field(default=None, max_length=60)
    project_vision: Optional[str] = Field(default=None, max_length=3000)
    lang: Optional[str] = Field(default=None, max_length=5)


class BookingUpdate(BaseModel):
    status: Optional[str] = Field(default=None, pattern="^(new|contacted|done)$")
    appointment_date: Optional[str] = Field(default=None, max_length=10)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleSessionRequest(BaseModel):
    session_id: str = Field(min_length=1)


class StatusUpdate(BaseModel):
    status: str = Field(pattern="^(new|contacted|done)$")


@api_router.get("/")
async def root():
    return {"message": "Local Moto API running"}


@api_router.post("/auth/login")
async def login(payload: LoginRequest, request: Request):
    email = payload.email.lower()
    identifier = f"{request.client.host}:{email}"

    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("count", 0) >= LOCKOUT_ATTEMPTS:
        locked_at = datetime.fromisoformat(attempt["updated_at"])
        if datetime.now(timezone.utc) - locked_at < timedelta(minutes=LOCKOUT_MINUTES):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")

    user = await db.users.find_one({"email": email})
    if not user or not user.get("password_hash") or not verify_password(payload.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"updated_at": now_iso()}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await db.login_attempts.delete_one({"identifier": identifier})
    token = create_access_token(user["id"], email)
    return {"token": token, "user": public_user(user)}


@api_router.post("/auth/session")
async def create_google_session(payload: GoogleSessionRequest, response: Response):
    async with httpx.AsyncClient(timeout=10) as http:
        r = await http.get(EMERGENT_SESSION_DATA_URL, headers={"X-Session-ID": payload.session_id})
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired Google session")

    data = r.json()
    email = data["email"].lower()
    if email not in admin_emails():
        raise HTTPException(status_code=403, detail="This Google account isn't authorised for the workshop admin.")

    user = await db.users.find_one({"email": email})
    if not user:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": email,
            "password_hash": hash_password(os.environ["ADMIN_PASSWORD"]),
            "name": data.get("name", "Shop Admin"),
            "role": "admin",
            "created_at": now_iso(),
        })
        user = await db.users.find_one({"email": email})

    session_token = data["session_token"]
    await db.user_sessions.delete_many({"user_id": user["id"]})
    await db.user_sessions.insert_one({
        "user_id": user["id"],
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": now_iso(),
    })
    response.set_cookie(key="session_token", value=session_token, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    return {"token": session_token, "user": public_user(user)}


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    if token:
        await db.user_sessions.delete_many({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"message": "Logged out"}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@api_router.post("/enquiries", response_model=Enquiry, status_code=201)
async def create_enquiry(payload: EnquiryCreate):
    enquiry = Enquiry(**payload.model_dump())
    await db.enquiries.insert_one(enquiry.model_dump())
    osubject, ohtml = _owner_email("enquiry", enquiry.name, [
        ("Name", enquiry.name),
        ("Email", enquiry.email),
        ("Message", enquiry.message),
        ("Received", enquiry.created_at),
    ], enquiry.lang or "en")
    asyncio.create_task(notify_all(osubject, ohtml, reply_to=enquiry.email))
    csubject, chtml = _customer_email("enquiry", enquiry.name, [("Message", enquiry.message)], enquiry.lang or "en")
    asyncio.create_task(notify_customer(enquiry.email, csubject, chtml))
    return enquiry


@api_router.get("/enquiries", response_model=List[Enquiry])
async def list_enquiries(user: dict = Depends(get_current_user)):
    docs = await db.enquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for d in docs:
        d.setdefault("status", "new")
    return docs


@api_router.patch("/enquiries/{item_id}", response_model=Enquiry)
async def update_enquiry(item_id: str, payload: StatusUpdate, user: dict = Depends(get_current_user)):
    result = await db.enquiries.update_one({"id": item_id}, {"$set": {"status": payload.status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    doc = await db.enquiries.find_one({"id": item_id}, {"_id": 0})
    return doc


@api_router.delete("/enquiries/{item_id}", status_code=204)
async def delete_enquiry(item_id: str, user: dict = Depends(get_current_user)):
    result = await db.enquiries.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")


@api_router.post("/bookings", response_model=Booking, status_code=201)
async def create_booking(payload: BookingCreate):
    booking = Booking(**payload.model_dump())
    await db.bookings.insert_one(booking.model_dump())
    osubject, ohtml = _owner_email("booking", booking.name, [
        ("Name", booking.name),
        ("Phone", booking.phone),
        ("Email", booking.email),
        ("Bike", booking.bike_model),
        ("Service", booking.service_type),
        ("Preferred", booking.preferred_date),
        ("Notes", booking.notes),
        ("Received", booking.created_at),
    ], booking.lang or "en", bike=booking.bike_model)
    asyncio.create_task(notify_all(osubject, ohtml, reply_to=booking.email))
    if booking.email:
        csubject, chtml = _customer_email("booking", booking.name, [
            ("Bike", booking.bike_model),
            ("Service", booking.service_type),
            ("Preferred", booking.preferred_date),
            ("Notes", booking.notes),
        ], booking.lang or "en")
        asyncio.create_task(notify_customer(booking.email, csubject, chtml))
    return booking


@api_router.get("/bookings", response_model=List[Booking])
async def list_bookings(user: dict = Depends(get_current_user)):
    docs = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for d in docs:
        d.setdefault("status", "new")
        d.setdefault("appointment_date", None)
        d.setdefault("reminder_sent", False)
    return docs


@api_router.patch("/bookings/{item_id}", response_model=Booking)
async def update_booking(item_id: str, payload: BookingUpdate, user: dict = Depends(get_current_user)):
    update = {}
    if payload.status is not None:
        update["status"] = payload.status
    if payload.appointment_date is not None:
        update["appointment_date"] = payload.appointment_date or None
        update["reminder_sent"] = False
    if not update:
        raise HTTPException(status_code=400, detail="Nothing to update")
    result = await db.bookings.update_one({"id": item_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    doc = await db.bookings.find_one({"id": item_id}, {"_id": 0})
    doc.setdefault("reminder_sent", False)
    return doc


@api_router.delete("/bookings/{item_id}", status_code=204)
async def delete_booking(item_id: str, user: dict = Depends(get_current_user)):
    result = await db.bookings.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.user_sessions.create_index("session_token")
    await seed_admin()
    asyncio.create_task(reminder_loop())


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
