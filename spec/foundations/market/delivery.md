---
title: Delivery and in-product help
description: MKT-03 · Tools for guided help, flags, releases and testing, and what each leaves out. Surveyed 2026-11-11
owner: Kevin
version: "1.0"
updated: "2026-11-11"
---

# MKT-03 · Delivery and in-product help

Surveyed on 2026-11-10 and 11. **Docs** means the tool's own documentation, read through search
results; **vendor** means marketing pages or competitors, to be weighed as such.

## Guided help

| Tool | Source | Does | Leaves out |
|---|---|---|---|
| Pendo | Docs | Alerts "Element Missing" when a guide fails for a user | Found after the user hit it |
| Intercom | Docs | Tours started by code or shared in articles | Nothing found about its AI launching one |
| UserGuiding | Vendor | The assistant answers with text or builds a flow | — |
| Conecto | Vendor | Answers, points, takes there or acts | — |
| Product Fruits · Tiptour · BuddyAI | Vendor | AI that picks elements or drives the cursor | Guessing targets is fragile |
| CommandBar | Secondary | Now part of Amplitude | — |

Nobody found documents how a guide stays valid when the screen changes.

## Flags

| Tool | Source | Does | Leaves out |
|---|---|---|---|
| OpenFeature | Docs | CNCF standard to evaluate flags: providers, context, hooks, React and Node SDKs, in-memory provider | Managing flags: rules and values stay in the provider |
| flagd | Docs | A server reading flags from JSON | A panel |
| LaunchDarkly | Docs | Release pipelines with phases and approvals; guarded rollouts | Beta, Enterprise |
| Sentry | Docs | Attaches evaluated flags to errors, marks suspects | Pausing a rollout |

Unleash, Flipt and GrowthBook were not compared.

## Releases

| Tool | Source | Does | Leaves out |
|---|---|---|---|
| Linear Releases | Docs | A release with its SHA and issues; notes generated from them | Business plan and up |
| GitHub environments | Docs | Required reviewers | On Free, Pro and Team, public repos only |
| GitHub merge queue | Docs | Validates against the latest base | A path-filtered required check stays pending |

## Testing

| Tool | Source | Does |
|---|---|---|
| Playwright | Docs | `testIdAttribute`, shards, `failOnFlakyTests`; prefers locating by role |
| Stryker | Docs | Mutation testing: inserts bugs and checks tests catch them |
| pgTAP | Docs | Tests row-level policies inside a transaction, as each user |
| Schemathesis · Pact | Vendor | Generated cases from a schema · consumer-driven contracts |
| axe | Vendor (Deque) | 57% of issues by volume, in Deque's own audits |
| Promptfoo | Secondary | Evals as a CI gate |

Test selection: full runs on merge and nightly are the common safety net (Fowler's site, MathWorks).
Agent cost: Claude Code exports cost and tokens through OpenTelemetry; no source ties them to a PR.
