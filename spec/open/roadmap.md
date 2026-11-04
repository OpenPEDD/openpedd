---
title: Roadmap
description: What comes next, in order
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

Reclee is the first user and the test bench: each step is validated against a real spec that
already has the problem. Tasks live in the tracker project **OpenPEDD**.

| # | Step | Leaves |
|---|---|---|
| 1 | **Bootstrap this spec** from the working drafts | `spec/`, within budget |
| 2 | **Reserve the name**: domains, GitHub org, npm, trademark search | The name protected |
| 3 | **Requirements for the MVP modules** (`Q-14`): `FR`, `NFR` and `AC` for `workspace`, `specify`, freshness, MCP and reader | PRDs ready to design |
| 4 | **First code**: generalize Reclee Spec's reader, six checks and MCP, with Reclee as the first preset | `pedd check` running on Reclee Spec and on this spec, unchanged |
| 5 | **Index and hash**: ID blocks and `spec-graph.json` (`Q-12`, `Q-13`) | The first real freshness matrix |
| 6 | **Anchors in the help** (Reclee's help already cites `sources`) and `pedd status` | Spec × help freshness |
| 7 | **MCP** with `changes_since`, `get_freshness` and `get_context_for` | Agents use it instead of Reclee's current MCP |
| 8 | **Anchors in code and in the tracker** | The full matrix in the terminal |
| 9 | **Minimal Cloud**: GitHub App, dashboard, tracker sync | The first thing that is charged |
