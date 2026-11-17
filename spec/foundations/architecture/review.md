---
title: Reviewing a change
description: ARCH-13 · The layers a change goes through before it merges, who decides what blocks, the judges in CI and the person's last step
owner: Kevin
version: "1.0"
updated: "2026-11-13"
---

# ARCH-13 · Reviewing a change

**The models judge; the tool decides; a person has the last word.** Each layer catches what the one
before cannot, and nothing is checked twice: what a machine checks, nobody reads by hand.

| # | Layer | Catches | Who |
|---|---|---|---|
| 1 | **Gates** | What a command can prove: format, lint with no warnings, types, tests, coverage of the patch, mutation on the changed lines, the build, the database tests when the schema changes ([`ARCH-11`](pipeline.md)) | The pipeline |
| 2 | **Project rules as lint** | Every rule of `Architecture Rules` a linter can check: layer direction, one component per file, no raw strings, no `console.log` | The pipeline |
| 3 | **Hunters** | What reading takes: one `verify-judge` session per lens ([`ARCH-14`](review-lenses.md)), in parallel, reading only | Judges |
| 4 | **Refuter** | Findings that are wrong: `confirm-judge` tries to prove each `high` finding false from the code and the spec | A judge |
| 5 | **The decision** | What blocks, by a fixed rule ([below](#what-blocks)) | `pedd` |
| 6 | **The person** | What nobody wrote down: reads the diff, starting from the review signals, and approves | A person |

Layers 1 and 2 run locally with the same command as CI ([`ARCH-11`](pipeline.md#what-keeps-it-fast)).

## What blocks [#what-blocks]

Each finding carries a severity (`high`, `medium`, `low`), its lens and the line it points at.
Whether it blocks is never the judge's call:

| Finding | Is |
|---|---|
| `high`, survived the refuter, on a line the change touched | **Blocking**: back to `build` |
| `high` on a line the change did not touch | Advisory, and a `Q` for the area |
| `medium` · `low` | Advisory: in the open findings |

The threshold is `review.blocking` in `workspace.yaml` (`high` by default), set only by the team
([personal settings](../../modules/workspace/prd.md#personal-settings)).

## The person's last step [#the-persons-last-step]

| Rule | Why |
|---|---|
| **The review signals come first**: one comment on the PR lists what changed in the rules (lint config, CI, permission rules, `AGENTS.md`), tests that were weakened or deleted, gates skipped by a label (`vendor-update`, `coverage-drop`), dependencies, migrations, and size over the line budget | A person reading 2,000 lines starts where a mistake costs most |
| **A person approves with `/approve`**, only one on the approvers list, which lives in the repo and changes by PR | A green pipeline is not a decision |
| **Every new push asks to approve again** | What was approved is the commit that was read |
| **An agent never approves**: its settings deny the command | An agent approving its own change is the problem OpenPEDD exists for (`P-05`) |

Every PR to the base needs it. In the full cycle it is the approval of `acceptance-merge`; on a
`fix`, `chore` or `hotfix` it is the person in the loop.

## The judges in CI [#the-judges-in-ci]

The judges are part of the method, and run free in the project's own CI
([`DEC-19`](../../decisions/DEC-19-judges-in-ci.md)), with the headless form of
[`ARCH-04`](agents.md#how-judges-run):

| Rule | Why |
|---|---|
| The subscription token (`claude setup-token`) or an API key goes in a CI secret | The judges run on what the team already pays |
| One required check, red only with blocking findings | The branch rule keeps a red out, not a person |
| **One comment per PR, edited in place** | A comment per run buries the thread |
| `/pedd recheck` reruns it; `/pedd override` lets **one head commit** through, only from an approver, recorded in the trace | The override does not carry over to the next push |
| A new push cancels the run in progress | Only the last commit counts |
| A PR from a fork gets no secrets: it runs when an approver comments `/pedd recheck` | A fork could read the token |
| Full history checked out (`fetch-depth: 0`) | Without the base, the review loses context without saying so |

## How the rules grow [#how-the-rules-grow]

**Every rule comes from a correction.** A finding confirmed in two changes becomes a rule: a lint
where a linter can see it, a lens item where not, each naming the change it came from. A rule nobody
can trace to a correction is a candidate to delete. How precise each judge is, is measured in
[`ARCH-04`](agents.md#measuring-judges).
