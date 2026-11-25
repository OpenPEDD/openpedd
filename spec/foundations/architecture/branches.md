---
title: Branches and tasks
description: ARCH-06 · The branch of each change, the design, architecture and implementation branches inside it, one PR per stage, and their issues in the tracker
owner: Kevin
version: "1.9"
updated: "2026-11-25"
---

# ARCH-06 · Branches and tasks

Every change gets **one branch**, cut from the base. Everything the change needs (the mockup, the
architecture, the code) is built on branches cut from it and merged back into it. **Only the finished change reaches
the base**, once, through one pull request. **One pull request per stage with a gate, never one per task**
([`DEC-32`](../../decisions/DEC-32-one-pr-per-stage.md)): a full change has four, however many tasks it has.

```
dev ──────────────────────────────────────────────────────────────────●── PR 4, at acceptance-merge
  └─ feat/automations ─────────●──────●──────────────────────●── dev ─┘
        ├─ design/automations ─┘      │                      │  merged in
        │   PR 1, at design-merge     │                      │
        ├─ arch/automations ──────────┘                      │
        │   PR 2, at architecture-merge                      │
        └─ impl/automations ── 1.0 ── 1.1 ── … ── fixes ─────┘
             cut after PR 1 and PR 2       PR 3, when verify passes
             one commit per task
```

## The branches

| Branch | Cut from | Holds | Merges into | When |
|---|---|---|---|---|
| **Change branch**: `feat/automations` | The base (`dev`) | The whole change | The base, through **one PR** | At `acceptance-merge` |
| **Design branch**: `design/automations` | The change branch | The mockup, built in code ([design](../../modules/design/prd.md)) | The change branch | At `design-merge` |
| **Architecture branch**: `arch/automations` | The change branch | The `ARCH` documents, the `ADR`s and the deltas, as they are decided ([architect](../../modules/architect/prd.md)) | The change branch | At `architecture-merge` |
| **Implementation branch**: `impl/automations` | The change branch, after the design and the architecture merged | `plan`'s tests and packs, **one commit per task**, then every fix of the review, the gates, mutation and `verify` | The change branch, through **one PR** | When `verify` passes |
| **Edit branch**: `edit/CHG-031-1` | The change branch of an `agreed` request | One edit to its definition ([`ARCH-21`](requests.md#edit-branch)) | The change branch, through its own PR | When the builder merges it |

The prefix of the change branch follows the track: `feat/` for `full` and `story`, `fix/`, `chore/`.
The design branch cannot be `feat/automations/design`: git does not allow a branch under a name that
is already a branch. In `split`, the architecture branch lives in the spec repo, next to the documents
it edits, and merges there.

`architect` and `design` run at the same time, each on its branch, and each reads what the other has
written there before each round. A decision that arrives late makes a screen get rebuilt.

## The tasks are commits [#the-tasks-are-commits]

**Each task is one commit on the implementation branch**: the task's ID first in the title
(`feat(automations): 1.1 triggers`), its **Spec** section in the body, the local gates green before it
([`ARCH-11`](pipeline.md#nothing-left-unrecorded)), pushed at once, and ticked in the checklist with the
commit ([`ARCH-15`](tracker.md#the-tasks)). The first push opens the implementation PR as a draft;
`verify` passing marks it ready. The review, the gates, mutation and `verify`'s fixes are commits too.

**Tasks in parallel**, which never touch the same files ([`ARCH-04`](agents.md#how-agents-work)), each
work on a short branch, `impl/automations--1.2`, that never opens a PR. Done, the session **merges it
locally** into the implementation branch, solves any conflict, and pushes; a refused push is fetched
and merged again.

## A request [#a-request]

**When a client asks for something, the change branch is cut from the base at once**, holding only its
definition. How it is numbered, edited once agreed, renamed at `spec-approval` and dropped is
[`ARCH-21`](requests.md).

## Creating a branch [#creating-a-branch]

**Where a branch is cut from is never chosen by an agent.** One command creates every work branch,
and CI refuses one cut from anywhere else.

| Piece | Does |
|---|---|
| **`pedd branch <issue>`**, also as `/branch` | Reads the tracker and the change: a change or a request is cut from the base, numbered as [`ARCH-21`](requests.md#numbering) says; the branch of a sub-issue or an edit (design, architecture, implementation, edit) from its change branch. An implementation branch that exists is returned as it is. It names it by `branches` in `workspace.yaml`, pushes it, and prints it |
| **The branch check** in the CI action ([`ARCH-13`](review.md#the-judges-in-ci)) | Fails a PR whose target or merge-base does not match the table [above](#the-branches), and prints the `pedd branch` command that fixes it |
| **A permission rule** installed by `pedd install` | Denies agents `git checkout -b`, `git switch -c` and `git branch <name>` for work branches; they run `pedd branch` ([`ARCH-12`](running.md#keeping-the-context-small)). A task's short branch is cut by `pedd` |

The check is what guarantees it; the command and the rule keep it from going red.

## The tracker

The change is a parent issue, each stage with a branch and a gate a sub-issue, the tasks a checklist
([`ARCH-15`](tracker.md)). The implementation PR names its sub-issue with a non-closing word.

## The pull request to the base

1. Opens when **the implementation PR has merged** into the change branch, so `verify` passed.
2. Before opening it, **the base is fetched by name and merged into the change branch**, and conflicts are solved there, never on the base. The pipeline runs again on the result.
3. A person accepts on the change branch's preview ([accept](../../modules/accept/prd.md)).
4. It merges at **`acceptance-merge`**. The parent issue stays open until `publish`.

When several changes are in flight at once, which overlap, how they stay close to the base and the order they land in is [`ARCH-17`](landing.md). A request waiting in the queue has its base merged in when it is taken ([`ARCH-17`](landing.md#the-queue)).

From the base to production is a promotion, through the project's environments ([`ARCH-08`](release.md)).

## Smaller changes

| Change | Branches |
|---|---|
| A `story` with screens | The same tree: change branch, design branch, implementation branch. An architecture branch only if `architect` runs |
| A `story` without screens | No design branch |
| A `hotfix` | `hotfix/{slug}`, cut from production; it merges there and back into the base ([`ARCH-08`](release.md)) |
| Any change with no design and no architecture branch | The change branch is the implementation branch: one PR, to the base |

## Configuration

```yaml
# workspace.yaml
branches:
  base: dev                    # where finished changes land
  change: "{prefix}/{slug}"    # feat/, fix/ or chore/, by track
  design: "design/{slug}"
  architecture: "arch/{slug}"
  implementation: "impl/{slug}" # one per change; its tasks are commits
  edit: "edit/{change}-{n}"    # one per edit to an agreed request
```

## Rules

| Rule | Why |
|---|---|
| Nothing reaches the base before `acceptance-merge` | The base is always something a person accepted |
| **One PR per stage with a gate**; a task is a commit titled with its ID | A PR is a review and a gate; a task is neither ([`DEC-32`](../../decisions/DEC-32-one-pr-per-stage.md)) |
| The implementation PR targets the change branch, never the base | The change is reviewed, verified and accepted whole |
| The base is merged into the change branch before the design and architecture merges and before the PR to the base | Conflicts are found on the branch that caused them |
| Every task commit and every PR carries its **Spec** section | [Traceability](traceability.md) reads it at every hop |
