---
title: Project views
description: ARCH-22 · How the reader turns a project's spec into the data of every view, and how pedd view and the Cloud render it
owner: Kevin
version: "1.5"
updated: "2026-11-24"
---

# ARCH-22 · Project views

**One model, many views** ([`MKT-12`](../market/view-generation.md)): the reader reads the spec once and
each view is a function over that model. What each view shows is in [views](../../modules/views/prd.md#the-views);
here, how its data is made. Answers [`NFR-VEW-01`](../../modules/views/prd.md#requirements) and `NFR-VEW-02`.

```
 spec files ─┐
 code index ─┼─▶ @openpedd/reader ─▶ viewData ─▶ views.json ──┬──▶ pedd view → .pedd/view/index.html
 trace ──────┤      (readSpec)        one function             ├──▶ pedd view --format mermaid
 changes/ ───┘                        per kind                 └──▶ OpenPEDD Cloud (pinned reader)
```

## What the reader adds

| Function | Takes | Gives |
|---|---|---|
| `viewData` | The model, plus the code index, the trace and the change branches' `changes/` when the caller has them | `views.json`: every view and every loose item |
| `renderViews` | `views.json` | One HTML file, no network, with the renderer and its layout inlined |
| `toMermaid` | One view | Its Mermaid text: `flowchart`, `stateDiagram-v2`, `erDiagram`, or a table for a matrix |
| `diffViews` | Two `views.json` of one `format` | Per kind, the nodes added, removed or changed (label, status, group) and the edges added or removed, with their counts |
| `mountViews` | An element, `views.json`, and `links`, `overlay`, `diff`, `labels` | The page's renderer as an ES module, for an app to mount; ELK passed in |

**Each kind is one module of the reader** (`views/<kind>.mjs`) that exports `build(model, sources)`. It
reads one kind of artifact and nothing is listed by hand, so a new file of that kind is a new node. A
new kind is one new module and one row in the views table.

## `views.json`

```json
{
  "format": 1, "product": "reclee", "commit": "3fa9c1e",
  "views": {
    "decisions": {
      "sources": ["spec/decisions/"],
      "nodes": [{ "id": "ADR-07", "type": "adr", "label": "Store the workflow as a JSON graph",
                  "status": "superseded", "group": "automations",
                  "at": "spec/decisions/ADR-07-workflow-graph.md#adr-07", "line": 9 }],
      "edges": [{ "from": "ADR-09", "to": "ADR-07", "type": "supersedes" },
                { "from": "ADR-07", "to": "FR-AUT-04", "type": "cites" }],
      "matrix": null,
      "empty": null
    }
  },
  "loose": [{ "view": "decisions", "id": "DEC-12", "says": "…", "at": "spec/decisions/DEC-12-stack.md", "line": 3,
              "kind": "cites-nothing" }]
}
```

| Field | Holds | Rule |
|---|---|---|
| `nodes` | One per item: its ID, its type, its title or governing sentence as written, its status, its group (module, package or layer), its source and line | The label is copied, never shortened by a model ([`RULE-20`](../rules/cycle.md#rule-20)) |
| `edges` | `from`, `to`, `type`; a `label` when the source table gives one (a field name, a transition's trigger) | Only edges whose two ends are nodes; an end that is missing is a loose item, unless it carries a reference's prefix (`openpedd:ENT-20`): that end is the reference's |
| `matrix` | For `security`, `business` and a PRD's use cases: `rows`, `cols`, and the cell text | A matrix is not drawn as a graph |
| `empty` | When the view has no source: the artifact that would fill it | [`FR-VEW-06`](../../modules/views/prd.md#requirements) |
| `loose` | Every loose item, with its kind and where it is | One list for `pedd check` and the page |

**Deterministic**: nodes and edges sorted by ID, no time in the file, only the commit. **No layout in the
data**: a saved layout drifts and conflicts in git, so positions are computed on each render. The
format has its own `format` number; a change to its shape is a major of the reader ([`ARCH-20`](reader.md#versions)).

## How each kind reads its source

| Kind | Reads | Edges from |
|---|---|---|
| `decisions` | The header of each file in `decisions/`: `Status`, `Supersedes` | `Supersedes` → `supersedes`; every other ID the body cites → `cites`, grouped by the module that owns it |
| `entities` · `states` | Each entity's `Fields`, `States`, `Transitions` | A field that names an entity → relation; a PRD that cites the entity → `used by` |
| `security` | The matrix and tables of `Roles & Permissions` and `Security Policy`, or the files `workspace.yaml` names under `views.security` | Role → action; policy → table; `SEC-nn` → what it cites |
| `context` | `workspace.yaml` components, `.pedd/stack.json`, `Integrations` | Component → component from the workspace graph; component → provider from `Used by` |
| `code` | `.pedd/code-index/` | Module → package from `components`; file → requirement from the anchors |
| `business` | `as-is.md` and `to-be.md` of the `Business Map` | Role → process; process → module |
| `prd` | The module folders; then one PRD's `Permissions`, flows, `States`, requirements and criteria | Module → PRD; inside a PRD: step → next step; alternate flow → the step it leaves from; requirement → its flows and criteria |
| `glossary` | The `Glossary`'s tables | Name → where it is defined; old name → new name |
| `org` | `People` of `as-is.md` and `to-be.md` | Role → the role it reports to |
| `activity` | Each `### PRC-nn` steps table | Step → next step, each in its role's lane |
| `use-cases` | Every PRD's `### F<n>` steps | Role → flow, inside its module |
| `stages` | The `Glossary`, the `Business Map`, the entities, `foundations/business/` with `stages.md`, `Roles & Permissions`, the modules index and statuses, the roadmap | Stage → next stage; stage → each piece it needs; a piece not written names where it goes ([`DEC-31`](../../decisions/DEC-31-client-stages.md)) |
| `trace` | `spec-graph.json` and the events in `.pedd/trace/` | One chain per requirement, each link with its state ([`ENT-22`](../domain/trace-link.md)) |
| `changes` | `changes/` on the base and each change branch, through the same listing `nextChangeId` uses | Change → each ID its deltas target; two changes on one ID → `overlaps` |

A file a view needs that is not given (no code index, no branches) leaves that view `empty`; the rest
are built.

## Rendering

The page is the same for `pedd view` and the Cloud: a sidebar of the seventeen kinds with their loose count,
the view in the middle, and the item as written on the right. **Layout is ELK** (layered for graphs and
flows), bundled into the page; a graph over 150 nodes opens grouped by module, a group expanding on
click. `renderViews` inlines `mountViews` into one file; the Cloud mounts it with its own links, live
data by ID and a diff, and specifies its own screen ([`DEC-29`](../../decisions/DEC-29-views-free-cloud-live.md)).

## Decisions

| # | Decision | Discarded, and why | Status | Date |
|---|---|---|---|---|
| 1 | A JSON per build, then a renderer | Rendering straight from the model: the Cloud would need its own reading | accepted | 2026-11-22 |
| 2 | Layout computed on each render, with ELK | A saved layout: drifts, conflicts in git. dagre and Graphviz: ELK lays out big layered graphs better, and Mermaid moved to it | accepted | 2026-11-22 |
| 3 | A decision's edges are the IDs it cites | A new `Affects` field: a second list of what the body already cites | accepted | 2026-11-22 |
| 4 | Mermaid as an export, not the renderer | Mermaid's C4 is experimental, and it cannot expand groups | accepted | 2026-11-22 |
