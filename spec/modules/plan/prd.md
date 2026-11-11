---
title: plan
description: Stage 4 · Translates the merged spec into atomic tasks, failing tests and a context pack per task
owner: Kevin
version: "1.2"
updated: "2026-11-10"
status: draft
---

# Stage 4 · `plan`

**Mode:** delegated · **Gate:** none

## What it is

Where the merged spec becomes executable work. **The plan translates the spec; it does not complete
it**: it decides nothing about the product. It leaves three things: **atomic tasks** with their
dependencies, **failing tests** from the criteria, and a **context pack** per task. It starts only
when `architecture-merge` and `design-merge` are closed.

## Inputs

| What | From |
|---|---|
| The merged spec in scope | `specify`, `architect`, `design` |
| The winning mockups | `design` |
| The `ADR`s, `ARCH` documents and fitness functions | `architect` |

## Context pack

The `FR`s, `NFR`s and `AC`s in scope · the area's `ARCH` and `ADR` · the mockups, as reference ·
`Delivery Pipeline` · `Architecture Rules`. Budget: **15,000 tokens**.

## Procedure

1. **Traceability matrix.** One row per `FR` and `NFR` in scope, with the columns to fill: task, test, mockup, code.
2. **Cut into vertical slices**, hardest-first: each task crosses whatever it needs (data, logic, UI) for a piece of behavior that works on its own.
3. **Check each task with INVEST**: independent, negotiable, valuable, estimable, small, testable.
4. **Order**: `blocks` / `blocked by` between tasks. What depends on nothing runs in parallel.
5. **Leaves the contracts empty**: the signatures, the endpoints and the real version of the seam, answering *not implemented*. The tests compile against them, and `build` fills them.
6. **Write the tests, failing**: one per `AC` (acceptance), one per contract (contract test), and the `NFR` fitness functions. **Acceptance tests run against the real version of the seam, never the sample data**: the mockup already shows the right screen, so a test on it passes with nothing built. Each test is run and **seen failing on an assertion**, for the reason its criterion states.
7. **Locks the tests.** `tests.lock`, in the code repo, holds the path and hash of each one. **Tests are part of the contract**: a `Delivery Pipeline` check rejects any PR that changes one.
8. **Build each task's context pack**: its IDs, criteria, tests, mockups, the `ADR`s that affect it and the foundations it names. If it does not fit in 20,000 tokens, the task is badly cut.
9. **Create the tasks in the tracker as sub-issues of the change's issue**, each with its IDs, its pack, its dependencies and its anchor. Each task's branch takes its sub-issue's branch name ([`ARCH-06`](../../foundations/architecture/branches.md)).
10. **Record assumptions.** If planning needs a product decision the spec does not make, the reasonable option is picked and recorded as an `assumption` ([`RULE-13`](../../foundations/rules/cycle.md#rule-13)).

## Outputs

| What | Anchored to |
|---|---|
| Tasks in the tracker, sub-issues of the change, with dependencies | Their `FR` / `NFR` |
| Red tests, and `tests.lock` | Their `AC`s and contracts |
| The empty contracts and the real version of the seam | Their contracts |
| A context pack per task | The IDs it gathers |
| The traceability matrix | In the change |
| `assumption` deltas | In the change |
| The PRD | → `building` |

## What makes a task atomic

| Criterion | How it is measured |
|---|---|
| It covers a vertical slice of few IDs | It lists its IDs and criteria |
| It fits a reviewable PR | Within the line budget of the `Delivery Pipeline` |
| It compiles and passes its tests on its own | Its tests do not depend on another open task |
| Its context fits | Context pack ≤ 20,000 tokens |
| It says what it depends on | `blocks` / `blocked by` in the tracker |

## Judge

| Agent | Checks | Passes when |
|---|---|---|
| `analyze-judge` | Every `FR` and `NFR` in scope has a task; every `AC` has a test; **every test fails on an assertion, and no acceptance test runs on the sample data**; every task has IDs, except those marked `technical`; no pack over budget; **no product decided in the plan** | All green |

## Keep in mind

- **If the plan decides product, it is an `assumption`**, not a line in a task.
- **Tests must fail** when `plan` ends, for the right reason. A test that already passes proves nothing new, and one that does not compile is not red: it says nothing about the behavior.
- **Only open tasks may be red.** On the change branch, the pipeline requires the tests of every merged task and expects the rest to fail; the PR to the base requires them all.
- **Technical tasks** (migrations, configuration) exist, are marked `technical`, and say which product task they unblock.

## Skills, agents and tools

| Kind | Name | For |
|---|---|---|
| Skill | `/plan` | The whole stage |
| Skill | `/plan-slice` | Cutting and ordering tasks |
| Skill | `/plan-tests` | Writing the red tests |
| Skill | `/plan-pack` | Building each task's context pack |
| Agent | `analyze-judge` | The judge |
| MCP | `get_context_for` · `list_ids` · `propose_delta` · the tracker's MCP | Read, propose and load |

## Per track

| Track | What changes |
|---|---|
| `full` · `story` | Everything, on the scope |
| `fix` | Does not run: the task is the bug, and `build` writes the test that reproduces it |
| `chore` | Does not run |

## Sources

Spec Kit (`/tasks`, `/analyze`) · OpenSpec (`tasks.md`) · vertical slices / tracer bullets · INVEST ·
ATDD · contract testing · V-Model · Spec Growth Engine.
