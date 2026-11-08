---
title: Trace Link
description: ENT-22 · One link in a requirement's chain, with its current state
owner: Kevin
version: "1.0"
updated: "2026-11-08"
---

# ENT-22 · Trace Link

Every requirement has a **chain**: the things that exist because of it, from the story that asked
for it to the metric that measures it. A trace link is **one link of that chain**, with its state
now. Together they answer *where is this requirement, and what is holding it*.

| Field | What it holds |
|---|---|
| `id` | The spec ID it hangs from: `FR-JOB-03` |
| `kind` | One of the kinds below |
| `ref` | Where it lives: an issue key, a PR URL, a file, an environment |
| `state` | Its current state, from the kind's list |
| `anchor` | The hash it was produced against, when it is a derived artifact ([`ENT-14`](anchor.md)) |
| `updated` | When its state last changed |

## The kinds of link

| Kind | Is | States | Source |
|---|---|---|---|
| `spec` | The requirement itself | `draft` · `designing` · `ready` · `building` · `in_review` · `live` · `changing` · `deprecated` | The spec ([`ENT-03`](requirement.md#lifecycle)) |
| `origin` | The story or issue that asked for it | `candidate` · `accepted` · `discarded` | The tracker |
| `change` | The change in flight, and its deltas | `open` · `accepted` · `archived` | `changes/` |
| `design` | A mockup | `fresh` · `stale` · `uncovered` | The spec repo or a design tool |
| `task` | A task from `plan` | `todo` · `in_progress` · `in_review` · `done` · `canceled` | The tracker |
| `code` | A pull request, and the files it anchors | `open` · `merged` · `closed` | The code host |
| `test` | A criterion's test | `missing` · `red` · `green` | CI |
| `deploy` | Where it runs | `preview` · `staging` · `production` | The deploy provider |
| `flag` | Whether customers see it | `off` · `partial` · `on` | The feature-flag provider |
| `docs` | A help article, the API Reference, a release note | `fresh` · `stale` · `uncovered` | The help and docs repos |
| `metric` | The PRD's success metric | `pending` · `met` · `missed` · `no_data` | Analytics |

## Rolling up

A requirement's **position** is the furthest link in order that is done, and the **blocker** is the
first one that is not. A PRD, a module and a product show the least advanced of what they contain
([`ENT-21`](module.md#status)).

The way back: an `origin` in `candidate` that touches a `live` requirement marks its PRD as **having
a pending change** until a person accepts or discards it. How links are gathered and kept is in
[`ARCH-05`](../architecture/traceability.md).
