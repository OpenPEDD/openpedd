---
title: Domain labels per language
description: MKT-17 · How frameworks and tools keep one name in code and show it in each language on screen. Surveyed 2026-11-26
owner: Kevin
version: "1.0"
updated: "2026-11-26"
---

# MKT-17 · Domain labels per language

Surveyed on 2026-11-26, from what each tool's documentation says. The pages were not fetched in this
survey; each row names the page to read again ([`RULE-22`](../rules/cycle.md#rule-22)).

| Tool | Where the name in code lives | Where its label per language lives | Falls back to | Source |
|---|---|---|---|---|
| **Rails** | The model and attribute (`JobPost`, `closes_at`) | `activerecord.models.job_post` and `activerecord.attributes.job_post.closes_at`, one YAML per locale | The name, humanized | Rails Guides, *Rails Internationalization (I18n) API*, section *Translations for Active Record Models* |
| **Django** | The model and field | `verbose_name` and `choices`' labels, marked for translation, one `.po` per locale | The name | Django docs, *Model Meta options* and *Translation* |
| **Salesforce** | The API name (`Job_Post__c`) | The object, field and picklist value labels in the Translation Workbench, per language | The default label | Salesforce Help, *Translation Workbench* |
| **Odoo** | The model and the selection key (`open`) | The model's description and each selection label, in a `.po` per language | The source text | Odoo docs, *Translating modules* |
| **Business glossaries** (Collibra, Purview) | The term | A translation per language, as an attribute of the term | The term | [`MKT-15`](business-models.md#business-glossary) |
| **Domain-driven design** | One ubiquitous language per bounded context | A translation is a separate artifact, never a second name in the model | — | Evans, *Domain-Driven Design* |

## What the tools agree on

| Pattern | Seen in |
|---|---|
| The name in code never changes with the language; only its label does | Every row |
| The label of a state or enum value is translated like any other name | Rails, Django, Salesforce, Odoo |
| One label per locale, beside the name, in one place | Salesforce, business glossaries |
| A missing label shows the name, never an empty space | Every row |
