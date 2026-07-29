from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserRead


class LoginRequest(BaseModel):
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "email": "student@example.com",
                    "password": "Password123!",
                }
            ]
        }
    }

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class ChangePasswordRequest(BaseModel):
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "current_password": "Password123!",
                    "new_password": "NewPassword123!",
                }
            ]
        }
    }

    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserRead
