---
title: publish
description: Stage 8 · Closes the loop — merges what was accepted and generates what people read
owner: Kevin
version: "1.0"
updated: "2026-11-04"
status: draft
---

# Stage 8 · `publish`

**Mode:** delegated · **Gate:** none

## What it is

Where **the loop closes**. What `accept` decided enters the spec, and from the updated spec come the
derived artifacts people read: the API Reference, the Help Center and the Release Notes. Then
everything is re-anchored, the feature is turned on for customers according to the rollout plan, and
the change is archived. When it ends, **everything in scope is `fresh`**.

## Inputs

| What | From |
|---|---|
| The deltas marked `keep` | `accept` |
| The whole change | `changes/<CHG>/` |

## Context pack

Per artifact: for the API Reference, the contracts in scope; for the Help Center, the `FR`s, mockups,
`Glossary` and `Voice & Tone`; for the Release Notes, the change summary. Budget: **12,000 tokens per
artifact**.

## Procedure

1. **Applies the deltas to the spec**, in the present tense, as if it had always said so. One history entry per version, with change, story and stage ([`ENT-17`](../../foundations/domain/history-entry.md)).
2. **Recomputes the hashes** of the IDs touched.
3. **API Reference**: generated from the contracts (OpenAPI and the MCP schema). Mechanical: no writing.
4. **Help Center**: writes or updates the articles for the `FR`s the user sees, with the right Diátaxis type (how-to for a task, reference for a screen), glossary copy and the screenshots from `verify`. Each article carries its `sources`: the IDs and their hashes.
5. **Release Notes**: one entry for the product's users, about what changed for them.
6. **Re-anchors** every derived artifact in scope: code, tests, mockups, articles, tasks.
7. **Turns the feature on** for customers per the `Delivery Pipeline` rollout plan (a flag, a percentage, a plan).
8. **Closes**: PRD and requirements to `live`, the task to done in the tracker, the change to `changes/archive/`.

## Outputs

| What | Status |
|---|---|
| The updated spec, with its history | New hashes |
| API Reference | `fresh` |
| Help Center | `fresh` |
| Release Notes | Published |
| Every derived artifact in scope | `fresh` |
| PRD and requirements | `live` |
| The tracker task | Done |

## Judge

| Agent | Checks | Passes when |
|---|---|---|
| `freshness-judge` | Every derived artifact in scope anchored to the current hash; no `uncovered` the layer requires; Help Center copy from the glossary; API examples match the contracts | Everything `fresh` |

## Keep in mind

- **The Help Center is generated once, here**, from the accepted spec.
- **A new article** is reviewed by a person the first time; changes to existing articles ship on their own when the judge passes ([`DEC-05`](../../decisions/DEC-05-help-review.md)).
- **Release Notes are not the history.** The history says what changed in the spec; the Release Notes, what changed for the user.
- **Turning a feature on for customers is outward-facing**: `accept` authorized it, and it follows the pipeline's rollout plan, never the agent's decision.

## Skills, agents and tools

| Kind | Name | For |
|---|---|---|
| Skill | `/publish` | The whole stage |
| Skill | `/publish-api` | The API Reference |
| Skill | `/publish-help` | The Help Center |
| Skill | `/publish-notes` | The Release Notes |
| Agent | `freshness-judge` | The judge |
| MCP | `get_change` · `changes_since` · `list_stale` · the tracker's MCP | Apply, generate and close |

## Per track

| Track | What changes |
|---|---|
| `full` · `story` | Everything, on the scope |
| `fix` | Only re-anchors, and Release Notes if the user notices |
| `chore` | Does not run |

## Sources

Living Documentation · docs as code · Diátaxis · OpenAPI · Keep a Changelog · OpenSpec (archive) ·
Reclee Spec (closing phase).
