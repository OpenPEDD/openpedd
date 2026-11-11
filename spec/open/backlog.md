---
title: Backlog
description: What was agreed or proposed for the framework and is not written in the spec yet
owner: Kevin
version: "1.3"
updated: "2026-11-11"
---

Agreed in conversation, waiting to be written. None of this governs
([`ENT-19`](../foundations/domain/open-item.md)). An item leaves this file when it enters the spec.

## Open questions

Each one lives in [questions.md](questions.md) with its ID, and closes there with a `DEC`.

| Pending | Proposal |
|---|---|
| How does `pedd init` detect the stack: Specfy's Stack Analyser or its own rules? (`Q-22`) | Stack Analyser, tried on Reclee first |

## For Reclee

Adopting the framework's latest decisions in Reclee's own spec and code.

| Item | What |
|---|---|
| End-to-end tests | No Playwright or `data-testid` in `scout` yet |
| Flags | No flag system yet: OpenFeature over a table |
| Onboarding PRD | Say that *"No hay tour por módulo"* does not cover a Walkthrough |
| `open_screen` | Opens four screens; *Take there* needs more |
| Walkthrough button | To choose: *Ver cómo*, *Muéstrame*, *Guíame* |
| `scout` on Windows | `test/integration/isolation.mjs` builds paths with `\`; a full `vitest run` segfaults |
| Mocks | A `vi.mock` of a whole module uses `importOriginal`; no module reads another's schema when it loads |
| pgTAP filter | Commit `pnpm test:db <word>` and note it in `AGENTS.md` |
| Automations spec | Settle: the job post's *Automatizaciones* tab; free API reads against no automations on `FREE`; whether choosing Shortlist with `STAGE_CHANGED` fires; the `CORE` plan scout lacks |
