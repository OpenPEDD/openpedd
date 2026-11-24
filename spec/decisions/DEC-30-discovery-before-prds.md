---
title: "DEC-30 · Every business is discovered with the same pieces, before any PRD"
description: The standard discovery every client goes through, where each piece lives, and the industry glossaries reused across projects
owner: Kevin
version: "1.0"
updated: "2026-11-24"
---

# DEC-30 · Every business is discovered with the same pieces, before any PRD

**Date:** 2026-11-24

**Every client that changes how its organization works answers the same pieces, in this order,
before any PRD is written.** The PRDs come last, one module at a time
([`RULE-30`](../foundations/rules/definition.md#rule-30)). It extends
[`DEC-24`](DEC-24-business-map.md); how each piece is drawn is `map`'s business mode
([map](../modules/map/prd.md#business-mode)).

| # | Piece | Lives in |
|---|---|---|
| 1 | Goal, metric, and what is left out | `Business Context` ([`ENT-02`](../foundations/domain/foundation.md)) |
| 2 | Organization chart | `Business Map`, `People` |
| 3 | Glossary, from the industry's first | `Glossary`, linking the [industry glossary](../../industries/README.md) |
| 4 | Business use cases, with `«include»` and `«extend»` | `Business Map`, `Business use cases` ([`MKT-16`](../foundations/market/analysis-order.md#a-business-use-case)) |
| 5 | Processes, step by step, with how often and how many | `Business Map`, `Processes` |
| 6 | Tools, spreadsheets, and the documents that come in and go out | `Business Map`, `Tools and spreadsheets` and `Documents` |
| 7 | Rules and regulations | `Business Map`, `Rules and regulations` |
| 8 | Pains | `Business Map`, `Pains` |
| 9 | Entities and their states | `Domain Model`, derived |
| 10 | Roles and permissions | `Roles & Permissions`, derived |
| 11 | To-be, modules and order | `Business Map` to-be; the roadmap |

**An industry glossary is researched on the web once, and kept in `industries/<industry>/`** of the
framework. Each project links the terms it uses and writes only its own differences; a project in a new
industry adds its glossary there first. The `glossary` view takes a link to it as defined
(`FR-VEW-24`).

| Option | Discarded, and why |
|---|---|
| Each project researches its industry's words again | The same words, researched twice, drift |
| The industry glossary copied into each project | One thing, one place ([`RULE-01`](../foundations/rules/writing.md#rule-01)) |
| Goal and scope in the `Business Map` | They are the product's, not the organization's: `Business Context` holds them |
| Business use cases only from the PRDs' flows | A PRD is the last piece; the client must see who does what before it |

**Why:** each client was mapped with a different list, and what was missing was found late. One list,
the same for all, says what to ask and when discovery is done.
