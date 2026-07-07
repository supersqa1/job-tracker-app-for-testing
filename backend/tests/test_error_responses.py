from fastapi.testclient import TestClient

from app.main import app
from tests.helpers import assert_error


def test_validation_error_uses_standard_error_shape():
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "not-an-email",
                "password": "short",
                "full_name": "",
            },
        )

    assert response.status_code == 422
    assert_error(
        response,
        code="VALIDATION_ERROR",
        message="Request validation failed",
    )
    assert response.json()["error"]["details"]


def test_unknown_route_uses_standard_error_shape():
    with TestClient(app) as client:
        response = client.get("/api/v1/does-not-exist")

    assert response.status_code == 404
    assert_error(response, code="NOT_FOUND", message="Not Found")
