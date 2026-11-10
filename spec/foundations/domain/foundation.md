---
title: Foundation
description: ENT-02 · A document every stage reads before working
owner: Kevin
version: "1.3"
updated: "2026-11-10"
---

# ENT-02 · Foundation

A foundation is a document that **constrains** what the stages produce. It is read before working,
not produced by the work. Each stage's [`Context Pack`](context-pack.md) names the foundations it
includes.

| Foundation | What it defines | Read by |
|---|---|---|
| `Business Context` | Product goal, audience, pricing, north-star metric, positioning: what we decided | `specify` |
| `Market` | Competitors, tools, market size, studies: what we measured outside, each with its survey date | `specify` |
| `Domain Model` | Each entity (`ENT`), once: fields, states, transitions | All |
| `Glossary` | What each thing is called in code and on screen, per language; names no longer used | All |
| `Roles & Permissions` | Which role performs which action | `specify` · `design` · `verify` |
| `Brand System` | Colors, type, tokens, components, UI libraries and preferences; the pattern each recurring piece follows (filters, badges, toasts, settings, paywalls); the widths a screen is checked at | `design` · `build` |
| `Voice & Tone` | How the product speaks to its users, inside the product | `design` · `publish` |
| `Marketing` (optional) | How the product speaks to people who do not know it yet: messages, channels and the rules of each format | `specify` · `publish` |
| `Architecture Rules` | Layers, conventions, patterns, the stack | `architect` · `plan` · `build` · `verify` |
| `Security Policy` | Security rules that always hold | `architect` · `verify` |
| `Quality Standards` | Performance, accessibility and i18n budgets; the contract every write follows | `architect` · `design` · `verify` |
| `Integrations` | Each external provider: what is used, its sandbox, its limits | `architect` · `build` |
| `Delivery Pipeline` | CI/CD: checks, environments, feature flags, rollout | `plan` · `build` · `publish` |
| `Tracking Plan` | The analytics events each metric is measured with | `specify` · `build` · `measure` |
| `Test Data` | Sample data shared by mockups, tests and the final check | `design` · `plan` · `verify` |

A foundation that does not exist yet is marked empty, not invented. `map` fills what it can infer
from existing code ([`modules/map`](../../modules/map/prd.md)).
