# Testing strategy

## Tools
- **Vitest** test runner, **jsdom** browser simulation.
- **Testing Library** renders components and finds elements the way a user would
  (by role, label and text), not by CSS class.
- **axe-core** automatic accessibility checks inside the tests.
- **ESLint** + **TypeScript (strict)** static checks.

## What each kind of test is for
| Kind | Used for | Example in this repo |
|---|---|---|
| Unit | Plain data and logic | `navigation.test.ts`: the sidebar holds exactly the agreed items |
| Component | A component renders the right content and roles | `Sidebar.test.tsx`, `HomePage.test.tsx`, `LoginPage.test.tsx` |
| Accessibility | No detectable WCAG problems | axe run in each page test |
| Static guarantee (milestone 1) | Nothing can trigger an action | `src/test/staticChecks.ts`: no `<form>`, all buttons `type="button"` and disabled, all inputs disabled, only in-page links |
| Browser checks | Layout, contrast, real rendering | Manual or scripted Chromium run at 1440 / 820 / 390px (see feature note) |

Later features add API tests, database tests, authorization tests and end-to-end tests.

## Known limits of jsdom
jsdom does not lay out pages or apply CSS, so **colour contrast, responsive layout and
scroll behaviour must be checked in a real browser.** For milestone 1 that was done with
headless Chromium (axe including contrast, horizontal-overflow check, screenshots).

## Reporting rule
Always report tests as: executed and passed / executed and failed / not executed /
needs manual verification. A passing count alone does not prove correctness.
