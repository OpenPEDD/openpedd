# Usability: how a screen is judged before a person suffers it

Three tools, in the order they pay: a **cognitive walkthrough** of the flow, the **heuristics** on
each screen, and the **friction count**. Each problem found is reported as
[findings.md](findings.md) says.

## Cognitive walkthrough of a flow

Take the PRD's main flow, step by step, as the role that runs it, with the `Test Data`. At each
step, ask the four questions (Wharton, Rieman, Lewis and Polson, 1994):

| Question | A "no" means |
|---|---|
| Will the person try to do this step? Do they know it is needed? | The step is hidden in the system's logic: remove it, or say why it is needed |
| Will they notice that the control for it is there? | It is below the fold, behind a menu, or looks like something else |
| Will they connect that control with what they want? | Its label is in the team's words, not theirs (use the `Glossary`) |
| After acting, will they see that it worked? | Feedback is missing, late, or far from where they look |

Then run the PRD's exception flows the same way: what the person sees when it fails is part of the
flow.

## The ten heuristics, as checks

Nielsen's ten (1994, reviewed 2024), each with what to look at on a screen of a product like this.

| # | Heuristic | Check on the screen |
|---|---|---|
| 1 | Visibility of system status | Every action answers within 0.1 s (pressed state), shows progress past 1 s, and says when it landed. The person always knows where they are and what is selected |
| 2 | Match with the real world | Words from the `Glossary`, in the person's language; dates, numbers and money in their locale; the order the work happens in |
| 3 | User control and freedom | Undo or cancel for what can go back; a way out of every dialog, step and filter; Back works |
| 4 | Consistency and standards | The same piece, word and place for the same thing across the product, and the platform's conventions ([screens.md](screens.md)) |
| 5 | Error prevention | Constraints instead of messages (a date picker, a select with only valid options); a confirmation only for the irreversible; sensible defaults |
| 6 | Recognition over recall | Options shown, not remembered; recent and suggested values; the context of a step visible while doing it |
| 7 | Flexibility and efficiency | Shortcuts and bulk actions for frequent work, which a newcomer never needs |
| 8 | Aesthetic and minimalist design | Every element serves the job of the screen ([visual.md](visual.md)); the rest goes behind a click |
| 9 | Recognize, diagnose, recover from errors | The message says what happened, why, and how to fix it, in plain words, next to its source, keeping the input; no bare codes |
| 10 | Help and documentation | Help next to the step that needs it; a Walkthrough or article where the project declares them |

## Interaction laws, applied

Only the well-founded ones, each turned into a decision.

| Law | Decision |
|---|---|
| **Fitts** | A target's size and distance set how fast it is reached. Targets at least 24 × 24 px (WCAG 2.5.8), 44 px for the primary ones on touch. The action sits next to what it acts on |
| **Hick-Hyman** | Choosing slows as choices grow, most of all in an unordered list. Show fewer options at once, give a default, order lists in a way the person can predict (alphabetical, by frequency). It holds weakly for menus a person scans |
| **Jakob** | People expect a product to work like the others they use. Reuse the product's own patterns first, then the platform's; a novel pattern needs a reason |
| **Response time** (Doherty; Nielsen's 0.1, 1 and 10 s) | Feedback under 400 ms keeps the person in flow. Under 0.1 s, nothing extra is needed. Past 1 s, show progress. Past 10 s, show the percentage and let them leave |
| **Chunking** | Group long sequences (a card number, a long form) into short groups. Not a limit of seven items on a menu: what is visible need not be remembered |
| **Tesler** | Complexity that cannot be removed is moved to the system: defaults, inference, autofill |

## Cognitive load

| Reduce it by | For example |
|---|---|
| Asking less | Infer what the system knows; drop optional fields nobody uses |
| Showing less at once | Progressive disclosure: the advanced options behind "More options" |
| Deciding for the person | One recommended option, marked, instead of five equal ones |
| Keeping context | The record's name stays visible while editing it |
| Writing less | One line where a paragraph was; the verb on the button |

## The friction count

For each flow, count, from the main flow and the screen as built:

| Count | Compare with |
|---|---|
| Steps and screens | The steps of the PRD's flow; each extra one needs a reason |
| Fields the person types | Fields the system could infer or default |
| Decisions the person must make | Decisions with a recommended option |
| Waits over 1 s | The `Quality Standards` budgets |
| Places a mistake is possible | Places a constraint could prevent it |

A flow whose count grew against its PRD is a delta: either the PRD's flow was short, or the screen
added friction.
