# Project template

What an OpenPEDD project starts with: the spec structure with each folder's guide, `workspace.yaml`
with every default commented, OpenPEDD's block for the agents' instructions, and the checks. `pedd
init` will install it; until the CLI exists, copy it by hand.

## Start a project

```bash
npx degit openpedd/openpedd/template <project>-spec
```

```bash
cd <project>-spec && npm install && npm run check
```

```bash
npx skills add openpedd/openpedd
```

Then:

1. Replace the placeholders in `workspace.yaml` (`<project>`, `<owner>`, `<command>`, `<environment>`).
2. If the repo already has an `AGENTS.md` or `CLAUDE.md`, keep it and paste in only the block between `<!-- pedd -->` and `<!-- /pedd -->`.
3. Define the product with `/specify-interview`, in your agent: a conversation that asks only what is missing and ends with a summary to confirm ([the skill](https://github.com/openpedd/openpedd/blob/main/skills/specify-interview/SKILL.md)).

## What is in it

| Path | Is | Comes from |
|---|---|---|
| `spec/` | Foundations marked empty, `modules/`, `decisions/`, `open/`, `changes/`, `history/` | Each guide names its source in OpenPEDD's spec (`source` in its frontmatter) |
| `workspace.yaml` | Every field of the workspace, at its default | [`ENT-16`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/domain/workspace.md) |
| `AGENTS.md` · `CLAUDE.md` | Where each artifact goes, the rules never negotiated, frontmatter, history, checks | OpenPEDD's own `AGENTS.md` |
| `scripts/` · `package.json` | `npm run check`: broken links and token budgets | The same scripts OpenPEDD runs on its own spec |

What a project starts with, and why the template is one place, is in
[workspace](https://github.com/openpedd/openpedd/blob/main/spec/modules/workspace/prd.md#the-project-template).
