"""/api/auth: sign in, sign out, and "who am I"."""

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..security import clear_session_cookie, create_session_token, set_session_cookie
from ..users import service
from ..users.models import User
from ..users.schemas import LoginIn, UserOut
from .dependencies import current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=UserOut)
async def login(body: LoginIn, response: Response, db: AsyncSession = Depends(get_db)):
    user = await service.authenticate(db, body.email, body.password)
    if user is None:
        # One message for unknown email, wrong password and disabled account.
        raise HTTPException(401, "Invalid email or password.")
    set_session_cookie(response, create_session_token(user.id))
    return user


@router.post("/logout", status_code=204)
async def logout(response: Response) -> None:
    clear_session_cookie(response)


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(current_user)):
    return user
