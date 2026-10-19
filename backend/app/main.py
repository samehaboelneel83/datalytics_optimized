"""Builds the FastAPI app: settings check, first admin, CSRF guard, routers.

Kept short on purpose: each feature lives in its own package and only its
router is included here.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from .auth.router import router as auth_router
from .config import get_settings
from .database import SessionLocal
from .security import CSRF_HEADER
from .users import service as user_service
from .users.router import router as users_router

_SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    settings.check()
    async with SessionLocal() as db:
        await user_service.ensure_first_admin(db, settings)
    yield


def create_app(*, run_startup: bool = True) -> FastAPI:
    app = FastAPI(
        title="Datalytics API",
        lifespan=lifespan if run_startup else None,
        docs_url=None if get_settings().is_production else "/api/docs",
        redoc_url=None,
        openapi_url=None if get_settings().is_production else "/api/openapi.json",
    )

    @app.middleware("http")
    async def csrf_guard(request: Request, call_next):
        # A cross-site form cannot set custom headers, so requiring one on every
        # write stops cross-site request forgery even if a cookie is sent.
        if request.method not in _SAFE_METHODS and not request.headers.get(CSRF_HEADER):
            return JSONResponse({"detail": "Missing X-Requested-With header."}, status_code=403)
        return await call_next(request)

    @app.get("/api/health", tags=["health"])
    async def health() -> dict:
        return {"status": "ok"}

    app.include_router(auth_router)
    app.include_router(users_router)
    return app


app = create_app()
