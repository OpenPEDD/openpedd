# Accessibility: WCAG 2.2 AA, built in and checked

The target is **WCAG 2.2 level AA**, which includes level A, unless `Quality Standards` says more.
**axe finds about 57 % of issues by volume, and on only 16 of 50 criteria** (Deque). A clean axe run
is where checking starts, not where it ends: the keyboard walk and the checks below cover the rest.

## Build it in

| While building | Criterion |
|---|---|
| Use the native element or the catalog's primitive: `button`, `a`, `input`, `select`, `dialog`. A `div` with a click handler is a bug | 4.1.2 |
| Composite widgets (menu, tabs, combobox, dialog, tree) follow the WAI-ARIA Authoring Practices, and come from the catalog's primitives, never rebuilt | 2.1.1, 4.1.2 |
| One `h1` per page, headings in order, landmarks (`header`, `nav`, `main`) | 1.3.1, 2.4.6 |
| Every field has a visible label linked to it; the placeholder is not the label | 1.3.1, 3.3.2 |
| Fields about the person carry `autocomplete` (name, email, tel, address) | 1.3.5 |
| Images that say something have `alt`; decorative ones `alt=""`; icons next to text `aria-hidden` | 1.1.1 |
| An icon-only button has an accessible name, and the visible label is part of it | 4.1.2, 2.5.3 |
| Color is never the only signal | 1.4.1 |
| Text 4.5:1, large text 3:1; input borders, icons that mean something and focus 3:1 | 1.4.3, 1.4.11 |
| Focus visible on everything, never under a sticky header, footer or banner | 2.4.7, 2.4.11 |
| Targets 24 × 24 px or spaced as if they were | 2.5.8 |
| Every drag has a click alternative (move up and down buttons, a menu) | 2.5.7 |
| What changes on its own (a toast, a result count, a save) is announced: `role="status"` or `aria-live="polite"`, `alert` for errors | 4.1.3 |
| Errors are named in text, next to the field, with how to fix them | 3.3.1, 3.3.3 |
| What was entered once is not asked again in the same flow | 3.3.7 |
| Sign-in allows paste and password managers, with no puzzle | 3.3.8 |
| Help is in the same place on every page that has it | 3.2.6 |
| Content shown on hover or focus can be dismissed with Escape, hovered itself, and stays until dismissed | 1.4.13 |
| `lang` on the page, and on any part in another language | 3.1.1, 3.1.2 |
| `prefers-reduced-motion` is respected | 2.3.3 (good practice at AA) |

**A dialog:** focus moves into it, stays inside, Escape closes it, and focus goes back to what opened
it.

## Check it

| Check | How | Catches |
|---|---|---|
| axe on every story and every screen state, in light and dark | The sweep ([scripts/sweep.mjs](../scripts/sweep.mjs)) runs `@axe-core/playwright` at each; Storybook's a11y addon through `addon-vitest` for the stories | Names, roles, labels, contrast, structure |
| **Keyboard walk** | The sweep tabs through each screen and lists what Tab cannot reach, focus hidden under something, focus with no outline or shadow, traps, and focus that jumps back up. Then by hand with the Playwright CLI (`npx playwright cli press Tab`, `snapshot`, `screenshot`), for dialogs and Escape: every action reachable, order follows the reading order, focus always visible, no trap, Escape closes | 2.1.1, 2.1.2, 2.4.3, 2.4.7, 2.4.11 |
| Zoom to 200 % and reflow at 320 CSS px | Set the viewport to 320 px wide, and zoom a 1280 px window to 200 % | 1.4.4, 1.4.10 |
| Text spacing | Apply line height 1.5, paragraph spacing 2, letter 0.12, word 0.16 em; nothing clips | 1.4.12 |
| Page check | [scripts/page-check.js](../scripts/page-check.js): small targets, unnamed controls, unlabelled fields, text contrast, heading order | 2.5.8, 4.1.2, 1.3.1, 1.4.3 |
| Screen reader pass on the main flow | VoiceOver or NVDA: each step can be done hearing only | What the tools cannot see |

| Blind spot of the tools | Check it by hand |
|---|---|
| Text over an image or a gradient: axe does not report it | Measure the worst point of the background |
| Focus order that is valid but makes no sense | The keyboard walk |
| An accessible name that exists but is wrong ("button", "click here") | Read the names the page check lists |
| A state that only appears after an action | Open it first, then scan: axe sees only what is rendered |

A check that could not run (no browser, no screen reader) is reported as not run, in the place its
result would go (RULE-22).
