---
title: Domain
description: Every concept OpenPEDD is made of, each defined once
owner: Kevin
version: "1.4"
updated: "2026-11-23"
---

The domain names every concept the framework works with. A PRD that needs one of these references
it; it never redefines it ([`RULE-01`](../rules/writing.md#rule-01)).

| ID | Entity | What it is |
|---|---|---|
| `ENT-01` | [Spec](spec.md) | The single source of truth of a product |
| `ENT-02` | [Foundation](foundation.md) | A document every stage reads before working |
| `ENT-03` | [Requirement](requirement.md) | A `FR` or a `NFR`, with its lifecycle |
| `ENT-04` | [Acceptance Criterion](acceptance-criterion.md) | A `Given / When / Then` case that becomes a test |
| `ENT-05` | [Contract](contract.md) | What an action receives, returns and fails with |
| `ENT-06` | [Change](change.md) | One unit of work moving through the cycle |
| `ENT-07` | [Delta](delta.md) | A proposed change to the spec, per ID |
| `ENT-08` | [Report](report.md) | What a person reads to decide on deltas |
| `ENT-09` | [Merge Gate](merge-gate.md) | The only way into the spec |
| `ENT-10` | [Stage](stage.md) | One step of the cycle |
| `ENT-11` | [Track](track.md) | The path a change takes, by impact |
| `ENT-12` | [Judge](judge.md) | The reviewer of a stage |
| `ENT-13` | [Context Pack](context-pack.md) | The only thing an agent reads |
| `ENT-14` | [Anchor](anchor.md) | The mark that says where a derived artifact came from |
| `ENT-15` | [Derived Artifact](derived-artifact.md) | Anything produced from the spec |
| `ENT-16` | [Workspace](workspace.md) | The repos of a project and how they connect |
| `ENT-17` | [History Entry](history-entry.md) | One line per version of a document |
| `ENT-18` | [Decision](decision.md) | A record that closes a question |
| `ENT-19` | [Open Item](open-item.md) | What does not govern yet: questions, ideas, roadmap |
| `ENT-20` | [Product](product.md) | What one spec describes; the top of Product → Module → PRD → Requirement |
| `ENT-21` | [Module](module.md) | A part of the product that stands on its own, with its PRDs |
| `ENT-22` | [Trace Link](trace-link.md) | One link in a requirement's chain, with its current state |
| `ENT-23` | [Trace Event](trace-event.md) | One state change of a trace link, appended and never edited |

## What is an entity [#what-is-an-entity]

As the entity-relationship model defines it ([`MKT-13`](../market/modeling-standards.md#entity-er-model), [`RULE-28`](../rules/writing.md#rule-28)): **an entity is
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
then its tables, under these headings, which the `entities` and `states` views read ([views](../../modules/views/prd.md#the-views)):

| Heading | Columns | Rule |
|---|---|---|
| `Fields` | `Field` · `Type` · `What it holds` | A field that names another entity, by link or by ID, is a relationship; its type gives the cardinality: `ENT-nn` one, `ENT-nn?` zero or one, `ENT-nn[]` many |
| `States` | `State` · `Means` | Only when it has states |
| `Transitions` | `From` · `To` · `When` · `By` | As UML's state machine ([`MKT-13`](../market/modeling-standards.md#state-machine-uml)): the first state is where the initial pseudostate leads; `When` is the trigger and its guard, `event [condition]`; `By` is the role or stage that fires it; a state with no row out is final |

`Type` may be left out of an entity that is never stored. A PRD cites the entity, never copies these
tables; the modules that use an entity are the ones whose PRDs cite it
([`RULE-27`](../rules/writing.md#rule-27)).
