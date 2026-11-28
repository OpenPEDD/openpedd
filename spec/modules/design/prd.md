---
title: design
description: Stage 3 · Turns the spec into screens; another implementation of the spec, with its own judge and its closing passes
owner: Kevin
version: "1.7"
updated: "2026-11-28"
status: draft
---

# Stage 3 · `design`

**Mode:** interactive · **Gate:** `design-merge`

## What it is

Where the spec becomes screens. **Design is another implementation of the spec**, and it comes
before code because fixing a mockup takes minutes and fixing code takes days. It is the stage with
the most human involvement: **it is adjusted with small prompts until it looks right**, and seeing it
reveals what was missing or could be different. That returns to the spec as deltas.

**The mockup is built in code**, on the change's design branch, with the product's real components
and the test data ([`ARCH-06`](../../foundations/architecture/branches.md)). It respects the brand
because it is made of it, and `build` starts from those screens instead of redrawing them.

**It ends ready to plug in the backend**: every state can be reached in a click, every write goes
back when it fails, and the data enters through one file.

## Inputs

| What | From |
|---|---|
| The approved flows, `FR`s, screens and copy in scope | `specify` |
| The `Test Data` | `specify` |
| The screens and components that already exist | The code, on the change branch |
| The decisions in progress: data model, states, how things are saved | `architect`, on its branch ([`ARCH-06`](../../foundations/architecture/branches.md)) |

## Context pack

The flows and `FR`s in scope · `Brand System` (tokens, components, libraries, patterns), and its
**component catalog** through its MCP ([`MKT-06`](../../foundations/market/component-catalogs.md)) ·
`Voice & Tone` · `Glossary` · `Roles & Permissions` · `Quality Standards` · the `Test Data` · the
area's `ARCH` documents as they stand on the architecture branch. Budget: **12,000 tokens**,
reference images aside.

## Procedure

