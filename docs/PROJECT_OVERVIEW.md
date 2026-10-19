# Project overview

## Mission
Rebuild Datalytics as a maintainable, tested and optimized application, **one small
feature at a time**, keeping the recognizable Datalytics look and workflows from the
reference app while replacing weak implementations.

## What Datalytics does (from the reference app)
Upload files or connect databases, explore datasets, build dashboards, ask questions in
plain language (Ask AI) and scan automatic insights. There is no public sign-up; an admin
creates users.

## Repositories
| Repository | Role |
|---|---|
| `samehaboelneel83/data_analysis_dashboard_ai-` | **Reference** (read-only). Source of features and visual design. Not modified. |
| `samehaboelneel83/datalytics_optimized` | **This repo**, the new implementation. |

## Principles
- Feature by feature, each on its own branch and PR into `main`.
- Understand the reference before implementing; reuse what is good, fix what is not.
- Simple, small files with one responsibility each, on both frontend and backend.
- Tests with every feature; no claim of "works" without having run it.
- Owner approval before anything is merged.

## Team
sameh (owner), emad, sa3eed, saleh, shehab. GitHub usernames and permissions are still
to be confirmed.

## Status
See [FEATURE_STATUS.md](FEATURE_STATUS.md).
