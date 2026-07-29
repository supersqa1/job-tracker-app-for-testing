from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.application import ApplicationStatus, RemoteType


class JobApplicationBase(BaseModel):
    company_name: str = Field(min_length=1, max_length=200)
    role_title: str = Field(min_length=1, max_length=200)
    status: ApplicationStatus = ApplicationStatus.POTENTIAL
    location: str | None = None
    remote_type: RemoteType | None = None
    salary_range: str | None = None
    job_url: str | None = None
    description: str | None = None
    notes: str | None = None
    next_action: str | None = None
    next_action_at: datetime | None = None
    applied_at: datetime | None = None

    @field_validator("company_name", "role_title")
    @classmethod
    def required_text_must_not_be_blank(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Value cannot be blank")
        return stripped


class JobApplicationCreate(JobApplicationBase):
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "company_name": "Acme Corp",
                    "role_title": "API Test Engineer",
                    "status": "applied",
                    "location": "Remote",
                    "remote_type": "remote",
                    "salary_range": "$100k - $130k",
                    "job_url": "https://example.com/jobs/api-test-engineer",
                    "notes": "Submitted through company careers page.",
                    "next_action": "Follow up with recruiter",
                }
            ]
        }
    }


class JobApplicationUpdate(BaseModel):
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "status": "in_progress",
                    "notes": "Recruiter screen completed.",
                    "next_action": "Schedule technical interview",
                }
            ]
        }
    }

    company_name: str | None = Field(default=None, min_length=1, max_length=200)
    role_title: str | None = Field(default=None, min_length=1, max_length=200)
    status: ApplicationStatus | None = None
    location: str | None = None
    remote_type: RemoteType | None = None
    salary_range: str | None = None
    job_url: str | None = None
    description: str | None = None
    notes: str | None = None
    next_action: str | None = None
    next_action_at: datetime | None = None
    applied_at: datetime | None = None

    @field_validator("company_name", "role_title")
    @classmethod
    def optional_text_must_not_be_blank(cls, value: str | None) -> str | None:
        if value is None:
            return value
        stripped = value.strip()
        if not stripped:
            raise ValueError("Value cannot be blank")
        return stripped


class JobApplicationRead(JobApplicationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class JobApplicationPage(BaseModel):
    items: list[JobApplicationRead]
    total: int
    limit: int
    offset: int


class PipelineSummary(BaseModel):
    potential: int = 0
    applied: int = 0
    in_progress: int = 0
    final_stage: int = 0
    hired: int = 0
    rejected: int = 0
    withdrawn: int = 0
    total: int = 0
