---
title: Open questions
description: What is still to be decided. Each closes only with a DEC
owner: Kevin
version: "1.3"
updated: "2026-11-23"
---

Each question closes only with a new `DEC` that names it ([`RULE-08`](../foundations/rules/writing.md#rule-08)).
Closed so far: `Q-01` to `Q-06`, `Q-10` and `Q-20` (`DEC-01` to `DEC-06`, `DEC-10`, `DEC-11`).

| # | Question | Proposal | Blocks |
|---|---|---|---|
| Q-11 | The stack of the CLI and the MCP | TypeScript on Node: npm, the MCP SDK and the reader in one language | The first code |
| Q-12 | The file format: Markdown or MDX, the syntax of ID blocks (`Requirement`, `Contract`, `AC`) and of anchors | — | The index |
| Q-13 | What is normalized when computing an ID's hash | — | The index |
| Q-14 | The scope of the MVP: which stages and adapters ship first | `workspace`, `specify`, freshness (index, hash, `pedd status`), MCP and reader | The roadmap |
| Q-15 | OpenPEDD Cloud pricing and plans | Lives in `openpedd-cloud` | — |
| Q-16 | The visual identity | Distinct from OpenSpec and OpenSDD (`DEC-01`) | The public launch |
| Q-17 | CLI telemetry: none, opt-in or opt-out | — | The first release |
| Q-18 | Project governance: CLA, `CONTRIBUTING`, code of conduct, who merges | — | Going public |
| Q-19 | Trackers besides Linear (Jira, GitHub Issues), and when | — | — |
| Q-21 | OpenPEDD's north-star metric | Products whose spec stays `fresh` week over week, or bugs found at acceptance that the spec already covered | `BIZ-05` |
| Q-22 | How `pedd init` detects the stack: Specfy's Stack Analyser or its own rules | Stack Analyser, tried on Reclee first (`MKT-02`) | `pedd init` |
| Q-23 | The cells of the weight table and the fan-out threshold (`ARCH-22`) | The first cut as written; reviewed after ten changes, from the decisions per weight | Trusting the `low` to one reply |
