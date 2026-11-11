---
title: Derived Artifact
description: ENT-15 · Anything produced from the spec
owner: Kevin
version: "1.2"
updated: "2026-11-11"
---

# ENT-15 · Derived Artifact

A derived artifact is anything produced **from** the spec. It never governs: when it disagrees with
the spec, the spec wins, and the disagreement is a delta or a bug.

| Artifact | Produced by | Anchored to | Lives in |
|---|---|---|---|
| Mockup | `design` | `FR` | The code repo, built on the design branch with the real components |
| Test | `plan` | `AC` · contract | The code repo |
| Code | `build` | `FR` · `NFR` | The code repo, with `spec.lock` |
| Task | `plan` | `FR` · `NFR` | The tracker, a sub-issue of the change |
| API Reference | `publish` | Contracts | `<project>-docs` |
| Help Center article | `publish` | `FR` | `<project>-help` |
| Walkthrough (optional) | `verify` drafts it, `publish` publishes it | `FR` | `<project>-help` |
| Release Notes entry | `publish` | The change | `<project>-help`, or an adapter |

Every derived artifact is in one [freshness](anchor.md#freshness) state: `fresh`, `stale` or
`uncovered`.
