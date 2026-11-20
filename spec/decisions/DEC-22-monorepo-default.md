---
title: "DEC-22 · A product starts as one monorepo"
description: The default layout of every product started with OpenPEDD
owner: Kevin
version: "1.0"
updated: "2026-11-20"
---

# DEC-22 · A product starts as one monorepo

**Date:** 2026-11-20 · **Supersedes:** the default of [`DEC-09`](DEC-09-repos.md)

**Every product started with OpenPEDD is one repo**: `spec/`, the apps (`app`, `landing`, `docs`,
`help`) and the shared packages (`ui`, the design system with its Storybook, and `i18n`). The apps share
components and look, and each one deploys on its own. `mono` is the default; `split` stays for a product
adopted with several repos, and for open-source code whose spec is private. The layout is in
[`ARCH-03`](../foundations/architecture/workspace.md).

**Why:** one agent sees the spec, the design system and every surface in one checkout, so a change to a
component reaches the app, the landing and the help in one pull request. The privacy that drove
`DEC-09` is kept where it matters: a repo's access is all or nothing, so a public part goes in a repo
of its own ([`MKT-10`](../foundations/market/monorepos.md)).
