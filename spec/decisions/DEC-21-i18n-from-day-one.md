---
title: "DEC-21 · Every product starts with i18n, English as the base"
description: A product started with OpenPEDD has i18n in its architecture from the first change; other languages are added as locales
owner: Kevin
version: "1.0"
updated: "2026-11-20"
---

# DEC-21 · Every product starts with i18n, English as the base

**Date:** 2026-11-20

| Part | Decided |
|---|---|
| From when | The first change of a new product. `pedd init` writes `locales: [en]` ([`ENT-16`](../foundations/domain/workspace.md)) |
| Base | English, always the first locale. Other languages are added to `locales`, with no change to the code |
| What it covers | Every text a person reads from the product: screens, emails, notifications, banners, help and Walkthroughs. Each is a key, never text written in code. An API error carries a stable code and its text in English |
| The library | One of the stack decisions of a new product, asked like the others ([workspace](../modules/workspace/prd.md#the-stack)) |
| A running product | `pedd adopt` lists missing i18n as a gap and proposes its own change. `init` never forces it |
| Checks | Always on, with one locale or many ([`ARCH-10`](../foundations/architecture/testing.md#languages)) |

This is about the product's interface. The language of the spec's prose is a separate setting,
`language` ([`DEC-10`](DEC-10-language.md)).

**Why:** adding i18n later means finding every text written in code, screen by screen, and it is
never finished. Keys from the first screen cost almost nothing, and a second language becomes a file.
