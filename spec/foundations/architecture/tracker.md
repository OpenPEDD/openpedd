---
title: The tracker
description: ARCH-15 · The issues of a change, its tasks, who creates them without duplicates, what moves their status, and how the tracker is kept clean
owner: Kevin
version: "1.0"
updated: "2026-11-17"
---

# ARCH-15 · The tracker

The tracker mirrors the change ([`ARCH-06`](branches.md)): **one parent issue, one sub-issue per
stage that has its own branch and gate, and the tasks as a checklist**. It holds who does what and
when. What the change is lives in the spec, and what is done lives in git: the tracker reads both
and never repeats them ([`MKT-05`](../market/trackers.md)).

## The issues

| Issue | Is | Closes |
|---|---|---|
| **Parent**: the change | *Automations*, or the user story | When the change is on for its whole audience ([`ARCH-08`](release.md)) |
| Sub-issue: architecture | The decisions of the change | At `architecture-merge` |
| Sub-issue: design and mockup | The mockup of every screen and state in scope | At `design-merge` |
| Sub-issue: implementation | `plan`, `build` and `verify`, with the tasks as a checklist. **Blocked by** architecture and design | At `acceptance-merge` |

**One sub-issue per stage with a branch and a gate, no more.** `plan` has no gate of its own and
ends before the first task: it is the first item of the implementation checklist. The launch is the
parent's last status, between `acceptance-merge` and the whole audience. A full change adds four
issues, however many tasks it has; a `story` touching only `FR` adds two; a `fix` or a `chore`,
one ([tracks](../../modules/tracks/prd.md#which-stages-each-change-runs)). Architecture and design
run at the same time and do not block each other.

The sub-issues are created **at `spec-approval`, unassigned, in the backlog and in no cycle**: a spec
that is dropped would leave them orphaned, and assigning is a person's call when planning.

## Created once, by one hand

| Rule | Why |
|---|---|
| **Only `specify` creates issues**, at `spec-approval`. No other stage, skill or session does | Two hands creating the same work is where the duplicates come from |
| **The parent is the issue that already exists**: the story, or the roadmap item the change comes from. A new parent only when there is none | A change created next to its own idea leaves two issues for one thing |
| **Every issue carries its anchor**: a `Spec: CHG-021` line in the description, with the PRD path | It is the key the tracker is searched by; a search by words finds what sounds alike, not what is the same |
| **Creating is idempotent**: before creating, `specify` looks up the anchor and updates what it finds | Running approval twice changes nothing |

## The tasks

**Each task is one item of a checklist in the implementation sub-issue, not an issue.** The item is
one line: the task's name, its IDs and what blocks it. Its pack is not copied there: `build` asks
`get_context_for` for it by the task ([`ENT-13`](../domain/context-pack.md)). `plan` writes the
list; `build` writes each session's link next to its item and ticks it when the task's PR merges
into the change branch. One issue per task would put ten or fifteen issues that live for a day into
every change, in trackers with a cap on active issues (Linear's is 250).

Below the tasks, the same sub-issue carries **the change's definition of done**: one line per
required check of the `Delivery Pipeline` ([`ARCH-11`](pipeline.md)), from a template in
`workspace.yaml`. **The tool ticks each line from the CI result**, with the link to the run; an agent
never ticks it. A check that did not run stays unticked and says so ([`RULE-22`](../rules/cycle.md#rule-22)).

## What moves a status

**A status is moved by an event, never by an agent remembering to.** Each stage's work is a pull
request, and the tracker's git integration moves the issue the PR names:

| Event | The sub-issue goes to |
|---|---|
| The stage's PR opens, as a draft | In progress |
| A review is requested: the gate | In review |
| The PR merges, at the gate | Done |

| Issue | Its PR names it with |
|---|---|
| Architecture · design | A closing word (`Closes RECLEE-1231`) in the stage branch's PR: its merge is the gate |
| Implementation | A non-closing word (`Part of RECLEE-1230`) in every task PR: the first one starts it and no merge closes it; the PR to the base, at `acceptance-merge`, closes it |
| Parent | Nothing: the tool moves it, to in progress with the first sub-issue and to done when the launch reaches everyone |

The task branch carries no issue ID, so no task PR closes the sub-issue by its name. Each status
change adds its stage's start and end to the trace ([`ENT-23`](../domain/trace-event.md#steps)).

## Kept clean

`/tracker-tidy` compares the tracker with the spec and the roadmap, **reads only, and proposes**:

1. For each roadmap item and each `live` or in-progress change, it gathers the open issues that point at it: by anchor first, by title only to propose an anchor.
2. Where there is more than one, it proposes one to keep (the most advanced) and the rest as **duplicates of it**: the tracker's own relation, which closes them and links back.
3. An issue with no anchor and no item is listed apart: a person decides whether it is a roadmap item, a change, or neither.
4. Nothing is changed until the person approves the list.

It runs once when a product adopts the framework, and on each `spec-approval` over the change's scope.

## Configuration

```yaml
# workspace.yaml
tracker:
  kind: linear
  statuses:                    # the team's own names for each event above
    started: In Progress
    review: Pending approval
    done: Done
    launching: Release         # the parent, between acceptance-merge and the whole audience
  done_template: [lint, typecheck, unit, integration, e2e, stories, a11y]
```
