---
name: design-brand
description: Run the branding change of an OpenPEDD product - build or extend its design system before its first screens - primitive and semantic tokens in the W3C DTCG format, scales for space, type, radius, shadow, motion and layers, light and dark themes with every contrast pair tested, and the first components in packages/ui, each with a story per state. Use when a product with screens has no Brand System, when someone asks to "create a design system", "armar el design system", "design tokens", "dark mode", or to add a token, scale, theme or catalog component. Extracts from what exists before choosing anything new.
---

<!-- Source: OpenPEDD spec design PRD v1.7 (the branding change), ENT-02 v1.12 (Brand System), RULE-33 v1.0, MKT-06 v1.0, MKT-20 v1.0 and DEC-36 v1.0. Change those first, then this file. -->

# Design brand: the system screens are made of

You build the product's design system, or extend the one it has, in code (`packages/ui`) and as a
`proposal` delta to the `Brand System` foundation. **What exists is extracted before anything is
chosen**, and the project's own way of keeping tokens stays.

## Before building

1. **Read now, in full:** [../design/references/tokens.md](../design/references/tokens.md), then *Type*, *Color* and *Spacing* in [../design/references/visual.md](../design/references/visual.md).
2. **What exists**, each with its file (RULE-21): token files, the theme, the CSS or Tailwind config, the UI library and its wrappers, the logo and any brand files the client gave. If the product has screens, run `/design-audit` scoped to the branding change first: its census is the evidence.
3. **The brief**: what the client said about the brand in the definition (a link, files, or nothing yet).

## Steps

1. **Primitives from evidence.** From the census and the brand files, the palette, type families and raw scales actually in use. Near-duplicates (`#333` and `#343434`, 15 and 16 px) collapse into one primitive; list each collapse, so the person sees what moves.
2. **Semantic roles** on top: text, surface, border, primary, danger, warning, success, info, each with its "on" color, plus focus. Code reads only these.
3. **The scales**: space, type, radius, shadow, motion, layers, widths and density, from `tokens.md`'s defaults unless the evidence or the brief says otherwise.
4. **Themes**: light and dark as modes of the semantic tier. **Write a test that checks the contrast of every pair of tokens that meets on screen, in each theme** (4.5:1 for text, 3:1 for large text, borders, icons and focus). A pair that fails is fixed in the token.
5. **Where it lives.** In the project's existing format; with none, DTCG JSON in `packages/ui`, with its build to CSS variables and the stack's theme. Never a second source next to the first.
6. **The first components** the first screens need, wrapping the UI library: one prop per axis (`variant`, `size`), the states of [../design/references/states.md](../design/references/states.md) (*Each control*), **one story per state**, and the docblock above `meta` saying when to use it and when not. Each story passes axe in light and dark.
7. **Enforcement**: the linter rule the stack allows, refusing raw values outside the token files.
8. **The delta.** A `proposal` delta to the `Brand System`: the tokens and their tiers, the scales, the themes, the widths, the patterns decided, the catalog with each piece's use, and what was collapsed. A token or piece added later goes through the same delta, saying why none fit (RULE-33).

## Done when

Every color, space, size, radius, shadow and layer in `packages/ui` comes from a token; the contrast
test is green in every theme; every component has a story per state with its docblock and passes axe;
the delta is written.

## Never

- Invent a palette when the brand or the code already has one.
- Overwrite the project's config or token files wholesale: extend them, one reviewed change at a time.
- Ship a theme whose contrast was not tested.
- Edit the vendor's generated components: wrap them.
