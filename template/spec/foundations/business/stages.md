---
title: Stages
description: Who approved each stage of the work with the client, and when
owner: <owner>
version: "1.0"
updated: "2026-11-24"
source: spec/decisions/DEC-31-client-stages.md@1.0
---

The work with a client runs in five stages: industry, diagnosis, project, specification, construction.
Each is done when the spec holds what it delivers; the `stages` view reads it
([`DEC-31`](https://github.com/openpedd/openpedd/blob/main/spec/decisions/DEC-31-client-stages.md)).

**One row per approval of the client**, written the day they approve: the diagnosis (`1`) and the
project (`2`). The specification and the construction are approved per module, by its PRD's status;
the industry needs no approval.

| Stage | Approved by | On | Notes |
|---|---|---|---|
