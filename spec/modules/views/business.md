---
title: The business's views
description: pedd view — the glossary, the organization chart, each process in swimlanes, and who uses which flow
owner: Kevin
version: "1.1"
updated: "2026-11-23"
status: draft
---

# The business's views

## Frame

The [ten views](prd.md#the-views) show how the spec is built. A business owner, a product engineer and a
new member also ask **what each word means, who reports to whom, how a process runs, and who uses
what**. Four more views answer from what the spec already holds, drawn by the same reader
([`ARCH-22`](../../foundations/architecture/views.md)) and drawn as the industry defines each diagram ([`RULE-28`](../../foundations/rules/writing.md#rule-28)) and laid out as
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
| `glossary` | A business glossary ([`MKT-14`](../../foundations/market/business-models.md#business-glossary)): each term with its definition, its translations, and a link to where it is defined; names no longer used as its synonyms | The `Glossary` | A name whose `Defined in` points nowhere |
| `org` | A hierarchical chart ([`MKT-14`](../../foundations/market/business-models.md#organization-chart)): a box per role with how many hold it, reporting lines, and each manager's span of control; as-is and to-be side by side, a role that appears or goes marked | `People` of the `Business Map` (`Role` · `How many` · `Reports to` · `Does`) | A `Reports to` naming no role |
| `activity` | A UML activity diagram per process ([`MKT-13`](../../foundations/market/modeling-standards.md#activity-diagram-uml)): an initial node at `Starts with`, each step an action in its role's partition (swimlane), its tool beside it, a final node at the end | Each process's steps (`### PRC-nn`, `Step` · `Role` · `Does` · `Tool`) | A step whose role is not among the process's `Roles` |
| `use-cases` | A UML use case diagram ([`MKT-13`](../../foundations/market/modeling-standards.md#use-case-diagram-uml)): roles as actors, each module as the system boundary, each main flow as a use case associated with the roles of its steps, and each alternate or exception flow as an `«extend»` of the flow it leaves from | The PRDs' flows (`### F<n>`, `Step` · `Role` · `Does`) and their alternates | A flow with no role in any step |

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

## Requirements

| ID | Requirement | Reason | Roles | Criteria | Flows | Status |
|---|---|---|---|---|---|---|
| `FR-VEW-13` | The system shall build the `glossary` view from the `Glossary`'s tables, each name linked to its `Defined in` | A word means one thing, and anyone finds where | Team | `AC1` | F4 | `draft` |
| `FR-VEW-14` | The system shall build the `org` view from `People`'s `Reports to`, as a tree, the as-is and the to-be side by side | Who answers to whom, and what the system changes in it | Team | `AC1` | F4 | `draft` |
| `FR-VEW-15` | The system shall build one `activity` diagram per process, one lane per role, from its steps | How a process runs, step by step, without drawing it | Team | `AC1` | F4 | `draft` |
| `FR-VEW-16` | The system shall build the `use-cases` view with roles as actors, modules as boundaries and flows as use cases | Who uses what, across every PRD | Team | `AC1` | F4 | `draft` |
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
| `FR-VEW-15.AC1` | A process with three steps by two roles | Its activity opens | An initial node, two partitions, three actions in order, each tool beside its step, and a final node |
| `FR-VEW-16.AC1` | Module `define` with flow `F1 · Start` whose step 1 is by `contributor`, and an alternate leaving from `F1.2` | The `use-cases` view opens | `contributor` associated with *Start*, inside the `define` boundary, and the alternate as an `«extend»` of *Start* |
| `FR-VEW-17.AC1` | The `use-cases` view | `pedd view use-cases --format mermaid` | A `usecase-beta` diagram |
