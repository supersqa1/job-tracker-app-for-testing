from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.user import UserRole


class UserCreate(BaseModel):
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "email": "new.student@example.com",
                    "password": "Password123!",
                    "full_name": "New Student",
                }
            ]
        }
    }

    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=200)

    @field_validator("full_name")
    @classmethod
    def full_name_must_not_be_blank(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Full name cannot be blank")
        return stripped


class UserUpdate(BaseModel):
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "full_name": "Updated Student",
                }
            ]
        }
    }

    full_name: str | None = Field(default=None, min_length=1, max_length=200)

    @field_validator("full_name")
    @classmethod
    def optional_full_name_must_not_be_blank(cls, value: str | None) -> str | None:
        if value is None:
            return value
        stripped = value.strip()
        if not stripped:
            raise ValueError("Full name cannot be blank")
        return stripped


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime
