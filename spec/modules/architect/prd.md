---
title: architect
description: Stage 2 · Decides how to build what specify defined, after reading the spec, the code, the design and those who solved it before
owner: Kevin
version: "1.6"
updated: "2026-11-17"
status: draft
---

# Stage 2 · `architect`

**Mode:** `guided` (default) or `delegated` · **Gate:** `architecture-merge`

## What it is

Where **how** to build what `specify` defined is decided. Most of it is thinking about the possible
improvements: performance, optimization, good practice, and what each option costs. It runs in
parallel with `design`. It does not write the spec: it leaves `ARCH` documents, `ADR`s and deltas,
on the change's architecture branch ([`ARCH-06`](../../foundations/architecture/branches.md)). Each
decision is written there as soon as it closes, because `design` reads them while it works.

**It reads before it proposes.** A proposal tied to what already exists, checked against the code
and against those who solved the problem before, is decided in minutes; one built on assumptions
becomes a bug in production.

## Inputs

| What | From |
|---|---|
| The approved `NFR`s and `FR`s in scope | `specify` |
| The current code: the modules it touches and the ones it could reuse | The repo |
| The design branch: the data the screens assume | `design`, in progress ([`ARCH-06`](../../foundations/architecture/branches.md)) |
| Outside facts already surveyed: competitors, tools, prices | `Market` |

## Context pack

The `NFR`s and `FR`s in scope · `Architecture Rules` · `Security Policy` · `Domain Model` ·
`Integrations` · `Quality Standards` · `Privacy` · the area's existing `ARCH` and `ADR` · the `Market` documents
it cites. Budget: **15,000 tokens**; the code and the references are opened by the agent, not packed.

## Procedure

1. **Reads three things in parallel**: the spec in scope, the code it touches, and the design branch. The proposal starts from what exists.
2. **Turns the `NFR`s into quality scenarios**: stimulus, response, measure.
3. **Looks at who solved it before**: at least **three references** (products, libraries, engines), and **one open-source one read in its code and its issues**. The docs say what a tool does; the code and the issues say where it breaks. What is found outside, with its date, goes to `Market`.
4. **Looks for what to reuse** before building: what the code already does that solves part of the problem. Reusing is the default; building is justified.
5. **Verifies every assumption about the current system against the code** ([`RULE-21`](../../foundations/rules/cycle.md#rule-21)).
6. **Does the numbers with real prices**: cost and capacity per run, per account and per plan, from the provider's current price, with source and date. A limit is decided from the numbers.
7. **Compares options in a table**: at least two for every non-obvious decision, with cost, risk and which `NFR` each meets. The discarded option stays, with its reason.
8. **Designs how it fails**: every reuse and every contract between modules gets a check that fails before production, at the moment that catches it first: compile, CI, publish or runtime. **Every operation with more than one write** (charge and record, claim and process, save and update) says how it survives a crash between them: one transaction, an idempotent retry, or a compensation. Each measurable `NFR` becomes a fitness function that `plan` loads into the pipeline.
9. **Walks one or two real use cases** through the design, from the PRD's flows. A concrete case finds the gaps a list of requirements does not.
10. **Decides**, or in `guided` **asks the person every open decision at once**, in one sweep sheet: each question as written, its options table and a recommendation ([`ARCH-16`](../../foundations/architecture/sweep.md)).
11. **Records each decision** where it belongs ([decisions](../../decisions/README.md#where-an-architecture-decision-goes)): a row in the area's decisions table, or an `ADR` when it has real alternatives and lasting consequences.
12. **Updates the `ARCH` documents**: the area's diagram at the right C4 level, the data model, migrations that work with both versions of the code, integrations, the policies that enforce each role on the data, **down to the field: who writes each column, from what the PRD says**, every table the plan will need, working tables included, and retention and deletion.
13. **Records deltas.** A `FR` or `NFR` that cannot be met as written, or one that is missing, is a `proposal` delta. **The PRD is not edited**: a contradiction found here is corrected in the spec through the gate, never noted on the side.
14. **Builds the `Delta Report`.**

## Outputs

| What | Anchored to |
|---|---|
| Decisions: rows in the area's table, and `ADR`s | The `NFR`s they answer |
| Updated `ARCH` documents | The `NFR`s and `ENT`s they cover |
| Fitness functions and contract checks | Their `NFR` or contract |
| `Market` entries: references and prices, dated | — |
| `proposal` deltas | `changes/<CHG>/deltas/` |
| `Delta Report` | `changes/<CHG>/reports/` |

## Judge

| Agent | Checks | Passes when |
|---|---|---|
| `architecture-judge` | Consistency with `Architecture Rules`, `Security Policy` and `Domain Model`; every `NFR` answered and measurable; no product decision hidden in an `ADR`; **every decision names the option it discarded and why; every assumption about the current system cites the code; every cost cites its source and date; every reuse and contract has its failure check; every operation with more than one write says how it survives a crash** | All green |

Then **`architecture-merge`**:

| `architect.mode` | Deltas touch only the how (`ARCH`, `ADR`) | Deltas touch the what (`FR`, `NFR`, `ENT`) |
|---|---|---|
| `guided` | A person | A person |
| `delegated` | **Automatic** | A person |

`guided` is the default on every track. It is changed in the command (`/architect --delegated`),
in the story (label `architect:delegated`) or in `workspace.yaml`; the most specific wins
([`DEC-08`](../../decisions/DEC-08-architect-mode.md)).

## Keep in mind

- **Hardest-first.** The riskiest part is solved first, because it changes the rest the most.
- **The how does not change the what.** If meeting a `NFR` needs changing what the user sees, it is a delta, and a person decides.
- **The reason goes in the decision, not in the chat.**
- **What pays the most**: reading a competitor's code, reusing instead of building, verifying against the code, and real prices.
- **If it touches the same ID as `design`**, whichever merges second sees the conflict.

## Skills, agents and tools

| Kind | Name | For |
|---|---|---|
| Skill | `/architect` | The whole stage |
| Skill | `/architect-research` | The references for a decision, and the `Market` entries |
| Skill | `/architect-teardown` | Reading one open-source reference: its data model, its API and its issues |
| Skill | `/architect-adr` | Recording a decision |
| Skill | `/architect-fitness` | Turning a `NFR` or a contract into a check |
| Agent | `architecture-judge` | The judge |
| MCP | `get_context_for` · `propose_delta` | The pack and the deltas |

## Per track

| Track | What changes |
|---|---|
| `full` | Everything |
| `story` | Only if it touches a `NFR` or a contract. Steps 3 and 9 only for a new decision |
| `fix` · `chore` | Does not run. A `chore` that changes the architecture records its decision in its PR |

## Sources

C4 · ADR / MADR · arc42 · fitness functions · Spec Growth Engine · Spec Kit (`/plan`) · BMAD
(architect) · OWASP ASVS · the architecture of Reclee's Automations, where this procedure was first
run end to end.
