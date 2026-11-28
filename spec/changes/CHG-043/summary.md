---
title: "CHG-043 · Interface quality: summary for Kevin"
description: One page — what the market does for agents that design and audit interfaces, where that knowledge lives in OpenPEDD, and what changed in the design stage
owner: Kevin
version: "1.0"
updated: "2026-11-28"
---

# CHG-043 · Interface quality

Stage: `specify`. Asked: give the framework real frontend, UX, UI, design-system and visual-QA
capability, with every screen designed in every state, not only the one with data. The design stage
already specified its steps and its judge; none had a skill yet.

| What | Where |
|---|---|
| How eleven skills and formats give an agent design instructions, which read the product's own system and which impose a look, the standards (WCAG 2.2, DTCG 2025.10, Nielsen, GOV.UK) and the tools that measure a screen | [`MKT-20`](../../foundations/market/interface-design.md) |
| **The knowledge lives in the design stage's skills, one per step, with references each step names; no skill per topic, no skill that picks skills**. `/design-audit` and `/design-brand` join the core | [`DEC-36`](../../decisions/DEC-36-interface-quality.md) |
| Every screen in each state it can reach; a screen made of the product's system, with what is outside it saying why | [`RULE-32`, `RULE-33`](../../foundations/rules/interface.md) |
| What an interface finding names and how severe it is, shared by the lens, the judge and the audit | [`ARCH-14`](../../foundations/architecture/review-lenses.md#interface-findings) |
| The inventory by `RULE-32`; the branding change and the audit; the principles; the measuring scripts and a copy detector; the closing checklist, one row per screen with each cell's evidence, run again by the judge; skeletons measured by what moves when the data arrives; inline states; a copy pass | [design](../../modules/design/prd.md) |
| How an agent drives a browser: Playwright's library for the sweep, its CLI for looking by hand | [`MKT-21`](../../foundations/market/agent-browsers.md) |
| How interface copy is written and checked: the guides, the skills, the linters, the i18n rules | [`MKT-22`](../../foundations/market/interface-copy.md) |
| How screens are measured: the development menu's URL, the sweep with keyboard walk and actions, the whole product against the base, the closing checklist | [`ARCH-25`](../../foundations/architecture/screen-checks.md) |
| The design judge runs on Sonnet by default: it reads screenshots | [`DEC-36`](../../decisions/DEC-36-interface-quality.md) |
| The `Audit Report` · the `Brand System`'s token tiers · `adopt` offers the audit · a part names the reference it reads | [`ENT-08`](../../foundations/domain/report.md) · [`ENT-02`](../../foundations/domain/foundation.md) · [workspace](../../modules/workspace/prd.md#adopting-a-running-product) · [`ARCH-04`](../../foundations/architecture/agents.md) |

Built with it: `skills/design` and its six parts (`-inventory`, `-variants`, `-complete`, `-close`,
`-brand`, `-audit`), ten references, four scripts and `agents/design-judge.md`. The scripts, the
copy detector and the Playwright CLI ran on fixtures with known defects and found each one; no skill has run on a real change yet, so nothing
here is measured on a product. No Interface lens item was added: an item comes only from a
correction.
