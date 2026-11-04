---
title: Glossary
description: What each thing is called, and the names no longer used
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

Every name used in the framework, with the one way to write it. Definitions live in the domain;
this page only names ([`RULE-01`](rules/writing.md#rule-01)).

## The product

| Name | Is | Defined in |
|---|---|---|
| **Product Engineering Driven Development** (PEDD) | The methodology | [`BIZ-01`](business/problem.md) |
| **OpenPEDD** | The open framework | [`BIZ-04`](business/open-core.md) |
| **OpenPEDD Cloud** | The paid plan | [`BIZ-04`](business/open-core.md) |
| `pedd` | The CLI, and the short form of the name | [`ARCH-01`](architecture/overview.md) |

## The cycle

| Name | Is | Defined in |
|---|---|---|
| Stage: `map` · `specify` · `architect` · `design` · `plan` · `build` · `verify` · `accept` · `publish` · `measure` | One step of the cycle | [`ENT-10`](domain/stage.md) |
| Mode: `interactive` · `delegated` · `human` | How a stage runs | [`ENT-10`](domain/stage.md) |
| `architect.mode`: `guided` · `delegated` | How architecture runs | [`DEC-08`](../decisions/DEC-08-architect-mode.md) |
| Track: `full` · `story` · `fix` · `chore` | The path of a change | [`ENT-11`](domain/track.md) |
| `Merge Gate`: `spec-approval` · `architecture-merge` · `design-merge` · `acceptance-merge` | The way into the spec | [`ENT-09`](domain/merge-gate.md) |
| `Delta`, with `op` `ADDED` · `MODIFIED` · `REMOVED` | A proposed change | [`ENT-07`](domain/delta.md) |
| Delta type: `proposal` · `assumption` · `deviation` · `finding` | Why a delta exists | [`ENT-07`](domain/delta.md) |
| Decision on a delta: `keep` · `change` · `reject` | What `accept` decides | [`product/accept`](../product/accept/prd.md) |
| `Delta Report` · `Acceptance Report` | What a person reads | [`ENT-08`](domain/report.md) |
| `Judge` | The reviewer of a stage | [`ENT-12`](domain/judge.md) |
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

`draft` · `designing` · `ready` · `building` · `in_review` · `live` · `changing` · `deprecated`
([`ENT-03`](domain/requirement.md#lifecycle)).

## IDs

| Prefix | Is |
|---|---|
| `BIZ-nn` · `ENT-nn` · `RULE-nn` · `ARCH-nn` · `SEC-nn` · `INT-nn` · `EVT-nn` | Foundations |
| `FR-<MOD>-nn` · `NFR-<MOD>-nn` · `FR-<MOD>-nn.ACn` | Requirements and criteria |
| `DEC-nn` · `ADR-nn` | Decisions |
| `Q-nn` | Open questions |
| `CHG-nnn` · `DLT-nnnn` | Changes and deltas |

Module codes: `CYC` cycle · `TRK` tracks · `WSP` workspace · `MAP` · `SPC` specify · `ARC` architect ·
`DSG` design · `PLN` plan · `BLD` build · `VRF` verify · `ACC` accept · `PUB` publish · `MSR` measure.

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
| Camino feliz · alternativo · de excepción | `Main flow` · `Alternate flows` · `Exception flows` |
| Finalizado (PRD status) | `live` |
| En mejora (PRD status) | `changing` |
