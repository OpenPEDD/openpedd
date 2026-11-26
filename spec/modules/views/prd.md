---
title: views
description: pedd view — every project's spec drawn as maps, generated on every change, and the check that fails on what is loose
owner: Kevin
version: "1.7"
updated: "2026-11-26"
status: draft
---

# `views`

## Frame

Whoever builds, debugs or decides on a product asks *what does the spec say, and what is connected to
what*: which decisions shape this module, who may do this, which entity this flow moves. **`pedd view`
answers with maps, generated from the spec**, never drawn: every node is an ID, a table row or a link
already written, so the maps are as current as the last commit. It ends with the views open in the
browser and in `.pedd/view/`, and with `pedd check` red on whatever the change left loose.

The data of every view comes from `@openpedd/reader` ([`ARCH-22`](../../foundations/architecture/views.md)),
so the same views render locally and in OpenPEDD Cloud, which specifies its own screen
([`DEC-29`](../../decisions/DEC-29-views-free-cloud-live.md)).

## Success metric

| Metric | Baseline | Target | Review date | Measured by |
|---|---|---|---|---|
| Loose items per 100 IDs on the products that run it | Not measured | Under 2, 30 days after `pedd check` fails on them | 2027-03-01 | `pedd check --json`, counted per run |

## Appetite and out of scope

