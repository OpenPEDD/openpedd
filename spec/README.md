# OpenPEDD Spec

The specification of **OpenPEDD**, the open framework for **Product Engineering Driven
Development**: the spec is the single source of truth, and everything derived from it (code,
mockups, tests, API Reference, Help Center, tasks) knows whether it is still up to date.

OpenPEDD is specified with OpenPEDD. This folder follows the format it defines, in `mono` mode: the spec lives next to the code ([`DEC-11`](decisions/DEC-11-visibility.md)).

## Reading order

| # | Where | What it holds | IDs |
|---|---|---|---|
| 1 | [`foundations/business/`](foundations/business/) | The problem, the landscape, what we borrow, the open-core model | `BIZ-nn` |
| 2 | [`foundations/domain/`](foundations/domain/) | Every concept the framework is made of, defined once | `ENT-nn` |
| 3 | [`foundations/glossary.md`](foundations/glossary.md) | What each thing is called, and names no longer used | — |
| 4 | [`foundations/rules/`](foundations/rules/) | Rules that apply to every stage and every document | `RULE-nn` |
| 5 | [`foundations/architecture/`](foundations/architecture/) | How it is built | `ARCH-nn` |
| 6 | [`product/`](product/) | One module per stage, plus the cycle, tracks and workspace | `FR-<MOD>-nn` · `NFR-<MOD>-nn` |
| 7 | [`decisions/`](decisions/) | Closed questions | `DEC-nn` |
| 8 | [`open/`](open/) | Questions, ideas and roadmap: what does not govern yet | `Q-nn` |
| — | `changes/` · `history/` · `designs/` | Deltas in flight · version history · mockups | `CHG-nnn` · `DLT-nnnn` |

## Status

Bootstrap: migrated on 2026-11-04 from the working drafts. OpenPEDD does not exist yet, so this spec
is written by hand in its own format. The first code of OpenPEDD will be the reader, checks and MCP
for this spec, next to it in the same repo.

## License

The content of this folder is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
([`DEC-02`](decisions/DEC-02-licenses.md)). The repo stays private until the trademark is filed
([`DEC-11`](decisions/DEC-11-visibility.md)).
