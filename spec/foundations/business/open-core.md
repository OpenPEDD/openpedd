---
title: Open core
description: BIZ-04 · What is free, what is paid, and the rule that draws the line
owner: Kevin
version: "1.1"
updated: "2026-11-11"
---

# BIZ-04 · Open core

| Product | Is | License |
|---|---|---|
| **OpenPEDD** | The framework: format, CLI `pedd`, skills, judges, local MCP, reader, CI action | Apache-2.0; the format and docs, CC BY 4.0 ([`DEC-02`](../../decisions/DEC-02-licenses.md)) |
| **OpenPEDD Cloud** | Continuous sync and everything that watches across systems | Closed |

## The line

**What runs on your machine when you ask for it is free. What watches for you, all the time and
across systems, is paid.** The free framework gives everything needed to compute freshness by hand.
The paid plan's value is that **nobody has to remember to run it**.

| Free: OpenPEDD | Paid: OpenPEDD Cloud |
|---|---|
| Format, layers, IDs, blocks, history | **Sync engine**: listens to the spec, code, tracker, design tool and help, and recomputes freshness on every change |
| CLI: `check`, `index`, `status`, `impact`, `trace` | **Freshness dashboard** across repos, live |
| Stages, skills and judges for each agent, with your own subscription | **Two-way tracker sync**: issues anchored, flagged stale, created when the spec changes |
| Local MCP, read-only plus `propose_delta` | **Auto-PRs** that update the help and API docs when a requirement changes |
| Reader (static site) | **Hosted MCP** with per-person tokens and permissions |
| CI action with the checks | **Judges as a service** on every PR, with the cycle metric |
| Local generators | Multi-repo and multi-product |
| `measure` by hand ([`DEC-03`](../../decisions/DEC-03-measure.md)) | `measure` on its own, with analytics connectors |
| Creating repos with the CLI | Creating repos from the dashboard; hosting spec, help and docs |
| The traceability model and event format; `pedd trace` and `pedd status` on demand ([`ARCH-05`](../architecture/traceability.md)) | **Traceability always on**: every tool and environment connected, the event history kept, the graph from product to requirement |
| — | **The way back**: tracker issues turned into candidate stories on the right PRD |
| `pedd launch`, by hand | **Launch**: what is ready, what each change lacks, and one action to promote, turn on and announce, watching what happens after |
| — | **Hotspots**: stories per module and PRD, per week |
| — | SSO, roles, audit, history retention |

Someone can build their own CI job that runs `pedd status` and opens issues: that is the cost of an
open platform, and the same line GitLab, Sentry and PostHog draw.

Pricing and Cloud plans live in the private `openpedd-cloud` repo ([`DEC-11`](../../decisions/DEC-11-visibility.md)).
