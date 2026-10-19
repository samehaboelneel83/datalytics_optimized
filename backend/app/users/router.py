"""/api/users: administrators manage accounts. Every route here is admin-only."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth.dependencies import require_admin
from ..config import Settings, get_settings
from ..database import get_db
from . import repository, service
from .models import User
from .schemas import UserCreate, UserOut, UserUpdate

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=list[UserOut])
async def list_users(db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    return await repository.list_all(db)


@router.post("", response_model=UserOut, status_code=201)
async def create_user(
    body: UserCreate,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    _: User = Depends(require_admin),
):
    try:
        return await service.create_user(
            db, body.email, body.password, body.is_admin, settings.password_min_length
        )
    except service.UserError as e:
        raise HTTPException(e.status_code, e.message) from e


@router.patch("/{user_id}", response_model=UserOut)
async def update_user(
    user_id: int,
    body: UserUpdate,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    admin: User = Depends(require_admin),
):
    try:
        return await service.update_user(
            db,
            admin,
            user_id,
            is_active=body.is_active,
            is_admin=body.is_admin,
            password=body.password,
            min_length=settings.password_min_length,
        )
    except service.UserError as e:
        raise HTTPException(e.status_code, e.message) from e
