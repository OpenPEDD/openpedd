---
title: Workspace
description: ENT-16 · The repos of a project and how they connect
owner: Kevin
version: "1.0"
updated: "2026-11-04"
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
| `references` | Other specs this one builds on, read-only |
| `publish` | Where each audience's repo is published |
| `models` | The model profile and overrides ([`DEC-07`](../../decisions/DEC-07-models.md)) |
| `stages` | Per-stage settings, such as `architect.mode` |
| `budgets` | Token budgets per layer |
