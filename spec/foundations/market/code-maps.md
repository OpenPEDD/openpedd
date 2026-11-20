---
title: Code maps for agents
description: MKT-09 · How tools give a coding agent a map of the repo so it finds where to work. Surveyed 2026-11-20
owner: Kevin
version: "1.0"
updated: "2026-11-20"
---

# MKT-09 · Code maps for agents

Read on 2026-11-20, from each tool's docs. aider.chat, cursor.com and docs.devin.ai could not be
fetched from this session; their rows come from search results. **(unverified)** marks what only a
secondary source said.

| Tool | What the map holds | Rebuilt | Where it lives | Where it breaks | Source |
|---|---|---|---|---|---|
| **Aider repo map** | Files and their key definitions (tree-sitter), ranked by PageRank over the reference graph | Every turn, cached by file time | Outside the repo | No routes or components; the rank depends on the chat. Default budget 1,000 tokens for the whole repo | aider.chat/2023/10/22/repomap.html |
| **DeepWiki / Devin Wiki** | A generated wiki: architecture pages, diagrams | Re-indexed by Devin; on push **(unverified)** | Hosted; `.devin/wiki.json` committed to steer it | Prose a model wrote, not reviewed in a PR | docs.devin.ai/work-with-devin/deepwiki |
| **Google Code Wiki** | Gemini-written pages per module | After every change, says Google | Hosted; public repos only (preview, 2025-11) | Warns it can be wrong | developers.googleblog.com |
| **Cursor** | Embeddings of chunks; a Merkle tree finds what changed | About every 5 minutes | Cursor's servers | Opaque; nothing to review | cursor.com/blog/secure-codebase-indexing |
| **Claude Code** | No index: glob, grep and reads; `CLAUDE.md` per directory | Every session | `CLAUDE.md` committed | Explores again every session | Pragmatic Engineer, interview with B. Cherny |
| **AGENTS.md (Codex)** | Hand-written instructions, nested; the nearest wins | By hand | Committed | Goes stale; combined cap about 32 KiB **(unverified)** | developers.openai.com/codex/guides/agents-md |
| **Serena MCP** | Live symbols from the language server | Live | Optional memories committed | One language server per language; no picture of the whole | github.com/oraios/serena |
| **Nx** | The project graph: projects, dependencies, targets, through its MCP | Computed and cached | Cache outside git | No symbols | nx.dev/docs/reference/nx-mcp |
| **Turborepo** | The package graph; `turbo ls --affected` | On demand | Not stored | No symbols or routes | turborepo.dev/docs/reference/ls |
| **Repomix** | The whole repo in one file; `--compress` keeps signatures | On demand | One file, usually not committed | A dump, not a map | github.com/yamadashy/repomix |
| **Storybook addon-mcp** | The component manifest ([`MKT-06`](component-catalogs.md)) | Live with the server | Served, not committed | Off by default | storybook.js.org/docs/ai/mcp/overview |

## What it shows

| Finding | From |
|---|---|
| The package skeleton is best taken from the build graph: deterministic and cheap | Nx, Turborepo |
| A useful map is small: symbols ranked by use, cut to a budget | Aider |
| A map committed next to the code can be reviewed; a hosted one cannot | AGENTS.md, `.devin/wiki.json` vs DeepWiki, Cursor |
| Only what changed is rebuilt | Cursor's Merkle tree, `--affected` |
| A short root that links to one file per part, nearest wins, with a size cap | AGENTS.md |
| Live details (components, symbols) are pointed to, not copied | Storybook MCP, Serena |
| Prose written by a model is wrong often enough that every vendor warns about it | Code Wiki, DeepWiki |
