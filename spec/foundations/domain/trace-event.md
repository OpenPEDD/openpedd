---
title: Trace Event
description: ENT-23 · One state change of a trace link, appended and never edited
owner: Kevin
version: "1.3"
updated: "2026-11-20"
---

# ENT-23 · Trace Event

A trace event records **one state change of one [trace link](trace-link.md)**. Links say where
things are now; events say how they got there. Events are only appended, never edited: they are the
traceability over time.

| Field | Example |
|---|---|
| `at` | `2026-11-08T14:02:11Z` |
| `id` | `FR-JOB-03` |
| `kind` | `code` |
| `ref` | `OpenPEDD/openpedd#42` |
| `from` · `to` | `open` → `merged` |
| `actor` | Who or what caused it: a person, an agent, a webhook |
| `source` | Where it was observed: `github`, `linear`, `vercel`, `cli` |
| `change` | `CHG-031`, if it belongs to one |

The format is an **open standard**, part of the framework: any tool can write events, and any tool
can read them. One event per line, in JSON Lines.

## Stages and steps [#steps]

The checklist of a stage is also its clock. The agent calls `start_step` when it starts a step and
`deliver_step` when it considers it done; the judge passes or rejects it. **The tool stamps the
time, never the agent**, and appends one `step` event each time:

| Event | Says |
|---|---|
| `started` | The step began |
| `delivered` | The agent considers it done |
| `passed` · `rejected` | The judge's verdict; a rejection opens another round |

Between `started` and `delivered` is the work; between `delivered` and `passed`, the review;
between one step's `passed` and the next one's `started`, the wait. Steps that run in parallel each
keep their own clock. git, the tracker and the deploy provider add PRs, reviews and deploys, and the start and end of each stage's sub-issue; agent
telemetry adds tokens and cost, joined by change and step ([`ARCH-11`](../architecture/pipeline.md#cost-per-change)).
Work done outside the tool is reported by the agent, and recorded as **reported, not measured**.

## What the events answer

What the events answer, among others:

| Question | From |
|---|---|
| How long did this requirement take from `specified` to `live`? | The first and last `spec` events |
| Which stories touched this module in the last month? | `origin` events, by module |
| Where do changes get stuck? | The time between events, per kind |
| How long did each stage take, and how much of it was waiting? | `step` events: work, review and wait |
| How many rounds did each judge need? | `rejected` events per step |
| What happened to this PRD since it went live? | Every event of its requirements since then |
