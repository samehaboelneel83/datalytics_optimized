# Reference analysis

Reference: `data_analysis_dashboard_ai-` at commit `df78c21` (main, 2026-10-16).
Frontend: `AI_data_tool/data_analytics/frontend`. Backend: `AI_data_tool/data_analytics/backend`.

## How the current look was verified
The PNGs in the reference `screenshots/` folder are **outdated**: they show an older blue
identity and an older login card. The current UI (teal MCAIT theme, split-screen login)
was captured by running the reference frontend locally with stubbed API responses and
screenshotting it in headless Chromium. Those captures are the visual target for
milestone 1.

## Frontend: what is good (reused)
| Item | Reference file | Used as |
|---|---|---|
| MCAIT tokens (colours, spacing, type) | `src/styles/mcait/*.css` | copied as-is to `src/styles/mcait/` |
| Datalytics theme (teal accent, dark mode, sizes) | `src/styles/datalytics.css` | copied, table and RTL-chart sections removed |
| Inter font, self-hosted | `src/assets/fonts/` | copied with its licence |
| Token bridge, `.btn`, inputs, `.card` | `src/index.css` | adapted into `src/styles/base.css` |
| Navigation as data | `src/components/navigation.ts` | same idea, trimmed list, no routes yet |
| Rail visuals | `.dl-rail*` in `src/index.css` | `Sidebar.module.css` |
| Login layout + illustration | `pages/Login.tsx`, `pages/login.css`, `components/auth/BrandIllustration.tsx` | `pages/login/*`, static |
| Home first-run sections | `pages/Home.tsx`, `pages/home/parts.tsx`, `home.css` | `pages/home/*`, static |
| AI mascot | `components/ai/AiMascot.tsx` | `components/brand/AiMascot.tsx`, static |

## Frontend: weaknesses found (not copied)
1. **`src/index.css` is ~3,200 lines of global CSS.** Any rule can affect any page. → CSS
   Modules per component, globals limited to tokens and primitives.
2. **`TopBar.tsx` styles mostly inline** (`style={{…}}`). Hard to read and theme. → classes
   in `TopBar.module.css`.
3. **`Layout.tsx` (~320 lines) mixes many concerns**: theme, rail width, drawer, folds,
   localStorage, window events. → presentational `AppShell` / `Sidebar` / `TopBar`. State
   is added back in small pieces with the features that need it.
4. **Cross-component communication via `window` custom events**
   (`datalytics:toggle-theme`, `datalytics:builder-compact`, …). Hidden coupling. → props
   and context only.
5. **Pages fetch data directly** (`Home.tsx` calls 8 endpoints with a hand-written
   `useSlot` hook). → a services layer and TanStack Query when data arrives.
6. **Outdated screenshots** in the repo can mislead reviewers.

## Backend (first look only; to be analysed before backend work)
FastAPI + SQLAlchemy async + PostgreSQL + Alembic; ~380 Python modules outside tests;
`app/main.py` is ~1,090 lines. Folder split by layer (`routers/`, `services/`, `models/`,
`schemas/`). Detailed analysis is part of the backend-skeleton feature.

## Sidebar: reference vs milestone 1
| Reference section | Reference items | Milestone 1 |
|---|---|---|
| (top) | Home, Ask AI | Home, Ask AI |
| Data | Datasets, Lineage, Glossary, Dataflows | Datasets |
| Data sources | Upload, Connections | Upload, Connections |
| Analyse | Dashboards, My dashboards, Templates, Insights, Automations, Migration | Dashboards, Insights |
| Monitoring (admin) | Refresh & jobs, Deliveries, Activity | — |
| Admin (admin) | Settings + 13 security/config pages | Settings |
| Platform (super admin) | Organizations, Platform settings | — |
