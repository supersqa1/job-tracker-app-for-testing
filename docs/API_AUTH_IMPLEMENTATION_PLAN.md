# API Auth Implementation Plan

This plan defines the authentication, authorization, API key, rate limiting, and
course-fixture work needed before the app is frozen for long-term course use.

## Phase Checklist

- [x] [Phase 1: API Contract and Versioning](#phase-1-api-contract-and-versioning)
- [x] [Phase 2: User Model and Seeded Accounts](#phase-2-user-model-and-seeded-accounts)
- [x] [Phase 3: JWT Authentication](#phase-3-jwt-authentication)
- [x] [Phase 4: Authorization and Roles](#phase-4-authorization-and-roles)
- [x] [Phase 5: Protect Existing Application APIs](#phase-5-protect-existing-application-apis)
- [x] [Phase 6: API Key Management](#phase-6-api-key-management)
- [x] [Phase 7: API Key Authentication](#phase-7-api-key-authentication)
- [x] [Phase 8: Public Demo APIs](#phase-8-public-demo-apis)
- [x] [Phase 9: Rate Limiting](#phase-9-rate-limiting)
- [x] [Phase 10: Error Response Standardization](#phase-10-error-response-standardization)
- [x] [Phase 11: Frontend Auth Support](#phase-11-frontend-auth-support)
- [x] [Phase 12: Test Coverage](#phase-12-test-coverage)
- [ ] [Phase 13: Documentation and Course Examples](#phase-13-documentation-and-course-examples)
- [ ] [Phase 14: Course Mode Packaging](#phase-14-course-mode-packaging)
- [ ] [Phase 15: Freeze Readiness](#phase-15-freeze-readiness)

## Phase 1: API Contract and Versioning

Goal: establish a stable API shape before adding auth behavior.

Tasks:

- Decide whether all course APIs should live under `/api/v1`.
- If versioning is adopted, move current routes from `/api/...` to `/api/v1/...`.
- Keep `/api/health` or redirect/duplicate it if useful for beginner friendliness.
- Confirm route naming conventions before implementation.
- Confirm OpenAPI tags:
  - `health`
  - `auth`
  - `users`
  - `applications`
  - `api-keys`
  - `public`
  - `admin`

Proposed decision:

- Use `/api/v1` for all stable course APIs.
- Keep `GET /api/health` as a simple public convenience endpoint.

## Phase 2: User Model and Seeded Accounts

Goal: add stable users that support login, ownership, and role-based lessons.

Database model:

- `users`
  - `id`
  - `email`
  - `hashed_password`
  - `full_name`
  - `role`
  - `is_active`
  - `created_at`
  - `updated_at`

Roles:

- `user`: normal job tracker user.
- `admin`: admin/demo user for authorization lessons.

Seeded course accounts:

- Normal user:
  - email: `student@example.com`
  - password: `Password123!`
  - role: `user`
- Admin user:
  - email: `admin@example.com`
  - password: `AdminPassword123!`
  - role: `admin`

Tasks:

- Add user SQLAlchemy model.
- Add user Pydantic schemas.
- Add password hashing utilities.
- Update seed logic to create stable users.
- Decide whether job applications are global or owned by users.

Proposed decision:

- Add `user_id` ownership to job applications.
- Seed demo applications for `student@example.com`.
- Admin endpoints can view aggregate/demo information, but normal users only see their own applications.

## Phase 3: JWT Authentication

Goal: support standard bearer-token login for browser, Swagger, Postman, Python,
and pytest usage.

Endpoints:

- `POST /api/v1/auth/register`
  - Public.
  - Creates a normal `user` account.
  - Does not allow client-selected `admin` role.
- `POST /api/v1/auth/login`
  - Public.
  - Accepts email and password.
  - Returns JWT access token.
- `POST /api/v1/auth/logout`
  - Optional for frontend convenience.
  - JWT logout is usually client-side token deletion unless token revocation is implemented.

Token response:

```json
{
  "access_token": "jwt-token-value",
  "token_type": "bearer",
  "expires_in": 28800
}
```

JWT claims:

- `sub`: user id
- `email`: user email
- `role`: user role
- `iat`: issued-at timestamp
- `exp`: expiration timestamp

Configuration:

- `JWT_SECRET_KEY`
- `JWT_ALGORITHM`, default `HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES`, proposed default `480` for 8 hours

Tasks:

- Add JWT creation utility.
- Add JWT verification utility.
- Add login endpoint.
- Add registration endpoint.
- Make Swagger support bearer auth through FastAPI security dependencies.
- Add clear `401 Unauthorized` responses for missing, invalid, or expired tokens.

## Phase 4: Authorization and Roles

Goal: centralize permission checks and create future-friendly auth lessons.

Shared dependencies:

- `get_current_user`
  - Accepts authenticated requests.
  - Later supports JWT or API key.
  - Returns active user.
- `get_current_user_from_jwt`
  - JWT-only dependency.
  - Used for endpoints that should not accept API keys.
- `require_role("admin")`
  - Requires authenticated active user with admin role.

Rules:

- Missing/invalid credentials return `401 Unauthorized`.
- Valid credentials without required role return `403 Forbidden`.
- Inactive users return `403 Forbidden`.

Tasks:

- Add auth dependency module.
- Add role enum.
- Add tests for `401` vs `403`.

## Phase 5: Protect Existing Application APIs

Goal: make the current job application APIs realistic protected resources.

Protected by JWT or API key:

- `GET /api/v1/applications`
- `GET /api/v1/applications/{application_id}`
- `POST /api/v1/applications`
- `PATCH /api/v1/applications/{application_id}`
- `DELETE /api/v1/applications/{application_id}`
- `GET /api/v1/applications/summary`

Ownership behavior:

- Normal users can only access their own applications.
- Created applications are assigned to the authenticated user.
- Accessing another user's application returns `404 Not Found` to avoid leaking existence.

Tasks:

- Add `user_id` to `job_applications`.
- Update list/detail/update/delete queries to filter by authenticated user.
- Update seed data to assign applications to the seeded student user.
- Update schemas if needed.

## Phase 6: API Key Management

Goal: let logged-in users create and manage API keys for automation/integration use.

API keys are managed with JWT only.

JWT-only endpoints:

- `POST /api/v1/api-keys`
  - Creates a new API key for the current user.
  - Shows the raw key once.
- `GET /api/v1/api-keys`
  - Lists key metadata, not raw key values.
- `DELETE /api/v1/api-keys/{api_key_id}`
  - Revokes/deletes an API key owned by the current user.

Optional endpoint:

- `PATCH /api/v1/api-keys/{api_key_id}`
  - Rename key or deactivate key without deleting it.

Database model:

- `api_keys`
  - `id`
  - `user_id`
  - `name`
  - `key_prefix`
  - `hashed_key`
  - `is_active`
  - `last_used_at`
  - `expires_at`
  - `created_at`
  - `updated_at`

Key format:

- Prefix example: `jt_live_`
- Full example: `jt_live_random-secret-value`

Security rules:

- Store only a hash of the key.
- Show raw key only at creation time.
- API keys cannot create, list, update, or delete API keys.
- API keys inherit the owning user's role unless scoped permissions are added.

Proposed decision:

- Implement named, revocable API keys.
- Do not implement scopes unless a future lesson explicitly needs them.
- Support optional expiration date, but allow no expiration for course simplicity.

## Phase 7: API Key Authentication

Goal: allow automation clients to call protected APIs with API keys.

Supported header:

```http
X-API-Key: jt_live_example
```

Central auth behavior:

- `get_current_user` accepts either:
  - `Authorization: Bearer <jwt>`
  - `X-API-Key: <api-key>`
- If both are provided, JWT takes priority.
- Invalid API key returns `401 Unauthorized`.
- Revoked/inactive API key returns `401 Unauthorized`.
- Expired API key returns `401 Unauthorized`.
- Valid API key updates `last_used_at`.

Endpoints accepting JWT or API key:

- Main application CRUD endpoints.
- User-neutral integration/demo endpoints if added.

Endpoints requiring JWT only:

- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `POST /api/v1/auth/change-password`
- `POST /api/v1/api-keys`
- `GET /api/v1/api-keys`
- `PATCH /api/v1/api-keys/{api_key_id}`
- `DELETE /api/v1/api-keys/{api_key_id}`

Reason:

- API keys are for using the API, not for managing account security settings.

## Phase 8: Public Demo APIs

Goal: provide unauthenticated endpoints for beginner lessons and public API examples.

Public endpoints:

- `GET /api/health`
- `GET /api/v1/health`
- `GET /api/v1/public/status`
- `GET /api/v1/public/demo-stats`

Candidate response examples:

- `/public/status`
  - app name
  - API version
  - environment label
  - current server time
- `/public/demo-stats`
  - total seeded applications
  - visible demo status counts
  - no private user data

Tasks:

- Add public router.
- Ensure public endpoints do not require JWT or API key.
- Add tests proving public endpoints work without credentials.

## Phase 9: Rate Limiting

Goal: include stable rate-limit behavior for future testing, monitoring, and
negative API lessons.

Design:

- Apply rate limits to selected endpoints.
- Keep defaults high enough not to annoy normal students.
- Add one intentionally low-limit demo endpoint for testing `429 Too Many Requests`.

Candidate endpoints:

- Normal rate-limited:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/register`
  - `POST /api/v1/applications`
- Teaching/demo endpoint:
  - `GET /api/v1/public/rate-limit-demo`

Rate-limit headers:

```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1793370000
Retry-After: 60
```

Configuration:

- `RATE_LIMIT_ENABLED`
- `RATE_LIMIT_LOGIN_PER_MINUTE`
- `RATE_LIMIT_REGISTER_PER_MINUTE`
- `RATE_LIMIT_DEFAULT_PER_MINUTE`
- `RATE_LIMIT_DEMO_PER_MINUTE`

Storage:

- In-memory is acceptable for local course fixture mode.
- Document that production systems normally use Redis or another shared store.

Tasks:

- Add rate limiting middleware or dependency.
- Add deterministic tests for the demo endpoint.
- Document how students can trigger and test a `429`.

## Phase 10: Error Response Standardization

Goal: make errors consistent for reliable lessons and assertions.

Standard error shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  }
}
```

Common codes:

- `VALIDATION_ERROR`
- `AUTHENTICATION_REQUIRED`
- `INVALID_CREDENTIALS`
- `TOKEN_EXPIRED`
- `FORBIDDEN`
- `NOT_FOUND`
- `RATE_LIMITED`
- `DUPLICATE_RESOURCE`

Tasks:

- Add exception handlers where appropriate.
- Keep FastAPI validation details useful but stable.
- Add tests for major error types.

## Phase 11: Frontend Auth Support

Goal: make the UI work with the protected API.

Status: complete.

Pages/features:

- Login screen.
- Register screen if registration remains enabled in the UI.
- Logout action.
- Basic current-user display.
- Store JWT client-side for local course use.
- Send `Authorization: Bearer <token>` on API requests.
- Redirect unauthenticated users to login.
- Show friendly backend/auth errors.

API key UI:

- Add a simple API Keys settings page.
- Let users create a named API key.
- Show raw key once after creation.
- List key metadata.
- Revoke/delete keys.

Note:

- The API key UI is useful because proper API keys should be generated by the app,
  not invented manually by students.

Implemented:

- Dashboard and job detail pages now require local JWT auth.
- Login/register UI supports the seeded student account and new local users.
- Top navigation displays the current user and supports logout.
- API client attaches stored JWT bearer tokens to protected requests.
- Settings page creates, lists, and revokes API keys.
- Newly created API keys show the raw key once for students to copy.

## Phase 12: Test Coverage

Goal: stabilize behavior before freezing.

Status: complete.

Backend tests:

- Register success.
- Register duplicate email.
- Login success.
- Login invalid password.
- Change password success.
- Change password invalid current password.
- Missing JWT on protected endpoint.
- Invalid JWT.
- Expired JWT.
- Update current user profile.
- Normal user can access own applications.
- Normal user cannot access another user's applications.
- Application list supports opt-in pagination.
- Admin-only endpoint allows admin.
- Admin-only endpoint blocks normal user with `403`.
- Create API key with JWT.
- List API keys with JWT.
- Revoke API key with JWT.
- API key can access application endpoint.
- Revoked API key is rejected.
- API key cannot manage API keys.
- Public endpoints work without auth.
- Rate limit demo returns `429`.

Frontend tests:

- Login form behavior.
- Authenticated API client sends bearer token.
- Logout clears token.
- Profile update form behavior.
- Password change form behavior.
- API key page shows created key once.
- Protected page handles unauthenticated state.

Implemented:

- Backend developer tests cover auth, roles, application ownership, API keys,
  profile updates, password changes, pagination, public endpoints, rate limits,
  error responses, schemas, seed data, and helpers.
- Frontend developer tests cover auth token storage, API client bearer headers,
  login/register behavior, protected dashboard unauthenticated state, logout,
  profile update, password change, paginated API helper behavior, API key creation
  one-time raw key display, and API key revocation.
- No UAT, external HTTP, Postman, Selenium, or Playwright course-style tests were added.

## Phase 13: Documentation and Course Examples

Goal: make auth behavior beginner-friendly and stable.

Docs to add/update:

- README beginner quick start.
- Auth guide.
- API key guide.
- Postman guide.
- Swagger guide.
- Python requests guide.
- pytest fixture guide.
- Public vs protected endpoint list.
- Seeded accounts and demo data.
- Common error responses.
- Rate limiting examples.

Examples to include:

- Login and copy JWT from Swagger.
- Login and use bearer token in Postman.
- Python script that logs in and calls protected endpoint.
- pytest fixture that logs in once per test session.
- API key creation and usage with `X-API-Key`.
- Negative tests for missing token, invalid token, invalid role, and rate limits.

## Phase 14: Course Mode Packaging

Goal: make the final frozen app easy for beginners to run.

Course mode:

- One backend command starts API and serves the prebuilt frontend.
- Requires Python only.
- Does not require Node.js.
- Students open one URL for the app and Swagger docs.

Tasks:

- Make frontend static-build friendly.
- Build frontend after final UI behavior is complete.
- Serve static frontend from FastAPI.
- Add root route fallback for frontend pages.
- Keep `/docs` available for Swagger.
- Add cross-platform start scripts.
- Verify from a clean checkout.

Developer mode:

- Keep separate FastAPI and Next.js instructions.
- Use this mode only when modifying the app.

## Phase 15: Freeze Readiness

Goal: verify the fixture is ready for long-term course use.

Checklist:

- Final route list documented.
- Public/protected/JWT-only/API-key-supported endpoints documented.
- Seeded accounts documented.
- Demo data documented.
- Auth flows documented.
- API key lifecycle documented.
- Rate limiting documented.
- Error response shape documented.
- Backend tests passing.
- Frontend tests passing.
- Course mode works from a clean checkout.
- Developer mode works from a clean checkout.
- README puts course mode first.
- Main branch is treated as frozen after release.

Post-freeze rule:

- Do not change existing endpoint behavior, response shapes, seeded accounts, or
  documented course flows on the frozen main fixture.
- Future experiments should happen on separate branches or separate versions.
