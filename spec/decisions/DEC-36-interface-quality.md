---
title: "DEC-36 · Interface quality lives in the design stage's skills, made of the product's own system"
description: Where the design, UX, frontend and visual-QA knowledge of the framework lives, how it is loaded, and which skills audit and build the design system
owner: Kevin
version: "1.0"
updated: "2026-11-28"
---

# DEC-36 · Interface quality lives in the design stage's skills, made of the product's own system

**Date:** 2026-11-28

| What | Where it lives |
|---|---|
| **The procedure**: inventory, variants, complete, the closing passes, the judge | The core: one skill per step of [design](../modules/design/prd.md), named as [`ARCH-04`](../foundations/architecture/agents.md) says, and `design-judge` |
| **The knowledge**: states, screen layouts, visual design, usability, WCAG 2.2, responsive, tokens, frontend code, interface copy ([`MKT-22`](../foundations/market/interface-copy.md)), what a finding is | Reference files of the `/design` skill, each **named by the step that reads it, at the moment it reads it**: the skills follow the steps, and the topics live in their references |
| **The measurements**, as [`ARCH-25`](../foundations/architecture/screen-checks.md) says | Scripts with the skill: one reads the code for values outside the tokens and repeated class sets, one reads the copy, one measures the rendered page, and the sweep runs it over every state, role, width and theme with axe and screenshots, walks the keyboard, runs each inline state and write as an action, and compares the whole product with the base; `jscpd` for copied code |
| **The design judge's model** | Sonnet by default in every profile, overriding the profile's judge ([`DEC-07`](DEC-07-models.md)): it reads screenshots, and reading what a screen shows is the check that matters most here |
| **Seeing the screens** | Playwright, required with screens: its library under the sweep, its CLI and skill for looking and acting by hand, which Microsoft recommends to coding agents over its MCP because it loads no tool schemas or trees into the context ([`MKT-21`](../foundations/market/agent-browsers.md)) |
| **Auditing screens that exist**: on `adopt`, before a branding change, before a launch | `/design-audit`, in the core. Its findings become `fix` changes; it fixes nothing |
| **Building or extending the design system**: the branding change | `/design-brand`, in the core |
| **What every stage that touches a screen follows** | [`RULE-32`](../foundations/rules/interface.md#rule-32) (every state it can reach) and [`RULE-33`](../foundations/rules/interface.md#rule-33) (made of the product's system) |
| **What an interface finding names** | [`ARCH-14`](../foundations/architecture/review-lenses.md#interface-findings), shared by the judge, the audit and the Interface lens |
| A skill that brings its own aesthetic (taste kits, palettes per brief) | An extension, if anyone lists one ([`DEC-25`](DEC-25-where-skills-live.md)) |

**Why:** the market splits in two ([`MKT-20`](../foundations/market/interface-design.md)). The
skills that impose a look break inside a product that already has a design system, and one
overwrote a project's tokens. The ones that read the product first (shadcn, Figma, BMAD) hold. Taste
is the client's and the `Brand System`'s; the method is what is free and the same for everyone. A
skill per topic (`ui-design`, `accessibility`) would define again what the stage's steps and judge
already check ([`RULE-01`](../foundations/rules/writing.md#rule-01)), and a skill that picks which
others to load is a model coordinating ([`RULE-24`](../foundations/rules/cycle.md#rule-24)).
References "read on demand" were never opened in 200 runs of one skill; named by the step that needs
them, they are read. The audit is in the core, unlike a security audit ([`DEC-35`](DEC-35-whole-repo-audit.md)):
it measures against the `Brand System` and the catalog, which only the method knows, and the branding
change extracts the system from its census.
