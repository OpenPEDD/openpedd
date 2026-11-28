---
name: design-audit
description: Audit the screens of a running product, whole or one area, against its own Brand System, its catalog, WCAG 2.2 AA and its own patterns - spacing, type and colors outside the system, look-alike components built apart, inconsistencies between pages, alignment and hierarchy, responsive overflow and clipping, contrast, missing states, accessibility and inconsistent interaction - and turn each confirmed finding into a proposed fix change. Use on adopt, before a branding change extracts the Brand System, before a launch, or when someone asks for a "UI audit", "auditoría visual", "visual debt", "design debt", "inconsistencias de UI". It fixes nothing.
---

<!-- Source: OpenPEDD spec design PRD v1.7 (auditing what exists), ARCH-14 v1.3 (an interface finding), RULE-32 v1.0, RULE-33 v1.0, ENT-08 v1.3, ARCH-25 v1.0 and DEC-36 v1.0. Change those first, then this file. -->

# Design audit: the screens that exist, measured

You audit screens that already exist, **against the product's own system first**: its tokens, its
catalog, its patterns and the states its flows need, then WCAG 2.2 AA and the heuristics. You measure,
weigh and report. **You fix nothing**: each finding becomes a proposed change.

## Scope

| Asked | You audit |
|---|---|
| A whole product (`adopt`, before a launch) | Every route, sampled by template: one screen per kind of screen, plus every screen of the riskiest flows (money, permissions, personal data, deletion) |
| An area or a module | Every screen of it |
| Before a branding change | The whole code with `scan-styles`, and one screen per kind: what is in use becomes the evidence the `Brand System` is extracted from |

Say the scope back in one line before starting, with the routes it covers.

## Before measuring

1. **Read now, in full:** [../design/references/findings.md](../design/references/findings.md). It says what counts, how severe it is, and how each kind is found.
2. **The system**: the `Brand System`, the token files, the catalog (Storybook MCP when it runs). With no `Brand System`, the product's most used values become the reference, and the report says so.
3. **The routes**, from the router or the code index, with their files (RULE-21).
4. **A browser you can drive**: Playwright in the project, and the product running with a test user per role and the `Test Data`. Without one, the rendered checks are reported as not run (RULE-22), and the audit is code only.

## Steps

1. **Code.** Run [../design/scripts/scan-styles.mjs](../design/scripts/scan-styles.mjs) over the whole app and `packages/ui`. Keep the raw colors, arbitrary values, inline styles, repeated class sets, and the census of distinct values. Then the copy detector, `npx jscpd@5.4.3 --min-tokens 50 --reporters console <dirs>`: components and logic copied across files are component debt. Then [../design/scripts/scan-copy.mjs](../design/scripts/scan-copy.mjs) over the base locale, with the `Glossary`: the words are part of the interface.
2. **Each screen, in each state it can reach.** If the product has the development menu's URL contract, use its `design-sweep.json` (or write one for the scope) and run [../design/scripts/sweep.mjs](../design/scripts/sweep.mjs): it covers steps 2 and 3 at once, keyboard walk and actions included. Otherwise open each state by hand with the Playwright CLI, through the data and the actions that cause it (an empty account, a filter with no results, a failed request, a role without permission). Then hover, focus and open its menus and dialogs. A state that cannot be reached at all is itself a finding (RULE-32).
3. **At each width** of the `Brand System`, in light and dark: run [../design/scripts/page-check.js](../design/scripts/page-check.js) and axe, and take a screenshot. Load each screen once on a slow network and run `page-check` after the data arrives: what moved is a skeleton that does not match.
4. **Across screens.** Put the same pattern side by side from every screen that has it: page headers, tables, filters, forms, empty states, dialogs, buttons, dates and amounts. Read [../design/references/screens.md](../design/references/screens.md) (*Consistency between related screens*) first.
5. **Flows.** Walk the riskiest flows with the cognitive walkthrough of [../design/references/usability.md](../design/references/usability.md).
6. **Weigh** each candidate as `findings.md` says. **Group by cause**: one finding on the token, the piece or the pattern, with every place it shows. Re-measure each `high` on a fresh load before keeping it; one that does not reproduce goes.
7. **Write the `Audit Report`** in `changes/<CHG>/reports/design-audit.md` of the change that asked for it.

## The Audit Report

| Section | Holds |
|---|---|
| Scope | The routes, states, widths and themes covered, and what was sampled out |
| Checks | Each check with **ran** or **not run, and why** |
| Findings | In order of severity, each as `findings.md` writes it |
| The proposed changes | One `fix` change per cause or per group of causes that share a fix, in order of severity: the token change first, since it fixes many places at once. Each states what it fixes and where |
| Questions | Each fact the audit could not get, as a `Q`, with no severity |
| The visual debt in numbers | From the census: distinct font sizes, colors, spacing values and radii in use against the system's; raw values; repeated class sets; screens missing states |

Budget: 3,000 tokens without screenshots (ENT-08). The person decides which changes are created; then
they enter the tracker.

## Never

- Fix anything, even "while you are there". Covering and changing are kept apart.
- Report a preference as a finding, or a finding without its source and who it stops.
- Measure only the page as it first loads.
- Call the audit done with a check that did not run.
