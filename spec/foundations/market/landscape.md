---
title: The landscape
description: MKT-01 · Why each existing method falls short, and where OpenPEDD stands. Surveyed 2026-11-04
owner: Kevin
version: "1.1"
updated: "2026-11-08"
---

# MKT-01 · The landscape

Surveyed on 2026-11-04. Each method solves one stretch: product methods stop at the PRD, SDD tools
stop at the code, documentation tools start from the code. **None covers idea to maintenance with one
source of truth, and none knows which derived artifact went stale.** Problem IDs are those of
[`BIZ-01`](../business/problem.md).

| Method | Solves | Leaves out | We take |
|---|---|---|---|
| **PRD in Notion or Confluence** | A written definition (P-01, partly) | AI cannot read it reliably; no stable IDs; abandoned (P-02, P-03, P-12) | The PRD structure |
| **Agile with stories in a tracker** | Small work and tracking (P-09) | A story describes the change, not the product: adding stories does not make a spec | Stories and vertical slices as input to `specify` |
| **Waterfall and V-Model** | Full traceability (P-11) | Heavy; assumes everything is defined up front | The traceability matrix |
| **TDD and BDD** | Behavior verified with evidence (P-05) | Test what someone thought of; do not keep the definition | Criteria as tests, before building |
| **GitHub Spec Kit** | Orders the agent: spec, plan, tasks | The spec lives as long as the change (spec-first); no design, acceptance or derived artifacts | Constitution, `/clarify`, `/analyze`, extensions |
| **OpenSpec** | Changes as deltas over an archived spec (P-02, partly) | Code only: no architecture or design stage, no help, no tracker | The delta format and the archive |
| **Kiro** | Testable requirements with EARS | The spec does not follow the implementation; locks you into its IDE | EARS |
| **BMAD-METHOD** | One agent per role, the broadest cycle (P-08, partly) | Too heavy for small work; the spec is written first and left | Roles and *correct course* |
| **Tessl** (spec-as-source) | The spec as what is maintained | Regenerating code from the spec breaks what the spec does not say | The ambition, not the mechanism |
| **pdd-kit** | A product model apart from how it is built (P-01, P-12) | No cycle, no freshness of derived artifacts, no doc generation | `map`, variations, blueprints |
| **ODD** (Outcome-Driven Development) | Agents cannot change contracts or tests; acceptance evidence (P-04, P-05) | Code only | SDD + TDD + IDD inside the delegated block |
| **Docs as code, Living Documentation** | Docs in the repo that evolve (P-03, partly) | Derived from code, not from the spec: documents what is, not what was decided | `publish` and Diátaxis |
| **Shape Up** | Appetite and no-gos keep work from growing | Does not keep the definition or say how AI works | Appetite and `Out of scope` |
| **Spec Growth Engine** (Grabowski, 2026) | Spec graph, context by ownership path, drift gate (P-02, P-06) | Spec against code only | The context pack and the drift gate |

## Where OpenPEDD stands

In Böckeler's three levels of spec-driven development (spec-first, spec-anchored, spec-as-source),
OpenPEDD is **spec-anchored, extended to every derived artifact**, not just the code. Outside AI
tooling, that has a name: requirements traceability plus living documentation. SDD tools are
workflows for an agent writing code, and their user is the developer. **OpenPEDD is the system of
record of the product**, and its user is whoever defines it.

The closest project found is `pdd-kit` (MIT): it models the product but has no cycle, does not track
the freshness of derived artifacts and does not generate documentation
([`DEC-06`](../../decisions/DEC-06-pdd-kit.md)).
