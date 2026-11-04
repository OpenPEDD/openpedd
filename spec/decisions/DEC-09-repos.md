---
title: "DEC-09 · One repo per audience"
description: How a project's repos are laid out
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

# DEC-09 · One repo per audience

**Date:** 2026-11-04

**`<project>-spec`, `<project>-help` and `<project>-docs`**, plus the code repos, created or
connected with `pedd init`. Release Notes live in `-help`. `mono` mode for small projects. The detail
is in [`ARCH-03`](../foundations/architecture/workspace.md).

**Why:** the spec is private and the help and API docs are public; they publish at different paces;
and different people read each one.
