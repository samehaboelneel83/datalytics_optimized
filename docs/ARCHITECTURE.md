# Architecture

## Overview (target)

```
browser ──> frontend (nginx :3002) ──/api──> backend (FastAPI :8000) ──> PostgreSQL
              serves the React app            auth, users, (later) data
```

The browser only ever talks to one origin. nginx (Docker) or Vite (development) forwards
`/api` to the backend. Only the web app's port is published; the API and database are
reachable only inside Docker.

## Frontend

### Stack
React 18 · TypeScript (strict) · Vite 7 · lucide-react icons · CSS Modules on top of
global design tokens · Vitest + Testing Library + axe-core · ESLint.
Why this stack: [ADR 0001](decisions/0001-frontend-stack.md).

### Folder structure
```
docker-compose.yml           postgres + backend + frontend
.env.example                 settings to copy into .env (secrets are required)
frontend/
  Dockerfile  nginx.conf     two-stage build, nginx serving + /api proxy (ADR 0004)
  index.html                 the one page
  src/
    entries/app.tsx          mounts React (no logic)
    App.tsx                  asks the server who is signed in → LoginPage or the shell
    api/client.ts            the only place that calls fetch (same origin, CSRF header)
    auth/authApi.ts          signIn, signOut, currentUser
    styles/                  GLOBAL layer only: tokens, font, reset, shared primitives
      mcait/                 MCAIT design-system tokens (reused from the reference)
      datalytics-theme.css   Datalytics product theme: teal accent, dark mode, sizes
      fonts.css              self-hosted Inter
      base.css               token bridge, reset, .btn, input, .card, helpers
    components/              reusable building blocks
      brand/                 BrandMark (D tile + wordmark), AiMascot
      layout/                AppShell, Sidebar, TopBar, navigation.ts (sidebar data)
      ui/                    PreviewNote
    pages/                   one folder per page; page-only parts live inside it
      home/                  HomePage, Hero, StatTiles, GetStarted, ContinueSection
      login/                 LoginPage, LoginForm, loginValidation, BrandIllustration
      users/                 UsersPage, UserRow, CreateUserForm, usersApi (admins only)
    test/                    test setup and shared test helpers
    assets/fonts/            Inter woff2 + licence
```

### Rules
1. **One component per file, styles next to it.** `Sidebar.tsx` + `Sidebar.module.css`.
   Class names in a CSS Module are scoped automatically, so styles cannot leak between
   components ([ADR 0002](decisions/0002-css-modules-on-design-tokens.md)).
2. **Global CSS is only tokens and primitives.** Colours, spacing, radii and fonts come
   from CSS variables (`var(--accent)`, `var(--dl-4)`…). No hard-coded colours in components.
3. **Data drives repeated UI.** The sidebar renders from `navigation.ts`; a new item is
   one object, not new markup.
4. **No hidden global state.** No `window` custom events, no module-level mutable state.
   Data is passed through props, or later a React context or query cache when a feature
   needs it.
5. **Pages compose, components render.** A page file arranges sections; each section is a
   small component that can later receive real data through props.
6. **Accessibility is part of done.** Landmarks, labels, `aria-current`, visible focus, and
   axe checks in tests.
7. **Logical CSS properties** (`inline-size`, `margin-inline-start`) so RTL/Arabic support
   can be added without rewriting layouts.

### Libraries planned later (each only with the feature that needs it)
| Need | Library | Feature |
|---|---|---|
| Routing | react-router | Navigation |
| Server data, caching, loading/error state | TanStack Query | When several pages share server data |
| HTTP | `fetch` wrapper in `src/api/client.ts` (done; no axios) | — |
| Charts | Recharts (as in the reference), to be evaluated | Dashboards |

Not planned: Tailwind or a UI kit (MUI, shadcn…). They would replace the MCAIT tokens and
change the Datalytics look ([ADR 0002](decisions/0002-css-modules-on-design-tokens.md)).

### Running it
`npm run dev` for development (http://localhost:3002, hot reload, `/api` forwarded to
http://localhost:8000); `docker compose up --build` for everything behind nginx
([ADR 0004](decisions/0004-docker-nginx-static-serving.md)).

### Responsive behaviour
| Width | Sidebar | Top bar |
|---|---|---|
| ≥ 900px | full, 248px, labels | title, search field, icons, account |
| 600–899px | icon rail, 56px (labels kept for screen readers) | compact search, no labels |
| < 600px | hidden | brand mark + menu icon (drawer comes with navigation) |

## Backend

### Stack
Python 3.12 · FastAPI · SQLAlchemy 2 (async, asyncpg) · PostgreSQL 16 · Alembic ·
pydantic-settings · bcrypt · PyJWT · pytest + httpx · ruff.
Why: [ADR 0006](decisions/0006-backend-stack-and-authentication.md).

### Folder structure
```
backend/
  Dockerfile                 runs migrations, then uvicorn (non-root, read-only)
  requirements.txt           runtime, exact versions; requirements-dev.txt adds test tools
  alembic/versions/          reviewed migrations (0001_users)
  app/
    main.py                  builds the app: settings check, first admin, CSRF guard, routers
    config.py                every setting from environment variables
    database.py              engine, session per request (get_db), Base
    security.py              bcrypt, session JWT, cookie helpers (no database)
    ownership.py             THE data rule: owner sees own, admin sees all (ADR 0007)
    auth/
      router.py              /api/auth: login, logout, me
      dependencies.py        current_user (401) and require_admin (403)
    users/
      models.py              users table
      schemas.py             request/response shapes (never includes the hash)
      repository.py          queries only
      service.py             rules: authenticate, create, update, first admin
      router.py              /api/users (admin only)
  tests/                     one file per area; SQLite by default, PostgreSQL via TEST_DATABASE_URL
```

### Rules
1. **Layers:** router (HTTP only) → service (rules, no HTTP) → repository (SQL only).
2. **One package per feature** (`auth/`, `users/`, later `connections/`, `dashboards/`).
3. **Thin `main.py`:** create the app, register routers, nothing else.
4. **Configuration from environment variables.** No secrets in code; weak secrets stop startup.
5. **Schemas at the boundary:** request/response models validate all input; responses
   never include password hashes.
6. **Explicit errors:** services raise `UserError` (or a feature's own error) and routers
   turn it into a 4xx. No broad `except`.
7. **Ownership everywhere:** every owned table uses `Owned` + `visible_to` / `can_access`.
8. **Tests per layer**, plus authorization tests for every protected route (signed out →
   401, normal user → 403/404).
9. **Migrations are reviewed** before they run; no destructive schema change without approval.
