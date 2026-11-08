---
title: Tracks
description: Which stages each change runs, by the IDs it touches, and when a story becomes full
owner: Kevin
version: "1.0"
updated: "2026-11-04"
status: draft
---

# Tracks

**A story is a vertical slice**: a thin piece that runs through everything, from the spec to the
help. It goes through **the same cycle, with no exceptions to the rules**; the stages that have
nothing to do are **skipped on their own**, from the IDs the change touches. There is one process to
maintain, and small work is fast because it runs only what applies to it.

Vertical slices and the cycle do not compete: the slice says **how the work is cut**; the cycle,
**what each slice goes through**.

## Which stages each change runs

| If the change touches… | `specify` | `architect` | `design` | `plan` → `verify` | `accept` | `publish` |
|---|---|---|---|---|---|---|
| A new PRD (`full`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Only `FR` (`story`) | Delta | — | ✓ | ✓ | ✓ | Help |
| Only `NFR`: an optimization, a new integration (`story`) | Delta | ✓ | — | ✓ | ✓ | If a contract changes |
| `FR` and `NFR` (`story`) | Delta | ✓ | ✓ | ✓ | ✓ | Help, and API if it changes |
| A contract | Delta | ✓ | If visible | ✓ | ✓ | API Reference |
| A bug the spec already covered (`fix`) | — | — | — | `build` → `verify` | Light | — |
| Technical work with no product ID (`chore`) | — | — | — | `build` → `verify` | — | — |

## The `story` track

1. **The person writes the story in the tracker**: *As a…, I want…, so that…*, with its acceptance criteria. That is the starting 10.
2. `specify` in delta mode: the AI writes the **delta** against the IDs it touches, not the whole PRD. It passes the cold read.
3. `spec-approval` of the delta. From here on, the same as the full cycle.

## When a story becomes `full`

A story moves to `full` when **any** of these holds ([`DEC-04`](../../decisions/DEC-04-story-to-full.md)):

| Criterion | Why |
|---|---|
| It creates a new entity or a new module | It changes the domain every stage reads |
| It touches more than **5** `FR`/`NFR`, or more than **1** module | It is no longer a thin slice |
| It touches permissions, billing, data deletion or outbound communication | Irreversible or costly |
| It breaks a public contract | It affects whoever integrates with the API |

The framework computes it from the `specify` delta and says so; a person can force `full` anyway.
The other way round: **a `fix` that turns out not to be covered by the spec becomes a `story`**,
because it is a gap, not a bug. A `fix` the spec did cover counts in the cycle metric.
