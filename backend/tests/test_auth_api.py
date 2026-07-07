import jwt
from uuid import uuid4
from fastapi.testclient import TestClient

from app.config import settings
from app.main import app
from app.seed import ADMIN_EMAIL, ADMIN_PASSWORD, STUDENT_EMAIL, STUDENT_PASSWORD
from tests.helpers import assert_error
from tests.helpers import auth_header, login_token


def test_seeded_student_can_login_and_receives_jwt():
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/login",
            json={"email": STUDENT_EMAIL, "password": STUDENT_PASSWORD},
        )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["expires_in"] == settings.access_token_expire_minutes * 60
    assert body["user"]["email"] == STUDENT_EMAIL
    assert body["user"]["role"] == "user"

    claims = jwt.decode(
        body["access_token"],
        settings.jwt_secret_key,
        algorithms=[settings.jwt_algorithm],
    )
    assert claims["email"] == STUDENT_EMAIL
    assert claims["role"] == "user"
    assert claims["sub"] == str(body["user"]["id"])


def test_seeded_admin_can_login_and_receives_admin_role():
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        )

    assert response.status_code == 200
    assert response.json()["user"]["role"] == "admin"


def test_login_rejects_invalid_password():
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/login",
            json={"email": STUDENT_EMAIL, "password": "wrong-password"},
    )

    assert response.status_code == 401
    assert_error(response, code="INVALID_CREDENTIALS", message="Invalid email or password")


def test_register_creates_normal_user():
    email = f"new.student.{uuid4().hex}@example.com"
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": email,
                "password": "Password123!",
                "full_name": "New Student",
            },
        )

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == email
    assert body["full_name"] == "New Student"
    assert body["role"] == "user"
    assert body["is_active"] is True
    assert "hashed_password" not in body


def test_register_rejects_duplicate_email():
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": STUDENT_EMAIL,
                "password": "Password123!",
                "full_name": "Duplicate Student",
            },
        )

    assert response.status_code == 409
    assert_error(
        response,
        code="DUPLICATE_RESOURCE",
        message="A user with this email already exists",
    )


def test_change_password_requires_jwt():
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/change-password",
            json={
                "current_password": "Password123!",
                "new_password": "NewPassword123!",
            },
        )

    assert response.status_code == 401
    assert_error(response, code="AUTHENTICATION_REQUIRED", message="Authentication required")


def test_change_password_rejects_wrong_current_password():
    email = f"password.user.{uuid4().hex}@example.com"
    old_password = "Password123!"
    with TestClient(app) as client:
        register_response = client.post(
            "/api/v1/auth/register",
            json={
                "email": email,
                "password": old_password,
                "full_name": "Password Test User",
            },
        )
        assert register_response.status_code == 201
        token = login_token(client, email, old_password)

        response = client.post(
            "/api/v1/auth/change-password",
            headers=auth_header(token),
            json={
                "current_password": "wrong-password",
                "new_password": "NewPassword123!",
            },
        )

    assert response.status_code == 401
    assert_error(response, code="INVALID_CREDENTIALS", message="Invalid current password")


def test_change_password_updates_login_credentials():
    email = f"password.user.{uuid4().hex}@example.com"
    old_password = "Password123!"
    new_password = "NewPassword123!"
    with TestClient(app) as client:
        register_response = client.post(
            "/api/v1/auth/register",
            json={
                "email": email,
                "password": old_password,
                "full_name": "Password Test User",
            },
        )
        assert register_response.status_code == 201
        token = login_token(client, email, old_password)

        response = client.post(
            "/api/v1/auth/change-password",
            headers=auth_header(token),
            json={
                "current_password": old_password,
                "new_password": new_password,
            },
        )
        old_login_response = client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": old_password},
        )
        new_login_response = client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": new_password},
        )

    assert response.status_code == 204
    assert old_login_response.status_code == 401
    assert new_login_response.status_code == 200
