---
title: Domain
description: Every concept the product is made of, each defined once
owner: <owner>
version: "1.3"
updated: "2026-11-23"
source: spec/foundations/domain/index.md@1.4
---

The domain names every concept the product works with. A PRD that needs one of these references
it; it never redefines it ([`RULE-01`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-01)). How an entity is written is [below](#how-an-entity-is-written).

**Empty.** No entity is defined yet ([`ENT-02`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/domain/foundation.md)).

| ID | Entity | What it is |
|---|---|---|

## What is an entity [#what-is-an-entity]

As the entity-relationship model defines it ([`MKT-14`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/market/modeling-standards.md#entity-er-model), [`RULE-29`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-29)): **an entity is
an object, person, event or concept of the real world, physical or abstract, about which the product
keeps data, and that is told apart from others like it.**

| It has | Means | Written as |
|---|---|---|
| A distinguishable existence | Each one is unique and identified, by a key | `Key` |
| Attributes of its own | Properties that describe it: a client's name, mail, date of birth | `Fields` |
| Relevance to the domain | It matters to the problem, not a detail of something else | Its paragraph says why |
| Relationships | It links to other entities, with a cardinality: a client places many orders | A field whose type names the entity |
| A kind | **Strong**: exists by itself, with its own key. **Weak**: depends on an owner to exist, and is identified by the owner's key plus its own. **Associative**: a many-to-many relationship with attributes of its own | `Kind` |

| What is not an entity | Goes to |
|---|---|
| A property of one: a name, an amount, a date | A field of that entity, with its type |
| A link with no attributes of its own | A field of one of the two entities |
| A role, or what a role may do | `Roles & Permissions` |
| A record only the system needs: a token, a branch, a cache | The data model, in architecture |
| A screen, a step or a message | The PRD that has it |

## How an entity is written [#how-an-entity-is-written]

One file per entity: `# ENT-nn · <Name>`, a paragraph on what it is and why it matters, a line
`**Kind:** strong` (or `weak, of ENT-nn`, or `associative, of ENT-nn and ENT-nn`) `· **Key:** <fields>`,
then its tables, under these headings, which the `entities` and `states` views read ([views](https://github.com/openpedd/openpedd/blob/main/spec/modules/views/prd.md#the-views)):

| Heading | Columns | Rule |
|---|---|---|
| `Fields` | `Field` · `Type` · `What it holds` | A field that names another entity, by link or by ID, is a relationship; its type gives the cardinality: `ENT-nn` one, `ENT-nn?` zero or one, `ENT-nn[]` many |
| `States` | `State` · `Means` | Only when it has states |
| `Transitions` | `From` · `To` · `When` · `By` | As UML's state machine ([`MKT-14`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/market/modeling-standards.md#state-machine-uml)): the first state is where the initial pseudostate leads; `When` is the trigger and its guard, `event [condition]`; `By` is the role or stage that fires it; a state with no row out is final |

`Type` may be left out of an entity that is never stored. A PRD cites the entity, never copies these
tables; the modules that use an entity are the ones whose PRDs cite it
([`RULE-27`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-27)).
