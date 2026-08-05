from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rate_limit import RateLimitApplicationCreate
from app.models.application import ApplicationStatus, JobApplication
from app.models.user import User
from app.schemas.application import (
    JobApplicationPage,
    JobApplicationCreate,
    JobApplicationRead,
    JobApplicationUpdate,
    PipelineSummary,
)
from app.services.applications import (
    apply_application_update,
    build_pipeline_summary,
    create_application_audit_log,
)

router = APIRouter(prefix="/applications", tags=["applications"])


@router.get("", response_model=list[JobApplicationRead] | JobApplicationPage)
def list_applications(
    status: ApplicationStatus | None = Query(default=None),
    search: str | None = Query(default=None, min_length=1),
    paginated: bool = Query(default=False),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[JobApplication] | JobApplicationPage:
    query = (
        db.query(JobApplication)
        .filter(JobApplication.user_id == current_user.id)
    )

    if status is not None:
        query = query.filter(JobApplication.status == status)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            JobApplication.company_name.ilike(term) | JobApplication.role_title.ilike(term)
        )

    query = query.order_by(JobApplication.updated_at.desc())

    if not paginated:
        return query.all()

    total = query.count()
    items = query.offset(offset).limit(limit).all()
    return JobApplicationPage(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/summary", response_model=PipelineSummary)
def get_pipeline_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PipelineSummary:
    return build_pipeline_summary(
        application.status
        for application in db.query(JobApplication)
        .filter(JobApplication.user_id == current_user.id)
        .all()
    )


@router.get("/{application_id}", response_model=JobApplicationRead)
def get_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JobApplication:
    application = (
        db.query(JobApplication)
        .filter(
            JobApplication.id == application_id,
            JobApplication.user_id == current_user.id,
        )
        .one_or_none()
    )
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return application


@router.post(
    "",
    response_model=JobApplicationRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[RateLimitApplicationCreate],
)
def create_application(
    payload: JobApplicationCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JobApplication:
    application = JobApplication(**payload.model_dump(), user_id=current_user.id)
    db.add(application)
    db.commit()
    db.refresh(application)
    create_application_audit_log(
        db,
        application_id=application.id,
        user_id=current_user.id,
        action="created",
        new_status=application.status.value,
        request=request,
    )
    db.commit()
    return application


@router.patch("/{application_id}", response_model=JobApplicationRead)
def update_application(
    application_id: int,
    payload: JobApplicationUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JobApplication:
    application = (
        db.query(JobApplication)
        .filter(
            JobApplication.id == application_id,
            JobApplication.user_id == current_user.id,
        )
        .one_or_none()
    )
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    old_status = application.status.value
    apply_application_update(application, payload)

    create_application_audit_log(
        db,
        application_id=application.id,
        user_id=current_user.id,
        action="updated",
        old_status=old_status,
        new_status=application.status.value,
        request=request,
    )
    db.commit()
    db.refresh(application)
    return application


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    application = (
        db.query(JobApplication)
        .filter(
            JobApplication.id == application_id,
            JobApplication.user_id == current_user.id,
        )
        .one_or_none()
    )
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    create_application_audit_log(
        db,
        application_id=application.id,
        user_id=current_user.id,
        action="deleted",
        old_status=application.status.value,
        request=request,
    )
    db.delete(application)
    db.commit()
