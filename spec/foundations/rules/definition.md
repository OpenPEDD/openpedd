---
title: Definition rules
description: In what order a product is defined — its foundations for the whole road first, then each PRD when its module is next
owner: Kevin
version: "1.0"
updated: "2026-11-23"
---

These rules say **when** each part of a spec is written. How each part is written is in
[writing.md](writing.md); how each stage works, in [cycle.md](cycle.md).

## RULE-30 · The foundations are laid for where the product is going; the PRDs come one at a time [#rule-30]

Before the first PRD, the foundations are drawn for **the product the client wants to end up with**, not
only its first version: the later modules are listed with the first, and the domain, the roles and the
architecture hold them without changing ([map](../../modules/map/prd.md#business-mode)). Then each PRD is
written **when its module is next to be defined**, never all at once. A PRD that needs to change a
foundation does not change it: it raises a `Q`, and the change goes through a `DEC`
([`RULE-08`](writing.md#rule-08)). **A foundation that each new PRD bends is rebuilt under running code;
one drawn for the whole road lets every PRD be written late, when its answers exist.**
