---
title: Acceptance Criterion
description: ENT-04 · A Given / When / Then case that becomes a test before anything is built
owner: Kevin
version: "1.1"
updated: "2026-11-10"
---

# ENT-04 · Acceptance Criterion

An acceptance criterion (`AC`) is a concrete case of a [`Requirement`](requirement.md), written in
`Given / When / Then`, with the shared `Test Data`. **It is the piece of the spec that pays off the
most**: `plan` turns each one into a test that fails on an assertion, against the real backend,
`build` makes it pass, and `verify` runs it again with other data and attaches a screenshot of it. A concrete case needs nobody to test it by hand.

| Field | What it holds |
|---|---|
| `id` | `FR-<MOD>-nn.ACn`, under its requirement |
| `flow` | The flow it covers: main, alternate or exception |
| `given` · `when` · `then` | The case |
| `data` | The `Test Data` it uses |

Every flow of a PRD has at least one `AC`. The tests written from them are part of the contract:
`build` cannot change them, and the pipeline enforces it ([`modules/build`](../../modules/build/prd.md)).
