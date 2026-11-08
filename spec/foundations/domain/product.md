---
title: Product
description: ENT-20 · The top of the hierarchy, what one spec describes
owner: Kevin
version: "1.0"
updated: "2026-11-08"
---

# ENT-20 · Product

A product is **something sold or used on its own**: Reclee, ZapCV, OpenPEDD. One spec describes one
product, and everything that applies to the whole product lives in its foundations
([`ENT-02`](foundation.md)): who it is for, its pricing, its market, its entities, its cross-module
rules, its brand.

## The hierarchy

| Level | Is | Example (Reclee) | Its document |
|---|---|---|---|
| **Product** | What one spec describes | Reclee | `workspace.yaml` and the foundations |
| **Module** | A part of the product that stands on its own ([`ENT-21`](module.md)) | ATS · Talent pool · Career site · AI recruiter · Console | One or more PRDs |
| **PRD** | The product requirements document of a module, split by topic when over budget | *AI recruiter*, *AI recruiter changes* | — |
| **Requirement** | One verifiable statement ([`ENT-03`](requirement.md)) | Changing the AI recruiter's job post | A row of a PRD |
| **Acceptance Criterion** | One concrete case ([`ENT-04`](acceptance-criterion.md)) | Given / When / Then | A row of a PRD |

*Product* in "Product Requirements Document" names the **kind** of requirements (product, as opposed
to technical), not the scope: a PRD is written per module, and a product has many.

| Field | What it holds |
|---|---|
| `project` | Its name, in `workspace.yaml` ([`ENT-16`](workspace.md)) |
| `modules` | Its modules, each with a code |
| `references` | Other products' specs it builds on, read-only |

An account in OpenPEDD Cloud may hold several products; each has its own spec.
