---
title: The project's views
description: pedd view — a project's risks and assumptions, the system's qualities beside its architecture, and each approval in force with its history
owner: Kevin
version: "1.0"
updated: "2026-11-26"
status: draft
---

# The project's views

## Frame

A project is what gets estimated, quoted and approved ([`DEC-34`](../../decisions/DEC-34-dated-stages.md)):
besides its modules, it carries what the whole system shall be and what may stop it. These views show both,
read as the industry writes them ([`MKT-18`](../../foundations/market/quality-and-risk.md)), and each
approval of a stage with the ones before it. The rest of the views are [the views](prd.md#the-views).

## The views

| `kind` | Shows | Fed by | Loose when |
|---|---|---|---|
| `risks` | The project's RAID log: each risk, assumption, dependency or issue with its probability, impact, score, owner, response and status | `open/risks.md` (`RSK-nn`, [its columns](../../open/README.md#risks)) | — |
| `context` | Beside the drawing, the system's qualities: each `NFR-SYS-nn` with its ISO/IEC 25010 quality, what it shall be and how it is measured | `Quality Standards` ([`ENT-02`](../../foundations/domain/foundation.md)) | — |

## Requirements

| ID | Requirement | Reason | Roles | Criteria | Flows | Status |
|---|---|---|---|---|---|---|
| `FR-VEW-30` | The system shall build the `risks` view from `open/risks.md`: each row with its kind, probability, impact, their score, owner, response and status | What may stop the project is read with it, the worst first | Team · Client | `AC1` | F4 | `draft` |
| `FR-VEW-31` | The system shall carry in the `context` view the `NFR-SYS` table of `Quality Standards`, and count it and the risks as pieces of the project in `stages` | The system's qualities sit beside the architecture that meets them | Team · Client | `AC1` | F4 · F5 | `draft` |
| `FR-VEW-32` | When `stages.md` approves a stage more than once, the system shall take its last row as in force and keep the earlier ones as its history | A product grows by projects: each one approved on its date | Team · Client | `AC1` | F5 | `draft` |

## Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| `FR-VEW-30.AC1` | A dependency of medium probability and high impact, owned by Ana, and an assumption being watched | `risks` opens | The dependency with score 6 and its owner; the assumption *watching* |
| `FR-VEW-31.AC1` | `Quality Standards` with one system quality (performance efficiency) and `open/risks.md` with two rows | `context` and `stages` open | The quality in a table beside the drawing; the project's *qualities* and *risks* done, and *risks* missing without the file |
| `FR-VEW-32.AC1` | The project approved on 2026-11-21 and again on 2027-03-01 for stage 2 | `stages` opens | In force since 2027-03-01, the first approval as its history |
