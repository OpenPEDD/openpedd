---
title: Workspace
description: pedd init and the onboarding — a new or a running project, its repos, its documentation, its stack and the tools each stage needs
owner: Kevin
version: "1.14"
updated: "2026-11-26"
status: draft
---

# Workspace

`pedd init <project>` **onboards a project** to the framework: from zero or on software already
running, in one monorepo by default or in several repos. It sets up a [`Workspace`](../../foundations/domain/workspace.md),
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
| `pedd doctor` | What each stage has and lacks, and the gaps against the current [baseline](baseline.md#keeping-up). Reads only | Any time |
| `pedd update` | Brings the framework's files to the installed CLI, and offers each baseline gap as a small change; `--dry-run` shows what would change | After upgrading the CLI |
| `pedd install` | Installs the skills, judges and MCP from `workspace.yaml`, and the permission rules and read hook that keep agents' context small, without asking again | Whoever clones the project |
| `pedd adopt` | Lists what a running product lacks, per module, and turns each gap into a change ([adopting](#adopting-a-running-product)) | After `init`, on a product already in production |
| `pedd launch` | Launches an accepted change ([`ARCH-08`](../../foundations/architecture/release.md)) | When it should reach customers |

## Main flow

| Step | Does |
|---|---|
| 1 | **Reads the situation**: an empty folder, code already there, or OpenPEDD already installed (then it runs `doctor` and offers `update`) |
| 2 | **Settles the layout**, on two axes ([below](#the-layout)): detects what it can and confirms |
| 3 | Creates the monorepo, or connects the repos that exist; in `split`, writes a `link.yaml` in each pointing back to the spec |
| 4 | **Installs the structure** from the [project template](baseline.md#the-project-template): `spec/` with its foundations marked empty, the apps and packages of a new product, `workspace.yaml` with the language of the prose and the `locales`: `en` first, then the ones it asks for, proposing the prose's language. The `Glossary` gets one column per locale ([`DEC-33`](../../decisions/DEC-33-names-per-locale.md)). Existing docs stay where they are, as reading material for `map` and `specify`; they are not converted |
| 5 | **Adopts the agents' instructions**: an `AGENTS.md` or `CLAUDE.md` already written is kept, and OpenPEDD's block goes between `<!-- pedd -->` markers; it sends every agent to the [code index](../../foundations/architecture/code-index.md) first. Nothing outside them is touched |
| 6 | **Finds out the stack** ([below](#the-stack)) |
| 7 | **Asks what the code does not say**: areas not to touch, commands with a catch, why a convention exists, how to run it locally and with which test user, which branch is the base |
| 8 | **Checks the tools of each stage** ([below](#the-tools-of-each-stage)) and offers what is missing |
| 9 | Installs the skills, the judges, the MCP and [the human clock](#the-human-clock) in the agents it detects, and records each file and its hash in `.pedd/manifest.json` |
| 10 | **Reports which stages are ready** and what each lacks |
| 11 | Offers the next step: `map` if there is code; `map --business` if the product changes how an organization works; `specify` otherwise |

## The baseline

What a project starts with, its version, and how a product already built keeps up with it, are in
[Baseline](baseline.md).

## The layout

**A new product is one monorepo** ([`ARCH-03`](../../foundations/architecture/workspace.md)). `split`
is offered only where ARCH-03 says: a product adopted with several repos, or open-source code with a
private spec.

| Project | Layout |
|---|---|
| New | `mono`: `spec/`, `apps/`, `packages/` |
| Running, one repo or a monorepo | `mono`: `spec/` and the missing apps added next to the code |
| Running, several repos | `split`: a `-spec` repo, and each code repo linked to it |

There is **one spec per product**, whatever the layout. Each app and package is a component mapped to
the modules it implements, so an agent working on a change knows which code to open. `init` detects the
components from the workspace manager (pnpm, Turborepo, Nx and the like).

```yaml
# workspace.yaml, at the monorepo root
project: reclee
mode: mono
language: es
components:
  - { path: apps/app, modules: [ats, talent-pool] }
  - { path: apps/landing, modules: [site] }
  - { path: packages/ui, modules: [] }
publish:
  help: { path: apps/help, url: https://help.reclee.com }
  docs: { path: apps/docs, url: https://docs.reclee.com }
  release_notes: { target: help }
locales: [en, es]   # en is the base (DEC-21); one Glossary column each (DEC-33)
run:
  command: pnpm dev
  test_user: E2E_TEST_USER   # the name of the variable, never its value
tools:
  design_system: shadcn
  e2e: playwright
  tracker: linear
```

## The stack

| Project | How it is settled | Where it goes |
|---|---|---|
| **Running** | Detected from the manifests and config: language, framework, package manager, database, auth, unit and end-to-end tests, CI, deploy, analytics, flags, design system. Each one names the file that proves it ([`RULE-21`](../../foundations/rules/cycle.md#rule-21)) | `.pedd/stack.json`, recalculated by `doctor` |
| **New** | Asked one decision at a time, with the options and a recommendation. The i18n library is always one of them ([`DEC-21`](../../decisions/DEC-21-i18n-from-day-one.md)) | `ADR`s of the initial change, and `.pedd/stack.json` once it exists in the code |

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
| `design` | Design system: `Brand System` filled, components in code | Required | A branding change first, planned in the roadmap ([open](../../open/README.md#the-roadmap)): extracted from the code, or chosen |
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
| `plan` · `verify` | Translation checks: missing, unused and raw keys | Required | Missing text reaches users |
| `plan` · `verify` | Evals | If the product uses AI | Those criteria cannot be tested |

MCP servers go in the project's config only without secrets; credentials stay in each person's
environment.

## The human clock [#the-human-clock]

`init` installs what records [human time](../../foundations/domain/trace-event.md#human-time), in files
the project versions, so whoever clones it records too:

| File | Holds |
|---|---|
| `.pedd/hooks/human.mjs` | The hook: reads the agent's event, keeps its time and session, appends one `human` event to `.pedd/trace/events.jsonl` with the person's git `user.email` and their open step. It drops the message unread, prints nothing, and never stops the agent |
| `.claude/settings.json` | The `UserPromptSubmit` hook that runs it, added beside the hooks already there |
| `.gitattributes` | `.pedd/trace/events.jsonl merge=union`: two branches that each appended events merge without a conflict |

The weights of the project's sizing catalog go in `workspace.yaml` `pieces`, one line per
[piece kind](../../foundations/domain/trace-event.md#pieces): `form.compound: 2`.

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
| 2 | **Lists the gaps per module**: no PRD; a `FR` without an `AC`; an `AC` without a test; a screen without help or Walkthrough, where the project declares them; text written in code instead of a key, as one change of its own ([`DEC-21`](../../decisions/DEC-21-i18n-from-day-one.md)); code with no anchor; a stage without its tool, from `doctor` |
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
| Moving from `mono` to `split` | `pedd workspace split` moves the folders and updates the references ([`ARCH-03`](../../foundations/architecture/workspace.md#split)) |
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
