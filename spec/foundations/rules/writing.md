---
title: Writing rules
description: How every document in a spec is written, so the spec does not drift from itself
owner: Kevin
version: "1.3"
updated: "2026-11-23"
---

These rules apply to every document in every spec that uses OpenPEDD, this one included.

## RULE-01 · One thing, one place [#rule-01]

Every concept is defined in exactly one document. Every other document references it by ID and
never redefines it. **Two definitions of the same thing end up contradicting each other, even when
both are well written.** If a PRD needs to explain what an entity is, that entity is missing from
the domain.

## RULE-02 · The body states what governs [#rule-02]

A document is written as if it had always said what it says today.

| Not in the body | Where it goes |
|---|---|
| *"It used to be…"*, *"no longer"*, *"changed from A to B"*, struck-through rows | The history: one line per version |
| An old name | The glossary, under *Names no longer used* |
| *"Reverts DEC-04"* | The decision record. The body may cite the `DEC` as its source |

**The reason does go in the body, in the present tense.** A date goes in only when it is a fact that
governs: a launch, a review date, an expiry.

## RULE-03 · IDs are never recycled [#rule-03]

When something is retired, its ID stays dead. A reused ID turns an old task into a reference to
something else.

## RULE-04 · Token budgets [#rule-04]

Size is measured in tokens, per document. Going over budget almost never means writing too much: it
means two topics share a file. **Split by topic, not by size.**

| Document | Budget |
|---|---|
| A module PRD (`modules/`) | 4,000 |
| An entity, rule file, architecture document or business document | 2,000 |
| A file of the `Business Map` (`foundations/business-map/`), with every process's steps | 8,000 |
| The glossary | 4,000; split by module beyond that |
| A decision | 1,000 |
| A delta | 1,000 |
| A history line | 80 |
| A `Delta Report` | 2,000 |
| An `Acceptance Report`, without screenshots | 3,000 |
| **A task's `Context Pack`** | **12,000 target, 20,000 max** |

The `Context Pack` budget is the one that matters most: it is what the agent holds while it works.
The document budgets exist so the pack fits. The check fails only when a document **already over
budget grows**. A project changes a budget in `workspace.yaml`, by layer or by folder
([`ENT-16`](../domain/workspace.md)).

## RULE-05 · Names in English, with the shape the code uses [#rule-05]

Every **name** is in English: entities, ID prefixes, stages, states, fields, tools, event types.
**Prose** is in the team's language. A tool is `snake_case`; an enum value is `SCREAMING_SNAKE`.
When natural English and the code disagree, **the code wins**: the name is shared with the code and
the tasks, and a translated name breaks that chain silently.

## RULE-06 · Structure goes in tables; a reason is said once [#rule-06]

Fields, actions, events and requirements go in tables. Prose is for the reason. **If the reason fits
in the requirement's cell, it goes there and no paragraph repeats it.** A separate paragraph earns
its place only when the reason does not fit in a line.

## RULE-07 · Say what it does [#rule-07]

A document describes what something does, not what it does not do. Two exceptions, because there the
negative is the content: the `Out of scope` section of a PRD, listed once, and the security policy
(*"a token is never logged"*).

## RULE-08 · A question closes only with a decision [#rule-08]

A `Q-nn` closes only with a new `DEC-nn`, and the question names it. Not by editing the document that
mentions it. If the answer does not deserve a recorded decision, it was not an open question.

## RULE-09 · A contradiction is resolved on the spot [#rule-09]

A contradiction is never parked. Stop, decide which version stays, write the reason in the document
that wins, and correct the one that loses as if it had always said the new thing ([`RULE-02`](#rule-02)).
**A list of unresolved contradictions is a spec that knows it contradicts itself and moves on.**

## RULE-27 · Nothing stands alone [#rule-27]

Every item is linked to what it governs or to what governs it, by ID: a decision cites what it
changes, an entity is cited by a PRD that uses it, a requirement is carried by a flow and proved by a
criterion, and every ID cited is defined somewhere. **The views of a project are drawn from those links
([`ARCH-22`](../architecture/views.md)), so an item with none is invisible in them, and nobody knows
what breaks when it changes.** `pedd check` fails on a loose item a change adds or touches
([views](../../modules/views/prd.md#loose-items)).

## RULE-29 · Every kind of model is defined as the industry defines it [#rule-29]

An entity, a state machine, a use case, an activity, a process, an organization chart, a glossary, and
any kind of model added later, is defined from the standard the industry uses for it (the ER model, UML,
BPMN…), **surveyed and dated in `market/` first**, with its sources, and cited where the framework
defines it. Where OpenPEDD departs from the standard, the definition says how and why. **A model the
industry already defines is read the same way by every person and tool that knows it; one made up here
has to be learned, and drifts.**
