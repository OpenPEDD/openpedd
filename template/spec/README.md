---
title: Spec
description: The specification of this product, and the order to read it in
owner: <owner>
version: "1.0"
updated: "2026-11-20"
source: spec/README.md
---

# Spec

The specification of **<project>**: the single source of truth, and everything derived from it (code,
mockups, tests, API Reference, Help Center, tasks) knows whether it is still up to date. It follows
the format of [OpenPEDD](https://github.com/openpedd/openpedd).

The hierarchy is **Product → Module → PRD → Requirement** ([`ENT-20`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/domain/product.md)).
Every kind of artifact, what it defines and how it is written, is in
[**Artifacts**](foundations/artifacts.md). Every level of a definition, from the business to the data model, in
order, what it means and where it lives, is in [**The map of a definition**](https://github.com/openpedd/openpedd/blob/main/spec/foundations/architecture/definition-map.md).

## Reading order

| # | Where | What it holds | IDs |
|---|---|---|---|
| 1 | [`foundations/business/`](foundations/business/README.md) | What we decided: the problem, the audience, pricing, the north star | `BIZ-nn` |
| 2 | [`foundations/market/`](foundations/market/README.md) | What we measured outside, with its survey date | `MKT-nn` |
| 3 | [`foundations/domain/`](foundations/domain/index.md) | Every concept the product is made of, defined once | `ENT-nn` |
| 4 | [`foundations/glossary.md`](foundations/glossary.md) | What each thing is called, and names no longer used | — |
| 5 | [`foundations/rules/`](foundations/rules/README.md) | Rules that apply to every module and every document | `RULE-nn` |
| 6 | [`foundations/architecture/`](foundations/architecture/README.md) | How it is built | `ARCH-nn` |
| 7 | [`modules/`](modules/README.md) | One folder per module, with its PRDs | `FR-<MOD>-nn` · `NFR-<MOD>-nn` |
| 8 | [`decisions/`](decisions/README.md) | Closed questions | `DEC-nn` · `ADR-nn` |
| 9 | [`open/`](open/README.md) | Questions, ideas and roadmap: what does not govern yet | `Q-nn` |
| — | `changes/` · `history/` | Changes in flight · version history | `CHG-nnn` · `DLT-nnnn` |
