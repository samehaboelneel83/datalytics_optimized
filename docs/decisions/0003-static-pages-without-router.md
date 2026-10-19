# ADR 0003: Milestone 1 pages are separate HTML entries, without a router

- Status: **Partly superseded** (2026-10-19): the two HTML entries were merged into one app
  (`index.html` → `App.tsx`) that shows the login page or the signed-in shell. There is still
  no router; the navigation feature adds one.
- Date: 2026-10-19

## Context
Milestone 1 must show a login page and a home page, but must not implement routing or
navigation behaviour.

## Decision
Two Vite entries: `index.html` (Home) and `login.html` (Login), each mounted by a tiny
file in `src/entries/`. Sidebar items render as plain text with `aria-current` on the
current page. All controls are disabled and each page shows a "UI preview" note.

## Alternatives considered
- **Add react-router now:** that is the navigation feature. Rejected for this milestone.
- **A query-string or state toggle between pages:** would be fake navigation. Rejected.

## Consequences
When the navigation feature lands, `login.html` and `src/entries/` collapse into one
entry with routes. The page components themselves do not change.
