---
title: Context Pack
description: ENT-13 · The only thing an agent reads while it works
owner: Kevin
version: "1.1"
updated: "2026-11-09"
---

# ENT-13 · Context Pack

A context pack is **everything an agent receives for one stage or one task, and nothing else**
([`RULE-11`](../rules/cycle.md#rule-11)). It is assembled from the task in the tracker and the parts of
the spec that the stage names, in one call to the MCP (`get_context_for`).

| Field | What it holds |
|---|---|
| `for` | The stage, or the task (`plan` builds one per task) |
| `ids` | The requirements, criteria and contracts in scope |
| `foundations` | The foundations the stage names ([`ENT-02`](foundation.md)) |
| `designs` | The mockups that apply: their files on the change branch, and screenshots |
| `decisions` | The `ADR`s and `DEC`s that affect it |
| `tokens` | Its size |

**Budget: 12,000 tokens target, 20,000 max** ([`RULE-04`](../rules/writing.md#rule-04)). If a task's
pack does not fit, the task is badly cut. If an agent is missing something, the stage contract is
fixed, not the agent handed everything.
