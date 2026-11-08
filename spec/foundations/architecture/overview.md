---
title: Overview
description: ARCH-01 · The pieces of OpenPEDD and OpenPEDD Cloud, and how they connect
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

# ARCH-01 · Overview

```
                  ┌──────────────────────── OpenPEDD Cloud (paid) ────────────────────────┐
                  │ Sync engine · Freshness dashboard · Two-way tracker · Auto-PRs         │
                  │ Judges as a service · Hosted MCP · Multi-repo · SSO · Cycle metric     │
                  └──────▲──────────────▲──────────────▲──────────────▲──────────────▲─────┘
                         │ webhooks     │ API          │ API          │ GitHub App   │
                    spec repo       tracker       design tool     code repos    help/docs
                         │
 ┌──────────────────────────────────── OpenPEDD (open source) ──────────────────────────────────┐
 │ 1. Format      foundations/ · modules/ · decisions/ · open/ · changes/ · history/          │
 │ 2. Index       pedd index → .pedd/spec-graph.json (IDs, hashes, references, anchors)       │
 │ 3. CLI         init · check · index · status · impact · trace · change · archive · gen     │
 │ 4. Stages      skills and judges per agent: /specify /architect /design /plan /build …    │
 │ 5. MCP         search · get_doc · resolve_id · get_context_for · changes_since · …        │
 │ 6. Reader      static site, history folded, llms.txt                                       │
 │ 7. CI action   pedd check + pedd status on every PR                                        │
 │ 8. Adapters    public API for trackers, design tools, docs generators, analytics           │
 └──────────────────────────────────────────────────────────────────────────────────────────────┘
```

| Piece | Does | Detail |
|---|---|---|
| Format | The folders, frontmatter, IDs and blocks of a spec | [`ENT-01`](../domain/spec.md) |
| Index | Extracts every ID, computes its hash, records references and anchors | [`ARCH-02`](freshness.md) |
| CLI `pedd` | Everything that runs when asked | [`modules/workspace`](../../modules/workspace/prd.md) and each stage |
| Stages | Skills, agents and tools per stage, generated for each supported agent | [`ARCH-04`](agents.md) |
| MCP | How agents read and propose against the spec | [`ARCH-04`](agents.md#mcp-tools) |
| Reader | The site people read the spec in | — |
| Adapters | Connectors to external systems: Linear first | — |

The stack is an open question (`Q-11`); the proposal is TypeScript on Node, the same as the reader,
the MCP SDK and the npm distribution.
