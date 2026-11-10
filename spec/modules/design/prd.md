---
title: design
description: Stage 3 · Turns the spec into screens; another implementation of the spec, with its own judge and its closing passes
owner: Kevin
version: "1.2"
updated: "2026-11-10"
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

The flows and `FR`s in scope · `Brand System` (tokens, components, libraries, patterns) ·
`Voice & Tone` · `Glossary` · `Roles & Permissions` · `Quality Standards` · the `Test Data` · the
area's `ARCH` documents as they stand on the architecture branch. Budget: **12,000 tokens**,
reference images aside.

## Procedure

1. **Walks what exists against the sources.** Runs the product locally with a test user and compares it, screen by screen, with the PRD and any reference. Gaps come back in a short table, one row per gap with its proposal, for the person to answer in a line. **Two sources that contradict each other are asked about before building.**
2. **Screen inventory.** A list of every screen and state the scope needs: screen × empty, loading, error, no permission, no quota, with data. It goes in the design sub-issue.
3. **Decides the big pieces first**: the visual base of the large ones (a canvas, an editor), and, for new navigation, where each new entry leads, confirmed with the person. These are the ones that get rebuilt when decided late.
4. **Sets the seam.** Every read and every write goes through **one file**. `build` replaces that file, not the feature.
5. **Diverge.** Two or three options for the key screens, with the real components and the test data, on the design branch. Each piece follows the app's pattern from the `Brand System`; a piece of its own is justified.
6. **The person picks** the winner and adjusts it with small prompts, with the product running. Each round of adjustments is one commit.
7. **Converge.** The winner is completed in every state of the inventory, each reachable from a **development menu**, which includes a switch that makes every write fail. The menu renders only in development.
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
| 1 | **Mobile** | Each screen at the `Brand System` widths: what overflows, headers that do not fit, tables, side panels, floating controls, touch areas | No horizontal scroll, and every action can be reached |
| 2 | **Skeletons** | The loading state draws what the real screen draws: columns, header, tabs, cards | Each skeleton matches the final layout |
| 3 | **Writes** | **First lists every write**, then compares each with the contract in `Quality Standards` | With the switch on, every write goes back and says so |
| 4 | **Refactor** | In order: copies of something shared, the same thing written twice in the feature, reads that skip the seam, dead code and copy keys, inline types in sample data. Extracts only what has **two real uses**, without changing behavior | Nothing left on the list |
| 5 | **Improvements** | Only the small and safe. Anything larger is a suggestion in the design sub-issue | — |

The contract for writes says when the change applies, what happens when it fails and who announces
success. A product that does not have it yet proposes it as a delta to `Quality Standards`.

## Outputs

| What | Anchored to |
|---|---|
| The screens in code, every state of the inventory, on the test data and with no backend | Its `FR`s, with `@spec` like any code |
| The seam: the one file the data goes through | Its `FR`s |
| The discarded options | Screenshots, archived in the change, no anchor |
| `proposal` deltas | `changes/<CHG>/deltas/` |
| `Delta Report` | `changes/<CHG>/reports/` |

## Judge

| Agent | Checks | Passes when |
|---|---|---|
| `design-judge` | **Coverage**: every `FR` has a screen, every state of the inventory is there, the copy comes from the glossary, the brand tokens are respected, every action respects the permissions. **Nielsen** heuristics and **WCAG 2.2 AA**. **In the browser**: opens every screen and uses every menu. **Data**: no read or write skips the seam. **Failure**: with the switch on, every write goes back. **Skeletons**: each matches its screen | All green |

Then **`design-merge`**: the person reads the `Delta Report` and decides what enters.

## Keep in mind

- **The same test data as the tests.** If the mockup shows invented data, the test and the mockup tell different stories.
- **Copy comes from the glossary.** A new word on screen is a delta to the glossary.
- **Every state is designed**, not only the one with data: empty and error are where it fails most.
- **A new component** not in the brand system is a delta to the brand system.
- **The mockup has no backend.** It runs on the test data through the seam; wiring it is `build`'s work, on the same files.
- **If it touches the same ID as `architect`**, whichever merges second sees the conflict.
- **What pays the most**: the switch that fails every write, listing the writes before reviewing them, copying the app's patterns, reading `architect`'s decisions, and using every menu in the browser.

## Skills, agents and tools

| Kind | Name | For |
|---|---|---|
| Skill | `/design` | The whole stage |
| Skill | `/design-inventory` | The screen and state inventory |
| Skill | `/design-variants` | The options |
| Skill | `/design-complete` | Completing the winner in every state |
| Skill | `/design-close` | The closing passes |
| Agent | `design-judge` | The judge |
| MCP | `get_context_for` · `propose_delta` | The pack and the deltas |
| Tool | The product's code and components | Where the mockup is built |
| Tool | Claude Design, or a design tool through an adapter | Exploring options before building them |

## Per track

| Track | What changes |
|---|---|
| `full` | Everything |
| `story` | Only if it touches a `FR` with visible impact; only the screens that change, and the closing passes over those |
| `fix` · `chore` | Does not run |

## Sources

Double Diamond · design tokens (W3C DTCG) · Nielsen · WCAG 2.2 · BMAD (UX expert) · Reclee Spec
(design as another implementation, with its judge) · the design of Reclee's Automations, where the
closing passes were first run end to end.
