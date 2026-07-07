# Course Fixture Plan

This app is intended to become a stable, long-lived course fixture for API testing,
BDD testing, UI automation, CI/CD, monitoring, and related QA/development content.
After the fixture is frozen, the main behavior should not change in ways that make
recorded lessons or student exercises outdated.

## Goals

- Provide a realistic full-stack job tracker application.
- Keep beginner setup simple for students who only need to test the app.
- Preserve a separate developer mode for students who want to modify the app.
- Include enough API behavior to support many future lessons without redesigning the API.
- Keep test data, seeded accounts, and documented examples stable.

## Run Modes

### Course Mode

Students run one backend command and use the frozen app through FastAPI.

- Requires Python.
- Does not require Node.js.
- Serves the prebuilt frontend from the backend.
- Best for API testing, BDD testing, Postman, Swagger, pytest, and Selenium lessons.

### Developer Mode

Students run the backend and frontend separately.

- Requires Python and Node.js.
- Uses the normal FastAPI and Next.js development servers.
- Best for students modifying the app itself.

## Authentication Features

- JWT bearer authentication.
- JWT-only API key management.
- API key authentication for application APIs.
- Seeded course user with stable credentials.
- Seeded admin user with stable credentials.
- User registration and login endpoints.
- Protected user profile endpoint.
- Protected main application CRUD endpoints.
- Application data is owned by the authenticated user.
- A small number of public endpoints for unauthenticated testing examples.
- Clear examples for Swagger, Postman, Python requests, and pytest.

## Authorization Features

The fixture should support roles even if most lessons use a normal user account.

Planned roles:

- `user`: normal job tracker user.
- `admin`: can access administrative/demo endpoints.

Role support creates future teaching options for:

- `401 Unauthorized` vs `403 Forbidden`
- positive and negative authorization tests
- admin-only endpoints
- permission test matrices

## Public Endpoints

Candidate public endpoints:

- `GET /api/health`
- `GET /api/v1/health`
- `GET /api/v1/public/status`
- `GET /api/v1/public/demo-stats`
- `GET /api/v1/public/rate-limit-demo`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/public/status`
- `GET /api/v1/public/demo-stats`

## Protected Endpoints

Candidate protected endpoints:

- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `POST /api/v1/auth/change-password`
- `POST /api/v1/api-keys`
- `GET /api/v1/api-keys`
- `PATCH /api/v1/api-keys/{id}`
- `DELETE /api/v1/api-keys/{id}`
- `GET /api/v1/applications`
- `GET /api/v1/applications?paginated=true`
- `GET /api/v1/applications/{id}`
- `POST /api/v1/applications`
- `PATCH /api/v1/applications/{id}`
- `DELETE /api/v1/applications/{id}`

## Seeded Course Accounts

- `student@example.com` / `Password123!` with role `user`
- `admin@example.com` / `AdminPassword123!` with role `admin`

## Future-Friendly API Features

These features should be considered before freezing the fixture, even if not all
are used in the first course:

- Rate limiting with predictable limits and documented headers.
- Pagination, sorting, and filtering.
- Validation errors with consistent response shapes.
- Search endpoints.
- File upload endpoint for resume/profile artifacts.
- Idempotency-key example endpoint.
- Admin-only endpoint.
- Stable seeded data reset command.
- Health/readiness endpoints.
- API version prefix, such as `/api/v1`.
- OpenAPI documentation tags and examples.
- Error scenarios intentionally useful for testing lessons.

## Token Behavior

- Access token expiration should be controlled by configuration.
- Course defaults should be long enough to avoid annoying students during exercises.
- Tests should obtain tokens during setup rather than hardcoding generated JWTs.
- Expired-token behavior should still be testable.

## Freeze Checklist

- Final API routes documented.
- Seeded users documented.
- Stable demo data documented.
- Backend tests passing.
- Frontend tests passing.
- Course mode verified from a clean checkout.
- Developer mode verified from a clean checkout.
- README updated with beginner-first instructions.
- No behavior-changing work continues on the frozen main fixture.
