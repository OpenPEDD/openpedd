---
title: Asking and landing
description: MKT-07 · How tools ask the person what is missing, and how merge queues order and land parallel PRs. Surveyed 2026-11-17
owner: Kevin
version: "1.0"
updated: "2026-11-17"
---

# MKT-07 · Asking and landing

Surveyed on 2026-11-17 from what was already known of each tool's docs. **Not re-read for this
survey** ([`RULE-22`](../rules/cycle.md#rule-22)): each row is to be checked against the current docs,
code and issues before `ARCH-16` or `ARCH-17` is implemented.

## How tools ask the person

| Tool | Source | Does | Leaves out |
|---|---|---|---|
| Spec Kit `/clarify` | Docs, not re-read | Scans the spec by category of ambiguity and asks up to five questions, **one at a time**, each with a recommended option; writes answers into the spec | Only the spec, not the architecture or the design; the person waits per question |
| Kiro | Docs, not re-read | Writes requirements, design and tasks as three documents the person reviews in turn | No list of open questions: gaps surface while reading |
| BMAD Method | Docs, not re-read | Elicitation by persona (analyst, PM, architect), each asking in its turn | The questions of each persona come at its stage, not together |
| Claude Code plan mode | Product, not re-read | A plan the person approves before any edit, with questions asked in one dialog | Per session, not per change; no owner per answer |

Nobody found asks the questions of every stage ahead at once, with an owner for each answer.

## How merge queues land parallel PRs

| Tool | Source | Does | Leaves out |
|---|---|---|---|
| GitHub merge queue | Docs ([`MKT-03`](delivery.md)) | Validates each PR on the latest base plus those ahead of it; batches | Order is arrival order; no priority by dependency or overlap |
| Mergify | Docs, not re-read | Queue rules with priorities, batches, speculative checks, parallel queues by scope | Priority is set by labels a person writes |
| Graphite | Docs, not re-read | Stacked PRs, and a queue that lands a stack together | Built for stacks of one author, not independent changes |
| Aviator MergeQueue | Docs, not re-read | Parallel mode; affected targets, so unrelated PRs do not wait on each other | Overlap known only from build targets |
| Trunk Merge Queue | Docs, not re-read | Impacted targets per PR; independent PRs tested in parallel lanes | Same: from the build graph, not from the spec |
| bors-ng | Docs, not re-read | The not-rocket-science rule: the main branch is always green | Archived; sequential |

Every queue decides **when** a PR lands once it is ready. None warns at spec time that two changes will
touch the same thing, and none orders by what the changes mean (a dependency, a migration).
