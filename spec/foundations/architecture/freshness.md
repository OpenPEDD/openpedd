---
title: Freshness
description: ARCH-02 · The index, the hash of each ID and where anchors are written
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

# ARCH-02 · Freshness

Freshness ([`ENT-14`](../domain/anchor.md#freshness)) is computed from two things: the hash of each ID
in the spec, and the anchors each derived artifact carries.

## The index

`pedd index` walks the spec, extracts every block with an ID and writes `.pedd/spec-graph.json`.
It is generated and never edited.

```json
{
  "FR-JOB-03": {
    "hash": "3fa9c1",
    "doc": "modules/job-posts/prd.md",
    "refs": ["ENT-17", "RULE-05"],
    "criteria": ["FR-JOB-03.AC1", "FR-JOB-03.AC2"],
    "anchors": {
      "code":   [{ "repo": "scout", "path": "app/jobs/create.ts", "at": "3fa9c1" }],
      "design": [{ "path": "designs/job-create.html", "at": "1b22e0" }],
      "help":   [{ "path": "articles/create-job.mdx", "at": "3fa9c1" }],
      "tracker":[{ "issue": "REC-412", "at": "3fa9c1" }],
      "tests":  [{ "path": "e2e/job-create.spec.ts", "ac": "FR-JOB-03.AC1", "at": "3fa9c1" }]
    }
  }
}
```

**The hash is semantic**: it is computed over the normalized content of the block, so a style edit
does not invalidate anything and a changed requirement does. What exactly is normalized is open
(`Q-13`).

**Propagation.** A change to `ENT-17` makes stale only what anchors `ENT-17`, or what references it
within the configured depth, not everything that cites the domain.

## Where anchors are written

| Derived artifact | How it is anchored |
|---|---|
| Code | A comment `// @spec FR-JOB-03@3fa9c1`, or `spec.lock` in the code repo (file → IDs) to keep the code clean |
| Tests | The criterion ID in the test name: `test("FR-JOB-03.AC1 …")` |
| Mockup | Its frontmatter, or a frame property in the design tool (adapter) |
| Help article | `sources: [FR-JOB-03@3fa9c1]` in its frontmatter |
| API Reference | Written by the generator from the contracts |
| Tracker issue | An attachment or field: `FR-JOB-03@3fa9c1` |
| Pull request | The **Spec** section: IDs covered, deviations, assumptions |

**The tool writes the anchor, not the person**: the stage that produces the artifact leaves it with
the hash of the moment ([`RULE-17`](../rules/cycle.md#rule-17)). The exact syntax is open (`Q-12`).
