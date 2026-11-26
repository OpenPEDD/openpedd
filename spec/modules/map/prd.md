---
title: map
description: Stage 0 · Reads an existing product and builds its spec, module by module, until every module has its PRD; in business mode, maps the organization a new system will change
owner: Kevin
version: "2.6"
updated: "2026-11-24"
status: draft
---

# Stage 0 · `map`

**Mode:** interactive, per module · **Gate:** `spec-approval` of the initial model; in business mode, the client's

## What it is

The entry point when **the product already exists**. It reads the code, and whatever docs and tickets
there are, and builds the spec: first the foundations and the index of modules, then one PRD per
module. Without it, OpenPEDD would serve new products only. **In business mode** it maps an
organization instead of code, before its system is designed ([below](#business-mode)).

**The end state is every module with its PRD, kept `live`**: the spec is the source of truth of the
whole software, and a PRD is maintained from the day it exists. Each PRD is written when a change
first touches its module, or all at once with `/map --all`
([`DEC-13`](../../decisions/DEC-13-map-on-demand.md)).

## Inputs

| What | From |
|---|---|
| The code repo | The person points to it |
| Existing docs, help, designs | Optional |
| The questions the code cannot answer | The person, in the conversation |
| In business mode: calls, documents, spreadsheets | The client, through a product engineer |

## Context pack

Per module, never the whole repo: the module's files, its routes and its data schema. Budget:
**20,000 tokens per module**. The agent goes module by module.

## Procedure

0. **If the product already has a spec**, imports it instead of inferring one: converts its documents to the framework's layers, keeps its IDs (mapped to the new ones in `.pedd/id-map.json`) and its history, and checks every requirement against the code. What the code does not do, or does differently, becomes a `Q`; nothing is rewritten from scratch. `/map --from-spec <path>`.
1. Builds the index of the modules, across every code repo and component, and confirms it with the person. Each module starts `unmapped`.
2. Extracts the `Domain Model`: entities, fields, states.
3. Extracts the `Roles & Permissions` the code enforces.
4. Writes the foundations it can infer (conventions, patterns, the `Brand System` from the components) and marks the rest empty. For the conventions it finds, **asks why each exists**, all in one sheet ([`RULE-26`](../../foundations/rules/cycle.md#rule-26)). The list of technologies stays in `.pedd/stack.json` ([`DEC-12`](../../decisions/DEC-12-stack-derived.md)).
5. **Per module, when a change first touches it** or with `/map --all`: writes the PRD **of what the code does today**: flows, `FR`, `NFR`, contracts.
6. Opens a `Q` for what the code cannot answer: why something exists, what should happen in an uncovered case.
7. Anchors the module's code to the new IDs, and the module moves from `unmapped` to `live`.

## Outputs

| What | Status |
|---|---|
| Inferred foundations | `live` |
| The index of modules | Each `unmapped` until its PRD exists |
| One PRD per module, as each is mapped | `live` |
| `Q`s for what could not be known | Open |
| Anchors from the code to the IDs | `fresh` |

## Judge

`map-judge`: the index covers every module; every schema entity has its `ENT`; in a mapped module,
every route or screen has at least one `FR`, and every contract matches the code. Passes when everything is covered or opened as a `Q`. Then a person
approves.

## Keep in mind

- **It describes what the code does, not what it should do.** What is wrong becomes a `Q`; it is not fixed in the map.
- It goes module by module so the context does not explode.
- **`unmapped` is a debt, not a state to stay in.** `pedd status` shows how many remain.
- Existing docs are reading material: what they say is checked against the code, not copied. **An existing spec is the exception**: it is imported, because it holds decisions the code cannot show.
- It reads the code; it never runs it.

## Business mode [#business-mode]

For a product that **changes how an organization works** and has no code yet
([`DEC-24`](../../decisions/DEC-24-business-map.md)). A **product engineer** runs it, from calls with
the client (their transcripts), the documents and spreadsheets the client shares, and the guided
conversation ([`ARCH-18`](../../foundations/architecture/definition.md)). It leaves the `Business Map`
in `foundations/business-map/`, in three files. **What every client answers, in order, is fixed**
([`DEC-30`](../../decisions/DEC-30-discovery-before-prds.md)): goal, metric and what is left out go to
`Business Context`, never to the map.

| `as-is.md` | Holds |
|---|---|
| People | A table `Role` · `How many` · `Reports to` · `Does`: roles, not names. **One role per job**, even when one person holds several today: say so in `How many` |
| Business use cases | A table `BUC` · `Business use case` · `Kind` (`core` · `supporting` · `management`) · `Business actor` · `Processes`: what the business does, and for whom, as UML and RUP define it ([`MKT-16`](../../foundations/market/analysis-order.md#a-business-use-case)). A `core` one has a business actor outside the business; the work the business does for itself is `supporting` or `management`. **Every process belongs to at least one.** Optionally `Includes`: the business use cases it always runs, abstract parts with no actor of their own; and `Extends`: the one it adds to on a condition, `BUC-nn · when <condition>`, several separated by `;`. A step of one of its processes that names a process of another business use case (*runs the survey*) is an `«include»` too. The to-be keeps them: what the business does rarely changes, how it does it does |
| Processes | A table `PRC` · `Process` · `Starts with` · `Roles` · `Tools` · `How often` (how often **and how many**: *daily, 40 a month*) · `Confirmed by`, then each process's steps under `### PRC-nn · <name>`, as `Step` · `Role` · `Does` · `Tool`, and optionally `Object`: the business entity the step creates or changes and the state it leaves it in, `ENT-nn · <state>`, several separated by `;` (an object node, [`MKT-14`](../../foundations/market/modeling-standards.md#activity-diagram-uml)), and its alternates as a PRD's (`Flow` · `From` · `What changes` · `Ends in`). **Confirmed by** the role that runs it |
| Tools and spreadsheets | Each one: what it holds, who writes it, which processes use it |
| Documents | A table `Document` · `Comes in from · goes out to` · `Processes` · `How many`: the forms, PDFs and papers the business receives and issues. A sample of each is kept with the sources |
| Rules and regulations | A table `Rule` · `Comes from` · `Processes` · `Entities` (optional): what always holds, from a law, a regulator, a contract or an internal policy. They become the product's rules and the PRDs' requirements |
| Pains | Each with the client's own words, who said it and the process it sits in |

| `to-be.md` | Holds. Each mark is the **gap** between as-is and to-be, and each gap goes to a module ([`MKT-15`](../../foundations/market/business-models.md#as-is-to-be-and-the-gap)) |
|---|---|
| People | The roles that appear, change or go |
| Processes | A table `PRC` · `Mark` (`kept` · `changed` · `taken`) · `Module` · `Roles`: the module that takes it, and the roles that run it after |
| Modules | The modules that follow, each with the processes it takes and the pains it removes |
| Order | The order they are built in, and why |

| `stories.md` | Holds |
|---|---|
| One section per module | `## `<module>` · <what it does>`, in the order of the to-be, then a table `Story` (`US-nn`) · `As` · `I want` · `So that` · `Said` · `Source` · `Process`: what the client asked for, in Connextra's form, in the order it is built, with their own words and the call and line they come from ([`MKT-15`](../../foundations/market/business-models.md#user-stories)). Each becomes requirements of its module's PRD |

0. **Reads the industry first**: its glossary in `industries/<industry>/`; if there is none, researches it on the web and adds it, each term with its source ([`DEC-30`](../../decisions/DEC-30-discovery-before-prds.md)). The project's `Glossary` links the terms it uses and writes only where the client differs.
1. **Drafts the as-is** from the sources, top down: the people, the business use cases, then the processes that realize each ([`ARCH-24`](../../foundations/architecture/definition-map.md)), then the documents, the rules and the pains; a draft from transcripts is never final until its process is confirmed.
2. **Draws the to-be** as a marked copy of the as-is, process by process, with **the later modules too**: what the client wants after the first version, each with the processes it will take and when ([`RULE-30`](../../foundations/rules/definition.md#rule-30)).
3. **Derives**, never restating the map, for the first version and the later modules alike: roles to `Roles & Permissions`, the things processes, spreadsheets and documents handle to the `Domain Model`, the client's own words to the `Glossary`, the rules to the product's rules, goal, audience, metric and what is left out to `Business Context`, the modules to the index (each `unmapped` until its PRD), the order to the first roadmap ([open](../../open/README.md#the-roadmap)).
4. **`map-judge`**: the tables are the ones the `business` view reads ([views](../views/prd.md#the-views)); every business use case its kind and, if `core`, its business actor, and every `Includes` and `Extends` an existing one; every rule and document the processes it touches; every process a business use case, its roles and a confirmation; every pain a source, every to-be process a mark, every module the processes it takes.
5. **`spec-approval` is the client's**: they approve the as-is as true (the diagnosis) and the to-be as wanted (the project), each a row of `foundations/business/stages.md`. Where the client stands, stage by stage, is read from the map and the PRDs: [`DEC-31`](../../decisions/DEC-31-client-stages.md), the `stages` view.

The PRDs come after, **one per module as it is defined**, in the order of the to-be ([`RULE-30`](../../foundations/rules/definition.md#rule-30)). Until then each module is `unmapped` in the index, and `pedd check` reads it as the list of what is still to define, not as loose ([views](../views/prd.md#loose-items)).

## Skills, agents and tools

| Kind | Name | For | Reads | Leaves |
|---|---|---|---|---|
| Skill | `/map` | The foundations and the index; `--all` for every PRD | The code repos; the docs, help and designs that exist | The index of modules, each `unmapped`; the inferred foundations; `.pedd/stack.json`; one sheet of `Q`s |
| Skill | `/map-module` | One module | The module's code; the foundations | The module's PRD of what the code does today; its `Q`s; its code anchored; the module `live` |
| Skill | `/map --from-spec` | Importing an existing spec | The existing spec; the code | The spec in the framework's layers, with its history; `.pedd/id-map.json`; a `Q` for each requirement the code does not meet |
| Skill | `/map --business` | Mapping an organization | Call transcripts, documents, spreadsheets; the guided conversation | The `Business Map`; the foundations and the index derived from it; the first roadmap |
| Agent | `map-judge` | Coverage | — | — |
| MCP | `propose_delta` | Everything enters as deltas of the initial change | — | — |

## Sources

pdd-kit (`/pdd-map`) · OpenSpec (existing projects) · BMAD (project context) · Agent OS
(`discover-standards`).
