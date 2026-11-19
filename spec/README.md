# OpenPEDD Spec

The specification of **OpenPEDD Framework**, the open framework for **Product Engineering Driven
Development**: the spec is the single source of truth, and everything derived from it (code,
mockups, tests, API Reference, Help Center, tasks) knows whether it is still up to date.

OpenPEDD is specified with OpenPEDD. This folder follows the format it defines, in `mono` mode: the spec lives next to the code ([`DEC-11`](decisions/DEC-11-visibility.md)).

The hierarchy is **Product → Module → PRD → Requirement** ([`ENT-20`](foundations/domain/product.md)).
Every kind of artifact, what it defines and how it is written, is in
[**Artifacts**](foundations/artifacts.md).

**To see what the framework can do, start with [What OpenPEDD can do](capabilities.md).**

## Reading order

| # | Where | What it holds | IDs |
|---|---|---|---|
| 1 | [`foundations/business/`](foundations/business/README.md) | What we decided: the problem, what we borrow, open core, audience | `BIZ-nn` |
| 2 | [`foundations/market/`](foundations/market/README.md) | What we measured outside, with its survey date | `MKT-nn` |
| 3 | [`foundations/domain/`](foundations/domain/index.md) | Every concept the framework is made of, defined once | `ENT-nn` |
| 4 | [`foundations/glossary.md`](foundations/glossary.md) | What each thing is called, and names no longer used | — |
| 5 | [`foundations/rules/`](foundations/rules/README.md) | Rules that apply to every stage and every document | `RULE-nn` |
| 6 | [`foundations/architecture/`](foundations/architecture/README.md) | How it is built | `ARCH-nn` |
| 7 | [`modules/`](modules/README.md) | One module per stage, plus the cycle, tracks, workspace and trace | `FR-<MOD>-nn` · `NFR-<MOD>-nn` |
| 8 | [`decisions/`](decisions/README.md) | Closed questions | `DEC-nn` · `ADR-nn` |
| 9 | [`open/`](open/README.md) | Questions, ideas and roadmap: what does not govern yet | `Q-nn` |
| — | `changes/` · `history/` · `designs/` | Deltas in flight · version history · reference images (the mockups live in the code) | `CHG-nnn` · `DLT-nnnn` |

## Status

Bootstrap: migrated on 2026-11-04 from the working drafts. OpenPEDD does not exist yet, so this spec
is written by hand in its own format. The first code of OpenPEDD will be the reader, checks and MCP
for this spec, next to it in the same repo.

## License

The content of this folder is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
([`DEC-02`](decisions/DEC-02-licenses.md)). The repo stays private until the trademark is filed
([`DEC-11`](decisions/DEC-11-visibility.md)).
