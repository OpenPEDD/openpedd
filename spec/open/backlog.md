---
title: Backlog
description: What was agreed or proposed for the framework and is not written in the spec yet
owner: Kevin
version: "1.9"
updated: "2026-11-25"
---

Agreed in conversation, waiting to be written. None of this governs
([`ENT-19`](../foundations/domain/open-item.md)). An item leaves this file when it enters the spec.

## Open questions

Each one lives in [questions.md](questions.md) with its ID, and closes there with a `DEC`.

| Pending | Proposal |
|---|---|
| How does `pedd init` detect the stack: Specfy's Stack Analyser or its own rules? (`Q-22`) | Stack Analyser, tried on Reclee first |

## Deferred

| Item | Proposal |
|---|---|
| The model per task | Mechanical tasks (types, enums, a REST route) on a cheaper model. Kept on the selected model for now |

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
| Component catalog in CI | `pnpm test:stories` and `test:stories:dark` as a required check, with Chromium in the job; screenshot baselines taken on the CI's Linux (scout#244) |
| Extract the copies | The 21 class sets `check:duplicates` lists: the screen height under the Copilot bar (17 files), the CRM detail panes, the Copilot panel body |
| Accessibility debt | The 38 stories still marked `a11y.test: "todo"`, each with its rule; `e2e/a11y-baseline.json` drops `ats` once the e2e confirm the new tokens |
| Stage sub-issues | `/flujo` creates, at approval, the sub-issues of architecture, design and implementation, with their blocks and the `Spec:` anchor; it looks the anchor up first and reuses the story's issue as the parent |
| Statuses from git | Linear's per-team workflow: draft PR → In progress, review requested → Pending approval, merge → Done. Stage PRs say `Closes`, the implementation PR `Part of`. The skills stop moving statuses by hand |
| Definition of done | The template in the implementation sub-issue, ticked from the CI result |
| `/tracker-tidy` | A first run over Reclee's backlog: the duplicates of each roadmap item marked as such, once Kevin approves the list |
| Agents' context | A `test:agent` script in `scout` (vitest with the minimal reporter, pgTAP showing only failures), permission rules for migrations and generated code, and the read hook |
| Cloud pilot | One small task in a cloud session once the weekly quota resets: setup time, Supabase in 16 GB, cost per task with a small pack |
| Automations spec | Settle: the job post's *Automatizaciones* tab; free API reads against no automations on `FREE`; whether choosing Shortlist with `STAGE_CHANGED` fires; the `CORE` plan scout lacks |
