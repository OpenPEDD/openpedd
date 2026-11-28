---
title: A PRD as a document
description: pedd view — each PRD in its template's sections, each with what it holds and what it still lacks, for a viewer to show it whole
owner: Kevin
version: "1.0"
updated: "2026-11-28"
status: draft
---

# A PRD as a document

## Frame

A PRD is read whole before it is approved: the client and the team go through it section by section. The
`prd` view draws its flows; this gives a viewer the rest, in [the template's order](../../../template/spec/modules/README.md),
and says what each section still lacks against the template's rules, so a missing part is seen where it
belongs and not only in a count. The rest of the views are [the views](prd.md#the-views).

## The document

Each `prd` node of the `prd` view carries `document.sections`, one per section of the template, in order:
`frame`, `metric`, `appetite`, `flows`, `requirements`, `permissions`, `states`, `contracts`, `screens`,
`criteria`, `testData`, `variations`. Each has its heading, line and Markdown, and `missing`, a list of codes:

| Code | Section | Means |
|---|---|---|
| `absent` · `empty` | Any | The PRD has no such section, or it is empty |
| `metric-field` (`field`) · `no-metric-row` | `metric` | The success metric lacks its baseline, target, review date or measure |
| `no-out-of-scope` | `appetite` | No `Out of scope` table |
| `no-flows` · `flow-no-steps` · `step-no-role` (`id`) | `flows` | A flow with no steps, a step no role does |
| `no-fr` · `no-nfr` · `no-criterion` · `no-flow` (`id`) | `requirements` | No functional or no non-functional requirement; one without a criterion, or carried by no flow |
| `criterion-not-written` (`id`) | `criteria` | A requirement names a criterion the table does not have |

Flows (with their steps and alternates), requirements, criteria and the metric also come parsed.

## Requirements

| ID | Requirement | Reason | Roles | Criteria | Flows | Status |
|---|---|---|---|---|---|---|
| `FR-VEW-33` | The system shall give each PRD of the `prd` view its sections in the template's order, each with its content and the codes of what it lacks | A PRD is read and approved as a document; what it lacks shows in its place | Team · Client | `AC1` | F4 | `draft` |

## Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| `FR-VEW-33.AC1` | A PRD with no `States`, one `FR` without criteria and no `NFR` | `prd` is built | Twelve sections in order; `states` absent; `requirements` with `no-nfr` and `no-criterion` for that `FR` |
