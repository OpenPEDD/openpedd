---
title: Open Item
description: ENT-19 · What does not govern yet
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

# ENT-19 · Open Item

An open item is something that **does not govern yet**. It lives in `open/` and never in the body of
the spec: if it did, an agent would read it as a rule.

| Kind | Where | Is |
|---|---|---|
| Question | `open/questions.md`, `Q-nn` | Something to decide. Closes only with a `DEC` ([`RULE-08`](../rules/writing.md#rule-08)) |
| Idea | `open/ideas.md` | Something loose, without a decision. No ID |
| Roadmap | `open/roadmap.md` | What comes next, in order |

A question may be blocking: then the stage that needs it does not pass its judge until it closes.
