---
title: Workspace
description: ENT-16 · The repos of a project and how they connect
owner: Kevin
version: "1.6"
updated: "2026-11-20"
---

# ENT-16 · Workspace

A workspace is the repos of one project: **one monorepo by default**, with the spec, the apps and the
shared packages ([`DEC-22`](../../decisions/DEC-22-monorepo-default.md)). It is declared in
`workspace.yaml` at the root of the monorepo (`mono`) or of the spec repo (`split`). How the repos are created and published is in
[`ARCH-03`](../architecture/workspace.md) and [`modules/workspace`](../../modules/workspace/prd.md).

| Field | What it holds |
|---|---|
| `project` | The name, used as the repo prefix: `reclee` |
| `mode` | `mono` (default: one repo with `spec/`, `apps/` and `packages/`) or `split` (several repos, for the cases in [`ARCH-03`](../architecture/workspace.md#split)) |
| `language` | The language of the prose. Names are always in English ([`RULE-05`](../rules/writing.md#rule-05)) |
| `repos` | `spec`, `help`, `docs`, `code` (one or more) |
| `components` | Each app and package, its repo and path, and the modules it implements; the [code index](../architecture/code-index.md) is built from it |
| `run` | How to run it locally, and the name of the test user's variable |
| `tools` | The tool chosen for each capability a stage needs |
| `references` | Other specs this one builds on, read-only |
| `publish` | Which artifacts the project has, and where each is published |
| `locales` | The languages of the product's interface. The first is the base, always `en`; `init` writes `[en]` ([`DEC-21`](../../decisions/DEC-21-i18n-from-day-one.md)) |
| `environments` | Where code runs, in order; one marked `public` |
| `branches` | The base, and the name of each kind of branch ([`ARCH-06`](../architecture/branches.md#configuration)) |
| `models` | The model profile and overrides ([`DEC-07`](../../decisions/DEC-07-models.md)) |
| `stages` | Per-stage settings, such as `architect.mode` |
| `runners` | Where each stage runs: `local`, `cloud` or `self-hosted`, its environment and how many in parallel ([`ARCH-12`](../architecture/running.md#where-agents-run)) |
| `review` | What blocks a change, and whether the judges run on every PR ([`ARCH-13`](../architecture/review.md)) |
| `budgets` | Token budgets per layer |
