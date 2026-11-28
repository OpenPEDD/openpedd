---
name: design-complete
description: Complete the chosen design in every state of the inventory, each one reachable in a click from a development menu that also makes every write fail and slows the network. Steps 7 and 8 of OpenPEDD's design stage. Use once the person picked the winning option, or when someone asks to "add the empty and error states", "completá los estados", "make every state reachable", or to design what happens with no data, partial data, a failed request or no permission.
---

<!-- Source: OpenPEDD spec design PRD v1.7 (steps 7 and 8), RULE-32 v1.0, ARCH-25 v1.0 and DEC-36 v1.0. Change those first, then this file. -->

# Design complete: every state, in a click

You take the winner and make **every state of the inventory real and reachable**, so that the judge,
the person and `build` can open each one without inventing data.

## Before building

1. **The winner** is picked and its last round committed.
2. **Read `architect`'s decisions** as they stand on the architecture branch: a state built on a model that already changed is rebuilt.
3. **Read now, in full:** [../design/references/states.md](../design/references/states.md), and *Each piece* in [../design/references/copy.md](../design/references/copy.md): every empty, error, success and confirmation of the inventory has words, and most screens fail there. Before the error and success states, read *Loading, errors and writes* in [../design/references/frontend.md](../design/references/frontend.md).

## Steps

1. **The development menu.** One menu, rendered only in development, with: a state selector per screen of the inventory; a switch that makes **every write fail**; a slow network. A state is reached through the seam (the seam returns empty, partial, an error or a delay), never by a flag inside the screen.
2. **Its URL contract**, so a script reaches every state without clicking. In development only, the menu also reads these parameters, and once the state is on screen it sets `<html data-pedd-state="<state>">`:

   | Parameter | Does |
   |---|---|
   | `pedd-state=<state>` | The seam returns that state of the inventory |
   | `pedd-role=<role>` | Signs in as that role's test user |
   | `pedd-theme=light\|dark` | Forces the theme |
   | `pedd-delay=<ms>` | Every read waits that long: the slow network |
   | `pedd-fail-writes=1` | Every write fails |

3. **The sweep plan.** The product keeps one, `design-sweep.json` at the root of its app (`apps/app/`), with **every screen it has**: that is what a change is compared against. Add or update the change's screens from the inventory: the route, the `✓` states, the roles that reach it, and **one action per inline state and per write** of the inventory, each with what it must show. `/design-close` and the judge run [../design/scripts/sweep.mjs](../design/scripts/sweep.mjs) on it:

   ```json
   { "baseUrl": "http://localhost:3000", "widths": [320, 375, 768, 1024, 1280, 1440], "themes": ["light", "dark"],
     "out": "spec/changes/CHG-nnn/evidence/design", "delay": 1500,
     "screens": [{ "name": "Invoices list", "route": "/invoices", "states": ["loading", "empty", "populated", "error"],
       "roles": ["admin", "seller"], "keyboard": true,
       "actions": [
         { "name": "row menu", "state": "populated", "steps": [{ "click": "[data-guide=row-menu]" }], "expect": "[role=menu]" },
         { "name": "send fails", "state": "populated", "params": { "fail-writes": 1 },
           "steps": [{ "click": "[data-guide=send]" }], "expect": "[data-guide=send-error]" }] }] }
   ```

   Steps are `click`, `hover`, `focus`, `fill` (`[selector, text]`), `press`, `wait` (ms) and `waitFor`. Select by the `data-guide` the Walkthroughs use, or by role.
4. **Each state, row by row of the inventory**, as `states.md` designs it, with the catalog's own pieces (its empty state, its error, its skeleton). Order: the main flow's states first, then the exception flows'.
5. **Each write** shows `busy`, refuses a double submit, and on failure goes back and says so, next to the action, keeping the input.
6. **Each role** that reaches the screen: switch to it (a test user per role) and check every `no-permission` cell.
7. **The guides.** What a Walkthrough would point at gets its `data-guide`.
8. **Tick the matrix**: each `✓` of the inventory opens from the menu and from its URL. Run, from the project's root, `node <design skill>/scripts/sweep.mjs apps/app/design-sweep.json --only "<the change's screens>" --widths 1280 --themes light --no-shots`: every state must read *confirmed*, and every action pass. A state that cannot be opened is not done.

## Done when

Every `✓` in the inventory opens from the menu and its URL on the `Test Data`, and the sweep confirms
each one; with the switch on, every write goes back and says so; every role sees what its permissions
say.

## Never

- Reach a state by editing the screen's code or the data by hand: through the seam only.
- Leave the menu, its switch or its URL parameters reachable outside development.
- Show success before the write landed.
