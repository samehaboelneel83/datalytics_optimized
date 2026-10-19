# ADR 0006: Backend stack and authentication

- Status: Proposed (awaiting owner approval)
- Date: 2026-10-19

## Context
The owner asked for a real login: accounts are checked against the database, the login
page is the first page, and Home appears only after a successful sign-in. Roles are
fixed: a normal user or an administrator ("no custom privileges"). Administrators create
users from a Users page.

## Decision
**Stack (same family as the reference, current versions):** Python 3.12, FastAPI,
SQLAlchemy 2 (async) with asyncpg, PostgreSQL 16, Alembic migrations, pydantic-settings.
Passwords with **bcrypt** (called directly, without passlib, which is unmaintained and
needed a workaround in the reference). Session tokens with **PyJWT** (python-jose in the
reference is less maintained).

**Structure:** one package per feature, each with `models / schemas / repository /
service / router`; `main.py` only wires them. Rules live in services, SQL in
repositories, HTTP in routers.

**Authentication, reused from the reference:**
- `POST /api/auth/login` checks the bcrypt hash. Unknown email, wrong password and
  disabled account all answer the same `401 Invalid email or password.` and take the
  same time (a dummy hash is checked for unknown emails).
- The session is a signed JWT (12 h) in an **HttpOnly, SameSite=Lax** cookie on path
  `/api`. Page scripts cannot read it; nothing is kept in localStorage.
- Every write must carry `X-Requested-With` (CSRF guard).
- Emails are stored trimmed and lower-case: one address, one account.
- When an admin resets a password or disables an account, that user's existing sessions
  end at once (`sessions_valid_after`).
- `GET /api/auth/me` tells the frontend who is signed in; `POST /api/auth/logout` clears
  the cookie.

**Users (admin only):** `GET/POST /api/users`, `PATCH /api/users/{id}` (active, admin,
password). No delete: disabling keeps the user's data. Admins cannot remove their own
admin access or disable themselves, which also guarantees at least one admin remains.

**First admin:** created on startup from `ADMIN_EMAIL` / `ADMIN_PASSWORD` only when the
users table is empty. Changing those settings later changes nothing.

**Settings:** all from environment variables. The app refuses to start with a
`SECRET_KEY` shorter than 32 characters. Docker Compose refuses to start without
`POSTGRES_PASSWORD` and `SECRET_KEY`.

**Same origin:** the browser only talks to the web app's origin. Vite (dev) and nginx
(Docker) forward `/api` to the backend, so no CORS and the cookie stays first-party.

## Not reused from the reference (deliberately)
Organisations, custom roles and permissions, org units / row security, SSO / SAML,
API keys, embed tokens, platform super-admin, audit log. The owner asked for two fixed
roles; each of these can come back as its own feature.

## Alternatives considered
- **Token in localStorage + Authorization header:** readable by any injected script;
  the reference moved away from it (T6). Rejected.
- **Server-side session table:** easy revocation of a single session, but one more table
  and a DB read on every request. The JWT + `sessions_valid_after` covers today's needs.
- **Self sign-up:** not in the reference; the owner chose admin-created accounts.

## Consequences
- No login rate limiting yet: brute-force protection must be added before the app is
  exposed to the internet (proposed: per-IP and per-account limits on `/api/auth/login`).
- No "change my own password" or "forgot password" yet.
- A JWT stays valid until it expires if the cookie is copied elsewhere; signing out only
  clears the browser's copy (same as the reference).
