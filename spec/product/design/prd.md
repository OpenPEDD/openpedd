---
title: design
description: Stage 3 · Turns the spec into screens; another implementation of the spec, with its own judge
owner: Kevin
version: "1.0"
updated: "2026-11-04"
status: draft
---

# Stage 3 · `design`

**Mode:** interactive · **Gate:** `design-merge`

## What it is

Where the spec becomes screens. **Design is another implementation of the spec**, and it comes
before code because fixing a mockup takes minutes and fixing code takes days. It is the stage with
the most human involvement: **it is adjusted with small prompts until it looks right**, and seeing it
reveals what was missing or could be different. That returns to the spec as deltas.

## Inputs

| What | From |
|---|---|
| The approved flows, `FR`s, screens and copy in scope | `specify` |
| The `Test Data` | `specify` |
| The screens that already exist in the area | The repo, or earlier mockups |

## Context pack

The flows and `FR`s in scope · `Brand System` (tokens, components, libraries) · `Voice & Tone` ·
`Glossary` · `Roles & Permissions` · the `Test Data`. Budget: **12,000 tokens**, reference images
aside.

## Procedure

1. **Screen inventory.** A list of every screen and state the scope needs: screen × empty, loading, error, no permission, no quota, with data.
2. **Diverge.** Two or three options for the key screens, on the brand system, with the test data.
3. **The person picks** the winner and adjusts it with small prompts.
4. **Converge.** The winner is completed in every state of the inventory.
5. **Record deltas.** Everything the design changes in the PRD (a step too many, a missing field, a state that was not there, copy that does not work) is a `proposal` delta with its reason. **A color change is not a delta; a change to what a `FR` says is.**
6. **Build the `Delta Report`.**

## Outputs

| What | Anchored to |
|---|---|
| One mockup per screen and state, the winner | Its `FR`s |
| The discarded options | Archived in the change, no anchor |
| `proposal` deltas | `changes/<CHG>/deltas/` |
| `Delta Report` | `changes/<CHG>/reports/` |

## Judge

| Agent | Checks | Passes when |
|---|---|---|
| `design-judge` | **Coverage**: every `FR` has a screen, every state of the inventory is there, the copy comes from the glossary, the brand tokens are respected, every action respects the permissions. **Nielsen** heuristics and **WCAG 2.2 AA** | All green |

Then **`design-merge`**: the person reads the `Delta Report` and decides what enters.

## Keep in mind

- **The same test data as the tests.** If the mockup shows invented data, the test and the mockup tell different stories.
- **Copy comes from the glossary.** A new word on screen is a delta to the glossary.
- **Every state is designed**, not only the one with data: empty and error are where it fails most.
- **A new component** not in the brand system is a delta to the brand system.
- **If it touches the same ID as `architect`**, whichever merges second sees the conflict.

## Skills, agents and tools

| Kind | Name | For |
|---|---|---|
| Skill | `/design` | The whole stage |
| Skill | `/design-inventory` | The screen and state inventory |
| Skill | `/design-variants` | The options |
| Skill | `/design-complete` | Completing the winner in every state |
| Agent | `design-judge` | The judge |
| MCP | `get_context_for` · `propose_delta` | The pack and the deltas |
| Tool | Claude Design, HTML, or a design tool through an adapter | Where it is drawn |

## Per track

| Track | What changes |
|---|---|
| `full` | Everything |
| `story` | Only if it touches a `FR` with visible impact; only the screens that change |
| `fix` · `chore` | Does not run |

## Sources

Double Diamond · design tokens (W3C DTCG) · Nielsen · WCAG 2.2 · BMAD (UX expert) · Reclee Spec
(design as another implementation, with its judge).
