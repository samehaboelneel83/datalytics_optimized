# Datalytics Optimized

A clean, feature-by-feature rebuild of **Datalytics**, a data-analysis and dashboard
application. The original app
([data_analysis_dashboard_ai-](https://github.com/samehaboelneel83/data_analysis_dashboard_ai-))
is the reference for features and visual design. This repository is the new implementation.

**Current state:** milestone 1, a static UI foundation (login page, home page, sidebar).
The login page checks what you type in the browser and then opens the home page, but no
account is verified: there is no backend, no authentication and no data.
See [`docs/FEATURE_STATUS.md`](docs/FEATURE_STATUS.md).

## Repository layout

```
frontend/   React + Vite + TypeScript app (static UI for now)
docs/       Project documentation: overview, architecture, decisions, feature notes
```

A `backend/` folder will be added with the first backend feature.

## Run the frontend

Requirements: Node.js 20+ (tested with Node 22) and npm.

```bash
cd frontend
npm ci            # install the exact versions from package-lock.json
npm run dev       # http://localhost:3000
```

| Page  | URL |
|-------|-----|
| Home (sidebar + top bar + home) | http://localhost:3000/ |
| Login | http://localhost:3000/login.html |

There is no router yet, so the two pages are separate HTML entries. Sidebar items do
nothing on purpose. On the login page, any filled-in email and password opens Home
(preview mode, nothing is checked or stored).

## Run with Docker

Requires Docker with the Compose plugin.

```bash
docker compose up --build        # build the image and start it
# Home:  http://localhost:8080/        Login: http://localhost:8080/login.html
docker compose down              # stop
```

Port 8080 busy? `FRONTEND_PORT=9000 docker compose up --build` (or copy `.env.example`
to `.env`). The image is built in two stages: Node builds the site, then nginx
(unprivileged, read-only container) serves the static files. See
[ADR 0004](docs/decisions/0004-docker-nginx-static-serving.md).

## Checks

```bash
cd frontend
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm test            # Vitest component + accessibility tests
npm run build       # type-check and production build into frontend/dist
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
