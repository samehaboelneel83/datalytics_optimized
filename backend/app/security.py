"""Passwords and session tokens. No database access here.

- Passwords are hashed with bcrypt (same algorithm as the reference app).
- A session is a signed JWT kept in an HttpOnly cookie: page scripts cannot
  read it, so an injected script cannot steal it (reference app, change T6).
"""

from datetime import UTC, datetime, timedelta

import bcrypt
import jwt
from fastapi import Response

from .config import get_settings

SESSION_COOKIE = "datalytics_session"
# State-changing requests must carry this header. A cross-site <form> cannot
# send custom headers, so this blocks CSRF on top of SameSite=Lax.
CSRF_HEADER = "x-requested-with"
_ALGORITHM = "HS256"
# bcrypt only reads the first 72 bytes; longer input raises in bcrypt 5.
_BCRYPT_MAX_BYTES = 72


def _encode(password: str) -> bytes:
    return password.encode("utf-8")[:_BCRYPT_MAX_BYTES]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_encode(password), bcrypt.gensalt()).decode("ascii")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(_encode(password), password_hash.encode("ascii"))


def create_session_token(user_id: int) -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "iat": int(now.timestamp()),
        "exp": now + timedelta(hours=settings.session_hours),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=_ALGORITHM)


def read_session_token(token: str) -> dict | None:
    """The token's claims, or None if it is forged, expired or malformed."""
    try:
        return jwt.decode(
            token,
            get_settings().secret_key,
            algorithms=[_ALGORITHM],
            options={"require": ["sub", "iat", "exp"]},
        )
    except jwt.PyJWTError:
        return None


def set_session_cookie(response: Response, token: str) -> None:
    settings = get_settings()
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=settings.session_hours * 3600,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path="/api",
    )


def clear_session_cookie(response: Response) -> None:
    settings = get_settings()
    response.delete_cookie(
        SESSION_COOKIE,
        path="/api",
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
    )
