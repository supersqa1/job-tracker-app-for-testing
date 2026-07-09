from collections.abc import Callable

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader, HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.services.api_keys import find_valid_api_key, is_api_key_expired, mark_api_key_used
from app.services.security import decode_access_token
from app.services.users import get_user_by_id

bearer_scheme = HTTPBearer(
    auto_error=False,
    scheme_name="BearerAuth",
    description="JWT access token from /api/v1/auth/login.",
)
api_key_scheme = APIKeyHeader(
    name="X-API-Key",
    auto_error=False,
    scheme_name="ApiKeyAuth",
    description="API key created from /api/v1/api-keys.",
)


def authentication_error(detail: str = "Authentication required") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user_from_jwt(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise authentication_error()

    if credentials.scheme.lower() != "bearer":
        raise authentication_error("Invalid authentication scheme")

    try:
        payload = decode_access_token(credentials.credentials)
    except jwt.ExpiredSignatureError as exc:
        raise authentication_error("Token has expired") from exc
    except jwt.InvalidTokenError as exc:
        raise authentication_error("Invalid token") from exc

    user_id = payload.get("sub")
    if user_id is None:
        raise authentication_error("Invalid token")

    try:
        user_id_int = int(user_id)
    except ValueError as exc:
        raise authentication_error("Invalid token") from exc

    user = get_user_by_id(db, user_id_int)
    if user is None:
        raise authentication_error("Invalid token")

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    return user


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    x_api_key: str | None = Depends(api_key_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is not None:
        return get_current_user_from_jwt(credentials=credentials, db=db)

    if x_api_key is None:
        raise authentication_error()

    api_key = find_valid_api_key(db, x_api_key)
    if api_key is None:
        raise authentication_error("Invalid API key")

    if not api_key.is_active:
        raise authentication_error("Invalid API key")

    if is_api_key_expired(api_key):
        raise authentication_error("API key has expired")

    user = get_user_by_id(db, api_key.user_id)
    if user is None:
        raise authentication_error("Invalid API key")

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    mark_api_key_used(api_key)
    db.commit()
    db.refresh(user)
    return user


def require_role(required_role: UserRole) -> Callable[[User], User]:
    def role_dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return role_dependency
