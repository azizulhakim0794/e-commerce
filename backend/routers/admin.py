from fastapi import APIRouter

from core.security import AdminUser

router = APIRouter()


@router.get("/overview")
async def get_admin_overview(current_user: AdminUser):
    return {
        "message": "Admin access granted",
        "user": {
            "id": str(current_user.id),
            "username": current_user.username,
            "is_admin": current_user.is_admin,
        },
    }
