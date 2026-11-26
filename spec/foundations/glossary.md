---
title: Glossary
description: What each thing is called, and the names no longer used
owner: Kevin
version: "1.24"
updated: "2026-11-26"
---

Every name used in the framework, with the one way to write it. Definitions live in the domain;
this page only names ([`RULE-01`](rules/writing.md#rule-01)).

## The product

| Name | Is | Defined in |
|---|---|---|
| **Product Engineering Driven Development** (PEDD) | The methodology | [`BIZ-01`](business/problem.md) |
| **OpenPEDD** | The open framework | [`BIZ-04`](business/open-core.md) |
| **OpenPEDD Cloud** | The paid plan | [`BIZ-04`](business/open-core.md) |
| `pedd init` · `pedd doctor` · `pedd update` · `pedd install` · `pedd launch` | Onboarding, what each stage lacks, refreshing the framework's files, setting up after cloning, launching | [workspace](../modules/workspace/prd.md) |
| Walkthrough | How to do one thing, on the real screen, on request. Not a tour | [`ARCH-07`](architecture/walkthroughs.md) |
| Answer · Point · Take there · Act | The levels of help inside a product | [`ARCH-07`](architecture/walkthroughs.md) |
| Launch | The moment customers get a feature. Not the deploy | [`ARCH-08`](architecture/release.md) |
| `hotfix` | The track for a production bug that cannot wait | [`ARCH-08`](architecture/release.md) |
| Level: `unit` · `integration` · `contract` · `e2e` · `eval` | Where a criterion is proved | [`ARCH-10`](architecture/testing.md) |
| `unmapped` | A module in the index with no PRD yet | [`ENT-21`](domain/module.md) |
| `pedd` | The CLI, and the short form of the name | [`ARCH-01`](architecture/overview.md) |
| Baseline · baseline gap | What every project starts with, versioned; what a product lacks against the current one | [Baseline](../modules/workspace/baseline.md) |
| Project template · `template/` | What `pedd init` installs, and what a project is copied from before the CLI exists | [workspace](../modules/workspace/baseline.md#the-project-template) |
| Monorepo · `mono` · `split` · `apps/` · `packages/ui` · `packages/i18n` | The default layout, and the split one for when a part must be apart | [`ARCH-03`](architecture/workspace.md) |
| Code index · `.pedd/code-index/` | The generated map of the code, per module and package, read first by every agent | [`ARCH-19`](architecture/code-index.md) |
| `pedd view` · project view · `views.json` | A map of what a project's spec defines, one per kind, generated from its IDs, tables and links | [views](../modules/views/prd.md) · [`ARCH-22`](architecture/views.md) |
| Loose item | An item linked to nothing that governs it or that it governs; `pedd check` fails on it | [`RULE-27`](rules/writing.md#rule-27) |
| Extension · Cloud add-on | A skill outside the core, free; one OpenPEDD hosts or pays for, paid | [`BIZ-04`](business/open-core.md#extensions) |
| i18n · base locale · `locales` | Every text a person reads is a key; English is the base, other languages are locales | [`DEC-21`](../decisions/DEC-21-i18n-from-day-one.md) |
| Label · locale column (`en`, `es`) | What a name is called on screen in one language: a column of the project's Glossary, headed by the locale's code; the name stays in English | [`DEC-33`](../decisions/DEC-33-names-per-locale.md) |

## The hierarchy

| Name | Is | Defined in |
|---|---|---|
| **Product** | What one spec describes: Reclee, ZapCV, OpenPEDD | [`ENT-20`](domain/product.md) |
| **Module** | A part of the product that stands on its own: ATS, Talent pool | [`ENT-21`](domain/module.md) |
| **PRD** | Product Requirements Document: the document of a module. *Product* names the kind of requirements, not the scope | [`ENT-21`](domain/module.md) |
| **Requirement** · **Acceptance Criterion** | A row of a PRD | [`ENT-03`](domain/requirement.md) · [`ENT-04`](domain/acceptance-criterion.md) |
| **Business** · **Market** · **Marketing** | What we decided · what we measured outside · how we speak to people who do not know the product yet | [Business](business/README.md) · [Market](market/README.md) |

## Traceability

| Name | Is | Defined in |
|---|---|---|
| Chain | Every link that exists because of a requirement | [`ENT-22`](domain/trace-link.md) |
| Link kind: `spec` · `origin` · `change` · `design` · `task` · `code` · `test` · `deploy` · `flag` · `docs` · `metric` | What a link is | [`ENT-22`](domain/trace-link.md) |
| Position · blocker | The furthest link done · the first one that is not | [`ENT-22`](domain/trace-link.md#rolling-up) |
| Trace event | One state change of a link | [`ENT-23`](domain/trace-event.md) |
| Candidate story | A tracker issue that asks to change a live requirement, waiting for a person | [`ENT-22`](domain/trace-link.md) |
| Hotspot | A module or PRD that receives many stories per week | [`ARCH-05`](architecture/traceability.md) |

## The cycle

| Name | Is | Defined in |
|---|---|---|
| Stage: `map` · `specify` · `architect` · `design` · `plan` · `build` · `verify` · `accept` · `publish` · `measure` | One step of the cycle | [`ENT-10`](domain/stage.md) |
| Mode: `interactive` · `delegated` · `human` | How a stage runs | [`ENT-10`](domain/stage.md) |
| `architect.mode`: `guided` · `delegated` | How architecture runs | [`DEC-08`](../decisions/DEC-08-architect-mode.md) |
| Track: `full` · `story` · `fix` · `hotfix` · `cover` · `chore` | The path of a change | [`ENT-11`](domain/track.md) |
| Change branch · design branch · architecture branch · implementation branch · base | The branches of a change; a task is a commit on the implementation branch | [`ARCH-06`](architecture/branches.md) |
| Sweep · `pedd sweep` · `/sweep` | Every open question of a change, from every stage ahead, in one sheet with a recommendation each | [`ARCH-16`](architecture/sweep.md) |
| Weight: `high` · `medium` · `low` | How costly a decision the AI took alone is to get wrong; decides what is asked and the order it is read in | [`ARCH-23`](architecture/weight.md) |
| Undeclared assumption | One `verify` finds in the code with no delta | [`ARCH-11`](architecture/pipeline.md#nothing-left-unrecorded) |
| Request · `requested` · `dropped` · `retired` | A client's ask, which is a change branch from the start; a change dropped before approval, or retired after it | [`ARCH-21`](architecture/requests.md) · [`ENT-06`](domain/change.md) |
| `draft` · `confirmed` · `agreed` | A request's definition: being defined, confirmed by the client, taken by the builder and queued. `agreed` is not `accepted`, a change's status after `accept` | [`DEC-27`](../decisions/DEC-27-request-agreed.md) |
| Edit branch · `edit/` | One edit to an agreed request, merged into its branch by the builder | [`ARCH-21`](architecture/requests.md#edit-branch) |
| `@openpedd/reader` | The package that reads a spec, shared by the CLI and the Cloud | [`ARCH-20`](architecture/reader.md) |
| Business Map · as-is · to-be · business mode · product engineer | How a client's organization works today and with the system; `map`'s mode that draws it; the person who runs it | [map](../modules/map/prd.md#business-mode) |
| Business use case (`BUC`) · business actor · business worker · `core` · `supporting` · `management` | What the business does that yields a result of value to a business actor, outside it; `core` for an outside actor, `supporting` and `management` for itself; a business worker is a role inside that realizes it; `Includes` and `Extends` relate two of them | [`MKT-16`](market/analysis-order.md#a-business-use-case), [map](../modules/map/prd.md#business-mode) |
| Discovery · industry glossary | The pieces every client answers, in order, before any PRD; the words of an industry, researched once in `industries/` and linked by each project | [`DEC-30`](../decisions/DEC-30-discovery-before-prds.md) |
| Client stage | One of the five stages of the work with a client: industry, diagnosis, project, specification, construction; each read from the spec, its approvals in `foundations/business/stages.md` | [`DEC-31`](../decisions/DEC-31-client-stages.md) |
| Map of a definition | Every level of a definition, from the business to the data model, in order | [`ARCH-24`](architecture/definition-map.md) |
| Branding change | The change that fills the `Brand System` before a product's first screens | [open](../open/README.md#the-roadmap) |
| Guided definition · minimum map · `/specify-interview` | A client's definition in a conversation; what each scope needs, item by item, with who answers it | [`ARCH-18`](architecture/definition.md) |
| Footprint · overlap · queue · landing order · `pedd overlap` · `pedd sync` · `pedd land` | What a change touches, two changes sharing it, the order requests were queued in, and the order changes reach the base | [`ARCH-17`](architecture/landing.md) |
| `pedd branch` · `/branch` · branch check | The one way to create a work branch, and the CI check that refuses one cut from elsewhere | [`ARCH-06`](architecture/branches.md#creating-a-branch) |
| Parent issue · sub-issue | The change and its stages in the tracker | [`ARCH-15`](architecture/tracker.md) |
| Anchor line | The `Spec: CHG-nn` line an issue carries, the key the tracker is searched by | [`ARCH-15`](architecture/tracker.md#created-once-by-one-hand) |
| `tests.lock` | The path and hash of each test from `plan`; the pipeline rejects a change to them | [plan](../modules/plan/prd.md) |
| Seam | The one file a mockup's data goes through; `plan` leaves its real version empty and `build` fills it | [design](../modules/design/prd.md) |
| Closing passes | Mobile, skeletons, writes, refactor, improvements, in that order | [design](../modules/design/prd.md#closing-passes) |
| `Merge Gate`: `spec-approval` · `architecture-merge` · `design-merge` · `acceptance-merge` | The way into the spec | [`ENT-09`](domain/merge-gate.md) |
| `Delta`, with `op` `ADDED` · `MODIFIED` · `REMOVED` | A proposed change | [`ENT-07`](domain/delta.md) |
| Delta type: `proposal` · `assumption` · `deviation` · `finding` | Why a delta exists | [`ENT-07`](domain/delta.md) |
| Decision on a delta: `keep` · `change` · `reject` | What `accept` decides | [`modules/accept`](../modules/accept/prd.md) |
| `Delta Report` · `Acceptance Report` | What a person reads | [`ENT-08`](domain/report.md) |
| `Judge` | The reviewer of a stage | [`ENT-12`](domain/judge.md) |
| Lens · hunter · refuter | What one judge session looks at · a judge session on one lens · `confirm-judge`, trying to prove a finding wrong | [`ARCH-13`](architecture/review.md) |
| Review signals · `/approve` · `/pedd recheck` · `/pedd override` | What a person reads first on a PR · a person's approval · rerun the judges · let one commit through | [`ARCH-13`](architecture/review.md) |
| Blocking · advisory | Whether a finding stops the change, decided by `pedd`, never by the judge | [`ARCH-13`](architecture/review.md) |
| `Context Pack` | What an agent reads | [`ENT-13`](domain/context-pack.md) |
| `Anchor` · `fresh` · `stale` · `uncovered` | Freshness | [`ENT-14`](domain/anchor.md) |
| `Foundations` · `Derived Artifacts` · `Records` | The three kinds of objects | [`ENT-02`](domain/foundation.md) · [`ENT-15`](domain/derived-artifact.md) |

## Inside a PRD

| Name | Is |
|---|---|
| `Main flow` · `Alternate flows` · `Exception flows` | The paths of a use case |
| `FR` · `NFR` | Functional and non-functional requirements ([`ENT-03`](domain/requirement.md)) |
| `AC`, in `Given / When / Then` | An acceptance criterion ([`ENT-04`](domain/acceptance-criterion.md)) |
| `Contract` | The interface of an action ([`ENT-05`](domain/contract.md)) |
| `Out of scope` | What is not built: the only section written in the negative |
| `Success metric`, with `baseline`, `target`, `review date` | The hypothesis of the PRD |
| `Variations` | Where the product works in more than one way: flag, plan, A/B |

## Requirement and PRD status

`draft` · `specified` · `designed` · `building` · `in_review` · `accepted` · `live` · `changing` · `deprecated`
([`ENT-03`](domain/requirement.md#lifecycle)).

## IDs

| Prefix | Is |
|---|---|
| `BIZ-nn` · `MKT-nn` · `MKG-nn` · `ENT-nn` · `RULE-nn` · `ARCH-nn` · `PRC-nn` · `BUC-nn` · `SEC-nn` · `INT-nn` · `EVT-nn` · `US-nn` | Foundations; `PRC` is a process of the `Business Map`, `US` one of its user stories, `BUC` one of its business use cases |
| `FR-<MOD>-nn` · `NFR-<MOD>-nn` · `FR-<MOD>-nn.ACn` | Requirements and criteria |
| `DEC-nn` · `ADR-nn` | Decisions |
| `Q-nn` | Open questions |
| `CHG-nnn` · `DLT-nnnn` | Changes and deltas |

Module codes: `CYC` cycle · `TRK` tracks · `WSP` workspace · `MAP` · `SPC` specify · `ARC` architect ·
`DSG` design · `PLN` plan · `BLD` build · `VRF` verify · `ACC` accept · `PUB` publish · `MSR` measure · `TRC` trace.

## Names no longer used

| Old name | Now |
|---|---|
| OpenSDD (working name) | OpenPEDD ([`DEC-01`](../decisions/DEC-01-name.md)) |
| `RF` · `RNF` | `FR` · `NFR` |
| `TR` (transversal rule) | `RULE` |
| `D` (decision) | `DEC` |
| Especificación, Arquitectura, Diseño, Planificación, Desarrollo, Testing, Documentación | `specify`, `architect`, `design`, `plan`, `build`, `verify`, `publish` |
| Testing (as a stage after development) | Tests are written in `plan`; `verify` is the judge |
| Changes (as a history) | `History` for versions; `changes/` for work in flight |
| Task branch · task PR | A commit on the implementation branch ([`DEC-32`](../decisions/DEC-32-one-pr-per-stage.md)) |
| Camino feliz · alternativo · de excepción | `Main flow` · `Alternate flows` · `Exception flows` |
| Finalizado (PRD status) | `live` |
| En mejora (PRD status) | `changing` |
| `designing` (status) | `specified` |
| One repo per audience (default) | One monorepo ([`DEC-22`](../decisions/DEC-22-monorepo-default.md)) |
| `ready` (status) | `designed`: `ready` read as launched, next to `live` |
| `product/` (the folder of modules) | `modules/` |
| Area (level above the PRD) | Module |
| The landscape, as a Business document | `MKT-01`. Its old Business ID stays dead ([`RULE-03`](rules/writing.md#rule-03)) |
