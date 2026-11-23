---
title: Rules
description: How rules are written
owner: Kevin
version: "1.7"
updated: "2026-11-23"
---

A rule is something **every module, stage or document follows**. A rule of a single module lives in
its PRD; a rule about an entity's states lives in the entity.

| File | Rules | About |
|---|---|---|
| [writing.md](writing.md) | `RULE-01` to `RULE-09`, `RULE-27`, `RULE-29` | How every document is written, linked, and modeled as the industry does |
| [cycle.md](cycle.md) | `RULE-10` to `RULE-26`, `RULE-29` | How every stage works, how agents talk to people, and how they back a claim |

In a product's spec, this is also where its cross-module **business rules** go: *"a trial falls to
the free plan, it does not switch off"* applies to billing, the app and the emails at once.

## How a rule is written

```markdown
## RULE-nn · <the rule, as a sentence> [#rule-nn]

<What it requires, in a few lines.> **<Why, in one bold sentence.>**
```

| Rule | Why |
|---|---|
| The heading is the rule itself, not its topic | It can be followed from the index alone |
| One rule, one heading, one anchor | Other documents link to it |
| A rule says what to do; an example table only when the rule is easy to misread | [`RULE-07`](writing.md#rule-07) |
| Budget: 2,000 tokens per file; a new file by subject beyond it | [`RULE-04`](writing.md#rule-04) |
