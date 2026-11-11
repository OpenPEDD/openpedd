---
title: "DEC-13 · An existing product is mapped module by module, until every module has its PRD"
description: How map reaches a complete spec
owner: Kevin
version: "1.0"
updated: "2026-11-10"
---

# DEC-13 · An existing product is mapped module by module, until every module has its PRD

**Date:** 2026-11-10

`map` writes the foundations and the index of modules first. Each PRD is written when a change first
touches its module, or all at once with `/map --all`. **The end state does not change: every module
has its PRD, and every PRD is maintained, because the spec is the source of truth of the whole
software.** `pedd status` shows how many modules are still `unmapped`. The detail is in
[`modules/map`](../modules/map/prd.md).

**Why:** a PRD written just before a change touches it is checked by that change. A bulk pass over
modules nobody is touching costs the most and goes stale first.
