---
title: How agents design and audit interfaces
description: MKT-20 · The skills that give a coding agent design, UX and frontend instructions, the standards they read, and the tools that measure a rendered screen. Surveyed 2026-11-28
owner: Kevin
version: "1.0"
updated: "2026-11-28"
---

# MKT-20 · How agents design and audit interfaces

Surveyed on 2026-11-28. Read through their repos on `main`: the `SKILL.md`, references and issues of
every skill in the table below, plus `emilkowalski/skills` and `snapsynapse/skill-a11y-audit`. Sizes
are bytes / 4, rough. **Unverified**: Kiro beyond its specs page, Tessl's scoring, Deque's MCP
pricing, skills.sh install counts, and Material's full state list (its site rendered empty).

## The skills

| Tool | Gives the agent | Reads the project's own system | Checks its output | License | Where it breaks |
|---|---|---|---|---|---|
| **Anthropic `frontend-design`** | A procedure and a list of five "AI default" looks to avoid; one file, about 2,300 tokens | No: it invents a palette per brief | Advises screenshots if available | Apache-2.0 | No mode for an existing design system (#1562, open); pill buttons on 10 of 21 pages because they were not on its list (#1808) |
| **impeccable** | 24 commands routed from `SKILL.md`, one playbook each (about 110,000 tokens in all); a detector with 62 rules | Yes: `init` and `document` write `DESIGN.md` from the code | Screenshots, the detector as a hook and in CI (SARIF), critique subagents | Apache-2.0 | Audits only the page as it loads: hover, closed disclosures and narrow menus pass (#1658); a critique costs about 200,000 tokens (#1691); an absolute ban overrode a brief that asked for the element (#1653); telemetry without telling (#1452) |
| **taste-skill** | An imposed kit: palette, fonts and layouts dealt from its library; five references (about 30,000 tokens) read before the first page | No: components take its starter's classes | Headless Chrome at five widths, a gate as a Stop hook | MIT | "Any stack" worked only for static HTML (#195); the gate fights briefs (#223) |
| **ui-ux-pro-max** | A search script over CSV tables of styles, palettes and UX rules; writes its own `MASTER.md` | No | A text checklist | MIT | **In 200 runs the agent never opened its "read on demand" references** (#484); a dashboard query got a landing page (#613); its scripts overwrote the project's Tailwind config and tokens (#496) |
| **Vercel `web-design-guidelines`** | A rule list and a review that outputs `file:line`; about 2,500 tokens, pinned by SHA-256 | Partly: rules assume Tailwind | Reads code; renders nothing | MIT (the guidelines) | Fetched its rules from a moving branch until pinned (#351, #348); two rules contradicted each other (#11) |
| **shadcn skill** | **Injects the project's installed components at load** (`shadcn info --json`); "use existing components first", semantic tokens only | Yes | Re-reads the files it added | MIT | The injected command fails in monorepos and the skill does not load (#11271) |
| **Figma MCP + skills** | Design context, screenshots and variables; "always use the project's components", its tokens over Figma's | Yes | The Figma screenshot is the reference of a final checklist | None found | Output is React + Tailwind to translate; six calls a month on Starter seats |
| **BMAD `bmad-ux`** | An interview that writes `DESIGN.md` and `EXPERIENCE.md`, with state patterns; its validation checks state coverage per surface: empty, cold load, error, offline, permission denied | Yes: inherits the named UI system | Documents only; nothing rendered | MIT | Pushed visuals regardless of mode (#3053) |
| **Spec Kit** | No design step; `clarify` lists "error, empty, loading states" among gaps | — | Documents only | MIT | A design command was asked and closed for inactivity (#292) |
| **`ui-states`** (benji) | "The happy path is one of five states"; a loading ladder (nothing under 800 ms, spinner to 3 s, then skeleton) from the project's data layer | Yes | None | None found | Three stars; the only dedicated states skill opened |
| **Google `DESIGN.md`** | A format, YAML tokens plus prose; a linter for references and contrast | — | Lint, diff | Apache-2.0 | Contrast wrong on translucent backgrounds (#195) |

**What reads the product first**: shadcn, Figma, impeccable's `init` and BMAD. **What imposes its
own look**: taste-skill, ui-ux-pro-max and `frontend-design`. **How references load**: one file
(Anthropic, emil), one pinned file (Vercel), a router with one file per command (impeccable), files
read in full up front (taste-skill), many small files (ui-ux-pro-max).

## The standards

| Standard | State on 2026-11-28 | Source |
|---|---|---|
| **WCAG 2.2** | Recommendation since 2023-10-05; drops 4.1.1. New at AA: 2.4.11, 2.5.7, 2.5.8, 3.3.8. New at A: 3.2.6, 3.3.7. WCAG 3 is a Working Draft (Sept 2026), "a few more years" away | w3.org/WAI/standards-guidelines/wcag |
| **DTCG Format 2025.10** | Final Community Group Report, "stable", not a W3C standard. Types: color, dimension, fontFamily, fontWeight, duration, cubicBezier, number, and composites. Aliases `{group.token}`. Themes in a separate **Resolver Module 2025.10**: sets, modifiers with contexts (light, dark), a resolution order | designtokens.org/tr/2025.10 |
| **Nielsen's heuristics** | Ten, from 1994, reviewed 2024-01-30. Severity 0 to 4, judged on frequency, impact and persistence | nngroup.com |
| **Response times** | 0.1 s instant, 1 s keeps the flow, 10 s the limit of attention; skeleton for a full page from about 2 to 10 s, nothing under 1 s | nngroup.com |
| **GOV.UK validation** | Validate on submit, not on blur; always on the server; an error summary above the `h1`, focused, linking each field; page title prefixed "Error:" | design-system.service.gov.uk |
| **Laws of UX** | Fitts and Hick-Hyman come from experiments; Doherty's 400 ms is an industry target; Jakob's law an observation. Hick fits scanned menus poorly; Miller's 7 ± 2 is misapplied to visible menus | lawsofux.com; IxDF |

Token tiers: Material (reference, system, component), Carbon (core, component), Atlassian (a base
palette aliased by semantic tokens). States as token suffixes: Polaris `-hover`, `-active`,
`-selected`, `-disabled`; Atlassian `.hovered`, `.pressed`, `.selected`, `.focused`.

## The tools that measure

| Tool | Detects | License · price | Limit |
|---|---|---|---|
| **axe-core**, `@axe-core/playwright` | WCAG 2.0 to 2.2 rules; "incomplete" for manual review | MPL-2.0 | **57 % of issues by volume, on 16 of 50 WCAG 2.1 AA criteria** (Deque); misses text over a background image |
| Playwright `toHaveScreenshot` · Vitest `toMatchScreenshot` | Pixel diff against a baseline | Free | Baselines compare only on the OS and browser that took them |
| Storybook a11y + `addon-vitest` | axe on every story | Free | Replaces the old test runner |
| Chromatic · Percy · Applitools | Hosted visual diffs | 5,000 free snapshots / month · 5,000 free · from $667 / month | Hosted |
| Lighthouse CI | Weighted accessibility score from axe rules; budgets per commit | Apache-2.0 | Manual audits do not count |
| **jscpd** 5.4.3 | Blocks of code copied across files, by tokens; checked on 2026-11-28 to find a TSX component copied in two folders | MIT | `--similarity` pairs a fragment with a different partner each run (#1302); `--changed --semantic` is as slow as a full scan (#1303) |
| Project Wallace | 200+ CSS metrics: unique colors, font sizes, `!important` | MIT | Measures; does not fail a build |
| `stylelint-declaration-strict-value` · `eslint-plugin-tailwindcss` `no-arbitrary-value` · Atlassian `ensure-design-token-usage` · Terrazzo lint | Raw values instead of tokens; token files and their contrast pairs | MIT · MIT · free · free | One system each, or off by default |

No published rate was found for visual defects other than accessibility.
