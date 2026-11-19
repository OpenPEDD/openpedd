---
title: measure
description: Stage 9 · On the review date, checks whether the PRD's hypothesis held
owner: Kevin
version: "1.1"
updated: "2026-11-19"
status: draft
---

# Stage 9 · `measure`

**Mode:** delegated, asynchronous · **Gate:** none

## What it is

**Every PRD is a hypothesis**: if we build this, metric X goes from its `baseline` to its `target` by
the `review date`. `measure` **looks at that metric again** when the date comes, and says whether the
hypothesis held. Without it, the PRD's metric is written once and never checked.

It does not run right after `publish`: **it runs on the review date**, days or weeks later, when
there is data.

## Inputs

| What | From |
|---|---|
| The PRD's `Success metric`: `baseline`, `target`, `review date` | `specify` |
| The events that measure it | `Tracking Plan`, instrumented in `build`, checked in `verify` |
| The data | The analytics tool (adapter), or a value the person enters |

## Context pack

The PRD's metric section · the `Tracking Plan` events · the query result. Budget: **4,000 tokens**.

## Procedure

1. **On the review date**, queries the metric with the `Tracking Plan` definition.
2. **Compares** it against `baseline` and `target`.
3. **Writes the result** into the PRD: the value, the date, and whether it got there.
4. **Depending on the result**:

| Result | What happens |
|---|---|
| Reached the target | Recorded; nothing else |
| Improved but did not reach it | A `Q` opens: adjust the target, iterate, or leave it |
| Did not move, or got worse | A `Q` opens, plus a candidate story in `open/` |
| No data | A `finding`: the event is not instrumented or not being sent |

## Outputs

| What | Where |
|---|---|
| The measured value, with its date | In the PRD's metric section |
| A `Q` or a candidate story | In `open/` |
| The next review date, if it iterates | In the PRD |

## Judge

None: it is a measurement. What gets judged is the decision that follows, and that belongs to a
person, through the `Q`.

## Keep in mind

- **The metric is defined in `specify`, instrumented in `build` and checked in `verify`.** If it reaches `measure` with no data, one of the three failed.
- **A metric that misses is not a bug**: it is learning. It opens a question, not a task.
- **One metric per PRD**, hanging from the north-star metric of the `Business Context`.

## Skills, agents and tools

| Kind | Name | For | Reads | Leaves |
|---|---|---|---|---|
| Skill | `/measure` | Query, compare and record | The `Success metric`; its `Tracking Plan` event; the data | The value and its date, in the PRD; a `Q` or a candidate story; the next review date |
| Adapter | PostHog, Amplitude, SQL | The query. In the free framework the person enters the value or configures the query | — | — |
| Reminder | The review date | Free: the person runs it. Cloud: it runs on its own and notifies ([`DEC-03`](../../decisions/DEC-03-measure.md)) | — | — |

## Per track

| Track | What changes |
|---|---|
| `full` | Everything |
| `story` | Only if the story declared its own metric; otherwise it feeds the PRD's |
| `fix` · `chore` | Does not run |

## Sources

Lean Startup (build–measure–learn) · HEART · North Star metric.
