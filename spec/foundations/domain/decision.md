---
title: Decision
description: ENT-18 · A record that closes a question
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

# ENT-18 · Decision

A decision record closes a question ([`RULE-08`](../rules/writing.md#rule-08)). There are two kinds:

| Kind | ID | Closes |
|---|---|---|
| Decision | `DEC-nn` | A `Q-nn` about the product, the business or the framework |
| Architecture decision | `ADR-nn` | A technical choice made in `architect`: context, options, decision, consequences |

| Field | What it holds |
|---|---|
| `id` | `DEC-nn` or `ADR-nn` |
| `closes` | The `Q-nn` it answers, if any |
| `decision` | What was decided |
| `why` | The reason, in a few lines |
| `date` | When it was decided |

**The full reason lives in the document that implements the decision**, in prose. The record keeps
the decision and a short why: a reason far from what it explains is not read. One file per record,
in `decisions/`, within 1,000 tokens.
