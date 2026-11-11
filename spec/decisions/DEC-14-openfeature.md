---
title: "DEC-14 · Code asks for flags through OpenFeature"
description: The API of the flags category
owner: Kevin
version: "1.0"
updated: "2026-11-11"
---

# DEC-14 · Code asks for flags through OpenFeature

**Date:** 2026-11-11

When a project uses flags, its code evaluates them through OpenFeature, with whichever provider it
chooses. A table in the project's own database is the default provider. The detail is in
[`ARCH-09`](../foundations/architecture/flags.md).

**Why:** the framework stays flexible about tools, and `build` writes the same call everywhere.
OpenFeature standardizes asking, not changing, so launching still needs an adapter per provider
([`MKT-03`](../foundations/market/delivery.md)).
