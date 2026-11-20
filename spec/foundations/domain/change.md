---
title: Change
description: ENT-06 · One unit of work moving through the cycle
owner: Kevin
version: "1.5"
updated: "2026-11-20"
---

# ENT-06 · Change

A change is **one unit of work** going through the cycle: a new PRD, a user story, a fix. It lives
in `changes/<CHG-nnn>/` while it is in flight and moves to `changes/archive/` when `publish` closes
it. **A client's request is a change from the moment it is made**: there is no request apart from it
([`DEC-23`](../../decisions/DEC-23-request-is-a-change.md)).

| Field | What it holds |
|---|---|
| `id` | `CHG-nnn` |
| `track` | `full`, `story`, `fix` or `chore` ([`ENT-11`](track.md)) |
| `story` | The originating issue in the tracker: `REC-412` |
| `branch` | Its branch, cut from the base when the request is made: `feat/automations` ([`ARCH-06`](../architecture/branches.md#a-request)) |
| `definition.md` | What the client asked for, before `specify` writes it ([`ARCH-18`](../architecture/definition.md#the-conversation)) |
| `scope` | The IDs it touches |
| `deltas/` | Its [`Delta`](delta.md)s |
| `reports/` | Its [`Report`](report.md)s |
| `evidence/` | The screenshot of each `AC`, from `verify` |
| `decisions` | One per delta, from `accept` |

| State | Is |
|---|---|
| `requested` | The branch holds only `definition.md` |
| `open` | From `spec-approval` until `acceptance-merge` |
| `accepted` | On the base, until `publish` closes it |
| `archived` | Closed by `publish` |
| `dropped` | Dropped before `spec-approval`: its branch deleted. It was never synced, so it leaves nothing behind |
| `retired` | Dropped after `spec-approval`, through another change that names it |

The track is computed from the scope, and a person can force `full`. One change has **one parent issue**
in the tracker that gathers it; each stage with a branch and a gate is a sub-issue of it, and its tasks are a checklist in the
implementation one ([`ARCH-15`](../architecture/tracker.md)).
