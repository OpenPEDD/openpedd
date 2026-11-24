---
title: How a business is analyzed before its software
description: MKT-16 · The order and the levels of analyzing a business, as RUP, the BPM lifecycle, APQC, BABOK and Larman give them, and what a business use case is. Surveyed 2026-11-24
owner: Kevin
version: "1.0"
updated: "2026-11-24"
---

# MKT-16 · How a business is analyzed before its software

Surveyed on 2026-11-24, from search results quoting each source; mirrors of RUP were not opened in
full. **(unverified)** marks what only a secondary source said. The models themselves are
[`MKT-14`](modeling-standards.md) and [`MKT-15`](business-models.md); how a map is drawn with a client,
[`MKT-11`](business-mapping.md).

## The order each source gives

| Source | Order | Source link |
|---|---|---|
| **RUP, Business Modeling** | Assess Business Status → Describe Current Business (skipped for a new business) → Identify Business Processes → Refine Business Process Definitions → Design Business Process Realizations → Refine Roles and Responsibilities → Explore Process Automation. *Develop a Domain Model* is the lighter path: only the business entities | files.defcon.no/RUP/process/workflow/busmodel/wfd_bm.htm · …/wfs_dm.htm **(unverified)** |
| **BPM lifecycle** (Dumas, La Rosa, Mendling, Reijers) | Identification (the process architecture) → discovery (as-is) → analysis (the issues) → redesign (to-be) → implementation → monitoring | link.springer.com/book/10.1007/978-3-662-56509-4 |
| **APQC PCF** | No order: levels. Category → process group → process → activity → task; *operating* processes apart from *management and support* ones | apqc.org, *Understanding the PCF elements* |
| **BABOK** | No order: techniques listed alphabetically (process modelling, data modelling, use cases and scenarios); process modelling serves the current and the future state | iiba.org, *Foundational techniques* **(unverified)** |
| **Larman, UP** | Business modeling and the domain model before the use-case model; both refined together. An experiment found **no significant effect** of the order on use case quality | craiglarman.com; ceur-ws.org/Vol-364/paper9.pdf |

## A business use case

| Term | The industry says | Source |
|---|---|---|
| Business use case | A sequence of actions a business performs that yields an observable result of value to a particular business actor | RUP, *Business Use Case* (cin.ufpe.br mirror) **(unverified)** |
| Business actor | Someone or something outside the business that interacts with it: a customer, a supplier, a partner | Same |
| **Core** | External-facing: the value chain. Must communicate with a business actor. *Buy Product* | RUP, *Guidelines: Business Use-Case Model* (swi.cs.vsb.cz mirror) **(unverified)** |
| **Supporting** | Builds and keeps the infrastructure the core relies on: systems, premises, people. Mostly internal. Core or supporting depends on the business | Same |
| **Management** | Internal: coordinates the value chain, and how the business relates to its owners. *Strategic Planning* | Same |
| From business to system | Each business use case the system takes part in yields candidate system use cases; business entities become analysis classes | RUP, *Business Use-Case Model* **(unverified)** |

## What it shows

| Finding | From |
|---|---|
| No single standard; the common order is context → organization and actors → business use cases → as-is processes → business entities and glossary → to-be → system use cases → data model | All |
| It is iterative: entities and use cases refine each other; the order matters less than keeping them consistent | Larman; the experiment |
| Internal work is not left out: it is a supporting or management business use case, or an activity inside a process | RUP; APQC |
| The data model (ER, tables) is design, after the analysis | Larman; RUP's analysis classes |
| A new business skips the as-is | RUP |
