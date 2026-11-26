---
title: Market
description: How market documents are written — outside facts that expire
owner: Kevin
version: "1.16"
updated: "2026-11-26"
---

**Market holds what we measured outside**: competitors, tools, market size, studies, prices others
charge, and **the prices of the providers the product runs on**, which `architect` costs its options with. **Business holds what we decided.** The difference matters because outside facts expire:
a market document carries the date it was surveyed and is reviewed when it goes stale.

| Document | ID | Holds |
|---|---|---|
| [The landscape](landscape.md) | `MKT-01` | The methods and tools around OpenPEDD, and where it stands |
| [How tools onboard a project](onboarding.md) | `MKT-02` | How others start on a new or existing project, and detect its stack |
| [Delivery and in-product help](delivery.md) | `MKT-03` | Guided help, flags, releases and testing tools |
| [Agent setups and AI review](agent-tooling.md) | `MKT-04` | Tools that configure coding agents and review their changes with AI |
| [Trackers driven by git](trackers.md) | `MKT-05` | What a tracker moves on its own from pull requests, and how it marks duplicates |
| [Component catalogs for agents](component-catalogs.md) | `MKT-06` | How a product's components reach agents, and what Reclee's first catalog found |
| [Asking and landing](asking-and-landing.md) | `MKT-07` | How tools ask the person, and how merge queues order and land parallel PRs |
| [Guided definition](guided-definition.md) | `MKT-08` | How tools ask a person what they want built, when they stop asking, and how they end |
| [Code maps for agents](code-maps.md) | `MKT-09` | How tools give an agent a map of the repo, and when they rebuild it |
| [Monorepos for a product and its sites](monorepos.md) | `MKT-10` | One repo with the app, its sites and a shared design system, each deployed apart |
| [Mapping a business](business-mapping.md) | `MKT-11` | How an organization is mapped as it is and as it will be, and who approves it |
| [Views generated from a model](view-generation.md) | `MKT-12` | How tools draw architecture, decisions, entities and permissions from one source, and which check for loose items |
| [Weighing and completeness](weighing.md) | `MKT-13` | How tools weigh what to ask and what an agent assumed, check nothing went unrecorded, and list their skills |
| [How the industry defines each model](modeling-standards.md) | `MKT-14` | Entities, state machines, use cases and activities, as the ER model and UML define them |
| [How the industry models a business](business-models.md) | `MKT-15` | Processes as-is and to-be, the organization chart and the business glossary |
| [How a business is analyzed](analysis-order.md) | `MKT-16` | The order and the levels of analyzing a business, and the kinds of business use case |
| [Domain labels per language](domain-labels.md) | `MKT-17` | How frameworks keep one name in code and show it in each language |
| [How the industry writes qualities and risks](quality-and-risk.md) | `MKT-18` | ISO/IEC 25010's product quality, and the risk register or RAID log |
| [Measuring effort](effort-measurement.md) | `MKT-19` | How tools count a person's hours, and how the industry sizes software by its functional pieces |

## How a market document is written

| Rule | Why |
|---|---|
| The `description` ends with `Surveyed <date>` | It is the fact that tells whether to trust it |
| Every figure names its source | An unsourced figure cannot be checked again |
| A reference read for an architecture decision records what it does, where it breaks (from its code and issues) and the date read | `architect` reads it once; the next feature does not read it again |
| A provider's price records the plan, the unit and the date | A cost computed from an undated price cannot be redone |
| It describes; it does not decide | A decision taken from it goes to Business, a module PRD or a `DEC`, citing the `MKT` |
| A change outside is recorded as a change | Here, unlike the rest of the spec, what changed outside is the content |
| Budget: 2,000 tokens | [`RULE-04`](../rules/writing.md#rule-04) |
