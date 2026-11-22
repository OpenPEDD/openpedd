# @openpedd/reader

One reading of an OpenPEDD spec, shared by the CLI, `npm run view` and OpenPEDD Cloud
([ARCH-20](../../spec/foundations/architecture/reader.md)). It works only on the files the caller
hands it, as path → text: it never reads the spec from a disk.

| Function | Takes | Gives |
|---|---|---|
| `readSpec(files, { root })` | The files, as a `Map` or an object of path → text, paths from the repository root; `root` is the spec's folder, `spec` by default | The model: `documents` (path, frontmatter, headings, tables, text), `modules` (folder, code, PRDs), `prds`, `requirements` (with `status` and `statusFrom`: `column` or `prd`), `history` |
| `readDefinition(text)` · `writeDefinition(def)` | A change's `definition.md` | `status`, `agreed` (`by`, `at`), `prds`, `items` (`item`, `state`, `words`), `summary`; written back in the same format |
| `nextChangeId(...sources)` | Files maps, `history.jsonl` text, lists of paths or IDs: the base and every change branch | The next `CHG-nnn` |
| `mapData(model, { built })` | The model of the framework's repository | The framework map's data: what `npm run view` writes to `.pedd/view/map.json` |
| `renderMap(model, { built, data })` | The model | The map's HTML page |

`@openpedd/reader/files` has `readFiles(root)`, for a caller with a working tree: every `.md`,
`.jsonl` and `.yaml` file under a folder, as the input of `readSpec`.

## From a shell

```bash
openpedd-reader map  <root> [--built YYYY-MM-DD]   # the map's data, as JSON, on stdout
openpedd-reader html <root> [--built YYYY-MM-DD]   # the map's page
openpedd-reader spec <root>                        # the model, as JSON
openpedd-reader next-id <root>                     # the next CHG-nnn on this tree
openpedd-reader version
```

A consumer that must not run code from a clone runs its own pinned copy of this package on the
clone, read as text: `openpedd-reader map ./clone > map.json`.

## Versions

Semantic versions. A change to the shape of the model or of the map's data is a major. Tags are
`reader-v<version>` in this repository.

## Tests

```bash
npm test
```

No dependencies. Node 20 or later.
