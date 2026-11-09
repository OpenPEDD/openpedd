---
title: accept
description: Stage 7 · A person decides everything the AI decided without them, from one report
owner: Kevin
version: "1.1"
updated: "2026-11-09"
status: draft
---

# Stage 7 · `accept`

**Mode:** human · **Gate:** `acceptance-merge`

## What it is

**The closing 10 of the delegated block.** During `plan`, `build` and `verify`, the AI worked without
the person who defines, and along the way it assumed things and deviated from the spec where it could
not meet it. `accept` is where that person **decides each one**, reading a single report. They are
not hunting bugs: **they are deciding what nobody defined.**

It is user acceptance testing and the Definition of Done, with one difference: what is accepted is
not only released, **it is written into the spec**.

## Inputs

| What | From |
|---|---|
| The `Acceptance Report` | `verify` |
| The feature running on the change branch's preview | `build`, through the `Delivery Pipeline` |

## Context pack

There is no agent: a person reads it. The report has a 3,000-token budget, plus screenshots.

## Procedure

1. **The person reads the report** and, if they want, tries the feature in the test environment.
2. **Decides each delta**:

| Decision | What happens |
|---|---|
| `keep` | The delta stays: it enters the spec in `publish` |
| `change` | Not like this: it becomes a new task, goes back to `build`, and the delta is dropped |
| `reject` | Neither kept nor changed now: it is dropped, and a `Q` opens if needed |

3. **A bug the spec already covered** is recorded with the judge that let it through: it is the cycle metric, and that judge gets fixed.
4. With everything decided, **`acceptance-merge`**: the `keep`s are ready for `publish`.

## Outputs

| What | Status |
|---|---|
| One decision per delta | In the change |
| A new task for each `change` | In the tracker, back to `build` |
| A new `Q` for each `reject` that needs one | Open |
| The bugs the spec covered, with their judge | In the cycle metric |

## Judge

None: the person is the gate. Passes when **nothing is left undecided**.

## Keep in mind

- **It is the only human review of the delegated block.** If the person has to read code, PRs or conversations to decide, the report is badly built, and `verify` is fixed.
- **Merging a task is not acceptance.** Task PRs merge into the change branch earlier; **the PR from the change branch to the base merges here**, at `acceptance-merge`, after the person tried it on the branch's preview ([`ARCH-06`](../../foundations/architecture/branches.md)). In production it ships **off for customers** until it is released.
- **The cycle metric** is the bugs the person finds here that the spec already covered. The target is zero.

## Skills, agents and tools

| Kind | Name | For |
|---|---|---|
| Skill | `/accept` | Shows the report, records each decision, creates the tasks |
| MCP | `get_change` · the tracker's MCP | Read the change and create tasks |
| Dashboard (Cloud) | The acceptance queue | Deciding without opening the repo |

## Per track

| Track | What changes |
|---|---|
| `full` · `story` | Everything |
| `fix` | Light: confirm the bug does not come back and there are no deltas |
| `chore` | Does not run |

## Sources

UAT · Definition of Done · ODD (done means evidence) · Reclee Spec (`/aceptar`, the 10 · 80 · 10).
