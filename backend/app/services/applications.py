from collections.abc import Iterable
from typing import Any

from app.models.application import ApplicationStatus
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
