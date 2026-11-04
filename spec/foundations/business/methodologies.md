---
title: What we borrow
description: BIZ-03 · The proven pieces OpenPEDD takes from other methods, and in which stage
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

# BIZ-03 · What we borrow

OpenPEDD does not invent a method: it gathers proven pieces and orders them around a spec that
governs. This table says where each piece comes from, so nobody reinvents it or argues it again.

| Source | What we take | Stage |
|---|---|---|
| Böckeler, the three SDD levels | We are spec-anchored: the spec stays alive and everything is kept against it | All |
| GitHub Spec Kit | Constitution (our foundations), `/clarify`, spec checklist, `/analyze`, `/converge`, extensions and presets | `specify` · `plan` · `verify` |
| OpenSpec | The delta format, `specs/` against `changes/`, the archive, the spec in its own repo | `specify` · `publish` |
| Kiro | EARS: *"When `<trigger>`, the system shall `<response>`"* | `specify` |
| BMAD-METHOD | One agent per role, and *correct course* when something drifts | All |
| pdd-kit | The product model, mapping an existing repo, blueprints, variations, changes read as sentences | `map` · `specify` |
| Spec Growth Engine | Contract apart from design, context by ownership path, hardest-first, drift gate | `plan` · `verify` |
| ODD | SDD + TDD + IDD: agents cannot change contracts or tests; done means evidence | `plan` · `build` · `verify` · `accept` |
| ATDD / BDD | Criteria in `Given / When / Then` become tests before building | `specify` · `plan` |
| TDD | Red, green, refactor, per task | `build` |
| Contract testing | A test per contract | `plan` · `verify` |
| V-Model | The traceability matrix, both ways | `plan` · `verify` |
| OWASP ASVS | The security controls the judge checks | `architect` · `verify` |
| C4 model | Context, container and component diagrams | `architect` |
| ADR / MADR | One architecture decision per file | `architect` |
| arc42 quality requirements | Quality scenarios for `NFR`s: stimulus, response, measure | `specify` · `architect` |
| Fitness functions | A `NFR` becomes an automatic check | `architect` · `plan` |
| Use cases (Cockburn) | Main, alternate and exception flows | `specify` |
| Jobs to be Done | The PRD goal as the job the user hires the product for | `specify` |
| Shape Up | Appetite, no-gos (`Out of scope`), rabbit holes | `specify` |
| User stories + INVEST | How a story is written; how a task is checked as atomic | `specify` · `plan` |
| Double Diamond | Diverge into options, converge on the winner | `design` |
| Design tokens (W3C DTCG) | The brand system as tokens, readable by AI and code | `design` · `build` |
| Nielsen heuristics, WCAG 2.2 AA | What the design judge checks | `design` · `verify` |
| Living Documentation, docs as code | Docs derived from the source, reviewed by PR | `publish` |
| Diátaxis | Help Center articles as tutorial, how-to, reference, explanation | `publish` |
| OpenAPI / JSON Schema | The API Reference from the contracts | `publish` |
| Keep a Changelog + SemVer | Release notes, and the version of each document | `publish` |
| Lean Startup, HEART, North Star | Each PRD is a hypothesis with a metric and a review date | `specify` · `measure` |

## What we decided not to take

| Piece | Why not |
|---|---|
| Spec-as-source (Tessl) | Code is kept against the spec, not regenerated from it |
| One spec folder per feature (Spec Kit) | The spec lives as long as the product; the change lives in `changes/` |
| Waterfall of complete documents up front | A story runs the whole cycle quickly, with only the stages it needs |
