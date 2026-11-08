---
title: Track
description: ENT-11 · The path a change takes through the cycle, by impact
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

# ENT-11 · Track

A track is the path a [`Change`](change.md) takes. **Every change goes through the same cycle, with no
exceptions to the rules**; the track only says which stages have something to do. Which stages run,
per track and per kind of impact, is in [`modules/tracks`](../../modules/tracks/prd.md).

| Track | Is | Human gates |
|---|---|---|
| `full` | A new PRD, or a story that crossed the threshold | 3 or 4 |
| `story` | A user story: a thin vertical slice of an existing PRD | 2 or 3 |
| `fix` | A bug the spec already covered | 1 |
| `chore` | Technical work with no product ID | 0 |

The track is computed from the IDs the change touches, and a person can force `full`. A `fix` that
turns out not to be covered by the spec becomes a `story`: it is a gap, not a bug.
