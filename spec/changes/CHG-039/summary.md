---
title: "CHG-039 · Every client goes through five stages, read from the spec: summary for Kevin"
description: One page — the stages of the work with a client, what each delivers, who approves it, and the stages view
owner: Kevin
version: "1.0"
updated: "2026-11-24"
---

# CHG-039 · Every client goes through five stages, read from the spec

Stage: `specify`. Found with InsuNova: the client asked where they stood and what came next, and the
answer lived in someone's head.

| What | Where |
|---|---|
| **Five stages, in order**: industry, diagnosis, project, specification, construction; each with what it delivers, when it is done (read from the spec) and who approves it | [`DEC-31`](../../decisions/DEC-31-client-stages.md) |
| Diagnosis and project are approved by a row of `foundations/business/stages.md` (`Stage` · `Approved by` · `On` · `Notes`), shipped empty in the template; specification and construction by each module's status | `DEC-31`, `template/spec/foundations/business/stages.md` |
| The `stages` view: per stage its state, each piece present or missing with its file, what it delivers, who approves it, and what is next | [the business's views](../../modules/views/business.md), `FR-VEW-25`; [`ARCH-22`](../../foundations/architecture/views.md) |
| The map's approval is recorded there | [map, business mode](../../modules/map/prd.md#business-mode) |
| The interview starts from the client's stage | [`ARCH-18`](../../foundations/architecture/definition.md), `skills/specify-interview/SKILL.md` |

Built: `@openpedd/reader` 0.13.0 (`readStages`, the `stages` view, `openpedd-reader stages`),
`@openpedd/cli` 0.11.0, with tests.
