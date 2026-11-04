---
title: Requirement
description: ENT-03 · A functional or non-functional requirement, and its lifecycle
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

# ENT-03 · Requirement

A requirement is one verifiable statement in a PRD. There are two kinds:

| Kind | ID | Says | Drives |
|---|---|---|---|
| `FR`, Functional Requirement | `FR-<MOD>-nn` | What the user does or sees | Design |
| `NFR`, Non-Functional Requirement | `NFR-<MOD>-nn` | What the system does: time, volume, reliability, integrations | Architecture |

Requirements are written in **EARS**: *"When `<trigger>`, the system shall `<response>`"*. A `NFR`
with a time or a volume carries the number. Every `FR` has at least one
[`Acceptance Criterion`](acceptance-criterion.md).

## Fields

| Field | What it holds |
|---|---|
| `id` | `FR-<MOD>-nn` or `NFR-<MOD>-nn`, never reused |
| `statement` | The EARS sentence |
| `reason` | Why, in one line, in the same cell ([`RULE-06`](../rules/writing.md#rule-06)) |
| `roles` | Who may trigger it, from `Roles & Permissions` |
| `criteria` | Its `AC` IDs |
| `hash` | The content hash, recomputed on merge |
| `status` | Its place in the lifecycle below |

## Lifecycle [#lifecycle]

The lifecycle applies to **each requirement and to the PRD**. A PRD's status is that of its least
advanced requirement. A user story touches two requirements, not the whole PRD.

| Status | Means | Set by |
|---|---|---|
| `draft` | Being defined | `specify`, on start |
| `designing` | Approved; waiting for architecture and design | `spec-approval` |
| `ready` | Architecture and design merged | The last of the two merge gates |
| `building` | Planned and under construction | `plan` |
| `in_review` | Built and verified; waiting for `accept` | `verify` |
| `live` | What is in production | `publish` |
| `changing` | Was `live`; a story is changing it. Back to `live` on publish | The story's `spec-approval` |
| `deprecated` | Retired. The ID stays dead | Whoever retires it, with a `DEC` |

A status is moved by a stage, never by hand ([`RULE-18`](../rules/cycle.md#rule-18)).
