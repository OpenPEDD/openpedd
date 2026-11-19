---
title: Guided definition
description: MKT-08 · How tools ask a person what they want built, how they decide they asked enough, and how they end. Surveyed 2026-11-19
owner: Kevin
version: "1.0"
updated: "2026-11-19"
---

# MKT-08 · Guided definition

Surveyed on 2026-11-19 for the client's definition chat ([`DEC-20`](../../decisions/DEC-20-definition-chat.md)).
**Read** is the page, code or issue opened that day; **snippet**, a search summary of the page;
**memory**, not checked ([`RULE-22`](../rules/cycle.md#rule-22)). kiro.dev, docs.bmad-method.org,
docs.lovable.dev, chatprd.ai and help.typeform.com were blocked by the session's network.

| Tool | Source | Asks | Stops when | Breaks or leaves out |
|---|---|---|---|---|
| Spec Kit `/clarify` | Read: `templates/commands/clarify.md`; issues #617, #1717, #3478 | Scans 10 areas as Clear, Partial or Missing and asks only about the last two, **one at a time**: 2 to 5 options with a recommended one, or a short answer. "yes" takes the recommendation; an unclear answer is asked again. Writes each answer into the spec at once | **5 questions at most**, nothing unclear left, or the person says "done". Ends with each area as Resolved, Deferred, Clear or Outstanding | The cap of 5 is disputed (#617). It once deferred 24 open items and still said nothing critical was left (#1717) |
| Spec Kit `/specify` · `/checklist` | Read: `templates/commands/specify.md`, `checklist.md` | At most 3 open markers, by scope, then security, then UX; every other gap is a default listed under Assumptions | 3 rounds of validating, then a warning with what still fails | Standard choices (retention, auth) are assumed, never asked |
| Spec Kit `converge` | Read: issue #3752 | — | Declared the spec converged with 4 of 16 scenarios checked | A completeness claim with no counts per item is false |
| BMAD `bmad-facilitate` | Read: `skills/core-tools/bmad-facilitate/SKILL.md`, `references/guidance-planning.md`, `rubric-planning.md`; issue #2373 | A brain dump first, read back. Then **coaching**, one question at a time and never more than 2 per message, or **fast**: the missing inputs in one batch, a draft with its assumptions, then section by section. Every fact goes to a log that survives a restart | Every section **settled**: filled, holding a named open question, or left out with a reason. "PRD · 6 of 24 done · open: X, Y". **When answers keep coming back unknown, it offers the fast path.** Ends with the 3 points it is least sure of | Heavy: a continue gate doubled the tokens (#2373). "A yes to a group accepts nothing" |
| Kiro, spec mode | Snippets; read: issues #5024, #10217, #10900 | Writes EARS requirements from the prompt; a card asks questions with options | An approval per phase; no completeness measure | Users ask for a question tool (#5024) and complain of too many questions (#10217) |
| Claude Code `AskUserQuestion` | Read: code.claude.com best practices and tools reference | Options with "Other" and notes. The documented recipe: interview until a spec can be written | The model judges it; no measure | No required items, no deferrals |
| Lovable plan mode | Snippets | Clarifying questions, then a plan the person edits; approving it builds | The person approves | No spec beyond the plan |
| ChatPRD | Snippets | Goals, users and metrics first; scores a draft on completeness; voice in progress | A score after drafting, not while asking | Made for product managers |
| Typeform "Clarify with AI" | Snippet | Up to 2 follow-ups after an open answer | A fixed count | No overall state |
| Jira Product Discovery · Productboard · Notion AI notes | Snippets | Templates, insights from feedback, voice transcripts and summaries | — | None of them asks |
| Linear Asks · v0 · Bolt · agency briefs | Memory | Forms with required fields; fixed questionnaires | Required fields | — |
| ISO/IEC/IEEE 29148 · INVEST | Snippet of the 2018 contents; the lists from memory | A requirement: necessary, unambiguous, complete, singular, feasible, verifiable. A set: complete, consistent, feasible | A checklist | Written for analysts |

## What it shows

| Finding | From |
|---|---|
| State is kept **per item**, and each item ends answered, deferred with an owner, or out with a reason | Spec Kit areas, BMAD settled sections |
| Completeness is a **count per item**; an item nobody checked counts as open | Spec Kit #3752 |
| Thin answers stop a loop by **offering a default**, recorded as an assumption, not as a fact | BMAD fast path, Spec Kit recommended option |
| A question carries options, a recommendation and why it matters; two or three per message at most | Spec Kit, BMAD, Claude Code, Kiro |
| A brain dump read back comes before any question; it suits voice | BMAD, Notion |
| What only the client knows is asked; a standard choice gets a default | Spec Kit `/specify` |
| The closing summary keeps what the person said apart from what was assumed | BMAD |
| A fixed cap on questions is resented; so is a stream of them | Spec Kit #617, Kiro #10217 |

**Nobody publishes a minimum map of what each kind of scope needs** (a product, a module, a request).
That part is new.
