---
title: "DEC-27 · A request is draft, confirmed, then agreed, and is queued when agreed"
description: The statuses of a request's definition, and when it enters the queue
owner: Kevin
version: "1.0"
updated: "2026-11-20"
---

# DEC-27 · A request is draft, confirmed, then agreed, and is queued when agreed

**Date:** 2026-11-20

| Status | Set when | Set by |
|---|---|---|
| `draft` | The branch is cut | The interview |
| `confirmed` | The client confirms the summary | The client |
| `agreed` | The builder takes it, with who and when. It enters the queue | The builder |

Once `agreed`, the definition changes only through an edit branch the builder merges. The detail is in
[`ARCH-21`](../foundations/architecture/requests.md) and [`ARCH-18`](../foundations/architecture/definition.md#the-file).

| Option | Discarded, and why |
|---|---|
| `accepted` for the third status | It is already the change's and the requirement's status after `accept`: one word, two meanings |
| Queued when confirmed | Work nobody has taken yet would hold a place in the order |

**Why:** the builder plans the deliveries; a request is work only once they took it.
