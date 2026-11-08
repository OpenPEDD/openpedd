---
title: architect
description: Stage 2 · Decides how to build what specify defined
owner: Kevin
version: "1.0"
updated: "2026-11-04"
status: draft
---

# Stage 2 · `architect`

**Mode:** `guided` (default) or `delegated` · **Gate:** `architecture-merge`

## What it is

Where **how** to build what `specify` defined is decided. Most of it is thinking about the possible
improvements: performance, optimization, good practice, and what each option costs. It runs in
parallel with `design`. It does not write the spec: it leaves `ARCH` documents, `ADR`s and deltas.

## Inputs

| What | From |
|---|---|
| The approved `NFR`s and `FR`s in scope | `specify` |
| The current code of the area | The repo |

## Context pack

The `NFR`s and `FR`s in scope · `Architecture Rules` · `Security Policy` · `Domain Model` ·
`Integrations` · `Quality Standards` · the area's existing `ARCH` and `ADR`. Budget:
**15,000 tokens**.

## Procedure

1. **Reads the `NFR`s** and turns them into quality scenarios: stimulus, response, measure.
2. **Researches options.** At least two for every non-obvious decision, with cost, risk and which `NFR` each meets.
3. **Decides**, or proposes for the person to decide (`guided`).
4. **Writes one `ADR` per decision**: context, options, decision, consequences.
5. **Updates the `ARCH` documents**: the area's diagram at the right C4 level, the data model, migrations, integrations.
6. **Turns each measurable `NFR` into a check**: a fitness function (a performance test, a size limit, a dependency rule) that `plan` loads into the pipeline.
7. **Records deltas.** If the architecture finds that a `FR` or `NFR` cannot be met as written, or that one is missing, that is a `proposal` delta. **The PRD is not edited.**
8. **Builds the `Delta Report`.**

## Outputs

| What | Anchored to |
|---|---|
| New `ADR`s | The `NFR`s they answer |
| Updated `ARCH` documents | The `NFR`s and `ENT`s they cover |
| Fitness functions | Their `NFR` |
| `proposal` deltas | `changes/<CHG>/deltas/` |
| `Delta Report` | `changes/<CHG>/reports/` |

## Judge

| Agent | Checks | Passes when |
|---|---|---|
| `architecture-judge` | Consistency with `Architecture Rules`, `Security Policy` and `Domain Model`; every `NFR` answered and measurable; no product decision hidden in an `ADR` | All green |

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
- **One decision, one `ADR`.** The reason goes in the `ADR`, not in the chat.
- **If it touches the same ID as `design`**, whichever merges second sees the conflict.

## Skills, agents and tools

| Kind | Name | For |
|---|---|---|
| Skill | `/architect` | The whole stage |
| Skill | `/architect-research` | Researching options for a decision |
| Skill | `/architect-adr` | Writing an `ADR` |
| Skill | `/architect-fitness` | Turning a `NFR` into a check |
| Agent | `architecture-judge` | The judge |
| MCP | `get_context_for` · `propose_delta` | The pack and the deltas |

## Per track

| Track | What changes |
|---|---|
| `full` | Everything |
| `story` | Only if it touches a `NFR` or a contract |
| `fix` · `chore` | Does not run. A `chore` that changes the architecture writes an `ADR` in its PR |

## Sources

C4 · ADR / MADR · arc42 · fitness functions · Spec Growth Engine · Spec Kit (`/plan`) · BMAD
(architect) · OWASP ASVS.
