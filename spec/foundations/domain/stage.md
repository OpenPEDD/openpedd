---
title: Stage
description: ENT-10 · One step of the cycle
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

# ENT-10 · Stage

A stage is one step of the cycle, with one responsibility. Each one is a module in `product/`, and
the order and the gates between them are in [`product/cycle`](../../product/cycle/prd.md).

| Field | What it holds |
|---|---|
| `name` | `map` · `specify` · `architect` · `design` · `plan` · `build` · `verify` · `accept` · `publish` · `measure` |
| `mode` | See below |
| `inputs` | What it needs to start, and where it comes from |
| `context_pack` | What its agent reads, with its token budget ([`ENT-13`](context-pack.md)) |
| `outputs` | What it leaves, each with its anchor |
| `judge` | Who reviews it and what has to pass ([`ENT-12`](judge.md)) |
| `gate` | The merge gate at its end, if any ([`ENT-09`](merge-gate.md)) |
| `skills` · `agents` · `tools` | What it runs with ([`ARCH-04`](../architecture/agents.md)) |

| `mode` | Means | Stages |
|---|---|---|
| `interactive` | A person and the AI work together; the person is in the 80 too | `map` · `specify` · `design` · `architect` in `guided` |
| `delegated` | The AI works alone, with a judge | `plan` · `build` · `verify` · `publish` · `measure` · `architect` in `delegated` |
| `human` | A person decides; there is no agent | `accept` |

Every stage's PRD has the same sections: what it is, inputs, context pack, procedure, outputs, judge,
what to keep in mind, skills, agents and tools, per track, and sources.
