from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.services.security import hash_password, verify_password


def normalize_email(email: str) -> str:
    return email.strip().lower()


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == normalize_email(email)).one_or_none()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def create_user(
    db: Session,
    *,
    email: str,
    password: str,
    full_name: str,
    role: UserRole = UserRole.USER,
) -> User:
    user = User(
        email=normalize_email(email),
        hashed_password=hash_password(password),
        full_name=full_name.strip(),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)
    if user is None:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def update_user_profile(user: User, *, full_name: str | None) -> User:
    if full_name is not None:
        user.full_name = full_name.strip()
    return user


def change_user_password(user: User, *, new_password: str) -> User:
    user.hashed_password = hash_password(new_password)
    return user