Two weeks of `build` for the ten views and the checks; one more for the five of [the business's views](business.md). Out of scope:

- Editing a view, or saving a layout: the layout is computed on each render ([`MKT-12`](../../foundations/market/view-generation.md)).
- A view written or summarized by a model.
- Views live across repos, with their history and their diff between versions: OpenPEDD Cloud ([`DEC-29`](../../decisions/DEC-29-views-free-cloud-live.md)).

## The views [#the-views]

**One view per kind, each fed by one kind of artifact.** A new artifact of that kind is a new node, with
no other edit. What each source table holds is defined where its artifact is.

| `kind` | Shows | Fed by | Its table is defined in |
|---|---|---|---|
| `decisions` | Every `DEC` and `ADR`: its status, what supersedes what, the IDs it cites and the modules they belong to | The decision files | [Decisions](../../decisions/README.md#a-decision) |
| `entities` | Each entity with its fields; a field that names another entity is a relation; the modules whose PRDs cite it | The entity files | [Domain](../../foundations/domain/index.md#how-an-entity-is-written) |
| `states` | One state machine per entity | The entity's `States` and `Transitions` | [Domain](../../foundations/domain/index.md#how-an-entity-is-written) |
| `security` | Roles and permissions: role × action | `Roles & Permissions`, or the file `workspace.yaml` names | [`ENT-02`](../../foundations/domain/foundation.md#tables-the-views-read) |
| `context` | The architecture: C4 levels 1 and 2, and what protects each table and the security rules | `workspace.yaml` components, `.pedd/stack.json`, `Integrations`, `Security Policy` | [`ENT-02`](../../foundations/domain/foundation.md#tables-the-views-read), [`ENT-16`](../../foundations/domain/workspace.md) |
| `code` | Modules, packages and their main symbols, each linked to the requirements anchored in it | The code index | [`ARCH-19`](../../foundations/architecture/code-index.md) |
| `business` | Roles × business processes, as-is and to-be, each process with its mark and the module that takes it | The `Business Map` | [map](../map/prd.md#business-mode) |
| `prd` | **Modules and their PRDs**, each PRD with its requirements counted by status. **One PRD opens** to its flows as flowcharts, its use cases (roles × actions), the transitions it touches, its requirements and their criteria | The module folders, and each PRD's flows, `Permissions`, `States`, requirements and criteria | [Modules](../README.md#the-sections-of-a-prd-in-order) |
| `glossary` · `org` · `activity` · `use-cases` · `stages` | The names; who reports to whom; each business process in swimlanes; who uses which flow; where the work with the client stands | The `Glossary`, the `Business Map`, the PRDs' flows and statuses | [the business's views](business.md) |
| `trace` | Per requirement: spec → design → code → test → deploy, each link with its state and freshness | `.pedd/spec-graph.json` and `.pedd/trace/` | [`ARCH-05`](../../foundations/architecture/traceability.md) |
| `changes` | The changes in flight, the IDs each touches, and where two overlap | `changes/` on the base and on every change branch | [`ARCH-17`](../../foundations/architecture/landing.md#before-the-overlap-of-changes-in-flight) |

## Loose items [#loose-items]

**Nothing in the spec stands alone** ([`RULE-27`](../../foundations/rules/writing.md#rule-27)). Each loose item is marked in
its view and listed by `pedd check`. **A module listed `unmapped` in the modules index is a module still to define**, not a gap: while a business map waits for its PRDs, one at a time ([`RULE-30`](../../foundations/rules/definition.md#rule-30)), what only those PRDs would cite is not loose:

| Loose item | Found in |
|---|---|
| An ID cited, in the spec, a code anchor, a test name or a delta, that is defined nowhere | Every view |
| A decision that cites no requirement, entity, rule, architecture document or module | `decisions` |
| A `Supersedes` that names no decision, or a loop of them | `decisions` |
| An entity no PRD cites, unless modules are still `unmapped` and another document cites it | `entities` |
| A many-to-many with no associative entity (`RULE-31`) | `entities` |
| A requirement no flow carries, in a PRD with flows | `prd` |
| A `FR` with no criterion | `prd` |
| A transition in a PRD's `States` that its entity does not have | `prd` · `states` |
| A role or action in a PRD's `Permissions` that `Roles & Permissions` does not have | `security` · `prd` |
| A table nothing protects, when the project lists its tables | `context` |
| A to-be process with no mark, or taken by a module that does not exist; a module listed `unmapped` in the index exists | `business` |
| When the as-is lists business use cases: a process no business use case holds, a `core` business use case with no business actor, a business use case naming a process that does not exist | `business` |
| A Glossary name with no label in a declared locale | `glossary` |

## Flows

### F1 · See every view

| Step | Role | Does |
|---|---|---|
| 1 | Team | Runs `pedd view` |
| 2 | — | The reader builds every view from the files at the working tree ([`ARCH-22`](../../foundations/architecture/views.md)) |
| 3 | — | Writes `.pedd/view/views.json` and `.pedd/view/index.html`, and opens it on the first view with loose items, or on `context` |

### F2 · One view, scoped

| Step | Role | Does |
|---|---|---|
| 1 | Team | Runs `pedd view <kind> [id]`: `pedd view prd modules/billing/prd.md`, `pedd view trace FR-VEW-01` |
| 2 | — | Opens that view on that ID and what it reaches within the depth asked (`--depth`, 1 by default) |
| 3 | — | `--format mermaid` prints it as Mermaid instead, to paste in a PR or a README |

### F3 · Fail on what is loose

| Step | Role | Does |
|---|---|---|
| 1 | Team | Runs `pedd check`, on the machine, or the CI action runs it on every PR ([`ARCH-13`](../../foundations/architecture/review.md#the-judges-in-ci)) |
| 2 | — | Builds the views and lists every loose item, each as written, with its file and line |
| 3 | — | Fails on each loose item the PR adds or touches; lists the rest as pressure, like a document over budget |

| Flow | From | What changes | Ends in |
|---|---|---|---|
| Alternate · `--watch` | F1.3 | Rebuilds the views each time a file of the spec is saved; the open page reloads | The views current |
| Alternate · A source missing | F1.2 | A view with no source (no `Business Map`, no code index) shows empty, with what would fill it | Every view listed |
| Alternate · Adopting | F3.3 | While `pedd adopt` runs, the loose items already there are its gaps, one `cover` change per module ([workspace](../workspace/prd.md#adopting-a-running-product)) | The check green on new work |
| Exception · A table it cannot read | F1.2 | The view marks the row and the file, and builds the rest | Every view built but that row |

## Requirements

| ID | Requirement | Reason | Roles | Criteria | Flows | Status |
|---|---|---|---|---|---|---|
| `FR-VEW-01` | When a person runs `pedd view`, the system shall build every view of [the views](#the-views), write `views.json` and `index.html` to `.pedd/view/`, and open it | One command shows the whole spec | Team | `AC1` · `AC2` | F1 | `draft` |
| `FR-VEW-02` | When a person runs `pedd view <kind> <id>`, the system shall open that view on that ID and what it reaches within `--depth` | A big graph is read by scoping it, not whole ([`MKT-12`](../../foundations/market/view-generation.md)) | Team | `AC1` | F2 | `draft` |
| `FR-VEW-03` | The system shall build every node and edge only from IDs, table rows and links in the spec, the code index and the trace | A drawn or summarized view goes stale and nobody reviews it | Team | `AC1` | F1 | `draft` |
| `FR-VEW-04` | When an artifact of a view's kind is added, the system shall show it in that view with no other file edited | Atomic: nobody keeps a view up to date | Team | `AC1` | F1 | `draft` |
| `FR-VEW-05` | The system shall show each node as its item is written, its ID next to it, and open its source at its anchor on click | [`RULE-20`](../../foundations/rules/cycle.md#rule-20) | Team | `AC1` | F1 · F2 | `draft` |
| `FR-VEW-06` | When a view has no source, the system shall show it empty with the artifact that would fill it | An absent view hides that the spec lacks it | Team | `AC1` | F1 | `draft` |
| `FR-VEW-07` | When `--watch` is on, the system shall rebuild the views on each save of a spec file | The map follows the writing | Team | `AC1` | F1 | `draft` |
| `FR-VEW-08` | When `--format mermaid` is given, the system shall print the view as Mermaid | The one format GitHub renders ([`MKT-12`](../../foundations/market/view-generation.md)) | Team | `AC1` | F2 | `draft` |
| `FR-VEW-09` | When `pedd check` runs, the system shall list every [loose item](#loose-items) and fail on each one the change adds or touches | Loose items are caught where they are made; old ones do not block new work | Team | `AC1` · `AC2` | F3 | `draft` |
| `FR-VEW-10` | When the `prd` view opens, the system shall show the modules and their PRDs only; when a PRD is picked, its flows, use cases, transitions, requirements and criteria | A product has dozens of PRDs and hundreds of requirements: one graph of all of them is read by nobody | Team | `AC1` | F1 · F2 | `draft` |
| `FR-VEW-11` | When the spec cites an ID with a reference's prefix (`openpedd:ENT-20`), the system shall take it as that reference's, never as loose, and link it there when `workspace.yaml` names the reference | A spec that builds on another cites it all the time | Team | `AC1` | F1 · F3 | `draft` |
| `FR-VEW-12` | The system shall take as a requirement's criteria the IDs in its `Criteria` column that are rows of the PRD's criteria table, in the form of [`ENT-04`](../../foundations/domain/acceptance-criterion.md) or the earlier `AC-<MOD>-nn` | A spec written before `ENT-04`'s form is not missing its criteria | Team | `AC1` | F1 · F3 | `draft` |
| `FR-VEW-18` | When two `views.json` of one `format` are compared, the system shall give per kind the nodes and edges added, removed or changed, with their counts | `pedd view` and the Cloud mark the same changes | Team | `AC1` | F2 | `draft` |
| `FR-VEW-19` | The system shall offer its renderer as a module an app mounts, taking links per node, live data by ID and a diff to mark | One renderer for every host ([`ARCH-22`](../../foundations/architecture/views.md#rendering)) | Team | `AC1` | F1 | `draft` |
| `FR-VEW-20` | While the modules index lists a module as `unmapped`, the system shall take it as existing, and an entity another document cites as not loose for lack of a PRD | The PRDs come one at a time; the modules waiting are the plan, not a gap | Team | `AC1` | F3 | `draft` |
| `NFR-VEW-01` | The system shall give the same `views.json`, byte for byte, for the same files | The Cloud and a test can compare two builds | — | `AC1` | F1 | `draft` |
| `NFR-VEW-02` | The system shall build every view of a 500-document spec in under 5 seconds on a laptop, and render them offline from one HTML file | It runs on every save and every PR | — | `AC1` | F1 | `draft` |

## Permissions

| Action | Team |
|---|---|
| `pedd view` | yes |
| `pedd check` | yes |

## Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| `FR-VEW-01.AC1` | The template's spec with one entity, one PRD and one decision | `pedd view` runs | `views.json` holds the fifteen kinds, and the page opens on `context` |
| `FR-VEW-01.AC2` | A decision citing an ID defined nowhere | `pedd view` runs | The page opens on `decisions`, the decision marked loose |
| `FR-VEW-02.AC1` | A PRD with flows `F1` and `F2` | `pedd view prd <its path>` | Only that PRD's use cases, flowcharts and transitions are shown |
| `FR-VEW-03.AC1` | A spec and its `views.json` | Every node and edge is looked up | Each names the file and line it came from |
| `FR-VEW-04.AC1` | The `decisions` view built | A new `DEC-nn` file is added and the views rebuilt | The new node is there, and no other file changed |
| `FR-VEW-05.AC1` | The `entities` view | A node is clicked | Its title and description as written, its ID next to them, and its file at its anchor |
| `FR-VEW-06.AC1` | A spec with no `Business Map` | `pedd view business` | An empty view naming `Business Map` and `/map --business` |
| `FR-VEW-07.AC1` | `pedd view --watch` running | An entity file is saved | The page reloads with the change, without a second command |
| `FR-VEW-08.AC1` | An entity with states and transitions | `pedd view states ENT-06 --format mermaid` | A `stateDiagram-v2` that GitHub renders |
| `FR-VEW-09.AC1` | A PR adding an entity no PRD cites | `pedd check` runs in CI | It fails, naming the entity as written and its file |
| `FR-VEW-09.AC2` | A spec with an old loose decision the PR does not touch | `pedd check` runs | It passes, and lists the decision as pressure |
| `FR-VEW-10.AC1` | A product with 13 modules, 15 PRDs and 150 requirements | The `prd` view opens; a PRD is clicked | 13 modules and 15 PRDs, no requirement; then that PRD's flows, use cases, transitions, requirements and criteria |
| `FR-VEW-11.AC1` | An entity citing `openpedd:ENT-20`, and `references` naming `OpenPEDD/openpedd` | `pedd check` runs | Nothing loose for it; its node links to the public spec |
| `FR-VEW-12.AC1` | A requirement whose `Criteria` holds a criterion written `AC-<MOD>-nn`, a row of the criteria table | `pedd check` runs | The requirement is not loose for lacking a criterion |
| `FR-VEW-18.AC1` | Two builds, the second with one decision more and one entity renamed | `diffViews` runs | `decisions`: one node added; `entities`: one node changed; every other kind zero |
| `FR-VEW-19.AC1` | An app that mounts the renderer with a link per node, a live state and a diff | A node is clicked | Its detail shows the app's link and the live state; added nodes are marked |
| `FR-VEW-20.AC1` | A to-be process taken by `stock`, listed `unmapped` in the modules index with no folder, and an entity cited only by a decision | `pedd check` runs | Neither is loose; with `stock` gone from the index, both are |
| `NFR-VEW-01.AC1` | The same commit | The views are built twice | The two `views.json` are identical |
| `NFR-VEW-02.AC1` | A generated spec of 500 documents | `pedd view` runs, network off | Built in under 5 seconds, and the page renders |

## Sources

[`ARCH-22`](../../foundations/architecture/views.md) · [`MKT-12`](../../foundations/market/view-generation.md) · [`DEC-29`](../../decisions/DEC-29-views-free-cloud-live.md) · [`RULE-27`](../../foundations/rules/writing.md#rule-27)
