"""The per-user data rule, checked on a small test-only table.

Real owned tables (connections, dashboards, ...) will use the same `Owned`
mixin and `visible_to` / `can_access`, so this is the rule they inherit.
"""

from sqlalchemy import String, select
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.ownership import Owned, can_access, visible_to
from app.users.models import User


class Note(Owned, Base):
    __tablename__ = "test_notes"
    id: Mapped[int] = mapped_column(primary_key=True)
    text: Mapped[str] = mapped_column(String(50))


async def _setup(db):
    alice = User(email="alice@x.com", password_hash="-", is_admin=False)
    bob = User(email="bob@x.com", password_hash="-", is_admin=False)
    admin = User(email="boss@x.com", password_hash="-", is_admin=True)
    db.add_all([alice, bob, admin])
    await db.flush()
    db.add_all(
        [
            Note(owner_id=alice.id, text="alice 1"),
            Note(owner_id=alice.id, text="alice 2"),
            Note(owner_id=bob.id, text="bob 1"),
            Note(owner_id=admin.id, text="admin 1"),
        ]
    )
    await db.commit()
    return alice, bob, admin


async def _texts(db, user):
    rows = await db.execute(visible_to(select(Note), Note, user).order_by(Note.id))
    return [n.text for n in rows.scalars()]


async def test_a_user_sees_only_their_own_records(db):
    alice, bob, _ = await _setup(db)
    assert await _texts(db, alice) == ["alice 1", "alice 2"]
    assert await _texts(db, bob) == ["bob 1"]


async def test_an_admin_sees_every_record_including_their_own(db):
    _, _, admin = await _setup(db)
    assert await _texts(db, admin) == ["alice 1", "alice 2", "bob 1", "admin 1"]


async def test_single_record_access(db):
    alice, bob, admin = await _setup(db)
    alices_note = (await db.execute(select(Note).where(Note.text == "alice 1"))).scalar_one()
    assert can_access(alices_note, alice)
    assert not can_access(alices_note, bob)
    assert can_access(alices_note, admin)
