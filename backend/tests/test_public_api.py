from datetime import datetime

from fastapi.testclient import TestClient

from app.main import app
from app.seed import DEMO_COMPANY_NAMES


def test_public_status_does_not_require_authentication():
    with TestClient(app) as client:
        response = client.get("/api/v1/public/status")

    assert response.status_code == 200
    body = response.json()
    assert body["app_name"] == "SuperSQA Job Tracker"
    assert body["api_version"] == "v1"
    assert body["environment"] == "local"
    assert datetime.fromisoformat(body["server_time"])


def test_public_demo_stats_does_not_require_authentication():
    with TestClient(app) as client:
        response = client.get("/api/v1/public/demo-stats")

    assert response.status_code == 200
    body = response.json()
    assert body["total_seeded_applications"] == len(DEMO_COMPANY_NAMES)
    assert body["status_counts"]["total"] == len(DEMO_COMPANY_NAMES)
    assert body["status_counts"]["potential"] == 2
    assert body["status_counts"]["applied"] == 1
    assert body["status_counts"]["in_progress"] == 1


def test_public_demo_stats_does_not_expose_user_or_application_details():
    with TestClient(app) as client:
        response = client.get("/api/v1/public/demo-stats")

    assert response.status_code == 200
    body = response.json()
    assert "email" not in body
    assert "user_id" not in body
    assert "applications" not in body
    assert "company_name" not in body


def test_public_rate_limit_demo_does_not_require_authentication():
    with TestClient(app) as client:
        response = client.get("/api/v1/public/rate-limit-demo")

    assert response.status_code == 200
