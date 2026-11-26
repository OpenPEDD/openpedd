---
title: "DEC-35 · Human time is counted from the messages a person types, by step and by piece kind"
description: Each typed message appends a human event with its time and the step open, never its text; clustered at 15 minutes plus 2, read by stage, person, piece kind and credit
owner: Kevin
version: "1.0"
updated: "2026-11-26"
---

# DEC-35 · Human time is counted from the messages a person types, by step and by piece kind

**Date:** 2026-11-26

**What a stage costs in people is measured from the messages each person types to their agent, never
from the step's clock and never from what the message says**
([`ENT-23`](../foundations/domain/trace-event.md#human-time)).

| Case | What happens |
|---|---|
| A person types a message | A `human` event: its time, the person, the session, the step they have open |
| Two messages under 15 minutes apart | The time between them is work, on the first one's step |
| The last message before a pause | 2 minutes |
| A step builds more than one piece kind | Its time is split evenly among them; a step on one kind counts it alone |
| A kind with a weight in `workspace.yaml` `pieces` | Its hours per credit are shown ([`ENT-16`](../foundations/domain/workspace.md)) |
| A message while no step is open | Counted as *outside any step* |

It is read by `pedd time` ([process metrics](../modules/cycle/prd.md#process-metrics)) and installed by
`init` ([the human clock](../modules/workspace/prd.md#the-human-clock)). The tools surveyed are
[`MKT-19`](../foundations/market/effort-measurement.md).

**Why:** a studio that sells by credits must set each piece's weight from the hours it really took.
An agent's clock counts the machine; a message counts a person at the keyboard, and its text is theirs.
