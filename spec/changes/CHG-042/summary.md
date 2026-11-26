---
title: "CHG-042 · Security audits: summary for Kevin"
description: One page — whether to add Cloudflare's security-audit skill, what the market does, and what changes in the Security lens and in adopt
owner: Kevin
version: "1.0"
updated: "2026-11-26"
---

# CHG-042 · Security audits

Stage: `specify`. Asked: whether Cloudflare's `security-audit` skill belongs in the framework. It audits a
whole repository with many agents; the Security lens of `verify` already reviews each change's diff
with a refuter. They are two jobs, not one done twice.

| What | Where |
|---|---|
| How Cloudflare, Anthropic, Trail of Bits, Semgrep, CodeQL, Socket, OpenAI and Google review code for security, and the OWASP standards they read; what could not be opened is marked *unverified* | [`MKT-19`](../../foundations/market/security-audit.md) |
| **A whole-repository audit is an extension, not the core**; Cloudflare's skill and Anthropic's `claude-security` are the first listed | [`DEC-35`](../../decisions/DEC-35-whole-repo-audit.md) |
| A security finding names who crosses which control to reach what; a fact outside the repository is a `Q` without severity; a missing best practice is not a finding. The lens reads ASVS 5.0, and OWASP's Top 10 for LLM Applications where the area calls a model | [`ARCH-14`](../../foundations/architecture/review-lenses.md#security-findings) |
| `verify` points to the lens for what Security reads, instead of saying it twice | [verify](../../modules/verify/prd.md#procedure) |
| `adopt` offers the audit once, before ordering the gaps; findings become `fix` changes and `Q`s | [workspace](../../modules/workspace/prd.md#adopting-a-running-product) |

Not done: no audit was run on any project, so nothing here is measured yet. The Cloudflare skill's
attack classes did not become lens items: an item comes only from a correction.
