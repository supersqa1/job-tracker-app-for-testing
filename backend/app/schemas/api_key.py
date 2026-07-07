from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ApiKeyCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    expires_at: datetime | None = None

    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Name cannot be blank")
        return stripped


class ApiKeyUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    is_active: bool | None = None
    expires_at: datetime | None = None

    @field_validator("name")
    @classmethod
    def optional_name_must_not_be_blank(cls, value: str | None) -> str | None:
        if value is None:
            return value
        stripped = value.strip()
        if not stripped:
            raise ValueError("Name cannot be blank")
        return stripped


class ApiKeyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    key_prefix: str
    is_active: bool
    last_used_at: datetime | None
    expires_at: datetime | None
    created_at: datetime
    updated_at: datetime


class ApiKeyCreateResponse(ApiKeyRead):
    api_key: str
