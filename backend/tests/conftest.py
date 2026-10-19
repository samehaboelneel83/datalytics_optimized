"""Test setup: each test gets a fresh, empty database and an HTTP client.

By default the database is in-memory SQLite (fast, nothing to install). Set
TEST_DATABASE_URL to run the same tests against PostgreSQL, e.g.
  TEST_DATABASE_URL=postgresql+asyncpg://datalytics:pw@localhost:5432/datalytics_test

Settings are set through the environment BEFORE the app is imported, so the
code under test reads them exactly as it does in production.
"""

import os

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["SECRET_KEY"] = "test-secret-key-that-is-long-enough-0123456789"
os.environ["ADMIN_EMAIL"] = "admin@datalytics.local"
os.environ["ADMIN_PASSWORD"] = "admin-password-1"

import pytest  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app.config import get_settings  # noqa: E402
from app.database import Base, get_db  # noqa: E402
from app.main import create_app  # noqa: E402
from app.users import service  # noqa: E402

ADMIN = ("admin@datalytics.local", "admin-password-1")
CSRF = {"X-Requested-With": "datalytics"}


@pytest.fixture
async def sessionmaker():
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield async_sessionmaker(engine, expire_on_commit=False)
    await engine.dispose()


@pytest.fixture
async def db(sessionmaker):
    async with sessionmaker() as session:
        yield session


@pytest.fixture
async def app(sessionmaker):
    application = create_app(run_startup=False)

    async def _get_db():
        async with sessionmaker() as session:
            yield session

    application.dependency_overrides[get_db] = _get_db
    async with sessionmaker() as session:
        await service.ensure_first_admin(session, get_settings())
    return application


def _client(app) -> AsyncClient:
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test", headers=CSRF)


@pytest.fixture
async def client(app):
    async with _client(app) as c:
        yield c


@pytest.fixture
def new_client(app):
    """Another browser: its own cookie jar."""
    return lambda: _client(app)


async def login(client: AsyncClient, email: str, password: str):
    return await client.post("/api/auth/login", json={"email": email, "password": password})


@pytest.fixture
async def admin_client(client):
    r = await login(client, *ADMIN)
    assert r.status_code == 200
    return client
