---
title: "CHG-037 · Business use cases and the map of a definition: summary for Kevin"
description: One page — what changed in the framework, asked while mapping Grupo Origen's business
owner: Kevin
version: "1.0"
updated: "2026-11-24"
---

# CHG-037 · Business use cases and the map of a definition

Stages: `specify` and `build`. Asked mapping Grupo Origen: are business use cases only for outside
actors, where does internal work go, and is a PRD a system use case?

| What | Where |
|---|---|
| How a business is analyzed before its software, in what order, and the three kinds of business use case, surveyed | [`MKT-16`](../../foundations/market/analysis-order.md) |
| **Every level of a definition, in order**: what it is, the question it answers, where it lives, who writes it, what it feeds; a PRD's flows are its system use cases, and a PRD holds more | [`ARCH-24`](../../foundations/architecture/definition-map.md) |
| The as-is lists its **business use cases**, `core`, `supporting` or `management`; every process belongs to one; `map-judge` checks it | [map, business mode](../../modules/map/prd.md#business-mode) |
| `use-cases` draws them in the business's boundary with their business actors; `business` links each to its processes; two new loose items | [views](../../modules/views/business.md), `FR-VEW-21`; [loose items](../../modules/views/prd.md#loose-items) |
| The names | [Glossary](../../foundations/glossary.md) |

Built: `@openpedd/reader` 0.10.0 (`useCases` in the business map, `BUC-nn` as an ID, both views),
`@openpedd/cli` 0.8.0, with tests.
