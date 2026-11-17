---
title: Review lenses
description: ARCH-14 · What each hunter looks at, the default checklist of each lens, and how a project adds its own
owner: Kevin
version: "1.0"
updated: "2026-11-13"
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
| Security | `Security Policy`, `Privacy` | Never |
| Interface | `Brand System`, `Voice & Tone`, `Quality Standards` | No screen touched |
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
| Interface | With `locales`: no text written in code, every key in every locale, no dead keys, one tone; third-party components get the copy too |
| Interface | Operable by keyboard; icon-only buttons have a label; what changes on its own is announced; no layout shift while loading |
| Performance | The reads a screen needs at mount go in one; no request twice; large lists paginated in the database, never truncated in silence |
| Change | Searched before writing: nothing duplicated; nothing dead, commented out, or `TODO` without an issue |
| Change | One commit per unit of work, with its test and its doc |
| Change | The PR says what changes for the user, its migrations and where they are applied, what only moved, and the debts left out, besides its Spec section |
| Change | Over the line budget of the `Delivery Pipeline` (400 by default), it is split into chained PRs |

## A project's own items

A project adds items in `Architecture Rules` and `Quality Standards`, each with its lens and the
change it came from ([how the rules grow](review.md#how-the-rules-grow)). A project may switch a
default item off by naming it, with the reason. A new lens is a section of `Architecture Rules`
with what it reads.
