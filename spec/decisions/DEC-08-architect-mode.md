---
title: "DEC-08 · architect.mode: guided by default"
description: How architecture runs, and how to change it
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

# DEC-08 · `architect.mode`: `guided` by default

**Date:** 2026-11-04

**`guided` on every track.** It changes in three ways, and the most specific wins:

| Where | Example |
|---|---|
| In the command | `/architect --delegated` or `/architect --guided` |
| In the story | A tracker label: `architect:delegated` |
| In the configuration | `stages.architect.mode: delegated` |

In `delegated`, `architecture-merge` is automatic when the deltas touch only the how (`ARCH`,
`ADR`). If they touch the what (`FR`, `NFR`, `ENT`), a person decides anyway
([`RULE-16`](../foundations/rules/cycle.md#rule-16)).

**Why:** architecture is one of the most manual stages; whoever wants to delegate it chooses to.
