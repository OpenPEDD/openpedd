---
title: Cycle
description: The stages in order, their modes, the two kinds of 10-80-10, and where people intervene
owner: Kevin
version: "1.6"
updated: "2026-11-23"
status: draft
---

# Cycle

```
 specify ──► architect ─┐
    │                   ├─► plan ──► build ──► verify ──► accept ──► publish ──► measure
    └─────► design ─────┘   └──────── delegated ───────┘   (human)
 (human)  (interactive, in parallel)
```

`map` runs before everything when the product already exists, and again for each module a change
first touches, until every module has its PRD.

| # | Stage | Mode | Does | PRD |
|---|---|---|---|---|
| 0 | `map` | Interactive, per module | Reads existing code and builds the spec | [map](../map/prd.md) |
| 1 | `specify` | Interactive | The PRD, or the delta of a story, with its cold-read judge | [specify](../specify/prd.md) |
| 2 | `architect` | `guided` (default) or `delegated` | Researches and decides the how; leaves a `Delta Report` | [architect](../architect/prd.md) |
| 3 | `design` | Interactive | Mockups on the brand system; the winner is chosen; leaves a `Delta Report` | [design](../design/prd.md) |
| 4 | `plan` | Delegated | Atomic tasks with dependencies, failing tests from the criteria, a context pack per task | [plan](../plan/prd.md) |
| 5 | `build` | Delegated | Each task until its tests pass; what cannot be done as written becomes a `deviation` | [build](../build/prd.md) |
| 6 | `verify` | Delegated | Another session reviews against the spec and writes the `Acceptance Report` | [verify](../verify/prd.md) |
| 7 | `accept` | Human | A person decides every assumption and deviation | [accept](../accept/prd.md) |
| 8 | `publish` | Delegated | Prepares what people read when a change is accepted, and publishes it at launch, going `live` | [publish](../publish/prd.md) |
| 9 | `measure` | Delegated, asynchronous | On the review date, checks the metric against its target | [measure](../measure/prd.md) |

## The two kinds of 10-80-10

**In the interactive stages** (`specify`, `architect`, `design`), each stage has its own 10-80-10,
and **the person is in the 80 too**:

| | `specify` | `architect` | `design` |
|---|---|---|---|
| **10**, start | The person brings the idea or the story | The person frames the technical problem, or asks for a recommendation | The person asks for the screens |
| **80** | The AI drafts the PRD and the person adjusts it | **Mostly thinking about the improvements that can be made**: options for performance, optimization and good practice | **The person adjusts with small prompts until it looks right**, and picks the winning mockup |
| **10**, close | The cold-read judge passes; the person approves | The person reads the `Delta Report` and decides what enters the spec | The person reads the `Delta Report`: **seeing the design reveals what was missing or could be different**, and that changes the spec |

> Design and architecture are the most manual stages. Design is adjusted with small prompts until it
> looks right; architecture is, mostly, thinking about the improvements that can be made. Only
> `plan`, `build` and `verify` can be delegated almost entirely to the AI. — Kevin, 2026-11-04

**In the delegated block** (`plan` → `build` → `verify`), there is **one 10-80-10 for the whole
block**: the starting 10 is the merged spec (no person needed), the 80 is the AI with a judge in each
stage, and the closing 10 is `accept`.

## Where people intervene

| Track | Gates | Which |
|---|---|---|
| `full`, `architect` in `guided` | 4 | `spec-approval` · `architecture-merge` · `design-merge` · `acceptance-merge` |
| `full`, `architect` in `delegated` | 3 | The same, with `architecture-merge` automatic when the deltas touch only the how |
| `story` touching `FR` | 3 | `spec-approval` of the delta · `design-merge` · `acceptance-merge` |
| `story` touching only `NFR` | 2 | `spec-approval` · `acceptance-merge`, plus `architecture-merge` in `guided` |
| `fix` | 1 | A light `accept` |
| `chore` | 0 | The team's normal code review |

Outside the table, a person steps in only for a conflict between deltas, a judge failing three rounds
([`RULE-15`](../../foundations/rules/cycle.md#rule-15)), or something irreversible or costly
([`RULE-14`](../../foundations/rules/cycle.md#rule-14)). If that happens often, the spec or the judge
is wrong, and it is fixed there.

## Why documentation is generated in `publish`

If the help were drafted in parallel with `build` and the implementation took another path, it would
describe something that did not ship. Anchors would catch it, but the work would be done twice. **It
is generated once, in `publish`, from the spec that already passed `accept`.**

## The cycle metric

**Bugs found in `accept` that the spec already covered.** The target is zero. Each one is recorded
with the judge that let it through, and that judge is fixed: the 80 improves with use.

## Process metrics

Measured from the trace ([`ENT-23`](../../foundations/domain/trace-event.md#steps)), per change and per
stage, to improve the process: `pedd status --time` and the Cloud dashboard.

| Metric | Shows |
|---|---|
| Lead time | From the approved spec to production |
| Work and wait | Of each stage's time, how much was work and how much waiting |
| Rounds | How many times each judge rejected, and how many findings went back to `build` |
| Judge precision | Per judge, the findings it raised that `confirm-judge` or `accept` dismissed, and its score on the bench ([`ARCH-04`](../../foundations/architecture/agents.md#measuring-judges)) |
| Overrides | How many blocking findings a person let through in CI, and which judge raised them |
| Agent cost | Tokens and cost per stage, and the context each call rereads: the first number to look at when a task cost too much. A task over 100,000 tokens is marked as badly cut |
| Pipeline | CI time, and reruns of unstable tests |
| Assumptions per task | Many means the spec came incomplete |
| Undeclared assumptions | Per task, those `verify` found in the code with no delta: the agent hid a decision |
| Decisions per weight | Per weight, how many were kept, changed or rejected at `accept`: a `low` often changed means the weight table is wrong ([`ARCH-23`](../../foundations/architecture/weight.md#calibration)) |
| Delivery | Deploy frequency, change lead time, change failure rate and time to restore, from `publish` and Launch |

**They measure the process, not people.** Waiting at a gate is shown per stage, never ranked by
person: once used to compare people, people learn to hide the wait.
