from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from pwdlib import PasswordHash

from app.config import settings
from app.models.user import User

password_hash = PasswordHash.recommended()


def hash_secret(secret: str) -> str:
    return password_hash.hash(secret)


def verify_secret(plain_secret: str, hashed_secret: str) -> bool:
    return password_hash.verify(plain_secret, hashed_secret)


def hash_password(password: str) -> str:
    return hash_secret(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return verify_secret(plain_password, hashed_password)


def create_access_token(user: User) -> str:
    now = datetime.now(UTC)
    expires_at = now + timedelta(minutes=settings.access_token_expire_minutes)
    payload: dict[str, Any] = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role.value,
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(token: str) -> dict[str, Any]:
    return jwt.decode(
        token,
        settings.jwt_secret_key,
        algorithms=[settings.jwt_algorithm],
    )
