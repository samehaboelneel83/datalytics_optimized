# Feature 02: Authentication and users

- Branch: not committed yet (to be pushed by the owner)
- Status: built, checks pass, **awaiting owner review**
- Date: 2026-10-19
- Decisions: [ADR 0006](../decisions/0006-backend-stack-and-authentication.md) (stack + login),
  [ADR 0007](../decisions/0007-per-user-data-ownership.md) (per-user data).
  Supersedes [ADR 0005](../decisions/0005-login-preview-mode.md) (preview login).

## Objective
The login page is the first page. A login is accepted only if the email and password
match a user in the database; then Home appears. Two fixed roles: user and administrator.
Every user's data is their own; administrators see everyone's. Administrators manage
users in the app. The app runs on port **3002**.

## Scope
**In:** backend (FastAPI, PostgreSQL, Alembic), login / logout / "who am I", HttpOnly
cookie session, first admin from settings, admin Users page (list, add, make/remove
admin, disable/enable, reset password), the ownership rule and its tests, single-entry
frontend (login → Home), Docker Compose with three services, port 3002.

**Out:** custom roles and permissions, organisations, SSO, self sign-up, forgot / change
own password, login rate limiting, deleting users, router and real URLs, any data
feature (connections, dashboards).

## How it works
1. The browser loads `/`. `App.tsx` calls `GET /api/auth/me`.
2. 401 → the login page. 200 → the signed-in shell with Home.
3. Sign in → `POST /api/auth/login`. The backend lower-cases the email, checks the bcrypt
   hash, and sets an HttpOnly cookie. Wrong password / unknown email / disabled account
   all answer "Invalid email or password.".
4. Admins see **Users** in the sidebar (Admin section). Normal users don't, and the API
   answers 403 if they try.
5. Sign out (icon at the top right) → `POST /api/auth/logout` → login page.
6. If an admin disables a user or resets their password, that user's open sessions stop
   working on their next request.

## What was built
| File | Responsibility |
|---|---|
| `backend/app/main.py` | App factory: settings check, first admin, CSRF guard, routers |
| `backend/app/config.py` | Settings from environment; refuses a weak `SECRET_KEY` |
| `backend/app/security.py` | bcrypt, session JWT, cookie |
| `backend/app/ownership.py` | `Owned`, `visible_to`, `can_access` |
| `backend/app/auth/*` | `/api/auth` routes; `current_user`, `require_admin` |
| `backend/app/users/*` | users table, schemas, repository, service rules, `/api/users` |
| `backend/alembic/versions/0001_users.py` | the users table migration |
| `backend/Dockerfile` | migrate, then run uvicorn as a non-root user |
| `frontend/src/App.tsx` | session check → LoginPage or AppShell; Home / Users view |
| `frontend/src/api/client.ts` | the only `fetch`: same origin, CSRF header, errors |
| `frontend/src/auth/authApi.ts` | signIn, signOut, currentUser |
| `frontend/src/pages/login/LoginForm.tsx` | now calls the server; shows its answer; busy state |
| `frontend/src/pages/users/*` | Users page, row actions, add-user form, API calls |
| `frontend/src/components/layout/*` | sidebar items with a page are clickable; admin-only items; email + Sign out in the top bar |
| `frontend/nginx.conf` | forwards `/api/` to the backend |
| `frontend/vite.config.ts` | dev server on 3002, `/api` forwarded to :8000 |
| `docker-compose.yml`, `.env.example` | postgres + backend + frontend; required secrets |

`login.html`, `entries/home.tsx` and `entries/login.tsx` were removed (one entry now).

## Differences from the reference
| Area | Reference | Here | Why |
|---|---|---|---|
| Roles | Organisations, custom roles, org units, platform super-admin | `is_admin` true/false | Owner: no custom privileges |
| Password hashing | passlib + bcrypt with a compatibility patch | bcrypt directly | passlib is unmaintained |
| JWT | python-jose | PyJWT | better maintained |
| Session | HttpOnly cookie + CSRF header (T6) | same | reused as is |
| Timing-safe login | dummy hash for unknown emails | same | reused |
| Revocation | `tokens_valid_after` on password reset | `sessions_valid_after` on reset **and** disable | disabled users should be out at once |
| First admin | created with an organisation via admin API / demo seed | from `ADMIN_EMAIL`/`ADMIN_PASSWORD` when no users exist | simplest safe bootstrap |
| `main.py` | ~1,090 lines | ~60 lines | feature packages |
| Data visibility | org scope + row-level rules | owner or admin (`ownership.py`) | owner's rule |

## Tests and results

### Executed and passed (cloud workspace)
| Check | Command | Result |
|---|---|---|
| Backend lint | `ruff check .` | passed |
| Backend tests, SQLite | `pytest` | **44 passed** |
| Backend tests, PostgreSQL 16 | `TEST_DATABASE_URL=… pytest` | **44 passed** |
| Frontend lint / types | `npm run lint`, `npm run typecheck` | passed |
| Frontend tests | `npm test` | **64 passed** (8 files) |
| Frontend build | `npm run build` | passed |
| Compose file | `docker compose config` | valid; refuses to start without the secrets |

Mutation checks: making `visible_to` return everything fails the ownership test;
removing the admin check in `require_admin` fails 4 user-management tests.

### End-to-end, executed (real backend on PostgreSQL 16 + Vite on 3002 + Chromium)
1. `/` opens the login page.
2. Wrong password → "Invalid email or password."
3. `Admin@Datalytics.local` (mixed case) + correct password → Home; top bar shows the email
   and "Admin". Cookie is HttpOnly, path `/api`, SameSite=Lax; `document.cookie` is empty
   and localStorage is empty.
4. Reload → still signed in.
5. Users page: added alice; adding her again → "A user with this email already exists."
6. Alice (second browser, phone width) → Home, no Users item; `GET /api/users` → 403.
7. Admin disables alice → alice's `/api/auth/me` → 401; her reload shows the login page.
8. A POST without `X-Requested-With` → 403.
9. Sign out → login page, and still signed out after reload.
10. axe in real Chromium (contrast included): 0 violations on the login and Users pages.

Screenshots: `screenshots/02-*.png`.

### Not executed
- `docker compose up` of this version (Docker Hub is blocked in the cloud workspace; the
  owner's machine built the previous frontend image successfully).

- Firefox / Safari, real phones.

### Needs manual verification by the reviewer
- `docker compose up --build` with a filled-in `.env`, then the 9 steps above.

## Known limitations
- No login rate limiting: **required before exposing the app to the internet.**
- No "forgot password" or "change my password"; an admin resets passwords.
- No router: the URL stays `/` on every page; Back does not switch pages.
- Home still shows the static first-run layout (no data features yet).
- Signing out clears the browser cookie; a copied token stays valid until it expires (12 h).

## What to inspect before approving
1. `backend/app/users/service.py`: all user rules in one place.
2. `backend/app/ownership.py`: the per-user data rule every future feature will use.
3. `backend/tests/test_users.py`: who may do what.
4. `frontend/src/App.tsx`: login first, Home after the server says yes.
5. `docker-compose.yml` + `.env.example`: what you must set.

## Next
Navigation (router + real URLs), then the first owned data feature (upload or
connections), which will be the first real table using `Owned`.
