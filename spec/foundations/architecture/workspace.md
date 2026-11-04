---
title: Workspace repos
description: ARCH-03 · One repo per audience, the two modes, several specs, and hosting
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

# ARCH-03 · Workspace repos

A [`Workspace`](../domain/workspace.md) has **one repo per audience**, prefixed with the project name
([`DEC-09`](../../decisions/DEC-09-repos.md)).

| Repo | Holds | Audience | Published at |
|---|---|---|---|
| `<project>-spec` | The spec and `workspace.yaml` | The team and the agents | A private site, and the MCP |
| `<project>-help` | The Help Center and the Release Notes (`/changelog`) | Product users | `help.<domain>` |
| `<project>-docs` | The generated API Reference and developer guides | Integrators | `docs.<domain>` |
| Code repos | The code, with `spec.lock` | The team | Wherever they already deploy |

| Why apart | What happens together |
|---|---|
| The spec is private; help and API docs are public | A public repo exposes the spec, or a private one publishes the help with the wrong permissions |
| They publish at different paces | Every spec change triggers a help deploy |
| Different people write and read them | Design must read the spec without cloning code |
| Each uses its own tool | Help in Fumadocs, Mintlify or Docusaurus; the API in anything that reads OpenAPI |

Help and docs repos hold **standard content** (Markdown, MDX, OpenAPI): they publish anywhere,
without depending on OpenPEDD.

## Modes

| `mode` | Is | For |
|---|---|---|
| `split` (default) | One repo per audience | Teams, and any product with outside users |
| `mono` | One repo with the code and `spec/`, `help/`, `docs/` folders | One person, an open-source project where code and spec are both public, or a project that does not publish yet |

In `mono`, `workspace.yaml` sits at the repo root. `mono` can move to `split` later: the CLI moves
the folders to their repos and updates the references.

## Several specs [#several-specs]

A project may have **a public spec and a private one**. The private one references the public one by
ID, read-only, and never redefines it. It is declared with `references` in `workspace.yaml`, and the
MCP resolves IDs from both. OpenPEDD itself works this way, in `mono`: `openpedd/openpedd` is public
with its spec in `spec/`, and `openpedd/openpedd-cloud` is private with the Cloud's spec in its own
`spec/` ([`DEC-11`](../../decisions/DEC-11-visibility.md)).

## Hosted

| What | Free (local) | OpenPEDD Cloud |
|---|---|---|
| Create and connect repos | `pedd init` with the GitHub CLI | A GitHub App, from the dashboard |
| Publish the spec | The team hosts it | A private site with SSO |
| Publish help and docs | The team hosts them | Public sites with their own domain, or a deploy to the customer's hosting |
| When the spec changes | `publish` runs by hand | The sync opens the PRs in `-help`, `-docs` and the code |
| The MCP | Local, over stdio | Hosted, with a token per person |
