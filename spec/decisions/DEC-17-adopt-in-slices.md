---
title: "DEC-17 · A running product is adopted in small changes, from a list of its gaps"
description: How a product already in production reaches the full framework
owner: Kevin
version: "1.0"
updated: "2026-11-11"
---

# DEC-17 · A running product is adopted in small changes, from a list of its gaps

**Date:** 2026-11-11

`pedd adopt` lists, per module, what the product lacks to work as the framework defines it: PRDs,
criteria, tests, docs, anchors. Each gap becomes a small change, ordered by risk and by how often the
module changes, and runs through the cycle like any other, on the `cover` track. An existing spec is
imported and checked against the code, not rewritten. The detail is in
[`modules/workspace`](../modules/workspace/prd.md#adopting-a-running-product).

| Option | Why not |
|---|---|
| One command that adopts everything at once | The costliest, the first to go stale ([`DEC-13`](DEC-13-map-on-demand.md)), and PRs nobody can review |
| Only on demand, as each change touches a module | Never ends, and the debt stays out of sight |

**Why:** it ends, it is reviewed in pieces, and it uses the same cycle as everything else.
