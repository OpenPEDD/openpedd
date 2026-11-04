---
title: Anchor
description: ENT-14 · The mark that says which version of which ID a derived artifact came from
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

# ENT-14 · Anchor

An anchor ties a [`Derived Artifact`](derived-artifact.md) to the IDs it came from, at the hash they
had when it was produced: `FR-JOB-03@3fa9c1`. The stage that produces the artifact writes the anchor
([`RULE-17`](../rules/cycle.md#rule-17)); updating an artifact means anchoring it again.

| Field | What it holds |
|---|---|
| `id` | The spec ID: `FR-JOB-03` |
| `hash` | The hash of that ID when the artifact was produced |
| `artifact` | Where it lives: a file, an issue, an article, a frame |

## Freshness

| State | Means |
|---|---|
| `fresh` | The anchor's hash equals the ID's current hash |
| `stale` | The ID changed since the artifact was produced |
| `uncovered` | The ID has no artifact of a kind its layer requires |

**Freshness is computed, never remembered.** A change to an ID makes stale only what anchors that ID,
or what references it within the configured depth. How the hash is computed and where anchors are
written is in [`ARCH-02`](../architecture/freshness.md).
