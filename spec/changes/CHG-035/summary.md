---
title: "CHG-035 · Foundations first, PRDs one at a time: summary for Kevin"
description: One page — what changed in the framework, found mapping Grupo Origen's business
owner: Kevin
version: "1.0"
updated: "2026-11-23"
---

# CHG-035 · Foundations first, PRDs one at a time

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

Built: `@openpedd/reader` 0.8.0 (`unmapped` in the model; the `business` and `entities` views),
`@openpedd/cli` 0.6.0 (`budgetOf` by folder), the scripts' `check:size`, with tests.
