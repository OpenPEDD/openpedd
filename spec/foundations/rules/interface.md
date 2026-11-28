---
title: Interface rules
description: What every stage that designs, builds or reviews a screen follows
owner: Kevin
version: "1.0"
updated: "2026-11-28"
---

These rules apply to every stage that touches a screen: `design` draws it, `build` wires it, `verify`
reviews it, and `/design-audit` measures one that exists ([`DEC-36`](../../decisions/DEC-36-interface-quality.md)).

## RULE-32 · Every screen is designed, built and checked in each state it can reach [#rule-32]

A screen is done only in every state below that it can reach. A state it cannot reach is written
`n/a` in its inventory, with the reason; one it can reach and nobody designed is a gap.

| State | Reached when |
|---|---|
| `initial` | Nothing was asked or done yet: a search before typing, a form untouched |
| `loading` | The first read is in flight: drawn as the skeleton of the final layout |
| `empty` | The read returned nothing: on first use, or with no results for a query or filter. Two different states |
| `partial` | Part of it arrived: a field missing, one of several reads failed, more pages to load |
| `populated` | With data: one item, a typical count, and the most the `Test Data` holds |
| `error` | A read or a write failed |
| `success` | A write landed |
| `busy` | A write is in flight |
| `disabled` | An action is not available now, for a reason the screen states |
| `no-permission` | The role cannot see or do it ([`Roles & Permissions`](../domain/foundation.md)) |
| `no-quota` | The plan's limit is reached |
| `offline` | The connection dropped, where the screen writes or streams |

Each interactive control has its own states: `default`, `hover`, `focus-visible`, `active`,
`selected`, `disabled`, `invalid`, `read-only`, `busy`. A part of the screen that loads, saves or
fails on its own (a button writing, a value edited in place, a card) has its states **inline**, in its
own place and keeping its space, and the rest of the screen stays usable. **The ideal state works
almost by itself; empty, partial, error and no permission are where screens fail, because nobody
looked at them.**

## RULE-33 · A screen is made of the product's system; what is outside it says why [#rule-33]

A screen uses the `Brand System`'s tokens, its catalog's pieces and its patterns. A value outside the
tokens, a piece outside the catalog, or a second pattern for something the product already does,
enters only as a `proposal` delta to the `Brand System` that says why none of its own fits: in
`design`, before it is used. Found later, in `build`, `verify` or an audit, it is a finding
([`ARCH-14`](../architecture/review-lenses.md#interface-findings)). **An arbitrary value is the first
copy of a second system: each of the 21 class sets Reclee found written by hand across files started
as one** ([`MKT-06`](../market/component-catalogs.md)).
