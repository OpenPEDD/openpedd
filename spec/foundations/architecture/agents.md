---
title: Skills, agents and tools
description: ARCH-04 · What each stage runs with, how judges run on a Claude Code subscription, and the MCP tools
owner: Kevin
version: "1.3"
updated: "2026-11-11"
---

# ARCH-04 · Skills, agents and tools

Three pieces, never mixed:

| Piece | Is | Lives in | Named |
|---|---|---|---|
| **Skill** | The procedure the **generating** agent follows | `.claude/skills/<name>/SKILL.md`, and the equivalent for each supported agent | `/<stage>` for the whole stage; `/<stage>-<verb>` for a part |
| **Agent** | A **judge**: another session, another model, without the generator's conversation | `.claude/agents/<name>.md`, with `model:` in its frontmatter | `<what-it-checks>-judge` |
| **MCP tool** | How agents read and propose against the spec | The OpenPEDD MCP | `snake_case` |

`pedd init` generates the skills and agents for every agent it finds, recording each file and its
hash in `.pedd/manifest.json` so `pedd update` can tell what was edited by hand (Claude Code first; Cursor,
Copilot, Codex and others through the same templates, the way Spec Kit does).

## How judges run

| Form | How | When |
|---|---|---|
| **Subagent** | An agent with its own `model:`. It starts without the caller's conversation and receives only the spec and the output | Default |
| **Headless** | `claude -p --model <model>` as a separate process | From scripts or CI |
| **Other provider** | An adapter (Codex, Gemini) | Optional, never required |

Both Claude Code forms use the team's subscription. Models are configured per profile, per stage and
per command ([`DEC-07`](../../decisions/DEC-07-models.md)).

## How agents work

| Practice | Why |
|---|---|
| **Whatever coordinates is not a model.** `pedd`, or a workflow script, launches one agent per step and checks the precondition before the next ([`RULE-24`](../rules/cycle.md#rule-24)) | A model coordinating for hours forgets the order it was given |
| **Small scope**: one agent per task or step, with its pack and nothing else. A task is cut by vertical slice that fits a reviewable PR, never by layer | Less text makes each rule weigh more; cutting smaller than that costs more in coordination than it saves |
| **The checklist is the output**: the agent delivers each item, and the judge checks it | An agent that ticks its own list can tick and skip |
| **One writer per set of files.** Two run in parallel only if they do not touch the same files; in a shared file (translations), each touches only its keys | Two writers on one file overwrite each other |
| **The brief** has the goal, the rules, the checks, the report format and what not to touch. It never contradicts `AGENTS.md`: what the project already says is not repeated or changed in it | The agent knows only what the brief says |
| **Scoped checks while working**: lint, types and the tests of what was touched. The full pipeline once, at the end | A full run per round spends without finding more |
| **One commit per round** | Each round can be reviewed or reverted alone |
| **A writer's report is read before committing**: what changed is looked at, and its assumptions go to the person. It ends with improvements not applied and the time of each step ([`RULE-25`](../rules/cycle.md#rule-25)) | A report sounds equally sure when it is wrong |
| **Each agent opens its own browser tab**; the person's are not touched | The person keeps working |

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
