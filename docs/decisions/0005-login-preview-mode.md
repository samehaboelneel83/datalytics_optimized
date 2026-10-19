# ADR 0005: Login runs in "preview mode" (no backend verification)

- Status: **Superseded** by [ADR 0006](0006-backend-stack-and-authentication.md) (real login against the database)
- Date: 2026-10-19

## Context
The owner asked for the old project's login page without backend verification, so the
login can be used in the browser before the backend exists. The project rule for
milestone 1 was "no fake authentication", so this needs to be explicit.

## Decision
- The login form works like the reference **in the browser only**: same validation
  messages, show/hide password, Caps Lock hint, focus on the first error.
- When both fields pass validation it calls `onContinue(email)`. In `entries/login.tsx`
  that opens the Home page. **No account is checked.**
- It is deliberately *not* a pretend login: nothing is stored (no token, cookie,
  localStorage or sessionStorage), nothing is sent over the network, no "signed in as"
  state exists, and Home is not protected. The page says "Preview mode — no account is
  checked yet". Tests assert the no-network / no-storage guarantee.
- Single sign-on and the theme switch stay disabled (they need backend/features).
- `onContinue` is the single seam: the authentication feature replaces it with the real
  API call and error handling. `LoginForm` and `LoginPage` do not change.

## Alternatives considered
- **Keep the form fully disabled** (previous state): safe but cannot be demonstrated.
- **Store a fake session so Home looks "logged in":** this would imitate security that
  does not exist and people could rely on it. Rejected.
- **Hard-coded demo credentials:** would put credentials in the source code. Rejected.

## Consequences
- Anyone can reach Home. Acceptable only because Home shows no data. **Remove preview
  mode before any real data or API is added**; the authentication feature must do this.
- The login tests no longer assert "all inputs are disabled"; they assert the
  no-network / no-storage guarantee instead.
