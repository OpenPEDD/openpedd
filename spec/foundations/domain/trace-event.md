---
title: Trace Event
description: ENT-23 · One state change of a trace link, appended and never edited
owner: Kevin
version: "1.0"
updated: "2026-11-08"
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

What the events answer, among others:

| Question | From |
|---|---|
| How long did this requirement take from `designing` to `live`? | The first and last `spec` events |
| Which stories touched this module in the last month? | `origin` events, by module |
| Where do changes get stuck? | The time between events, per kind |
| What happened to this PRD since it went live? | Every event of its requirements since then |
