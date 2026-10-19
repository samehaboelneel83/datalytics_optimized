# Architecture

## Overview (target)

```
frontend/  React SPA  ──HTTP/JSON──>  backend/  API  ──>  database + data sources
```

Only the **frontend** exists today, and it is static. The backend will be designed
when its first feature starts. The rules below already apply to it.

## Frontend

### Stack
React 18 · TypeScript (strict) · Vite 7 · lucide-react icons · CSS Modules on top of
global design tokens · Vitest + Testing Library + axe-core · ESLint.
Why this stack: [ADR 0001](decisions/0001-frontend-stack.md).

### Folder structure
```
frontend/
  index.html                 page entry: Home
  login.html                 page entry: Login
  src/
    entries/                 one tiny file per page that mounts React (no logic)
      home.tsx  login.tsx
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
      login/                 LoginPage, BrandIllustration
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
| Server data, caching, loading/error state | TanStack Query | First API feature |
| HTTP | `fetch` wrapper in `src/services/` (axios only if needed) | First API feature |
| Charts | Recharts (as in the reference), to be evaluated | Dashboards |

Not planned: Tailwind or a UI kit (MUI, shadcn…). They would replace the MCAIT tokens and
change the Datalytics look ([ADR 0002](decisions/0002-css-modules-on-design-tokens.md)).

### Responsive behaviour
| Width | Sidebar | Top bar |
|---|---|---|
| ≥ 900px | full, 248px, labels | title, search field, icons, account |
| 600–899px | icon rail, 56px (labels kept for screen readers) | compact search, no labels |
| < 600px | hidden | brand mark + menu icon (drawer comes with navigation) |

## Backend (planned, not built)
The reference backend is FastAPI + SQLAlchemy (async) + PostgreSQL + Alembic. Its
`app/main.py` alone is ~1,090 lines, which is the kind of concentration we avoid.
The rebuild's backend design will get its own ADR. The intended rules:

1. **Layers:** `routers/` (HTTP only: parse, validate, call a service, shape the response)
   → `services/` (business rules, no HTTP) → `repositories/` (database access only).
2. **One module per feature** (`auth/`, `datasets/`, `connections/`…), each holding its
   own router, service, schemas and tests, instead of one giant file per layer.
3. **Thin `main.py`:** create the app, register routers, nothing else.
4. **Configuration from environment variables** via a typed settings object. No secrets
   in code or in the repository.
5. **Schemas at the boundary:** request/response models validate all input.
6. **Explicit errors:** no broad `except` that hides failures.
7. **Tests per layer:** unit tests for services, API tests for routers, database tests
   for repositories, plus authorization tests for every protected route.
8. **Migrations are reviewed** before they run; no destructive schema change without
   approval.
