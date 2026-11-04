# OpenPEDD — instructions for agents

This repo is OpenPEDD. Its spec lives in `spec/`, written in OpenPEDD's own format. Read this before writing
anything. It does not repeat the rules: it points to where each one lives.

## Before writing

1. **Search the whole spec first.** If the thing already exists, reference it by ID; never define it twice ([`RULE-01`](spec/foundations/rules/writing.md#rule-01)).
2. **Find where it goes**, top to bottom, and stop at the first match:

| If it is… | It goes in | ID |
|---|---|---|
| A contradiction with something already written | Stop and resolve it now. Never park it | `DEC-nn` if it closes a `Q` |
| What a concept *is*, used by two or more modules | `spec/foundations/domain/` | `ENT-nn` |
| A rule for every stage or every document | `spec/foundations/rules/` | `RULE-nn` |
| How OpenPEDD is built | `spec/foundations/architecture/` | `ARCH-nn` |
| Why OpenPEDD exists, who it is for, what it borrows | `spec/foundations/business/` | `BIZ-nn` |
| What a module does | `spec/product/<module>/prd.md` | `FR-<MOD>-nn` · `NFR-<MOD>-nn` |
| Something not decided yet | `spec/open/questions.md` | `Q-nn` |
| A loose idea | `spec/open/ideas.md` | — |
| A name, or a name no longer used | `spec/foundations/glossary.md` | — |

## The rules that are never negotiated

| Rule | Where |
|---|---|
| One thing, one place | [`RULE-01`](spec/foundations/rules/writing.md#rule-01) |
| The body states what governs; history lives apart | [`RULE-02`](spec/foundations/rules/writing.md#rule-02) |
| IDs are never recycled | [`RULE-03`](spec/foundations/rules/writing.md#rule-03) |
| Token budgets per document | [`RULE-04`](spec/foundations/rules/writing.md#rule-04) |
| Names in English, with the shape the code uses | [`RULE-05`](spec/foundations/rules/writing.md#rule-05) |
| Structure goes in tables; a reason is said once | [`RULE-06`](spec/foundations/rules/writing.md#rule-06) |
| Say what it does; negatives only in `Out of scope` and security | [`RULE-07`](spec/foundations/rules/writing.md#rule-07) |
| A `Q` closes only with a new `DEC` | [`RULE-08`](spec/foundations/rules/writing.md#rule-08) |
| A contradiction is resolved on the spot | [`RULE-09`](spec/foundations/rules/writing.md#rule-09) |
| Only `specify` writes the spec; everything else proposes deltas | [`RULE-10`](spec/foundations/rules/cycle.md#rule-10) |

## Language

Everything in this repo is in **English** ([`DEC-10`](spec/decisions/DEC-10-language.md)), in a plain,
direct style: short sentences, no filler.

## Frontmatter

Every document starts with:

```yaml
---
title: <name>
description: <one line>
owner: Kevin
version: "1.0"
updated: "YYYY-MM-DD"
status: draft | live          # spec/product/ only, see ENT-03
---
```

## History

Every version of a document gets one line in `spec/history/history.jsonl`:
`{"path", "version", "date", "change", "story", "stage", "summary"}`. The summary says what
changed, not why: the why lives in the document.

## Checks

```bash
npm run check          # both checks
npm run check:links    # relative links to a missing file or anchor
npm run check:size     # token budget per document (RULE-04)
```

Run them before committing. `check:size` fails only when a document over budget grows.
