---
title: Workspace repos
description: ARCH-03 · One monorepo by default, split repos when a part must be apart, several specs, and hosting
owner: Kevin
version: "1.2"
updated: "2026-11-20"
---

# ARCH-03 · Workspace repos

A [`Workspace`](../domain/workspace.md) is **one monorepo by default**
([`DEC-22`](../../decisions/DEC-22-monorepo-default.md)): the spec, every surface people see, and the
packages they share.

## The monorepo (`mono`, default) [#modes]

| Path | Holds | Audience | Deploys to |
|---|---|---|---|
| `spec/` | The spec; `workspace.yaml` at the repo root | The team and the agents | A private site, and the MCP |
| `apps/app` | The product | Its users | Its own project, by the team's host |
| `apps/landing` | The public site | People who do not know the product yet | `<domain>` |
| `apps/docs` | The generated API Reference and developer guides | Integrators | `docs.<domain>` |
| `apps/help` | The Help Center and the Release Notes (`/changelog`) | Product users | `help.<domain>` |
| `packages/ui` | The design system: tokens and components, with its Storybook, the component catalog of the `Brand System` ([`MKT-06`](../market/component-catalogs.md)) | The apps, and the agents through its MCP | Not deployed; the Storybook is published with the docs |
| `packages/i18n` | The message keys and the locales ([`DEC-21`](../../decisions/DEC-21-i18n-from-day-one.md)) | The apps | Not deployed |

| Rule | Why |
|---|---|
| **Every app deploys on its own**: its own project on the host, its own root directory, built only when it or a package it imports changed | A typo in the help does not redeploy the product |
| The apps import components only from `packages/ui` and text only from `packages/i18n` | The app, the landing and the help look and speak the same, and change together |
| CI runs only what a change affects, through the workspace manager (Turborepo, Nx); everything runs where [`ARCH-11`](pipeline.md) says | The pipeline does not grow with the number of apps |
| Help and docs hold **standard content** (Markdown, MDX, OpenAPI) | They publish anywhere, without depending on OpenPEDD |

Each app and package is a `component` in `workspace.yaml`, mapped to the modules it implements; that
mapping is what the [code index](code-index.md) is built on.

## Split repos (`split`) [#split]

| Repo | Holds |
|---|---|
| `<project>-spec` | The spec and `workspace.yaml` |
| `<project>-help` · `<project>-docs` | The Help Center and the API Reference, when they are not in a code repo |
| Code repos | The code, with `spec.lock` |

`split` is for two cases only:

| Case | Why apart |
|---|---|
| A product **adopted with several repos** | The spec cannot live inside one part of it |
| **Open-source code with a private spec** | A repo's access is all or nothing: a private folder in a public repo does not exist ([`MKT-10`](../market/monorepos.md)) |

In `split`, each repo has a `link.yaml` pointing back to the spec. `mono` can move to `split` later:
`pedd workspace split` moves the folders to their repos and updates the references. There is **one
spec per product** in every case ([`modules/workspace`](../../modules/workspace/prd.md#the-layout)).

## Several specs [#several-specs]

A project may have **a public spec and a private one**. The private one references the public one by
ID, read-only, and never redefines it. It is declared with `references` in `workspace.yaml`, and the
MCP resolves IDs from both. OpenPEDD itself works this way: `openpedd/openpedd` is public with its spec
in `spec/`, and `openpedd/openpedd-cloud` is private with the Cloud's spec in its own `spec/`
([`DEC-11`](../../decisions/DEC-11-visibility.md)).

## Hosted

| What | Free (local) | OpenPEDD Cloud |
|---|---|---|
| Create and connect repos | `pedd init` with the GitHub CLI | A GitHub App, from the dashboard |
| Publish the spec | The team hosts it | A private site with SSO |
| Publish help and docs | The team hosts them | Public sites with their own domain, or a deploy to the customer's hosting |
| When the spec changes | `publish` runs by hand | The sync opens the PRs in the help, the docs and the code |
| The MCP | Local, over stdio | Hosted, with a token per person |
