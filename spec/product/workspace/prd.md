---
title: Workspace
description: pedd init — creating or connecting a project's repos and installing the framework
owner: Kevin
version: "1.0"
updated: "2026-11-04"
status: draft
---

# Workspace

`pedd init <project>` sets up a [`Workspace`](../../foundations/domain/workspace.md): it creates or
connects the project's repos and installs the framework in the agents it finds. The repo layout and
why each repo exists are in [`ARCH-03`](../../foundations/architecture/workspace.md).

```bash
pedd init reclee
```

## Main flow

| Step | Does |
|---|---|
| 1 | Asks for the mode (`split` or `mono`) and whether the repos already exist |
| 2 | Creates the missing ones with the project prefix (`reclee-spec`, `reclee-help`, `reclee-docs`), or connects the existing ones |
| 3 | Connects the code repos, one or many |
| 4 | Writes `workspace.yaml` at the root of the spec repo (`split`) or of the repo (`mono`), and in `split` a `link.yaml` in each other repo pointing back to the spec |
| 5 | Installs the skills, the judges and the MCP in the agents it detects |
| 6 | If there is code, offers to run `map` |

```yaml
# reclee-spec/workspace.yaml
project: reclee
mode: split
repos:
  spec: Reclee-team/reclee-spec
  help: Reclee-team/reclee-help
  docs: Reclee-team/reclee-docs
  code: [Reclee-team/scout]
publish:
  help: { generator: fumadocs, url: https://help.reclee.com }
  docs: { generator: openapi, url: https://docs.reclee.com }
  release_notes: { target: help }
models:
  profile: balanced
stages:
  architect: { mode: guided }
```

## Alternate flows

| Flow | What changes |
|---|---|
| `mono` | One repo with `spec/`, `help/` and `docs/` folders; no `link.yaml` |
| Repos already exist | Connects them and only writes the config files |
| A private spec on top of a public one | Adds `references` in `workspace.yaml` ([`ARCH-03`](../../foundations/architecture/workspace.md#several-specs)) |
| Moving from `mono` to `split` | `pedd workspace split` moves the folders and updates the references |

## Exception flows

| Flow | What happens |
|---|---|
| No GitHub CLI or no permission to create repos | Prints the repos to create by hand and continues with config |
| No supported agent found | Installs for Claude Code and Codex, and says so |
