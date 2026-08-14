# Auth Testing Playbook — Local Moto

Step 1: MongoDB verification
```
mongosh
use test_database
db.users.find({role: "admin"}).pretty()
db.users.findOne({role: "admin"}, {password_hash: 1})
```
Verify: bcrypt hash starts with `$2b$`, unique index on users.email, index on login_attempts.identifier.

Step 2: API testing
```
API_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
TOKEN=$(curl -s -X POST "$API_URL/api/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@localmoto.co.uk","password":"LocalMoto2026!"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
curl -s "$API_URL/api/auth/me" -H "Authorization: Bearer $TOKEN"
curl -s "$API_URL/api/bookings" -H "Authorization: Bearer $TOKEN"
curl -s -X PATCH "$API_URL/api/bookings/<id>" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"status":"contacted"}'
```
Verify: login returns token + user; /me returns the admin; unauthenticated GET /api/bookings returns 401; 5 bad logins → 429 lockout for 15 min.

## Google sign-in (Emergent-managed OAuth)

- Login page /admin has "Continue with Google" → redirects to auth.emergentagent.com with redirect=<origin>/admin (never hardcoded, derived from window.location.origin).
- Callback: /admin#session_id=... → frontend POSTs session_id to POST /api/auth/session → backend exchanges it at Emergent's session-data endpoint (backend-only call) → returns session_token (7 days), stored in localStorage under lm_admin_token and used as Bearer token.
- get_current_user accepts JWT (from password login) or session_token (from Google login) via Bearer header or session_token cookie.
- Access control: only the Google account matching ADMIN_EMAIL in backend/.env is allowed (others get 403 "not authorised").
- Test: POST /api/auth/session with a fake session_id must return 401. Create a manual session in db.user_sessions (user_id = admin user id, session_token, expires_at +7d) and verify GET /api/auth/me with "Authorization: Bearer <session_token>" returns the admin user.
