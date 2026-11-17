---
title: Agent setups and AI review
description: MKT-04 · Tools that configure coding agents and review their changes with AI. Surveyed 2026-11-13
owner: Kevin
version: "1.0"
updated: "2026-11-13"
---

# MKT-04 · Agent setups and AI review

Surveyed on 2026-11-13, for [`verify`](../../modules/verify/prd.md), [`ARCH-04`](../architecture/agents.md)
and [`workspace`](../../modules/workspace/prd.md). **Read** means its site and README; no code or
issues were read. Every figure is the project's own, unverified.

| Tool | Depth | What it does | Where it falls short |
|---|---|---|---|
| **gentle-ai** (v4.1.1, MIT, ~9.1k stars) | Read: site, README, `docs/components.md` | Configures the agents already installed (17) with skills, MCP, permissions and a review mode. Never installs an agent: prints the command. Backs up each config before writing, keeps the last 5. A deny-list of sensitive paths. `doctor`, `--dry-run` | Workflow for the developer's session; no product spec |
| **engram** (v1.20.0, MIT) | Read: README | Agent memory: one Go binary, SQLite with full-text search, MCP over stdio. Stable topic keys, a session summary, conflicts between memories surfaced | Memory is not a source of truth: nothing marks what governs |
| **gga** (v2.10.1, MIT) | Summary | A pre-commit hook that reviews the diff with the provider the person has | One reviewer, no refutation |
| **Gentle Hub** | Read: page | A catalog of community packages, listed from GitHub topics. A listing is not an endorsement | — |
| **Crysk** (Apache-2.0, ~15 stars) | Read: site, README, part of `docs/github-actions.md` | PR review: specialized hunters in parallel, an adversarial refuter on each serious finding, and **code** decides blocking or advisory. Runs Claude Code as a subprocess, on the subscription. GitHub Action with a required check and comment commands; per-PR concurrency; fork PRs get no secrets | Reviews the diff, not against a spec. Logic and lifecycle only, not conventions |

## What they measured

| Figure | Source |
|---|---|
| A 3-line task: 335 s and USD 0.339 delegated to a subagent, 77 s and USD 0.105 inline. One run | gentle-ai site |
| 13 % of findings are false positives | crysk.dev |
| 52 of 66 serious bugs found on the Martian code review bench (50 PRs), against 35 for plain Claude Code. Judge: Claude Opus 4.5 | Crysk, `docs/benchmarks/martian-bench.md` |
| USD 0.32 a review with DeepSeek through OpenCode | crysk.dev |

## Practices worth noting

| Practice | Who | Taken in |
|---|---|---|
| Models judge; code decides what blocks | Crysk | [`ARCH-13`](../architecture/review.md#what-blocks) |
| Hunters per lens, then a refuter | Crysk; gentle-ai's `judgment-day` (two judges in parallel) | [`ARCH-13`](../architecture/review.md) |
| Precision published, measured on a fixed bench | Crysk | [`ARCH-04`](../architecture/agents.md#measuring-judges) |
| A subscription token as a CI secret (`claude setup-token`); `/recheck` and `/override` for one head commit | Crysk | [`ARCH-13`](../architecture/review.md#the-judges-in-ci) |
| Personal and team config; what spends can only be lowered from the team's file | Crysk | [`workspace`](../../modules/workspace/prd.md#personal-settings) |
| A skill that fixes the real findings, answers each and stops on a design problem | Crysk (`crysk-loop`) | [`build`](../../modules/build/prd.md) |
| Skills published to the `skills.sh` registry (`npx skills add`) | Crysk, gentle-ai | [`ARCH-04`](../architecture/agents.md) |
| Backups before writing, deny-list, never installing the agent | gentle-ai | [`workspace`](../../modules/workspace/prd.md#writing-safely) |
| Delegating by reason, not by size | gentle-ai | [`ARCH-12`](../architecture/running.md#where-agents-run) |
| Extensions listed by GitHub topic | Gentle Hub | [`BIZ-04`](../business/open-core.md#extensions) |

## Not covered

Crysk's `docs/configuration.md` and its skills' files; the repos of gga, Gentle Shell and Gentleman-Skills.
