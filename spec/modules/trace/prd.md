---
title: trace
description: pedd trace and pedd status — where every requirement stands, built on demand
owner: Kevin
version: "1.1"
updated: "2026-11-10"
status: draft
---

# `trace`

## Frame

Whoever defines the product asks *where is this requirement, and what is holding it*, and gets the
answer from one command, without opening the tracker, the code host and the deploy dashboard. It
ends with the chain of each requirement on screen and recorded in `.pedd/trace/`.

## Out of scope

Watching continuously, the graph and the way back from the tracker: those are OpenPEDD Cloud
([`BIZ-04`](../../foundations/business/open-core.md)).

## Flows

| Flow | Is |
|---|---|
| `F1` · Trace one ID | `pedd trace FR-JOB-03`: its chain, link by link, with the blocker marked |
| `F2` · Status of the product | `pedd status`: product → modules → PRDs, each with its position and blocker, and how many modules are still `unmapped`; `--module`, `--prd` to narrow |
| `F3` · Stale and uncovered | `pedd status --stale`: every derived artifact that is `stale` or `uncovered` |
| Alternate · No tracker or code host token | Shows the links it can read, and marks the rest as unknown |
| Exception · ID not found | Says so, and suggests the closest IDs |

## Output of `pedd trace FR-JOB-03`

```
FR-JOB-03 · When a signed request exists, the system shall create the job post
  spec     live          v1.4
  origin   accepted      REC-412
  task     done          REC-430
  code     merged        Reclee-team/scout#311
  test     green         FR-JOB-03.AC1 · AC2
  deploy   production
  flag     on
  docs     stale         help/create-job.mdx   ← blocker
  metric   pending       review 2026-12-01
```

The requirement is shown as written, with its ID ([`RULE-20`](../../foundations/rules/cycle.md#rule-20)).
The links and their states are [`ENT-22`](../../foundations/domain/trace-link.md); the events,
[`ENT-23`](../../foundations/domain/trace-event.md); how they are gathered,
[`ARCH-05`](../../foundations/architecture/traceability.md).
