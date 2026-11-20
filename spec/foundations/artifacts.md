---
title: Artifacts
description: Every artifact of an OpenPEDD project — what it defines, where it lives, who writes it and how
owner: Kevin
version: "1.6"
updated: "2026-11-20"
---

Every kind of artifact a project has, in one table. **Each one defines one thing, and only that.**
How each is written in detail lives in the guide of its folder (*How* column).

## The spec: what governs

| Artifact | Defines | Lives in | ID | Written by | Budget | How |
|---|---|---|---|---|---|---|
| Business document | What we decided about the product as a business: problem, audience, pricing, north star | `foundations/business/` | `BIZ-nn` | `specify` | 2,000 | [Business](business/README.md) |
| Market document | What we measured outside, with its survey date | `foundations/market/` | `MKT-nn` | `specify` | 2,000 | [Market](market/README.md) |
| Marketing document (optional) | How the product speaks to people who do not know it yet: messages, channels, the rules of each format | `foundations/marketing/` | `MKG-nn` | `specify` | 2,000 | [Marketing](marketing/README.md) |
| Entity | What a concept is: fields, states, transitions | `foundations/domain/` | `ENT-nn` | `specify` | 2,000 | [Domain](domain/index.md) |
| Rule | What every module or document must follow | `foundations/rules/` | `RULE-nn` | `specify` | 2,000 per file | [Rules](rules/README.md) |
| Glossary | What each thing is called, in code and on screen | `foundations/glossary.md` | — | `specify` | 4,000 | [Glossary](glossary.md) |
| Other foundations | Business map, brand, voice, security, quality, integrations, pipeline, tracking plan, test data | `foundations/<name>/` | `PRC` · `SEC` · `INT` · `EVT` | `specify` · `architect` | 2,000 | [`ENT-02`](domain/foundation.md) |
| Architecture document | How the product is built and run | `foundations/architecture/` | `ARCH-nn` | `architect` | 2,000 | [Architecture](architecture/README.md) |
| PRD | What a module does: flows, requirements, criteria, contracts | `modules/<module>/` | `FR` · `NFR` · `AC` | `specify` | 4,000 | [Modules](../modules/README.md) |
| Decision | The answer to a question, and why | `decisions/` | `DEC-nn` | `specify` · `accept` | 1,000 | [Decisions](../decisions/README.md) |
| Architecture decision | A technical choice: context, options, decision, consequences | `decisions/` | `ADR-nn` | `architect` | 1,000 | [Decisions](../decisions/README.md) |

## What does not govern yet

| Artifact | Defines | Lives in | ID | Written by | How |
|---|---|---|---|---|---|
| Question | Something to decide | `open/questions.md` | `Q-nn` | Any stage | [Open](../open/README.md) |
| Idea | Something loose, without a decision | `open/ideas.md` | — | Anyone | [Open](../open/README.md) |
| Roadmap | What comes next, in order | `open/roadmap.md` | — | `specify` | [Open](../open/README.md) |

## Records: what happened

| Artifact | Records | Lives in | ID | Written by | How |
|---|---|---|---|---|---|
| Change | One unit of work through the cycle | `changes/<CHG>/` | `CHG-nnn` | `specify` | [`ENT-06`](domain/change.md) |
| Delta | A proposed change to one ID | `changes/<CHG>/deltas/` | `DLT-nnnn` | Every stage but `specify` | [`ENT-07`](domain/delta.md) |
| Delta Report · Acceptance Report | What a person reads to decide | `changes/<CHG>/reports/` | — | `architect` · `design` · `verify` | [`ENT-08`](domain/report.md) |
| History entry | One version of one document | `history/` | — | `publish` | [`ENT-17`](domain/history-entry.md) |
| Code index | Where each module and package lives in the code: paths, entry points, IDs, symbols, components, tests | `.pedd/code-index/` | — | The CLI, on every merge to the base | [`ARCH-19`](architecture/code-index.md) |
| Detected stack | The technologies in the code, each with the file that proves it | `.pedd/stack.json` | — | The CLI | [`DEC-12`](../decisions/DEC-12-stack-derived.md) |
| Install manifest | Each file the framework installed, and its hash | `.pedd/manifest.json` | — | The CLI | [workspace](../modules/workspace/prd.md) |
| Trace event | One state change of a link in the chain | `.pedd/trace/` | — | The CLI, or the Cloud | [`ENT-23`](domain/trace-event.md) |

## Derived artifacts: produced from the spec

| Artifact | Comes from | Lives in | Produced by | Anchor |
|---|---|---|---|---|
| Mockup | `FR` | The code, built on the design branch | `design` | `@spec`, like code |
| Test | `AC` · contract | The code | `plan` | The criterion ID in the test name |
| Code | `FR` · `NFR` | The code | `build` | `spec.lock` or `@spec` |
| Task | `FR` · `NFR` | The tracker, an item of the implementation sub-issue's checklist | `plan` | Its IDs on the item |
| Pull request | The task, or the whole change | The code host: to the change branch, or to the base | `build` · `verify` | Its **Spec** section |
| API Reference | Contracts | `apps/docs`, or `<project>-docs` in `split` | `publish` | Generated |
| Help Center article | `FR` | `apps/help`, or `<project>-help` in `split` | `publish` | `sources` in frontmatter |
| Walkthrough (optional) | `FR` | `apps/help/walkthroughs/`, or `<project>-help` in `split` | `verify` · `publish` | `sources` in the file |
| Release Notes entry | The change | `apps/help`, or `<project>-help` in `split` | `publish` | The change ID |

Each derived artifact is `fresh`, `stale` or `uncovered` ([`ENT-14`](domain/anchor.md#freshness)), and
each is a link in the requirement's chain ([`ENT-22`](domain/trace-link.md)).
