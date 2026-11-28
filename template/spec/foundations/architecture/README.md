---
title: Architecture
description: How architecture documents are written
owner: <owner>
version: "1.2"
updated: "2026-11-24"
source: spec/foundations/architecture/README.md@1.15
---

Architecture says **how the product is built and run**. What it is and what it must do live in the
domain and the modules; a technical choice with options is an `ADR` in `decisions/`.

**Empty.** No architecture document is written yet ([`ENT-02`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/domain/foundation.md)).

| Document | ID | Holds |
|---|---|---|

## How an architecture document is written

| Rule | Why |
|---|---|
| One subject per document, titled by what it explains | Two subjects in one file is what goes over budget |
| A diagram at the C4 level that fits: context, container or component | The reader knows how deep it goes |
| Every `NFR` it answers is cited by ID | It is how freshness reaches it |
| The area's document ends with its **decisions table**: one row per local decision, with what was discarded, status and date ([decisions](../../decisions/README.md#where-an-architecture-decision-goes)) | The implementing session starts with every decision, and nobody reopens what is closed |
| The reason for a choice is in its `ADR` or its row; the document states what holds | [`RULE-02`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-02) |
| Budget: 2,000 tokens | [`RULE-04`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-04) |
