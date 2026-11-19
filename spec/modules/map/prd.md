---
title: map
description: Stage 0 · Reads an existing product and builds its spec, module by module, until every module has its PRD
owner: Kevin
version: "1.4"
updated: "2026-11-19"
status: draft
---

# Stage 0 · `map`

**Mode:** interactive, per module · **Gate:** `spec-approval` of the initial model

## What it is

The entry point when **the product already exists**. It reads the code, and whatever docs and tickets
there are, and builds the spec: first the foundations and the index of modules, then one PRD per
module. Without it, OpenPEDD would serve new products only.

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

## Skills, agents and tools

| Kind | Name | For | Reads | Leaves |
|---|---|---|---|---|
| Skill | `/map` | The foundations and the index; `--all` for every PRD | The code repos; the docs, help and designs that exist | The index of modules, each `unmapped`; the inferred foundations; `.pedd/stack.json`; one sheet of `Q`s |
| Skill | `/map-module` | One module | The module's code; the foundations | The module's PRD of what the code does today; its `Q`s; its code anchored; the module `live` |
| Skill | `/map --from-spec` | Importing an existing spec | The existing spec; the code | The spec in the framework's layers, with its history; `.pedd/id-map.json`; a `Q` for each requirement the code does not meet |
| Agent | `map-judge` | Coverage | — | — |
| MCP | `propose_delta` | Everything enters as deltas of the initial change | — | — |

## Sources

pdd-kit (`/pdd-map`) · OpenSpec (existing projects) · BMAD (project context) · Agent OS
(`discover-standards`).
