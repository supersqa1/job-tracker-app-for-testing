from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user_from_jwt
from app.models.user import User
from app.schemas.api_key import (
    ApiKeyCreate,
    ApiKeyCreateResponse,
    ApiKeyRead,
    ApiKeyUpdate,
)
from app.services.api_keys import (
    create_api_key,
    get_user_api_key,
    list_api_keys,
    revoke_api_key,
    update_api_key,
)

router = APIRouter(prefix="/api-keys", tags=["api-keys"])


@router.post("", response_model=ApiKeyCreateResponse, status_code=status.HTTP_201_CREATED)
def create_key(
    payload: ApiKeyCreate,
    current_user: User = Depends(get_current_user_from_jwt),
    db: Session = Depends(get_db),
) -> ApiKeyCreateResponse:
    api_key, raw_api_key = create_api_key(db, current_user=current_user, payload=payload)
    key_metadata = ApiKeyRead.model_validate(api_key).model_dump()
    return ApiKeyCreateResponse(**key_metadata, api_key=raw_api_key)


@router.get("", response_model=list[ApiKeyRead])
def list_keys(
    current_user: User = Depends(get_current_user_from_jwt),
    db: Session = Depends(get_db),
) -> list[ApiKeyRead]:
    return list_api_keys(db, current_user=current_user)


@router.patch("/{api_key_id}", response_model=ApiKeyRead)
def update_key(
    api_key_id: int,
    payload: ApiKeyUpdate,
    current_user: User = Depends(get_current_user_from_jwt),
    db: Session = Depends(get_db),
) -> ApiKeyRead:
    api_key = get_user_api_key(db, current_user=current_user, api_key_id=api_key_id)
    if api_key is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key not found")

    update_api_key(api_key, payload)
    db.commit()
    db.refresh(api_key)
    return api_key


@router.delete("/{api_key_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_key(
    api_key_id: int,
    current_user: User = Depends(get_current_user_from_jwt),
    db: Session = Depends(get_db),
) -> None:
    api_key = get_user_api_key(db, current_user=current_user, api_key_id=api_key_id)
    if api_key is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key not found")

    revoke_api_key(api_key)
    db.commit()
