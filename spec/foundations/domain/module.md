---
title: Module
description: ENT-21 · A part of the product that stands on its own, with its PRDs
owner: Kevin
version: "1.1"
updated: "2026-11-10"
---

# ENT-21 · Module

A module is **a part of the product that stands on its own**: it has its own users' goals, its own
flows and, often, its own owner and its own tracker project. ATS, Talent pool and Career site are
modules of Reclee; `specify` and `build` are modules of OpenPEDD.

A module is described by **one or more PRDs** in `modules/<module>/`. It starts with one; when the PRD
goes over its token budget, it is **split by topic**, not by size
([`RULE-04`](../rules/writing.md#rule-04)): Reclee's AI recruiter has four PRDs (*AI recruiter*,
*changes*, *handoff*, *week*). The flows inside a PRD are what some teams call features.

| Field | What it holds |
|---|---|
| `code` | Three letters, in the requirement IDs: `FR-AIR-09` |
| `title` | Its name, the one the code uses |
| `prds` | Its PRDs, in `modules/<module>/` |
| `owner` | Who answers for it |
| `tracker` | The tracker project it maps to, if any |

## Status

A module's status is that of its least advanced requirement, the same way a PRD's is
([`ENT-03`](requirement.md#lifecycle)). That is how the dashboard opens: product, then module, then
PRD, then requirement.

A module in the index with no PRD yet is **`unmapped`**. `map` moves it out, and every module ends
with its PRD ([`DEC-13`](../../decisions/DEC-13-map-on-demand.md)).
