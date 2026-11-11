---
title: Workspace
description: ENT-16 · The repos of a project and how they connect
owner: Kevin
version: "1.2"
updated: "2026-11-11"
---

# ENT-16 · Workspace

A workspace is the set of repos of one project, declared in `workspace.yaml` at the root of the spec repo (`split`) or of the product repo (`mono`). Each
repo has one audience. How the repos are created and published is in
[`ARCH-03`](../architecture/workspace.md) and [`modules/workspace`](../../modules/workspace/prd.md).

| Field | What it holds |
|---|---|
| `project` | The name, used as the repo prefix: `reclee` |
| `mode` | `split` (one repo per audience) or `mono` (one repo, with folders) |
| `language` | The language of the prose. Names are always in English ([`RULE-05`](../rules/writing.md#rule-05)) |
| `repos` | `spec`, `help`, `docs`, `code` (one or more) |
| `components` | Each part of the code, its repo and path, and the modules it implements |
| `run` | How to run it locally, and the name of the test user's variable |
| `tools` | The tool chosen for each capability a stage needs |
| `references` | Other specs this one builds on, read-only |
| `publish` | Which artifacts the project has, and where each is published |
| `locales` | The languages of the product, if more than one |
| `environments` | Where code runs, in order; one marked `public` |
| `models` | The model profile and overrides ([`DEC-07`](../../decisions/DEC-07-models.md)) |
| `stages` | Per-stage settings, such as `architect.mode` |
| `budgets` | Token budgets per layer |
