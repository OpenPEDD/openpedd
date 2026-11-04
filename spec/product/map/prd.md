---
title: map
description: Stage 0 · Reads an existing product and builds its initial spec
owner: Kevin
version: "1.0"
updated: "2026-11-04"
status: draft
---

# Stage 0 · `map`

**Mode:** interactive, once per product · **Gate:** `spec-approval` of the initial model

## What it is

The entry point when **the product already exists**. It reads the code, and whatever docs and tickets
there are, and builds the initial spec: the foundations and one PRD per module, `live`. Without it,
OpenPEDD would serve new products only.

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

1. Builds the index of the repo's modules and confirms it with the person.
2. Extracts the `Domain Model`: entities, fields, states.
3. Extracts the `Roles & Permissions` the code enforces.
4. Per module, writes the PRD **of what the code does today**: flows, `FR`, `NFR`, contracts.
5. Opens a `Q` for what the code cannot answer: why something exists, what should happen in an uncovered case.
6. Anchors the existing code to the new IDs.
7. Writes the foundations it can infer (stack, patterns) and marks the rest empty.

## Outputs

| What | Status |
|---|---|
| Inferred foundations | `live` |
| One PRD per module | `live` |
| `Q`s for what could not be known | Open |
| Anchors from the code to the IDs | `fresh` |

## Judge

`map-judge`: every schema entity has its `ENT`, every route or screen at least one `FR`, every
contract matches the code. Passes when everything is covered or opened as a `Q`. Then a person
approves.

## Keep in mind

- **It describes what the code does, not what it should do.** What is wrong becomes a `Q`; it is not fixed in the map.
- It goes module by module so the context does not explode.
- It reads the code; it never runs it.

## Skills, agents and tools

| Kind | Name | For |
|---|---|---|
| Skill | `/map` | The whole stage |
| Skill | `/map-module` | One module |
| Agent | `map-judge` | Coverage |
| MCP | `propose_delta` | Everything enters as deltas of the initial change |

## Sources

pdd-kit (`/pdd-map`) · OpenSpec (existing projects) · BMAD (document-project).
