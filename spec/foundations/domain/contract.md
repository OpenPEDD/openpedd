---
title: Contract
description: ENT-05 · What an action receives, returns and fails with
owner: Kevin
version: "1.1"
updated: "2026-11-11"
---

# ENT-05 · Contract

A contract is the interface of one action of the product. **The UI, the API and the MCP use the same
one.** It is defined in the PRD, and it is a boundary the agents cannot change to make their code
pass (interface-driven development).

| Field | What it holds |
|---|---|
| `name` | The action, in `snake_case`: `create_job_post` |
| `input` | What it receives, with types |
| `output` | What it returns |
| `errors` | Each error, in `SCREAMING_SNAKE`, with when it happens |
| `roles` | Who may call it |
| `requirements` | The `FR` and `NFR` it serves |

The API Reference is generated from the contracts in `publish`, and each contract has a test per
error and role, written in `plan`. A contract without `roles` fails the pipeline. A breaking change to a public contract moves a story to the `full` track
([`DEC-04`](../../decisions/DEC-04-story-to-full.md)).
