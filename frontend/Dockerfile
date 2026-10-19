# syntax=docker/dockerfile:1

# ---- Stage 1: build the static site ----------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Copy only the dependency files first, so the (slow) install is cached and
# re-runs only when package.json / package-lock.json change.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# `npm run build` = type-check + Vite production build -> /app/dist
RUN npm run build

# ---- Stage 2: serve it with nginx ------------------------------------------
# The "unprivileged" nginx image runs as a normal user (not root) and listens
# on 8080. Only the built files are copied: no Node, no source, no node_modules.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
