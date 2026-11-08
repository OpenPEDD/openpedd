---
title: History Entry
description: ENT-17 · One line per version of a document, kept apart from the document
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

# ENT-17 · History Entry

Every version of every document gets one history entry. **The history lives apart from the
document** ([`RULE-02`](../rules/writing.md#rule-02)): the reader shows it folded, and the navigation,
the search and the MCP do not see it by default. Whoever reads a document reads only what governs.

| Field | Example |
|---|---|
| `path` | `modules/specify/prd.md` |
| `id` | `FR-SPC-03`, when the change touches one ID |
| `version` | `1.3 → 1.4` |
| `date` | `2026-11-04` |
| `change` | `CHG-031` |
| `story` | `REC-412` |
| `stage` | `design` |
| `summary` | What changed, in one line. Not why: the why lives in the document |

It is stored twice: a table to read (`history/<same path>.md`) and `history/history.jsonl`, so an
agent can ask *"what changed in `FR-JOB` since October 1"* without reading prose. Budget: 80 tokens
per entry.
