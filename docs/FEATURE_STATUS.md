# Feature status

_Last updated: 2026-10-19_

## Summary
- **Feature 01, static UI foundation:** pushed by the owner to `origin/emad` (commit
  `0b760c1`), awaiting review. Not merged into `main`.
- **Feature 02, authentication and users:** built and verified in the working folder,
  **not committed or pushed yet**. Login against PostgreSQL, Home after sign-in, admin
  Users page, per-user data rule, Docker Compose with postgres + backend + frontend on
  port 3002.

| Feature | Branch | Status | Notes |
|---|---|---|---|
| 01 Static UI foundation | `emad` | Pushed, awaiting review | [note](features/01-static-ui-foundation.md) |
| 02 Authentication and users | not committed | Built, checks pass, awaiting review | [note](features/02-authentication-and-users.md) |

## Next recommended feature
**Navigation:** `react-router`, real URLs for Home and Users, mobile drawer, placeholder
pages. Then the first owned data: **file upload / connections**, which will be the first
real tables to use the ownership rule.
