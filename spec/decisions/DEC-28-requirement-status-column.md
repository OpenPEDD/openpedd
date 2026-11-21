---
title: "DEC-28 · A requirement's status is a column of its PRD"
description: Where each requirement keeps its own status
owner: Kevin
version: "1.0"
updated: "2026-11-20"
---

# DEC-28 · A requirement's status is a column of its PRD

**Date:** 2026-11-20

Each row of a PRD's requirements table carries its `Status` ([`ENT-03`](../foundations/domain/requirement.md#lifecycle)),
moved by the stage that owns it ([`RULE-18`](../foundations/rules/cycle.md#rule-18)). The PRD's `status`
in its frontmatter is that of its least advanced requirement, and `pedd check` fails when they disagree.
**In a PRD without the column, each requirement shows its PRD's status**, until a stage writes the column.

| Option | Discarded, and why |
|---|---|
| Inferred by the index from the changes in flight | A status nobody can read in the file, and the Cloud reads only the spec's Markdown and history |

**Why:** a user story touches two requirements, not the whole PRD; a map that shows the PRD's status
for both says the rest moved too.
