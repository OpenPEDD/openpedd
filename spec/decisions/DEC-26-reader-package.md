---
title: "DEC-26 · A spec is read by one package, shared by the CLI and the Cloud"
description: Where the parsing of a spec lives, and who uses it
owner: Kevin
version: "1.0"
updated: "2026-11-20"
---

# DEC-26 · A spec is read by one package, shared by the CLI and the Cloud

**Date:** 2026-11-20

**`@openpedd/reader`**, in `packages/reader` of this repo and published to npm under Apache-2.0
([`DEC-02`](DEC-02-licenses.md)), parses a spec, reads and writes a change's `definition.md`, numbers
changes and renders the map. The CLI, `npm run view` and OpenPEDD Cloud import it, the Cloud at a
pinned version. The detail is in [`ARCH-20`](../foundations/architecture/reader.md).

| Option | Discarded, and why |
|---|---|
| The Cloud copies the parsing | The two drift, and the Cloud reads a spec differently from the framework |
| A repo of its own | One more repo and pipeline for a package that changes with the format |

**Why:** a spec read two ways is two truths. The Cloud asked for it before it is built (`openpedd-cloud`'s `ADR-07`).
