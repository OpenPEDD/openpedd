---
title: "CHG-041 · Names in the reader's language: summary for Kevin"
description: One page — why the diagrams of a Spanish client showed English names, and the Glossary column per locale that fixes it
owner: Kevin
version: "1.0"
updated: "2026-11-26"
---

# CHG-041 · Names in the reader's language

Stage: `specify`. Found on the Cloud with two clients whose specs are written in Spanish: with the
Cloud in Spanish, the diagrams showed their entities, states, roles and fields in English, beside prose
in Spanish. The interface was translated; the names come from each client's spec, in English by rule.

| What | Where |
|---|---|
| **A name stays in English; what a person reads is its label, from the Glossary**: one column per locale, headed by its code. Which names, who writes them, what a missing one shows | [`DEC-33`](../../decisions/DEC-33-names-per-locale.md) |
| How Rails, Django, Salesforce, Odoo and business glossaries keep one name and a label per language | [`MKT-17`](../../foundations/market/domain-labels.md) |
| The `Glossary` foundation holds the locale columns | [`ENT-02`](../../foundations/domain/foundation.md) |
| `init` asks the locales, proposing the prose's language, and writes a Glossary column for each | [`ENT-16`](../../foundations/domain/workspace.md), [workspace](../../modules/workspace/prd.md#main-flow) |
| `specify` writes the label of every name a change adds | [specify](../../modules/specify/prd.md) |
| `views.json` carries the labels and a viewer shows them by the reader's locale; `pedd view` opens in the prose's language or `--locale` | [`FR-VEW-26`](../../modules/views/business.md#requirements) |
| A name with no label in a declared locale is loose, so `pedd check` fails on the change that adds it | [`FR-VEW-27`](../../modules/views/business.md#requirements) |

Built: `@openpedd/reader` 0.16.0 (`names` in `viewData`, `localizeViews`, the page's locale selector and
the `unlabelled` loose item) and `@openpedd/cli` 0.13.0 (`pedd view --locale`), with their tests; the
template's Glossary has an `en` column. Each client's labels are written in the client's own spec repo.
