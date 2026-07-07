from fastapi.testclient import TestClient

from app.database import SessionLocal
from app.main import app
from app.models.application import JobApplication
from app.seed import DEMO_COMPANY_NAMES, STUDENT_EMAIL
from app.services.users import get_user_by_email


def test_demo_applications_are_assigned_to_seeded_student():
    with TestClient(app):
        pass

    with SessionLocal() as db:
        student = get_user_by_email(db, STUDENT_EMAIL)
        applications = (
            db.query(JobApplication)
            .filter(
                JobApplication.company_name.in_(DEMO_COMPANY_NAMES)
            )
            .all()
        )

    assert student is not None
    assert applications
    assert {application.user_id for application in applications} == {student.id}
