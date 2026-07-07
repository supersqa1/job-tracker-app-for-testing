from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.models.application import ApplicationStatus, JobApplication, RemoteType
from app.models.user import UserRole
from app.services.users import create_user, get_user_by_email


STUDENT_EMAIL = "student@example.com"
STUDENT_PASSWORD = "Password123!"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "AdminPassword123!"
DEMO_COMPANY_NAMES = (
    "Stark Industries",
    "Massive Dynamic",
    "Weyland-Yutani",
    "Cyberdyne Systems",
)


def seed_demo_users(db: Session) -> None:
    if get_user_by_email(db, STUDENT_EMAIL) is None:
        create_user(
            db,
            email=STUDENT_EMAIL,
            password=STUDENT_PASSWORD,
            full_name="SupersQA Student",
            role=UserRole.USER,
        )

    if get_user_by_email(db, ADMIN_EMAIL) is None:
        create_user(
            db,
            email=ADMIN_EMAIL,
            password=ADMIN_PASSWORD,
            full_name="SupersQA Admin",
            role=UserRole.ADMIN,
        )


def seed_demo_applications(db: Session) -> None:
    if db.query(JobApplication).count() > 0:
        return

    student = get_user_by_email(db, STUDENT_EMAIL)
    if student is None:
        raise RuntimeError("Seeded student user must exist before seeding applications")

    now = datetime.now(UTC)
    demo_rows = [
        JobApplication(
            user_id=student.id,
            company_name=DEMO_COMPANY_NAMES[0],
            role_title="Systems Architect",
            status=ApplicationStatus.POTENTIAL,
            remote_type=RemoteType.REMOTE,
            salary_range="$180k",
            location="New York, NY",
            next_action_at=now - timedelta(days=2),
        ),
        JobApplication(
            user_id=student.id,
            company_name=DEMO_COMPANY_NAMES[1],
            role_title="Senior Data Eng",
            status=ApplicationStatus.POTENTIAL,
            next_action_at=now - timedelta(days=5),
        ),
        JobApplication(
            user_id=student.id,
            company_name=DEMO_COMPANY_NAMES[2],
            role_title="Core Dev",
            status=ApplicationStatus.APPLIED,
            applied_at=now - timedelta(days=12),
        ),
        JobApplication(
            user_id=student.id,
            company_name=DEMO_COMPANY_NAMES[3],
            role_title="AI Lead",
            status=ApplicationStatus.IN_PROGRESS,
            next_action="Tech Screen",
            next_action_at=now + timedelta(days=1),
        ),
    ]

    db.add_all(demo_rows)
    db.commit()
