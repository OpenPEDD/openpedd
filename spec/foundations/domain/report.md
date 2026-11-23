---
title: Report
description: ENT-08 · What a person reads to decide on deltas
owner: Kevin
version: "1.2"
updated: "2026-11-23"
---

# ENT-08 · Report

A report gathers deltas so that a person can decide on them **without reading code, pull requests or
conversations**. If deciding needs any of those, the report is badly built.

| Report | Written by | Holds | Read at | Budget |
|---|---|---|---|---|
| `Delta Report` | `architect` · `design`, on close | Each delta with its reason, alternative and impact | `architecture-merge` · `design-merge` | 2,000 tokens |
| `Acceptance Report` | `verify`, on close | **The whole delegated block**: each `FR` with its `AC`, test and screenshot; assumptions and deviations, heaviest first ([`ARCH-22`](../architecture/weight.md)); open findings; impact | `acceptance-merge` | 3,000 tokens, without screenshots |

A report decides, it does not narrate: each delta comes with what has to be decided, not the story of
how it got there. **Every item is shown as it is written, with its ID only in parentheses**
([`RULE-20`](../rules/cycle.md#rule-20)): the person reads the requirement, not `FR-JOB-03`. Reports
live in `changes/<CHG>/reports/`.
