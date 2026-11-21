---
title: "DEC-23 · A request is a change branch"
description: What happens in the repo when a client asks for something
owner: Kevin
version: "1.1"
updated: "2026-11-20"
---

# DEC-23 · A request is a change branch

**Date:** 2026-11-20

**When a client asks for something, a change branch is cut from the base holding only its definition**,
the input of `specify`. The request and the change are the same thing, with one ID: there is no request
record apart from the change. The detail is in [`ARCH-21`](../foundations/architecture/requests.md).

| The request is dropped | What happens |
|---|---|
| Before `spec-approval` | The branch is deleted. Nothing outside it exists, so nothing is left to sync |
| After `spec-approval` | It is retired through a change, so the issues and the trace record why |

This answers how a repo change names its request in the Cloud (`openpedd-cloud`'s `Q-10`): by its change ID.

**Why:** a request kept apart from its change is a second list that drifts from the first, and a
definition on a branch is reviewed, resumed and synced like any other change.
