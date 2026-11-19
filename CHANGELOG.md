# Changelog

Versions follow [SemVer](https://semver.org). While the major is `0`, any minor version may change
the format; the spec of each version is the tag `v<version>`.

## Unreleased

- The first skill: `skills/specify-interview/SKILL.md`. Skills and judges live in `skills/` and `agents/`, each naming the spec documents it implements.
- `/specify-interview` and the minimum map: what a product, a module or a request needs to be defined, who answers each item (the client, a proposal, or the team), and the conversation that fills it (ARCH-18).
- A client defines a product in a conversation that runs until the definition is complete: questions computed first, two or three per turn, completeness counted per item, a summary to confirm (DEC-20, MKT-08).
- Each skill says what it reads and what it leaves, in its stage's table; every stage input is read by a skill and every output is left by one. `verify` declares the tests as an input: the Walkthrough draft comes from their steps.
- How a change is reviewed, in six layers: gates, project rules as lint, hunters per lens, a refuter, `pedd` deciding what blocks, and a person approving from the review signals. A finding confirmed in two changes becomes a rule.
- Default review lenses with their checklist, from the corrections of Reclee's PRs.
- The judges are part of the method: free, on every PR in the CI action, on the team's own subscription. The Cloud runs no judges.
- `pedd judges bench` and judge precision as a process metric.
- Small work is not delegated: a `small` task builds in one local session.
- `/build-findings`: fix the real findings, answer the rest, stop where the spec is wrong.
- Writing safely: `--dry-run`, backups, sensitive paths denied, the agent never installed. Personal settings that can only spend less than the team's.
- Skills through `npx skills add`, and a catalog of extensions by GitHub topic.
- `pedd sweep`: every open question of a change, from every stage ahead, asked at once with a recommendation each; `architect` in `guided` asks through it (RULE-26).
- Landing parallel changes: `pedd overlap` warns early, `pedd sync` keeps changes in flight close to the base, `pedd land` computes the order and lands them one at a time.
- A change's tasks are a checklist in the implementation sub-issue, not one issue each; task PRs link to it with `Part of`, which does not close it.
- `design` builds from the product's component catalog: each screen is listed as the pieces it is made of before drawing, a piece of its own says why none fits and enters the catalog with its story, the refactor pass reads copies across the whole code, and `design-judge` checks the catalog, the duplicates and axe in light and dark (MKT-06).
- Keeping agents' context small: one task per session, tests that report only failures, the pack pointing at the code, denied paths and a read hook; a task over 100,000 tokens is marked as badly cut.
- Where each stage runs (`local`, `cloud`, `self-hosted`), set in `workspace.yaml`; implementation in the cloud by default, one session per task, with a quota guard.
- At `spec-approval`, one tracker sub-issue per stage with a branch and a gate (architecture, design, implementation), with their blocks, unassigned and in the backlog; `plan` is the first item of the implementation checklist and the launch is the parent's last status.
- The tracker in its own document (ARCH-15): only `specify` creates issues, once, found again by their `Spec:` anchor and under the issue that already existed; statuses move from pull request events, never by hand; a definition of done ticked from CI; `/tracker-tidy` proposes the duplicates against the spec and the roadmap.

## 0.1.0 · 2026-11-11 · beta

The first versioned spec of the framework. Nothing to install yet.

- The cycle and its stages, from `map` and `specify` to `publish` and `measure`, with their judges.
- Tracks: `full`, `story`, `fix`, `hotfix`, `cover` and `chore`.
- Testing before code, the pipeline by moment, flags through OpenFeature, launching apart from deploying, and the Walkthrough.
- `pedd init` and `pedd adopt` for new and running products.
- Traceability with time per stage and step, and process metrics.
- What the framework can do, in one page: [`spec/capabilities.md`](spec/capabilities.md).
