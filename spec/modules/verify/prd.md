---
title: verify
description: Stage 6 · The product judge of the delegated block, and the Acceptance Report
owner: Kevin
version: "1.4"
updated: "2026-11-11"
status: draft
---

# Stage 6 · `verify`

**Mode:** delegated · **Gate:** none

## What it is

The product judge of the delegated block. **Another session, with another model than `build`**,
reviews what was built against the spec and the foundations, gathers the evidence of each criterion,
and builds the **`Acceptance Report`**: the only thing the person reads next. What does not pass goes
back to `build` on its own.

## Inputs

| What | From |
|---|---|
| The PRs in scope, with their Spec section | `build` |
| The spec in scope and the traceability matrix | `plan` |
| Every delta of the change | `plan` and `build` |

## Context pack

Per area, never the whole change: the area's `FR`s, `NFR`s and `AC`s · the diff of its PRs ·
`Security Policy` · `Quality Standards` · `Architecture Rules` · `Roles & Permissions` ·
`Delivery Pipeline`. Budget:
**20,000 tokens per area**.

## Procedure

1. **Against the spec**: every `FR` does what it says, every exception flow exists, every permission holds, every contract matches.
2. **Against the foundations**: security (OWASP ASVS), quality, architecture, accessibility.
3. **Evidence**: runs each criterion's tests and takes **one screenshot per `AC` with a screen**, with the test data. With `locales`, renders each one and fails on a raw key. With a Walkthrough declared, drafts it from the green tests' steps and walks it in the browser ([`ARCH-07`](../../foundations/architecture/walkthroughs.md)).
4. **Tests that can catch**, **only in the last round**: once no high finding is left, with the whole suite run once and green, and nothing else changing. Runs mutation testing over the change's code, breaking it on purpose; a mutant that survives in code implementing an `AC` is a `finding`. Then runs each `AC` again **with data it varies itself**, once `build` is done, so `build` could not have seen it. A criterion that passes only with the original data is a high `finding`.
5. **Drift**: whatever the code does that the spec does not say (an extra screen, an extra field) is a `finding`.
6. **Tracking**: the `Tracking Plan` events the metric needs are instrumented.
7. **Confirms what is serious**: every high finding is reviewed by a second judge, `judge_confirm`, before it counts.
8. **Decides**: with high findings, back to `build` with new tasks (three rounds at most). Without them, builds the **`Acceptance Report`** ([`ENT-08`](../../foundations/domain/report.md)).
9. **Opens the PR to the base**: merges the base into the change branch, solves the conflicts there, runs the pipeline again and opens the PR with the whole change's **Spec** section ([`ARCH-06`](../../foundations/architecture/branches.md)). It merges at `acceptance-merge`.

## The `Acceptance Report`

| Section | Holds |
|---|---|
| Summary | The scope, how many `FR`s and `NFR`s, how many deltas of each type |
| Per `FR` | Its `AC`, its test (green), its screenshot |
| Assumptions | What was assumed, where, the alternative |
| Deviations | What could not be done as written, why, the alternative |
| Open findings | The medium and low ones that did not go back to `build` |
| Improvements | What the agents of every stage would improve, deduplicated, none applied ([`RULE-25`](../../foundations/rules/cycle.md#rule-25)); and each stage's work, wait and rounds, from the trace |
| Impact | Which derived artifacts go stale if each delta is accepted |

Budget: **3,000 tokens without screenshots**. A person reads it: it must be readable in ten minutes.

## Outputs

| What | Status |
|---|---|
| `Acceptance Report` | In `changes/<CHG>/reports/` |
| `finding` deltas | In the change |
| One screenshot per `AC` with a screen | In `changes/<CHG>/evidence/` |
| The Walkthrough draft | In the change |
| The PRD | → `in_review` |

## Judge

| Agent | Checks | Passes when |
|---|---|---|
| `verify-judge` | Everything above, with the `judge` model | No high findings; every `AC` green |
| `confirm-judge` | Each high finding, with the `judge_confirm` model | Confirmed or dismissed |

## Keep in mind

- **`verify` does not fix.** It finds and reports; fixing belongs to `build`.
- **The order is fixed: review, fix, the whole suite once, mutation last.** Every round of fixes changes the code, and a suite or a mutation run before it is repeated. A red test outside the change stops mutation before it starts, not halfway.
- **It is not the same session or model as `build`** ([`RULE-12`](../../foundations/rules/cycle.md#rule-12)).
- **A green test is a claim, not proof.** An agent can pass a test without meeting the criterion, so `verify` checks that the tests can fail.
- **The report decides, it does not narrate.** Each delta comes with what has to be decided.

## Skills, agents and tools

| Kind | Name | For |
|---|---|---|
| Skill | `/verify` | The whole stage: splits by area and builds the report |
| Agent | `verify-judge` · `confirm-judge` | The judges |
| MCP | `get_context_for` · `get_freshness` · `propose_delta` | Read and report |

## Per track

| Track | What changes |
|---|---|
| `full` · `story` | Everything |
| `fix` · `hotfix` | Only the bug's area and its criteria |
| `chore` | Foundations only (security, architecture). No acceptance report |

## Sources

ODD (acceptance evidence) · Spec Kit (`/converge`) · Spec Growth Engine (drift gate) · V-Model ·
OWASP ASVS · Reclee Spec (`/revisar` with a second agent) · mutation testing · ImpossibleBench (how
agents exploit tests).
