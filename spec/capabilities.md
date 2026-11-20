---
title: What OpenPEDD can do
description: Every capability, procedure and tool of the framework in one place, for whoever wants to use it
owner: Kevin
version: "1.8"
updated: "2026-11-20"
---

# What OpenPEDD can do

**Pre-release:** all of this is specified. What runs today are the link and size checks
(`npm run check`). Each row points to where it is defined; this page defines nothing.

## Capabilities

| You can | How | Where |
|---|---|---|
| Keep one source of truth for the whole product | Product → Module → PRD → Requirement, with stable IDs | [Domain](foundations/domain/index.md) |
| Know whether anything derived is still up to date | Every derived artifact is anchored to a hash: `fresh`, `stale` or `uncovered` | [Freshness](foundations/architecture/freshness.md) |
| Follow a requirement from the request to the metric | Its chain, link by link, with what is holding it | [Traceability](foundations/architecture/traceability.md) |
| Measure how long each stage takes | Work, wait and rounds per step, stamped by the tool; lead time, cost and delivery metrics | [Process metrics](modules/cycle/prd.md#process-metrics) |
| Start from zero or on running software | `pedd init` | [Workspace](modules/workspace/prd.md) |
| See everything a new project comes with | One table: spec, `workspace.yaml`, i18n, checks, stages, skills; copied today from `template/` | [What a project starts with](modules/workspace/prd.md#what-a-project-starts-with) |
| Run implementation in parallel in the cloud | One session per task, set per stage in `workspace.yaml`, with a quota guard | [Where agents run](foundations/architecture/running.md#where-agents-run) |
| Take a running product to the full framework | `pedd adopt`: its gaps per module, as small `cover` changes; an existing spec imported | [Adopting](modules/workspace/prd.md#adopting-a-running-product) |
| Start a product as one monorepo | `spec/`, the app, the landing, the docs and the help, sharing one design system with its Storybook and one i18n package; each app deploys on its own. Several repos only when a part must be apart | [Workspace repos](foundations/architecture/workspace.md) |
| Let any agent find where to work without reading the repo | A code index per module and package, regenerated on every merge to the base, read first | [Code index](foundations/architecture/code-index.md) |
| Bring an existing product in | Foundations and module index first, each PRD as it is needed | [map](modules/map/prd.md) |
| Map a client's business before designing its system | `/map --business`: how the organization works today and will work with the system, approved by the client; it feeds the foundations, the modules and the first roadmap | [Business mode](modules/map/prd.md#business-mode) |
| Turn a client's request into work at once | The request is a change branch holding its definition; dropped before approval, the branch is deleted | [A request](foundations/architecture/branches.md#a-request) |
| Use your own tools | Each stage asks for a capability, never a brand | [Workspace](modules/workspace/prd.md#the-tools-of-each-stage) |
| Let a client define what they want, in a conversation | `/specify-interview`: asks only what is missing, counts how complete the definition is, ends with a summary to confirm | [Guided definition](foundations/architecture/definition.md) |
| Answer everything once, then let the agents run | `pedd sweep`: every open question of specify, architect, design and plan, in one sheet with a recommendation each | [Sweep](foundations/architecture/sweep.md) |
| Land many parallel changes without a pile of conflicts | `pedd overlap` warns early, `pedd sync` keeps them close to the base, `pedd land` computes the order | [Landing](foundations/architecture/landing.md) |
| Let agents work without bending the spec | Only `specify` writes it; everything else proposes deltas, decided at a gate | [Merge Gate](foundations/domain/merge-gate.md) |
| Have the AI reviewed by something other than itself | A judge per stage, in another session and model | [Judge](foundations/domain/judge.md) |
| Review by lens, with few false alarms | Hunters in parallel, one per lens; each serious finding must survive a refuter; the tool, not a model, decides what blocks | [Reviewing a change](foundations/architecture/review.md) |
| Run the judges on every PR, on your own subscription | The CI action: one required check, one comment edited in place, `/pedd recheck` and `/pedd override` | [Judges in CI](foundations/architecture/review.md#the-judges-in-ci) |
| Know whether a judge got worse | `pedd judges bench` over past changes; precision as a process metric | [Measuring judges](foundations/architecture/agents.md#measuring-judges) |
| Let the agent install safely | `--dry-run`, backups, sensitive paths denied, the agent never installed for you | [Writing safely](modules/workspace/prd.md#writing-safely) |
| Decide only what nobody defined | One report with each assumption and deviation | [accept](modules/accept/prd.md) |
| Design with the real brand | A mockup in code, with real components and every state | [design](modules/design/prd.md) |
| Define what is acceptable before code exists | Tests written red from the criteria, locked from `build` | [plan](modules/plan/prd.md) |
| Prove the tests can fail | Mutation testing, and each criterion rerun with new data | [verify](modules/verify/prd.md) |
| Prove who can do what | A role × action matrix, allowed and denied, down to the database | [Testing](foundations/architecture/testing.md#permissions) |
| Test features built on AI | Evals over a golden set, with a threshold | [Testing](foundations/architecture/testing.md#features-with-ai) |
| Keep the pipeline fast without losing quality | Less at the early moments, everything on the way to production | [Pipeline](foundations/architecture/pipeline.md) |
| Ship code hidden and launch it later | A flag, through OpenFeature | [Feature flags](foundations/architecture/flags.md) |
| Launch and announce in one action | The flag's row turns it on and sends the Release Note when you say | [Feature flags](foundations/architecture/flags.md#one-change-launches-everything) |
| Recover from a bad release | Flag off, rollback, or `hotfix`, in that order | [Release](foundations/architecture/release.md#when-production-breaks) |
| Retire a feature cleanly | Its note, help, Walkthrough, flag and data go with it | [Release](foundations/architecture/release.md#retiring-a-feature) |
| Generate what people read | Help Center, API Reference, Release Notes, from the spec | [publish](modules/publish/prd.md) |
| Show users how, on the real screen | A Walkthrough, from the product's assistant | [Walkthroughs](foundations/architecture/walkthroughs.md) |
| Check the bet paid off | The PRD's metric, on its review date | [measure](modules/measure/prd.md) |

## Optional, if the project has it

| Capability | Turned on with |
|---|---|
| API Reference · MCP · Help Center · Release Notes · Walkthroughs | `publish` in `workspace.yaml` |
| Languages besides English | `locales`; English and i18n come with every project |
| A staging environment | `environments` |
| Feature flags | `tools.flags` |
| Row-level security tests · Evals · Observability · Mutation testing | `tools` |
| A private spec on top of a public one | `references` |

## Procedures

The cycle, in order ([cycle](modules/cycle/prd.md)):

| # | Stage | Mode | Leaves |
|---|---|---|---|
| 0 | [map](modules/map/prd.md) | Interactive | Foundations, module index, PRDs of what exists |
| 1 | [specify](modules/specify/prd.md) | Interactive | The PRD or delta |
| 2 | [architect](modules/architect/prd.md) | Guided or delegated | Decisions, architecture documents, failure checks |
| 3 | [design](modules/design/prd.md) | Interactive | Screens in code, every state |
| 4 | [plan](modules/plan/prd.md) | Delegated | Tasks, red tests, a context pack each |
| 5 | [build](modules/build/prd.md) | Delegated | Code and PRs |
| 6 | [verify](modules/verify/prd.md) | Delegated | The `Acceptance Report` |
| 7 | [accept](modules/accept/prd.md) | Human | A decision per delta |
| 8 | [publish](modules/publish/prd.md) | Delegated | What people read, prepared, then launched |
| 9 | [measure](modules/measure/prd.md) | Delegated | The metric against its target |

Each change runs only what applies to it ([tracks](modules/tracks/prd.md)):

| Track | For |
|---|---|
| `full` | A new PRD, or a story past the threshold |
| `story` | A thin slice of an existing PRD |
| `fix` | A bug the spec already covered |
| `hotfix` | A production bug that cannot wait |
| `cover` | Criteria, tests and docs for what already works, changing none of it |
| `chore` | Technical work with no product ID |

Branches: one per change, with design, architecture and task branches inside it
([Branches](foundations/architecture/branches.md)).

## Tools

### CLI

| Command | Does |
|---|---|
| `pedd init` | Onboards a project |
| `pedd doctor` | What each stage has and lacks; stale flags |
| `pedd update` | Refreshes the framework's files; `--dry-run` previews |
| `pedd install` | Sets up whoever clones the project |
| `pedd index` | Builds the spec graph |
| `pedd check` | Runs the checks |
| `pedd status` | Where the product stands; `--stale`, `--cost`, `--time`, `--adoption`, `--landing` |
| `pedd trace <id>` | One requirement's chain |
| `pedd impact` | What a change affects; `--tests` selects tests |
| `pedd sweep` | Every open question of a change, at once, with recommendations; `--accept-recommended` |
| `pedd branch` | Creates a work branch from the right base, read from the tracker and the change |
| `pedd overlap` | Which changes in flight touch the same IDs or files |
| `pedd sync` | Merges the base into every change in flight that overlaps what just landed |
| `pedd land` | The landing order of the ready changes, then lands them one at a time |
| `pedd adopt` | What a running product lacks, as changes |
| `pedd launch` | Launches an accepted change |
| `pedd judges bench` | Each judge over past changes with known findings |
| `pedd workspace split` | Moves from `mono` to `split` |

### Skills

Installed by `pedd init`, or without the CLI with `npx skills add openpedd/openpedd`. Others publish
theirs as [extensions](foundations/business/open-core.md#extensions): the core holds only the method's skills; any other, ours or found online, is an extension with its license checked.

| Stage | Skills |
|---|---|
| Any | `/sweep` |
| `map` | `/map` · `/map-module` · `/map --business` |
| `specify` | `/specify` · `/specify-interview` · `/specify-flow` · `/specify-story` · `/specify-define` · `/specify-fix-doc` · `/idea` |
| `architect` | `/architect` · `/architect-research` · `/architect-teardown` · `/architect-adr` · `/architect-fitness` |
| `design` | `/design` · `/design-inventory` · `/design-variants` · `/design-complete` · `/design-close` |
| `plan` | `/plan` · `/plan-slice` · `/plan-tests` · `/plan-pack` |
| `build` | `/build` · `/build-batch` · `/build-findings` |
| `verify` | `/verify` |
| `accept` | `/accept` |
| `publish` | `/publish` · `/publish-api` · `/publish-help` · `/publish-notes` · `/publish-walkthrough` |
| `measure` | `/measure` |

### Judges

| Stage | Judge | Checks |
|---|---|---|
| `map` | `map-judge` | Coverage against the code |
| `specify` | `cold-read-judge` · `prd-judge` | Nothing left to guess; every requirement complete |
| `architect` | `architecture-judge` | Decisions, evidence and failure checks |
| `design` | `design-judge` | Coverage, heuristics, accessibility, behavior in the browser |
| `plan` | `analyze-judge` | Every requirement has a task and a real red test |
| `verify` | `verify-judge`, one per lens · `confirm-judge` | The product against the spec, by lens; each serious finding must survive a refutation |
| `publish` | `freshness-judge` | Everything in scope `fresh` |

### MCP

`search_spec` · `get_doc` · `resolve_id` · `list_ids` · `get_context_for` · `get_history` ·
`changes_since` · `get_freshness` · `list_stale` · `propose_delta` · `get_change`. What each returns is
in [Skills, agents and tools](foundations/architecture/agents.md#mcp-tools).

## Free and paid

The framework is free: everything above, run when you ask. **OpenPEDD Cloud** watches for you, all the
time and across systems: sync, live dashboard, traceability always on, the way back from the tracker,
hotspots, and Launch ([Open core](foundations/business/open-core.md)).
