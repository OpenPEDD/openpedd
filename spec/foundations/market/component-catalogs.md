---
title: Component catalogs for agents
description: MKT-06 · How a product's components are offered to agents, tested and compared visually; what Reclee's first catalog found. Surveyed 2026-11-17
owner: Kevin
version: "1.0"
updated: "2026-11-17"
---

# MKT-06 · Component catalogs for agents

An agent designing a screen redraws a table or a button when nothing tells it that one exists. This
is who offers a product's components to agents, read on 2026-11-17, and what happened when Reclee
tried it (PR `Reclee-team/scout#244`, 2026-11-17).

## Who does it

| Tool | What it gives an agent | Where it breaks | Source |
|---|---|---|---|
| **Storybook MCP** (`@storybook/addon-mcp`, 10.3+) | A **component manifest**: each component, its props, its stories and the docblock above `meta`, served at `/mcp`. Tools: list and show docs, show a story, preview URLs, run the story tests | The manifest is off by default (`features.componentsManifest`). The docs list only Vue/Vite and React as covered | storybook.js.org/docs/ai/mcp |
| **Chromatic** | The same MCP, hosted, for a team with several Storybooks; screenshot review in the cloud | Paid past 5,000 snapshots a month (Starter $179 for 35,000, checked Nov 2026); on the free plan, testing pauses at the cap | chromatic.com/pricing |
| **shadcn registry + MCP** | Search and install items from public or private registries declared in `components.json` | It installs vendor pieces; it does not know the product's own components unless they are published as a registry | ui.shadcn.com/docs/mcp |

## What Reclee measured

Storybook 10.6.7 on Next.js 16 (`@storybook/nextjs-vite`), React 19, Tailwind 4, shadcn on Base UI.

| Finding | Detail |
|---|---|
| The manifest works on `nextjs-vite` | Not listed in the docs; checked against the running MCP |
| **What an agent reads is the docblock above `meta`** | It wins over the component's own JSDoc. `parameters.docs.description` does not reach the manifest. A story without that docblock gives the agent a name and props, and no reason to pick the piece |
| Example imports are rewritten to the package name | `from 'reclee'` for any import that is not a package; the docblock's `@import` tag did not change it |
| Stories are tests, free | `@storybook/addon-vitest` runs each story in Chromium: render, `play` and axe. 664 stories ran in about 7 minutes |
| **axe on every story found theme tokens, not components** | `destructive`, `success`, `warning`, `info` and `primary` failed WCAG AA as text (2.3–3.8:1); one change to the tokens fixed 41 of 77 known failures |
| Visual comparison without a service | Vitest's `toMatchScreenshot`, baselines in the repo. Fonts rasterize differently per OS, so a baseline compares only on the OS that took it |
| Copies a catalog does not catch | The same class set written by hand in 3+ files: 21 of them across 1,628 files, the largest in 17 |
| Vendor code is off limits | `src/components` is rewritten by the CLI; fixes go to wrappers and the theme |
