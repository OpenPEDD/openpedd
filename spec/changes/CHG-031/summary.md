---
title: "CHG-031 · What an entity is, the business's views, and the prd view by levels: summary for Kevin"
description: One page — what changed in the framework's spec, and why, found mapping OpenPEDD Cloud with it
owner: Kevin
version: "1.1"
updated: "2026-11-23"
---

# CHG-031 · What an entity is, the business's views, and the prd view by levels

Stage: `specify`. Found while mapping OpenPEDD Cloud with the framework (`cloud:CHG-014`).

| What | Where |
|---|---|
| **Every kind of model is defined as the industry defines it**, surveyed first | [`RULE-28`](../../foundations/rules/writing.md#rule-28); [`MKT-13`](../../foundations/market/modeling-standards.md) (ER, UML state machine, use case, activity), [`MKT-14`](../../foundations/market/business-models.md) (BPMN, as-is/to-be and the gap, organization chart, business glossary) |
| **What is an entity**, as the ER model defines it: distinguishable by a key, its own attributes, relevant to the domain, related with a cardinality, strong, weak or associative; transitions as UML's `trigger [guard]` | [Domain](../../foundations/domain/index.md#what-is-an-entity), and its guide in `template/` |
| The `prd` view opens on modules and their PRDs; one PRD opens to its flows, use cases, transitions, requirements and criteria | [views](../../modules/views/prd.md), `FR-VEW-10` |
| An ID with a reference's prefix (`openpedd:ENT-20`) is the reference's, never loose | `FR-VEW-11`, [`ARCH-22`](../../foundations/architecture/views.md) |
| Criteria written as `AC-<MOD>-nn` count as criteria | `FR-VEW-12` |
| Four views of the business: glossary, organization chart, activity per process in swimlanes, use cases | [the business's views](../../modules/views/business.md), surveyed in [`MKT-12`](../../foundations/market/view-generation.md#the-businesss-diagrams) |
| `People` of the business map: `Role` · `How many` · `Reports to` · `Does`, one role per job; each process's steps under `### PRC-nn` | [map](../../modules/map/prd.md#business-mode) |

## For `build`

The reader's `prd` view, `FR-VEW-11` and `FR-VEW-12` first: they remove most of the loose items a
spec that builds on another shows. Then the four views. The Cloud renders the same `views.json`
(`DEC-29`).
