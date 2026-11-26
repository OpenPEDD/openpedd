---
title: "CHG-042 · Human time per stage and per piece: summary for Kevin"
description: One page — the step clock built, a hook that records each message's time and never its text, piece kinds on flows, and pedd time
owner: Kevin
version: "1.0"
updated: "2026-11-26"
---

# CHG-042 · Human time per stage and per piece

Stage: `specify`, then `build`. Asked by the studio, to set the weights of its credit catalog from the
hours people really spend, per stage, per person and per kind of piece, on Grupo Origen and InsuNova.

| What | Where |
|---|---|
| **Human time is counted from the messages a person types**: 15 minutes between them, 2 for the last; never the text | [`DEC-35`](../../decisions/DEC-35-human-time.md) |
| How WakaTime, git-hours, timers, Claude Code and function points count effort and size | [`MKT-19`](../../foundations/market/effort-measurement.md) |
| The fields of a `step` event, the `human` event, and piece kinds | [`ENT-23`](../../foundations/domain/trace-event.md#human-time) |
| A flow or a screen names its piece kind | [PRD format](../../modules/README.md#the-sections-of-a-prd-in-order) |
| `init` installs the hook, the union merge and `pieces` in `workspace.yaml` | [the human clock](../../modules/workspace/prd.md#the-human-clock), [`ENT-16`](../../foundations/domain/workspace.md) |
| `pedd time`, a process metric | [process metrics](../../modules/cycle/prd.md#process-metrics) |

Built: `@openpedd/cli` 0.14.0 (`pedd step`, `pedd time`, `pedd init` for the clock, the hook), with its
tests. Its deviations and assumption: [`DLT-0011`](deltas/DLT-0011.md) the clock is `pedd step` until the MCP
exists, [`DLT-0012`](deltas/DLT-0012.md) `init` installs only the clock, [`DLT-0013`](deltas/DLT-0013.md) which step is open
and which pieces a step carries.
