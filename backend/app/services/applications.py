from collections.abc import Iterable
from typing import Any

from sqlalchemy.orm import Session

from app.models.application import ApplicationAuditLog, ApplicationStatus
from app.schemas.application import JobApplicationUpdate, PipelineSummary


def build_pipeline_summary(statuses: Iterable[ApplicationStatus]) -> PipelineSummary:
    counts = {status.value: 0 for status in ApplicationStatus}

    for application_status in statuses:
        counts[application_status.value] += 1

    return PipelineSummary(**counts, total=sum(counts.values()))


def apply_application_update(application: Any, payload: JobApplicationUpdate) -> dict[str, Any]:
    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(application, field, value)

    return update_data


def create_application_audit_log(
    db: Session,
    *,
    application_id: int,
    user_id: int,
    action: str,
    old_status: str | None = None,
    new_status: str | None = None,
) -> ApplicationAuditLog:
    audit_log = ApplicationAuditLog(
        application_id=application_id,
        user_id=user_id,
        action=action,
        old_status=old_status,
        new_status=new_status,
    )
    db.add(audit_log)
    return audit_log
