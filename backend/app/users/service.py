"""User rules: sign-in, creating users, admin changes, the first admin.

Routers call these functions; these functions call the repository.
A rule broken here raises `UserError`, which the router turns into a 4xx.
"""

import re
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from ..config import Settings
from ..security import hash_password, verify_password
from . import repository
from .models import User

# Paid when the email is unknown, so "no such user" takes as long as
# "wrong password" and the two cannot be told apart by timing (reference app).
_DUMMY_HASH = hash_password("timing-attack-mitigation")

# local@domain.tld: one @, no spaces, a dot in the domain (same rule as the
# reference; allows internal addresses like admin@datalytics.local).
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s.]+(\.[^@\s.]+)*\.[^@\s.]{2,}$")


class UserError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def normalize_email(email: str) -> str:
    return email.strip().lower()


def check_email(email: str) -> None:
    if not _EMAIL_RE.match(email):
        raise UserError("Enter a valid email address, like name@company.com.")


def check_password(password: str, email: str, min_length: int) -> None:
    if len(password) < min_length:
        raise UserError(f"Password must be at least {min_length} characters.")
    if password.strip().lower() == email:
        raise UserError("Password must not be the same as the email address.")


async def authenticate(db: AsyncSession, email: str, password: str) -> User | None:
    """The user these credentials belong to, or None. Never says which part was wrong."""
    user = await repository.get_by_email(db, normalize_email(email))
    if user is None:
        verify_password(password, _DUMMY_HASH)
        return None
    password_ok = verify_password(password, user.password_hash)  # always paid
    if not password_ok or not user.is_active:
        return None
    return user


async def create_user(
    db: AsyncSession, email: str, password: str, is_admin: bool, min_length: int
) -> User:
    email = normalize_email(email)
    check_email(email)
    check_password(password, email, min_length)
    if await repository.get_by_email(db, email) is not None:
        raise UserError("A user with this email already exists.", status_code=409)
    user = User(email=email, password_hash=hash_password(password), is_admin=is_admin)
    return await repository.add(db, user)


async def update_user(
    db: AsyncSession,
    actor: User,
    user_id: int,
    *,
    is_active: bool | None,
    is_admin: bool | None,
    password: str | None,
    min_length: int,
) -> User:
    user = await repository.get_by_id(db, user_id)
    if user is None:
        raise UserError("User not found.", status_code=404)

    # Admins cannot remove their own access. Because only an admin can make
    # changes, this alone guarantees at least one active admin always remains.
    removes_admin = is_admin is False or is_active is False
    if user.id == actor.id and removes_admin:
        raise UserError("You cannot remove your own administrator access.")

    ends_sessions = False
    if password is not None:
        check_password(password, user.email, min_length)
        user.password_hash = hash_password(password)
        ends_sessions = True
    if is_active is not None:
        ends_sessions = ends_sessions or (user.is_active and not is_active)
        user.is_active = is_active
    if is_admin is not None:
        user.is_admin = is_admin
    if ends_sessions:
        user.sessions_valid_after = datetime.now(UTC)
    return await repository.save(db, user)


async def ensure_first_admin(db: AsyncSession, settings: Settings) -> User | None:
    """Create the administrator from ADMIN_EMAIL / ADMIN_PASSWORD when there are no users.

    Does nothing once any user exists, so changing the settings later never
    changes or re-creates an account.
    """
    if await repository.count_all(db) > 0:
        return None
    if not settings.admin_email or not settings.admin_password:
        raise RuntimeError(
            "No users exist yet. Set ADMIN_EMAIL and ADMIN_PASSWORD "
            "to create the first administrator."
        )
    try:
        return await create_user(
            db,
            settings.admin_email,
            settings.admin_password,
            is_admin=True,
            min_length=settings.password_min_length,
        )
    except UserError as e:
        raise RuntimeError(
            f"Cannot create the first administrator from ADMIN_EMAIL / ADMIN_PASSWORD: {e.message}"
        ) from e
