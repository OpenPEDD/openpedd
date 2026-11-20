---
title: Mapping a business
description: MKT-11 · How an organization is mapped before its software is designed, as it is and as it will be. Surveyed 2026-11-20
owner: Kevin
version: "1.0"
updated: "2026-11-20"
---

# MKT-11 · Mapping a business

Read on 2026-11-20. **(unverified)** marks what only a secondary source said.

| Method | Produces | Takes | Approved by | Source |
|---|---|---|---|---|
| **BPMN, as-is and to-be** | Process models in lanes: roles, tasks, decisions, systems | Days to weeks of interviews **(unverified)** | Each process owner | omg.org/spec/BPMN |
| **Event Storming, Big Picture** | A timeline of events, hot spots, actors and systems; candidate boundaries | 2 to 4 hours a session | Consensus on the wall | blog.allegro.tech/2022/07/event-storming-workshops.html |
| **Service blueprint** | Customer actions, frontstage, backstage, support processes | Days | Stakeholders | nngroup.com/articles/service-blueprints-definition |
| **Org chart and RACI** | Roles, and who does, owns, is consulted and informed per activity | Days **(unverified)** | The sponsor | — |
| **Jobs-to-be-done interviews** | A timeline to the purchase, and the forces behind it | Per interview | The team | jobstobedone.org/switch-interview |
| **Lean Inception** (Thoughtworks) | Vision, personas, journeys, a feature sequencer, an MVP canvas | One week | The group, at the final showcase | martinfowler.com/articles/lean-inception |
| **Design Sprint** (GV) | A map, a prototype tested with 5 users | 5 days | The Decider | gv.com/sprint |
| **AI drafting** (Crismo, PrimeBPM MapAI, IBM Blueworks Live) | A process draft from transcripts and documents | Minutes | Process owners still validate it; one vendor blog claims 70–80 % of steps **(unverified)** | primebpm.com/mapai; ibm.com/docs |

## What it shows

| Finding | From |
|---|---|
| No method covers all of it: roles from the org chart, processes from BPMN or Event Storming, pains from interviews, tools from the blueprint's support layer | All |
| The fastest as-is is a half-day Event Storming; its hot spots are the pains | Event Storming |
| The to-be is a marked copy of the as-is, process by process | BPMN |
| The modules and their order are what the feature sequencer leaves | Lean Inception |
| One named approver is simplest | Design Sprint |
| A draft from transcripts is a draft: each process is confirmed by who runs it | AI drafting tools |
| A pain with a quote and a person keeps the to-be honest | Jobs-to-be-done |
