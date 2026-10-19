# ADR 0007: Every record belongs to a user; admins see all

- Status: Proposed (awaiting owner approval)
- Date: 2026-10-19

## Context
"Each user has their own data saved: their connections, their dashboards and any future
thing. The admin sees all of every other user's data plus his own."

## Decision
One rule, in one file: `backend/app/ownership.py`.
- Every owned table mixes in `Owned`, which adds `owner_id → users.id`.
- Every list query goes through `visible_to(select(Model), Model, user)`: admins get
  everything, users get `WHERE owner_id = :me`.
- Every single-record read/change checks `can_access(record, user)` and answers **404**
  (not 403) when it fails, so users cannot probe which ids exist.
- New records always get `owner_id = current user` on the server; the client never
  sends an owner.

The rule is tested now on a test-only table (`tests/test_ownership.py`). Connections,
dashboards etc. adopt it when they are built; each feature adds its own API tests that a
user cannot list, read or change another user's record.

## Alternatives considered
- **PostgreSQL row-level security:** strong, but harder to test and to explain; worth
  revisiting if raw SQL access to app tables ever appears.
- **Per-query manual `WHERE owner_id`:** easy to forget in one place. Rejected in favour
  of the shared helper.

## Consequences
- Deleting a user would delete their records (`ON DELETE CASCADE`); that is why the
  Users page only disables accounts.
- Sharing a dashboard with another user is not possible yet; it would be a new, explicit
  feature on top of this rule.
