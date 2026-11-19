---
title: verify
description: Stage 6 · The product judge of the delegated block, and the Acceptance Report
owner: Kevin
version: "1.7"
updated: "2026-11-19"
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
| The tests of each `AC`, locked and green | `plan`, made green in `build` |

## Context pack

Per area, never the whole change: the area's `FR`s, `NFR`s and `AC`s · the diff of its PRs ·
`Security Policy` · `Quality Standards` · `Architecture Rules` · `Roles & Permissions` ·
`Delivery Pipeline`. Budget:
**20,000 tokens per area**.

## Procedure

1. **Hunts by lens, in parallel**: one `verify-judge` session per lens that applies to the area ([`ARCH-14`](../../foundations/architecture/review-lenses.md)), each with only its lens and the area's pack. The Spec lens covers drift: whatever the code does that the spec does not say (an extra screen, an extra field). Security reads OWASP ASVS. Hunters read; `pedd` writes their findings as deltas.
2. **Evidence**: runs each criterion's tests and takes **one screenshot per `AC` with a screen**, with the test data. With `locales`, renders each one and fails on a raw key. With a Walkthrough declared, drafts it from the green tests' steps and walks it in the browser ([`ARCH-07`](../../foundations/architecture/walkthroughs.md)).
3. **Tests that can catch**, **only in the last round**: once no high finding is left, with the whole suite run once and green, and nothing else changing. Runs mutation testing over the change's code, breaking it on purpose; a mutant that survives in code implementing an `AC` is a `finding`. Then runs each `AC` again **with data it varies itself**, once `build` is done, so `build` could not have seen it. A criterion that passes only with the original data is a high `finding`.
4. **Tracking**: the `Tracking Plan` events the metric needs are instrumented.
5. **Tries to refute what is serious**: every `high` finding goes to `confirm-judge`, whose job is to prove it wrong from the code and the spec. Only what survives counts.
6. **`pedd` decides, not a judge**: with blocking findings ([`ARCH-13`](../../foundations/architecture/review.md#what-blocks)), back to `build` with new tasks (three rounds at most). Without them, builds the **`Acceptance Report`** ([`ENT-08`](../../foundations/domain/report.md)).
7. **Opens the PR to the base**: merges the base into the change branch, solves the conflicts there, runs the pipeline again and opens the PR with the whole change's **Spec** section ([`ARCH-06`](../../foundations/architecture/branches.md)). It merges at `acceptance-merge`, once a person approves it ([`ARCH-13`](../../foundations/architecture/review.md#the-persons-last-step)).

## The `Acceptance Report`

| Section | Holds |
|---|---|
| Summary | The scope, how many `FR`s and `NFR`s, how many deltas of each type |
| Per `FR` | Its `AC`, its test (green), its screenshot |
| Assumptions | What was assumed, where, the alternative, how it reverts |
| Deviations | What could not be done as written, why, the alternative, how it reverts |
| Open findings | The advisory ones, which did not go back to `build` |
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
| `verify-judge` | One lens per session, with the `judge` model | No blocking findings; every `AC` green |
| `confirm-judge` | Tries to refute each high finding, with the `judge_confirm` model | Survived or dismissed, with the reason |

## Keep in mind

- **`verify` does not fix.** It finds and reports; fixing belongs to `build`.
- **The order is fixed: review, fix, the whole suite once, mutation last.** Every round of fixes changes the code, and a suite or a mutation run before it is repeated. A red test outside the change stops mutation before it starts, not halfway.
- **It is not the same session or model as `build`** ([`RULE-12`](../../foundations/rules/cycle.md#rule-12)).
- **A green test is a claim, not proof.** An agent can pass a test without meeting the criterion, so `verify` checks that the tests can fail.
- **The report decides, it does not narrate.** Each delta comes with what has to be decided.

## Skills, agents and tools

| Kind | Name | For | Reads | Leaves |
|---|---|---|---|---|
| Skill | `/verify` | The whole stage: splits by area and builds the report | The PRs and their Spec section; the spec in scope and the traceability matrix; every delta; the tests, green | The `Acceptance Report`; `finding` deltas; a screenshot per `AC` with a screen; the Walkthrough draft, from the green tests' steps; the PR to the base |
| Agent | `verify-judge` · `confirm-judge` | The judges | — | — |
| MCP | `get_context_for` · `get_freshness` · `propose_delta` | Read and report | — | — |

## Per track

| Track | What changes |
|---|---|
| `full` · `story` | Everything |
| `fix` · `hotfix` | Only the bug's area and its criteria |
| `chore` | Foundations only (security, architecture). No acceptance report |

## Sources

ODD (acceptance evidence) · Spec Kit (`/converge`) · Spec Growth Engine (drift gate) · V-Model ·
OWASP ASVS · Reclee Spec (`/revisar` with a second agent) · mutation testing · ImpossibleBench (how
agents exploit tests) · Crysk (hunters per lens, a refuter, blocking decided by code), surveyed in
[`MKT-04`](../../foundations/market/agent-tooling.md) · Reclee's PR checklist (each rule from a past
correction; what lint sees is not read by hand).
