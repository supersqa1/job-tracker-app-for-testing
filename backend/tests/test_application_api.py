from uuid import uuid4

from fastapi.testclient import TestClient

from app.database import SessionLocal
from app.main import app
from app.models.application import ApplicationAuditLog, JobApplication
from app.seed import STUDENT_EMAIL, STUDENT_PASSWORD
from app.services.users import get_user_by_email
from tests.helpers import assert_error, auth_header, login_token


def register_and_login(client: TestClient) -> tuple[str, str]:
    email = f"application.user.{uuid4().hex}@example.com"
    password = "Password123!"
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": "Application Test User",
        },
    )
    assert response.status_code == 201
    return email, login_token(client, email, password)


def test_application_list_requires_authentication():
    with TestClient(app) as client:
        response = client.get("/api/v1/applications")

    assert response.status_code == 401
    assert_error(response, code="AUTHENTICATION_REQUIRED", message="Authentication required")


def test_seeded_student_can_list_their_demo_applications():
    with TestClient(app) as client:
        token = login_token(client, STUDENT_EMAIL, STUDENT_PASSWORD)
        response = client.get("/api/v1/applications", headers=auth_header(token))

    assert response.status_code == 200
    company_names = {application["company_name"] for application in response.json()}
    assert {
        "Stark Industries",
        "Massive Dynamic",
        "Weyland-Yutani",
        "Cyberdyne Systems",
    }.issubset(company_names)


def test_application_list_returns_plain_list_by_default_for_backwards_compatibility():
    with TestClient(app) as client:
        token = login_token(client, STUDENT_EMAIL, STUDENT_PASSWORD)
        response = client.get("/api/v1/applications", headers=auth_header(token))

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_application_list_supports_paginated_response():
    with TestClient(app) as client:
        token = login_token(client, STUDENT_EMAIL, STUDENT_PASSWORD)
        response = client.get(
            "/api/v1/applications",
            headers=auth_header(token),
            params={"paginated": "true", "limit": 2, "offset": 1},
        )

    assert response.status_code == 200
    body = response.json()
    assert set(body) == {"items", "total", "limit", "offset"}
    assert len(body["items"]) == 2
    assert body["total"] >= 4
    assert body["limit"] == 2
    assert body["offset"] == 1


def test_new_user_does_not_see_seeded_student_applications():
    with TestClient(app) as client:
        _, token = register_and_login(client)
        response = client.get("/api/v1/applications", headers=auth_header(token))

    assert response.status_code == 200
    assert response.json() == []


def test_created_application_is_assigned_to_current_user():
    with TestClient(app) as client:
        email, token = register_and_login(client)
        response = client.post(
            "/api/v1/applications",
            headers=auth_header(token),
            json={
                "company_name": "Phase Five Labs",
                "role_title": "API Tester",
            },
        )

    assert response.status_code == 201
    application_id = response.json()["id"]

    with SessionLocal() as db:
        user = get_user_by_email(db, email)
        application = db.get(JobApplication, application_id)

    assert user is not None
    assert application is not None
    assert application.user_id == user.id


def test_user_gets_not_found_for_another_users_application():
    with TestClient(app) as client:
        student_token = login_token(client, STUDENT_EMAIL, STUDENT_PASSWORD)
        student_apps = client.get(
            "/api/v1/applications",
            headers=auth_header(student_token),
        ).json()
        other_user_email, other_user_token = register_and_login(client)

        response = client.get(
            f"/api/v1/applications/{student_apps[0]['id']}",
            headers=auth_header(other_user_token),
        )

    assert other_user_email
    assert response.status_code == 404
    assert_error(response, code="NOT_FOUND", message="Application not found")


def test_summary_counts_only_current_users_applications():
    with TestClient(app) as client:
        _, token = register_and_login(client)
        client.post(
            "/api/v1/applications",
            headers=auth_header(token),
            json={
                "company_name": "Summary Labs",
                "role_title": "QA Engineer",
                "status": "applied",
            },
        )
        response = client.get(
            "/api/v1/applications/summary",
            headers=auth_header(token),
        )

    assert response.status_code == 200
    assert response.json()["total"] == 1
    assert response.json()["applied"] == 1


def test_create_application_writes_internal_audit_log():
    with TestClient(app) as client:
        email, token = register_and_login(client)
        response = client.post(
            "/api/v1/applications",
            headers=auth_header(token),
            json={
                "company_name": "Audit Trail Labs",
                "role_title": "QA Automation Engineer",
                "status": "applied",
            },
        )

    assert response.status_code == 201
    application_id = response.json()["id"]

    with SessionLocal() as db:
        user = get_user_by_email(db, email)
        audit_log = (
            db.query(ApplicationAuditLog)
            .filter(ApplicationAuditLog.application_id == application_id)
            .one_or_none()
        )

    assert user is not None
    assert audit_log is not None
    assert audit_log.user_id == user.id
    assert audit_log.action == "created"
    assert audit_log.old_status is None
    assert audit_log.new_status == "applied"


def test_update_application_writes_internal_audit_log_with_status_change():
    with TestClient(app) as client:
        email, token = register_and_login(client)
        create_response = client.post(
            "/api/v1/applications",
            headers=auth_header(token),
            json={
                "company_name": "Audit Update Labs",
                "role_title": "QA Automation Engineer",
                "status": "applied",
            },
        )
        application_id = create_response.json()["id"]

        response = client.patch(
            f"/api/v1/applications/{application_id}",
            headers=auth_header(token),
            json={"status": "in_progress", "notes": "Recruiter screen scheduled."},
        )

    assert response.status_code == 200

    with SessionLocal() as db:
        user = get_user_by_email(db, email)
        audit_log = (
            db.query(ApplicationAuditLog)
            .filter(
                ApplicationAuditLog.application_id == application_id,
                ApplicationAuditLog.action == "updated",
            )
            .one_or_none()
        )

    assert user is not None
    assert audit_log is not None
    assert audit_log.user_id == user.id
    assert audit_log.old_status == "applied"
    assert audit_log.new_status == "in_progress"


def test_delete_application_writes_internal_audit_log():
    with TestClient(app) as client:
        email, token = register_and_login(client)
        create_response = client.post(
            "/api/v1/applications",
            headers=auth_header(token),
            json={
                "company_name": "Audit Delete Labs",
                "role_title": "QA Automation Engineer",
                "status": "in_progress",
            },
        )
        application_id = create_response.json()["id"]

        response = client.delete(
            f"/api/v1/applications/{application_id}",
            headers=auth_header(token),
        )

    assert response.status_code == 204

    with SessionLocal() as db:
        user = get_user_by_email(db, email)
        audit_log = (
            db.query(ApplicationAuditLog)
            .filter(
                ApplicationAuditLog.application_id == application_id,
                ApplicationAuditLog.action == "deleted",
            )
            .one_or_none()
        )

    assert user is not None
    assert audit_log is not None
    assert audit_log.user_id == user.id
    assert audit_log.old_status == "in_progress"
    assert audit_log.new_status is None
