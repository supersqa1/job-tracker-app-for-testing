from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user_from_jwt
from app.models.user import User
from app.schemas.user import UserRead, UserUpdate
from app.services.users import update_user_profile

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
def get_my_profile(current_user: User = Depends(get_current_user_from_jwt)) -> User:
    return current_user


@router.patch("/me", response_model=UserRead)
def update_my_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user_from_jwt),
    db: Session = Depends(get_db),
) -> User:
    update_user_profile(current_user, full_name=payload.full_name)
    db.commit()
    db.refresh(current_user)
    return current_user
