---
title: "DEC-32 · One pull request per stage with a gate, never one per task"
description: A change's tasks are commits on one implementation branch, merged by one PR when verify passes
owner: Kevin
version: "1.0"
updated: "2026-11-25"
---

# DEC-32 · One pull request per stage with a gate, never one per task

**Date:** 2026-11-25

**A change opens one pull request per stage with a gate, plus the one to the base: design,
architecture, implementation, and the base. Its tasks are commits on one implementation branch,
`impl/{slug}`**, cut from the change branch once design and architecture merged, and merged by one PR
when `verify` passes ([`ARCH-06`](../foundations/architecture/branches.md)). The review, the gates,
mutation and `verify`'s fixes are commits on the same branch.

| What a task PR gave | How it is kept without one |
|---|---|
| A check per task: tests green before the next | The same gates, run locally before each task commit ([`ARCH-11`](../foundations/architecture/pipeline.md)) |
| Which task touched what | One commit per task, its ID in the title and its Spec section in the body |
| Ticking the task in the tracker | Ticked when its commit is pushed, naming the commit ([`ARCH-15`](../foundations/architecture/tracker.md#the-tasks)) |
| Nothing lost if a session dies | A push after each commit |
| Tasks in parallel | A short branch per task, merged locally into the implementation branch, no PR |

| Option | Discarded, and why |
|---|---|
| One PR per task (until now) | It is what failed: below |
| The task commits straight on the change branch, three PRs | The CI judges and the `tests.lock` check run only on the PR to the base; a failed build is reverted on the change branch instead of dropped; the diff mixes design, architecture and code |
| One PR per batch of fixes after the tasks | The same pattern, copied: a PR is a gate, and those batches gate nothing |

**Why:** Reclee's inbox (RECLEE-1099) reached **93 PRs for one change**: one per task (67), then one per
batch of loose ends, review fixes, gate fixes, mutation and `verify` fixes. The cause was the spec:
ARCH-06 gave each task its own branch and PR, and `build` opened one per task. With about ninety PR
numbers in play, an agent merged someone else's PR into `dev` from a number it remembered. Each PR
cost about five calls that produce nothing (branch, push, open, read, merge), about 450 in all; the
squash merge added co-authors to 32 commits; the files every task touches (`assumptions.md`,
`tests.lock`) conflicted on each PR. And nobody reviewed 91 PRs: the real review was one, at the end,
over the whole change. The task PRs bought no review.
