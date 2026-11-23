---
title: Weight
description: ARCH-23 · How each decision the AI takes alone is weighed high, medium or low, so a person is asked, and reads, the heavy ones first
owner: Kevin
version: "1.0"
updated: "2026-11-23"
---

# ARCH-23 · Weight: the heavy ones first

A change leaves many small decisions nobody asked a person about: a sweep question decided by its
recommendation, an `assumption`, a `deviation`. **Each one gets a weight, `high`, `medium` or `low`,
and the weight decides what a person is asked and in what order they read** ([`RULE-28`](../rules/cycle.md#rule-28)).

`pedd` computes it from the fields; the agent never sets it ([`RULE-24`](../rules/cycle.md#rule-24)).
What the agent writes is the evidence and what changes if the answer is no.

## The factors

| Factor | `high` | `medium` | `low` | Read from |
|---|---|---|---|---|
| **Undo**: what it costs to take back | A migration, data already written, a public contract, something sent outside (an email, a charge) | Logic or an internal contract | Copy, style, configuration | The `revert` field ([`ENT-07`](../domain/delta.md)) |
| **Reach**: what it touches | The data model, or more than one module | Behavior a user sees: a requirement | Internal, or one screen | The `target`, and the files of `revert` |
| **Evidence**: what backs it | A guess | Inferred from another requirement | The spec or the code says it, cited | The `evidence` field |
| **Fan-out**: what builds on it | Three tasks or more | — | Fewer | The plan's dependencies; for a sweep question, the questions under it |

## The table

The weight comes from a table, **not from multiplying scores**: a product gives the same number to a
hard-to-undo guess and to a harmless certainty ([`MKT-13`](../market/weighing.md)). Undo leads.

| Undo ↓ · Reach → | `high` | `medium` | `low` |
|---|---|---|---|
| `high` | high | high | medium |
| `medium` | high | medium | low |
| `low` | medium | low | low |

Then, in this order:

1. **Evidence**: one level down when the spec or the code backs it; one level up when it is a guess.
2. **Fan-out**: one level up when three tasks or more build on it.
3. **Hard triggers**: anything that touches **permissions, billing, personal data or security** is `high`, whatever the table gives. Nothing lowers it.

The cells and the fan-out threshold are a first cut, calibrated from what `accept` decides ([`Q-23`](../../open/questions.md)).

## What each weight does

| Weight | Before the delegated stages ([`ARCH-16`](sweep.md)) | After them ([`accept`](../../modules/accept/prd.md)) |
|---|---|---|
| `high` | Asked, with its options and recommendation | Read first, one by one |
| `medium` | Decided by its recommendation, listed in the same sheet | Read after the high ones |
| `low` | Decided by its recommendation, listed in the same sheet | Grouped at the end; one reply accepts them all |

Every item shows its weight **with its factors and its reason**, never a bare label: *"high · hard to
undo (migration) · touches billing"*. A person who disagrees with a weight says so, and it counts for
calibration.

## Grouping

Items with the same `target` and the same reason are one decision: five copy assumptions on one
screen are decided with one reply. The group takes the weight of its heaviest item.

## Calibration

`accept` records, per item, its weight and its decision. The `measure` dashboard shows, per weight,
how many were kept, changed or rejected ([cycle metrics](../../modules/cycle/prd.md)). **A `low` that is often changed
means the table is wrong**, and a `Q` reopens its cells.

## Decisions

| # | Decision | Discarded | Status | Date |
|---|---|---|---|---|
| 1 | A lookup table led by Undo | A product of scores, 1 to 27: equal numbers for unequal risks | accepted | 2026-11-23 |
| 2 | Three weights, shown with their factors | A number, which reads as more precise than it is | accepted | 2026-11-23 |
| 3 | `pedd` computes it; the agent writes the evidence | The agent weighs its own decisions: it would lower what it is unsure of | accepted | 2026-11-23 |
