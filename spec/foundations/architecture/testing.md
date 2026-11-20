---
title: Testing
description: ARCH-10 · What is tested at which level, and how permissions, contracts, languages, AI features and quality are proved
owner: Kevin
version: "1.4"
updated: "2026-11-20"
---

# ARCH-10 · Testing

**Each criterion is tested at the cheapest level that proves it.** Every level is a capability the
project declares, with whichever tool it uses.

| Level | Proves | Example |
|---|---|---|
| `unit` | A rule, alone | The fee is computed correctly |
| `integration` | Pieces together, with a real database | The job post is saved with its stages |
| `contract` | An action's input, output, errors and roles | A viewer calling `create_job_post` gets `FORBIDDEN` |
| `e2e` | A person's path, in a browser | Creating a job post from the form |
| `eval` | Behavior that varies from run to run | The assistant picks the right tool |

An `AC` declares its `level`, set by `plan`. `e2e` is for the main flow of each PRD and for what only
shows across layers. `verify` captures a screenshot only of criteria with a screen.

## Permissions

`specify` writes a **matrix of role × action**. `plan` turns each cell into a red test, allowed and
denied. A denial is proved as carefully as a permission.

| What | How | Declared by |
|---|---|---|
| Which role does what | A `contract` test per cell | `specify` |
| Isolation between accounts | A database test per policy, as one account reading another | `architect` |
| No table without a policy | A check over the schema | `architect` |
| Going around the application | The same denial, straight against the database | `architect` |
| The no-permission screen | `e2e`, one per role | `design` |
| Background jobs | `integration`: they run outside a request | `plan` |

Row-level security is a category: a project that only enforces roles in the application skips the
database rows.

**The pipeline fails** on a contract without `roles` and on a new table without a policy.

## Contracts

One test per **contract × error × role**: the contract already lists its errors and roles
([`ENT-05`](../domain/contract.md)). A public API also generates cases from its schema. The action is
tested once; each door (screen, API, MCP) proves only that it reaches it.

## Languages

Every product has i18n from its first change, with English as the base ([`DEC-21`](../../decisions/DEC-21-i18n-from-day-one.md)). These checks run with one locale or many:

| Stage | Check |
|---|---|
| `design` | A pseudo-locale pass: long text and accents, to see what breaks and what was written in code |
| `plan` | Missing, unused or malformed keys fail the pipeline |
| `verify` | Renders each locale and fails on a raw key: the fallback hides what is missing |
| `publish` | Help, Walkthrough and Release Note per locale |

## Features with AI

An `AC` over a model cannot expect exact output. It is an `eval`:

| Rule | Why |
|---|---|
| A **golden set** in the `Test Data`, oversampling edge cases and past failures | Each production failure joins it, so it does not come back |
| Deterministic checks first: schema, tool called, must contain | They do not vary |
| A model as judge only for what is subjective, and validated against a person first | An unvalidated judge measures its own bias |
| A threshold **per metric, over the whole set**, in `Quality Standards` | One case changing wording is noise |
| Runs when a prompt, a tool or the model changes, and nightly | A provider's model can change with no commit |

## Quality, measured

| What | How | Note |
|---|---|---|
| Accessibility | An automated scan inside `e2e`, failing on new violations | It finds about half of real issues; the judge and the person cover the rest |
| Performance | The `NFR`s as budgets, in CI | Numbers from `Quality Standards` |
| Visual changes | Screenshot comparison, nightly | Optional |
| Privacy | Deleting an account removes what the `Privacy` foundation lists | An `integration` test |

## Covering what exists [#covering-what-exists]

A test written for behavior already in production passes from the start, so seeing it fail first
proves nothing. On the `cover` track, a test counts once **mutation over the code it covers turns it
red**: the code is broken on purpose, and the test must catch it. A test that stays green with the code
broken covers nothing, and is rewritten.

## Keeping the suite honest

| Rule | Why |
|---|---|
| A test that passes only on retry fails, or is quarantined with a task and a date | A suite people rerun until green proves nothing |
| Mutation score, coverage and baselines only move one way | What is won is not lost by accident |
| A mutant marked equivalent carries its reason, and a judge confirms it | Marking is otherwise a way to raise the score |
| The mutation score counts only lines some test covers, at any level | Code proved only by `integration` is not a surviving mutant |
| Code that depends on the time takes the clock as an input; its tests cover a daylight-saving change and another time zone | A clock read inside the code cannot be tested, and the lost hour shows only in production |
| An operation with more than one write has a test that cuts it in the middle | A crash between two writes charges twice or loses work |
| What a tool can decide, a tool decides, not a reviewer | What is done by hand gets skipped |
| Agents running `integration` at the same time each get their own database, or wait for a lock | Two runs on one database fail each other, and a false red costs a rerun |
