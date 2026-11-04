---
title: Skills, agents and tools
description: ARCH-04 · What each stage runs with, how judges run on a Claude Code subscription, and the MCP tools
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

# ARCH-04 · Skills, agents and tools

Three pieces, never mixed:

| Piece | Is | Lives in | Named |
|---|---|---|---|
| **Skill** | The procedure the **generating** agent follows | `.claude/skills/<name>/SKILL.md`, and the equivalent for each supported agent | `/<stage>` for the whole stage; `/<stage>-<verb>` for a part |
| **Agent** | A **judge**: another session, another model, without the generator's conversation | `.claude/agents/<name>.md`, with `model:` in its frontmatter | `<what-it-checks>-judge` |
| **MCP tool** | How agents read and propose against the spec | The OpenPEDD MCP | `snake_case` |

`pedd init` generates the skills and agents for every agent it finds (Claude Code first; Cursor,
Copilot, Codex and others through the same templates, the way Spec Kit does).

## How judges run

| Form | How | When |
|---|---|---|
| **Subagent** | An agent with its own `model:`. It starts without the caller's conversation and receives only the spec and the output | Default |
| **Headless** | `claude -p --model <model>` as a separate process | From scripts or CI |
| **Other provider** | An adapter (Codex, Gemini) | Optional, never required |

Both Claude Code forms use the team's subscription. Models are configured per profile, per stage and
per command ([`DEC-07`](../../decisions/DEC-07-models.md)).

## MCP tools [#mcp-tools]

| Tool | Returns | Used by |
|---|---|---|
| `search_spec` | Matching sections, with their URL | All |
| `get_doc` | A document or a section, without its history | All |
| `resolve_id` | An ID's block, hash and references | All |
| `list_ids` | IDs by layer, module or status | `plan` · `verify` |
| `get_context_for` | The `Context Pack` of an ID or a task, in one call | Every delegated stage |
| `get_history` | The history of an ID or a document | `specify` · `accept` |
| `changes_since` | Which IDs changed since a date, commit or hash | `plan` · `publish` |
| `get_freshness` | For a file, task or article: its anchors and which are stale | `verify` · `publish` |
| `list_stale` | Every stale or uncovered derived artifact in a scope | `publish` · the dashboard |
| `propose_delta` | Creates a delta in `changes/<CHG>/deltas/`. Never touches the spec | Every stage but `specify` |
| `get_change` | A change with its deltas and reports | `accept` · `publish` |

The tracker is used through its own MCP; OpenPEDD adds the anchors to each issue.
