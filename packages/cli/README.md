# @openpedd/cli

`pedd`, the OpenPEDD command line. It reads every spec through
[`@openpedd/reader`](../reader/README.md) ([DEC-26](../../spec/decisions/DEC-26-reader-package.md)).
Plain ESM, no build step, Node 20 or later.

## `pedd check`

The spec checks, on the working tree. Fails (exit 1) on any failure; a warning does not fail.

| Check | Fails when |
|---|---|
| `frontmatter` | A frontmatter does not read (the reader's `problems`), or a document under the spec lacks `title`, `description`, `owner`, `version` or `updated`. A change's `definition.md` keeps its own fields ([ARCH-18](../../spec/foundations/architecture/definition.md#the-file)) |
| `links` | A relative link points to a missing file or anchor |
| `size` | A document over its budget ([RULE-04](../../spec/foundations/rules/writing.md#rule-04), `budgets` in `workspace.yaml`) grew against `--against <ref>` (default `HEAD`) |
| `status` | A PRD's `status` is not that of its least advanced requirement, or a status is not one of [ENT-03](../../spec/foundations/domain/requirement.md#lifecycle) ([DEC-28](../../spec/decisions/DEC-28-requirement-status-column.md)) |
| `history` | A line of `history.jsonl` is not JSON or lacks a field |
| `loose` | A loose item ([RULE-27](../../spec/foundations/rules/writing.md#rule-27), [the list](../../spec/modules/views/prd.md#loose-items)) the change adds (it is not among the loose items of `--against`) or touches (its file changed since). The rest is listed as pressure. One on another change branch is that change's. Without git, every one fails |

```bash
pedd check [--only frontmatter,links,size,status,history,loose] [--against origin/dev] [--root <dir>] [--json]
```

`--json` prints every check with its failures and warnings, for a script or the Cloud.

## `pedd view`

Every view of the spec as a map ([views](../../spec/modules/views/prd.md)), made by the reader's
`viewData` and `renderViews` ([ARCH-22](../../spec/foundations/architecture/views.md)). Writes
`.pedd/view/views.json` and `.pedd/view/index.html`, one page with no network, and opens it on the first
view with loose items, or on `context`.

```bash
pedd view                                   # every view
pedd view <kind> [<id>] [--depth <n>]       # opens on one view, scoped: pedd view prd modules/billing/prd.md
pedd view <kind> [<id>] --format mermaid    # prints it as Markdown with a mermaid block, writes nothing
pedd view --watch [--port <n>]              # serves it on localhost, rebuilt on each save of the spec; the page reloads
pedd view --no-open · --root <dir>
```

Beyond the spec it hands the reader what the working tree has: `workspace.yaml` (its `components` and
the files `views.security` names), `.pedd/stack.json`, each component's `package.json`,
`.pedd/code-index/`, `.pedd/spec-graph.json`, `.pedd/trace/*.jsonl`, and the `changes/` of every remote
branch that differ from the working tree's. What is missing leaves its view empty.

## `pedd branch`

The one way a work branch is created ([ARCH-06](../../spec/foundations/architecture/branches.md#creating-a-branch),
[ARCH-21](../../spec/foundations/architecture/requests.md)). Each branch is cut from what the remote
has, named by `branches` in `workspace.yaml`, pushed, tracked locally and printed. It never touches the
working tree.

| Command | Cuts | From |
|---|---|---|
| `pedd branch change <slug> [--track full\|story\|fix\|chore\|hotfix]`, or `request` | `feat/<slug>` (the track's prefix), numbered `CHG-nnn` past every ID on the base, its history and every branch, holding only `changes/<CHG>/definition.md` as `draft`. A clash takes the next number, up to three times | The base; a hotfix from production |
| `pedd branch design <change>` · `architecture <change>` | `design/<slug>` · `arch/<slug>` | The change branch |
| `pedd branch task <change> <task>` | `task/<slug>-<task>` | The change branch |
| `pedd branch edit <change>` | `edit/<CHG>-<n>`, numbered per change; only for an `agreed` definition | The change branch |
| `pedd branch rename <change> --track <track> [--key <key>]` | The rename at `spec-approval`: `feat/automations` → `feat/rec-412-automations`; refused once a branch was cut from it | — |
| `pedd branch check [--head <b>] [--target <b>] [--sha <commit>]` | Nothing: the CI branch check. Fails when the head is not named as a work branch, targets the wrong branch, holds two new changes, or shares commits with another work branch that the target lacks; prints the command that fixes it | — |

`<change>` is `CHG-nnn` (found by its folder `changes/<CHG>/` on the remote) or the change branch's
name. `--no-push` builds without pushing; `--remote <name>` picks the remote (default `origin`).
`pedd branch <issue>`, read from the tracker, waits for the tracker adapter
([ARCH-15](../../spec/foundations/architecture/tracker.md)).

## Not built yet

Every other command in [the CLI](../../spec/capabilities.md#cli) answers that it is not built, and
why, with exit code 3.

## Tests

```bash
npm test
```

The branch tests run real git against a throwaway remote.
