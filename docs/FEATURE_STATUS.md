# Feature status

_Last updated: 2026-10-19_

## Summary
Milestone 1 (static UI foundation) is implemented on branch
`feature/static-ui-foundation`, pushed by the owner to `origin/emad`, and **waiting for
owner review**. Not merged into `main`. Since the first push it also gained a
preview-mode login ([ADR 0005](decisions/0005-login-preview-mode.md)) and Docker
([ADR 0004](decisions/0004-docker-nginx-static-serving.md)); those are not committed yet.

| Feature | Branch | Status | Notes |
|---|---|---|---|
| Static UI foundation | `feature/static-ui-foundation` | Implemented, checks pass, awaiting review | [feature note](features/01-static-ui-foundation.md) |

## Next recommended feature
**Navigation:** add `react-router`, make the sidebar items real links, add the mobile
drawer and simple placeholder pages for each sidebar destination. Still no backend.
