---
title: The problem
description: BIZ-01 · What problem OpenPEDD solves, how, and what it does not solve
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

# BIZ-01 · The problem

**Product Engineering Driven Development** starts from one premise: the spec is the single source
of truth, and everything derived from it knows whether it is still up to date. It is for whoever
defines the product (the product engineer, the product owner) and covers the whole cycle, from the
idea to maintenance, in one place.

## The problems

| # | Problem | What happens today |
|---|---|---|
| P-01 | **The product definition is scattered** | It lives in docs, trackers, chats and someone's head. Every agent rebuilds it from scratch, differently each time |
| P-02 | **The spec is written and abandoned** | It serves the first release. Then the code changes, the spec does not, and in three months nobody trusts it |
| P-03 | **Derived artifacts go stale silently** | The help describes a screen that is gone; the API Reference, a renamed field; a task asks for what the spec changed. Nobody knows what is stale until someone complains |
| P-04 | **The AI decides product without anyone noticing** | In the plan or in the code, the agent fills what the spec does not say. It works, it passes the tests, and nobody decided it |
| P-05 | **The agent judges itself** | *"Everything works."* The reasoning that made the mistake approves it |
| P-06 | **Context explodes** | The agent reads the whole repo or a 30-page spec. It spends tokens and quality drops |
| P-07 | **The person who defines is in everything or in nothing** | Either they review every PR and become the bottleneck, or they review nothing and find out in production |
| P-08 | **Design and architecture never return to the spec** | The mockup finds a missing step; the architecture, a limit it cannot meet. It is fixed there, and the spec keeps saying the old thing |
| P-09 | **Small work has no path** | For a one-day story the full process is too much, so it is skipped, and what is skipped is what goes stale |
| P-10 | **There is no maintenance** | Methods stop at the release. After it: bugs that are gaps, metrics nobody checks, decisions argued again |
| P-11 | **There is no traceability** | Nobody knows which story changed which requirement, when, or why |
| P-12 | **The same thing is defined twice** | Two PRDs define the same entity differently, both well written, and the code implements one |

## How OpenPEDD solves them

| # | With |
|---|---|
| P-01 | One spec, in its own repo or folder, read through the MCP; `map` builds it when the product already exists |
| P-02 | Only `specify` writes the spec; everything else proposes deltas through a gate ([`RULE-10`](../rules/cycle.md#rule-10)) |
| P-03 | Anchors with the hash of each ID ([`ENT-14`](../domain/anchor.md)); `publish` generates docs from the accepted spec |
| P-04 | Every gap becomes an `assumption` that reaches the `Acceptance Report` |
| P-05 | The judge is another session and another model, and tests are written first, in `plan` |
| P-06 | A `Context Pack` per task, 12,000 tokens target, and budgets per document |
| P-07 | Zero to four gates per change, by track, and one review of the whole delegated block |
| P-08 | A `Delta Report` and a merge gate at the close of each |
| P-09 | Tracks: the same cycle, with the stages that have nothing to do skipped by impact |
| P-10 | `measure` checks the metric on its date; a `fix` the spec did not cover becomes a `story` |
| P-11 | Every history entry carries ID, version, date, change, story and stage |
| P-12 | One thing, one place, with IDs never reused ([`RULE-01`](../rules/writing.md#rule-01)) |

## What it does not solve

| What | Why |
|---|---|
| Discovering what product to build | It does not replace user research. It starts when someone knows what they want to test |
| Making the definition good | It shows what is missing (cold read, assumptions); the judgment is the person's |
| A one-day throwaway project | For something that will be thrown away, the cycle is too much |
