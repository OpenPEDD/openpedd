---
title: Baseline
description: What every project starts with, as a versioned baseline, and how a product already built keeps up with it
owner: Kevin
version: "1.1"
updated: "2026-11-25"
status: draft
---

# Baseline

**Every product keeps improving to the framework's current practices, even when it is built and only
in maintenance.** What a new project starts with is the **baseline**; it is versioned, and when the
framework adds to it, every existing product sees what it now lacks. How `init` installs it is in
[workspace](prd.md); this PRD is what it installs and how a product keeps up.

## What a project starts with [#what-a-project-starts-with]

Everything `init` leaves in a new project, each defined where it points. **Level** is the one the
[tools of each stage](prd.md#the-tools-of-each-stage) use: **required** (red: the stage cannot run, a
check fails), **recommended** (yellow: a warning, an improvement, never a failure), or **if the project
has it**.

| Part | What it is | Level | Defined in |
|---|---|---|---|
| Layout | One monorepo: `spec/`, `apps/` (`app`, `landing`, `docs`, `help`), `packages/` (`ui` with its Storybook, `i18n`), each app deployed on its own | Recommended for a running product | [`ARCH-03`](../../foundations/architecture/workspace.md) |
| `spec/` | Foundations marked empty, `modules/`, `decisions/`, `open/`, `changes/`, `history/` | Required | [Artifacts](../../foundations/artifacts.md) |
| `workspace.yaml` | Mode, repos, components, tools, runners, `locales: [en]` | Required | [`ENT-16`](../../foundations/domain/workspace.md) |
| i18n | English as the base; every text a person reads is a key | Required | [`DEC-21`](../../decisions/DEC-21-i18n-from-day-one.md) |
| Agents' instructions | OpenPEDD's block in `AGENTS.md` or `CLAUDE.md`, between markers | Required | [Main flow](prd.md#main-flow), step 5 |
| Code index | One file per module and package, regenerated on every merge to the base | Recommended | [`ARCH-19`](../../foundations/architecture/code-index.md) |
| Checks | Links and token budgets now; the rest of `pedd check` as it ships | Required | [`RULE-04`](../../foundations/rules/writing.md#rule-04) |
| Stages | `map` to `measure`, each run only where its track says | Required | [cycle](../cycle/prd.md) · [tracks](../tracks/prd.md) |
| Skills, judges and MCP | Installed in each agent found, recorded in `.pedd/manifest.json` | Required | [Capabilities](../../capabilities.md#skills) |
| Tools per stage | Each capability, with its own level, and what is lost without it | Per row | [workspace](prd.md#the-tools-of-each-stage) |
| Safety | `--dry-run`, backups, secrets denied | Required | [workspace](prd.md#writing-safely) |
| Branches and tracker | One branch per change, cut by `pedd branch`; one sub-issue and one PR per stage, the tasks as commits | Required | [`ARCH-06`](../../foundations/architecture/branches.md) · [`ARCH-15`](../../foundations/architecture/tracker.md) |
| Pipeline | The moments of the pipeline, and the judges on every PR | Required | [`ARCH-11`](../../foundations/architecture/pipeline.md) |

## The version [#the-version]

The baseline's version is the [template](#the-project-template)'s. Each product records the version it
is on in `.pedd/manifest.json`, and `update` moves it.

| Rule | Why |
|---|---|
| **A new practice enters as recommended**: a Storybook catalog, end-to-end tests, the code index | A product in maintenance gets a warning to plan, not a red build |
| It becomes required only in a later minor version, said in the `CHANGELOG` | Nobody's pipeline turns red on an upgrade they did not read about |
| A recommended gap never fails a check | Improving is a choice; the required items are the floor |

## Keeping up [#keeping-up]

| Step | Does |
|---|---|
| 1 | **`pedd doctor` lists the gaps** against the current baseline, not the one the product started on: each with its level and the version that added it |
| 2 | **`pedd update` offers each gap as a small change**: a `chore` when it adds a practice, a `cover` when it covers what the product already does ([tracks](../tracks/prd.md)), created the way `adopt` creates its changes ([adopting](prd.md#adopting-a-running-product)) |
| 3 | The person chooses which gaps to take and when; the rest stay listed |

`pedd status --adoption` counts the baseline gaps with the rest.

## The project template [#the-project-template]

What `init` installs comes from one place: the `template/` folder of `openpedd/openpedd`. **Before the
CLI exists, the first client starts from it by hand**, with the skills already written, today
`/specify-interview`. Other skills are written and improved as that work needs them.

It holds the first six rows [above](#what-a-project-starts-with) (the apps and packages as empty
skeletons), with each folder's guide, every `workspace.yaml` default commented, and the same check
scripts this repo runs.

| Rule | Why |
|---|---|
| One template, here; `init` installs it and records its version in `.pedd/manifest.json` | A second copy drifts, and `update` could not tell what changed |
| Copied with `npx degit openpedd/openpedd/template` until `pedd init` exists | The first client cannot wait for the CLI |
| It names no client | This repo is public |
