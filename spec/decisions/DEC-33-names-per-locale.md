---
title: "DEC-33 · A name is shown in the reader's language, from the Glossary"
description: The Glossary holds one label per locale for every name; views and screens show the label and keep the name in code
owner: Kevin
version: "1.0"
updated: "2026-11-26"
---

# DEC-33 · A name is shown in the reader's language, from the Glossary

**Date:** 2026-11-26

**A name stays in English in the spec and the code ([`RULE-05`](../foundations/rules/writing.md#rule-05)).
What a person reads is its label in their language, from the project's Glossary**: one column per
locale, headed by the locale's code ([`ENT-02`](../foundations/domain/foundation.md)).

| Part | Decided |
|---|---|
| Which names | Every name a person reads: entities, states, fields, roles, modules, processes |
| Which columns | One per locale of `locales`, and one for the prose's `language` when it is not among them ([`ENT-16`](../foundations/domain/workspace.md)) |
| Who writes them | `specify` and `map`, in the same change that adds the name |
| Where it is read | The views, by the reader's locale ([`FR-VEW-26`](../modules/views/business.md#requirements)); the product's screens, from the same rows ([`DEC-21`](DEC-21-i18n-from-day-one.md)) |
| A missing label | The name is shown as written |
| When it is set up | `pedd init` asks the locales and writes the columns ([workspace](../modules/workspace/prd.md#main-flow)) |

**Why:** a client who reads the spec in Spanish saw its entities, states and roles in English in
diagrams whose prose was in Spanish. Every tool surveyed keeps the name in code and translates only its
label, beside the name, in one place ([`MKT-17`](../foundations/market/domain-labels.md)).
