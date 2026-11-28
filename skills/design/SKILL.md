---
name: design
description: Run the design stage of an OpenPEDD change. Turns the approved flows, requirements and copy into screens built in code with the product's own components, in every state each screen can reach, then closes them (mobile, skeletons, writes, refactor, copy, the whole product against the base) and leaves the deltas for design-merge. Use when a change with screens reaches design ("design CHG-043", "diseñá las pantallas", "/design"), when someone asks which design skill or reference a UI task needs, or before building any screen in a project that uses OpenPEDD. Each step is its own skill; this one keeps their order, their preconditions and what each reads.
---

<!-- Source: OpenPEDD spec design PRD v1.7, RULE-32 v1.0, RULE-33 v1.0, ARCH-14 v1.3, ARCH-25 v1.0, MKT-22 v1.0 and DEC-36 v1.0. Change those first, then this file. -->

# Design: the stage

You run the design stage of one change. **The steps are skills, run in order, each only once the one
before it delivered.** When `pedd` runs the stage it launches each step itself: then you are only the
step it launched, and you follow that step's skill (RULE-24).

## Before the first step

1. **The branch.** Work on the change's design branch: `pedd branch design CHG-nnn`. Never cut it yourself.
2. **The pack, and nothing else**: the flows, `FR`s, screens and copy in scope; the `Brand System` and its component catalog (through the Storybook MCP when it runs: list the components before you draw anything); `Voice & Tone`; the `Glossary`; `Roles & Permissions`; `Quality Standards`; the `Test Data`; the area's `ARCH` documents as they stand on the architecture branch.
3. **No `Brand System`, no screens.** A product with screens and no `Brand System` gets a branding change first: run `/design-brand`, not this stage.
4. **Read the code before deciding anything about it.** Every claim about what exists names the file that proves it (RULE-21): the component, the route, the token file.

## The steps

| # | Step | Skill | Starts when | Delivers |
|---|---|---|---|---|
| 1 | Walk what exists against the sources | This one, below | The pack is read and the product runs locally with a test user | The gap table, answered by the person in one reply |
| 2 | Inventory every screen and state | `/design-inventory` | The gaps are answered | The screen × state matrix, in the design sub-issue |
| 3–5 | Big pieces, the seam, the options | `/design-variants` | The inventory is in the sub-issue | The seam; two or three options for the key screens, on the design branch |
| 6 | The person picks and adjusts | The person, with you | The options run | The winner; one commit per round of adjustments |
| 7–8 | Complete the winner | `/design-complete` | A winner is picked | Every state of the inventory, reachable from the development menu |
| 9 | Closing passes | `/design-close` | Every state is reachable | Mobile, skeletons and inline states, writes, refactor, copy, improvements, in that order, and the whole product against the base |
| — | Judge | The `design-judge` agent, in another session | The closing passes delivered | Green, or interface findings |
| 10–13 | Deltas, `Delta Report`, merge, next step | This one, below | The judge is green | `proposal` deltas; the `Delta Report`; the sub-issue closed with what is done and what is not |

**Step 1, walking what exists.** Open each screen the scope touches and compare it, screen by
screen, with the PRD and any reference. One row per gap, with your proposal. Two sources that
contradict each other are asked about before building, in the same sheet (RULE-26).

**Steps 10 to 13.** Everything the design changed in what the PRD says (a step too many, a missing
field, a state that was not there, copy that does not work) is a `proposal` delta with its reason. A
color is not a delta; a change to what a `FR` says is. A new token, pattern or catalog piece is a
delta to the `Brand System` (RULE-33). The `Delta Report` is what the person reads at `design-merge`.

## What to read for each question

The references hold the specialized knowledge. Load only the one the question needs: each step's
skill names its own.

| The question | Read |
|---|---|
| Which states a screen can reach, and how each is designed | [references/states.md](references/states.md) |
| How a kind of screen is laid out: list, detail, form, settings, dashboard, onboarding, landing | [references/screens.md](references/screens.md) |
| Hierarchy, type, spacing, grid, color, density, surfaces, icons, motion | [references/visual.md](references/visual.md) |
| Whether it is usable: heuristics, interaction laws, forms, errors, feedback, friction | [references/usability.md](references/usability.md) |
| WCAG 2.2 AA: what to build in, and how to check it | [references/accessibility.md](references/accessibility.md) |
| Widths, reflow, long text, touch | [references/responsive.md](references/responsive.md) |
| Tokens, scales, themes, a new component and its variants | [references/tokens.md](references/tokens.md) |
| Component boundaries, data, state, forms, errors and performance in code | [references/frontend.md](references/frontend.md) |
| The words on screen: buttons, links, labels, errors, empty states, confirmations, and copy that survives translation | [references/copy.md](references/copy.md) |
| Whether something is a finding, how severe it is, and how to report it | [references/findings.md](references/findings.md) |

