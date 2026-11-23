---
title: Modules
description: How a module and its PRDs are written
owner: Kevin
version: "1.5"
updated: "2026-11-23"
---

Each folder here is a [`Module`](../foundations/domain/module.md): a part of the product that
stands on its own. Its PRDs live inside it: `prd.md` first, and more PRDs by topic when it goes over
budget (`modules/<module>/<topic>.md`).

| Module | Code | PRDs |
|---|---|---|
| [cycle](cycle/prd.md) | `CYC` | The stages in order, their modes, where people intervene |
| [tracks](tracks/prd.md) | `TRK` | Which stages each change runs |
| [workspace](workspace/prd.md) · [baseline](workspace/baseline.md) | `WSP` | `pedd init` and the repos; what every project starts with, and keeping up with it |
| [trace](trace/prd.md) | `TRC` | `pedd trace` and `pedd status` |
| [views](views/prd.md) · [business](views/business.md) | `VEW` | `pedd view`: every view of a project's spec, and the check for loose items; the glossary, the organization chart, activities and use cases |
| [map](map/prd.md) · [specify](specify/prd.md) · [architect](architect/prd.md) · [design](design/prd.md) · [plan](plan/prd.md) · [build](build/prd.md) · [verify](verify/prd.md) · [accept](accept/prd.md) · [publish](publish/prd.md) · [measure](measure/prd.md) | `MAP` · `SPC` · `ARC` · `DSG` · `PLN` · `BLD` · `VRF` · `ACC` · `PUB` · `MSR` | One per stage |

## The sections of a PRD, in order

| Section | Holds | Rule |
|---|---|---|
| Frontmatter | `title`, `description`, `owner`, `version`, `updated`, `status` | `status` is moved by a stage ([`RULE-18`](../foundations/rules/cycle.md#rule-18)) |
| Frame | Who, what triggers it, in what state it ends; the job the user hires it for | One paragraph |
| Metric | `Success metric`: `baseline`, `target`, `review date`, the event that measures it | One row |
| Appetite and `Out of scope` | How much it is worth spending; what is not built | The only section in the negative |
| Flows | One `### F<n> · <name>` per flow, with a table `Step` · `Role` · `Does`; then the alternate and exception flows in one table `Flow` · `From` · `What changes` · `Ends in`, `From` the step they leave (`F1.3`). A step whose `Does` names another flow (`F2`, or `organizations F1`) **includes** it: always runs it there. A flow is a use case; an alternate **extends** the flow it leaves | Each flow ends in a known state; the views draw them as flowcharts and as use cases (`«include»`, `«extend»`, UML)
| Requirements | A table of `FR` and `NFR`: ID, EARS statement, reason, roles, criteria, flows, status | [`ENT-03`](../foundations/domain/requirement.md); a requirement no flow carries is loose ([`RULE-27`](../foundations/rules/writing.md#rule-27)) |
| Permissions | A matrix: `Action`, then one column per role; each cell `yes`, `own` or `no` | Roles and actions from `Roles & Permissions` ([`ENT-02`](../foundations/domain/foundation.md#tables-the-views-read)) |
| States | The transitions the flows touch: `Entity` · `From` · `To` · `Flow` | Each is a row of the entity's `Transitions`; never redefined here |
| Contracts | Input, output, errors of each action | [`ENT-05`](../foundations/domain/contract.md) |
| Screens and copy | Each state of each screen, with its text from the glossary | Empty, error, loading, no permission, no quota |
| Acceptance criteria | `Given / When / Then`, at least one per flow | [`ENT-04`](../foundations/domain/acceptance-criterion.md) |
| Test data | The data shared by mockups, tests and the final check | — |
| Variations | Flags, plans, A/B tests where it behaves differently | — |

A stage module (`specify`, `build`…) uses the stage sections instead
([`ENT-10`](../foundations/domain/stage.md)).

## Rules for a PRD

| Rule | Why |
|---|---|
| An entity or a cross-module rule found while writing goes to the foundations | [`RULE-01`](../foundations/rules/writing.md#rule-01) |
| Every `FR` has at least one criterion | A requirement without a case is not testable |
| A number that governs is written once: here, or in Business if the whole product uses it | One thing, one place |
| Budget 4,000 tokens; split by topic beyond it | [`RULE-04`](../foundations/rules/writing.md#rule-04) |