1. **Walks what exists against the sources.** Runs the product locally with a test user and compares it, screen by screen, with the PRD and any reference. Gaps come back in a short table, one row per gap with its proposal, for the person to answer in a line. **Two sources that contradict each other are asked about before building.**
2. **Screen inventory.** A list of every screen the scope needs, and each state it can reach ([`RULE-32`](../../foundations/rules/interface.md#rule-32)), with what triggers it or why it does not apply. It goes in the design sub-issue.
3. **Decides the big pieces first**: the visual base of the large ones (a canvas, an editor), and, for new navigation, where each new entry leads, confirmed with the person. These are the ones that get rebuilt when decided late.
4. **Sets the seam.** Every read and every write goes through **one file**. `build` replaces that file, not the feature.
5. **Diverge, from the catalog.** Before drawing, each screen is listed as the catalog pieces it is made of: a list of records is the product's table, a confirmation is its dialog, an empty state is its own. Then two or three options for the key screens, with those pieces and the test data, on the design branch. **A piece of its own says why no piece in the catalog fits**, and enters the catalog with its story ([`RULE-33`](../../foundations/rules/interface.md#rule-33)).
6. **The person picks** the winner and adjusts it with small prompts, with the product running. Each round of adjustments is one commit.
7. **Converge.** The winner is completed in every state of the inventory, each reachable from a **development menu**, which includes a switch that makes every write fail. The menu renders only in development, and **opens every state from its URL too**, so the sweep reaches every screen in every state, role, width and theme without clicking; the change adds its screens to the product's sweep plan ([`ARCH-25`](../../foundations/architecture/screen-checks.md)). What a Walkthrough would point at gets its `data-guide`.
8. **Reads `architect`'s decisions before each round**, so a screen is not built against a model that already changed.
9. **Closing passes**, in order ([below](#closing-passes)).
10. **Record deltas.** Everything the design changes in the PRD (a step too many, a missing field, a state that was not there, copy that does not work) is a `proposal` delta with its reason. **A color change is not a delta; a change to what a `FR` says is.**
11. **Build the `Delta Report`.**
12. **Merge.** At `design-merge`, the person decides the deltas and the design branch merges into the change branch, with the base merged in first.
13. **Leaves the next step written.** The design sub-issue closes saying what is done, what is missing and what stays open, and which checks ran and which did not.

## Closing passes

Once the form is final, and in this order: each pass works on what the previous one left, and the
refactor comes late so it is not redone.

| # | Pass | What it does | Done when |
|---|---|---|---|
| 1 | **Mobile** | Each screen at the `Brand System` widths: what overflows, headers that do not fit, tables, side panels, floating controls, touch areas. Again on a pseudo-locale, for long text | No horizontal scroll, and every action can be reached |
| 2 | **Skeletons and inline states** | The loading state draws what the real screen draws: columns, header, tabs, cards. Each part that loads, saves or fails alone does so in its place ([`RULE-32`](../../foundations/rules/interface.md#rule-32)) | Measured on a slow load: **nothing moves when the data arrives**, and each inline state leaves the rest usable |
| 3 | **Writes** | **First lists every write**, then compares each with the contract in `Quality Standards` | With the switch on, every write goes back and says so |
| 4 | **Refactor** | In order: copies of something shared, the same thing written twice **anywhere in the product** (the duplicate check reads the whole code, not the change, with a copy detector), reads that skip the seam, dead code and copy keys, inline types in sample data. Extracts only what has **two real uses**, without changing behavior; each extracted piece gets its story | Nothing left on the list, and the duplicate check has nothing new |
| 5 | **Copy** | Every word on screen, in every state: each button names its action, each error says how to fix it, each empty state offers its action, the `Glossary`'s names; one whole message per key, plurals and choices in ICU MessageFormat, so it translates without touching code ([`DEC-21`](../../decisions/DEC-21-i18n-from-day-one.md)) | No message leaves the person guessing, and none is built by joining pieces |
| 6 | **Improvements** | Only the small and safe. Anything larger is a suggestion in the design sub-issue | — |

The contract for writes says when the change applies, what happens when it fails and who announces
success. A product that does not have it yet proposes it as a delta to `Quality Standards`.

**Every pass is measured, and after the refactor the whole product is compared with the base.** The
passes deliver the closing checklist, one row per screen, each cell with what the tool printed or
*not run*; the judge runs every cell again ([`ARCH-25`](../../foundations/architecture/screen-checks.md)).

## The branding change and what exists [#the-branding-change-and-what-exists]

| Skill | Runs | Does | Leaves |
|---|---|---|---|
| `/design-brand` | The branding change, before a product's first screens ([open](../../open/README.md#the-roadmap)); or to add a token, a theme or a catalog piece | Extracts the primitives from what the code and the brand already use, puts semantic roles on top, the scales and the themes, with **every pair of tokens that meets on screen tested for contrast in each theme**, and the first components, a story per state | The tokens and components in `packages/ui`; a `proposal` delta to the `Brand System` |
| `/design-audit` | On `adopt`, before the branding change, before a launch, or on request | Measures the screens that exist, in every state, width and theme, against the `Brand System`, the catalog, the interface rules and WCAG 2.2 AA; each finding as [`ARCH-14`](../../foundations/architecture/review-lenses.md#interface-findings) names it, grouped by cause | An `Audit Report` ([`ENT-08`](../../foundations/domain/report.md)): one proposed `fix` change per cause, a `Q` per fact it could not get. It fixes nothing |

## Outputs

| What | Anchored to |
|---|---|
| The screens in code, every state of the inventory, on the test data and with no backend | Its `FR`s, with `@spec` like any code |
| The seam: the one file the data goes through | Its `FR`s |
| A story for each new reusable piece: one per state, with a docblock that says **when to use it and when not**, which is what an agent reads to pick it | The piece |
| The discarded options | Screenshots, archived in the change, no anchor |
| `proposal` deltas | `changes/<CHG>/deltas/` |
| `Delta Report` | `changes/<CHG>/reports/` |

## Judge

| Agent | Checks | Passes when |
|---|---|---|
| `design-judge` | **Coverage**: every `FR` has a screen, every state of the inventory is there, the copy comes from the glossary, the brand tokens are respected, every action respects the permissions. **Nielsen** heuristics and **WCAG 2.2 AA**. **In the browser**: opens every screen and uses every menu. **Data**: no read or write skips the seam. **Failure**: with the switch on, every write goes back. **Skeletons**: each matches its screen, and nothing moves when the data arrives. **Inline states**: each part that loads, saves or fails alone leaves the rest usable. **Keyboard**: every control reached, none hidden or without focus shown, no trap. **Against the base**: every other screen that changed is explained by a delta. **Catalog**: each recurring piece is the catalog's own, no copy is new in the duplicate check, every new piece has its story, and every story passes axe in light and dark. Each finding as [`ARCH-14`](../../foundations/architecture/review-lenses.md#interface-findings) names it | All green; a check that did not run is not green ([`RULE-22`](../../foundations/rules/cycle.md#rule-22)) |

Then **`design-merge`**: the person reads the `Delta Report` and decides what enters.

## Keep in mind

- **The same test data as the tests.** If the mockup shows invented data, the test and the mockup tell different stories.
- **Copy comes from the glossary.** A new word on screen is a delta to the glossary. **How each piece is written** (buttons, links, errors, empty states, confirmations) is the copy pass's, and the words are read on the screen, not only in the file.
- **Every state is designed**, not only the one with data ([`RULE-32`](../../foundations/rules/interface.md#rule-32)): empty and error are where it fails most.
- **A new component** not in the brand system is a delta to the brand system.
- **A piece the catalog does not show does not exist for an agent.** Its story's docblock is what makes it findable; one without it is a name and props.
- **Contrast fails in the theme, not the component.** When axe flags the same colour in many stories, the token is fixed once.
- **The mockup has no backend.** It runs on the test data through the seam; wiring it is `build`'s work, on the same files.
- **If it touches the same ID as `architect`**, whichever merges second sees the conflict.
- **The product's system and conventions win** over any default of the skills: taste is the `Brand System`'s, not the agent's ([`DEC-36`](../../decisions/DEC-36-interface-quality.md)).
- **Usability over looks**: a visual choice that costs a task (contrast, a hidden label, a smaller target) loses. **Decoration earns its place**: a border, shadow, gradient or animation separates, groups, ranks or signals a state, or it goes.
- **Accessible as it is built**: every option is keyboard-operable, labelled and with contrast from its first commit; the closing passes check what was built in.
- **What pays the most**: the switch that fails every write, listing the writes before reviewing them, copying the app's patterns, reading `architect`'s decisions, and using every menu in the browser.

## Skills, agents and tools

| Kind | Name | For | Reads | Leaves |
|---|---|---|---|---|
| Skill | `/design` | The whole stage | The approved flows, `FR`s, screens and copy; the `Test Data`; the screens that exist; `architect`'s decisions | The screens in code, every state; the seam; the stories; `proposal` deltas; the `Delta Report` |
| Skill | `/design-inventory` | The screen and state inventory | The PRD in scope; the screens that exist | The screen and state inventory, in the design sub-issue |
| Skill | `/design-variants` | The options | The inventory; the component catalog; the `Test Data` | Two or three options for the key screens, on the design branch |
| Skill | `/design-complete` | Completing the winner in every state | The winner; the inventory | The winner in every state, with the development menu and its `data-guide`s |
| Skill | `/design-close` | The closing passes | The complete screens; `Brand System`; `Quality Standards` | The closing passes done; each extracted piece with its story; suggestions in the design sub-issue |
| Skill | `/design-brand` | The branding change, or one more token, theme or piece | What the code and the brand already use; `Brand System` | Tokens and components in `packages/ui`, a story per state; a `proposal` delta to the `Brand System` |
| Skill | `/design-audit` | Auditing screens that exist | The routes; `Brand System`; the catalog; the running product | The `Audit Report`: proposed `fix` changes and `Q`s |
| Agent | `design-judge` | The judge | — | — |
| MCP | `get_context_for` · `propose_delta` | The pack and the deltas | — | — |
| Tool | The product's code and components | Where the mockup is built | — | — |
| Tool | The component catalog and its MCP (Storybook, or equivalent) | Finding the piece before drawing one; its stories run as tests with axe | — | — |
| Tool | The measuring scripts, the sweep and Playwright ([`ARCH-25`](../../foundations/architecture/screen-checks.md#the-tools)) | Measuring and seeing the screens instead of judging by eye | — | — |
| Tool | Claude Design, or a design tool through an adapter | Exploring options before building them | — | — |

## Per track

| Track | What changes |
|---|---|
| `full` | Everything |
| `story` | Only if it touches a `FR` with visible impact; only the screens that change, and the closing passes over those |
| `fix` · `chore` | Does not run |

## Sources

Double Diamond · design tokens (W3C DTCG 2025.10) · Nielsen · WCAG 2.2 · GOV.UK's validation pattern · how agents design and audit interfaces, and how interface copy is written ([`MKT-20`](../../foundations/market/interface-design.md), [`MKT-22`](../../foundations/market/interface-copy.md)) · BMAD (UX expert) · Reclee Spec
(design as another implementation, with its judge) · the design of Reclee's Automations, where the
closing passes were first run end to end · Storybook MCP and Reclee's first component catalog ([`MKT-06`](../../foundations/market/component-catalogs.md)).
