---
title: Traceability
description: ARCH-05 · How each requirement's chain is gathered, stored and kept, locally and in the Cloud
owner: Kevin
version: "1.1"
updated: "2026-11-09"
---

# ARCH-05 · Traceability

Traceability has two layers: **links**, the state of each link of a requirement's chain now
([`ENT-22`](../domain/trace-link.md)), and **events**, every change of state over time
([`ENT-23`](../domain/trace-event.md)). The model and the format are open; keeping them up to date
all the time is the Cloud.

## Where each link comes from

| Kind | Read from | How it is tied to the ID |
|---|---|---|
| `spec` · `change` | The spec repo | The ID itself |
| `origin` · `task` | The tracker, through its API | The anchor on the issue; each task is a sub-issue of the change |
| `design` | The code host: the design branch and its merge | The mockup's anchor |
| `code` | The code host: branches and pull requests | The PR's **Spec** section, and `spec.lock` |
| `test` | CI results | The criterion ID in the test name |
| `deploy` · `flag` | The deploy provider and the flag provider, through adapters | The commit, then the PR |
| `docs` | The help and docs repos | `sources` in each article |
| `metric` | Analytics, through an adapter | The `Tracking Plan` event |

## Free: on demand

`pedd trace` and `pedd status` ([`modules/trace`](../../modules/trace/prd.md)) build the links when
asked: they read the spec and git locally, and the tracker and code host through their APIs with
the user's tokens. The result is written to `.pedd/trace/links.json`, and every state change found
since the last run is appended to `.pedd/trace/events.jsonl`.

What it does not see: what happened between two runs. Two runs a week apart record one change, not
the four in between.

## Cloud: always

| Piece | Does |
|---|---|
| Ingestion | Webhooks from the code host, tracker, CI, deploy, flags and design tool. Every change becomes an event the moment it happens |
| Event store | Every event of every product, across repos and over time |
| Graph | The chain of each requirement, rolled up to PRD, module and product |
| Way back | Classifies each new tracker issue: if it asks to change a `live` requirement, proposes a candidate story on that PRD |
| Hotspots | Stories per module and per PRD, per week |

The Cloud writes the same events in the same format: a project can leave the Cloud and keep its
history.
