---
title: Trace Event
description: ENT-23 · One state change of a trace link, appended and never edited
owner: Kevin
version: "1.4"
updated: "2026-11-26"
---

# ENT-23 · Trace Event

A trace event records **one state change of one [trace link](trace-link.md)**. Links say where
things are now; events say how they got there. Events are only appended, never edited: they are the
traceability over time.

| Field | Example |
|---|---|
| `at` | `2026-11-08T14:02:11Z` |
| `id` | `FR-VEW-01` |
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

A `step` event carries, beside `at`, `actor` and `change`:

| Field | Example |
|---|---|
| `id` | The step: `CHG-042/design/7f3a1c`, given by `start_step` |
| `to` | `started` · `delivered` · `passed` · `rejected` |
| `stage` | `map` · `specify` · `architect` · `design` · `plan` · `build` · `verify` · `accept` · `publish` · `measure` |
| `prd` · `flow` | The PRD and the flow the step works on, if any: `modules/orders/prd.md`, `F2` |
| `pieces` | The [piece kinds](#pieces) it builds: `["form.compound"]` |

`actor` is the person, their git `user.email`. A rejected step is open again, for its next round.

## Human time [#human-time]

What a step costs in people is not its clock: an agent works while nobody is there. **Each message a
person types to their agent appends one `human` event**: `at`, `actor`, `session` (the agent's
session) and `step`, the step that person has open at that moment, or none. **It never holds the
message, nor a word of it.** In Claude Code a `UserPromptSubmit` hook writes it, installed by `init`
([workspace](../../modules/workspace/prd.md#the-human-clock)).

| Rule | Value |
|---|---|
| One person's messages, across sessions, are one sequence | A person in two sessions at once works once |
| A message counts the time until the person's next one | If it is under **15 minutes** |
| The last message before a pause, or the last one | **2 minutes** |
| That time belongs to | The message's `step`; with none, to *outside any step* |

The rule is [`DEC-35`](../../decisions/DEC-35-human-time.md)'s, surveyed in
[`MKT-19`](../market/effort-measurement.md).

## Pieces [#pieces]

A **piece kind** is what a flow or a screen is, as the project's sizing catalog names it:
`form.compound`, `report.multi`, `integration.oauth`. A PRD's flow names it under its heading, a
screen in its row ([PRD format](../../modules/README.md#the-sections-of-a-prd-in-order)); `start_step` copies it onto
the step. With a weight per kind in `workspace.yaml` `pieces`, time reads per credit too.

## What the events answer

What the events answer, among others:

| Question | From |
|---|---|
| How long did this requirement take from `specified` to `live`? | The first and last `spec` events |
| Which stories touched this module in the last month? | `origin` events, by module |
| Where do changes get stuck? | The time between events, per kind |
| How long did each stage take, and how much of it was waiting? | `step` events: work, review and wait |
| How many rounds did each judge need? | `rejected` events per step |
| How many hours of people did a stage, a person or a piece kind take? | `human` events, by their step: `pedd time` |
| What happened to this PRD since it went live? | Every event of its requirements since then |
