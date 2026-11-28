---
title: Review lenses
description: ARCH-14 · What each hunter looks at, the default checklist of each lens, and how a project adds its own
owner: Kevin
version: "1.3"
updated: "2026-11-28"
---

# ARCH-14 · Review lenses

A lens is what one hunter looks at ([`ARCH-13`](review.md)). Each reads the area's pack plus the
foundations of its lens, and nothing else. The defaults come from the corrections of Reclee's PRs
(2026-09 to 2026-11): none is theoretical. **An item a linter can see is not here**: it is lint.

| Lens | Reads | Off when |
|---|---|---|
| Spec | The area's `FR`, `NFR` and `AC`; drift: what the code does that the spec does not say | Never |
| Permissions | `Roles & Permissions` | Never |
| State and lifecycle | The `Domain Model` states; the write contract in `Quality Standards` | No writes in the diff |
| Data and contracts | The contracts, the schema, `Privacy` | No contract or schema touched |
| Security | `Security Policy`, `Privacy`; the OWASP ASVS 5.0 chapters of the surfaces the area touches, and OWASP's Top 10 for LLM Applications where it calls a model ([below](#security-findings)) | Never |
| Interface | `Brand System`, `Voice & Tone`, `Quality Standards`; the interface rules ([`RULE-32`](../rules/interface.md#rule-32), [`RULE-33`](../rules/interface.md#rule-33)), and what an interface finding names ([below](#interface-findings)) | No screen touched |
| Performance | `Quality Standards` budgets | Never |
| Change | `Architecture Rules`, `Delivery Pipeline` | Never |

## The default items

| Lens | Item |
|---|---|
| Permissions | Every new table or resource has its access rule and its cells in the permission matrix ([`ARCH-10`](testing.md#permissions)) |
| Permissions | Access requires an active membership, not an invitation |
| Permissions | A count with a person's session counts only what they see: it never decides a global action |
| State | A write says whether it landed; success is shown only after it did |
| State | An optimistic update keeps the previous value, and on failure reverts it and says so |
| State | A dialog closes only once its write is confirmed |
| State | Loading, empty and error are three states; an error never reads as empty |
| State | No empty value seeded before reading, and no invented default on screen (a year `0`) |
| State | No mock or simulated data reaches the product; what reads after a write is refreshed |
| Data | No business rule in the transport layer: an action or route validates and calls the use case |
| Data | Every input is validated and bounded: a list without a maximum is an open door |
| Data | The client never recomputes what the server computes; enums are the database's |
| Data | Migrations go forward; an applied one is never edited; each works with the code before and after ([`ARCH-08`](release.md#migrations)) |
| Data | Delete by ID, never by text; a changed function signature drops the old one |
| Security | An uploaded file: its type checked on the server, an archive's size before unpacking, foreign markup sanitized |
| Security | Private files have a policy per tenant; a personal document never has a public URL |
| Security | No personal data in scripts, seeds, fixtures or logs; each setting exists in every environment |
| Interface | Every branch of the screen opened, not only the happy path: empty, error, the one never mounted |
| Interface | No text written in code, every key in every locale, no dead keys, one tone; third-party components get the copy too |
| Interface | Operable by keyboard; icon-only buttons have a label; what changes on its own is announced; no layout shift while loading |
| Performance | The reads a screen needs at mount go in one; no request twice; large lists paginated in the database, never truncated in silence |
| Change | Searched before writing: nothing duplicated; nothing dead, commented out, or `TODO` without an issue |
| Change | One commit per unit of work, with its test and its doc |
| Change | The PR says what changes for the user, its migrations and where they are applied, what only moved, and the debts left out, besides its Spec section |
| Change | Over the line budget of the `Delivery Pipeline` (400 by default), it is split into chained PRs |

## A security finding [#security-findings]

Taken from how agents audit code ([`MKT-19`](../market/security-audit.md), [`DEC-35`](../../decisions/DEC-35-whole-repo-audit.md)):

| It names | For example |
|---|---|
| Who, with less trust, sends or does what | A member of another tenant, a URL in a document a model reads |
| The control that should stop it, and where it is missing | The handler does not check the requester's membership |
| What is reached, and the result | That tenant's invoices are read |

| Case | Is |
|---|---|
| All three named, from the code | A finding, with its severity |
| The fact that decides is outside the repository (the deployment, a provider's setting, a proxy) | A `Q` for the area with the exact fact missing, and no severity: the hunter does not guess |
| A missing best practice, with no boundary crossed | Not a finding. It becomes an item only from a correction ([how the rules grow](review.md#how-the-rules-grow)) |

A whole repository is not reviewed here: it is audited by an extension, on request ([`DEC-35`](../../decisions/DEC-35-whole-repo-audit.md)).

## An interface finding [#interface-findings]

Shared by the Interface lens, `design-judge` and `/design-audit` ([`DEC-36`](../../decisions/DEC-36-interface-quality.md)), the way a security finding is:

| It names | For example |
|---|---|
| Where: the screen, its state, the width and theme, and the element | The invoices list, empty with no results, at 375 px, in dark |
| The source it breaks: a token, piece or pattern of the `Brand System`, an interface rule, a WCAG 2.2 criterion, or a Nielsen heuristic | WCAG 1.4.3: the muted text is 2.9:1 on its surface |
| Who it stops, from doing what | A person on a phone cannot reach "Pay" |

| Case | Is |
|---|---|
| All three named, measured on the screen or read in the code | A finding. Its severity follows Nielsen's 0 to 4: `high` for 4 and 3 (a task cannot be finished, data or money is lost), `medium` for 2 (finished with friction or doubt), `low` for 1 (seen only side by side); 0 is not reported |
| The fact that decides is outside the product (real content, how often a flow runs) | A `Q` with the fact missing, and no severity |
| A preference, with no source broken | Not a finding: at most an improvement in the report ([`RULE-25`](../rules/cycle.md#rule-25)) |
| One cause seen in many places (a token, a copied piece) | One finding on the cause, listing the places |

## A project's own items

A project adds items in `Architecture Rules` and `Quality Standards`, each with its lens and the
change it came from ([how the rules grow](review.md#how-the-rules-grow)). A project may switch a
default item off by naming it, with the reason. A new lens is a section of `Architecture Rules`
with what it reads.
