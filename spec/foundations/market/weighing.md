---
title: Weighing and completeness
description: MKT-13 · How tools weigh what to ask and what an agent assumed, check that nothing went unrecorded, and list their skills. Surveyed 2026-11-23
owner: Kevin
version: "1.0"
updated: "2026-11-23"
---

# MKT-13 · Weighing and completeness

Surveyed on 2026-11-23. Spec Kit and OpenSpec were read in their own files; the rest from their docs,
and where the page could not be fetched, from search summaries, marked so ([`RULE-22`](../rules/cycle.md#rule-22)).

## Weighing what to ask

| Source | Read | Does | Leaves out |
|---|---|---|---|
| Spec Kit `clarify.md` | [Template](https://github.com/github/spec-kit/tree/main/templates/commands) | At most five questions per session, the top five by impact × uncertainty; drops what would not change the build; each with a recommended option; logs each answer in the spec. Over the limit, an item is `Deferred` | The model judges impact and uncertainty, with no scale: not reproducible |
| Spec Kit `specify.md` | Template | At most three `[NEEDS CLARIFICATION]`, ranked scope > security > experience > technical; the rest are defaults recorded under Assumptions | The assumptions are not ranked |
| AIAG-VDA FMEA, 2019 | [Barsalou 2022](https://journals.pan.pl/Content/125641/PDF/6_833_int.pdf) · [Quality Digest](https://www.qualitydigest.com/inside/lean-article/aiagvda-s-fmea-manual-major-advance-010220.html) | Replaced the risk number (severity × occurrence × detection) with a lookup table giving high, medium or low, led by severity: S10·O6·D2 and S2·O6·D10 both gave 120 | The exact cells were not read in the handbook |
| Bezos, one-way and two-way doors | Letters of 2015 and 2016, search summaries | Hard-to-reverse decisions are taken slowly; reversible ones fast, by whoever is closest | Not a method: no scale |
| Risk matrices | [Cox 2008](https://econpapers.repec.org/RePEc:wly:riskan:v:28:y:2008:i:2:p:497-512) | Different risks land in the same cell; a ranking can be worse than random | Advises showing the factors and the judgment behind each cell |
| Devin 2.1 | [Blog](https://cognition.ai/blog/devin-2-1) | A confidence level, green, yellow or red; below green it asks first | One level for the whole task, not per decision |
| "Ask or Assume?" | [arXiv 2603.26233](https://www.alphaxiv.org/abs/2603.26233), summary | A separate agent spots missing information and triggers the questions: more tasks solved, fewer questions on simple ones | Research, not a product |

**Nobody found ranks the assumptions an agent made in its PR or report**; the docs of Copilot's coding
agent and Codex were searched and say nothing of it.

## Checking that nothing went unrecorded

| Source | Read | Does |
|---|---|---|
| Spec Kit `implement.md` | Template | Counts checked and unchecked boxes per checklist; one unchecked stops the run |
| Spec Kit `analyze.md` | Template | Read-only; fixed severities: a requirement with no task is critical |
| OpenSpec `validate` | [CLI docs](https://github.com/Fission-AI/OpenSpec/blob/main/docs/cli.md) | Named errors with how to fix each, JSON output, a non-zero exit; an archived change with an unchecked task fails |
| Task-list Actions | [shopify/task-list-checker](https://github.com/shopify/task-list-checker) and others | A PR fails while a box is unchecked; some skip template boxes, some fail when the list is missing |
| Danger.js | [Docs](https://danger.systems/js/) | Rules written in code over the PR's body and files |

## Listing skills

| Source | Read | A card shows |
|---|---|---|
| Agent Skills | [Spec](https://agentskills.io/specification), summary | `name` and `description` (what it does and when) load first; the body when used |
| Backstage | [Descriptor format](https://backstage.io/docs/features/software-catalog/descriptor-format) | Name, title, description, owner, lifecycle, tags, source, a link to its docs; generated from a file next to the code |

Both generate the catalog from the source; neither shows the rules a skill follows.
