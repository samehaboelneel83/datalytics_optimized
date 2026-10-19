# Datalytics Optimized

A clean, feature-by-feature rebuild of **Datalytics**, a data-analysis and dashboard
application. The original app
([data_analysis_dashboard_ai-](https://github.com/samehaboelneel83/data_analysis_dashboard_ai-))
is the reference for features and visual design. This repository is the new implementation.

**Current state:** the app opens on the login page. Accounts live in PostgreSQL; after a
successful sign-in you see Home. Administrators manage users from the **Users** page.
Every record a user creates will belong to that user; administrators see everyone's.
There is no data feature yet (no connections or dashboards).
See [`docs/FEATURE_STATUS.md`](docs/FEATURE_STATUS.md).

## Repository layout

```
frontend/   React + Vite + TypeScript web app
backend/    FastAPI + SQLAlchemy + Alembic API (Python 3.12)
docs/       Project documentation: overview, architecture, decisions, feature notes
docker-compose.yml   postgres + backend + frontend
```

## Run everything with Docker (recommended)

Requires Docker with the Compose plugin.

```bash
cp .env.example .env
# edit .env: set POSTGRES_PASSWORD, SECRET_KEY and ADMIN_PASSWORD
docker compose up --build
```

Open **http://localhost:3002** and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
The first administrator is created only on the first start (empty database).
Stop with `docker compose down`; accounts are kept in the `postgres_data` volume
(`docker compose down -v` deletes them).

## Run for development (hot reload)

You need PostgreSQL running (e.g. `docker compose up -d postgres`, or a local install).

```bash
# 1. backend  (http://localhost:8000, API docs at /api/docs)
cd backend
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements-dev.txt
export DATABASE_URL=postgresql+asyncpg://datalytics:PASSWORD@localhost:5432/datalytics
export SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(48))")
export ADMIN_EMAIL=admin@datalytics.local ADMIN_PASSWORD=choose-a-password
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# 2. frontend (http://localhost:3002, forwards /api to the backend)
cd frontend
npm ci
npm run dev
```

(`docker compose up -d postgres` does not publish the database port; for local
development either add `ports: ["5432:5432"]` to the postgres service in your own
override file or use a local PostgreSQL.)

## Checks

```bash
cd frontend && npm run lint && npm run typecheck && npm test && npm run build
cd backend  && ruff check . && pytest
# backend tests against PostgreSQL instead of SQLite:
TEST_DATABASE_URL=postgresql+asyncpg://user:pw@localhost:5432/datalytics_test pytest
```

## Documentation

- [Project overview](docs/PROJECT_OVERVIEW.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Development workflow](docs/DEVELOPMENT_WORKFLOW.md)
- [Feature status](docs/FEATURE_STATUS.md)
- [Testing strategy](docs/TESTING_STRATEGY.md)
- [Reference analysis](docs/REFERENCE_ANALYSIS.md)
- [Decisions (ADRs)](docs/decisions/)
- [Feature notes](docs/features/)
