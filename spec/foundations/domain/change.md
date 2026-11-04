---
title: Change
description: ENT-06 · One unit of work moving through the cycle
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

# ENT-06 · Change

A change is **one unit of work** going through the cycle: a new PRD, a user story, a fix. It lives
in `changes/<CHG-nnn>/` while it is in flight and moves to `changes/archive/` when `publish` closes
it.

| Field | What it holds |
|---|---|
| `id` | `CHG-nnn` |
| `track` | `full`, `story`, `fix` or `chore` ([`ENT-11`](track.md)) |
| `story` | The originating issue in the tracker: `REC-412` |
| `scope` | The IDs it touches |
| `deltas/` | Its [`Delta`](delta.md)s |
| `reports/` | Its [`Report`](report.md)s |
| `evidence/` | The screenshot of each `AC`, from `verify` |
| `decisions` | One per delta, from `accept` |

The track is computed from the scope, and a person can force `full`. One change has one task in the
tracker that gathers it, with the stages as a checklist.
