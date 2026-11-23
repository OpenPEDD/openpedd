---
title: Sweep
description: ARCH-16 · Every question a change still has, from specify, architect, design and plan, asked at once with a recommendation each
owner: Kevin
version: "1.2"
updated: "2026-11-23"
---

# ARCH-16 · Sweep: every question at once

A change that asks as it goes keeps the person waiting: one question, an answer, ten minutes of work,
the next question. **A sweep finds every question the change still has, in every stage ahead, and
asks them in one sheet**, each with its options and a recommendation. The person answers once, and
the delegated stages then run without stopping ([`RULE-26`](../rules/cycle.md#rule-26)).

It runs **at any moment of a change**, from any stage: `pedd sweep`, or the skill `/sweep`.

## What it does

The tool runs the steps; each finder is a session that only reads ([`RULE-24`](../rules/cycle.md#rule-24)).

1. **Reads where the change stands**: its track, the stages it runs, the gates already passed, its branches ([`ARCH-06`](branches.md)).
2. **Runs one finder per stage still ahead**, in parallel. Each one uses its stage judge's checklist as the list of what may be missing:

| Finder | Looks for | Checklist of |
|---|---|---|
| `specify` | What a builder would have to guess: flows, permissions, who writes each field, outside transitions, copy, the metric | `cold-read-judge` · `prd-judge` |
| `architect` | Every decision still open: a choice with real options, an assumption the code does not prove, a cost with no price, an operation with more than one write and no crash plan | `architecture-judge` |
| `design` | A screen or state with no decided behavior or copy; data a screen assumes that the spec does not give | `design-judge` |
| `plan` | What stops the tasks being cut: an unclear dependency, missing test data, a criterion that cannot be tested | `analyze-judge` |

3. **Drops what is already answered**: by the spec, citing the ID ([`RULE-01`](../rules/writing.md#rule-01)), or by the code, citing the file ([`RULE-21`](../rules/cycle.md#rule-21)).
4. **Merges duplicates**: a question is asked once, by its owner. The what (`specify`) comes before the how (`architect`), and the how before the look (`design`).
5. **Writes each question** with: what it is about, in words ([`RULE-20`](../rules/cycle.md#rule-20)); what breaks if it is guessed; an options table; **the recommendation and its reason**; what backs it; and the questions that depend on it.
6. **Weighs and orders them** ([`ARCH-23`](weight.md)): `high` first, and among them what blocks a gate first, then hardest-first. A question that depends on another is written assuming the recommended answer.
7. **Shows the sheet**, in the chat and in `changes/<CHG>/sweep.md`: the `high` as questions; below them, the `medium` and `low` **as decided by their recommendation**, one line each with its weight. The person answers in one reply, and may overturn any line: *"all as recommended, except 3 and 7: …"*.
8. **Writes each answer where it belongs**, through the stage that owns it ([`RULE-10`](../rules/cycle.md#rule-10)):

| Answer about | Before its gate | After its gate |
|---|---|---|
| The what (`FR`, `NFR`, `ENT`, copy) | `specify` writes it in the PRD | A `proposal` delta, decided at the gate |
| The how | A row in the area's decisions table, or an `ADR`, on the architecture branch | A `proposal` delta |
| The look | The design branch | A `proposal` delta |
| Left unanswered | A `Q`, open | A `Q`, open |

9. **Asks again only what an answer changed**: when the person picks other than the recommendation, only the questions under it are rewritten. **One round, two at most.**

## Options

| Command | Does |
|---|---|
| `pedd sweep` | The stages still ahead of the change |
| `pedd sweep --stages specify,architect` | Only those stages |
| `pedd sweep --all` | Also the stages already passed; what it finds there is a `proposal` delta |
| `pedd sweep --accept-recommended` | Takes every recommendation, the `high` too. Each is recorded as decided by recommendation, and the `Acceptance Report` lists them for `accept`, by weight |
| `pedd sweep --ask-all` | Asks the `medium` and `low` too |
| `pedd sweep --from <dir>` | Uses the `<stage>.json` findings in a folder instead of running finders |

## How `pedd` runs it

| Step | How |
|---|---|
| The stages ahead | From the least advanced status of the requirements in the PRDs `definition.md` names: `specify` is behind once they are `specified`, `architect` and `design` once `designed`, `plan` once `building`. Without a definition, all four. `--stages` names them; `--all` takes all four |
| A finder | The command in `workspace.yaml` `agents.finder`, by default `claude -p` with only Read, Grep and Glob allowed; the prompt on its input names its stage, what it looks for and its checklist (`packages/cli/prompts/sweep-finder.md`). Every finder runs at once |
| What a finder returns | A JSON array: per question `key`, `about`, `target`, `breaks`, `options` (each with what follows), `recommended`, `reason`, `evidence`, `undo`, `depends_on`, `blocks_gate`; or `answered_by` alone, to drop it. One with no `about`, fewer than two options or no reason is left out and named |
| A finder that fails | Reported as not run, with why; the others go on, and the sweep exits non-zero ([`RULE-22`](../rules/cycle.md#rule-22)) |
| Duplicates | The same `key`, or the same target and three words or more in common: kept under the earlier owner, the rest named as *also found by* |
| What it leaves | `changes/<CHG>/sweep.md`, the sheet; `sweep/state.json`; and what each finder returned, in `sweep/findings/` |
| The reply | `pedd sweep <CHG> answer "…"`: a number and a letter picks an option, other words are a custom answer, `later` leaves it open; *all*, *ok* or *todo* takes every other recommendation |
| Round 2 | `pedd sweep <CHG>` again: only the reopened questions' finders run, told the answers given, and rewrite those questions under the same number |

The skill `/sweep` (`skills/sweep/SKILL.md`) runs it from a session: it shows the sheet, takes the
reply, and hands each answer to the stage that writes it.

## When it runs by itself

| Moment | Why |
|---|---|
| After `specify` frames the change (step 1) | The rest of the stage is answering, not discovering |
| At `spec-approval`, before `architect` and `design` start | Both start with every decision taken |
| Before `plan`, on the change branch | The last moment a person is in the loop before the delegated stages ([`RULE-13`](../rules/cycle.md#rule-13)) |

## Rules

| Rule | Why |
|---|---|
| Every question carries a recommendation | The person corrects; they do not start from blank |
| Only the `high` are asked; the rest are shown decided | The person spends the reply on what is costly to get wrong, and still sees the rest |
| A question is asked once, by its owner | The same doubt asked by two stages gets two answers |
| Answers go to the spec, the decisions or the design branch, never only the chat | Nobody else reads the chat |
| Finders read; they write nothing | Only the owner of each answer writes it |
| The sweep does not replace the judges | A judge still checks the result at its gate |
| `architect` in `guided` asks through the sweep sheet | One sheet for every decision, not one decision at a time |
