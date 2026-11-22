---
title: Domain
description: Every concept the product is made of, each defined once
owner: <owner>
version: "1.1"
updated: "2026-11-22"
source: spec/foundations/domain/index.md@1.2
---

The domain names every concept the product works with. A PRD that needs one of these references
it; it never redefines it ([`RULE-01`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-01)). How an entity is written is [below](#how-an-entity-is-written).

**Empty.** No entity is defined yet ([`ENT-02`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/domain/foundation.md)).

| ID | Entity | What it is |
|---|---|---|

## How an entity is written [#how-an-entity-is-written]

One file per entity: `# ENT-nn · <Name>`, a paragraph on what it is, then its tables, under these
headings, which the `entities` and `states` views read ([views](https://github.com/openpedd/openpedd/blob/main/spec/modules/views/prd.md#the-views)):

| Heading | Columns | Rule |
|---|---|---|
| `Fields` | `Field` · `Type` · `What it holds` | A field that names another entity, by link or by ID, is a relation; its type says how many: `ENT-07[]` |
| `States` | `State` · `Means` | Only when it has states |
| `Transitions` | `From` · `To` · `When` · `By` | Every state but the first is reached by one row; `By` is the role or stage that moves it |

`Type` may be left out of an entity that is never stored. A PRD cites the entity, never copies these
tables; the modules that use an entity are the ones whose PRDs cite it
([`RULE-27`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-27)).
