# SuperSQA Job Tracker

Full-stack job tracker used for API testing, UI automation, and course practice.

SuperSQA Job Tracker helps users manage job applications, interviews, follow-ups, and notes. It includes a real backend, frontend, database, authentication, API keys, Swagger docs, and developer-owned tests.

> [!IMPORTANT]
> This repo is the stable course copy used in SuperSQA lessons and student exercises. The separate portfolio project is where the app continues to grow with new features, CI/CD, monitoring, servers, Terraform, and production-style work. Keep `main` stable for course content; use branches or tags for special demos.

| Link | Status |
|---|---|
| Real portfolio repo | https://github.com/supersqa1/supersqa-job-tracker |
| Live portfolio app | `Comming Soon` |
| SuperSQA community/subscription | https://supersqa.com |

## Quick Start for Students

Most students should start here. This runs the backend API and the packaged frontend together.

```bash
./run-app.sh
```

Then open:

- App: `http://localhost:3050`
- Swagger API docs: `http://localhost:3050/docs`

Windows users:

```bat
run-app.bat
```

PowerShell users:

```powershell
.\run-app.ps1
```

For more details, see [Easy Run for Courses](#easy-run-for-courses--recommended-for-students).

## Table of Contents

- [Quick Start for Students](#quick-start-for-students)
- [1. What This Repo Is](#1-what-this-repo-is)
- [2. Running the App](#2-running-the-app)
  - [Environment Files](#environment-files)
  - [Database File](#database-file)
  - [Easy Run for Courses — Recommended for Students](#easy-run-for-courses--recommended-for-students)
  - [Development Run](#development-run)
  - [Updating the Packaged Frontend](#updating-the-packaged-frontend)
- [3. Login Accounts](#3-login-accounts)
- [4. API and Authentication](#4-api-and-authentication)
  - [Swagger](#swagger)
  - [How Authentication Works](#how-authentication-works)
  - [Example API Calls](#example-api-calls)
  - [API Key Authentication](#api-key-authentication)
  - [API Key Management](#api-key-management)
  - [Public and Protected Endpoints](#public-and-protected-endpoints)
  - [Errors and Rate Limits](#errors-and-rate-limits)
- [5. Project Structure](#5-project-structure)

---

# 1. What This Repo Is

This is a real full-stack app, but this copy is packaged for learning and testing.

It has:

- A FastAPI backend
- A SQLite database
- A Next.js frontend
- Login and registration
- JWT authentication
- API key support
- Protected APIs
- Public demo APIs
- Swagger docs
- Developer-owned tests

Common uses:

| Use case | Why this app works well |
|---|---|
| API testing | Stable endpoints, auth, errors, rate limits, Swagger |
| BDD testing | Real workflows with predictable data |
| UI automation | Full frontend with login, forms, and drag-and-drop |
| CI/CD lessons | Real backend, frontend, tests, and build steps |
| Monitoring lessons | Health checks and realistic API behavior |

---

# 2. Running the App

> [!TIP]
> **Most students should use the easy course run.**
>
> From the project root, run one command:
>
> ```bash
> ./run-app.sh
> ```
>
> Then open `http://localhost:3050`. Windows commands are listed in [Easy Run for Courses](#easy-run-for-courses).

## Environment Files

This project uses environment files for local settings like ports, database path, and API URL.

You will see files ending in `.example`:

- `backend/.env.example`
- `frontend/.env.local.example`

These are template files. They are safe to keep in the repo.

When you run the app, the real local files are:

- `backend/.env`
- `frontend/.env.local`

Those real files are for your computer only. They are ignored by git and should not be committed.

If you use the scripts, they create the real files for you if they are missing:

- `run-app.*` creates `backend/.env`
- `start-backend.*` creates `backend/.env`
- `start-frontend.*` creates `frontend/.env.local`

If you run the setup manually, make a copy of the example file and remove `.example` from the copied file name.

Backend:

```bash
cd backend
cp .env.example .env
```

Frontend:

```bash
cd frontend
cp .env.local.example .env.local
```

On Windows, you can also copy the files in File Explorer:

- Copy `backend/.env.example`, paste it in the same folder, and rename the copy to `.env`.
- Copy `frontend/.env.local.example`, paste it in the same folder, and rename the copy to `.env.local`.

Do not delete the `.example` files. They are the templates students can use to create their own local files.

## Database File

The app uses SQLite. SQLite stores the database in one local file:

```text
backend/data/job_tracker.db
```

You do not need to create this file yourself.

When the backend starts, it automatically:

- Creates the database file if it does not exist.
- Creates the database tables if they do not exist.
- Adds the seeded student and admin accounts.
- Adds the seeded demo job applications.

The database file is not tracked in git. That is intentional.

The repo tracks `backend/data/.gitkeep` only so the `data` folder exists after cloning. The real `job_tracker.db` file belongs to your local computer and is ignored by git.

To reset the app data:

1. Stop the backend.
2. Delete `backend/data/job_tracker.db`.
3. Start the backend again.

The backend will create a fresh database with the seeded data again.

> [!WARNING]
> Use Course Mode when you want to run the app for a course, write tests, use Swagger, use Postman, or try the UI as a user. Do not use Course Mode when you want to change the UI. For real app development, use [Development Run](#development-run).

## Easy Run for Courses — Recommended for Students

> [!IMPORTANT]
> Start here for API testing, Swagger, Postman, pytest, and most course lessons. This mode only needs Python. Students do not need Node.js and do not need to run the frontend separately.

Course Mode is the student-friendly way to run the stable app.

In this mode, FastAPI serves both:

- the API
- the packaged frontend from `backend/static`

The packaged frontend is already included in the repo. Students do not need to build it.

The easiest option is to run the script from the project root:

macOS or Linux:

```bash
./run-app.sh
```

Windows Command Prompt:

```bat
run-app.bat
```

Windows PowerShell:

```powershell
.\run-app.ps1
```

The script does these steps for you:

- Creates `backend/.venv` if it does not exist.
- Uses the existing `backend/.venv` if it already exists.
- Installs backend dependencies.
- Creates `backend/.env` from `backend/.env.example` if needed.
- Uses the packaged frontend from `backend/static`.
- Starts the app on port `3050`.

Then open:

- App: `http://localhost:3050`
- Swagger docs: `http://localhost:3050/docs`
- API health check: `http://localhost:3050/api/health`

If port `3050` is already being used, choose another port.

macOS or Linux:

```bash
PORT=3060 ./run-app.sh
```

Windows Command Prompt:

```bat
set PORT=3060
run-app.bat
```

Windows PowerShell:

```powershell
$env:PORT = "3060"
.\run-app.ps1
```

Then open the same URLs with the new port, for example `http://localhost:3060/docs`.

### Manual Steps

If you do not want to use the script, run the same steps manually.

macOS or Linux:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 3050
```

Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 3050
```

Windows Command Prompt:

```bat
cd backend
python -m venv .venv
.venv\Scripts\activate.bat
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 3050
```


---

## Development Run

Use Development Run when you want to work on the app itself. This mode runs the backend and frontend separately and requires both Python and Node.js.

#### Start the Backend

From the project root:

```bash
./start-backend.sh
```

Or manually:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 3050
```

Backend:

- API: `http://localhost:3050`
- Swagger docs: `http://localhost:3050/docs`

#### Start the Frontend

From the project root:

```bash
./start-frontend.sh
```

Or manually:

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend:

- App: `http://localhost:8050`

Windows scripts are also included:

- `start-backend.bat`
- `start-backend.ps1`
- `start-frontend.bat`
- `start-frontend.ps1`

---

### Updating the Packaged Frontend

Development mode is where you change the frontend source code.

Easy mode uses the packaged copy in:

```text
backend/static
```

If you change the frontend and want easy mode to serve the new UI, rebuild the packaged copy from the project root.

macOS or Linux:

```bash
./build-course-app.sh
```

Windows Command Prompt:

```bat
build-course-app.bat
```

Windows PowerShell:

```powershell
.\build-course-app.ps1
```

That script:

- builds the frontend into `frontend/out`
- clears the old `backend/static` files
- copies the fresh build into `backend/static`

After that, run easy mode again:

```bash
./run-app.sh
```

---

# 3. Login Accounts

These accounts are created automatically when the backend starts:

| Type | Email | Password |
|---|---|---|
| Student user | `student@example.com` | `Password123!` |
| Admin user | `admin@example.com` | `AdminPassword123!` |

Most course examples should use the student user.

The admin user is included so lessons can show permission checks, such as `401 Unauthorized` vs `403 Forbidden`.

### User Roles

There are two roles:

| Role | How it is created | What it is for |
|---|---|---|
| `user` | Created by normal registration | Regular app usage and most course examples |
| `admin` | Created only by seed data or direct database changes | Admin-only permission examples |

When someone registers through the UI or `POST /api/v1/auth/register`, they are always created as a normal `user`.

Registration does not allow choosing a role:

- The UI does not show a role field.
- The registration API does not accept a role field.
- Admin users cannot create other admin users.
- There is no public API for creating admins.

---

# 4. API and Authentication

# Swagger

Swagger is available here:

```text
http://localhost:3050/docs
```

Swagger lets students:

- See all API routes
- Try public APIs
- Log in
- Copy a JWT token
- Send protected requests
- See request and response examples

Most stable course APIs live under:

```text
/api/v1
```

There is also a simple health check:

```text
/api/health
```

## How Authentication Works

The app supports two common ways to call protected APIs.

## JWT Login

JWT is the normal login flow.

Plain English version:

1. You send your email and password to the login API.
2. The API sends back a token.
3. You include that token in later API calls.
4. The backend uses the token to know who you are.

The header looks like this:

```http
Authorization: Bearer <access_token>
```

Use JWT when:

- Logging into the frontend
- Calling APIs from Swagger
- Calling APIs from Postman
- Writing Python or pytest setup code
- Creating API keys
- Updating your profile or password

## API Key Authentication

API keys are for scripts and tools.

Plain English version:

1. Log in with JWT.
2. Create an API key from the Settings page or API.
3. Copy the key when it is shown.
4. Use the key in later API calls.

The header looks like this:

```http
X-API-Key: <api_key>
```

API keys can call job application APIs.

API keys cannot manage account security. For example, API keys cannot create more API keys.

## Example API Calls

### Health Check

```bash
curl http://localhost:3050/api/health
```

### Public Status

```bash
curl http://localhost:3050/api/v1/public/status
```

### Login

```bash
curl -X POST http://localhost:3050/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"Password123!"}'
```

The response includes `access_token`.

### Call a Protected API with JWT

```bash
curl http://localhost:3050/api/v1/applications \
  -H "Authorization: Bearer <access_token>"
```

### Call a Paginated API

```bash
curl "http://localhost:3050/api/v1/applications?paginated=true&limit=10&offset=0" \
  -H "Authorization: Bearer <access_token>"
```

The normal `GET /api/v1/applications` response is still a plain list. Add `paginated=true` when you want pagination metadata.

### Update Your Profile

```bash
curl -X PATCH http://localhost:3050/api/v1/users/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"full_name":"Updated Student"}'
```

### Change Your Password

```bash
curl -X POST http://localhost:3050/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"current_password":"Password123!","new_password":"NewPassword123!"}'
```

### Python Login Example

```python
import requests

base_url = "http://localhost:3050"

login_response = requests.post(
    f"{base_url}/api/v1/auth/login",
    json={"email": "student@example.com", "password": "Password123!"},
)
login_response.raise_for_status()

token = login_response.json()["access_token"]

applications_response = requests.get(
    f"{base_url}/api/v1/applications",
    headers={"Authorization": f"Bearer {token}"},
)
applications_response.raise_for_status()

print(applications_response.json())
```

## API Key Management

You can create API keys from the app:

1. Log in.
2. Open Settings.
3. Create an API key.
4. Copy the key immediately.

The full key is only shown once.

You do not need to be an admin to create an API key. Any logged-in normal user can create API keys for their own account.

API keys belong to the user who created them:

- A user's API key can access that user's job application APIs.
- A user's API key cannot access another user's applications.
- API keys cannot create, list, update, or revoke API keys.
- API keys cannot access admin-only endpoints.

You can also create an API key with curl:

```bash
curl -X POST http://localhost:3050/api/v1/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"name":"Postman testing key"}'
```

Use the key like this:

```bash
curl http://localhost:3050/api/v1/applications \
  -H "X-API-Key: <api_key>"
```

## Public and Protected Endpoints

Public endpoints do not need login:

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Basic health check |
| GET | `/api/v1/health` | Versioned health check |
| GET | `/api/v1/public/status` | Public app status |
| GET | `/api/v1/public/demo-stats` | Public demo stats |
| GET | `/api/v1/public/rate-limit-demo` | Public endpoint with a low limit for practicing `429` tests |
| POST | `/api/v1/auth/register` | Create a user |
| POST | `/api/v1/auth/login` | Log in |

JWT-only endpoints:

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/users/me` | Current user profile |
| PATCH | `/api/v1/users/me` | Update current user's profile |
| POST | `/api/v1/auth/change-password` | Change current user's password |
| GET | `/api/v1/admin/status` | Admin-only check |
| POST | `/api/v1/api-keys` | Create API key |
| GET | `/api/v1/api-keys` | List API keys |
| PATCH | `/api/v1/api-keys/{id}` | Update API key |
| DELETE | `/api/v1/api-keys/{id}` | Revoke API key |

JWT or API key endpoints:

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/applications` | List applications |
| GET | `/api/v1/applications?paginated=true` | List applications with pagination metadata |
| GET | `/api/v1/applications/summary` | Application counts |
| GET | `/api/v1/applications/{id}` | Get one application |
| POST | `/api/v1/applications` | Create application |
| PATCH | `/api/v1/applications/{id}` | Update application |
| DELETE | `/api/v1/applications/{id}` | Delete application |

## Errors and Rate Limits

Errors use the same shape across the API:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  }
}
```

Common error codes:

| Code | Meaning |
|---|---|
| `AUTHENTICATION_REQUIRED` | You did not send a token or API key |
| `INVALID_CREDENTIALS` | Login, token, or API key is wrong |
| `TOKEN_EXPIRED` | Token or API key expired |
| `FORBIDDEN` | You are logged in, but not allowed |
| `NOT_FOUND` | The item does not exist or does not belong to you |
| `VALIDATION_ERROR` | The request body or query value is invalid |
| `DUPLICATE_RESOURCE` | The item already exists |
| `RATE_LIMITED` | Too many requests |

The rate limit demo endpoint is intentionally strict. It allows only 2 requests per minute from the same client so students can practice testing `429 Too Many Requests` and rate-limit headers:

```bash
curl -i http://localhost:3050/api/v1/public/rate-limit-demo
```

Rate limit responses can include:

```text
X-RateLimit-Limit
X-RateLimit-Remaining
X-RateLimit-Reset
Retry-After
```

---

# 5. Project Structure

```text
job-tracker-app-for-testing/
├── backend/          # FastAPI, SQLite, auth, API routes
└── frontend/         # Next.js frontend for development mode
```

Useful docs:

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Frontend Design System](frontend/DESIGN_SYSTEM.md)
