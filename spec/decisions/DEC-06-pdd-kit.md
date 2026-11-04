---
title: "DEC-06 · pdd-kit: what we take, and where we differ"
description: Closes Q-06
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

# DEC-06 · pdd-kit: what we take, and where we differ

**Closes:** `Q-06` · **Date:** 2026-11-04

`itai-gendler/pdd-kit`, MIT, npm `pdd-toolkit`: the closest project found.

| It has | It does not have |
|---|---|
| A product model in Markdown, apart from how it is built: entities, interfaces, domains, capabilities, journeys, business rules, variations | A cycle: no architecture, design, plan or acceptance |
| `/pdd-map`, `/pdd-ideate`, `/pdd-verify` | Freshness of derived artifacts |
| A local viewer that reads each model change as a sentence | A tracker, Help Center or API Reference |
| Blueprints of common products | Separate history, deltas, judges in another session |
| Local-first, no account | A paid plan |

**We take:** the `map` stage, variations in the PRD, blueprints as an idea for starting, changes
read as sentences.

**We differ in:** the full cycle with gates, the freshness of every derived artifact, and generating
the Help Center and API Reference. pdd-kit models the product; OpenPEDD also keeps everything derived
from it up to date.
