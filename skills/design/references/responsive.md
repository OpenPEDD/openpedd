# Responsive: every width, long text, touch

The widths a screen is checked at are the `Brand System`'s. When it names none, use 320, 375, 768,
1024, 1280 and 1440 px, plus a 1280 px window zoomed to 200 %. **Design from the narrowest**: what
fits at 320 px is what the screen is really about.

## Each pattern, narrow

| Pattern | At narrow widths | Never |
|---|---|---|
| Side navigation | A drawer behind a menu button, with the current place still named in the header | Squeezed to icons nobody can read |
| Table | The columns that matter most stay; past that, each row becomes a card with the same fields in the same order. When the table must stay a table, it scrolls inside its own container with the first column fixed | The whole page scrolls sideways |
| Form | One column, fields full width, the right keyboard (`type="email"`, `inputmode="numeric"`) | Two fields side by side that crush their labels |
| Dialog | A full-screen sheet, actions reachable without scrolling past the content | A centered box wider than the screen |
| Side panel | Its own page, or a sheet from the bottom | A panel that covers the content it relates to, with no way back |
| Toolbar or row of actions | The primary action stays; the rest go into a "More" menu | Wrapping onto three lines |
| Fixed bar or floating button | Leaves the safe area clear, does not cover the last item of a list, and never hides the focused element (WCAG 2.4.11) | Covering the "Save" button of the form under it |
| Images and media | Keep their aspect ratio (`aspect-ratio`, width and height set); sizes by `srcset` | Stretching, or shifting the layout as they load |
| A component that lives in several widths (a card in a grid and in a sidebar) | Adapts to its container (container queries), not to the window | Breakpoints that assume the window is the container |

## Long text

Check every screen again with a **pseudo-locale** (about 40 % longer, with accents), and with the
longest values of the `Test Data`.

| Rule | How |
|---|---|
| A flex or grid child that holds text can shrink | `min-width: 0` on it. Most overflows come from this missing |
| Identifiers, emails and URLs wrap | `overflow-wrap: anywhere` where they appear |
| Truncation keeps the full text reachable | Ellipsis with the full text in a tooltip or on the detail; never on the one value that identifies the record |
| Buttons and badges grow with their text | No fixed width on anything that holds copy |
| Numbers and dates use the locale | `Intl` formats; a column of amounts keeps tabular figures |

## Touch

| Rule | Why |
|---|---|
| Targets 24 × 24 px at least (WCAG 2.5.8), 44 px for the primary ones, with space between neighbours | A finger is not a cursor |
| What appears on hover is always visible where there is no hover (`@media (hover: hover)` to hide it only for mice) | Touch has no hover |
| No gesture is the only way: a swipe has a button, a drag has a menu (WCAG 2.5.7) | Gestures are invisible and some people cannot make them |

## Done when

No horizontal scroll at any width, every action reachable, nothing clipped, in every state and in the
pseudo-locale (closing pass 1). [scripts/page-check.js](../scripts/page-check.js) lists what
overflows and what is clipped at the current width; run it at each one.
