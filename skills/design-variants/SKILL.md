---
name: design-variants
description: Decide the big pieces, set the seam, and build two or three options for a change's key screens in code, from the product's own catalog, tokens and test data. Steps 3 to 5 of OpenPEDD's design stage. Use once the screen and state inventory exists, when someone asks for "options", "variantes", "diseñá esta pantalla", "a new screen for this requirement", or to turn a requirement into a layout. Reuses existing patterns before creating any; builds accessible from the start.
---

<!-- Source: OpenPEDD spec design PRD v1.7 (steps 3 to 5), RULE-32 v1.0, RULE-33 v1.0, MKT-22 v1.0 and DEC-36 v1.0. Change those first, then this file. -->

# Design variants: options from the catalog

You turn the inventory into two or three options for the key screens, **built in code with the
product's real pieces**, on the design branch. The person picks one next.

## Before building

1. **The inventory** is in the design sub-issue. Without it, stop: run `/design-inventory`.
2. **The system.** List the catalog's components (Storybook MCP: list them, then read the docblock of each you may use), the tokens, and the `Brand System`'s patterns. Find the screens in the product most like the ones in scope, and read their code.
3. **Read now, in full:** [../design/references/screens.md](../design/references/screens.md) and [../design/references/visual.md](../design/references/visual.md). Read [../design/references/frontend.md](../design/references/frontend.md) before writing the first component, [../design/references/accessibility.md](../design/references/accessibility.md) (*Build it in*) before the first interactive one, and [../design/references/copy.md](../design/references/copy.md) before writing the first string that the PRD does not already give.

## Steps

1. **The big pieces first.** A canvas, an editor, a new navigation entry: decide its visual base, and for navigation where each new entry leads, with the person, before the rest. They are what gets rebuilt when decided late.
2. **The seam.** One file per feature through which every read and every write goes, returning the `Test Data`. Every screen reads from it; none fetches on its own.
3. **The pieces, in words.** For each key screen, write the catalog pieces it is made of, top to bottom, with the job line and ranking of `screens.md`. A piece the catalog lacks says why none fits: it becomes a delta to the `Brand System` (RULE-33).
4. **Two or three options** that differ in what matters (structure, density, where the primary action lives), not in color. Each one:
   - is made of catalog pieces and tokens: no raw value, no arbitrary class;
   - runs on the `Test Data` through the seam;
   - is keyboard-operable, labelled and with contrast from the first commit;
   - follows the product's existing pattern wherever one exists.
5. **Say what each option trades**, in two lines: what it makes easier, and for whom; what it costs.
6. **Check before showing.** Run [../design/scripts/scan-styles.mjs](../design/scripts/scan-styles.mjs) over the files you touched: any raw color or arbitrary value is fixed or explained. Open each option at the narrowest and widest width.

## Hand to the person

The options running, each with its two lines and its route, and the question: *"Which one, and what
would you change?"* Each round of adjustments that follows is one commit.

## Never

- Bring an aesthetic of your own. The look is the `Brand System`'s; when the system is silent, its existing screens decide.
- Overwrite or add next to the project's tokens or theme. A new token is a delta.
- Build a copy of a piece that exists, even "to adjust it a little": extend it, or propose the change.
- Differ the options only in decoration.
