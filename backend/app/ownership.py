"""The one data-access rule of the app.

    Every record a person creates (a connection, a dashboard, ...) belongs to
    that person. A normal user sees and changes only their own records. An
    administrator sees and changes everyone's.

Each owned table mixes in `Owned`, and every query for it goes through
`visible_to`; single records are checked with `can_access`. Keeping the rule in
this one file means it cannot drift between features.
"""

from typing import Any

from sqlalchemy import ForeignKey, Select
from sqlalchemy.orm import Mapped, declared_attr, mapped_column

from .users.models import User


class Owned:
    """Mixin: adds `owner_id` (who created the record)."""

    @declared_attr
    def owner_id(cls) -> Mapped[int]:  # noqa: N805 (SQLAlchemy declared_attr convention)
        return mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)


def visible_to(stmt: Select, model: type[Owned], user: User) -> Select:
    """Limit a SELECT on an owned table to what `user` may see."""
    if user.is_admin:
        return stmt
    return stmt.where(model.owner_id == user.id)


def can_access(record: Any, user: User) -> bool:
    """True when `user` may read or change this owned record."""
    return user.is_admin or record.owner_id == user.id
