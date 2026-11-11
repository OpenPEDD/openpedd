---
title: Open
description: How questions, ideas and the roadmap are written
owner: Kevin
version: "1.1"
updated: "2026-11-11"
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
