# Development workflow

## Branches
- `main`: stable, reviewed code only. Nobody pushes to it directly.
- `feature/<name>`: one feature (e.g. `feature/static-ui-foundation`).
- `fix/<name>`: one bug fix.
- `docs/<topic>`: documentation-only changes.

## Steps for every feature
1. Agree the task and acceptance criteria (feature note in `docs/features/`).
2. Update from `main`: `git switch main && git pull`.
3. Create the branch: `git switch -c feature/<name>`.
4. Implement only the agreed scope.
5. Add or update tests.
6. Run the checks (from `frontend/`):
   ```bash
   npm run lint && npm run typecheck && npm test && npm run build
   ```
7. Review your diff (`git diff --stat`, `git diff`): no unrelated changes, secrets,
   `node_modules`, `dist` or `.env` files.
8. Commit with a meaningful message.
9. Push the branch: `git push -u origin feature/<name>`.
10. Open a PR into `main` with: summary, test results, screenshots, known limitations.
11. Wait for review and the owner's explicit approval before merging.

Never: force-push shared branches, rewrite history, delete others' branches, or commit
secrets or production data.

## Installing dependencies
Use `npm ci` (installs exactly what `package-lock.json` says). Only the person adding
or upgrading a dependency runs `npm install <pkg>`, and the lockfile change goes in the
same PR with a reason in the description.

Note: `package-lock.json` was generated with npm 11. `npm install` with npm 10 on this
dependency set failed with an internal npm error (`Cannot read properties of null
(reading 'edgesOut')`) when the lockfile was being created. `npm ci` from the existing
lockfile does not hit that path. If you need to change dependencies, use npm 11
(`npx npm@11 install …`).

## Backend dependencies
Exact versions in `backend/requirements.txt` (runtime) and `requirements-dev.txt` (tests,
lint). Add a package by pinning its exact version there, then
`pip install -r requirements-dev.txt` and run `ruff check . && pytest`.

## Database changes
Every schema change is an Alembic migration in `backend/alembic/versions/`, written or
reviewed by hand, plus a test. `test_migrations.py` checks the migration matches the model.
