# Feature 01: Static UI foundation

- Branch: `feature/static-ui-foundation`
- Status: implemented, checks pass, **awaiting owner review**. First version pushed to `origin/emad` by the owner; later additions (preview-mode login, Docker) are not committed. Not merged.
- Date: 2026-10-19
- **Later changed by [feature 02](02-authentication-and-users.md):** one page entry instead of two, and the login checks the database. This note describes feature 01 as built.

## Objective
Give the new app its visual foundation: the Datalytics design tokens, a login page,
the signed-in shell (sidebar + top bar) and the home page. It matches the reference
app's current look and does nothing yet.

## Scope
**In:** design tokens and font, login page, app shell, sidebar with the high-priority
items, home page (first-run state), responsive layout, accessibility basics, tests, docs.

**Out (explicitly):** authentication, API calls, database, routing, working navigation,
theme/language switching, dashboards, charts, AI.

**Added after the first push:** the login form works in the browser in *preview mode*
(validation + hand-off to Home, no account check: [ADR 0005](../decisions/0005-login-preview-mode.md)),
and the app runs with `docker compose up --build` ([ADR 0004](../decisions/0004-docker-nginx-static-serving.md)).

## Sidebar (high priority only)
Home · Ask AI · **Data:** Datasets · **Data sources:** Upload, Connections ·
**Analyse:** Dashboards, Insights · **Admin:** Settings.
The other reference items are deferred (list in [REFERENCE_ANALYSIS.md](../REFERENCE_ANALYSIS.md)).

## What was built
| File | Responsibility |
|---|---|
| `frontend/index.html`, `login.html` | The two page entries (no router: [ADR 0003](../decisions/0003-static-pages-without-router.md)) |
| `src/entries/home.tsx`, `login.tsx` | Mount React for each page; no logic |
| `src/styles/mcait/*`, `datalytics-theme.css` | Design tokens reused from the reference |
| `src/styles/base.css` | Token bridge, reset, `.btn`, input, `.card`, preview note, a11y helpers |
| `src/components/layout/navigation.ts` | Sidebar items as data |
| `src/components/layout/Sidebar.tsx` | The rail: brand, sections, items, current-page marker |
| `src/components/layout/TopBar.tsx` | Page title and placeholder search, theme, bell, account |
| `src/components/layout/AppShell.tsx` | Frame: skip link + sidebar + top bar + scrolling main |
| `src/components/brand/BrandMark.tsx`, `AiMascot.tsx` | Logo tile + wordmark; Ask AI mascot |
| `src/components/ui/PreviewNote.tsx` | "UI preview, not connected yet" label |
| `src/pages/home/*` | `HomePage` arranges `Hero`, `StatTiles`, `GetStarted`, `ContinueSection` |
| `src/pages/login/*` | `LoginPage` (layout), `LoginForm` (state + validation UI), `loginValidation.ts` (pure rules), static `BrandIllustration` |
| `frontend/Dockerfile`, `nginx.conf`, `docker-compose.yml` | Build and serve the site in a container |
| `src/test/*` | Test setup, axe helper, shared "no interactive behaviour" assertion |

Every component has a matching `*.module.css` ([ADR 0002](../decisions/0002-css-modules-on-design-tokens.md)).

## How "static" is enforced
**Home:**
- No `<form>`, so nothing can submit or reload the page.
- Every button is `type="button"` and `disabled`, with the tooltip "Not available yet".
  Disabled buttons keep their full colour so the design reads correctly.
- Every input is `disabled`.

**Login (preview mode):** the only live part is `LoginForm`. It validates locally and calls
`onContinue(email)`; `entries/login.tsx` opens Home. Tests assert nothing is sent over
the network and nothing is stored. Single sign-on and the theme switch stay disabled.
`LoginForm` has `noValidate` and `preventDefault`, so the browser never submits it natively.

**Both pages:**
- Sidebar items are plain text, not links or buttons. Only the current one is marked
  (`aria-current="page"`).
- Each page shows a "UI preview" note.
- Home stat tiles show "—" / "Not connected yet". No invented numbers.
- `src/test/staticChecks.ts` asserts all of the above in every page test.

