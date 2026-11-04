---
title: "DEC-11 · One public repo, the Cloud private"
description: Closes Q-20
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

# DEC-11 · One public repo, the Cloud private

**Closes:** `Q-20` · **Date:** 2026-11-04

| Repo | Visibility | Holds | License |
|---|---|---|---|
| `openpedd/openpedd` | Public | The framework people download, **with its spec in `spec/`** and its docs | Code Apache-2.0; spec CC BY 4.0 |
| `openpedd/openpedd-cloud` | Private | The paid product: its code, and its spec in `spec/` (business, pricing, Cloud modules) | — |

**Until the trademark is filed, everything is private.**

Both repos use `mono` mode ([`ARCH-03`](../foundations/architecture/workspace.md#modes)). The Cloud's
spec references this one by ID, read-only, and never redefines it. They move to `split` when a help
center or docs site needs its own publishing pace.

Anyone may propose a change to OpenPEDD through an issue or a PR in `openpedd/openpedd`: it is a
delta in `spec/changes/`, and the maintainers approve the merge gates.

**Why:**

| Reason | |
|---|---|
| **One place** | Stars, issues, pull requests and the link people recommend all land on the same repo. A separate public spec repo splits them and confuses which one to follow |
| **The spec next to the code is the demo** | Whoever opens the repo sees `spec/` and understands that OpenPEDD is built with OpenPEDD |
| **Contributing is the method** | A contribution starts as a delta and goes through the gates, so the framework is seen working |
| **It follows `ARCH-03`** | `mono` is for one person or a project that does not publish yet; the reason for `split` (a private spec and a public help) does not apply when code and spec are both public |

What is charged, and how that is decided, is not published: it lives in `openpedd-cloud`.
