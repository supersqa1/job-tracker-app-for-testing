# SuperSQA Job Tracker Backend

FastAPI backend for the job application tracker.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 3050
```

API docs: http://localhost:3050/docs

## Unit Test

From the project root:

```bash
./unit-test-backend.sh
```

Or from this directory:

```bash
python -m pytest
```

## Database

SQLite database file lives at `backend/data/job_tracker.db` (gitignored). The `data/` directory is kept in version control via `.gitkeep` so the path always exists. Override the path with `DATABASE_PATH` in `.env`.

## Seeded Course Accounts

These accounts are created automatically when the backend starts:

| Role | Email | Password |
|------|-------|----------|
| User | `student@example.com` | `Password123!` |
| Admin | `admin@example.com` | `AdminPassword123!` |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/v1/health` | Versioned health check |
| GET | `/api/v1/public/status` | Public app/API status |
| GET | `/api/v1/public/demo-stats` | Public aggregate demo statistics |
| GET | `/api/v1/public/rate-limit-demo` | Public endpoint with a low limit for practicing `429` examples |
| POST | `/api/v1/auth/register` | Register a normal user |
| POST | `/api/v1/auth/login` | Log in and receive a JWT bearer token |
| POST | `/api/v1/auth/change-password` | Change current user's password, JWT required |
| GET | `/api/v1/users/me` | Get current user profile, JWT required |
| PATCH | `/api/v1/users/me` | Update current user profile, JWT required |
| GET | `/api/v1/admin/status` | Admin-only status check, JWT required |
| POST | `/api/v1/api-keys` | Create an API key, JWT required |
| GET | `/api/v1/api-keys` | List current user's API key metadata, JWT required |
| PATCH | `/api/v1/api-keys/{id}` | Rename, activate, deactivate, or set expiration on current user's API key, JWT required |
| DELETE | `/api/v1/api-keys/{id}` | Revoke current user's API key, JWT required |
| GET | `/api/v1/applications` | List current user's applications, JWT or API key required |
| GET | `/api/v1/applications?paginated=true` | List current user's applications with `items`, `total`, `limit`, and `offset` metadata |
| GET | `/api/v1/applications/summary` | Current user's pipeline counts by status, JWT or API key required |
| GET | `/api/v1/applications/{id}` | Get current user's single application, JWT or API key required |
| POST | `/api/v1/applications` | Create application for current user, JWT or API key required |
| PATCH | `/api/v1/applications/{id}` | Update current user's application, JWT or API key required |
| DELETE | `/api/v1/applications/{id}` | Delete current user's application, JWT or API key required |

## Login Example

```bash
curl -X POST http://localhost:3050/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"Password123!"}'
```

Use the returned `access_token` as a bearer token for protected endpoints:

```bash
curl http://localhost:3050/api/v1/applications \
  -H "Authorization: Bearer <access_token>"
```

## API Key Example

API keys are managed with JWT login. The raw key is shown only once when created.

```bash
curl -X POST http://localhost:3050/api/v1/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"name":"Postman key"}'
```

The response includes `api_key`. Store that value somewhere safe; later list calls
only show metadata such as `id`, `name`, `key_prefix`, and `is_active`.

Use an API key with protected application endpoints:

```bash
curl http://localhost:3050/api/v1/applications \
  -H "X-API-Key: <api_key>"
```

API keys cannot manage account/security endpoints such as `/api/v1/users/me` or
`/api/v1/api-keys`.

## Error Format

Error responses use a stable shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  }
}
```

## Rate Limit Example

The public demo endpoint is intentionally low-limit. It allows only 2 requests
per minute from the same client so students can practice testing
`429 Too Many Requests` and rate-limit headers.

```bash
curl -i http://localhost:3050/api/v1/public/rate-limit-demo
```

Responses include:

```text
X-RateLimit-Limit
X-RateLimit-Remaining
X-RateLimit-Reset
Retry-After
```
