import pytest

from app.config import Settings
from app.users import repository, service

SECRET = "x" * 40


async def test_first_admin_is_created_once(db):
    settings = Settings(secret_key=SECRET, admin_email="Boss@X.com", admin_password="password-123")
    first = await service.ensure_first_admin(db, settings)
    assert first is not None and first.is_admin and first.email == "boss@x.com"
    # Changing the settings later does not create or change anything.
    again = Settings(secret_key=SECRET, admin_email="other@x.com", admin_password="password-456")
    assert await service.ensure_first_admin(db, again) is None
    assert await repository.count_all(db) == 1


async def test_empty_database_without_admin_settings_stops_startup(db):
    with pytest.raises(RuntimeError, match="ADMIN_EMAIL"):
        await service.ensure_first_admin(
            db, Settings(secret_key=SECRET, admin_email="", admin_password="")
        )


async def test_weak_admin_password_is_refused(db):
    settings = Settings(secret_key=SECRET, admin_email="a@x.com", admin_password="short")
    with pytest.raises(RuntimeError, match="ADMIN_PASSWORD: Password must be at least 8"):
        await service.ensure_first_admin(db, settings)
