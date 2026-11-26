---
title: "DEC-34 · The diagnosis and the project are dated; the specification, the construction and the requests stay alive"
description: A diagnosis and a project are approved on a date and kept as they were; a new batch of modules is a new project; after it, what the client asks is a request
owner: Kevin
version: "1.0"
updated: "2026-11-26"
---

# DEC-34 · The diagnosis and the project are dated; the specification, the construction and the requests stay alive

**Date:** 2026-11-26

**A diagnosis and a project are a picture of a date: approved in a row of `foundations/business/stages.md`,
and read as they were at that commit. The specification, the construction and the requests are the system as
it is now** ([`DEC-31`](DEC-31-client-stages.md)).

| Case | What happens |
|---|---|
| The client approves a stage | A row with its date; its files at that commit are the approved ones |
| A need that comes after the project | A request: a change to the living specification, not to the project |
| A new batch of modules (the next stage of the roadmap) | A new project: its stories, qualities, risks and estimate, approved in a new row |
| The business changed since the diagnosis | The diagnosis is updated and approved again, in a new row |
| Several rows of one stage | The last one is in force; the earlier ones are its history ([`FR-VEW-32`](../modules/views/project.md#requirements)) |

A project carries what it costs to build: its stories, the system's qualities (`Quality Standards`,
`NFR-SYS-nn`) and its risks and assumptions (`open/risks.md`, `RSK-nn`), as the industry writes them
([`MKT-18`](../foundations/market/quality-and-risk.md)).

**Why:** a client's product grows by projects. Estimating, quoting and approving need a fixed picture; building
needs a spec that keeps changing. One file that does both is never either.
