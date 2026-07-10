from fastapi.testclient import TestClient

from app.main import app


def test_root_serves_packaged_frontend_when_available():
    with TestClient(app) as client:
        response = client.get("/")

    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "SuperSQA Job Tracker" in response.text


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


def test_packaged_frontend_routes_are_served_by_backend():
    with TestClient(app) as client:
        response = client.get("/jobs/detail?id=1")

    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "SuperSQA Job Tracker" in response.text


def test_openapi_documents_jwt_and_api_key_authentication():
    schema = app.openapi()
    security_schemes = schema["components"]["securitySchemes"]

    assert security_schemes["BearerAuth"] == {
        "type": "http",
        "description": "JWT access token from /api/v1/auth/login.",
        "scheme": "bearer",
    }
    assert security_schemes["ApiKeyAuth"] == {
        "type": "apiKey",
        "description": "API key created from /api/v1/api-keys.",
        "in": "header",
        "name": "X-API-Key",
    }

    list_applications = schema["paths"]["/api/v1/applications"]["get"]
    assert {"BearerAuth": []} in list_applications["security"]
    assert {"ApiKeyAuth": []} in list_applications["security"]
    assert "X-API-Key" not in {
        parameter["name"] for parameter in list_applications.get("parameters", [])
    }
