---
title: publish
description: Stage 8 · Closes the loop — prepares what people read when a change is accepted, and publishes it at launch
owner: Kevin
version: "1.2"
updated: "2026-11-19"
status: draft
---

# Stage 8 · `publish`

**Mode:** delegated · **Gate:** none

## What it is

Where **the loop closes**, in two moments ([`ARCH-08`](../../foundations/architecture/release.md)). When
a change is accepted, it enters the spec and what people read is **prepared**. At launch, when the
feature actually reaches customers, it is **published**. When it ends, **everything in scope is
`fresh`**. Only what the project declares in `workspace.yaml` is generated: help, API Reference, MCP,
Walkthroughs, Release Notes.

## Inputs

| What | From |
|---|---|
| The deltas marked `keep` | `accept` |
| The whole change | `changes/<CHG>/` |

## Context pack

Per artifact: for the API Reference, the contracts in scope; for the Help Center, the `FR`s, mockups,
`Glossary` and `Voice & Tone`; for the Release Notes, the change summary; for a Walkthrough, the draft from `verify`. Budget: **12,000 tokens per
artifact**.

## Procedure

**Prepare**, at `acceptance-merge`, on the base:

1. **Applies the deltas to the spec**, in the present tense, as if it had always said so. One history entry per version, with change, story and stage ([`ENT-17`](../../foundations/domain/history-entry.md)).
2. **Recomputes the hashes** of the IDs touched.
3. **API Reference**: generated from the contracts (OpenAPI and the MCP schema). Mechanical: no writing.
4. **Help Center**: writes or updates the articles for the `FR`s the user sees, with the right Diátaxis type (how-to for a task, reference for a screen), glossary copy and the screenshots from `verify`. Each article carries its `sources`: the IDs and their hashes.
5. **Walkthrough**: finishes the draft from `verify` ([`ARCH-07`](../../foundations/architecture/walkthroughs.md)).
6. **Release Notes**: one entry for the product's users, about what changed for them, with its links: article, Walkthrough, requests it solves; and, internally, the change, its PRs and its deploy.
7. **Re-anchors** every derived artifact in scope. What people read stays `status: prepared`, unlisted, one per locale. Requirements move to `accepted`.

**Launch**, on a person's action (`pedd launch`, or the Cloud), on the `public` environment with a successful deploy:

8. **Turns the feature on** per the rollout plan: the flag, if it has one ([`ARCH-09`](../../foundations/architecture/flags.md)).
9. **Publishes** what was prepared, at the moment the flag says. A partial rollout publishes nothing.
10. **Closes**: PRD and requirements to `live`, the task to done in the tracker, the change to `changes/archive/`. A failed deploy holds everything.

## Outputs

| What | Status |
|---|---|
| The updated spec, with its history | New hashes |
| API Reference | `fresh` |
| Help Center | `fresh` |
| Walkthrough | `fresh` |
| Release Notes | Published at launch |
| Every derived artifact in scope | `fresh` |
| PRD and requirements | `live` |
| The tracker task | Done |

## Judge

| Agent | Checks | Passes when |
|---|---|---|
| `freshness-judge` | Every derived artifact in scope anchored to the current hash; no `uncovered` the layer requires; Help Center copy from the glossary; API examples match the contracts; every `screen` and `target` of a Walkthrough exists; every Release Note has its links | Everything `fresh` |

## Keep in mind

- **The Help Center is generated once, here**, from the accepted spec.
- **Nothing is announced before it reaches someone**: the base can hold accepted work for days ([`DEC-15`](../../decisions/DEC-15-launch.md)).
- **A new article** is reviewed by a person the first time; changes to existing articles ship on their own when the judge passes ([`DEC-05`](../../decisions/DEC-05-help-review.md)).
- **Release Notes are not the history.** The history says what changed in the spec; the Release Notes, what changed for the user.
- **Turning a feature on for customers is outward-facing**: `accept` authorized it, and it follows the pipeline's rollout plan, never the agent's decision.

## Skills, agents and tools

| Kind | Name | For | Reads | Leaves |
|---|---|---|---|---|
| Skill | `/publish` | The whole stage | The `keep` deltas; the change | The spec updated, with its history; everything people read, prepared; at launch, published |
| Skill | `/publish-api` | The API Reference | The contracts | The API Reference, generated |
| Skill | `/publish-help` | The Help Center | The `FR`s the user sees; the glossary; `verify`'s screenshots | The Help Center articles, each with its `sources` |
| Skill | `/publish-notes` | The Release Notes | The change, its PRs and its deploy | One Release Notes entry, with its links |
| Skill | `/publish-walkthrough` | The Walkthroughs | The Walkthrough draft from `verify` | The Walkthrough, with its `sources` |
| CLI | `pedd launch` | The launch, by hand. In the Cloud, the Launch section | — | — |
| Agent | `freshness-judge` | The judge | — | — |
| MCP | `get_change` · `changes_since` · `list_stale` · the tracker's MCP | Apply, generate and close | — | — |

## Per track

| Track | What changes |
|---|---|
| `full` · `story` | Everything, on the scope |
| `fix` · `hotfix` | Only re-anchors, and Release Notes if the user notices |
| `chore` | Does not run |

## Sources

Living Documentation · docs as code · Diátaxis · OpenAPI · Keep a Changelog · OpenSpec (archive) ·
Reclee Spec (closing phase).
