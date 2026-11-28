# Tokens and components: the system a screen is made of

The `Brand System` holds the tokens and the catalog (ENT-02); `packages/ui` holds them in code with
its Storybook. **Read what exists first**: the token files, the theme, the Tailwind or CSS config,
and the catalog. The project's system is extended, never replaced, and a second token source is
never created next to the first.

## Three tiers

| Tier | Holds | Example | Who reads it |
|---|---|---|---|
| **Primitive** | Raw values, with no meaning | `color.blue.600`, `space.4` | Only the semantic tier |
| **Semantic** | A role: what the value is for | `color.text.muted`, `color.bg.danger`, `space.inset.md` | Every component and screen |
| **Component** | A component's own decision, only where it departs from the semantic tier | `button.primary.bg` | That component alone |

Code uses semantic tokens. A primitive in a component is a finding: retuning the theme cannot reach
it. Names go `category.role.variant.state`: `color.border.input.focus`.

## The format

The tokens are written in the **W3C Design Tokens format 2025.10** (DTCG), a stable report of its
community group, not a W3C standard: each token has `$value` and `$type`, an alias points at a whole
token as `{color.blue.600}`, and a group is any object without `$value`. **Themes are modes of the
semantic tier**, written with the DTCG resolver module: sets merged in order, and modifiers such as
`theme` with contexts `light` and `dark`. When the project already keeps tokens another way (CSS
variables, a Tailwind theme), that way stays, and the tiers still hold.

## The scales

| Scale | Default for a branding change |
|---|---|
| Space | Base 4: 0, 4, 8, 12, 16, 24, 32, 48, 64, 96 |
| Type | Five to seven sizes on a ratio of 1.2 to 1.25, from a 16 px body ([visual.md](visual.md)) |
| Radius | none, 4, 8, 12, full; grows with the element's size |
| Shadow | Three elevations: raised, overlay, modal |
| Motion | Durations 100, 200, 300 ms; one ease out, one ease in |
| Layers (z-index) | Named, never numbers in code: base, dropdown, sticky, overlay, modal, toast |
| Widths | The breakpoints a screen is checked at ([responsive.md](responsive.md)) |
| Density | Comfortable and compact as two sets of the same tokens |

## Themes and dark mode

| Rule | Why |
|---|---|
| A theme remaps semantic tokens; components do not know which theme runs | One component, every theme |
| Dark is designed, not inverted: surfaces get lighter as they rise, saturation drops, pure black and pure white are avoided for large areas | Inverted light themes glare and lose depth |
| **Each pair of tokens that meets on screen (text on surface, icon on primary) is checked for contrast in each theme, as a test** | A failing pair fails in every component that uses it, and is fixed once (MKT-06) |
| The person's setting (`prefers-color-scheme`) is the default; a choice in the product overrides it and is kept | They chose once |

## A component

| Rule | Why |
|---|---|
| **Search before building**: the catalog through its MCP, then the code (the duplicate check) | A piece the catalog does not show does not exist for an agent (design PRD) |
| One prop per axis: `variant` (primary, secondary, quiet, danger), `size` (sm, md, lg, sharing the size scale), and the states of [states.md](states.md) | Combined booleans (`isPrimary`, `isLarge`, `isRed`) multiply into variants nobody designed |
| Composition over configuration: children and slots instead of twenty props | A new case is composed, not added as a prop |
| Wrap vendor primitives; never edit the vendor's files | They are rewritten by the vendor's CLI (MKT-06) |
| **One story per state**, and the docblock above `meta` says when to use it and when not | It is what an agent reads to pick the piece (MKT-06) |
| It enters the catalog with its story, through a delta to the `Brand System` that says why no piece fit | RULE-33 |

## Keeping it clean

| Practice | How |
|---|---|
| A new token is a delta to the `Brand System` | Never a value written inline "for now" |
| A token is retired by deprecation: it stays as an alias, marked with the date, until no code uses it | Removing it at once breaks what still reads it |
| Raw values are refused by the linter where the stack allows it | `stylelint-declaration-strict-value`, the design system's own ESLint rule, or Tailwind's arbitrary-value rules |
| Drift is counted | [scripts/scan-styles.mjs](../scripts/scan-styles.mjs) lists every raw color and arbitrary value, and the class sets repeated across files |