## Seeing and measuring

`<design skill>` below is this skill's folder: `.claude/skills/design` once installed. Run every
command from the project's root.

| Tool | Does | Run |
|---|---|---|
| [scripts/scan-styles.mjs](scripts/scan-styles.mjs) | Reads the code: values outside the tokens, inline styles, class sets repeated across files, and the census of values in use | `node <design skill>/scripts/scan-styles.mjs <dir>` |
| [scripts/scan-copy.mjs](scripts/scan-copy.mjs) | Reads the base locale's messages: generic buttons and links, errors with no way out, system words, blame, plurals with no rule, joined strings, mixed capitalization, names the `Glossary` retired | `node <design skill>/scripts/scan-copy.mjs packages/i18n --glossary <spec>/foundations/glossary.md` |
| The copy detector | Blocks of code copied across files | `npx jscpd@5.4.3 --min-tokens 50 --reporters console <dirs>` |
| [scripts/page-check.js](scripts/page-check.js) | Measures the rendered page: overflow, clipping, targets under 24 px, unnamed controls, unlabelled fields, contrast, headings, and every layout shift with what moved | Evaluated in the page, by the sweep or by the browser below |
| [scripts/sweep.mjs](scripts/sweep.mjs) | **Opens every screen in every state, role, width and theme** through the development menu's URL contract: a screenshot, `page-check` and axe at each; a slow load per width for what moves; a keyboard walk; the plan's actions (hover, open, fill, a write failing) with what each must show; and, with `--baseline`, every screenshot against the base's. Writes `results.json` and the measured columns of the closing checklist | `node <design skill>/scripts/sweep.mjs apps/app/design-sweep.json [--only <screens>] [--baseline <dir>]` |
| The Playwright CLI and its skill | **Looking and acting by hand**: hover, open a menu, walk the keyboard, fill a form, make a write fail, take a screenshot. It ships with Playwright 1.59 and later, and costs fewer tokens than its MCP | `npx playwright cli install --skills` once; then `npx playwright cli open <url>`, `snapshot`, `press Tab`, `screenshot` |

**Setup, once per project**: `npm i -D playwright @axe-core/playwright && npx playwright install
chromium`. Without a browser, every check that needs one is reported as not run (RULE-22).

**Look at what you built.** Read the sweep's screenshots, not only its numbers: the squint test, the
same pattern side by side, what a person sees first. The numbers say what broke; the screenshots say
whether it reads right. `/design-close` delivers both as **the closing checklist**, one row per
screen, each cell with its evidence; the judge runs it again.

## The principles

They hold in every step. When two pull apart, the one higher in the table wins.

| Principle | When deciding, it means | Source |
|---|---|---|
| The project's stack and conventions win | `Architecture Rules` and the patterns already in the code win over any reference here | RULE-21 |
| Every state it can reach | A screen is not done in its ideal state: empty, partial, error and no permission are designed too | RULE-32 |
| Made of the product's system | Search the catalog and the code before drawing a piece. A value outside the tokens or a piece outside the catalog enters as a delta that says why none fits | RULE-33 |
| Usability over looks | When a visual choice costs a task (less contrast, a hidden label, a smaller target, a gesture with no alternative), the task wins | WCAG 2.2, Nielsen |
| Accessible as it is built | Each option is built keyboard-operable, labelled and with contrast from the start. The closing passes check it; they do not retrofit it | [accessibility.md](references/accessibility.md) |
| Decoration earns its place | A border, shadow, gradient, icon or animation separates, groups, ranks or signals a state. One that does none of these goes | [visual.md](references/visual.md) |
| One abstraction per two real uses | A piece is extracted only when it has two real uses, never in advance | Closing pass 4 |

## Never

- Write the spec. Every change to it is a `proposal` delta (RULE-10).
- Design only the screen with data, or judge a screen by its screenshot alone.
- Invent data. The mockup runs on the `Test Data`, through the seam.
- Review your own output as the judge. `design-judge` runs in another session (RULE-12).
- Act on an improvement nobody asked for: list it at the end of your report (RULE-25).
