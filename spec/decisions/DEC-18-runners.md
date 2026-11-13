---
title: "DEC-18 · Where each stage runs is set in the workspace, and implementation runs in the cloud"
description: Local, cloud or self-hosted sessions per stage, and the quota guard before a batch
owner: Kevin
version: "1.0"
updated: "2026-11-12"
---

# DEC-18 · Where each stage runs is set in the workspace, and implementation runs in the cloud

**Date:** 2026-11-12

`workspace.yaml` says where each stage runs: `local`, `cloud` or `self-hosted`. By default the
stages run with the person (`specify`, `architect`, `design`) and `plan` run locally, and `build`
and `verify` run in the cloud, one session per task. Before launching a batch, `pedd` checks the plan's
quota. The detail is in [`ARCH-12`](../foundations/architecture/running.md#where-agents-run).

| Option | Why not |
|---|---|
| Choosing by hand each time | The choice is the same every time, and a forgotten one runs eight tasks on one laptop |
| Choosing by load at launch | It needs a scheduler before there is a need for one |

**Why:** the person is the bottleneck in the interactive stages, and machines in the delegated ones.
A cloud session costs the same tokens as a local one, with no machine to buy.

**Measured on Reclee's automations (2026-11-12):** the whole feature cost about 1,540 M tokens, about
USD 620 at API prices; implementation, 740 M and USD 370, about 30 % of a week of a Max plan. Each
model call reread about 275,000 tokens of context, and rereading was 95 % of the cost: **the size of
the context pack saves more than any choice of machine.**
