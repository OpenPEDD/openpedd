# Visual design: decisions and the numbers behind them

**The `Brand System`'s tokens and patterns decide first.** The values here are the defaults a
branding change starts from ([tokens.md](tokens.md)), and the tests a screen is held to.

## Hierarchy

| Rule | How to apply it |
|---|---|
| One thing is first per region | Rank the elements ([screens.md](screens.md)); give rank one to a single element |
| At most three levels of emphasis per region | Primary, secondary, the rest. A fourth level reads as noise |
| Change one property at a time | To rank something up, change size, or weight, or color, or position. Changing all four at once leaves nothing to rank the next thing with |
| Lower what is secondary before raising what is first | A muted color on labels does more than a larger heading |
| One primary action per view | A single filled button. The rest are secondary or quiet |

**Squint test:** blur the screenshot, or look at it at 25 %. What stands out must be what ranked
first. If it is a border, a badge or an illustration, the hierarchy is wrong.

## Type

| Decision | Default | Why |
|---|---|---|
| Scale | A ratio of 1.2 to 1.25 for the app; up to 1.333 for marketing pages. Five to seven sizes in all | Fewer sizes are what make a hierarchy readable |
| Body | 16 px; 14 px only in dense tables and secondary text | Smaller strains reading and fails zoom tests sooner |
| Line height | 1.4 to 1.6 for text, 1.1 to 1.3 for headings | Long lines need more air; large type needs less |
| Line length | 45 to 75 characters | Past 75 the eye loses the next line |
| Weights | Two, rarely three: regular and semibold | Each weight added weakens the others |
| Numbers | Tabular figures in columns and wherever numbers change in place | Digits of equal width line up and do not jitter |
| Families | One; a second only for code or for the brand's headings | Each family is one more voice |

## Spacing, grid and alignment

| Rule | Default |
|---|---|
| Every space comes from the scale | A base of 4: 4, 8, 12, 16, 24, 32, 48, 64 |
| The space inside a group is smaller than the space between groups | Proximity is how the eye groups; equal spacing everywhere groups nothing |
| One gutter per layout | The same gap between the columns of one layout |
| One left edge per column | Text, inputs and headings of a column start on the same line; icons hang outside it or inside the gutter |
| App layout | A fixed side navigation and a fluid content area, with a maximum width for reading text |
| Marketing layout | A 12-column grid, with sections on a vertical rhythm from the scale |

## Color

| Rule | Why |
|---|---|
| Code uses roles, never raw colors: background, surface, text (primary, secondary, muted), border, primary, danger, warning, success, info, each with its "on" color | A role can be retuned for a theme or for contrast once; a raw color is fixed everywhere it was pasted |
| Saturated color is for action and state | When everything is colored, nothing signals |
| Color never says something alone | WCAG 1.4.1: add an icon, a text or a pattern |
| Text against its background: 4.5:1; large text (24 px, or 18.66 px bold) 3:1; borders of inputs, icons and focus 3:1 | WCAG 1.4.3 and 1.4.11 |
| Contrast is checked per theme, on the pair of tokens | A failure in many places is one token (MKT-06) |

## Density

Density is a set of tokens (comfortable and compact), not a value chosen per screen. A table row
is about 40 px compact and 48 px comfortable. A dense screen still keeps 24 px targets (WCAG 2.5.8).

## Surfaces, borders, shadows

Separate with the least that works, in this order:

1. **Space.** Most groups need nothing else.
2. **A background shift**: a surface one step from the page.
3. **A border**: one border color across the product.
4. **A shadow, only for elevation**: what floats over the page (a menu, a dialog, a dragged item).

A card with a border, a shadow and a different background at once uses three signals for one
boundary. The radius comes from its scale and grows with the size of the element.

## Icons

| Rule | Why |
|---|---|
| One set, one stroke, sizes from the scale | Mixed sets read as two products |
| An icon next to its text is decorative: `aria-hidden` | A screen reader would read it twice |
| An icon without text only for an action everyone knows (close, search, more), with an accessible name and a tooltip | An icon alone is a guess for everything else |

## Motion

From 100 to 300 ms; ease out when something enters, ease in when it leaves. It shows that something
changed or where it went, never decorates. `prefers-reduced-motion` turns movement into a fade or
nothing.

## What a screen is measured on

| Measure | Passes when |
|---|---|
| Distinct font sizes on one screen | All of them are in the type scale |
| Spacing | Every margin, padding and gap is a value of the scale |
| Colors | Every color in use is a token's |
| Contrast | Every text and every control passes for its size, in every theme |
| Emphasis | The squint test shows the item ranked first |

[scripts/scan-styles.mjs](../scripts/scan-styles.mjs) counts the values in the code;
[scripts/page-check.js](../scripts/page-check.js) measures the rendered page.
