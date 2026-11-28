---
title: Ideas
description: Loose ideas, without a decision
owner: Kevin
version: "1.2"
updated: "2026-11-28"
---

Loose ideas. None of this governs ([`ENT-19`](../foundations/domain/open-item.md)).

- Deciding the `Acceptance Report` from the tracker or the dashboard, without opening the repo.
- `measure` opening the candidate story on its own when the metric misses its target.
- **Blueprints**: specs of common products to start from (from pdd-kit).
- A viewer that reads every change to the spec as a sentence (from pdd-kit).
- **Agents' working memory** (from engram, [`MKT-04`](../foundations/market/agent-tooling.md)): lessons that are not spec (a command with a catch, a flaky test), searchable across sessions. It never governs: what governs goes to the spec.
- **A design-judge bench** ([`ARCH-04`](../foundations/architecture/agents.md#measuring-judges)): a fixed set of screens with known interface findings (a missing empty state, a token that fails contrast, a copied table), so a change to the judge or its model is measured before it ships.
- **`pedd design check`**: the sweep, `scan-styles` and the copy detector as one command and a CI step on every PR that touches a screen, so the closing checklist is rebuilt by the pipeline, not only by an agent.
- **A lint per stack**, installed by `pedd init` from `.pedd/stack.json`, that refuses raw values outside the token files ([`MKT-20`](../foundations/market/interface-design.md)).
- **Interface lens items from corrections**: once `design-judge` runs on real changes, a finding confirmed in two of them becomes an Interface lens item ([how the rules grow](../foundations/architecture/review.md#how-the-rules-grow)).
- **`verify` measures the page's speed** against the `Quality Standards` budgets (LCP, INP, CLS, bundle size) with Lighthouse CI or the Chrome DevTools MCP's traces and Lighthouse audit ([`MKT-21`](../foundations/market/agent-browsers.md)), on the real backend; `design` measures only the layout shift, since its mockup has none ([`MKT-20`](../foundations/market/interface-design.md)).
