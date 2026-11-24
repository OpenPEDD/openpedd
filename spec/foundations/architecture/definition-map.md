---
title: The map of a definition
description: ARCH-24 · Every level of a product's definition, from the business to the data model, in order — what each is, the question it answers, where it lives and who writes it
owner: Kevin
version: "1.0"
updated: "2026-11-24"
---

# ARCH-24 · The map of a definition

A product is defined from the business down to the code, each level as the industry defines it
([`MKT-16`](../market/analysis-order.md), [`RULE-29`](../rules/writing.md#rule-29)). **When** each is
written is [`RULE-30`](../rules/definition.md#rule-30); **who answers** each item,
[`ARCH-18`](definition.md). The order is the common one; it is iterative, and a product with no
organization to change starts at level 8.

| # | Level: what it is | Answers | Lives in | Written by · stage | Feeds |
|---|---|---|---|---|---|
| 1 | **Business context**: the goal, the audience, the north star | Why it exists, for whom | `foundations/business/`, `BIZ-nn` | Client, with the product engineer · `map`, `specify` | Everything below |
| 2 | **Organization**: roles, how many, who reports to whom | Who works there | `Business Map`, `People` | Product engineer, confirmed by the client · `map` | Roles & Permissions |
| 3 | **Business use cases**: what the business does that yields a result of value to a business actor; `core` (for an outside actor), `supporting`, `management` (for itself) | What the business does, and for whom | `Business Map`, `Business use cases`, `BUC-nn` | Same | The processes that realize each |
| 4 | **Business processes**: the work that realizes a business use case, start to end | How it is done | `Business Map`, `Processes`, `PRC-nn` | Same; each confirmed by the role that runs it | Activities, the to-be |
| 5 | **Activities**: the steps of a process, by role and tool | Who does each step, with what | `### PRC-nn`, `Step` · `Role` · `Does` · `Tool` | Same | The `activity` view; system use cases |
| 6 | **Business entities**: the things processes handle, with their states | What it works with | `Domain Model`, `ENT-nn` | Derived from the map · `map`, `specify` | Every PRD, the data model |
| 7 | **Business rules and glossary**: what always holds; one name per thing | What must be true; what each word means | `rules/` (`RULE-nn`), `DEC-nn`; `Glossary` | Client decides, `specify` writes | PRDs, screens |
| 8 | **To-be and modules**: each process marked `kept` · `changed` · `taken`, the module that takes it, the later modules too | What the system will change, in what order | `Business Map` to-be; modules index (`unmapped`) | Product engineer, approved by the client · `map` | The roadmap; one PRD per module |
| 9 | **System use cases**: a PRD's flows, `F<n>`, with `«include»` and `«extend»` | What a user does with the system, step by step | `modules/<m>/prd.md`, `Flows` | Client and `specify`, one module at a time | Requirements, criteria |
| 10 | **Requirements**: what the system shall do, in EARS | What exactly it must do | PRD, `FR-<MOD>-nn` · `NFR-<MOD>-nn` | `specify` | Tests, traceability |
| 11 | **Acceptance criteria**: Given · When · Then | How we know it works | PRD, `FR-…-nn.ACn` | Proposed, confirmed by the client · `specify`, `plan` | Tests written red |
| 12 | **The rest of a PRD**: permissions, states touched, contracts, screens and copy, test data, variations | Who may, what it returns, what it shows | PRD sections ([modules](../../modules/README.md)) | `specify`, `design` | Build |
| 13 | **Data model**: tables, keys, policies | How it is stored | `foundations/architecture/`, `ADR-nn` | `architect` | Build |

## What is what

| Question | Answer |
|---|---|
| Is a PRD a system use case? | **A PRD's flows are its system use cases.** A PRD holds more: frame, metric, appetite and out of scope, requirements, permissions, states, contracts, screens and copy, criteria, test data, variations |
| Is internal work a business use case? | When it is a whole thing the business does for itself, yes: a `supporting` one (*keep the stock and the catalog*) or a `management` one (*know how much was earned*) |
| And a smaller piece of internal work? | A step of a process when it is part of one (*adjust a count*); a system use case when the system does it (*see the day's result*) |
| Where does a business use case become software? | Each step the to-be gives to a module becomes part of a flow of that module's PRD |
