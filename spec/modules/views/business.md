---
title: The business's views
description: pedd view — the glossary, the organization chart, each process in swimlanes, who uses which flow, and where the work with the client stands
owner: Kevin
version: "1.7"
updated: "2026-11-26"
status: draft
---

# The business's views

## Frame

The [ten views](prd.md#the-views) show how the spec is built. A business owner, a product engineer and a
new member also ask **what each word means, who reports to whom, how a process runs, who uses
what, and where the work with the client stands**. Five more views answer from what the spec already holds, drawn by the same reader
([`ARCH-22`](../../foundations/architecture/views.md)) and drawn as the industry defines each diagram ([`RULE-29`](../../foundations/rules/writing.md#rule-29)) and laid out as
[`MKT-12`](../../foundations/market/view-generation.md#the-businesss-diagrams) found. It ends with the whole
business readable from the spec, in `pedd view` and in OpenPEDD Cloud.

## Success metric

| Metric | Baseline | Target | Review date | Measured by |
|---|---|---|---|---|
| Products with a `Business Map` that open `org` or `activity` in their first week | Not measured | Half | 2027-03-01 | Cloud's view opens, per product |

## Appetite and out of scope

One week of `build`. Out of scope: drawing or editing a diagram by hand; BPMN beyond lanes and steps; a
person's name in the chart: the business map holds roles ([map](../map/prd.md#business-mode)).

## The views

| `kind` | Shows | Fed by | Loose when |
|---|---|---|---|
| `glossary` | A business glossary ([`MKT-15`](../../foundations/market/business-models.md#business-glossary)): each term with its definition, its translations, and a link to where it is defined, in the spec or in an industry glossary ([`DEC-30`](../../decisions/DEC-30-discovery-before-prds.md)); names no longer used as its synonyms | The `Glossary` | A name whose `Defined in` points to a file of the spec that does not exist |
| `org` | A hierarchical chart ([`MKT-15`](../../foundations/market/business-models.md#organization-chart)): a box per role with how many hold it, reporting lines, and each manager's span of control; as-is and to-be side by side, a role that appears or goes marked | `People` of the `Business Map` (`Role` · `How many` · `Reports to` · `Does`) | A `Reports to` naming no role |
| `activity` | A UML activity diagram per process ([`MKT-14`](../../foundations/market/modeling-standards.md#activity-diagram-uml)): **one initial node**, at `Starts with`; each step an action in its role's partition (swimlane), its tool beside it, and an object node `Name [state]` for each entity its `Object` names, joined by an object flow; a decision where an alternate leaves a step; **one final node per way it ends**, the main path's and each alternate's `Ends in`. Each business use case gets an **overview** with no partitions, its processes as macro activities in the order `Processes` lists them, each linked to its detailed diagram (RUP) | Each process's steps (`### PRC-nn`, `Step` · `Role` · `Does` · `Tool`) and its alternates (`Flow` · `From` · `What changes` · `Ends in`) | A step whose role is not among the process's `Roles`; an alternate leaving from a step that does not exist; an `Object` naming an entity that does not exist, or a state it does not have |
| `stages` | The five stages of the work with a client ([`DEC-31`](../../decisions/DEC-31-client-stages.md)), in order: each with its state (`not started` · `in progress` · `done` · `approved`), each piece present or missing with its file, or where it goes when it has none, what it delivers, who approves it, and what is next; the first stage not finished is the current one | The `Glossary`, the `Business Map`, the entities, `foundations/business/` and its `stages.md`, `Roles & Permissions`, the modules index, the roadmap, and each module's status | An approval in `stages.md` of a stage that does not exist |
| `use-cases` | A UML use case diagram ([`MKT-14`](../../foundations/market/modeling-standards.md#use-case-diagram-uml)): roles as actors, each module as the system boundary, each main flow as a use case associated with the roles of its steps; an `«include»` from a flow to each flow one of its steps names, which it always runs (`F2`, or `organizations F1` in another module); and each alternate or exception flow as an `«extend»` of the flow it leaves from, at that step. **Before them, the business use case diagram** ([`MKT-16`](../../foundations/market/analysis-order.md#a-business-use-case)): business actors outside the business's boundary, each business use case inside it with its kind, associated with its actors; an `«include»` to each business use case it always runs, and an `«extend»` from each one that adds to it, labelled with its condition. It is drawn from the map alone, before any PRD | The PRDs' flows (`### F<n>`, `Step` · `Role` · `Does`) and their alternates; the `Business use cases` of the as-is (`Includes`, `Extends`) and the steps of its processes | A flow with no role in any step; a step naming a flow that does not exist; an `Includes` or `Extends` naming a business use case that does not exist |

## Flows

### F4 · See the business

| Step | Role | Does |
|---|---|---|
| 1 | Team | Runs `pedd view`, or opens a product's views in the Cloud |
| 2 | — | The reader builds the four views beside the ten ([`FR-VEW-01`](prd.md#requirements)) |
| 3 | Team | Picks one; clicking a node opens its item as written ([`FR-VEW-05`](prd.md#requirements)) |

| Flow | From | What changes | Ends in |
|---|---|---|---|
| Alternate · No `Business Map` | F4.2 | `org` and `activity` show empty, naming `/map --business` | The other views built |
| Alternate · A process with no steps | F4.2 | Its activity shows the process alone, marked as having no steps | The rest drawn |

### F5 · See where a client stands

| Step | Role | Does |
|---|---|---|
| 1 | Team | Runs `pedd view stages`, or the client opens their product in the Cloud |
| 2 | — | The reader reads each stage's pieces from the spec and its approvals ([`FR-VEW-25`](#requirements)) |
| 3 | Team | Does what is next on the current stage; the client approves a stage when it is done |

## Requirements

| ID | Requirement | Reason | Roles | Criteria | Flows | Status |
|---|---|---|---|---|---|---|
| `FR-VEW-13` | The system shall build the `glossary` view from the `Glossary`'s tables, each name linked to its `Defined in` | A word means one thing, and anyone finds where | Team | `AC1` | F4 | `draft` |
| `FR-VEW-14` | The system shall build the `org` view from `People`'s `Reports to`, as a tree, the as-is and the to-be side by side | Who answers to whom, and what the system changes in it | Team | `AC1` | F4 | `draft` |
| `FR-VEW-15` | The system shall build one `activity` diagram per process, one lane per role, from its steps | How a process runs, step by step, without drawing it | Team | `AC1` | F4 | `draft` |
| `FR-VEW-16` | The system shall build the `use-cases` view with roles as actors, modules as boundaries and flows as use cases | Who uses what, across every PRD | Team | `AC1` | F4 | `draft` |
| `FR-VEW-21` | When the as-is lists business use cases, the system shall draw them in `use-cases` inside the business's boundary with their business actors, and in `business` each with the processes that realize it | What the business does, for whom, and by which processes, before any system use case | Team | `AC1` | F4 | `draft` |
| `FR-VEW-22` | The system shall draw, in each process's activity, an object node per entity a step's `Object` names, in its state, and per business use case an overview activity with its processes as macro activities, each linked to its process's diagram | A process shows what it changes, and a business use case how its processes chain, as RUP draws a business use-case realization | Team | `AC1` | F4 | `draft` |
| `FR-VEW-23` | When a business use case lists `Includes` or `Extends`, or a step of its processes names a process of another business use case, the system shall draw in `use-cases` an `«include»` from it to the one it runs and an `«extend»` from the extension to its base, labelled with the condition | Who does what, and what each piece of the business always or sometimes runs, from the map alone, before any PRD ([`DEC-30`](../../decisions/DEC-30-discovery-before-prds.md)) | Team | `AC1` | F4 | `draft` |
| `FR-VEW-24` | When a name's `Defined in` links to a web address, the system shall take it as defined there and keep the link | A project's terms are defined once, in its industry's glossary ([`DEC-30`](../../decisions/DEC-30-discovery-before-prds.md)) | Team | `AC1` | F4 | `draft` |
| `FR-VEW-25` | The system shall build the `stages` view from the spec: per stage its state, its pieces with their files, what it delivers, who approves it, and what is next; stages 1 and 2 approved by a row of `foundations/business/stages.md`, stages 3 and 4 by each module's status | The client and the team see the same roadmap, and nobody ticks it by hand ([`DEC-31`](../../decisions/DEC-31-client-stages.md)) | Team · Client | `AC1` · `AC2` | F5 | `draft` |
| `FR-VEW-26` | The system shall carry in `views.json` each Glossary name with its label per locale column, and a viewer shall show every name of a view (entity, state, field, role) by its label in the reader's locale, the name when it has none | A client reads the diagrams in their language while the spec and the code keep one name ([`DEC-33`](../../decisions/DEC-33-names-per-locale.md)) | Team · Client | `AC1` | F4 | `draft` |
| `FR-VEW-17` | When `--format mermaid` is given for these views, the system shall print `flowchart` lanes for `activity`, `usecase-beta` for `use-cases`, a `flowchart` tree for `org`, and a table for `glossary` | The same export as every view ([`FR-VEW-08`](prd.md#requirements)) | Team | `AC1` | F4 | `draft` |

## Permissions

| Action | Team |
|---|---|
| `pedd view` | yes |

## Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| `FR-VEW-13.AC1` | A glossary with *Invoice*, defined in an entity | The `glossary` view opens | *Invoice* is listed with what it is, and clicking it opens the entity |
| `FR-VEW-14.AC1` | `People` with Seller and Product engineer reporting to Founder | The `org` view opens | A tree of Founder over both, Founder's span of control 2; a role only in the to-be is marked new |
| `FR-VEW-15.AC1` | A process with three steps by two roles, and an alternate leaving from step 2 | Its activity opens | One initial node, two partitions, three actions in order, each tool beside its step, a decision after step 2, and two final nodes |
| `FR-VEW-16.AC1` | Module `define` with flow `F1 · Start` whose step 1 is by `contributor`, and an alternate leaving from `F1.2` | The `use-cases` view opens | `contributor` associated with *Start*, inside the `define` boundary, and the alternate as an `«extend»` of *Start*; a step of *Start* that reads *runs `organizations F1`* draws an `«include»` from *Start* to *Sign in* |
| `FR-VEW-21.AC1` | An as-is with *Sell by the box* (`core`, actor *Market customer*, realized by *Sell*) and *Know the day's result* (`management`, no actor, realized by *Close the day*), and a process *Count the stock* in neither | `use-cases` and `business` open | *Market customer* outside the business boundary, associated with *Sell by the box*; both business use cases inside, each with its kind; in `business`, each linked to its process; *Count the stock* loose |
| `FR-VEW-22.AC1` | A process whose step 2 has `Object` *ENT-01 · draft*, in a business use case with that one process | Its activity and the overview open | *Job Post [draft]* joined to step 2 by an object flow; the overview's one macro activity links to the process's diagram; an `Object` naming a missing entity, or a state *Job Post* lacks, is loose |
| `FR-VEW-23.AC1` | *Sell by the box* includes *Weigh the box*; *Sell on credit* extends *Sell by the box* when the customer has an account; *Return a box* includes a business use case that does not exist | `use-cases` opens | An `«include»` from *Sell by the box* to *Weigh the box*; an `«extend»` from *Sell on credit* to *Sell by the box* labelled *when the customer has an account*; *Return a box* loose |
| `FR-VEW-24.AC1` | *Job post*, defined in an industry glossary on the web | The `glossary` view opens | *Job post* listed with its link, and not loose |
| `FR-VEW-25.AC1` | A product with its industry glossary linked and the as-is whole but for its documents, a row approving the diagnosis | `stages` opens | Industry `done`; Diagnosis `in progress`, *Documents in and out* missing and what is next naming it; the approval does not count until it is done |
| `FR-VEW-25.AC2` | Diagnosis and project approved, the PRD of *jobs* `specified` and of *billing* `draft` with its flows | `stages` opens | Specification `done` and current, *jobs* approved, and what is next is the client approving the PRD of *billing* |
| `FR-VEW-26.AC1` | A Glossary with `Job Post` (`es`: *Aviso*), `open` (`es`: *abierto*) and `Recruiter` with no `es` | The `states` view opens in Spanish | *Aviso* in the list, the state *abierto*, the transition by *Recruiter*; in English, the names as written, or each `en` label |
| `FR-VEW-17.AC1` | The `use-cases` view | `pedd view use-cases --format mermaid` | A `usecase-beta` diagram |
