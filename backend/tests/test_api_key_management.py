from datetime import UTC, datetime, timedelta
from uuid import uuid4

from fastapi.testclient import TestClient

from app.database import SessionLocal
from app.main import app
from app.models.api_key import ApiKey
from app.seed import STUDENT_EMAIL, STUDENT_PASSWORD
from app.services.security import verify_secret
from tests.helpers import assert_error, auth_header, login_token


def register_and_login(client: TestClient) -> tuple[str, str]:
    email = f"api.key.user.{uuid4().hex}@example.com"
    password = "Password123!"
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": "API Key Test User",
        },
    )
    assert response.status_code == 201
    return email, login_token(client, email, password)


def create_key(client: TestClient, token: str, name: str = "Pytest key", **payload) -> dict:
    response = client.post(
        "/api/v1/api-keys",
        headers=auth_header(token),
        json={"name": name, **payload},
    )
    assert response.status_code == 201
    return response.json()


def test_create_api_key_requires_jwt():
    with TestClient(app) as client:
        response = client.post("/api/v1/api-keys", json={"name": "No auth"})

    assert response.status_code == 401
    assert_error(response, code="AUTHENTICATION_REQUIRED", message="Authentication required")


def test_create_api_key_shows_raw_key_once_and_stores_hash():
    with TestClient(app) as client:
        _, token = register_and_login(client)
        body = create_key(client, token)

    assert body["name"] == "Pytest key"
    assert body["api_key"].startswith("jt_live_")
    assert body["key_prefix"] == body["api_key"][:20]
    assert body["is_active"] is True
    assert body["last_used_at"] is None
    assert "hashed_key" not in body

    with SessionLocal() as db:
        stored_key = db.get(ApiKey, body["id"])

    assert stored_key is not None
    assert stored_key.hashed_key != body["api_key"]
    assert verify_secret(body["api_key"], stored_key.hashed_key)


def test_create_api_key_accepts_optional_expiration():
    expires_at = (datetime.now(UTC) + timedelta(days=30)).isoformat()
    with TestClient(app) as client:
        _, token = register_and_login(client)
        body = create_key(client, token, expires_at=expires_at)

    assert body["expires_at"] is not None


def test_list_api_keys_returns_metadata_without_raw_or_hashed_key():
    with TestClient(app) as client:
        _, token = register_and_login(client)
        created = create_key(client, token, name="List key")

        response = client.get("/api/v1/api-keys", headers=auth_header(token))

    assert response.status_code == 200
    keys = response.json()
    assert len(keys) == 1
    assert keys[0]["id"] == created["id"]
    assert keys[0]["name"] == "List key"
    assert keys[0]["key_prefix"] == created["key_prefix"]
    assert "api_key" not in keys[0]
    assert "hashed_key" not in keys[0]


def test_users_only_list_their_own_api_keys():
    with TestClient(app) as client:
        _, first_token = register_and_login(client)
        _, second_token = register_and_login(client)
        create_key(client, first_token, name="First user key")

        response = client.get("/api/v1/api-keys", headers=auth_header(second_token))

    assert response.status_code == 200
    assert response.json() == []


def test_update_api_key_changes_metadata_for_owner():
    expires_at = (datetime.now(UTC) + timedelta(days=7)).isoformat()
    with TestClient(app) as client:
        _, token = register_and_login(client)
        created = create_key(client, token)

        response = client.patch(
            f"/api/v1/api-keys/{created['id']}",
            headers=auth_header(token),
            json={"name": "Renamed key", "is_active": False, "expires_at": expires_at},
        )

    assert response.status_code == 200
    assert response.json()["name"] == "Renamed key"
    assert response.json()["is_active"] is False
    assert response.json()["expires_at"] is not None


def test_update_api_key_returns_not_found_for_another_user():
    with TestClient(app) as client:
        _, first_token = register_and_login(client)
        _, second_token = register_and_login(client)
        created = create_key(client, first_token)

        response = client.patch(
            f"/api/v1/api-keys/{created['id']}",
            headers=auth_header(second_token),
            json={"name": "Should not work"},
        )

    assert response.status_code == 404
    assert_error(response, code="NOT_FOUND", message="API key not found")


def test_delete_api_key_revokes_key_for_owner():
    with TestClient(app) as client:
        _, token = register_and_login(client)
        created = create_key(client, token)

        response = client.delete(
            f"/api/v1/api-keys/{created['id']}",
            headers=auth_header(token),
        )

        list_response = client.get("/api/v1/api-keys", headers=auth_header(token))

    assert response.status_code == 204
    assert list_response.status_code == 200
    assert list_response.json()[0]["id"] == created["id"]
    assert list_response.json()[0]["is_active"] is False


def test_delete_api_key_returns_not_found_for_another_user():
    with TestClient(app) as client:
        student_token = login_token(client, STUDENT_EMAIL, STUDENT_PASSWORD)
        _, other_token = register_and_login(client)
        created = create_key(client, student_token)

        response = client.delete(
            f"/api/v1/api-keys/{created['id']}",
            headers=auth_header(other_token),
        )

    assert response.status_code == 404
    assert_error(response, code="NOT_FOUND", message="API key not found")
