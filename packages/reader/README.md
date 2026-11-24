# @openpedd/reader

One reading of an OpenPEDD spec, shared by the CLI, `npm run view` and OpenPEDD Cloud
([ARCH-20](../../spec/foundations/architecture/reader.md)). It works only on the files the caller
hands it, as path → text: it never reads the spec from a disk.

| Function | Takes | Gives |
|---|---|---|
| `readSpec(files, { root })` | The files, as a `Map` or an object of path → text, paths from the repository root; `root` is the spec's folder, `spec` by default | The model: `documents` (path, frontmatter, `hasFrontmatter`, `frontmatterProblems`, headings, tables, text), `modules` (folder, code, PRDs), `prds`, `requirements` (with `status` and `statusFrom`: `column` or `prd`), `history`, `businessMap`, and `problems` |
| `readBusinessMap(files, prefix)` | The files, as a `Map`; `prefix` is the spec's folder with its slash | The `Business Map` of `foundations/business-map/`, or `null`: `asIs` (`people`, `processes`, `tools`, `pains`), `toBe` (`people`, `processes` with `mark` and `module`, `modules`, `order`), each with its version and the sections it lacks; and `processes`, each as-is process with what the to-be does with it |
| `leastAdvanced(statuses)` | Requirement statuses | The least advanced, the one their PRD carries ([DEC-28](../../spec/decisions/DEC-28-requirement-status-column.md)); `REQUIREMENT_STATUSES` is the order |
| `readDefinition(text)` · `writeDefinition(def)` | A change's `definition.md` | `status`, `agreed` (`by`, `at`), `prds`, `items` (`item`, `state`, `words`), `summary`; written back in the same format |
| `nextChangeId(...sources)` | Files maps, `history.jsonl` text, lists of paths or IDs: the base and every change branch | The next `CHG-nnn` |
| `mapData(model, { built })` | The model of the framework's repository | The framework map's data: what `npm run view` writes to `.pedd/map/map.json` |
| `renderMap(model, { built, data })` | The model | The map's HTML page |
| `viewData(model, sources)` | The model of any project's spec, and what the caller has beyond it (below) | `views.json`: the ten project views and every loose item ([ARCH-22](../../spec/foundations/architecture/views.md)) |
| `renderViews(data, { open, sourceBase, live })` | `views.json` | One HTML page, no network: the renderer and ELK, the layout, inlined. `open` is `{ kind, id, depth }`; `sourceBase` is what a node's file is joined to for its link (`../../` from `.pedd/view/`, or a URL) |
| `toMermaid(view, kind)` | One view | Markdown to paste in a PR: the graph in a ```` ```mermaid ```` block (`stateDiagram-v2` for `states`, `erDiagram` for `entities`, `flowchart` for the rest), each matrix as a table |
| `scopeView(view, id, depth)` | One view, an ID, a group or a path | The part of it that ID reaches within `depth` edges; a group (a PRD's path, an entity's states, a requirement's chain) whole |
| `readStages(model, sources)` | The model | The stages of the work with a client ([DEC-31](../../spec/decisions/DEC-31-client-stages.md)): `current`, and per stage its `state`, `items` (each `key`, `state` `missing` · `partial` · `done` · `approved`, `at`, `detail`, `next`), `delivers`, `approver`, `approval` and `next`; what the `stages` view draws |
| `firstView(data)` · `KINDS` | `views.json` | The view a page opens on: the first with loose items, or `context`; the ten kinds in order |

## The project views

`viewData` builds one view per kind, each from one kind of artifact, in `src/views/<kind>.mjs`
(`build(model, sources)`). A new file of that kind is a new node; nothing is listed by hand.

| Kind | Reads |
|---|---|
| `decisions` | Each `DEC-nn` and `ADR-nn` file: its heading, `Status`, `Supersedes`, and every ID and module its body cites |
| `entities` · `states` | Each `ENT-nn` file of `foundations/domain/`: `Fields`, `States`, `Transitions`; the PRDs that cite it |
| `security` | `Roles & Permissions` (`Permissions`) and `Security Policy` (`Tables`, `SEC-nn` headings), found by title or by folder (`roles`, `security`); or `sources.files`, the TOML, YAML, JSON and SQL `workspace.yaml` names under `views.security` |
| `context` | `sources.workspace.components`, `sources.packages` (the workspace graph), `sources.stack`, the `Providers` of `Integrations` |
| `code` | `sources.codeIndex`: each entry's `Where`, `IDs` and `Symbols` |
| `business` | The `Business Map` |
| `stages` | The five stages of the work with a client (DEC-31): the `Glossary`, the `Business Map`, the entities, `foundations/business/` and its `stages.md` approvals, `Roles & Permissions`, the modules and their statuses, the roadmap; a piece not written names `where` it goes instead of `at` |
| `prd` | Each PRD's `### F<n> ·` flows, the alternate flows table, `Requirements`, `States`, `Permissions` and criteria |
| `trace` | `sources.specGraph` and `sources.traceEvents` |
| `changes` | `changes/<CHG>/` in the spec and in `sources.branches` |

A view whose source is not given is `empty`, naming what fills it. Every node and edge carries its file
(`at`, with the anchor) and `line`. The same files give the same `views.json`, byte for byte. **Loose
items** (RULE-27) come in `loose`, each with the view that marks it, the item as written (`says`), its
ID, its file and line, and what is loose: `undefined-id`, `cites-nothing`, `supersedes-unknown`,
`supersedes-loop`, `not-cited`, `missing-end`, `no-flow`, `no-criterion`, `unknown-transition`,
`unknown-role`, `unknown-action`, `unprotected`, `no-mark`, `unknown-module`. An ID linked to another
spec (`[RULE-01](https://…)`) is defined there.

**What cannot be read is reported, not read around.** `problems` lists each broken frontmatter (not
closed, not on line 1, a line that is not `key: value`, a key set twice, a quote not closed) and each
history line that is not JSON, as `{ path, line, kind, message }`. The data is still given, so a
caller decides whether a problem fails: `pedd check` does.

`@openpedd/reader/files` has `readFiles(root)`, for a caller with a working tree: every `.md`,
`.jsonl` and `.yaml` file under a folder, as the input of `readSpec`.

## From a shell

```bash
openpedd-reader map  <root> [--built YYYY-MM-DD]   # the map's data, as JSON, on stdout
openpedd-reader html <root> [--built YYYY-MM-DD]   # the map's page
openpedd-reader spec <root>                        # the model, as JSON
openpedd-reader business-map <root>                # the Business Map, as JSON; null when there is none
openpedd-reader problems <root>                    # what cannot be read, one per line; exits 1 when any
openpedd-reader next-id <root>                     # the next CHG-nnn on this tree
openpedd-reader stages <root>                      # the stages of the work with the client, as JSON
openpedd-reader views <root>                       # views.json from the spec alone; pedd view adds the code index, trace and branches
openpedd-reader views-html <root>                  # its page
openpedd-reader version
```

A consumer that must not run code from a clone runs its own pinned copy of this package on the
clone, read as text: `openpedd-reader map ./clone > map.json`.

## Versions

Semantic versions. A change to the shape of the model, of the map's data or of `views.json` (its
`format`) is a major. Tags are
`reader-v<version>` in this repository.

## Tests

```bash
npm test
```

One dependency, [ELK](https://github.com/kieler/elkjs) (EPL-2.0), the layout `renderViews` inlines in
the page. Node 20 or later.
