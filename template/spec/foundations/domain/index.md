---
title: Domain
description: Every concept the product is made of, each defined once
owner: <owner>
version: "1.2"
updated: "2026-11-23"
source: spec/foundations/domain/index.md@1.3
---

The domain names every concept the product works with. A PRD that needs one of these references
it; it never redefines it ([`RULE-01`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-01)). How an entity is written is [below](#how-an-entity-is-written).

**Empty.** No entity is defined yet ([`ENT-02`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/domain/foundation.md)).

| ID | Entity | What it is |
|---|---|---|

## What is an entity [#what-is-an-entity]

**An entity is a thing the business talks about, that is one of its own and lives in time.** It passes
all three tests; whatever fails one goes where the table below says.

| Test | Asks | Example that passes |
|---|---|---|
| Named | Do the people of the business say it, in their own words, before any system exists? | *An invoice*, *a request*, *a client* |
| One of its own | Are two with the same data still two? | Invoice `0007` and `0008`, both for 100 |
| Lives in time | Is it created, does it change or move through states, and does someone decide on it? | An invoice goes from `due` to `paid` |

| Fails, because it is | Goes to |
|---|---|
| A role, or what a role may do | `Roles & Permissions` |
| A value: money, a date, a plan, an address | A `Type` of the entity that holds it |
| A part that never lives apart from its owner | A field of that entity, with its type |
| A record only the system needs: a token, a branch, a cache, a log | The data model, in architecture |
| A screen, a step or a message | The PRD that has it |
| A list of what someone did | A trace or history, never an entity |

A **link between two entities** is an entity only when the business names it and decides on it, with a
life of its own: an employment, a contract, a client's delegation to an agency. Otherwise it is a field.
**Kinds of one thing** stay one entity while they share their fields, rules and states; a kind with
states of its own becomes its own entity.

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
