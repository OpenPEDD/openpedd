---
title: Merge Gate
description: ENT-09 · The only way into the spec
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

# ENT-09 · Merge Gate

A merge gate is **the only place where something enters the spec**. There are four:

| Gate | At the end of | Decided by |
|---|---|---|
| `spec-approval` | `specify` | A person |
| `architecture-merge` | `architect` | A person; automatic in `delegated` mode when the deltas touch only the how ([`RULE-16`](../rules/cycle.md#rule-16)) |
| `design-merge` | `design` | A person |
| `acceptance-merge` | `accept` | A person |

**Conflicts.** `architect` and `design` run in parallel and may touch the same ID. The one that merges
second shows the conflict in its `Delta Report`, and the person chooses. `plan` does not start while
either gate is open ([`RULE-19`](../rules/cycle.md#rule-19)).
