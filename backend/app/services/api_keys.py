import secrets
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.models.api_key import ApiKey
from app.models.user import User
from app.schemas.api_key import ApiKeyCreate, ApiKeyUpdate
from app.services.security import hash_secret, verify_secret

API_KEY_PREFIX = "jt_live_"
KEY_PREFIX_LENGTH = 20


def generate_api_key() -> str:
    return f"{API_KEY_PREFIX}{secrets.token_urlsafe(32)}"


def display_key_prefix(api_key: str) -> str:
    return api_key[:KEY_PREFIX_LENGTH]


def create_api_key(
    db: Session,
    *,
    current_user: User,
    payload: ApiKeyCreate,
) -> tuple[ApiKey, str]:
    raw_api_key = generate_api_key()
    api_key = ApiKey(
        user_id=current_user.id,
        name=payload.name.strip(),
        key_prefix=display_key_prefix(raw_api_key),
        hashed_key=hash_secret(raw_api_key),
        expires_at=payload.expires_at,
    )
    db.add(api_key)
    db.commit()
    db.refresh(api_key)
    return api_key, raw_api_key


def list_api_keys(db: Session, *, current_user: User) -> list[ApiKey]:
    return (
        db.query(ApiKey)
        .filter(ApiKey.user_id == current_user.id)
        .order_by(ApiKey.created_at.desc(), ApiKey.id.desc())
        .all()
    )


def get_user_api_key(db: Session, *, current_user: User, api_key_id: int) -> ApiKey | None:
    return (
        db.query(ApiKey)
        .filter(ApiKey.id == api_key_id, ApiKey.user_id == current_user.id)
        .one_or_none()
    )


def update_api_key(api_key: ApiKey, payload: ApiKeyUpdate) -> dict[str, object]:
    update_data = payload.model_dump(exclude_unset=True)
    if "name" in update_data and isinstance(update_data["name"], str):
        update_data["name"] = update_data["name"].strip()

    for field, value in update_data.items():
        setattr(api_key, field, value)

    return update_data


def revoke_api_key(api_key: ApiKey) -> None:
    api_key.is_active = False
    api_key.updated_at = datetime.now(UTC)


def find_valid_api_key(db: Session, raw_api_key: str) -> ApiKey | None:
    key_prefix = display_key_prefix(raw_api_key)
    candidates = (
        db.query(ApiKey)
        .filter(ApiKey.key_prefix == key_prefix)
        .order_by(ApiKey.id.desc())
        .all()
    )

    for candidate in candidates:
        if verify_secret(raw_api_key, candidate.hashed_key):
            return candidate

    return None


def is_api_key_expired(api_key: ApiKey) -> bool:
    if api_key.expires_at is None:
        return False
    expires_at = api_key.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=UTC)
    return expires_at <= datetime.now(UTC)


def mark_api_key_used(api_key: ApiKey) -> None:
    api_key.last_used_at = datetime.now(UTC)
