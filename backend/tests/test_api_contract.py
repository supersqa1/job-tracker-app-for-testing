from fastapi.testclient import TestClient

from app.main import app


def test_root_advertises_versioned_api_base():
    with TestClient(app) as client:
        response = client.get("/")

    assert response.status_code == 200
    assert response.json()["api_base"] == "/api/v1"


def test_health_check_is_available_at_convenience_and_versioned_paths():
    with TestClient(app) as client:
        convenience_response = client.get("/api/health")
        versioned_response = client.get("/api/v1/health")

    assert convenience_response.status_code == 200
    assert convenience_response.json() == {"status": "ok"}
    assert versioned_response.status_code == 200
    assert versioned_response.json() == {"status": "ok"}


def test_applications_are_served_from_versioned_api_only():
    with TestClient(app) as client:
        versioned_response = client.get("/api/v1/applications")
        legacy_response = client.get("/api/applications")

    assert versioned_response.status_code == 401
    assert legacy_response.status_code == 404
