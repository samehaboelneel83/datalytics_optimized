# ADR 0004: Docker with a multi-stage build served by nginx

- Status: Proposed (awaiting owner approval)
- Date: 2026-10-19

## Context
The team needs one command that runs the app the same way on every machine, and a
starting point for later deployment. Today the app is only static files.

## Decision
- `frontend/Dockerfile`, two stages: (1) `node:22-alpine` runs `npm ci` and
  `npm run build`; (2) `nginxinc/nginx-unprivileged:1.27-alpine` serves only `dist/`.
  The final image has no Node, no source and no `node_modules`.
- `docker-compose.yml` at the repo root, one service now (`frontend`), published on
  `${FRONTEND_PORT:-8080}`. Backend and database services are added by their features.
- Container hardening: non-root user, `read_only` filesystem with a `/tmp` tmpfs,
  all Linux capabilities dropped, `no-new-privileges`.
- `frontend/nginx.conf`: gzip, long cache for hashed `/assets/`, `no-cache` for HTML,
  `/healthz` for the health check, and security headers including a strict
  Content-Security-Policy (same-origin only). Unknown paths return a real 404 (no
  router yet).
- `npm run dev` stays the way to develop (hot reload); Docker is for running the built app.

## Alternatives considered
- **Serve with `vite preview` in a Node image:** larger image, not meant for production.
- **Dev container with hot reload in Compose:** useful later; not needed while
  `npm run dev` works. Can be added as a Compose profile.
- **Caddy / Node static server:** fine too; nginx is the most widely known by the team.

## Consequences
- When routing arrives, nginx must fall back to `index.html` for app routes
  (`try_files $uri /index.html`); the config has a comment marking where.
- The CSP must be revisited when external services (APIs on another origin) are added
  (`connect-src`).
- Verified so far: see the feature note (the image build itself still needs a run on a
  machine with Docker).
