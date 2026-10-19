# ADR 0002: CSS Modules on top of global design tokens

- Status: Proposed (awaiting owner approval with the milestone-1 PR)
- Date: 2026-10-19

## Context
The reference styles everything from one ~3,200-line global `index.css` plus inline
styles in several components. Global class names collide and dead rules cannot be found
safely. Its token layer (MCAIT + Datalytics theme) is good and defines the brand.

## Decision
- **Global CSS** (`src/styles/`) holds only tokens, the font, the reset and a few shared
  primitives (`.btn`, input, `.card`, helpers).
- **Every component has its own `*.module.css`** next to it. Vite scopes the class names,
  so a component's styles cannot affect anything else.
- Components use token variables only, never hard-coded colours (two documented
  exceptions: the mascot's fixed illustration colours).

## Alternatives considered
- **Tailwind CSS:** would duplicate or replace the MCAIT token system and turn the
  existing CSS into utility classes. Large rewrite, no visual gain. Rejected.
- **Component library (MUI, shadcn/ui, Chakra):** brings its own look and theming model,
  which conflicts with "preserve the Datalytics design". Rejected.
- **CSS-in-JS (styled-components, emotion):** runtime cost and a new dependency for what
  CSS Modules does at build time. Rejected.
- **Keep one global stylesheet:** repeats the reference's problem. Rejected.

## Consequences
Deleting a component deletes its styles. No new dependency (CSS Modules are built into
Vite). Developers must use tokens rather than literal values.
