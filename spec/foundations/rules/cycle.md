---
title: Cycle rules
description: The rules every stage of the cycle follows, interactive or delegated
owner: Kevin
version: "1.1"
updated: "2026-11-06"
---

## RULE-10 · Only `specify` writes the spec [#rule-10]

Every other stage proposes [`Delta`](../domain/delta.md)s, and a delta enters the spec only through a
[`Merge Gate`](../domain/merge-gate.md). **If the AI can rewrite the spec, it bends the spec to fit
what it built.**

## RULE-11 · Stages share the spec, not the conversation [#rule-11]

Every stage starts in a new session and reads only its [`Context Pack`](../domain/context-pack.md):
the part of the spec it needs, plus its task. It never reads another stage's conversation or
changelog. Less context means better attention.

## RULE-12 · The judge is not the generator [#rule-12]

Every stage's [`Judge`](../domain/judge.md) runs in another session, without the generator's
conversation, and with another model when the configuration allows. **An agent that reviews itself
repeats its mistake with the same reasoning.**

## RULE-13 · In a delegated stage, a product gap is assumed, not asked [#rule-13]

The AI picks the most reasonable option, records it as an `assumption` delta with its alternative,
and continues. Asking would put the person who defines back in the middle; recording it brings the
assumption, whole, to `accept`.

## RULE-14 · Only the irreversible or the costly stops the work [#rule-14]

Deleting data, charging money, or sending something to someone outside. It stops for the person who
runs the stage, not for the person who defines. Everything else can be undone in `accept`.

## RULE-15 · Three rounds without converging, a person decides [#rule-15]

A judge that fails three rounds in a row hands the decision to a person. A loop that does not
converge spends without moving.

## RULE-16 · The how can merge alone; the what needs a person [#rule-16]

A delta that changes only the how (`ARCH`, `ADR`) may merge automatically where the stage allows it.
A delta that changes the what (`FR`, `NFR`, `ENT`) is decided by a person.

## RULE-17 · Every derived artifact is anchored [#rule-17]

Whatever a stage produces from the spec carries an [`Anchor`](../domain/anchor.md) to the hash of
the IDs it came from, written by the stage itself. Without an anchor, nobody can tell whether it is
up to date.

## RULE-18 · A state is moved by a stage [#rule-18]

The state of a PRD or a requirement is the output of a stage with an owner, never a field someone
remembers to update. A state set by hand fails the check. See
[`ENT-03`](../domain/requirement.md#lifecycle).

## RULE-19 · A stage starts only with the previous judge green [#rule-19]

Each stage has an exit condition. The next one does not start until it is met.

## RULE-20 · To a person, say what it says, not its ID [#rule-20]

When an agent talks to a person (in the chat, in a question, in a report, in a tracker task), it
states each item **as it is written**: the question, the requirement, the decision, the rule. The ID
may go next to it, in parentheses, so it can be found; never alone.

| Not this | This |
|---|---|
| *Shall we close Q-14?* | *Shall we close the scope of the MVP: which stages and adapters ship first? (`Q-14`)* |
| *DEC-11 applies here* | *The Cloud stays in a private repo; only the framework is public (`DEC-11`)* |
| *Accept DLT-0142?* | *The design added a confirmation step before deleting a job post. Keep it? (`DLT-0142`)* |

**Why:** an ID means nothing to someone who does not have the spec open. A person cannot answer a
question about `Q-14` without looking it up, and a decision made without reading what it decides is
not a decision. IDs are for documents and agents; people get the content.

For a long item, the agent quotes its title or its governing sentence, not a paraphrase: a paraphrase
can say something the spec does not.
