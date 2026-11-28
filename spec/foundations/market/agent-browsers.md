---
title: How agents drive a browser
description: MKT-21 · The libraries, CLIs and MCP servers a coding agent opens, looks at and measures a running screen with, and what each costs in tokens. Surveyed 2026-11-28
owner: Kevin
version: "1.0"
updated: "2026-11-28"
---

# MKT-21 · How agents drive a browser

Surveyed on 2026-11-28, from each package's npm entry, its repo's README and its open issues. The
Playwright library, its CLI and `@axe-core/playwright` were also run here, on a test page with known
defects.

## The tools

| Tool | Version · license | What the agent gets | Cost to the agent | Where it breaks |
|---|---|---|---|---|
| **Playwright** (library) | 1.65.1 · Apache-2.0 | A script drives Chromium, Firefox or WebKit: viewport, color scheme, network, screenshots, `evaluate` | None while it runs: the agent reads only the script's output | Screenshots compare only on the OS and browser that took the baseline ([`MKT-20`](interface-design.md)) |
| **Playwright CLI** | Ships inside Playwright 1.59+ as `npx playwright cli`; standalone `@playwright/cli` 0.1.25 · Apache-2.0 | One command per action: `open`, `snapshot` (the page as text with element refs), `click`, `hover`, `press`, `resize`, `eval`, `screenshot`, `console`. `install --skills` writes its skill into `.claude/skills` | **Microsoft recommends it over its MCP for coding agents**: no large tool schemas or accessibility trees loaded into the context | Its bundled skill is about 1,900 words |
| **Playwright MCP** (`@playwright/mcp`) | 0.0.86 · Apache-2.0 | The same actions as MCP tools, over a persistent browser; snapshots by accessibility tree, optionally with boxes | Tool schemas and full snapshots in every response; Microsoft keeps it for long exploratory loops | An extension connection without a token can hang the server (#1877) |
| **Chrome DevTools MCP** | 1.14.0 · Apache-2.0 | Input, navigation, emulation, screenshots, network, console, **performance traces with insights, and a Lighthouse audit** | Same as any MCP | Hangs or crashes Chrome with many tabs (#1921); remote debugging asks for approval each time (#825) |
| **agent-browser** (Vercel) | 0.45.0 · Apache-2.0 | A Rust CLI: compact text snapshots with refs, click, screenshot, diff, record | Like a CLI | A ref goes stale after any DOM change; a click on a covered element fails instead of passing |
| **`@axe-core/playwright`** | 4.14.1 · MPL-2.0 | axe on a Playwright page, by WCAG tags | — | Sees only what is rendered ([`MKT-20`](interface-design.md)) |

## What was measured here

| Run | Found |
|---|---|
| The library, evaluating a page check at 375 and 1280 px, light and dark, in five states | Page overflow only in the empty state at 375 px; a contrast pair failing only in dark; a state the page never confirmed; buttons under 24 px |
| The same, loading slowly with a one-row skeleton for five rows | The element below moved 164 px when the data arrived |
| `@axe-core/playwright` on the same runs | `color-contrast`, in dark only |
| A keyboard walk with the library: Tab, then where focus is and what covers it | A button under a fixed footer; one with no focus outline; a positive `tabindex` sending focus back up the page |
| Actions in the page: click, then wait for what must show | A menu that opens and an error on a failing write passed; a success message that never appears failed |
| Two runs' screenshots compared pixel by pixel in the browser, after changing one heading's color | Only the heading's rows changed, 0.12 % to 0.42 % of the page |
| `npx playwright cli --help` on Playwright 1.65.1 | The CLI and its bundled skill, with no other package |

22 page loads with screenshots, page check and axe took well under a minute on one machine. No figure
of token use per tool was published by any of them.
