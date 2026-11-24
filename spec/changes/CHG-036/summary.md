---
title: "CHG-036 · Foundations first, PRDs one at a time: summary for Kevin"
description: One page — what changed in the framework, found mapping Grupo Origen's business
owner: Kevin
version: "1.2"
updated: "2026-11-24"
---

# CHG-036 · Foundations first, PRDs one at a time

Stages: `specify` and `build`. Found mapping a client's business (Grupo Origen) with `/map --business`:
the map gave eleven modules at once, and writing eleven PRDs before any answer is unsustainable.

| What | Where |
|---|---|
| **The foundations are laid for where the product is going; the PRDs come one at a time**; a PRD that needs to change a foundation raises a `Q` | [`RULE-30`](../../foundations/rules/definition.md#rule-30) |
| The to-be lists the later modules too, and the foundations are derived for them | [map, business mode](../../modules/map/prd.md#business-mode) |
| The roadmap holds the later modules; each PRD is written when its module is next | [open](../../open/README.md#the-roadmap), and its guide in `template/` |
| A module listed `unmapped` exists for the loose check; an entity another document cites is not loose while modules wait | [views](../../modules/views/prd.md#loose-items), `FR-VEW-20` |
| A business map file has 8,000 tokens; `budgets` takes a folder or a file | [`RULE-04`](../../foundations/rules/writing.md#rule-04), [`ENT-16`](../../foundations/domain/workspace.md) |
| The template README: push `main` and `dev` first; an agent's session branch moves to the one `pedd branch` names before its PR | `template/README.md`, [`ARCH-06`](../../foundations/architecture/branches.md#creating-a-branch) |

Built: `@openpedd/reader` 0.9.0 (`unmapped` in the model; the `business` and `entities` views),
`@openpedd/cli` 0.7.0 (`budgetOf` by folder), the scripts' `check:size`, with tests.

## Business use cases and the map of a definition

Asked mapping Grupo Origen: are business use cases only for outside
actors, where does internal work go, and is a PRD a system use case?

| What | Where |
|---|---|
| How a business is analyzed before its software, in what order, and the three kinds of business use case, surveyed | [`MKT-16`](../../foundations/market/analysis-order.md) |
| **Every level of a definition, in order**: what it is, the question it answers, where it lives, who writes it, what it feeds; a PRD's flows are its system use cases, and a PRD holds more | [`ARCH-24`](../../foundations/architecture/definition-map.md) |
| The as-is lists its **business use cases**, `core`, `supporting` or `management`; every process belongs to one; `map-judge` checks it | [map, business mode](../../modules/map/prd.md#business-mode) |
| `use-cases` draws them in the business's boundary with their business actors; `business` links each to its processes; two new loose items | [views](../../modules/views/business.md), `FR-VEW-21`; [loose items](../../modules/views/prd.md#loose-items) |
| **Activity diagrams as RUP draws a business use case**: a step's `Object` (`ENT-nn · <state>`) is an object node with its object flow; each business use case gets an overview of its processes as macro activities | [`MKT-14`](../../foundations/market/modeling-standards.md#activity-diagram-uml), [map](../../modules/map/prd.md#business-mode), `FR-VEW-22` |
| The map of a definition is linked from the README, the spec's README, AGENTS.md and the template | `README.md`, [spec](../../README.md) |
| The names | [Glossary](../../foundations/glossary.md) |

Built: `@openpedd/reader` 0.11.0 (`useCases` in the business map, `BUC-nn` as an ID, both views; object
nodes and overviews in `activity`), `@openpedd/cli` 0.9.0, with tests.
