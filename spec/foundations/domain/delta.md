---
title: Delta
description: ENT-07 · A proposed change to the spec, per ID
owner: Kevin
version: "1.2"
updated: "2026-11-23"
---

# ENT-07 · Delta

A delta is a proposed change to one ID of the spec. Every stage except `specify` writes deltas, never
the spec itself ([`RULE-10`](../rules/cycle.md#rule-10)). A delta enters the spec only through a
[`Merge Gate`](merge-gate.md).

| Field | What it holds |
|---|---|
| `id` | `DLT-nnnn` |
| `target` | The ID it changes: `FR-JOB-03` |
| `op` | `ADDED` · `MODIFIED` · `REMOVED` |
| `type` | See below |
| `stage` | The stage that wrote it |
| `change` | Its [`Change`](change.md) |
| `reason` | Why, in one line |
| `alternative` | The other option there was |
| `task` | The task that wrote it, if any |
| `revert` | For an `assumption` or a `deviation`: where it lives (file, function, migration) and what to change to undo it |
| `evidence` | What backs it: the ID or the file that says it, or `guess` |
| `if_no` | What changes, in one line, if the person rejects it |
| `weight` | `high` · `medium` · `low`, with its factors. Computed ([`ARCH-23`](../architecture/weight.md)) |
| `impact` | The derived artifacts that go `stale` if it merges. Computed |
| `decision` | `keep` · `change` · `reject`, set at its gate |

| `type` | Written by | Means |
|---|---|---|
| `proposal` | `architect` · `design` | An improvement or a correction found while working |
| `assumption` | `plan` · `build` | A product gap the AI filled ([`RULE-13`](../rules/cycle.md#rule-13)) |
| `deviation` | `build` | The spec could not be met as written |
| `finding` | `verify` · `measure` | Something built does not match the spec, or is missing |

On merge, the delta is written into the body **in the present tense**, a line goes to the history,
and the hash of its target is recomputed.
