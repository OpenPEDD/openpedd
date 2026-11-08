---
title: Domain
description: Every concept OpenPEDD is made of, each defined once
owner: Kevin
version: "1.1"
updated: "2026-11-08"
---

The domain names every concept the framework works with. A PRD that needs one of these references
it; it never redefines it ([`RULE-01`](../rules/writing.md#rule-01)).

| ID | Entity | What it is |
|---|---|---|
| `ENT-01` | [Spec](spec.md) | The single source of truth of a product |
| `ENT-02` | [Foundation](foundation.md) | A document every stage reads before working |
| `ENT-03` | [Requirement](requirement.md) | A `FR` or a `NFR`, with its lifecycle |
| `ENT-04` | [Acceptance Criterion](acceptance-criterion.md) | A `Given / When / Then` case that becomes a test |
| `ENT-05` | [Contract](contract.md) | What an action receives, returns and fails with |
| `ENT-06` | [Change](change.md) | One unit of work moving through the cycle |
| `ENT-07` | [Delta](delta.md) | A proposed change to the spec, per ID |
| `ENT-08` | [Report](report.md) | What a person reads to decide on deltas |
| `ENT-09` | [Merge Gate](merge-gate.md) | The only way into the spec |
| `ENT-10` | [Stage](stage.md) | One step of the cycle |
| `ENT-11` | [Track](track.md) | The path a change takes, by impact |
| `ENT-12` | [Judge](judge.md) | The reviewer of a stage |
| `ENT-13` | [Context Pack](context-pack.md) | The only thing an agent reads |
| `ENT-14` | [Anchor](anchor.md) | The mark that says where a derived artifact came from |
| `ENT-15` | [Derived Artifact](derived-artifact.md) | Anything produced from the spec |
| `ENT-16` | [Workspace](workspace.md) | The repos of a project and how they connect |
| `ENT-17` | [History Entry](history-entry.md) | One line per version of a document |
| `ENT-18` | [Decision](decision.md) | A record that closes a question |
| `ENT-19` | [Open Item](open-item.md) | What does not govern yet: questions, ideas, roadmap |
| `ENT-20` | [Product](product.md) | What one spec describes; the top of Product → Module → PRD → Requirement |
| `ENT-21` | [Module](module.md) | A part of the product that stands on its own, with its PRDs |
| `ENT-22` | [Trace Link](trace-link.md) | One link in a requirement's chain, with its current state |
| `ENT-23` | [Trace Event](trace-event.md) | One state change of a trace link, appended and never edited |
