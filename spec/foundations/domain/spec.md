---
title: Spec
description: ENT-01 · The single source of truth of a product
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

# ENT-01 · Spec

The spec is **what governs** in a product: what it does, for whom, and the rules it follows.
Everything else (code, mockups, tests, API Reference, Help Center, tasks) is a
[`Derived Artifact`](derived-artifact.md) of it. It lives in its own repo (`split`) or in a `spec/` folder of the product repo (`mono`)
([`ENT-16`](workspace.md)) and is read by people through the reader and by agents through the MCP.

## Layers

| Layer | Folder | Holds | IDs |
|---|---|---|---|
| Foundations | `foundations/` | What every stage reads first ([`ENT-02`](foundation.md)) | `BIZ` · `ENT` · `RULE` · `ARCH` · `SEC` · `INT` · `EVT` |
| Product | `product/<module>/prd.md` | One PRD per module: flows, requirements, criteria, contracts | `FR-<MOD>-nn` · `NFR-<MOD>-nn` |
| Decisions | `decisions/` | Records that close questions, and architecture decisions | `DEC-nn` · `ADR-nn` |
| Open | `open/` | What does not govern yet ([`ENT-19`](open-item.md)) | `Q-nn` |
| Changes | `changes/<CHG>/` | Work in flight: deltas and reports. `archive/` when done | `CHG-nnn` · `DLT-nnnn` |
| History | `history/` | One line per version of each document ([`ENT-17`](history-entry.md)) | — |
| Designs | `designs/` | Mockups, with their anchors | — |

## Fields of a document

| Field | What it says |
|---|---|
| `title` · `description` | Its name and one line |
| `owner` | Who answers for it |
| `version` | Bumps with every merged change |
| `updated` | The real date of the last merge |
| `status` | In `product/` only: the lifecycle of [`ENT-03`](requirement.md#lifecycle) |

## Invariants

| Invariant | Why |
|---|---|
| Every ID is unique across the spec and never reused | [`RULE-03`](../rules/writing.md#rule-03) |
| Only `specify` writes it | [`RULE-10`](../rules/cycle.md#rule-10) |
| Each ID has a content hash, recomputed when it merges | It is what anchors compare against ([`ENT-14`](anchor.md)) |
| A spec may reference another spec, read-only, by ID | A private spec can build on a public one without redefining it ([`ARCH-03`](../architecture/workspace.md)) |
