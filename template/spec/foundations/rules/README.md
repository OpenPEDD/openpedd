---
title: Rules
description: How rules are written
owner: <owner>
version: "1.0"
updated: "2026-11-20"
source: spec/foundations/rules/README.md@1.4
---

A rule is something **every module, stage or document follows**. A rule of a single module lives in
its PRD; a rule about an entity's states lives in the entity. How the spec itself is written and how
the stages work are OpenPEDD's rules ([writing](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md), [cycle](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/cycle.md)), not
repeated here.

This is where the product's cross-module **business rules** go: *"a trial falls to the free plan, it
does not switch off"* applies to billing, the app and the emails at once.

**Empty.** No rule is written yet ([`ENT-02`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/domain/foundation.md)).

| File | Rules | About |
|---|---|---|

## How a rule is written

```markdown
## RULE-nn · <the rule, as a sentence> [#rule-nn]

<What it requires, in a few lines.> **<Why, in one bold sentence.>**
```

| Rule | Why |
|---|---|
| The heading is the rule itself, not its topic | It can be followed from the index alone |
| One rule, one heading, one anchor | Other documents link to it |
| A rule says what to do; an example table only when the rule is easy to misread | [`RULE-07`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-07) |
| Budget: 2,000 tokens per file; a new file by subject beyond it | [`RULE-04`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-04) |
