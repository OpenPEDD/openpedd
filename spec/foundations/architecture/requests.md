---
title: A request's branch
description: ARCH-21 · How a request's change branch is numbered, cut, edited once agreed, renamed at approval and dropped
owner: Kevin
version: "1.1"
updated: "2026-11-25"
---

# ARCH-21 · A request's branch [#a-request]

**When a client asks for something, the change branch is cut from the base at once**, holding only
`changes/<CHG>/definition.md`: what the client said, and the minimum map as it fills
([`ARCH-18`](definition.md)). It is the input of `specify`, which writes the PRD or the delta on the same
branch ([`DEC-23`](../../decisions/DEC-23-request-is-a-change.md)). `pedd branch` and OpenPEDD Cloud cut
it the same way.

## Numbering [#numbering]

A request gets its ID when its branch is cut, possibly with other requests open and nothing on the base yet.

| Step | Does |
|---|---|
| 1 | Takes the highest `CHG-nnn` found in the base's `changes/`, `changes/archive/` and `history.jsonl`, and in the `changes/` folder of every change branch on the remote |
| 2 | Adds one, and creates the branch with `changes/<CHG>/definition.md` |
| 3 | If the branch name exists, or the same folder shows up on another branch at the next read, it is a clash: the next number is tried, up to three times |

The count is `nextChangeId` of the reader ([`ARCH-20`](reader.md)). **A change is known by its folder
`changes/<CHG>/`**, so a rename loses nothing.

## The definition's status

The frontmatter of `definition.md` says where the request is ([`ARCH-18`](definition.md#the-file)):

| `status` | Is | The client can |
|---|---|---|
| `draft` | Being defined | Write to it; each change is a commit on the branch |
| `confirmed` | The client confirmed the summary | Still edit it; the builder sees the diff from what they last read |
| `agreed` | The builder took it, with who and when. **It enters the queue** ([`ARCH-17`](landing.md#the-queue)) | Propose an edit, through an edit branch (below) |

## An edit once agreed [#edit-branch]

An agreed definition is changed only through a pull request the builder merges.

| Branch | Cut from | Holds | Merges into |
|---|---|---|---|
| **Edit branch**: `edit/CHG-031-1` | The change branch | One edit to `definition.md` | The change branch, when the builder merges its PR |

`pedd branch` cuts it, numbering edits per change; the branch check allows it ([`ARCH-06`](branches.md#creating-a-branch)).
Until where an edit is accepted is the product's call: OpenPEDD Cloud closes it at `designed`.

## Renamed at approval

The branch is `feat/` while the track is unknown. **At `spec-approval`, `specify` renames it once**: the
prefix of the computed track, and, when the tracker links a branch by its issue key (Linear,
[`MKT-05`](../market/trackers.md)), the parent issue's key: `feat/rec-412-automations`. The rename is
the new name pushed and the old one deleted; the design, architecture and implementation branches are cut after it.

## Dropped

| The request is dropped | What happens |
|---|---|
| **Before `spec-approval`** | The branch is deleted and the change is `dropped`. No sub-issues, trace links or footprint exist yet, so there is nothing to sync or undo |
| **After `spec-approval`** | It is retired through a change: its requirements `REMOVED` by deltas, its sub-issues closed and its open tasks `canceled`; the change is `retired` ([`ENT-06`](../domain/change.md)), so the trace says why |

A branch holding only a definition has no footprint ([`ARCH-17`](landing.md)), so it is not synced and blocks nothing.

## Decisions

| # | Decision | Discarded, and why | Status | Date |
|---|---|---|---|---|
| 1 | The highest ID plus one, retried on a clash | One numberer (the Cloud): a repo without it could not number | accepted | 2026-11-20 |
| 2 | Known by its folder, not its branch name | By name: the rename at approval would lose it | accepted | 2026-11-20 |
| 3 | The key added by `specify` at `spec-approval` | At request time: an issue for work nobody agreed to, and only `specify` creates issues ([`ARCH-15`](tracker.md)) | accepted | 2026-11-20 |
| 4 | The request's third status is `agreed` | `accepted`: already the change's and the requirement's status at `accept` ([`DEC-27`](../../decisions/DEC-27-request-agreed.md)) | accepted | 2026-11-20 |
