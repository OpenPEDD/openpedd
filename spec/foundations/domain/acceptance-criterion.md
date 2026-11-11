---
title: Acceptance Criterion
description: ENT-04 · A Given / When / Then case that becomes a test before anything is built
owner: Kevin
version: "1.2"
updated: "2026-11-11"
---

# ENT-04 · Acceptance Criterion

An acceptance criterion (`AC`) is a concrete case of a [`Requirement`](requirement.md), written in
`Given / When / Then`, with the shared `Test Data`. **It is the piece of the spec that pays off the
most**: `plan` turns each one into a test that fails on an assertion, against the real backend,
`build` makes it pass, and `verify` runs it again with other data and, if it has a screen, attaches a screenshot. A concrete case needs nobody to test it by hand.

| Field | What it holds |
|---|---|
| `id` | `FR-<MOD>-nn.ACn`, under its requirement |
| `flow` | The flow it covers: main, alternate or exception |
| `given` · `when` · `then` | The case |
| `data` | The `Test Data` it uses |
| `level` | `unit` · `integration` · `contract` · `e2e` · `eval`: the cheapest that proves it, set by `plan` ([`ARCH-10`](../architecture/testing.md)) |

Every flow of a PRD has at least one `AC`. The tests written from them are part of the contract:
`build` cannot change them, and the pipeline enforces it ([`modules/build`](../../modules/build/prd.md)).
