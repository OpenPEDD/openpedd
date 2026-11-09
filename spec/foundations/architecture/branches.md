---
title: Branches and tasks
description: ARCH-06 · The branch of each change, the design and task branches inside it, and their sub-issues in the tracker
owner: Kevin
version: "1.0"
updated: "2026-11-09"
---

# ARCH-06 · Branches and tasks

Every change gets **one branch**, cut from the base. Everything the change needs (the mockup, each
task) is built on branches cut from it and merged back into it. **Only the finished change reaches
the base**, once, through one pull request. The tracker mirrors the same tree: the change is the
parent issue, and the design and each task are its sub-issues.

```
dev ──────────────────────────────────────────────────────────────●── (merge at acceptance-merge)
  └─ feat/automations ──────●──────●──────●──── dev merged in ───┘
        ├─ design/automations ──┘      │      │      PR to dev: opened when verify passes
        ├─ reclee-1301-triggers ───────┘      │
        └─ reclee-1302-actions ───────────────┘
```

## The branches

| Branch | Cut from | Holds | Merges into | When |
|---|---|---|---|---|
| **Change branch**: `feat/automations` | The base (`dev`) | The whole change | The base, through **one PR** | At `acceptance-merge` |
| **Design branch**: `design/automations` | The change branch | The mockup, built in code ([design](../../modules/design/prd.md)) | The change branch | At `design-merge` |
| **Task branch**: the tracker's branch name, `reclee-1301-triggers` | The change branch, after the design merged | One task from `plan` | The change branch, through its own PR | When the task's tests and the pipeline checks pass |

The prefix of the change branch follows the track: `feat/` for `full` and `story`, `fix/`, `chore/`.
The design branch cannot be `feat/automations/design`: git does not allow a branch under a name that
is already a branch.

## The tracker

| Issue | Is | Created by | Closes |
|---|---|---|---|
| **Parent**: the change | *Automations*, or the user story | `specify` | At `publish` |
| Sub-issue: design | The mockup of every screen and state in scope | `design` | At `design-merge` |
| Sub-issue: one per task | A vertical slice, with its IDs, pack and tests | `plan` | When its PR merges into the change branch |

Each task's branch takes **its sub-issue's branch name**, so the tracker ties the PR to the task by
itself, and the sub-issue ties the task to the change. Dependencies between tasks are `blocks` /
`blocked by` between sub-issues.

## The pull request to the base

1. Opens when **every task has merged** into the change branch and `verify` passes.
2. Before opening it, **the base is merged into the change branch** and conflicts are solved there, never on the base. The pipeline runs again on the result.
3. A person accepts on the change branch's preview ([accept](../../modules/accept/prd.md)).
4. It merges at **`acceptance-merge`**. The parent issue stays open until `publish`.

## Smaller changes

| Change | Branches |
|---|---|
| A `story` with screens | The same tree: change branch, design branch, task branches |
| A `story` without screens | No design branch: tasks go straight onto the change branch |
| A `story`, `fix` or `chore` with **one** task | The change branch is the task branch: one branch, one PR to the base |

## Configuration

```yaml
# workspace.yaml
branches:
  base: dev                 # where finished changes land
  change: "{prefix}/{slug}" # feat/, fix/ or chore/, by track
  design: "design/{slug}"
  task: tracker             # the sub-issue's branch name
```

## Rules

| Rule | Why |
|---|---|
| Nothing reaches the base before `acceptance-merge` | The base is always something a person accepted |
| Every task PR targets the change branch, never the base | The change is reviewed, verified and accepted whole |
| The base is merged into the change branch before the design merge and before the PR to the base | Conflicts are found on the branch that caused them |
| Every PR carries its **Spec** section, the task PRs and the PR to the base alike | [Traceability](traceability.md) reads it at every hop |