## Differences from the reference
| Area | Reference | Here | Why |
|---|---|---|---|
| Styling | ~3,200-line global `index.css` + inline styles | Tokens global, CSS Module per component | Isolation, readability |
| Shell | `Layout.tsx` with theme, storage, drawer, window events | Presentational `AppShell`/`Sidebar`/`TopBar` | One job per file; state comes with features |
| Sidebar | 30+ items, folding sections, permission gating | 8 items, no folding, no gating | High priority only; behaviour comes with navigation/auth |
| Phone sidebar | Drawer opened by a menu button | Hidden; menu icon shown disabled | The drawer is interactive, so it belongs to the navigation feature |
| Top bar | Breadcrumbs, search palette, LLM picker, language, theme, bell, account menu | Title + disabled search, theme, bell, account | LLM picker and language come with their features |
| Login | Validation, SSO discovery, caps-lock hint, language/theme switch, animated illustration, real sign-in | Same layout, same validation messages, show/hide password, Caps Lock hint; **no account check** (opens Home); SSO/theme disabled; static illustration | Backend does not exist yet; animations are unnecessary motion |
| Home | Live data, 8 API calls, greeting by time of day, user's name | First-run layout, fixed "Welcome to Datalytics", no data | No backend; no fake data |
| Fonts | Inter + IBM Plex Arabic + Syne/Manrope/JetBrains Mono | Inter only | Others return with RTL/feature needs |

## Tests and results

### Automated: executed in the cloud workspace **and** on the owner's machine (Node 22, npm 10.9.8)
| Check | Command | Result |
|---|---|---|
| Install | `npm ci` | passed (`npm audit` in the cloud workspace: 0 vulnerabilities) |
| Lint | `npm run lint` | passed, 0 problems |
| Types | `npm run typecheck` | passed |
| Tests | `npm test` | **18 passed, 0 failed** (4 files) at the first version. After adding preview-mode login: **36 passed** (5 files), executed in the cloud workspace; re-run on the owner's machine: see the PR |
| Build | `npm run build` | passed |

Test files: `navigation.test.ts` (4), `Sidebar.test.tsx` (3), `HomePage.test.tsx` (6),
`LoginPage.test.tsx` (5). They cover: the agreed sidebar items and sections; exactly one
current item; no links or focusable sidebar items; page headings and sections; the preview
notes; no invented metrics; the static guarantee; axe accessibility checks.
The static-guarantee test was checked by mutation: re-enabling one login button made it fail.

### Browser checks: executed in headless Chromium (cloud workspace)
- Widths 1440, 820 and 390px, both pages: no console errors, **no horizontal overflow**.
- axe-core in the real browser (including colour contrast): **0 violations** on both pages
  at all three widths, after fixing one finding (the scrolling `<main>` had to be
  keyboard-focusable: `tabIndex={0}`).
- Clicking every button, sidebar item and input: the URL never changed. The only focusable
  elements are the skip link and the scrolling main area.
- Screenshots: `screenshots/` (new pages, plus the reference for comparison).

### Docker
- Executed: `docker compose config` (valid); clean-copy `npm ci && npm run build` following
  the Dockerfile steps; the built site served with the same CSP as `nginx.conf` in headless
  Chromium: no console errors, no blocked resources, Inter loads, unknown path gives 404,
  login submit opens Home.
- **Not executed:** `docker build`, `docker compose up`, the real nginx config test, the
  health check, and running with `read_only` + unprivileged nginx. The cloud workspace has no
  Docker daemon. **You must run `docker compose up --build` once and open `http://localhost:8480/`.**

### Needs manual verification by the reviewer
- Visual comparison with the running reference app on your own screen, side by side.
- Real devices (phone, tablet) and browsers other than Chromium (Firefox, Safari).
- Keyboard pass: Tab shows the skip link first and it jumps to the content.

## Known limitations
- Two separate HTML pages; you open `/login.html` by URL. This is intentional until navigation.
- Phone layout has no way to reach other sections (the drawer comes with navigation).
- Light theme only. Dark tokens exist but there is no toggle.
- English and LTR only. Logical CSS properties are used so RTL can be added later.
- Long Ask AI placeholder is cut with an ellipsis on phones (the reference cuts it too).
- `package-lock.json` was created with npm 11. `npm ci` works on npm 10, but adding
  packages with npm 10 hit an npm internal error (see DEVELOPMENT_WORKFLOW.md).

## What to inspect before approving
1. Run it: `cd frontend && npm ci && npm run dev`, then open `/` and `/login.html`; or `docker compose up --build` and open `http://localhost:8480/`.
2. Compare with the reference screenshots in `screenshots/`.
3. Read `navigation.ts`: is the sidebar list right?
4. Skim `Sidebar.tsx` + `Sidebar.module.css` as the pattern every component follows.
5. Read `src/test/staticChecks.ts` (Home guarantee) and the "sends nothing" test in `LoginPage.test.tsx` (login guarantee).
6. Decide on preview-mode login ([ADR 0005](../decisions/0005-login-preview-mode.md)): keep it, or revert to the fully disabled form.

## Next
Feature 02, **Navigation**: `react-router`, real sidebar links, mobile drawer,
placeholder pages per destination, and merge the two HTML entries into one app.
