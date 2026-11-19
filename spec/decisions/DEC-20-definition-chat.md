---
title: "DEC-20 · A client defines in a conversation that runs until the definition is complete"
description: The definition chat asks in conversation, against a list computed first, and stops on a counted completeness
owner: Kevin
version: "1.0"
updated: "2026-11-19"
---

# DEC-20 · A client defines in a conversation that runs until the definition is complete

**Date:** 2026-11-19

The person who defines a product is often a client who is not technical. For them, definition is a
**conversation**, not a sheet ([`MKT-08`](../foundations/market/guided-definition.md)):

| Part | Decided |
|---|---|
| The questions | **Computed first**, from the minimum the scope needs, by the same finders as the sweep ([`ARCH-16`](../foundations/architecture/sweep.md)). Asked in conversation: two or three per turn, on one topic, each with its options and a recommendation where there is one |
| Notes | Written as the client speaks, in the client's words |
| Completeness | Each required item is **answered**, **assumed** (the recommendation, accepted), **deferred** (a `Q` with its owner) or **missing**. Shown as a count: *9 of 14 · missing: payments, roles* |
| Stop | Nothing is **missing**, or the client stops it, and is told what is still missing |
| Thin answers | After two answers that settle nothing on a topic, it offers the recommendation or deferring. It never asks the same question twice |
| End | A short summary: what the client said, kept apart from what was assumed, and what was deferred. The client confirms it |

The team keeps answering in one sheet ([`RULE-26`](../foundations/rules/cycle.md#rule-26)).

**Why:** a sheet of thirty questions loses a client who does not know why each one matters, and a
chat with no measure either stops too early or never ends. Computing the list first keeps the order
and asks nothing twice; the count says when it is done.
