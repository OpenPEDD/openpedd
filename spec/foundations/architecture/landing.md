---
title: Landing parallel changes
description: ARCH-16 · Seeing early which changes in flight overlap, keeping them close to the base, and the order they land in
owner: Kevin
version: "1.0"
updated: "2026-11-17"
---

# ARCH-16 · Landing parallel changes

With delegated stages, many change branches finish within hours of each other, and each one met the
base only when its PR opened ([`ARCH-06`](branches.md#the-pull-request-to-the-base)). The conflicts
then arrive all at once, at the end, far from whoever caused them. **Landing works at three moments:
seeing the overlap early, staying close to the base, and landing in an order the tool computes.**

## Before: the overlap of changes in flight

`pedd overlap` reads every change in flight and its **footprint**:

| Footprint | From |
|---|---|
| The IDs it touches | The spec: the PRD delta and its deltas |
| The files it will touch | `plan`'s tasks, then the branch's diff |
| Its migrations | The branch |
| Shared files: lockfile, translations, generated code, route or schema registries | The branch |

Every pair of changes that share part of their footprint is listed, with what they share. It runs by
itself at `spec-approval` and when `plan` closes.

| Overlap | What happens |
|---|---|
| **The same ID** | The later change is `blocked by` the earlier one in the tracker. A spec clash is decided by a person, at `spec-approval` ([`RULE-09`](../rules/writing.md#rule-09)), never by a merge |
| Many of the same files | `plan` proposes one of: the later change waits; or a `chore` with the shared part lands first and both build on it |
| A few files, or only shared files | Nothing; they are solved at landing |

## During: close to the base

**When a change lands, `pedd sync` merges the base into every change in flight that overlaps it**,
and runs the tests `pedd impact --tests` selects ([`ARCH-11`](pipeline.md#selecting-by-the-spec)).
A conflict found there is solved on that change's branch, by its own agent, while the work is fresh.
A change that overlaps nothing is synced when its PR opens, as before.

## At the end: the landing order

When several changes are accepted or ready together, `pedd land` orders them. **The order is computed
by the tool, not a model** ([`RULE-24`](../rules/cycle.md#rule-24)), first criterion first:

| # | Criterion | Why |
|---|---|---|
| 1 | `hotfix` | Production is waiting |
| 2 | Others depend on it: `depends_on`, or `blocks` in the tracker | Its dependents are rebuilt on it once, not twice |
| 3 | It has a migration | Migrations apply in order; the others renumber theirs after it |
| 4 | Among overlapping changes, **the largest footprint** | Rebasing a small change onto a large one is cheaper than the reverse |
| 5 | Accepted earliest | Lead time ([process metrics](../../modules/cycle/prd.md#process-metrics)) |

`pedd land` shows the order with the criterion that placed each change; the person may reorder it
(`pedd land --order a,b,c`). It then lands **one change at a time**:

1. Merges the base into the change branch and solves the conflicts there (below).
2. Runs the pipeline of the PR to the base ([`ARCH-11`](pipeline.md)), through the merge queue if the project has one.
3. Merges it.
4. Runs `pedd sync` on the changes still waiting, and goes back to 1 with the next.

A change whose step 1 or 2 goes red leaves the queue, and the next one lands. **Nothing waits behind
a red change.**

## Solving conflicts

The change that lands later solves them, on its branch, never on the base.

| Conflict in | Solved by |
|---|---|
| The spec: the same ID | A person, at the merge gate ([`ENT-09`](../domain/merge-gate.md)). The later change's delta is proposed again over the text that landed |
| Code both changes touched | The later change's agent, with **both changes' packs**: the result passes both changes' tests. The landed change's tests are locked, as in `build` |
| Migrations | Renumbered after the landed ones. A landed migration is never edited |
| Lockfile, generated code, indexes | Regenerated, never merged by hand |
| Translations and other shared files | Key by key ([`ARCH-04`](agents.md)) |

**Acceptance stands if the resolution was mechanical**: no ID touched, the same tests green. If the
behavior changed, the person accepts again on the new preview ([accept](../../modules/accept/prd.md)).

## Seeing it

`pedd status --landing`: the changes in flight, how far behind the base each is, the overlapping
pairs and the landing order.
