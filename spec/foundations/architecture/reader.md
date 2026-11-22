---
title: Spec reader
description: ARCH-20 · The package that parses a spec, reads and writes a change's definition, numbers changes, renders the map and makes the data of a project's views, shared by the CLI and the Cloud
owner: Kevin
version: "1.1"
updated: "2026-11-22"
---

# ARCH-20 · Spec reader

**One package reads a spec, wherever it runs**: `@openpedd/reader`, in `packages/reader` of this repo,
published to npm under Apache-2.0 ([`DEC-26`](../../decisions/DEC-26-reader-package.md)). The CLI,
`npm run view` and OpenPEDD Cloud import it and parse every spec through it.

```
 files at a commit ──▶ @openpedd/reader ──▶ model ──┬──▶ pedd (check · index · status · branch · view)
 (path → text)                                      ├──▶ npm run view → the map, a static site
                                                    └──▶ OpenPEDD Cloud (pinned version)
```

## What it does

| Function | Takes | Gives |
|---|---|---|
| `readSpec` | The spec's files as path → text, held in memory | The model: documents with their frontmatter, sections and tables; modules, PRDs and requirements with their status ([`ENT-03`](../domain/requirement.md#fields)); the history lines |
| `readDefinition` · `writeDefinition` | A change's `definition.md` | Its frontmatter and items ([`ARCH-18`](definition.md#the-file)); written back in the same format |
| `nextChangeId` | The change IDs found on the base, its history and every change branch | The next `CHG-nnn` ([`ARCH-21`](requests.md#numbering)) |
| `renderMap` | The model | The map's HTML, the one `npm run view` writes |
| `viewData` · `renderViews` · `toMermaid` | The model, and the code index, trace and change branches when given | The data of every project view, its page, and one view as Mermaid ([`ARCH-22`](views.md)) |

It works only on the files the caller hands it. The CLI reads them from the
working tree; the Cloud fetches them from GitHub, only the spec's path ([`ENT-16`](../domain/workspace.md)).

## Versions

| Rule | Why |
|---|---|
| Semantic versions; a change to the model's shape is a major | The Cloud and the CLI upgrade on their own schedule |
| A consumer pins the version; a new generator reaches the Cloud as a dependency bump | The public map is built by reviewed code, never by code fetched at run time |
| The parsing in `scripts/view.mjs` (`section`, `tables`, `frontmatter`) moves into the package; the script calls it | One reading of a spec, free and paid alike |

## Decisions

| # | Decision | Discarded, and why | Status | Date |
|---|---|---|---|---|
| 1 | Files passed in as path → text | Reading the disk: the Cloud has no working tree | accepted | 2026-11-20 |
| 2 | The map's generator lives in the package | A generator per consumer: the public map and the Cloud's would drift | accepted | 2026-11-20 |
