# Screen states: how each one is designed

Which states exist, and when each applies, is in RULE-32. This file says **how to design each one**,
for each kind of screen. A state that does not apply is written `n/a`, with the reason, in the
inventory. A state that applies and was not designed is a gap.

## Each state

| State | Design it so that | Fails when |
|---|---|---|
| `initial` | The first action is the most visible thing on the screen, and one line says what will appear here | The area is blank, or it shows "No results" before anything was asked |
| `loading` | It is the **skeleton of the final layout**: the same header, columns, tabs and cards, with what is already known drawn for real (titles, column names, filters). Under a second nothing shows; a whole page that takes longer shows its skeleton; past ten seconds, a progress bar with an estimate and a way to leave (NN/g). A spinner goes only inside the control that waits | A spinner in the middle of a blank page; the layout jumps when the data arrives |
| `empty`, first use | It says what this place is for, and offers the one action that fills it. A sample or an import goes next to that action when the product has them. It uses the catalog's empty piece | "No data"; the same text as an empty search |
| `empty`, no results | It names the query or filter that returned nothing, keeps the filters visible, and offers to clear them | It reads like first use, so the person thinks their data is gone |
| `partial` | It shows what arrived. A missing field says so plainly ("No description yet"), with no invented default (a `0`, a year `1970`). One section that failed shows its error in its own place while the rest renders. A long list shows its total and paginates | One widget's failure takes the page down; a missing value reads as a real zero |
| `populated` | It is designed at three volumes from the `Test Data`: one item, a typical count, and the maximum, with the longest name and a pseudo-locale | Only the typical case was ever looked at |
| `error`, on a read | It says what failed in plain words, keeps the layout, and offers a retry. It tells apart "not found", "no access" and "could not load" | An error reads as empty (an ARCH-14 lens item) |
| `error`, on a write | The value goes back, the message appears next to the action, and what the person typed stays | The input is lost, or the screen shows success first |
| `success` | It appears only once the write landed, next to where the person is looking. A toast only when the result lands somewhere else; a new screen when the person should go there | Success before the server confirmed it |
| `busy` | The control that writes shows it is pending and refuses a second submit; the rest of the screen stays usable | A double charge; a frozen page |
| `disabled` | A short hint next to the control says why, and what enables it. A tooltip alone does not reach touch or keyboard on a disabled button | A greyed button with no reason |
| `no-permission` | An action the role never has is not shown. One the role could get is shown disabled, with who grants it. A whole screen says who can give access. It follows `Roles & Permissions` cell by cell | A raw 403; a button that fails only after the click |
| `no-quota` | It states the limit, the use so far, and the way to get more | A generic error at the moment of saving |
| `offline` | A banner says the connection dropped. Writes fail visibly or wait in a queue that says so. Reads show they may be stale | A spinner that never ends |

## Inline states

The states of a part of the screen, while the rest stays as it is. **The rest of the screen never
blocks for a part**: no full-page spinner, no overlay, for something one row or one field does.

| Where | Design it so that | Fails when |
|---|---|---|
| A button that writes | It keeps its width, shows it is pending inside itself, and refuses a second press; the label says what happens ("Saving…") | The button shrinks to a spinner and the row jumps; a second press sends twice |
| Editing in place (a cell, a title, a toggle) | `saving` next to the value, then `saved` for a moment, or on failure the old value back with the reason next to it and a retry | The new value stays on screen although it never saved |
| A setting that saves alone | A quiet "Saved" next to it once the write landed; the error next to it, not in a toast far away | A toast for every toggle; silence when it failed |
| A row or card acted on (sent, archived) | That row alone shows `busy`, then its new state; on failure it returns with the reason | The whole list reloads and the person loses their place |
| A section with no data inside a screen with data | Its own short empty line, with its action, in its own place | The section disappears, and the layout with it |
| A section that loads later (a chart, a count) | Its own skeleton of its own size; the rest is usable meanwhile | The page waits for its slowest part |
| A section that failed | Its own error with a retry, in its own place; the rest keeps working | One failed widget takes the page down |
| A field being checked by the server (a name taken) | A small pending mark in the field, then the result next to it | The form freezes while it checks |

Each inline state keeps the space it will need: what arrives later fills a place already held, so
nothing below it moves ([scripts/page-check.js](../scripts/page-check.js) reports every element that
moved).

## Each control

Each interactive piece of the catalog has a story per state (design PRD), and its tokens:
`default`, `hover`, `focus-visible`, `active`, `selected`, `disabled`, `invalid`, `read-only`,
`busy`.

| Rule | Why |
|---|---|
| Focus is visible on every control, with a 3:1 contrast against what surrounds it, and is not hidden under a sticky header or footer | WCAG 1.4.11, 2.4.7, 2.4.11 |
| Hover never carries information that only hover shows | Touch has no hover |
| `selected` and `invalid` do not rely on color alone: they add an icon, a weight or a text | WCAG 1.4.1 |

## Validation

The default is GOV.UK's: **validate on submit**, always again on the server, and keep every value.
The `Brand System`'s form pattern may add a check on leaving a field; the product uses one way, not
both.

| When | What happens |
|---|---|
| While typing | Nothing. An error before the person finished scolds them for something they were about to fix |
| On leaving a field | Only if the form pattern says so, and only for a check about that field alone: a format, a name already taken |
| Once a field showed an error | It is checked again on each change, so the error goes as soon as it is fixed |
| On submit | Everything is checked. With errors, a summary at the top of the page lists each one as a link to its field and takes the focus, and each field shows its own message too. The page title starts with "Error:" |
| The server rejects it | Its error goes to the field it belongs to; one that belongs to no field goes to the summary |

Each message sits next to its field, is linked to it (`aria-describedby`), and says how to fix it:
"Enter a date like 31/12/2026", not "Invalid date". What the person typed is never cleared.

## Which states each kind of screen usually reaches

A starting point for the inventory, not a substitute for it: the PRD's flows decide.

| Kind | `initial` | `loading` | `empty` first use | `empty` no results | `partial` | `error` | `success` | `no-permission` | `no-quota` | `offline` |
|---|---|---|---|---|---|---|---|---|---|---|
| List or table | — | ✓ | ✓ | ✓ with filters | ✓ | ✓ | ✓ after a bulk action | ✓ | if plans limit it | if it writes |
| Detail of a record | — | ✓ | — | — | ✓ | ✓ including not found | ✓ after editing | ✓ | — | if it writes |
| Form | ✓ | ✓ when editing | — | — | — | ✓ per field and on submit | ✓ | ✓ | if plans limit it | ✓ |
| Dashboard | — | ✓ per card | ✓ new account | ✓ with a range | ✓ | ✓ per card | — | ✓ per card | — | — |
| Search | ✓ | ✓ | — | ✓ | — | ✓ | — | — | — | — |
| Settings | — | ✓ | — | — | ✓ | ✓ | ✓ per save | ✓ per section | ✓ | ✓ |
| Upload or import | ✓ | ✓ with progress | — | — | ✓ some rows failed | ✓ | ✓ with counts | ✓ | ✓ | ✓ |
| Onboarding | ✓ | — | — | — | ✓ resumed halfway | ✓ | ✓ the first value | — | — | — |

## How a state is reached

Every state of the inventory opens from the **development menu**, on the `Test Data`, in a click: a
state selector per screen, a switch that makes every write fail, and a slow network. The menu renders
only in development (design PRD, step 7).
