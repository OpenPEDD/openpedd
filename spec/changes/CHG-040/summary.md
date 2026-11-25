---
title: "CHG-040 · One pull request per stage, the tasks as commits: summary for Kevin"
description: One page — why a change opened 93 PRs, and the implementation branch that brings it to four
owner: Kevin
version: "1.0"
updated: "2026-11-25"
---

# CHG-040 · One pull request per stage, the tasks as commits

Stage: `specify`. Found on Reclee's inbox (RECLEE-1099): 93 PRs for one change, one per task and one
per batch of fixes, and an agent that merged someone else's PR into `dev` from a number it remembered.

| What | Where |
|---|---|
| **One PR per stage with a gate**: design, architecture, implementation, and the one to the base. Why, and what each task PR gave that is kept another way | [`DEC-32`](../../decisions/DEC-32-one-pr-per-stage.md) |
| The implementation branch `impl/{slug}` replaces the task branches: cut after design and architecture merged, one commit per task, the review, gates, mutation and `verify`'s fixes on it, one PR when `verify` passes. Tasks in parallel merge locally | [`ARCH-06`](../../foundations/architecture/branches.md) |
| What runs before a task commit and on the implementation PR; `pedd records` gains `commit` and checks the PR against every delta | [`ARCH-11`](../../foundations/architecture/pipeline.md) |
| A task is ticked with its commit; the implementation PR, a draft from the first push, names the sub-issue | [`ARCH-15`](../../foundations/architecture/tracker.md) |
| `build` commits and pushes each task, opens no PR; `/build-batch` merges locally | [build](../../modules/build/prd.md) |
| `verify` marks the implementation PR ready before the PR to the base; `plan` commits the tests on the implementation branch | [verify](../../modules/verify/prd.md), [plan](../../modules/plan/prd.md) |
| Cloud sessions push to the implementation branch; `pedd` opens its PR as a draft | [`ARCH-12`](../../foundations/architecture/running.md) |

Built: `@openpedd/cli` 0.12.0 (`pedd branch implementation`, the branch check without task branches,
`pedd records <change> commit`, `tasks` by commit), `@openpedd/reader` 0.14.0 (`checkTaskCommit`,
`checkImplementationPr`, `checkChecklist` by commit), with tests.
