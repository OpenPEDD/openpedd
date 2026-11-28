---
name: design-inventory
description: List every screen a change needs and every state each one can reach (initial, loading, empty, partial, populated, error, success, busy, disabled, no permission, no quota, offline), before any screen is drawn. Step 2 of OpenPEDD's design stage. Use when design starts on a change, when someone asks "what screens and states does this need", "inventario de pantallas", "qué estados faltan", or before building any screen from a PRD. Leaves the screen × state matrix in the design sub-issue; draws nothing.
---

<!-- Source: OpenPEDD spec design PRD v1.7 (step 2), RULE-32 v1.0 and DEC-36 v1.0. Change those first, then this file. -->

# Design inventory: every screen, every state

You list what the change has to show **before anything is drawn**, so no screen is designed only in
its ideal state. You draw nothing and write no code.

## Steps

1. **Read, before listing:** the PRD in scope (flows, `FR`s, screens, copy, exception flows), `Roles & Permissions`, the plan limits if the product has plans, and the `Test Data`. Then **read [../design/references/states.md](../design/references/states.md) in full**: it is what each row is checked against.
2. **List the screens.** One row per screen the flows pass through, new or changed: its route, the `FR`s it serves, and the screen in the code it changes, with its path (RULE-21). A dialog, drawer or step with states of its own is a row.
3. **Mark each state** of RULE-32 for each screen: `✓` it applies, with one line on what triggers it from the flows; `n/a` with the reason. Use the table at the end of `states.md` as a starting point, never as the answer: the PRD's flows decide. Every exception flow of the PRD lands on at least one state.
4. **Per role.** For each role in `Roles & Permissions` that reaches the screen, note what it cannot see or do. Each "no" is a `no-permission` state, or an action that is not shown.
5. **Volumes.** For `populated`, name the three volumes from the `Test Data`: one item, typical, maximum. If the `Test Data` lacks the maximum (the longest name, the most rows), say so: it is a gap for `specify`, written as a `proposal` delta.
6. **Gaps.** A state the PRD does not say what to show for (what does the empty list say? what happens without permission?) is a question. Gather them all and ask once, each with its recommendation (RULE-26).
7. **Write the matrix** in the design sub-issue, and nothing else.

## The matrix

```markdown
| Screen | Route | FRs | initial | loading | empty | partial | populated | error | success | busy | disabled | no-permission | no-quota | offline |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Invoices list | /invoices | FR-BIL-01, 02 | n/a: shows data at once | ✓ | ✓ first use · ✓ no results | ✓ one total missing | 1 · 40 · 2,000 | ✓ read | ✓ bulk send | ✓ send | ✓ send with no email | ✓ seller: no amounts | ✓ 100 on free | n/a: read only |
```

Under it: the questions with their recommendations, and the `Test Data` gaps.

## Done when

Every screen the flows pass through has a row, every cell is `✓` with its trigger or `n/a` with its
reason, every exception flow lands on a state, and the questions are asked in one sheet.

## Never

- Draw, mock or code a screen. That is `/design-variants`.
- Leave a cell empty. Empty is the state nobody decided.
- Answer a product question yourself. It is asked, with a recommendation.
