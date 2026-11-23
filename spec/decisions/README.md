---
title: Decisions
description: How decisions and architecture decisions are written
owner: Kevin
version: "1.2"
updated: "2026-11-22"
---

One file per record, named `<ID>-<slug>.md` ([`ENT-18`](../foundations/domain/decision.md)).

| Kind | ID | Closes | Written by |
|---|---|---|---|
| Decision | `DEC-nn` | A `Q-nn` about the product, the business or the framework | `specify`, or `accept` when a delta needs one |
| Architecture decision | `ADR-nn` | A technical choice with real alternatives; smaller ones are rows in the area's decisions table ([below](#where-an-architecture-decision-goes)) | `architect` |

## A decision [#a-decision]

```markdown
# DEC-nn · <the decision, as a sentence>

**Closes:** `Q-nn` · **Supersedes:** `DEC-nn` · **Date:** YYYY-MM-DD

<What was decided: a table if it has structure, a paragraph if not.>

**Why:** <the reason, in a few lines.>
```

## An architecture decision (MADR)

```markdown
# ADR-nn · <the decision, as a sentence>

**Status:** proposed · accepted · superseded by ADR-nn · **Supersedes:** `ADR-nn` · **Date:** YYYY-MM-DD · **Answers:** <the NFR IDs>

| Option | Cost | Risk | Meets |
|---|---|---|---|

**Decision:** <which option>. **Consequences:** <what it makes easier and harder>.
```

## Where an architecture decision goes

A feature can close dozens of technical decisions. One file each would bury the few that matter.

| The decision | Goes | Example |
|---|---|---|
| Has real alternatives and lasting consequences: hard to undo, or it shapes other modules | An `ADR` file | Store the workflow as a JSON graph, not as node tables |
| Is local, or follows from an `ADR` | A row in the **decisions table** of the area's `ARCH` document | Retry a failed step three times with backoff |

The decisions table has the same columns everywhere:

| # | Decision | Discarded, and why | Status | Date |
|---|---|---|---|---|

A row that grows a second option worth a table becomes an `ADR`, and the row points to it.

## Rules

| Rule | Why |
|---|---|
| The title is the decision, not the topic: *"The Cloud stays private"*, not *"Visibility"* | It can be read without opening it |
| The full reason lives in the document that implements it; here, a short why | A reason far from what it explains is not read |
| A decision is not edited after it is merged: a new one supersedes it and names it in `Supersedes` | The record is history; the `decisions` view draws the chain from that field |
| It cites by ID every requirement, entity, rule, architecture document or module it changes; `Closes`, `Supersedes` and fields left empty are left out | Those citations are its edges in the `decisions` view; one that cites none is loose ([`RULE-27`](../foundations/rules/writing.md#rule-27)) |
| Budget: 1,000 tokens | [`RULE-04`](../foundations/rules/writing.md#rule-04) |
