from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies.rate_limit import RateLimitDemo
from app.models.application import JobApplication
from app.schemas.public import PublicDemoStats, PublicStatus
from app.seed import DEMO_COMPANY_NAMES
from app.services.applications import build_pipeline_summary

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/status", response_model=PublicStatus)
def get_public_status() -> PublicStatus:
    return PublicStatus(
        app_name=settings.app_name,
        api_version=settings.api_version,
        environment=settings.environment,
        server_time=datetime.now(UTC),
    )


@router.get("/demo-stats", response_model=PublicDemoStats)
def get_public_demo_stats(db: Session = Depends(get_db)) -> PublicDemoStats:
    demo_applications = (
        db.query(JobApplication)
        .filter(JobApplication.company_name.in_(DEMO_COMPANY_NAMES))
        .all()
    )
    return PublicDemoStats(
        total_seeded_applications=len(demo_applications),
        status_counts=build_pipeline_summary(
            application.status for application in demo_applications
        ),
    )


@router.get(
    "/rate-limit-demo",
    dependencies=[RateLimitDemo],
    summary="Public rate limit demo",
    description=(
        "Intentionally low-limit public endpoint for practicing 429 responses "
        "and rate-limit headers."
    ),
)
def get_rate_limit_demo() -> dict[str, str]:
    return {
        "message": "Rate limit demo request accepted",
        "purpose": "Call this endpoint repeatedly to practice testing 429 Too Many Requests.",
        "limit": "2 requests per minute from the same client",
    }
