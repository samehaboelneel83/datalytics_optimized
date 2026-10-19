# ADR 0001: Frontend stack

- Status: Proposed (awaiting owner approval with the milestone-1 PR)
- Date: 2026-10-19

## Context
The new repository was empty. The reference frontend uses React 18, Vite, TypeScript,
Vitest and lucide-react, styled with plain CSS on the MCAIT design tokens. The rebuild
must keep the Datalytics look and should not introduce a second framework without reason.

## Decision
Keep the reference's stack, on current tool versions:
React 18.3 · TypeScript 5.9 (strict) · Vite 7 · lucide-react · Vitest 4 + Testing Library
+ axe-core · ESLint 9 with typescript-eslint and react-hooks rules.
No router, HTTP client, state library or chart library until a feature needs one.

## Alternatives considered
- **Next.js:** server rendering is not needed for an internal BI app behind login, and it
  adds a server runtime. Rejected.
- **React 19:** fine technically, but staying on 18 keeps the reference components
  directly portable. Revisit with a dedicated upgrade feature.
- **Mirroring the reference's exact (older) tool versions:** they carry known advisories
  (`npm audit`). Rejected in favour of current patched versions (0 advisories at install time).

## Consequences
Team members who know the reference can read the new code immediately. Libraries are
added deliberately, one ADR or PR note each.
