# Local Moto — PRD

## Original Problem Statement
"build me a web page called local moto where its a web page for a small company that repairs motorcycles"

User choices: showcase + working contact form + service booking request form; services = repairs, maintenance, tyres, MOT/inspection, custom work; vibe = dark garage/workshop + vintage retro. Real business details to be supplied later (placeholders in use).

Follow-up requests (2026-08-13): gallery with deep shadows and mechanical details; main headings fade in / track out on scroll.

Scope change (2026-08-13): owner removed Custom Builds & Restoration as an offered service — removed from services grid, marquee, booking form (incl. custom-quote panel), hero copy and testimonial; gallery re-themed from "custom work" to general workshop/repair frames. Backend still accepts optional budget_range/project_vision (harmless legacy fields, unused by UI).

## Architecture
- Frontend: React (CRA/craco), Tailwind, framer-motion (scroll reveals, kinetic hero, scroll-linked heading tracking), lenis (momentum scroll), react-fast-marquee (editorial ribbon), sonner toasts.
- Backend: FastAPI, MongoDB (motor), `/api` prefix. Endpoints: `GET /api/` health, `POST/GET /api/bookings`, `POST/GET /api/enquiries`.
- Design system: Bebas Neue display, Cormorant Garamond editorial italic, Manrope body, IBM Plex Mono labels; bg #0A0A0A, cards #121212, rust accent #D35400; noise overlay, 1px industrial borders, spotlight gallery frames.

## User Personas
- Local rider needing repair/service/MOT — wants fast trust and an easy booking path.
- Custom build dreamer — wants proof of craft (gallery, manifesto) and a clear quote path.
- Shop owner — wants enquiries and booking requests captured reliably.

## Core Requirements (static)
1. Award-worthy dark industrial single-page site. 2. Kinetic hero with masked line reveal + parallax. 3. Editorial marquee. 4. Numbered services (01–05). 5. Manifesto chapters. 6. Custom-work gallery with deep shadows. 7. Booking form with custom-quote path (budget + vision). 8. Contact enquiry form. 9. Placeholder contact details, swappable.

## Implemented
- 2026-08-13: Full site (hero, marquee, services, manifesto, gallery, testimonials, contact/booking, footer); backend bookings + enquiries stored in MongoDB; scroll-linked tracked headings; custom-quote panel with budget chips + project vision; verified end-to-end (curl + browser form submission with toasts).
- 2026-08-13: Removed Custom Builds & Restoration offering per owner request (services, marquee, booking form, gallery re-themed to repair work). Backend still accepts optional budget_range/project_vision (harmless legacy fields, unused by UI).
- 2026-08-14: Hero stats changed to 2+ years / 500+ bikes; rating stat removed; Est. 2024 + "two years in" copy consistency fixes.
- 2026-08-14: Private admin dashboard at /admin — JWT login (seeded admin from env), protected GET/PATCH/DELETE for bookings & enquiries, status workflow (new → contacted → done, reopen, delete), brute-force lockout (5 fails = 15 min), notification bell in admin header with badge count of new requests + dropdown that jumps to each request. Verified end-to-end (login, 401s, status updates, bell dropdown).
- 2026-08-14: Google sign-in added alongside password login (Emergent-managed OAuth). Flow: "Continue with Google" → auth.emergentagent.com → back to /admin#session_id → POST /api/auth/session exchanges it backend-side → 7-day session token (Bearer, same localStorage key as JWT). Only the Google account matching ADMIN_EMAIL is allowed in (others get 403). Verified: fake session_id → 401, manual session token authenticates, OAuth redirect lands on real Google sign-in page. Full Google round-trip NOT tested (needs the owner's real Google account).
- 2026-08-14: EN/FR language toggle (globe icon) on the /admin page — login card and dashboard header; all admin strings translated; choice persisted in localStorage. Verified: French persists across login and toggles back.
- 2026-08-14: EN/FR toggle extended to the whole public site via shared language context (lib/site-lang.jsx) — header, hero, marquee, services, manifesto, gallery, testimonials, contact/booking forms, footer all translated; booking chips display French but submit canonical English service values; choice persisted in localStorage (lm_site_lang). Star ratings removed from testimonials per owner request. Verified: full FR scroll-through, FR booking submission, toggle back to EN, zero leftover rating icons.
- 2026-08-14: Email inbox alerts live via Emergent managed Resend proxy (EMERGENT_EMAIL_KEY, EMAIL_FROM_NAME="Local Moto"). Every booking and enquiry emails NOTIFY_EMAILS (laltheolalu@gmail.com, Pierre.localmoto@gmail.com) as a background task with reply-to set to the customer's email; guardrail gate applied per playbook. Verified: test booking + enquiry → four 202 Accepted sends logged. Owners should confirm the test emails actually arrived (check spam on first send).
- 2026-08-14: Admin access switched to the owners' real Gmail addresses (ADMIN_EMAILS env list): laltheolalu@gmail.com and Pierre.localmoto@gmail.com. Both work for password login (shared ADMIN_PASSWORD) and Google sign-in (403 for any other Google account; first Google sign-in auto-creates the admin user). Old placeholder admin@localmoto.co.uk is auto-removed on startup. Verified: both new emails log in via password, old email rejected.
- 2026-08-14: Customer auto-reply emails: booking (if email given) and enquiry submissions instantly email the customer a "we got your request" confirmation with their submitted details; reply-to is the shop inbox. Fire-and-forget so email failure never breaks submissions. Verified: confirmation send accepted (delivered@resend.dev test address); fake addresses get blocked by the proxy while the form submission still succeeds.
- 2026-08-14: French auto-replies — forms now pass the site language to the backend; confirmation emails render fully in French when the customer used the French site (subjects, labels, closing, footer). French site copy proofread pass applied ("Années d'expérience", "Quatre prestations. Bien faites.", bouche-à-oreille phrasing, "avant-achat", cleaner date placeholder). Email sender now retries with backoff on provider rate limits. Verified: FR booking stored lang=fr and French confirmation email sent successfully after retry window. NOTE: a true native-speaker proofread is a human task — owners should still have a French speaker skim the site copy.
- 2026-08-14: Real details added — address 4273 Laurentian Autoroute and phone 514 266 6607 in contact section + footer (tel: links). Opening hours removed everywhere per owner request. Public email hello@localmoto.co.uk remains a PLACEHOLDER (owner gave no public email).
- 2026-08-14: Owner notification emails now follow the customer's language too (FR subjects/titles/labels when booked from the French site). Address in contact section and footer links to Google Maps directions (new tab). Verified: FR booking triggered French owner alerts to both inboxes + French customer confirmation; both address links confirmed live.

## Backlog
- P0: Replace placeholder address/phone/hours/email with real business details (user to supply).
- P1: Email notification to owner on new booking/enquiry (Resend managed integration).
- P1: Simple admin view to read bookings/enquiries (or auto-forward).
- P2: Real customer testimonials + real build photos; Google Maps embed; SEO meta/OG images; Instagram feed.
