import pytest
from pydantic import ValidationError

from app.models.application import ApplicationStatus, RemoteType
from app.schemas.application import JobApplicationCreate, JobApplicationUpdate


def test_create_application_uses_expected_defaults():
    application = JobApplicationCreate(company_name="Acme", role_title="SDET")

    assert application.status == ApplicationStatus.POTENTIAL
    assert application.remote_type is None
    assert application.location is None
    assert application.applied_at is None


def test_create_application_accepts_enum_values():
    application = JobApplicationCreate(
        company_name="Acme",
        role_title="SDET",
        status="applied",
        remote_type="hybrid",
    )

    assert application.status == ApplicationStatus.APPLIED
    assert application.remote_type == RemoteType.HYBRID


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("company_name", ""),
        ("company_name", "   "),
        ("role_title", ""),
        ("role_title", "   "),
    ],
)
def test_create_application_rejects_blank_required_strings(field, value):
    payload = {"company_name": "Acme", "role_title": "SDET", field: value}

    with pytest.raises(ValidationError):
        JobApplicationCreate(**payload)


def test_update_application_distinguishes_missing_fields_from_explicit_nulls():
    payload = JobApplicationUpdate(company_name="Acme", remote_type=None)

    assert payload.model_dump(exclude_unset=True) == {
        "company_name": "Acme",
        "remote_type": None,
    }


def test_update_application_rejects_invalid_status():
    with pytest.raises(ValidationError):
        JobApplicationUpdate(status="not-a-status")


def test_create_application_strips_required_strings():
    application = JobApplicationCreate(company_name=" Acme ", role_title=" SDET ")

    assert application.company_name == "Acme"
    assert application.role_title == "SDET"
