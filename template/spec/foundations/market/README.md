---
title: Market
description: How market documents are written — outside facts that expire
owner: <owner>
version: "1.2"
updated: "2026-11-24"
source: spec/foundations/market/README.md@1.15
---

**Market holds what we measured outside**: competitors, tools, market size, studies, prices others
charge, and **the prices of the providers the product runs on**, which `architect` costs its options with. **Business holds what we decided.** The difference matters because outside facts expire:
a market document carries the date it was surveyed and is reviewed when it goes stale.

**Empty.** No market document is written yet ([`ENT-02`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/domain/foundation.md)).

| Document | ID | Holds |
|---|---|---|

## How a market document is written

| Rule | Why |
|---|---|
| The `description` ends with `Surveyed <date>` | It is the fact that tells whether to trust it |
| Every figure names its source | An unsourced figure cannot be checked again |
| A reference read for an architecture decision records what it does, where it breaks (from its code and issues) and the date read | `architect` reads it once; the next feature does not read it again |
| A provider's price records the plan, the unit and the date | A cost computed from an undated price cannot be redone |
| It describes; it does not decide | A decision taken from it goes to Business, a module PRD or a `DEC`, citing the `MKT` |
| A change outside is recorded as a change | Here, unlike the rest of the spec, what changed outside is the content |
| Budget: 2,000 tokens | [`RULE-04`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-04) |
