from datetime import datetime

from pydantic import BaseModel

from app.schemas.application import PipelineSummary


class PublicStatus(BaseModel):
    app_name: str
    api_version: str
    environment: str
    server_time: datetime


class PublicDemoStats(BaseModel):
    total_seeded_applications: int
    status_counts: PipelineSummary
