---
title: Judge
description: ENT-12 · The reviewer of a stage, always another session
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

# ENT-12 · Judge

A judge reviews what a stage produced and says whether the next stage can start. **It is never the
session that generated** ([`RULE-12`](../rules/cycle.md#rule-12)): it starts without the generator's
conversation, receives only the spec and the output, and uses its own model.

| Field | What it holds |
|---|---|
| `name` | `<what-it-checks>-judge`: `cold-read-judge`, `design-judge` |
| `stage` | The stage it judges |
| `checks` | What it verifies |
| `passes_when` | The exit condition |
| `model_role` | `judge`, or `judge_confirm` for the second opinion on a high finding |

| Stage | Judge | Passes when |
|---|---|---|
| `map` | `map-judge` | Every schema entity, route and contract is covered or opened as a `Q` |
| `specify` | `cold-read-judge` · `prd-judge` | Nothing left to guess; every requirement measurable, with its `AC` |
| `architect` | `architecture-judge` | Every `NFR` answered and measurable, consistent with the foundations |
| `design` | `design-judge` | Every `FR` has a screen, every state is there, copy from the glossary |
| `plan` | `analyze-judge` | Every requirement has a task, every `AC` a test, no product decided in the plan |
| `build` | The task's tests and the pipeline checks | All green |
| `verify` | `verify-judge` · `confirm-judge` | No high findings; every `AC` green |
| `publish` | `freshness-judge` | Every derived artifact in scope is `fresh` |

How a judge runs on a Claude Code subscription is in [`ARCH-04`](../architecture/agents.md).
