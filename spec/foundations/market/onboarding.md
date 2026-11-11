---
title: How tools onboard a project
description: MKT-02 · How other tools start on a new or an existing project, and detect its stack. Surveyed 2026-11-10
owner: Kevin
version: "1.0"
updated: "2026-11-10"
---

# MKT-02 · How tools onboard a project

Surveyed on 2026-11-10, for [`modules/workspace`](../../modules/workspace/prd.md). The depth varies:
**read** means its docs or code; **summary** means search results only.

| Tool | Depth | What it does | Where it falls short |
|---|---|---|---|
| **Spec Kit** | Read: upgrade and monorepo docs | `init --here`; a manifest of installed files that stops on local edits; `check` | One isolated project per folder, with no shared rules between them. The spec lives with the change |
| **OpenSpec** | Read: CLI and existing-projects docs, issue #725 | `init`, `update --dry-run`, `--language`. Existing docs are source material, not converted. Specs grow from changes | Several repos are beta ("stores") and an open request. Code only |
| **BMAD** | Read: project context docs, changelog | Adopts a handwritten `AGENTS.md`, writes between markers, shows every write. Dropped generated docs in v6.11: stack lists go stale | Agent instructions only, not a product spec |
| **Agent OS** | Read: `discover-standards` command | Finds conventions per area, then asks why each exists, one at a time | Standards live apart from any spec |
| **Tessl** | Summary | `init` detects dependencies and the agent; `install` for whoever clones | Registry of library docs, not a product spec |
| **Nx** | Summary | Minimal or guided `init`; detects tools and offers plugins | Build tooling only |
| **Copier** | Summary | Records answers and template version; `update` merges later changes | Templates only |
| **Claude Code `/init`** | Summary | Generates instructions; if a file exists, suggests rather than overwrites | One file |
| **Task Master** | Summary | `init` with rule profiles, `migrate` | Tasks from a PRD; no existing-code reading |
| **`flutter doctor`** | Summary | Lists what is missing, per capability | One platform |
| **Backstage** | Summary | Discovers repos; opens a PR to register one | Catalog only |

## Detecting the stack

**Specfy Stack Analyser** (read: README). MIT, TypeScript, over 700 technologies, separates components
in a monorepo and links them. Last release January 2026, 428 stars: untested here
([`Q-22`](../../open/questions.md)).

No tool found recommends agent tools or MCP servers from a repo's stack.

## Not covered

Storybook's and Expo's setup: the search returned nothing usable.
