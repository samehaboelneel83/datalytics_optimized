"""Who is calling? Used by every protected route.

`current_user` reads the session cookie and returns the signed-in user or
answers 401. `require_admin` additionally answers 403 for non-admins.
"""

from datetime import UTC

from fastapi import Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..security import SESSION_COOKIE, read_session_token
from ..users import repository
from ..users.models import User

_NOT_SIGNED_IN = HTTPException(401, "Not signed in.")


async def current_user(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    token = request.cookies.get(SESSION_COOKIE)
    claims = read_session_token(token) if token else None
    if claims is None:
        raise _NOT_SIGNED_IN
    try:
        user_id = int(claims["sub"])
    except (TypeError, ValueError):
        raise _NOT_SIGNED_IN from None
    user = await repository.get_by_id(db, user_id)
    if user is None or not user.is_active:
        raise _NOT_SIGNED_IN
    cutoff = user.sessions_valid_after
    if cutoff is not None:
        if cutoff.tzinfo is None:  # SQLite returns naive UTC
            cutoff = cutoff.replace(tzinfo=UTC)
        if int(claims["iat"]) < int(cutoff.timestamp()):
            raise _NOT_SIGNED_IN
    return user


async def require_admin(user: User = Depends(current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(403, "Administrators only.")
    return user
