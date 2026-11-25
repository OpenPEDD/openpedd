---
title: Pipeline
description: ARCH-11 · What runs at each moment so the pipeline stays fast without losing quality, what checks nothing went unrecorded, and what each change costs
owner: Kevin
version: "1.7"
updated: "2026-11-25"
---

# ARCH-11 · Pipeline

**Speed comes from running less at the early moments, never from running less overall.** Each moment
has its own set, and the last ones run everything.

| Moment | Runs | Selects tests? |
|---|---|---|
| Agent working | Lint, types, tests of what was touched | Yes |
| Task commit, before it is made | Affected `unit`, `integration` and `contract`; the task's `e2e`; by the one local command | Yes |
| Implementation PR, marked ready when `verify` passes | Affected `unit`, `integration` and `contract` of the whole change; its `e2e`; mutation on the changed lines; the CI judges ([`ARCH-13`](review.md#the-judges-in-ci)). A draft runs only the cheap checks | Only by change |
| PR to the base | Everything of the change, `e2e` in parallel shards; the permission matrix; each locale | Only by change |
| Merge to the base | The [code index](code-index.md), regenerated for what changed and committed | — |
| Promotion to the `public` environment | **The whole suite** | **Never** |
| Nightly | The whole suite, full mutation, every locale, accessibility, visual, `eval` | Never |

**Selecting is never the only net.** The full runs exist to catch what the selection missed, and a
miss is a bug in the selection. Having no changed test file is not a reason to skip a test.

## Nothing left unrecorded

Whether every decision was recorded, and every task closed, is **counted by the tool, not judged by a
model** ([`RULE-24`](../rules/cycle.md#rule-24)). Each check fails with what is missing and the command that fixes it.

| Moment | Checks | Fails when |
|---|---|---|
| Task commit | The commit's **Spec** section, in its body, against the task's deltas | An assumption or deviation listed has no delta, or a delta of the task is not listed; the section is missing, even with nothing to list |
| Implementation PR | The PR's **Spec** section against every delta of the change | The same, for every assumption and deviation of the change |
| Before `verify` builds the report | The implementation sub-issue's checklist ([`ARCH-15`](tracker.md#the-tasks)) | A task is unticked, or ticked without a commit on the implementation branch |
| The `Acceptance Report` | The report against the change's deltas | A delta, finding or improvement of the change is not in it, or is not in its place by weight ([`ARCH-23`](weight.md)) |
| `acceptance-merge` | Every delta of the change | One has no decision |

An assumption the code shows and no delta records is a `finding` of `verify`'s Spec lens, and counts
in the cycle metrics as **undeclared**, per task.

`pedd records <CHG> commit|pr|tasks|report|accept` runs each one, and exits non-zero with every problem and its fix:

| Moment | Reads |
|---|---|
| `commit` | A task commit's message, `--commit <ref>` (`HEAD` by default). Its **Spec** section is a `## Spec` heading, then one line each: `Covers:`, `Assumptions:` and `Deviations:`, with IDs or `none`. The task is `--task`, or the ID that opens the subject after its type (`feat(automations): 1.1 triggers` → `1.1`); a delta is the task's by its `task` field ([`ENT-07`](../domain/delta.md)) |
| `pr` | The PR's body, from the GitHub event or `--body`, with the same **Spec** section; every assumption and deviation of the change must be listed |
| `tasks` | The implementation sub-issue's checklist, given with `--checklist` while the tracker is not read: one `- [ ]` or `- [x]` line per task, a ticked one naming its commit (`a1b2c3d`, 7 to 40 hex). The commit counts when the implementation branch's history holds it (`--branch`, `HEAD` by default) |
| `report` | The `.md` in `changes/<CHG>/reports/` whose name says *acceptance*, or `--report`. Every delta's ID in it, and the assumptions and deviations in the order `pedd weigh` gives |
| `accept` | Each delta's `decision` |

The improvements the agents note have no record of their own yet, so the report check does not count them.

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
| One command that runs the same gates locally, runs them all even when one fails, and ends with the list of what is red | A red in CI reproduces on the machine, and one run shows every red, not the first |

## Merge queue

Each PR is validated against the latest base plus what is ahead of it, so two PRs that pass alone
cannot break it together. Optional: worth it when several PRs reach the base each day. Workflows must
also run on the queue's event, and a required check skipped by a path filter stays pending, so
skipping is decided inside a job. The order changes enter it in is [`ARCH-17`](landing.md#at-the-end-the-landing-order).

## Cost per change

Agents report what they spend. With the telemetry of each agent tagged by repo, branch and step, the cost of
a change is the sum over its branches: `pedd status --cost`.

| Rule | Why |
|---|---|
| A `budget` per change is optional, and it warns; it never stops the work | Stopping halfway costs more |
| It is an estimate | Billing comes from the provider |
| A task that cost far more than its size says is looked at | It usually means a bad cut or a bad pack |
