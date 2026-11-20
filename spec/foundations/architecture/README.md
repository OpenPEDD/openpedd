---
title: Architecture
description: How architecture documents are written
owner: Kevin
version: "1.10"
updated: "2026-11-20"
---

Architecture says **how the product is built and run**. What it is and what it must do live in the
domain and the modules; a technical choice with options is an `ADR` in `decisions/`.

| Document | ID | Holds |
|---|---|---|
| [Overview](overview.md) | `ARCH-01` | The pieces and how they connect |
| [Freshness](freshness.md) | `ARCH-02` | The index, the hash and the anchors |
| [Workspace repos](workspace.md) | `ARCH-03` | One monorepo by default, split repos when a part must be apart, several specs |
| [Skills, agents and tools](agents.md) | `ARCH-04` | What each stage runs with, and the MCP tools |
| [Traceability](traceability.md) | `ARCH-05` | How the chain of each requirement is built and kept |
| [Branches and tasks](branches.md) | `ARCH-06` | The branch of each change, and its design, architecture and task branches |
| [Walkthroughs](walkthroughs.md) | `ARCH-07` | The levels of help inside the product, and how a Walkthrough stays fresh |
| [Release](release.md) | `ARCH-08` | Environments, deploying and launching, hotfix, rollback, retiring |
| [Feature flags](flags.md) | `ARCH-09` | OpenFeature, the flags table, and launching with one change |
| [Testing](testing.md) | `ARCH-10` | Levels, permissions, contracts, languages, AI, measured quality |
| [Pipeline](pipeline.md) | `ARCH-11` | What runs at each moment, selection by the spec, cost per change |
| [Running agents](running.md) | `ARCH-12` | Where agents run, the quota guard, keeping their context small |
| [Reviewing a change](review.md) | `ARCH-13` | The layers of review, what blocks, the judges in CI, the person's approval |
| [Review lenses](review-lenses.md) | `ARCH-14` | What each hunter looks at, and the default checklist |
| [The tracker](tracker.md) | `ARCH-15` | The issues of a change, its tasks, what moves their status, keeping it clean |
| [Sweep](sweep.md) | `ARCH-16` | Every open question of a change, from every stage ahead, asked at once |
| [Landing parallel changes](landing.md) | `ARCH-17` | The overlap of changes in flight, syncing them, and the order they land in |
| [Guided definition](definition.md) | `ARCH-18` | The minimum each scope needs, who answers each item, and the conversation that fills it |
| [Code index](code-index.md) | `ARCH-19` | The generated map of the code per module and package, read first by every agent |
| [Spec reader](reader.md) | `ARCH-20` | The package that reads a spec, shared by the CLI and the Cloud |
| [A request's branch](requests.md) | `ARCH-21` | Numbering a change, the definition's status, editing once agreed, renaming at approval |

## How an architecture document is written

| Rule | Why |
|---|---|
| One subject per document, titled by what it explains | Two subjects in one file is what goes over budget |
| A diagram at the C4 level that fits: context, container or component | The reader knows how deep it goes |
| Every `NFR` it answers is cited by ID | It is how freshness reaches it |
| The area's document ends with its **decisions table**: one row per local decision, with what was discarded, status and date ([decisions](../../decisions/README.md#where-an-architecture-decision-goes)) | The implementing session starts with every decision, and nobody reopens what is closed |
| The reason for a choice is in its `ADR` or its row; the document states what holds | [`RULE-02`](../rules/writing.md#rule-02) |
| Budget: 2,000 tokens | [`RULE-04`](../rules/writing.md#rule-04) |
