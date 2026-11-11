---
title: "DEC-12 · The list of technologies is derived, not written in the spec"
description: Where a project's stack is recorded
owner: Kevin
version: "1.0"
updated: "2026-11-10"
---

# DEC-12 · The list of technologies is derived, not written in the spec

**Date:** 2026-11-10

`pedd init` and `pedd doctor` write the detected stack to `.pedd/stack.json`, each technology with the
file that proves it. The spec holds what the code cannot say: why it was chosen, and what must not
change. The detail is in [`modules/workspace`](../modules/workspace/prd.md#the-stack).

**Why:** the code already says what it uses, and a copy goes stale. BMAD removed stack lists from its
project context for that reason ([`MKT-02`](../foundations/market/onboarding.md)).
