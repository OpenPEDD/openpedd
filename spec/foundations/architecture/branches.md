---
title: Branches and tasks
description: ARCH-06 · The branch of each change, the design, architecture and task branches inside it, and their issues in the tracker
owner: Kevin
version: "1.5"
updated: "2026-11-17"
---

# ARCH-06 · Branches and tasks

Every change gets **one branch**, cut from the base. Everything the change needs (the mockup, the
architecture, each task) is built on branches cut from it and merged back into it. **Only the finished change reaches
the base**, once, through one pull request. The tracker mirrors the same tree: the change is the
parent issue, each stage with a branch and a gate is a sub-issue, and the tasks are a checklist in the implementation
sub-issue ([`ARCH-15`](tracker.md)).

```
dev ────────────────────────────────────────────────────────────────────────●── (merge at acceptance-merge)
  └─ feat/automations ──────────●──────●──────●──────●──── dev merged in ───┘
        ├─ design/automations ──┘      │      │      │      PR to dev: opened when verify passes
        ├─ arch/automations ───────────┘      │      │
        ├─ task/automations-triggers ─────────┘      │
        └─ task/automations-actions ─────────────────┘
```

## The branches

| Branch | Cut from | Holds | Merges into | When |
|---|---|---|---|---|
| **Change branch**: `feat/automations` | The base (`dev`) | The whole change | The base, through **one PR** | At `acceptance-merge` |
| **Design branch**: `design/automations` | The change branch | The mockup, built in code ([design](../../modules/design/prd.md)) | The change branch | At `design-merge` |
| **Architecture branch**: `arch/automations` | The change branch | The `ARCH` documents, the `ADR`s and the deltas, as they are decided ([architect](../../modules/architect/prd.md)) | The change branch | At `architecture-merge` |
| **Task branch**: `task/automations-triggers` | The change branch, after the design and the architecture merged | One task from `plan` | The change branch, through its own PR | When the task's tests and the pipeline checks pass |

The prefix of the change branch follows the track: `feat/` for `full` and `story`, `fix/`, `chore/`.
The design branch cannot be `feat/automations/design`: git does not allow a branch under a name that
is already a branch. In `split`, the architecture branch lives in the spec repo, next to the documents
it edits, and merges there.

`architect` and `design` run at the same time, each on its branch, and each reads what the other has
written there before each round. A decision that arrives late makes a screen get rebuilt.

## The tracker

The change is a parent issue, each stage with a branch and a gate is a sub-issue, and the tasks are
a checklist in the implementation sub-issue: who creates them, what moves their status and how the
tracker is kept clean are in [`ARCH-15`](tracker.md). Each task PR names the implementation
sub-issue with a non-closing word, so the task branch carries no issue ID.

## The pull request to the base

1. Opens when **every task has merged** into the change branch and `verify` passes.
2. Before opening it, **the base is fetched by name and merged into the change branch**, and conflicts are solved there, never on the base. The pipeline runs again on the result.
3. A person accepts on the change branch's preview ([accept](../../modules/accept/prd.md)).
4. It merges at **`acceptance-merge`**. The parent issue stays open until `publish`.

From the base to production is a promotion, through the project's environments ([`ARCH-08`](release.md)).

## Smaller changes

| Change | Branches |
|---|---|
| A `story` with screens | The same tree: change branch, design branch, task branches. An architecture branch only if `architect` runs |
| A `story` without screens | No design branch: tasks go straight onto the change branch |
| A `hotfix` | `hotfix/{slug}`, cut from production; it merges there and back into the base ([`ARCH-08`](release.md)) |
| A `story`, `fix` or `chore` with **one** task | The change branch is the task branch: one branch, one PR to the base |

## Configuration

```yaml
# workspace.yaml
branches:
  base: dev                 # where finished changes land
  change: "{prefix}/{slug}" # feat/, fix/ or chore/, by track
  design: "design/{slug}"
  architecture: "arch/{slug}"
  task: "task/{slug}-{task}" # one per checklist item
```

## Rules

| Rule | Why |
|---|---|
| Nothing reaches the base before `acceptance-merge` | The base is always something a person accepted |
| Every task PR targets the change branch, never the base | The change is reviewed, verified and accepted whole |
| The base is merged into the change branch before the design and architecture merges and before the PR to the base | Conflicts are found on the branch that caused them |
| Every PR carries its **Spec** section, the task PRs and the PR to the base alike | [Traceability](traceability.md) reads it at every hop |
