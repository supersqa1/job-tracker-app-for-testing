from datetime import UTC, datetime, timedelta

import jwt
from fastapi.testclient import TestClient

from app.config import settings
from app.database import SessionLocal
from app.main import app
from app.seed import ADMIN_EMAIL, ADMIN_PASSWORD, STUDENT_EMAIL, STUDENT_PASSWORD
from app.services.users import get_user_by_email
from tests.helpers import assert_error, auth_header, login_token


def test_users_me_requires_authentication():
    with TestClient(app) as client:
        response = client.get("/api/v1/users/me")

    assert response.status_code == 401
    assert_error(response, code="AUTHENTICATION_REQUIRED", message="Authentication required")
    assert response.headers["www-authenticate"] == "Bearer"


def test_users_me_rejects_invalid_token():
    with TestClient(app) as client:
        response = client.get(
            "/api/v1/users/me",
            headers=auth_header("not-a-valid-token"),
        )

    assert response.status_code == 401
    assert_error(response, code="INVALID_CREDENTIALS", message="Invalid token")


def test_users_me_rejects_expired_token():
    expired_token = jwt.encode(
        {
            "sub": "1",
            "email": STUDENT_EMAIL,
            "role": "user",
            "iat": int((datetime.now(UTC) - timedelta(hours=2)).timestamp()),
            "exp": int((datetime.now(UTC) - timedelta(hours=1)).timestamp()),
        },
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )

    with TestClient(app) as client:
        response = client.get("/api/v1/users/me", headers=auth_header(expired_token))

    assert response.status_code == 401
    assert_error(response, code="TOKEN_EXPIRED", message="Token has expired")


def test_users_me_returns_current_user_for_valid_jwt():
    with TestClient(app) as client:
        token = login_token(client, STUDENT_EMAIL, STUDENT_PASSWORD)
        response = client.get("/api/v1/users/me", headers=auth_header(token))

    assert response.status_code == 200
    assert response.json()["email"] == STUDENT_EMAIL
    assert response.json()["role"] == "user"


def test_users_me_patch_updates_current_user_profile():
    with TestClient(app) as client:
        token = login_token(client, STUDENT_EMAIL, STUDENT_PASSWORD)
        response = client.patch(
            "/api/v1/users/me",
            headers=auth_header(token),
            json={"full_name": "Updated Student"},
        )

    assert response.status_code == 200
    assert response.json()["full_name"] == "Updated Student"

    with SessionLocal() as db:
        student = get_user_by_email(db, STUDENT_EMAIL)
        assert student is not None
        student.full_name = "Student User"
        db.commit()


def test_users_me_patch_rejects_role_escalation_payload():
    with TestClient(app) as client:
        token = login_token(client, STUDENT_EMAIL, STUDENT_PASSWORD)
        response = client.patch(
            "/api/v1/users/me",
            headers=auth_header(token),
            json={"role": "admin", "full_name": "Still Normal User"},
        )

    assert response.status_code == 200
    assert response.json()["role"] == "user"

    with SessionLocal() as db:
        student = get_user_by_email(db, STUDENT_EMAIL)
        assert student is not None
        student.full_name = "Student User"
        db.commit()


def test_users_me_rejects_inactive_user_with_forbidden():
    with TestClient(app) as client:
        token = login_token(client, STUDENT_EMAIL, STUDENT_PASSWORD)

        with SessionLocal() as db:
            student = get_user_by_email(db, STUDENT_EMAIL)
            assert student is not None
            student.is_active = False
            db.commit()

        try:
            response = client.get("/api/v1/users/me", headers=auth_header(token))
        finally:
            with SessionLocal() as db:
                student = get_user_by_email(db, STUDENT_EMAIL)
                assert student is not None
                student.is_active = True
                db.commit()

    assert response.status_code == 403
    assert_error(response, code="FORBIDDEN", message="User account is inactive")


def test_admin_status_allows_admin_user():
    with TestClient(app) as client:
        token = login_token(client, ADMIN_EMAIL, ADMIN_PASSWORD)
        response = client.get("/api/v1/admin/status", headers=auth_header(token))

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "role": "admin",
        "email": ADMIN_EMAIL,
    }


def test_admin_status_rejects_normal_user_with_forbidden():
    with TestClient(app) as client:
        token = login_token(client, STUDENT_EMAIL, STUDENT_PASSWORD)
        response = client.get("/api/v1/admin/status", headers=auth_header(token))

    assert response.status_code == 403
    assert_error(response, code="FORBIDDEN", message="Insufficient permissions")
