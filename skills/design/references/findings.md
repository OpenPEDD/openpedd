# Interface findings: what counts, how severe, how reported

What an interface finding names is defined in ARCH-14 (*An interface finding*). This file is how to
find one, weigh it and write it.

## What counts

| It names | For example |
|---|---|
| **Where**: the screen, the state, the width and theme, and the element (a selector, or `file:line`) | Invoices list · empty, no results · 375 px · dark · `InvoiceTable` header |
| **The source it breaks**: a token or catalog piece of the `Brand System`, a rule of the spec (RULE-32, RULE-33), a criterion of WCAG 2.2, a heuristic, or a pattern the product already uses elsewhere | WCAG 1.4.3: `text-muted` on `surface` is 2.9:1 |
| **Who it stops, from doing what** | A person on a phone cannot reach "Pay" |

| Case | Is |
|---|---|
| All three named, measured on the screen or read in the code | A finding, with its severity |
| A preference with no source broken ("it could feel more modern") | Not a finding. At most an improvement at the end of the report (RULE-25) |
| What decides it is outside the product (real content length, how often a flow is used) | A `Q` with the fact that is missing, and no severity |
| A brief or an approved design asked for it | Not a finding, even when a default here says otherwise |

## Severity

From Nielsen's 0 to 4 scale, judged on how often it happens, how hard it hits, and whether it keeps
happening, mapped onto the review's `high`, `medium` and `low` (ARCH-13).

| Severity | Nielsen | When |
|---|---|---|
| `high` | 4 catastrophe · 3 major | Someone cannot finish a task, or loses data or money: an action unreachable at a width or by keyboard, a WCAG A or AA failure on a path the flow needs, an error that reads as empty, success shown before the write landed, a state missing on the main flow |
| `medium` | 2 minor | The task is finished with friction or doubt: two patterns for the same thing, a value outside the tokens a person can see, a missing state off the main flow, a label in the team's words |
| `low` | 1 cosmetic | Seen only side by side: spacing one step off the scale, an icon from another set |
| — | 0 | Not a problem: not reported |

**One finding per cause.** A token that fails contrast in forty places is one finding on the token,
listing where it shows. A copied component in six files is one finding with six places.

## How each kind is found

| Kind | Found by |
|---|---|
| Spacing, type and colors outside the system | [scripts/scan-styles.mjs](../scripts/scan-styles.mjs) in the code; the census of [scripts/page-check.js](../scripts/page-check.js) on the rendered page |
| Pieces that look alike and are built apart; component debt | The repeated class sets of `scan-styles`; the clones of the copy detector (`npx jscpd@5.4.3 --min-tokens 50`); components with the same role and different names (`Modal` and `Dialog`) |
| Skeletons that do not match; layout that jumps | `layoutShift` of `page-check`, run after the data arrives on a slow load |
| Inline states missing or blocking | Each inline state of [states.md](states.md) triggered: a write, an edit in place, a section failing alone |
| Inconsistency between screens | Screenshots of the same pattern on each screen, side by side ([screens.md](screens.md)) |
| Alignment, grid, hierarchy | The screenshot with a grid overlay; the squint test ([visual.md](visual.md)) |
| Overflow, clipping, responsive | `page-check` at each width, in each state, with the pseudo-locale |
| Contrast | `page-check` and axe, per theme; by hand over images and gradients |
| Missing states | The inventory against the development menu: a state that cannot be opened is missing |
| Accessibility | axe, the keyboard walk, and [accessibility.md](accessibility.md) |
| Copy that leaves a person guessing: vague errors, generic buttons, retired names, joined strings | [scripts/scan-copy.mjs](../scripts/scan-copy.mjs), then each state's words read in its screenshot against [copy.md](copy.md) |
| Inconsistent interaction | The same action done on each screen: where it is, what it says, how it confirms |

Every state is opened before it is measured: hover, focus, open menus, dialogs and narrow widths
included. A check of the page as it first loads misses them.

## How a finding is written

```markdown
### <What is wrong, as a sentence>  ·  high | medium | low

**Where:** <screen> · <state> · <width> · <theme> · `<selector or file:line>`
**Breaks:** <the source, with its ID or criterion>: <measured value against the expected one>
**Stops:** <who, from doing what>
**Fix:** <the change, at its root: the token, the catalog piece, the pattern>
**Also in:** <other places with the same cause>
```

The report puts findings in order of severity, and says which checks ran and which did not (RULE-22).
