---
title: Code index
description: ARCH-19 · The generated map of the code, per module and per package, that every agent reads first to know where to work
owner: Kevin
version: "1.0"
updated: "2026-11-20"
---

# ARCH-19 · Code index

An agent that does not know where things are explores, and every file it opens is reread on every
later call ([`ARCH-12`](running.md#keeping-the-context-small)). **The code index tells it where to work
without reading the repo**: one short file per module and per package, generated, never written by hand.

## What it holds

`.pedd/code-index/README.md` lists every entry, one line each, with its size. Then one file per entry:

| Entry | One file per | Built from |
|---|---|---|
| Module | Module of the spec ([`ENT-21`](../domain/module.md)) | The `components` that implement it in `workspace.yaml` ([`ENT-16`](../domain/workspace.md)) |
| Package | App or package of the monorepo ([`ARCH-03`](workspace.md)) | The workspace manager's graph (pnpm, Turborepo, Nx) |

| Section | Holds | Comes from |
|---|---|---|
| Where | Its paths, and the packages it imports and is imported by | The workspace graph |
| Entry points | Routes, screens, API handlers, jobs, migrations, each with its file | The framework's conventions, read from the code |
| IDs | Each requirement the module implements, and the files anchored to it | The code anchors in [`spec-graph.json`](freshness.md#the-index); not copied, inverted |
| Symbols | What the package exports, ranked by how much the rest of the code uses it, cut to the budget | Parsed (tree-sitter), never summarized by a model |
| Components | The name and one line of each piece in `packages/ui`, and how to ask for the rest | The Storybook component manifest ([`MKT-06`](../market/component-catalogs.md)), which stays the source |
| Tests | Where its tests are, and the command that runs only them | The test runners' config |

**Budget: 1,500 tokens per entry, 1,000 for the list.** An entry over it is cut by rank, never
truncated mid-section; a module that does not fit is a sign it should be split.

| Rule | Why |
|---|---|
| **Deterministic**: from the graph, the parser and the anchors. No model writes it | A generated summary can be wrong and nobody reviews it ([`MKT-09`](../market/code-maps.md)) |
| It points to what is live (the component MCP, the anchors) instead of copying it | [`RULE-01`](../rules/writing.md#rule-01): one thing, one place |
| It holds where things are, not why: the why is in `Architecture Rules` | The index is regenerated; a reason written in it would be lost |

## When it is built

`pedd index` writes it with the spec graph. **The pipeline regenerates it on every merge to the base**,
only the entries whose files changed, and commits it there. A branch reads the base's index plus its own
diff. Like the spec graph, it is generated and never edited ([`ARCH-02`](freshness.md)).

## Who reads it

| Reader | How |
|---|---|
| **Any agent, first** | OpenPEDD's block in `AGENTS.md` sends it to `.pedd/code-index/README.md` before any search ([workspace](../../modules/workspace/prd.md#main-flow), step 5) |
| A delegated stage or task | `get_context_for` puts the entries of the modules in scope in the pack's `code` ([`ENT-13`](../domain/context-pack.md)) |
| `plan` | Picks the files and line ranges each task touches from it |
| `map` and `specify` | Find what already exists before proposing it |
