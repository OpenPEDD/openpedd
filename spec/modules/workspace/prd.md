---
title: Workspace
description: pedd init and the onboarding — a new or a running project, its repos, its documentation, its stack and the tools each stage needs
owner: Kevin
version: "1.9"
updated: "2026-11-17"
status: draft
---

# Workspace

`pedd init <project>` **onboards a project** to the framework: from zero or on software already
running, in one repo or many. It sets up a [`Workspace`](../../foundations/domain/workspace.md),
installs the documentation structure, finds out what the project is built with, and says what each
stage still needs to work. The repo layout is in
[`ARCH-03`](../../foundations/architecture/workspace.md).

**It asks before it changes anything, and never rewrites what is there.**

```bash
pedd init reclee
```

| Command | Does | When |
|---|---|---|
| `pedd init` | The whole onboarding | Once per project |
| `pedd doctor` | What each stage has and lacks. Reads only | Any time |
| `pedd update` | Brings the framework's files to the installed CLI; `--dry-run` shows what would change | After upgrading the CLI |
| `pedd install` | Installs the skills, judges and MCP from `workspace.yaml`, and the permission rules and read hook that keep agents' context small, without asking again | Whoever clones the project |
| `pedd adopt` | Lists what a running product lacks, per module, and turns each gap into a change ([adopting](#adopting-a-running-product)) | After `init`, on a product already in production |
| `pedd launch` | Launches an accepted change ([`ARCH-08`](../../foundations/architecture/release.md)) | When it should reach customers |

## Main flow

| Step | Does |
|---|---|
| 1 | **Reads the situation**: an empty folder, code already there, or OpenPEDD already installed (then it runs `doctor` and offers `update`) |
| 2 | **Settles the layout**, on two axes ([below](#the-layout)): detects what it can and confirms |
| 3 | Creates the missing repos with the project prefix (`reclee-spec`, `reclee-help`, `reclee-docs`), or connects the existing ones, and in `split` writes a `link.yaml` in each pointing back to the spec |
| 4 | **Installs the documentation structure**: `spec/` with its foundations marked empty, `workspace.yaml`, and the language of the prose. Existing docs stay where they are, as reading material for `map` and `specify`; they are not converted |
| 5 | **Adopts the agents' instructions**: an `AGENTS.md` or `CLAUDE.md` already written is kept, and OpenPEDD's block goes between `<!-- pedd -->` markers. Nothing outside them is touched |
| 6 | **Finds out the stack** ([below](#the-stack)) |
| 7 | **Asks what the code does not say**: areas not to touch, commands with a catch, why a convention exists, how to run it locally and with which test user, which branch is the base |
| 8 | **Checks the tools of each stage** ([below](#the-tools-of-each-stage)) and offers what is missing |
| 9 | Installs the skills, the judges and the MCP in the agents it detects, and records each file and its hash in `.pedd/manifest.json` |
| 10 | **Reports which stages are ready** and what each lacks |
| 11 | Offers the next step: `map` if there is code, `specify` if there is none |

## The layout

Two separate questions: where the documentation lives, and how the code is organized.

| Code | Documentation `mono` (folders in the repo) | Documentation `split` (one repo per audience) |
|---|---|---|
| **One app** | `spec/`, `help/`, `docs/` next to the code | `-spec`, `-help`, `-docs` |
| **Monorepo** (packages) | The same folders at the root | The same repos; the monorepo is one code repo |
| **Several repos** | Not offered: the spec would live inside one part | `-spec`, `-help`, `-docs`, and each code repo |

There is **one spec per product**, whatever the layout. Each component maps to the modules it
implements, so an agent working on a change knows which code to open. `init` detects the components
from the workspace manager (pnpm, Turborepo, Nx and the like).

```yaml
# reclee-spec/workspace.yaml
project: reclee
mode: split
language: es
repos:
  spec: Reclee-team/reclee-spec
  help: Reclee-team/reclee-help
  docs: Reclee-team/reclee-docs
  code: [Reclee-team/scout]
components:
  - { repo: Reclee-team/scout, path: apps/web, modules: [ats, talent-pool] }
  - { repo: Reclee-team/scout, path: apps/api, modules: [ats, talent-pool] }
publish:
  help: { generator: fumadocs, url: https://help.reclee.com }
  docs: { generator: openapi, url: https://docs.reclee.com }
  release_notes: { target: help }
  walkthroughs: { target: help }   # only what is declared is generated
locales: [es, en]
environments:
  - { name: production, branch: main, public: true }
branches:
  base: dev
  change: "{prefix}/{slug}"
  design: "design/{slug}"
  architecture: "arch/{slug}"
  task: tracker
run:
  command: pnpm dev
  test_user: E2E_TEST_USER   # the name of the variable, never its value
tools:
  research: firecrawl
  design_system: shadcn
  browser: playwright
  e2e: playwright
  mutation: stryker
  flags: openfeature-table
  observability: sentry
  tracker: linear
models:
  profile: balanced
stages:
  architect: { mode: guided }
review:
  blocking: high       # the lowest severity that blocks (ARCH-13)
  ci: true             # the judges run on every PR (ARCH-04)
```

## The stack

| Project | How it is settled | Where it goes |
|---|---|---|
| **Running** | Detected from the manifests and config: language, framework, package manager, database, auth, unit and end-to-end tests, CI, deploy, analytics, flags, design system. Each one names the file that proves it ([`RULE-21`](../../foundations/rules/cycle.md#rule-21)) | `.pedd/stack.json`, recalculated by `doctor` |
| **New** | Asked one decision at a time, with the options and a recommendation | `ADR`s of the initial change, and `.pedd/stack.json` once it exists in the code |

**The list of technologies is not written into the spec**: the code already says it, and a copy goes
stale. The spec holds what the code cannot say: why it was chosen ([`DEC-12`](../../decisions/DEC-12-stack-derived.md)).
Detection reads files and never runs code; of the environment it reads the names of the variables,
never their values.

## The tools of each stage

**`doctor` asks for a capability, never for a brand**, so OpenPEDD fits whatever the project uses;
`tools` records which tool fills each one. Each capability is **required** for its stage (the stage
cannot run), **recommended** (it runs, and says what it lost), or applies only **if the project has
it**. `init` offers what is missing and installs only what the person confirms. A
missing tool never stops `init`.

| Stage | Capability | Level | Without it |
|---|---|---|---|
| `specify` · `architect` | Web research | Recommended | Fewer references, and the `Delta Report` says so |
| `design` | Design system: `Brand System` filled, components in code | Required | It is defined first: extracted from the code, or chosen |
| `design` · `build` | A component catalog agents can query: a story per reusable piece, its MCP, its stories run as tests with axe | Recommended | Agents redraw pieces that exist, and contrast is checked by hand |
| `design` · `verify` | A duplicate check over the whole code: the same markup written by hand in 3+ files | Recommended | Copies are found only inside the change |
| `design` · `verify` | A browser agents can drive | Required with screens | Screens cannot be walked or captured |
| `plan` · `build` | Unit and end-to-end test runners; running locally with a test user | Required | No red tests |
| `build` · `verify` | A test script for agents that prints only the failures | Recommended | Every passing test is reread on every call |
| `verify` | Mutation testing | Recommended | Tests are not checked for being able to fail |
| Pipeline | CI, and a preview per branch | Required | Tests are not protected; nothing to accept on |
| Tracker | One with sub-issues | Required | No trace per stage |
| `publish` | A help generator | Required with users | Help is not published |
| `measure` | Analytics | Required to measure | The stage does not run |
| Launch | Feature flags | If the project has them | What is on the base launches together |
| After launch | Observability | Recommended | Regressions are found by users |
| `plan` · `verify` | Row-level security tests | If the project has it | Roles are proved in the application only |
| `plan` · `verify` | Translation checks | If there are `locales` | Missing text reaches users |
| `plan` · `verify` | Evals | If the product uses AI | Those criteria cannot be tested |

MCP servers go in the project's config only without secrets; credentials stay in each person's
environment.

## Writing safely [#writing-safely]

`init`, `install`, `update` and `adopt` write into the project and into each agent's settings:

| Rule | Why |
|---|---|
| **`--dry-run` on every command that writes**: it prints each file it would create or change, and the difference | What it will touch is seen before it is touched |
| **A backup before overwriting** any file outside `spec/`, in `.pedd/backups/<date>/`; the last five are kept | An agent's settings broken by a write are restored in one step |
| **Sensitive paths are denied** to every agent: `.env*`, `*.pem`, `*.key`, `~/.ssh`, `~/.aws`, and what the project adds, as permission rules next to the ones that keep context small ([`ARCH-12`](../../foundations/architecture/running.md#keeping-the-context-small)) | An agent that never reads a secret cannot leak it |
| **It never installs an agent**: if one is missing, it prints the command to install it | Installing software on someone's machine is their call |

## Personal settings [#personal-settings]

Two files, read in this order:

| File | Holds | Can change |
|---|---|---|
| `workspace.yaml` | The team's settings, versioned | Everything |
| `~/.pedd/config.yaml` | One person's settings | Their runners, their models within the profile, their editor. **What spends can only be lowered**: fewer parallel sessions, a smaller budget. What blocks (`review.blocking`) is set only by the team |

**Why:** a person can spend less than the team agreed, never more, and never let through what the team
blocks.

## Adopting a running product [#adopting-a-running-product]

`init` leaves the project ready to work; `adopt` takes it to the framework as defined, in small
changes ([`DEC-17`](../../decisions/DEC-17-adopt-in-slices.md)). It reads only, and proposes.

| Step | Does |
|---|---|
| 1 | **Finds the existing spec**, if there is one, and imports it through `map`: converted and checked against the code, not rewritten |
| 2 | **Lists the gaps per module**: no PRD; a `FR` without an `AC`; an `AC` without a test; a screen without help or Walkthrough, where the project declares them; code with no anchor; a stage without its tool, from `doctor` |
| 3 | **Orders them**: first what is riskiest (permissions, billing, personal data, deletion), then what changes most often in git, then what a planned change will touch next |
| 4 | **Proposes one change per module and kind of gap**, on the `cover` track ([tracks](../tracks/prd.md#the-cover-track)), and creates them in the tracker once the person confirms |

`pedd status --adoption` shows how much is left: modules, criteria, tests, docs and anchors, each as
a count and a percentage.

| Rule | Why |
|---|---|
| A gap is never filled outside a change | Each piece is reviewed, and the trace records it |
| What `cover` finds wrong is not fixed there | It opens a `Q` or a `fix`; covering and changing are kept apart |
| The order is a proposal; the person may change it | They know what the business needs first |

## Alternate flows

| Flow | What changes |
|---|---|
| Repos already exist | Connects them and only writes the config files |
| A private spec on top of a public one | Adds `references` in `workspace.yaml` ([`ARCH-03`](../../foundations/architecture/workspace.md#several-specs)) |
| Moving from `mono` to `split` | `pedd workspace split` moves the folders and updates the references |
| Without a person at the keyboard | `--yes` takes the detected values and `--json` prints the report |
| `update` finds a file edited by hand | Stops and shows the difference; `--force` overwrites it. The spec is never touched |

## Exception flows

| Flow | What happens |
|---|---|
| No GitHub CLI or no permission to create repos | Prints the repos to create by hand and continues with config |
| No supported agent found | Writes the files for Claude Code and Codex, prints how to install each, and says so |
| Uncommitted changes in the repo | Warns and asks, so what it writes can be reviewed apart |
| A technology it cannot identify | Asks, and records the answer |

## Sources

Spec Kit (manifest, `check`) · OpenSpec (`update --dry-run`) · BMAD (adopting `AGENTS.md`) · Agent OS
(asking why) · Tessl (`install`) · Nx (`init`) · Copier (recorded answers) · `flutter doctor`, surveyed
in [`MKT-02`](../../foundations/market/onboarding.md) · gentle-ai (backups, deny-list, never installing
the agent) · Crysk (personal and team settings), surveyed in [`MKT-04`](../../foundations/market/agent-tooling.md).
