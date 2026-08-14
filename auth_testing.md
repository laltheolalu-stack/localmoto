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
