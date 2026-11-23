---
title: accept
description: Stage 7 · A person decides everything the AI decided without them, from one report
owner: Kevin
version: "1.5"
updated: "2026-11-23"
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

1. **The person reads the report**, heaviest first ([`ARCH-23`](../../foundations/architecture/weight.md)), and, if they want, tries the feature in the test environment, with its Walkthrough if it has one.
2. **Decides each delta**:

| Decision | What happens |
|---|---|
| `keep` | The delta stays: it enters the spec in `publish` |
| `change` | Not like this: it becomes a new task, goes back to `build`, and the delta is dropped |
| `reject` | Neither kept nor changed now: it is dropped, and a `Q` opens if needed |

   The `high` are decided one by one; **one reply accepts every `low`** with `keep`, or names those that are not. A weight the person disagrees with is noted with the decision.
3. **Decides each improvement** the agents noted: accepted, it goes to the backlog with its problem; otherwise it is dropped.
4. **A bug the spec already covered** is recorded with the judge that let it through: it is the cycle metric, and that judge gets fixed.
5. With everything decided, **`acceptance-merge`**: the `keep`s are ready for `publish`.

## Outputs

| What | Status |
|---|---|
| One decision per delta, with the weight it had | In the change; per weight, in the cycle metrics |
| A new task for each `change` | In the tracker, back to `build` |
| A new `Q` for each `reject` that needs one | Open |
| The bugs the spec covered, with their judge | In the cycle metric |
| The accepted improvements | In the backlog |

## Judge

None: the person is the gate. Passes when **nothing is left undecided**, which `pedd` counts, not the person ([`ARCH-11`](../../foundations/architecture/pipeline.md#nothing-left-unrecorded)).

## Keep in mind

- **It is the only human review of the delegated block.** If the person has to read code, PRs or conversations to decide, the report is badly built, and `verify` is fixed.
- **Merging a task is not acceptance.** Task PRs merge into the change branch earlier; **the PR from the change branch to the base merges here**, at `acceptance-merge`, after the person tried it on the branch's preview ([`ARCH-06`](../../foundations/architecture/branches.md)). In production it ships **off for customers** until it is launched ([`ARCH-08`](../../foundations/architecture/release.md)).
- **The cycle metric** is the bugs the person finds here that the spec already covered. The target is zero.

## Skills, agents and tools

| Kind | Name | For | Reads | Leaves |
|---|---|---|---|---|
| Skill | `/accept` | Shows the report, records each decision, creates the tasks | The `Acceptance Report`; the feature on the preview | A decision per delta; a task per `change`; a `Q` per `reject` that needs one; each covered bug, with its judge |
| MCP | `get_change` · the tracker's MCP | Read the change and create tasks | — | — |
| Dashboard (Cloud) | The acceptance queue | Deciding without opening the repo | — | — |

## Per track

| Track | What changes |
|---|---|
| `full` · `story` | Everything |
| `fix` | Light: confirm the bug does not come back and there are no deltas |
| `hotfix` | One person approves, before the merge to production |
| `chore` | Does not run |

## Sources

UAT · Definition of Done · ODD (done means evidence) · Reclee Spec (`/aceptar`, the 10 · 80 · 10).
