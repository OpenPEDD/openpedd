---
title: Derived Artifact
description: ENT-15 · Anything produced from the spec
owner: Kevin
version: "1.4"
updated: "2026-11-20"
---

# ENT-15 · Derived Artifact

A derived artifact is anything produced **from** the spec. It never governs: when it disagrees with
the spec, the spec wins, and the disagreement is a delta or a bug.

| Artifact | Produced by | Anchored to | Lives in |
|---|---|---|---|
| Mockup | `design` | `FR` | The code repo, built on the design branch with the real components |
| Test | `plan` | `AC` · contract | The code repo |
| Code | `build` | `FR` · `NFR` | The code repo, with `spec.lock` |
| Task | `plan` | `FR` · `NFR` | The tracker, an item of the implementation sub-issue's checklist |
| API Reference | `publish` | Contracts | `apps/docs` ([`ARCH-03`](../architecture/workspace.md)) |
| Help Center article | `publish` | `FR` | `apps/help` |
| Walkthrough (optional) | `verify` drafts it, `publish` publishes it | `FR` | `apps/help` |
| Release Notes entry | `publish` | The change | `apps/help`, or an adapter |

Every derived artifact is in one [freshness](anchor.md#freshness) state: `fresh`, `stale` or
`uncovered`.
