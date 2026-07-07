from types import SimpleNamespace

from app.models.application import ApplicationStatus, RemoteType
from app.schemas.application import JobApplicationUpdate
from app.services.applications import apply_application_update, build_pipeline_summary


def test_build_pipeline_summary_counts_statuses_and_total():
    summary = build_pipeline_summary(
        [
            ApplicationStatus.POTENTIAL,
            ApplicationStatus.APPLIED,
            ApplicationStatus.APPLIED,
            ApplicationStatus.HIRED,
            ApplicationStatus.REJECTED,
        ]
    )

    assert summary.potential == 1
    assert summary.applied == 2
    assert summary.in_progress == 0
    assert summary.final_stage == 0
    assert summary.hired == 1
    assert summary.rejected == 1
    assert summary.withdrawn == 0
    assert summary.total == 5


def test_build_pipeline_summary_handles_empty_input():
    summary = build_pipeline_summary([])

    assert summary.total == 0
    assert summary.model_dump(exclude={"total"}) == {
        "potential": 0,
        "applied": 0,
        "in_progress": 0,
        "final_stage": 0,
        "hired": 0,
        "rejected": 0,
        "withdrawn": 0,
    }


def test_apply_application_update_only_changes_supplied_fields():
    application = SimpleNamespace(
        company_name="OldCo",
        role_title="QA Engineer",
        status=ApplicationStatus.POTENTIAL,
        remote_type=RemoteType.REMOTE,
        notes="Keep this",
    )
    payload = JobApplicationUpdate(
        company_name="NewCo",
        status=ApplicationStatus.IN_PROGRESS,
        remote_type=None,
    )

    changed_fields = apply_application_update(application, payload)

    assert changed_fields == {
        "company_name": "NewCo",
        "status": ApplicationStatus.IN_PROGRESS,
        "remote_type": None,
    }
    assert application.company_name == "NewCo"
    assert application.role_title == "QA Engineer"
    assert application.status == ApplicationStatus.IN_PROGRESS
    assert application.remote_type is None
    assert application.notes == "Keep this"
