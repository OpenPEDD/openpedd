# Instructions for agents

<!-- pedd -->
## OpenPEDD

This project's spec lives in `spec/`, written in [OpenPEDD](https://github.com/openpedd/openpedd)'s
format. Read this before writing anything. It does not repeat the rules: it points to where each one
lives. How the spec is laid out is in [spec/README.md](spec/README.md).

### Before writing

1. **Search the whole spec first.** If the thing already exists, reference it by ID; never define it twice ([`RULE-01`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-01)).
2. **Find where it goes**, top to bottom, and stop at the first match. Every kind of artifact, and how each is written, is in [Artifacts](spec/foundations/artifacts.md):

| If it is… | It goes in | ID |
|---|---|---|
| A contradiction with something already written | Stop and resolve it now. Never park it | `DEC-nn` if it closes a `Q` |
| What a concept *is*, used by two or more modules | `spec/foundations/domain/` | `ENT-nn` |
| A rule for every module or every document | `spec/foundations/rules/` | `RULE-nn` |
| How the product is built | `spec/foundations/architecture/` | `ARCH-nn` |
| What we decided about the product as a business: problem, audience, pricing, north star | `spec/foundations/business/` | `BIZ-nn` |
| What we measured outside: competitors, tools, studies, with a survey date | `spec/foundations/market/` | `MKT-nn` |
| What a module does | `spec/modules/<module>/prd.md` | `FR-<MOD>-nn` · `NFR-<MOD>-nn` |
| Something not decided yet | `spec/open/questions.md` | `Q-nn` |
| A loose idea | `spec/open/ideas.md` | — |
| A name, or a name no longer used | `spec/foundations/glossary.md` | — |

### The rules that are never negotiated

| Rule | Where |
|---|---|
| One thing, one place | [`RULE-01`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-01) |
| The body states what governs; history lives apart | [`RULE-02`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-02) |
| IDs are never recycled | [`RULE-03`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-03) |
| Token budgets per document | [`RULE-04`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-04) |
| Names in English, with the shape the code uses | [`RULE-05`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-05) |
| Structure goes in tables; a reason is said once | [`RULE-06`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-06) |
| Say what it does; negatives only in `Out of scope` and security | [`RULE-07`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-07) |
| A `Q` closes only with a new `DEC` | [`RULE-08`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-08) |
| A contradiction is resolved on the spot | [`RULE-09`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-09) |
| Only `specify` writes the spec; everything else proposes deltas | [`RULE-10`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/cycle.md#rule-10) |
| **To a person, say what an item says, not its ID**: the ID only in parentheses | [`RULE-20`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/cycle.md#rule-20) |
| A claim about the current system cites the code that proves it | [`RULE-21`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/cycle.md#rule-21) |
| A check that did not run is reported as not run | [`RULE-22`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/cycle.md#rule-22) |
| Nothing stands alone: every item linked by ID to what it governs | [`RULE-27`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-27) |

### Language

Prose is in the language set in `workspace.yaml` (`language`); every name is in English
([`RULE-05`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-05)). Every text the product shows a person is an i18n key, with English as the
base locale ([`DEC-21`](https://github.com/openpedd/openpedd/blob/main/spec/decisions/DEC-21-i18n-from-day-one.md)).

### Frontmatter

Every document starts with:

```yaml
---
title: <name>
description: <one line>
owner: <owner>
version: "1.0"
updated: "YYYY-MM-DD"
status: draft                 # spec/modules/ only; the states are in ENT-03
---
```

### History

Every version of a document gets one line in `spec/history/history.jsonl`
([`ENT-17`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/domain/history-entry.md)):
`{"path", "version", "date", "change", "story", "stage", "summary"}`. The summary says what
changed, not why: the why lives in the document.

### Checks

```bash
npm run check          # both checks
npm run check:links    # relative links to a missing file or anchor
npm run check:size     # token budget per document (RULE-04)
pedd view              # every view of the spec as a map, once the CLI is installed
```

Run them before committing. `check:size` fails only when a document over budget grows.
<!-- /pedd -->
