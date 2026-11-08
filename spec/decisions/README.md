---
title: Decisions
description: How decisions and architecture decisions are written
owner: Kevin
version: "1.0"
updated: "2026-11-08"
---

One file per record, named `<ID>-<slug>.md` ([`ENT-18`](../foundations/domain/decision.md)).

| Kind | ID | Closes | Written by |
|---|---|---|---|
| Decision | `DEC-nn` | A `Q-nn` about the product, the business or the framework | `specify`, or `accept` when a delta needs one |
| Architecture decision | `ADR-nn` | A technical choice | `architect` |

## A decision

```markdown
# DEC-nn · <the decision, as a sentence>

**Closes:** `Q-nn` · **Date:** YYYY-MM-DD

<What was decided: a table if it has structure, a paragraph if not.>

**Why:** <the reason, in a few lines.>
```

## An architecture decision (MADR)

```markdown
# ADR-nn · <the decision, as a sentence>

**Date:** YYYY-MM-DD · **Answers:** <the NFR IDs>

| Option | Cost | Risk | Meets |
|---|---|---|---|

**Decision:** <which option>. **Consequences:** <what it makes easier and harder>.
```

## Rules

| Rule | Why |
|---|---|
| The title is the decision, not the topic: *"The Cloud stays private"*, not *"Visibility"* | It can be read without opening it |
| The full reason lives in the document that implements it; here, a short why | A reason far from what it explains is not read |
| A decision is not edited after it is merged: a new one supersedes it and says which | The record is history |
| Budget: 1,000 tokens | [`RULE-04`](../foundations/rules/writing.md#rule-04) |
