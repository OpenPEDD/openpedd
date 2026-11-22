---
title: "DEC-29 · Every view of a project is free on the machine; the Cloud keeps them live"
description: What is free and what is paid in a project's views
owner: Kevin
version: "1.0"
updated: "2026-11-22"
---

# DEC-29 · Every view of a project is free on the machine; the Cloud keeps them live

**Date:** 2026-11-22

**`@openpedd/reader` makes the data of every view, and `pedd view` renders all of them, free**, the
traceability view included, built from what `pedd trace` gathers on demand. **OpenPEDD Cloud renders the
same data per product, rebuilt on every push**, across repos, with the history of each view and the diff
between two versions; its screen is specified in `openpedd-cloud`. The views are in
[views](../modules/views/prd.md); how their data is made, in [`ARCH-22`](../foundations/architecture/views.md).

| Option | Discarded, and why |
|---|---|
| The traceability and code views only in the Cloud | The method is free ([`BIZ-04`](../foundations/business/open-core.md)): a team must see what its own spec says without paying |
| Each side with its own generator | The two drift ([`DEC-26`](DEC-26-reader-package.md)) |

**Why:** a view run when you ask is the method; keeping it current for you, across systems and over
time, is the line the Cloud already sells. Generating and rendering are free everywhere else too
([`MKT-12`](../foundations/market/view-generation.md)).
