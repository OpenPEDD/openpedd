---
title: Cycle rules
description: The rules every stage of the cycle follows, interactive or delegated
owner: Kevin
version: "1.7"
updated: "2026-11-23"
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
| *Accept DLT-nnnn?* | *The design added a confirmation step before deleting a job post. Keep it? (`DLT-nnnn`)* |

**Why:** an ID means nothing to someone who does not have the spec open. A person cannot answer a
question about `Q-14` without looking it up, and a decision made without reading what it decides is
not a decision. IDs are for documents and agents; people get the content.

For a long item, the agent quotes its title or its governing sentence, not a paraphrase: a paraphrase
can say something the spec does not.

## RULE-21 · A claim about the current system cites the code [#rule-21]

Every assumption a stage makes about what already exists (a table, a window, a limit, what a function
does) names the file that proves it. One that cannot be proved is a question, not an assumption.

**Why:** an unverified assumption about the system becomes a silent bug in production.

## RULE-22 · A check that did not run is reported as not run [#rule-22]

An agent that could not run, open or look at something says so, in the place where the result would
have gone. A check with no result is not a pass. **A verification that did not verify, reported as
done, is worse than none: nobody looks again.**

## RULE-23 · When they disagree, the spec wins [#rule-23]

While `architect` runs with the person, a clash is settled there: the decision changes, or the spec
does, through a `proposal` delta that `architecture-merge` decides. **After it**, the spec wins over
the architecture, and the architecture over the plan. A clash found later is not settled in the lower
one: it goes to the person, who decides whether the spec is what changes.

**Why:** the architecture is still a conversation, and it may still move the spec. Once merged, one
order for every topic: deciding precedence case by case costs a round per clash, and the answer
depends on who settled it.

## RULE-24 · The tool keeps the order, not the prompt [#rule-24]

Each stage's procedure is a list of steps the tool runs, one agent per step, with its pack. A step
runs only once its precondition is checked: mutation, for instance, only with the review closed and
the whole suite green. The stage's checklist is **what the agent delivers**, and its judge checks each
item; the agent does not tick its own. **Whatever coordinates is not a model** ([`ARCH-04`](../architecture/agents.md#how-agents-work)).

**Why:** a rule in a prompt competes with every other text in it, and weighs less as the context
grows. A session coordinating for sixteen hours skipped one written in `AGENTS.md`, because its own
brief, closer, said otherwise.

## RULE-25 · An agent notes improvements; it does not make them [#rule-25]

Every agent, in any stage, closes its report with **what it would improve** (the process, the spec,
the code, the tools), each with the problem it solves. It acts on none of them. How long each step
took is not its to say: the tool measures it ([`ENT-23`](../domain/trace-event.md#steps)). `verify` gathers them in the `Acceptance Report`, and `accept` decides them.

**Why:** an agent that improves on its own way widens the scope (a button with no spec behind it); one
told to keep quiet loses what only it saw. Seeing and doing are kept apart.

## RULE-26 · Ask everything at once, with a recommendation [#rule-26]

An agent that needs the person gathers **every question it has** and asks them in one sheet: each with
what breaks if it is guessed, its options and a recommendation. It never asks one question, waits, and
asks the next. A client defining a product does so in a conversation that runs until the definition is
complete ([`DEC-20`](../../decisions/DEC-20-definition-chat.md)). Before the delegated stages, a sweep finds what every stage ahead still lacks
and asks the heavy ones ([`ARCH-16`](../architecture/sweep.md)); after it, a gap is assumed, not asked ([`RULE-13`](#rule-13)).

**Why:** a question asked alone costs the person a wait per question, and the work stops at each one.
With a recommendation, most answers are one word.

## RULE-28 · What the AI decides alone is weighed by the tool, and read heaviest first [#rule-28]

Every sweep question, `assumption` and `deviation` gets a weight, `high`, `medium` or `low`, from a
fixed table ([`ARCH-23`](../architecture/weight.md)). The agent writes what backs it and what changes
if the answer is no; `pedd` computes the weight. Only the `high` are asked; the person reads them
first, and accepts the `low` in one reply.

**Why:** a person's attention goes to what is costly to get wrong, not to the order things were found.
