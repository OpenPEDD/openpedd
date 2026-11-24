---
title: "CHG-038 · The same discovery for every client, before any PRD: summary for Kevin"
description: One page — the standard pieces every client answers, business use cases with include and extend, and industry glossaries
owner: Kevin
version: "1.0"
updated: "2026-11-24"
---

# CHG-038 · The same discovery for every client, before any PRD

Stage: `specify`. Found mapping InsuNova: each client was mapped with a different list, the glossary was
researched from scratch, and the rules and the documents had no place.

| What | Where |
|---|---|
| **Every client answers the same eleven pieces, in order, before any PRD**: goal and scope, organization, glossary, business use cases, processes, tools and documents, rules, pains, entities and states, roles, to-be | [`DEC-30`](../../decisions/DEC-30-discovery-before-prds.md) |
| Business use cases relate with `«include»` and `«extend»` (`Includes`, `Extends` with its condition; a step naming another business use case's process is an include), as RUP defines them | [`MKT-16`](../../foundations/market/analysis-order.md#a-business-use-case), [map, business mode](../../modules/map/prd.md#business-mode) |
| `use-cases` draws them from the map alone, before any PRD; a missing end is loose | [views](../../modules/views/business.md), `FR-VEW-23` |
| The as-is holds `Documents` (in and out, how many) and `Rules and regulations`; `How often` says how many too | [map, business mode](../../modules/map/prd.md#business-mode) |
| **Industry glossaries**, researched on the web once and linked by each project; the first, property insurance in Argentina for buildings | `industries/`, `FR-VEW-24` |
| Goal, metric and what is left out stay in `Business Context` | [`ARCH-24`](../../foundations/architecture/definition-map.md), [`ARCH-18`](../../foundations/architecture/definition.md) |
| The interview asks for the map first | `skills/specify-interview/SKILL.md` |

Built: `@openpedd/reader` 0.12.0 (`includes` and `extends` on each business use case, `documents` and
`rules` in the as-is, web links in the glossary), `@openpedd/cli` 0.10.0, with tests.
