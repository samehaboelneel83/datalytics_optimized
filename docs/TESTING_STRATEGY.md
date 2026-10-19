# Testing strategy

## Tools
- **Vitest** test runner, **jsdom** browser simulation.
- **Testing Library** renders components and finds elements the way a user would
  (by role, label and text), not by CSS class.
- **axe-core** automatic accessibility checks inside the tests.
- **ESLint** + **TypeScript (strict)** static checks.
- Backend: **pytest** + **httpx** (calls the real FastAPI app in-process), **ruff** lint.
  Each test gets an empty database: in-memory SQLite by default, PostgreSQL when
  `TEST_DATABASE_URL` is set.

## What each kind of test is for
| Kind | Used for | Example in this repo |
|---|---|---|
| Unit | Plain data and logic | `navigation.test.ts`: the sidebar holds exactly the agreed items |
| Component | A component renders the right content and roles | `Sidebar.test.tsx`, `HomePage.test.tsx`, `LoginPage.test.tsx` |
| Accessibility | No detectable WCAG problems | axe run in each page test |
| Static guarantee (Home) | Nothing can trigger an action | `src/test/staticChecks.ts`: no `<form>`, all buttons `type="button"` and disabled, all inputs disabled, only in-page links |
| Login form | Browser validation, server error shown, busy state, nothing stored in the browser | `LoginPage.test.tsx`, `loginValidation.test.ts` |
| App flow | Login first; Home only after the server accepts; sign out; admin-only Users | `App.test.tsx` with `src/test/fakeServer.ts` (same routes and status codes as the API) |
| API (backend) | Every endpoint, success and failure | `backend/tests/test_auth.py`, `test_users.py` |
| Authorization (backend) | Signed out → 401, normal user → 403 on every admin route | `test_users.py` (parametrised over all routes) |
| Data ownership (backend) | User sees own records only, admin sees all | `test_ownership.py` |
| Security (backend) | bcrypt, forged / expired / unsigned tokens, weak SECRET_KEY, CSRF header, session revocation | `test_security.py`, `test_auth.py` |
| Migrations | `alembic upgrade head` creates exactly the model's columns | `test_migrations.py` |
| End-to-end | Real browser + real backend + PostgreSQL | scripted Chromium run (see feature 02 note) |
| Browser checks | Layout, contrast, real rendering | Manual or scripted Chromium run at 1440 / 820 / 390px (see feature note) |


## Known limits of jsdom
jsdom does not lay out pages or apply CSS, so **colour contrast, responsive layout and
scroll behaviour must be checked in a real browser.** For milestone 1 that was done with
headless Chromium (axe including contrast, horizontal-overflow check, screenshots).

## Reporting rule
Always report tests as: executed and passed / executed and failed / not executed /
needs manual verification. A passing count alone does not prove correctness.
