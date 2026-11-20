---
title: Monorepos for a product and its sites
description: MKT-10 · How tools lay out one repo with the app, the landing, the docs, the help and a shared design system, and deploy each apart. Surveyed 2026-11-20
owner: Kevin
version: "1.0"
updated: "2026-11-20"
---

# MKT-10 · Monorepos for a product and its sites

Read on 2026-11-20. **(unverified)** marks what only a secondary source said.

| Tool | What it gives | Where it breaks | Source |
|---|---|---|---|
| **Turborepo** starters | `apps/web`, `apps/docs`, `packages/ui`, shared configs; the design-system example puts Storybook next to `packages/ui` | — | vercel.com/templates/react/turborepo-design-system |
| **Nx** | Project graph, `nx affected`, a free local cache | Distributed runs and the remote cache are paid (Nx Cloud) | nx.dev/docs/ci-features |
| **shadcn** | `init --monorepo`: `apps/web` and `packages/ui`, imported as `@workspace/ui` | Its CLI rewrites vendor files | ui.shadcn.com/docs/monorepo |
| **Vercel**, one project per app | Each app with its own root directory; unaffected projects skipped without a build slot | Skipped builds still count toward limits; threads report projects that stopped deploying | vercel.com/docs/monorepos/turborepo |
| **next-intl** in a shared package | Each app adds the package's messages and transpiles it | No end-to-end recipe; issue #1171 shows locale errors across packages | next-intl.dev/docs/usage/plugin |
| **Copybara**, subtree split | Mirror a public part out of a private monorepo | One more pipeline to keep | dagster.io/blog/monorepos-the-hub-and-spoke-model-and-copybara |

## What it shows

| Finding | From |
|---|---|
| `apps/*` plus `packages/ui` is the shape the starters agree on | Turborepo, shadcn |
| Each app deploys on its own, built only when it or what it imports changed | Vercel, `--affected` |
| CI stays bounded by running only what a change affects, with a cache | Nx, Turborepo |
| One Storybook with the design system serves every app, and agents through its MCP | Turborepo example, [`MKT-06`](component-catalogs.md) |
| A shared i18n package works if each app declares its message paths | next-intl |
| **Access is per repo, not per folder**: a public part of a private monorepo is a mirror or a repo of its own | Copybara; GitHub permissions |
