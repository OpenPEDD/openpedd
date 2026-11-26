---
title: Foundation
description: ENT-02 · A document every stage reads before working
owner: Kevin
version: "1.11"
updated: "2026-11-26"
---

# ENT-02 · Foundation

A foundation is a document that **constrains** what the stages produce. It is read before working,
not produced by the work. Each stage's [`Context Pack`](context-pack.md) names the foundations it
includes.

| Foundation | What it defines | Read by |
|---|---|---|
| `Business Context` | Product goal, audience, pricing, north-star metric, positioning: what we decided | `specify` |
| `Business Map` | How the client's organization works today (**as-is**: people and roles, processes, tools and spreadsheets, pains) and how it will work with the system (**to-be**: what changes, which processes the system takes, the modules and their order). Required when the product changes how an organization works; optional otherwise ([`DEC-24`](../../decisions/DEC-24-business-map.md), [map](../../modules/map/prd.md#business-mode)) | `specify` · `map` |
| `Market` | Competitors, tools, market size, studies: what we measured outside, each with its survey date | `specify` |
| `Domain Model` | Each entity (`ENT`), once: fields, states, transitions | All |
| `Glossary` | What each thing is called in code (`Name`) and on screen, one column per locale headed by its code (`en`, `es`); names no longer used ([`DEC-33`](../../decisions/DEC-33-names-per-locale.md)) | All |
| `Roles & Permissions` | Which role performs which action | `specify` · `design` · `verify` |
| `Brand System` | Colors, type, tokens, components, UI libraries and preferences; the pattern each recurring piece follows (filters, badges, toasts, settings, paywalls); the widths a screen is checked at; and its **component catalog**: every reusable piece with a story per state and when to use it, served to agents through an MCP ([`MKT-06`](../market/component-catalogs.md)) | `design` · `build` |
| `Voice & Tone` | How the product speaks to its users, inside the product | `design` · `publish` |
| `Marketing` (optional) | How the product speaks to people who do not know it yet: messages, channels and the rules of each format | `specify` · `publish` |
| `Architecture Rules` | Layers, conventions and patterns, why each exists, why the stack was chosen, and what must not be touched | `architect` · `plan` · `build` · `verify` |
| `Security Policy` | Security rules that always hold | `architect` · `verify` |
| `Privacy` | Which data is personal, why it is held, how long it is kept, who processes it and how it is deleted | `specify` · `architect` · `verify` |
| `Quality Standards` | The system's qualities, a table `NFR` (`NFR-SYS-nn`) · `Quality` (one of ISO/IEC 25010's, [`MKT-18`](../market/quality-and-risk.md)) · `The system shall` · `Measured by`; performance, accessibility and i18n budgets; eval thresholds; the contract every write follows | `architect` · `design` · `verify` |
| `Integrations` | Each external provider: what is used, its sandbox, its limits | `architect` · `build` |
| `Delivery Pipeline` | CI/CD: checks (among them the one that rejects a change to `plan`'s tests), the mutation tool, what runs at each moment, environments, feature flags, the watch window, rollout | `plan` · `build` · `verify` · `publish` |
| `Tracking Plan` | The analytics events each metric is measured with | `specify` · `build` · `measure` |
| `Test Data` | Sample data shared by mockups, tests and the final check; the golden sets of evals | `design` · `plan` · `verify` |

A foundation that does not exist yet is marked empty, not invented. `map` fills what it can infer
from existing code ([`modules/map`](../../modules/map/prd.md)).

## Tables the views read [#tables-the-views-read]

Three foundations hold a table the `security` and `context` views are drawn from
([views](../../modules/views/prd.md#the-views)). When the code already holds it, `workspace.yaml` names
the file under `views` ([`ENT-16`](workspace.md)) and the spec keeps only the why: **the code wins over a
copy** ([`RULE-01`](../rules/writing.md#rule-01)).

| Foundation | Table | Columns | Or, from the code |
|---|---|---|---|
| `Roles & Permissions` | Permissions | `Action`, then one column per role; each cell `yes`, `own` or `no` | `security.permissions`: a TOML, YAML or JSON file of role → action → `yes` · `own` · `no`, or a script that prints it as JSON |
| `Security Policy` | Tables | `Table` · `Protected by` · `Roles` · `Rule` | `security.policies`: the migrations, where each `CREATE POLICY … ON <table>` is a row |
| `Security Policy` | Rules | One `SEC-nn` heading per rule, the rule as its title | — |
| `Integrations` | Providers | `INT-nn` · `Provider` · `Used for` · `Used by` (the components) | — |

A project that lists its tables lists all of them: one with no row in `Tables` is loose
([`RULE-27`](../rules/writing.md#rule-27)).
