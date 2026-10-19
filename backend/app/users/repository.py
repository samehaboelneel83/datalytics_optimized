"""Database reads and writes for users. No rules here, only queries."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import User


async def get_by_id(db: AsyncSession, user_id: int) -> User | None:
    return await db.get(User, user_id)


async def get_by_email(db: AsyncSession, email: str) -> User | None:
    return (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()


async def list_all(db: AsyncSession) -> list[User]:
    return list((await db.execute(select(User).order_by(User.id))).scalars())


async def count_all(db: AsyncSession) -> int:
    return (await db.execute(select(func.count()).select_from(User))).scalar_one()


async def add(db: AsyncSession, user: User) -> User:
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def save(db: AsyncSession, user: User) -> User:
    await db.commit()
    await db.refresh(user)
    return user
