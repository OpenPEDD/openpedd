---
name: design-close
description: Run the closing passes of OpenPEDD's design stage, in order, on screens that are complete in every state - mobile and long text, skeletons and inline states, writes, refactor, copy, small improvements, and the whole product against the base - then hand them to design-judge. Use once every state is reachable from the development menu, or when someone asks to "close the design", "pasada mobile", "revisá responsive y accesibilidad", "visual QA", "revisá los textos", "regresión visual", or to check a change's screens before review. Measures with scripts instead of judging by eye.
---

<!-- Source: OpenPEDD spec design PRD v1.7 (closing passes), RULE-32 v1.0, RULE-33 v1.0, ARCH-14 v1.3, ARCH-25 v1.0, MKT-22 v1.0 and DEC-36 v1.0. Change those first, then this file. -->

# Design close: the closing passes

**In this order**: each pass works on what the previous one left, the refactor comes late so it is
not redone, and the copy is read last, on screens that no longer move. A pass is done when its *Done when* holds, measured, not when it looks right.

## Before the first pass

Every `✓` of the inventory opens from the development menu and its URL, and the change's screens
are in the product's `design-sweep.json`, with their actions. If not, stop: run `/design-complete`. Playwright is
installed in the project (*Seeing and measuring* in [the design skill](../design/SKILL.md)); without
it, every check that needs a browser is reported as not run (RULE-22).

**First, the sweep** over the change's screens:
`node <design skill>/scripts/sweep.mjs apps/app/design-sweep.json --only "<the change's screens>"`.
It measures every state, role, width and theme, walks the keyboard, and runs every action of the plan;
run it again after each pass that changes the screens. **Then look at its screenshots**, pass by pass.
What no action covers yet, you open by hand with the Playwright CLI, and then add as an action.

## The passes

| # | Pass | Read before it | Do | Done when |
|---|---|---|---|---|
| 1 | **Mobile and long text** | [responsive.md](../design/references/responsive.md) | The sweep's columns for overflow, clipping and targets, and its screenshots at the narrow widths; then the pseudo-locale, and the menus and panels opened by hand, with [page-check.js](../design/scripts/page-check.js) evaluated in each. Fix what overflows, clips with no way to read the rest, or is under 24 px. Check headers, tables, side panels, floating controls | No horizontal scroll, every action reachable, `page-check` shows no overflow and no unreachable clipping, in every state |
| 2 | **Skeletons and inline states** | *loading* and *Inline states* in [states.md](../design/references/states.md) | The sweep's slow load per width: its layout-shift column lists every element that moved when the data arrived. Each inline state is an action of the plan (a button writing, a field saving, a section failing alone), with its screenshot | Each skeleton draws the final layout, and **no element moves when the data arrives** (`layoutShift.moved` empty); every inline state keeps its space and leaves the rest usable |
| 3 | **Writes** | *Loading, errors and writes* in [frontend.md](../design/references/frontend.md) | **First list every write** of the change. Then compare each with the write contract in `Quality Standards`; each is an action of the plan with `fail-writes`, expecting its error next to the action. A product without the contract proposes it as a delta | With the switch on, every write goes back and says so: every write action passes |
| 4 | **Refactor** | *A component* in [tokens.md](../design/references/tokens.md) | In order: copies of something shared; the same thing written twice **anywhere in the product** (run [scan-styles.mjs](../design/scripts/scan-styles.mjs) and the copy detector, `npx jscpd@5.4.3 --min-tokens 50 --reporters console <dirs>`, over the whole app and `packages/ui`, not only the change); reads that skip the seam; dead code and copy keys; inline types in sample data. Extract only what has two real uses, without changing behaviour; each extracted piece gets its story with its docblock | Nothing left on the list; `scan-styles` shows no raw color or arbitrary value the change added and no new repeated class set; the copy detector shows no clone that involves a file of the change |
| 5 | **Copy** | [copy.md](../design/references/copy.md) | Run [scan-copy.mjs](../design/scripts/scan-copy.mjs) over the base locale with the `Glossary`, read each hit in context, then read every state's words in the sweep's screenshots: each error says how to fix it, each button names its action, each empty state offers its action | No hit left without a reason; every message one whole key, plurals with ICU |
| 6 | **Improvements** | — | Only the small and safe. Anything larger is a suggestion in the design sub-issue | — |

Between passes 1 and 4, also run the **accessibility checks** of
[accessibility.md](../design/references/accessibility.md) (*Check it*) on each screen in each state:
axe in light and dark, and the keyboard walk (what Tab cannot reach, focus hidden or without an
indicator, traps, jumps back), come from the sweep; dialogs and Escape, zoom to 200 % and the text
spacing, by hand with the Playwright CLI.

**After pass 4, the whole product against the base.** The refactor and any token change reach screens
outside the change. Take the base's screenshots, then the change's, and compare them:

1. `git worktree add ../base-<CHG> <base>`, install it, and run it on another port.
2. `node <design skill>/scripts/sweep.mjs apps/app/design-sweep.json --shots-only --base-url http://localhost:<port> --out ../base-<CHG>/shots`
3. `node <design skill>/scripts/sweep.mjs apps/app/design-sweep.json --shots-only --baseline ../base-<CHG>/shots`

Each screenshot that changed, outside the change's screens, is either meant (a token delta that says
so) or a regression to fix. Look at each `.diff.png`: red is what changed. Compare only screenshots
taken on the same machine. What fails is fixed in
the pass it belongs to: a target in pass 1, a contrast in the token (pass 4).

## The closing checklist

What you deliver is this table, one row per screen of the inventory, in the design sub-issue. **Each
cell holds its evidence**: the number the tool printed, or *not run* and why. The sweep's
`checklist.md` fills the measured columns, keyboard and actions included; you add the system and
copies from `scan-styles` and the copy detector, and what changed against the base. A cell with a tick and
no evidence is not done; the judge runs every one again.

```markdown
| Screen | States opened | System (`scan-styles`) | Copies (jscpd) | Layout shift | Inline states | Widths (`page-check`) | axe light · dark | Keyboard | Writes fail back | Copy (`scan-copy`) | Against the base |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Invoices list | 11 of 11 | 0 raw · 0 arbitrary | 0 clones | 0 moved | 4 of 4 actions | 6 widths: 0 overflow · 0 clipped · 0 small | 0 · 0 | 14 of 14 · 0 hidden · 0 traps | 3 of 3 actions | 1 hit: "Submit" on the import form, kept: it submits | 2 other screens changed: the new border token, meant |
| Invoice detail | 7 of 8: offline not run, no throttling in this browser | … |
```

Then write each pass with its result, and what you would improve (RULE-25). The `design-judge` agent
reviews it, in another session.

## Never

- Judge a pass by a screenshot alone: measure it.
- Fix a contrast in one component when the token is what fails: fix the token, once.
- Extract an abstraction with one use, or change behaviour while refactoring.
- Report a check as passed when it did not run.
