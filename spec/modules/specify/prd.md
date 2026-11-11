---
title: specify
description: Stage 1 · Defines what is built and why; the only stage that writes the spec
owner: Kevin
version: "1.3"
updated: "2026-11-11"
status: draft
---

# Stage 1 · `specify`

**Mode:** interactive · **Gate:** `spec-approval`

## What it is

Where **what** is built, and **what for**, is defined. It is the only stage that writes the spec
([`RULE-10`](../../foundations/rules/cycle.md#rule-10)). It produces a PRD (`full`) or a delta against
an existing PRD (`story`), complete enough that later stages have nothing to guess. **The more
complete the PRD, the fewer assumptions in the middle.**

## Inputs

| What | From |
|---|---|
| The idea, or the story (*As a…, I want…, so that…*) | The person; the story, from the tracker |
| What the product already does in that module | The `live` PRD and the code, if any |

## Context pack

`Business Context` · `Domain Model` (the entities in scope) · `Glossary` · `Roles & Permissions` ·
`Tracking Plan` · `Privacy` · the current PRD for a change. Budget: **12,000 tokens**.

## Procedure

1. **Frame.** Who, what triggers it, in what state it ends. The goal as the job the user hires the product for.
2. **Class and metric.** New, improvement or debt. The `Success metric` with `baseline`, `target` and `review date`, and the `Tracking Plan` event that measures it.
3. **Appetite and `Out of scope`.** How much it is worth spending, and what is not built. The risks.
4. **Flows.** The `Main flow`, then the `Alternate flows` (they branch and return) and the `Exception flows` (they end the flow).
5. **Requirements.** From the flows: `FR` (what the user does or sees) and `NFR` (what the system does), in EARS ([`ENT-03`](../../foundations/domain/requirement.md)). A `NFR` with a time or a volume carries the number.
6. **Permissions and data.** A matrix of role × action, allowed and denied. **Who writes each field, and through which door**: the screen, the API, the assistant, a trigger or only the system. Which fields are personal, how long they are kept and how they are deleted, from `Privacy`.
7. **States.** The transitions the flow touches, valid and invalid, cited from the domain. **Also those that come from outside the flow**: a plan that goes down, a parent that closes, a subject that is deleted. Each with what happens to the work in progress.
8. **Contracts.** For each action: input, output, errors ([`ENT-05`](../../foundations/domain/contract.md)).
9. **Screens and copy.** Each state (empty, error, loading, no permission, no quota) with its text, from the glossary, per locale. **So does every notice the system sends**: notification, email, banner.
10. **Criteria.** At least one `AC` per flow, in `Given / When / Then`, each with its `FR` ([`ENT-04`](../../foundations/domain/acceptance-criterion.md)).
11. **Test data.** The same data for the mockup, the tests and the final check.
12. **Variations.** Where it works in more than one way: a flag, a plan, an A/B test. Whether the change ships behind a flag.
13. **Judges**, and back to whichever step they point to.

If an entity or a cross-module rule needs defining along the way, **it goes in the foundations, not
in the PRD** ([`RULE-01`](../../foundations/rules/writing.md#rule-01)).

## Outputs

| What | Status or anchor |
|---|---|
| The PRD or the delta | `draft` → `designing` on approval |
| New `Q`s | Open; none blocking |
| The hash of each ID | Computed on approval |
| The change's task in the tracker, with the stages as a checklist | Anchored to the IDs |

## Judge

| Agent | Checks | Passes when |
|---|---|---|
| `cold-read-judge` | Reads the PRD **without the conversation** and lists what it would have to guess to build it | Nothing to guess, or opened as a `Q` |
| `prd-judge` | Every requirement complete and measurable, no vague words (*fast*, *easy*), no contradiction with the spec, every `FR` with its `AC`, every action with its permission and contract; every field with who writes it; every outside transition with what happens to the work in progress; every notice with its copy | All green |

Then **`spec-approval`**: the person approves.

## Keep in mind

- **A change on an `unmapped` module maps it first**: `/map-module` writes what the code does today, and the change is a delta over that ([`DEC-13`](../../decisions/DEC-13-map-on-demand.md)).
- **The body states what governs** ([`RULE-02`](../../foundations/rules/writing.md#rule-02)). In a change, the PRD is written as if it had always said the new thing.
- **Search the whole spec before writing.**
- **A contradiction is resolved on the spot** ([`RULE-09`](../../foundations/rules/writing.md#rule-09)).
- **Answers go in the PRD**, not in the conversation: nobody else reads the conversation.
- `Out of scope` is the only section written in the negative.

## Skills, agents and tools

| Kind | Name | For |
|---|---|---|
| Skill | `/specify` | The whole stage |
| Skill | `/specify-flow` | Flows, requirements and criteria for something new |
| Skill | `/specify-story` | The delta of a story |
| Skill | `/specify-define` | Placing a loose definition in the right layer |
| Skill | `/specify-fix-doc` | Correcting, splitting, moving or retiring a document |
| Skill | `/idea` | Sending something to `open/ideas.md` without breaking the work |
| Agent | `cold-read-judge` · `prd-judge` | The judges |
| MCP | `search_spec` · `resolve_id` · `get_history` | Read before writing |

## Per track

| Track | What changes |
|---|---|
| `full` | The whole procedure |
| `story` | Only the steps the story touches, as a delta against its IDs. Same judges |
| `fix` · `chore` | Does not run |

## Sources

Spec Kit (`/specify`, `/clarify`, checklist) · Kiro (EARS) · Cockburn (flows) · JTBD · Shape Up ·
Lean Startup · ATDD · pdd-kit (variations) · Reclee Spec (`/flujo`, cold read).
