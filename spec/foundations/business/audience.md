---
title: Audience
description: BIZ-05 · Who OpenPEDD is for, who uses each part, and how success is measured
owner: Kevin
version: "1.0"
updated: "2026-11-08"
---

# BIZ-05 · Audience

OpenPEDD is for **whoever defines the product** in a team that builds with AI agents, and for the
people and agents who build from that definition.

| Who | Is | Uses OpenPEDD to | Touches |
|---|---|---|---|
| **Product engineer** | Defines and builds; the primary user | Write the spec, run the cycle, decide at the gates | Every stage |
| **Product owner / PM** | Defines, does not build | Write the spec, approve, accept | `specify` · the merge gates · `accept` |
| **Designer** | Turns the spec into screens | Design against the spec and return what it finds | `design` |
| **Engineer** | Builds | Plan, build and verify against the spec, with agents | `plan` · `build` · `verify` |
| **Coding agent** | Builds, under the rules | Read its context pack through the MCP | Every delegated stage |

## Where it fits best

| Fits | Because |
|---|---|
| Small and mid-size teams building with coding agents | The spec is what keeps several agents and people consistent |
| A product that will live for years | The spec pays off over the product's life, not over one feature |
| A team with users outside: help center, public API | That is where stale derived artifacts hurt |

| Fits less | Because |
|---|---|
| A one-off project or a throwaway prototype | The cycle is too much for something that will be thrown away |

## The first user

**Reclee** is the first product built with OpenPEDD and the test bench of every step
([`open/roadmap`](../../open/roadmap.md)).

## Success

The north-star metric of OpenPEDD is open (`Q-21`). Who pays, and how much, belongs to OpenPEDD
Cloud and lives in its private spec ([`DEC-11`](../../decisions/DEC-11-visibility.md)).
