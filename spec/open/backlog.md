---
title: Backlog
description: What was agreed or proposed for the framework and is not written in the spec yet
owner: Kevin
version: "1.0"
updated: "2026-11-11"
---

Agreed in conversation, waiting to be written. None of this governs
([`ENT-19`](../foundations/domain/open-item.md)). An item leaves this file when it enters the spec.

## Agreed

### Walkthrough

An optional derived artifact: the product's assistant takes the user to a screen and points at where
something is, on request. Not a tour: the first-run path is Onboarding.

| Item | What |
|---|---|
| Name | `Walkthrough`. Button in Reclee: to choose (*Ver cómo*, *Muéstrame*, *Guíame*) |
| Levels of help | Answer (help) · Point (Walkthrough) · Take there (Walkthrough) · Act (the product's tools, with permissions) |
| File | `help/walkthroughs/<id>.yaml`: `sources`, `article`, and `steps` with `screen`, `target`, `say` |
| Targets | One stable attribute (`data-guide`), the same one end-to-end tests locate by |
| When | `design` marks elements · `plan` uses them in tests · `verify` drafts it from green tests and walks it · `accept` tries it · `publish` publishes it |
| Highlight | The product's own, from the `Brand System`; it stays until the person acts or moves on |
| Stale | Anchored like the help; CI fails if a screen or a target no longer exists |
| At run time | Respects permissions; a missing element skips the step and offers the article |
| Language | `say` per locale |

### Release and Launch

| Item | What |
|---|---|
| Split `publish` | Accepted, on the base: applies to the spec and prepares help, Walkthrough and Release Note. On production with a successful deploy: publishes them, and the PRD moves to `live` |
| Release Note links | Public: article, Walkthrough, requests it solves. Internal: change, PRs, deploy |
| Environments | A configurable list in `workspace.yaml`, staging optional; the Release Note publishes only on the one marked `public` |
| Cloud module `launch` | Lists what is accepted and not yet in production, with what each lacks. One button per step: merge, wait for the deploy, turn on the flag, publish the note with its links. A failed deploy holds the note |
| Cloud write access | Separate permission, used only on a person's click. Today the Cloud only reads |
| Free | `pedd publish`, by hand |

### Feature flags (optional category)

| Item | What |
|---|---|
| Flow | `plan` creates it off · `build` puts it at the entry points, and the contract checks it too · tests run off and on · reaches production hidden · Launch turns it on (everyone, percentage, plan) · a task to remove it is created at launch |
| Limits | Not for every change. A migration cannot hide behind a flag: it must work with both versions |

### Tests

| Item | What |
|---|---|
| Levels | Each `AC` is tested at the cheapest level that proves it: a `level` field. Not everything is end-to-end |
| Captures | `verify` captures only the criteria with a screen |
| Permission matrix | Role × action, each cell a red test from `plan`, allowed and denied. Isolation between accounts, background jobs, and the no-permission screen |
| Row-level security | Optional category: a database test per policy, and no table without one |
| Contracts | One test per contract × error × role. A public API adds generation from its schema |
| Fail the pipeline | A contract without `roles`; a new table without a policy |

### Configuration

| Item | What |
|---|---|
| `doctor` by category | Asks for the capability, never for a brand. Add categories: flags, row-level security, i18n |
| Optional artifacts | `publish` generates only what the project declares: help, API Reference, MCP, Walkthrough, Release Notes. The internal contract exists either way |
| i18n | `locales` in `workspace.yaml`, optional. `design`: a pseudo-locale pass · `plan`: missing or unused keys fail the pipeline · `verify`: renders each locale · `publish`: per locale |
| Market | A document surveying walkthroughs, flags and release tools, dated |

## Proposed, not decided

| Item | What |
|---|---|
| OpenFeature | The API a project's code uses when the flags category is on |
| Pipeline tiers | What runs on the agent's machine, a task PR, the PR to the base, the way to production, and nightly |
| Spec-aware test selection | From the change's IDs to its criteria to their tests, checked against the import graph |
| Flaky tests | A test that passes on retry fails the pipeline, or is quarantined with a task |
| Ratchets | Mutation score, coverage and baselines only move one way |
| Merge queue | Each PR validated against the latest base |
| Hotfix and rollback | A path straight to production and back to the base |
| After launch | Errors per feature; a bad launch holds the rollout |
| AI features | Criteria over a golden set with an aggregate threshold |
| Retiring a feature | Its help, Walkthrough, flag and notes go with it |
| Privacy | Which data is personal, retention and deletion |
| Automated accessibility, performance and visual checks | The judge reads WCAG; nothing measures it in CI |
| Cost per change | Agent spend, as a metric |

## For Reclee

| Item | What |
|---|---|
| End-to-end tests | No Playwright or `data-testid` in `scout` yet |
| Flags | No flag system yet |
| Onboarding PRD | Say that *"No hay tour por módulo"* does not cover a Walkthrough |
| `open_screen` | Opens four screens; Take there needs more |
