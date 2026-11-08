---
title: "DEC-04 · When a story becomes full"
description: Closes Q-04
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

# DEC-04 · When a story becomes `full`

**Closes:** `Q-04` · **Date:** 2026-11-04

A story moves to `full` when any of these holds: it creates a new entity or module; it touches more
than **5** `FR`/`NFR` or more than **1** module; it touches permissions, billing, data deletion or
outbound communication; it breaks a public contract. A `fix` the spec did not cover becomes a
`story`. The table, with the reason for each criterion, is in
[`modules/tracks`](../modules/tracks/prd.md#when-a-story-becomes-full).

**Why:** beyond those limits it is no longer a thin slice, or it is irreversible or costly, and it
needs the gates of the full track.
