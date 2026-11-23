---
name: sweep
description: Ask the person every question a change still has, in every stage ahead (specify, architect, design, plan), in one sheet, and write each answer where it belongs. Use before architect and design start, before plan, or whenever someone wants to answer everything at once ("ask me everything now", "sweep CHG-031", "barrido", "preguntame todo junto"). Runs pedd sweep, shows the heavy questions, takes one reply, and has each answer written by the stage that owns it.
---

<!-- Source: OpenPEDD spec ARCH-16 (sweep) v1.2, ARCH-23 (weight) v1.2, RULE-26 and RULE-28. Change those first, then this file. -->

# Sweep: every question at once

You run the sweep of one change. **The tool finds, merges, weighs and orders the questions; you show
them, take one reply, and see that each answer is written where it belongs.** You never ask one
question, wait, and ask the next.

## Run it

1. Find the change: the `CHG-nnn` the person names, or the one in `spec/changes/` on the current branch.
2. Run `pedd sweep CHG-nnn` (add `--stages …` if the person names stages). It runs one read-only finder per stage still ahead and writes `spec/changes/CHG-nnn/sweep.md`.
3. If a finder did not run, say which and why, as the tool printed it. Do not fill its questions in yourself.

## Show the sheet

- Show the **questions to answer** as the sheet writes them: the question in plain words, what breaks if it is guessed, the options with the recommended one marked, and why. The ID only in parentheses (RULE-20).
- Then the **decided ones** as one short list: *"I took the recommendation on these; overturn any in the same reply."*
- End with: *"Reply once: 'all as recommended', or 'all as recommended, except 1: b, 4: …'."*

## Take the reply

1. Run `pedd sweep CHG-nnn answer "<the person's reply, as they wrote it>"`.
2. If it says a round 2 is needed, run `pedd sweep CHG-nnn` again: it rewrites only the reopened questions. Show those, take one more reply, answer it. **Never a third round**: what is left stays open.

## Write each answer where it goes

The sheet's **Answers** table says where each one goes. Each is written by the stage that owns it
(RULE-10), never left only in the chat:

| Goes to | Who writes it |
|---|---|
| `specify` writes it in the PRD | `/specify`, in the PRD of the change |
| A row in the area's decisions table, or an `ADR` | `/architect`, on the architecture branch |
| The design branch | `/design` |
| A `proposal` delta | The stage that owns it, as a delta decided at its gate |
| A `Q`, open | `/specify`, in `open/questions.md` |

Hand each group to its stage, or do it yourself if you are running that stage. Report what was
written and where, and what is still to write.

## Never

- Answer a question for the person, or drop one the tool showed.
- Ask anything the sheet does not hold. A new doubt goes through another `pedd sweep`.
