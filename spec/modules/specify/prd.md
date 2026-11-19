---
title: specify
description: Stage 1 · Defines what is built and why; the only stage that writes the spec
owner: Kevin
version: "1.9"
updated: "2026-11-19"
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

1. **Frame.** Who, what triggers it, in what state it ends. The goal as the job the user hires the product for. Then **a sweep** asks, in one sheet, everything the rest of the change still lacks ([`ARCH-16`](../../foundations/architecture/sweep.md)); the steps below write the answers.
2. **Class and metric.** New, improvement or debt. The `Success metric` with `baseline`, `target` and `review date`, and the `Tracking Plan` event that measures it.
3. **Appetite and `Out of scope`.** How much it is worth spending, and what is not built. The risks.
4. **Flows.** The `Main flow`, then the `Alternate flows` (they branch and return) and the `Exception flows` (they end the flow).
5. **Requirements.** From the flows: `FR` (what the user does or sees) and `NFR` (what the system does), in EARS ([`ENT-03`](../../foundations/domain/requirement.md)). A `NFR` with a time or a volume carries the number. Each one names **what it needs from another module**, in `depends_on`.
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
| The definition notes, when a client defined it in a conversation | `changes/<CHG>/definition.md` |
| The change's issue (the one that already exists, if any), and on approval **one sub-issue per stage with a branch and a gate that its track runs**, with their blocks and anchors, unassigned and in the backlog. Created once: it looks up the anchor and updates before creating ([`ARCH-15`](../../foundations/architecture/tracker.md)) | Anchored to the IDs |

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

| Kind | Name | For | Reads | Leaves |
|---|---|---|---|---|
| Skill | `/specify` | The whole stage | The idea or the story; the module's `live` PRD and code | The PRD or the delta, judged; the change's issue and sub-issues |
| Skill | `/specify-flow` | Flows, requirements and criteria for something new | The frame and the sweep's answers; the foundations it cites | Flows, `FR`, `NFR`, contracts, screens and copy, `AC`s and test data |
| Skill | `/specify-story` | The delta of a story | The story and its criteria, from the tracker; the PRD it touches | The delta against the IDs it touches |
| Skill | `/specify-define` | Placing a loose definition in the right layer | A loose definition | The definition in its layer: an `ENT`, a `RULE`, the glossary or a foundation |
| Skill | `/specify-fix-doc` | Correcting, splitting, moving or retiring a document | The document and its history | The document corrected, split, moved or retired, with its history |
| Skill | `/specify-interview` | A client's definition, in a conversation until it is complete ([`ARCH-18`](../../foundations/architecture/definition.md)) | What the client says; the spec and the code, to drop what is answered | `changes/<CHG>/definition.md`: each item of the scope's map with its state and the client's words; the summary the client confirmed |
| Skill | `/sweep` | Every open question of the change, at any stage, in one sheet ([`ARCH-16`](../../foundations/architecture/sweep.md)) | The change in scope, and what each stage ahead needs | One sheet: each question with its options and a recommendation; the answers, written where they belong |
| Skill | `/idea` | Sending something to `open/ideas.md` without breaking the work | Something loose said while working | A line in `open/ideas.md` |
| Agent | `cold-read-judge` · `prd-judge` | The judges | — | — |
| MCP | `search_spec` · `resolve_id` · `get_history` | Read before writing | — | — |

## Per track

| Track | What changes |
|---|---|
| `full` | The whole procedure |
| `story` | Only the steps the story touches, as a delta against its IDs. Same judges |
| `fix` · `chore` | Does not run |

## Sources

Spec Kit (`/specify`, `/clarify`, checklist) · Kiro (EARS) · Cockburn (flows) · JTBD · Shape Up ·
Lean Startup · ATDD · pdd-kit (variations) · Reclee Spec (`/flujo`, cold read).
