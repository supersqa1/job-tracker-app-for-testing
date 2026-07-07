from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient

from app.database import SessionLocal
from app.main import app
from app.models.api_key import ApiKey
from app.seed import STUDENT_EMAIL, STUDENT_PASSWORD
from tests.helpers import assert_error, auth_header, login_token


def api_key_header(api_key: str) -> dict[str, str]:
    return {"X-API-Key": api_key}


def create_raw_api_key(client: TestClient, jwt_token: str, **payload) -> dict:
    request_payload = {"name": "Automation key", **payload}
    response = client.post(
        "/api/v1/api-keys",
        headers=auth_header(jwt_token),
        json=request_payload,
    )
    assert response.status_code == 201
    return response.json()


def test_api_key_can_access_application_list_and_updates_last_used_at():
    with TestClient(app) as client:
        jwt_token = login_token(client, STUDENT_EMAIL, STUDENT_PASSWORD)
        created_key = create_raw_api_key(client, jwt_token)

        response = client.get(
            "/api/v1/applications",
            headers=api_key_header(created_key["api_key"]),
        )

    assert response.status_code == 200
    assert response.json()

    with SessionLocal() as db:
        stored_key = db.get(ApiKey, created_key["id"])

    assert stored_key is not None
    assert stored_key.last_used_at is not None


def test_api_key_can_create_application_for_owning_user():
    with TestClient(app) as client:
        jwt_token = login_token(client, STUDENT_EMAIL, STUDENT_PASSWORD)
        created_key = create_raw_api_key(client, jwt_token)

        response = client.post(
            "/api/v1/applications",
            headers=api_key_header(created_key["api_key"]),
            json={"company_name": "API Key Co", "role_title": "Automation Engineer"},
        )

    assert response.status_code == 201
    assert response.json()["company_name"] == "API Key Co"


def test_invalid_api_key_is_rejected():
    with TestClient(app) as client:
        response = client.get(
            "/api/v1/applications",
            headers=api_key_header("jt_live_invalid"),
    )

    assert response.status_code == 401
    assert_error(response, code="INVALID_CREDENTIALS", message="Invalid API key")


def test_revoked_api_key_is_rejected():
    with TestClient(app) as client:
        jwt_token = login_token(client, STUDENT_EMAIL, STUDENT_PASSWORD)
        created_key = create_raw_api_key(client, jwt_token)
        delete_response = client.delete(
            f"/api/v1/api-keys/{created_key['id']}",
            headers=auth_header(jwt_token),
        )
        assert delete_response.status_code == 204

        response = client.get(
            "/api/v1/applications",
            headers=api_key_header(created_key["api_key"]),
        )

    assert response.status_code == 401
    assert_error(response, code="INVALID_CREDENTIALS", message="Invalid API key")


def test_expired_api_key_is_rejected():
    with TestClient(app) as client:
        jwt_token = login_token(client, STUDENT_EMAIL, STUDENT_PASSWORD)
        created_key = create_raw_api_key(client, jwt_token)

        with SessionLocal() as db:
            stored_key = db.get(ApiKey, created_key["id"])
            assert stored_key is not None
            stored_key.expires_at = datetime.now(UTC) - timedelta(minutes=1)
            db.commit()

        response = client.get(
            "/api/v1/applications",
            headers=api_key_header(created_key["api_key"]),
        )

    assert response.status_code == 401
    assert_error(response, code="TOKEN_EXPIRED", message="API key has expired")


def test_jwt_takes_priority_when_jwt_and_api_key_are_both_present():
    with TestClient(app) as client:
        jwt_token = login_token(client, STUDENT_EMAIL, STUDENT_PASSWORD)
        response = client.get(
            "/api/v1/applications",
            headers={
                **auth_header(jwt_token),
                **api_key_header("jt_live_invalid"),
            },
        )

    assert response.status_code == 200


def test_api_key_cannot_access_jwt_only_users_me():
    with TestClient(app) as client:
        jwt_token = login_token(client, STUDENT_EMAIL, STUDENT_PASSWORD)
        created_key = create_raw_api_key(client, jwt_token)

        response = client.get(
            "/api/v1/users/me",
            headers=api_key_header(created_key["api_key"]),
        )

    assert response.status_code == 401
    assert_error(response, code="AUTHENTICATION_REQUIRED", message="Authentication required")


def test_api_key_cannot_manage_api_keys():
    with TestClient(app) as client:
        jwt_token = login_token(client, STUDENT_EMAIL, STUDENT_PASSWORD)
        created_key = create_raw_api_key(client, jwt_token)

        response = client.get(
            "/api/v1/api-keys",
            headers=api_key_header(created_key["api_key"]),
        )

    assert response.status_code == 401
    assert_error(response, code="AUTHENTICATION_REQUIRED", message="Authentication required")


def test_api_key_cannot_create_another_api_key():
    with TestClient(app) as client:
        jwt_token = login_token(client, STUDENT_EMAIL, STUDENT_PASSWORD)
        created_key = create_raw_api_key(client, jwt_token)

        response = client.post(
            "/api/v1/api-keys",
            headers=api_key_header(created_key["api_key"]),
            json={"name": "Nested key"},
        )

    assert response.status_code == 401
    assert_error(response, code="AUTHENTICATION_REQUIRED", message="Authentication required")
