---
title: "DEC-31 · Every client goes through five stages, each read from the spec"
description: The stages of the work with a client, what each delivers, when it is done, and who approves it and where
owner: Kevin
version: "1.2"
updated: "2026-11-26"
---

# DEC-31 · Every client goes through five stages, each read from the spec

**Date:** 2026-11-24

**The work with a client runs in five stages, in order, and each is done when the spec holds what it
delivers**, never when someone ticks it. The `stages` view reads it, per stage: its state
(`not started` · `in progress` · `done` · `approved`), each piece present or missing with its file, and
what is next (`FR-VEW-25`, [the business's views](../modules/views/business.md)). The client sees it in
OpenPEDD Cloud as their roadmap. It orders the pieces of [`DEC-30`](DEC-30-discovery-before-prds.md) and
the `Business Map` of [`DEC-24`](DEC-24-business-map.md).

| # | Stage | Delivers | Done when the spec holds | Approved by |
|---|---|---|---|---|
| 0 | Industry | The industry's glossary and its rules, researched before the first meeting | A `Glossary` name linked to `industries/<industry>/` | Nobody: done is enough |
| 1 | Diagnosis | How the business works today, and where it hurts | The as-is whole (people, business use cases, processes with steps and confirmed, tools, documents, rules, pains), nothing loose in it; the client's `Glossary` | The client |
| 2 | Project | Where we go and what we build | `Business Context` (goal, metric, what is left out); the entities and their states, as the system will keep them; the system's qualities (`Quality Standards`); the to-be (every process marked, modules, order); `Roles & Permissions`; the modules index; the roadmap and its risks and assumptions | The client |
| 3 | Specification | One PRD per module, in the to-be's order, with its flows | Each module's PRD with flows and requirements | The client, per module, at `spec-approval`: the PRD `specified` |
| 4 | Construction | Each module built and delivered | Each module `in_review` | The client, per module, at acceptance: the module `accepted` |

**Stages 1 and 2 are approved in `foundations/business/stages.md`**, one row per approval, the last in force ([`DEC-34`](DEC-34-dated-stages.md)): `Stage` ·
`Approved by` · `On` · `Notes`. The template ships it empty. Stages 3 and 4 need no row: each module's
status already records its approval ([`ENT-03`](../foundations/domain/requirement.md)). An approval of a
stage that is no longer done does not count until it is done again.

| Option | Discarded, and why |
|---|---|
| A stage moved by hand in a tracker | It drifts from the spec; the spec already says what exists |
| Approvals in the history | A history line records a version, not who approved what |
| One approval for all of stage 3 | PRDs come one at a time ([`RULE-30`](../foundations/rules/definition.md#rule-30)) |

**Why:** a client asked where they stood and what came next, and the answer lived in someone's head.
Read from the spec, it is the same for the client and for us.
