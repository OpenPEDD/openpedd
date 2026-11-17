---
title: Pipeline
description: ARCH-11 · What runs at each moment so the pipeline stays fast without losing quality, and what each change costs
owner: Kevin
version: "1.2"
updated: "2026-11-17"
---

# ARCH-11 · Pipeline

**Speed comes from running less at the early moments, never from running less overall.** Each moment
has its own set, and the last ones run everything.

| Moment | Runs | Selects tests? |
|---|---|---|
| Agent working | Lint, types, tests of what was touched | Yes |
| Task PR | Affected `unit`, `integration` and `contract`; the task's `e2e`; mutation on the changed lines | Yes |
| PR to the base | Everything of the change, `e2e` in parallel shards; the permission matrix; each locale | Only by change |
| Promotion to the `public` environment | **The whole suite** | **Never** |
| Nightly | The whole suite, full mutation, every locale, accessibility, visual, `eval` | Never |

**Selecting is never the only net.** The full runs exist to catch what the selection missed, and a
miss is a bug in the selection. Having no changed test file is not a reason to skip a test.

## Selecting by the spec

Other tools select from the import graph. OpenPEDD also knows **which requirements a change touches**:

```
the change's IDs → their criteria → the tests named after them
```

`pedd impact --tests` returns the union of both. The spec catches what imports cannot see (a changed
rule read through configuration); imports catch what the spec does not name (a shared helper).

## What keeps it fast

| Technique | Effect |
|---|---|
| Independent jobs, in parallel | The time of the slowest, not the sum |
| Skipping heavy jobs when only docs changed | No build for a typo. On a promotion, everything always runs |
| A new push cancels the old run on a PR, never on the production branch | A canceled run there does not deploy its migrations |
| Caching dependencies and service images | Starting the database stack is usually the slowest step |
| The cheapest level per criterion | Fewer browsers ([`ARCH-10`](testing.md)) |
| One command that runs the same gates locally | A red in CI reproduces on the machine |

## Merge queue

Each PR is validated against the latest base plus what is ahead of it, so two PRs that pass alone
cannot break it together. Optional: worth it when several PRs reach the base each day. Workflows must
also run on the queue's event, and a required check skipped by a path filter stays pending, so
skipping is decided inside a job. The order changes enter it in is [`ARCH-16`](landing.md#at-the-end-the-landing-order).

## Cost per change

Agents report what they spend. With the telemetry of each agent tagged by repo, branch and step, the cost of
a change is the sum over its branches: `pedd status --cost`.

| Rule | Why |
|---|---|
| A `budget` per change is optional, and it warns; it never stops the work | Stopping halfway costs more |
| It is an estimate | Billing comes from the provider |
| A task that cost far more than its size says is looked at | It usually means a bad cut or a bad pack |
