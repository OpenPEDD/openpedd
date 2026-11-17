# Changelog

Versions follow [SemVer](https://semver.org). While the major is `0`, any minor version may change
the format; the spec of each version is the tag `v<version>`.

## Unreleased

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
- Keeping agents' context small: one task per session, tests that report only failures, the pack pointing at the code, denied paths and a read hook; a task over 100,000 tokens is marked as badly cut.
- Where each stage runs (`local`, `cloud`, `self-hosted`), set in `workspace.yaml`; implementation in the cloud by default, one session per task, with a quota guard.
- At `spec-approval`, one tracker sub-issue per stage the track runs (architecture, design, plan, implementation, launch), with their blocks, unassigned and in the backlog.

## 0.1.0 · 2026-11-11 · beta

The first versioned spec of the framework. Nothing to install yet.

- The cycle and its stages, from `map` and `specify` to `publish` and `measure`, with their judges.
- Tracks: `full`, `story`, `fix`, `hotfix`, `cover` and `chore`.
- Testing before code, the pipeline by moment, flags through OpenFeature, launching apart from deploying, and the Walkthrough.
- `pedd init` and `pedd adopt` for new and running products.
- Traceability with time per stage and step, and process metrics.
- What the framework can do, in one page: [`spec/capabilities.md`](spec/capabilities.md).
