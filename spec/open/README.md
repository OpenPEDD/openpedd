---
title: Open
description: How questions, ideas and the roadmap are written
owner: Kevin
version: "1.2"
updated: "2026-11-20"
---

Nothing here governs ([`ENT-19`](../foundations/domain/open-item.md)). An agent never reads it as a
rule, and it never moves into the body of the spec except through a decision or a change.

| File | Holds | Format |
|---|---|---|
| [questions.md](questions.md) | What is to be decided | A table: ID, the question as a question, the proposal, what it blocks |
| [ideas.md](ideas.md) | Loose ideas | A bullet each, one or two lines, no ID |
| [roadmap.md](roadmap.md) | What comes next, in order | A table: step, what it leaves |
| [backlog.md](backlog.md) | What was agreed and is not written yet | Tables by subject |

## Rules

| Rule | Why |
|---|---|
| A question is written as a question, with a proposal if there is one | It can be answered by reading it once |
| A question closes only with a `DEC` that names it, and leaves this table | [`RULE-08`](../foundations/rules/writing.md#rule-08) |
| A blocking question says what it blocks | The stage that needs it does not pass its judge until it closes |
| An idea that becomes work becomes a change; it leaves this file | Nothing lives in two places |

## The roadmap [#the-roadmap]

Each step is a change, or a group of changes, in the order they land.

| Rule | Why |
|---|---|
| **A product with screens and no `Brand System` gets a branding change before its first screens**: colors, type, tokens, the logo and the first components in `packages/ui`, extracted from what exists or chosen ([`ENT-02`](../foundations/domain/foundation.md)) | `design` requires it; planned, it does not stop the first screen halfway |
| A product mapped as a business takes its first steps from the to-be of its `Business Map`: the modules, in its order ([map](../modules/map/prd.md#business-mode)) | The order was approved by the client with the map |
