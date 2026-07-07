from fastapi import APIRouter, Depends

from app.dependencies.auth import require_role
from app.models.user import User, UserRole

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/status")
def get_admin_status(
    current_user: User = Depends(require_role(UserRole.ADMIN)),
) -> dict[str, str]:
    return {
        "status": "ok",
        "role": current_user.role.value,
        "email": current_user.email,
    }
