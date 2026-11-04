---
title: build
description: Stage 5 · One agent, one task, one context pack, until its tests pass
owner: Kevin
version: "1.0"
updated: "2026-11-04"
status: draft
---

# Stage 5 · `build`

**Mode:** delegated · **Gate:** none

## What it is

Where a task becomes code. **One agent, one task, one context pack.** It works until the task's tests
pass. What cannot be done as the spec says is not fixed in the spec: it becomes a `deviation`, and a
person decides it in `accept`.

## Inputs

| What | From |
|---|---|
| **One** tracker task with no open blockers | `plan` |
| Its context pack | `plan` |
| Its red tests | `plan` |

## Context pack

The task's, built by `plan`. Budget: **12,000 tokens target, 20,000 max**, plus the code the agent
opens to work.

## Procedure

1. **Reads the pack**, nothing else. If something is missing to build, it is an `assumption` (product) or a technical question to whoever runs the stage (technical).
2. **Red → green → refactor**: makes the tests pass, one by one, and cleans up.
3. **Anchors the code** to the IDs it implements: `@spec FR-JOB-03@<hash>`, or a line in `spec.lock`.
4. **Runs the `Delivery Pipeline` checks**: lint, types, tests, fitness functions.
5. **Records deltas**: a `deviation` when the spec cannot be met as written (with the technical reason and the alternative); an `assumption` when it had to fill a gap.
6. **Opens the PR** with the **Spec** section: IDs covered, deviations, assumptions. Even if it says there are none.
7. **Moves the task** to review in the tracker.

## Outputs

| What | Anchored to |
|---|---|
| The PR, with its Spec section | The task's IDs |
| Anchored code | `@spec` or `spec.lock` |
| Green tests | The ones from `plan`, unchanged |
| `deviation` and `assumption` deltas | In the change |

## Judge

The task's tests and the `Delivery Pipeline` checks. There is no agent judge here: the product judge
is `verify`. Passes when everything is green.

## Keep in mind

- **The tests from `plan` are not touched.** If a test is wrong, it is a `deviation` explaining why, and the test changes only if `accept` decides so.
- **Contracts are not touched.** The agent works inside them.
- **A technical question goes to whoever runs the stage; a product question is assumed.** The person who defines is not in the middle.
- **Only the irreversible or the costly stops the work** ([`RULE-14`](../../foundations/rules/cycle.md#rule-14)): a migration that deletes data, a charge, a real email.
- **Integrations are tested against each provider's sandbox**, from `Integrations`.

## Skills, agents and tools

| Kind | Name | For |
|---|---|---|
| Skill | `/build` | One whole task |
| Skill | `/build-batch` | Several tasks with no dependencies between them, each in its own session |
| MCP | `get_context_for` · `propose_delta` · the tracker's MCP | The pack, the deltas and the status |

## Per track

| Track | What changes |
|---|---|
| `full` · `story` | Everything |
| `fix` | First writes the test that reproduces the bug, red; then fixes it. If the spec did not cover it, it is not a `fix`: it is a `story` |
| `chore` | No product IDs and no deltas. The pipeline checks still run |

## Sources

TDD · ODD (contracts are not changed) · OpenSpec (`/opsx:apply`) · Spec Kit (`/implement`) · Reclee
Spec (the PR's Spec section).
