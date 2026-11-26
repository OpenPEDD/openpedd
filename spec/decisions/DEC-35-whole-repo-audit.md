---
title: "DEC-35 · A whole-repository security audit is an extension; the Security lens keeps reviewing each change"
description: Where a security audit of a whole codebase lives, what OpenPEDD does with its findings, and what the Security lens takes from it
owner: Kevin
version: "1.0"
updated: "2026-11-26"
---

# DEC-35 · A whole-repository security audit is an extension; the Security lens keeps reviewing each change

**Date:** 2026-11-26

| What | Where it lives |
|---|---|
| **Reviewing each change**: the Security lens, on the area's diff, within its pack | The core ([`ARCH-14`](../foundations/architecture/review-lenses.md#security-findings)) |
| **Auditing a whole repository**: on `adopt`, before a launch, or when the team schedules it | An extension, on request ([`DEC-25`](DEC-25-where-skills-live.md)). Cloudflare's `security-audit` (MIT) and Anthropic's `claude-security` are the first listed ([`MKT-19`](../foundations/market/security-audit.md)) |
| **What its findings become** | Each confirmed one is a `fix` change, ordered by severity; each it could not validate is a `Q` with the missing fact; the audit fixes nothing ([`adopt`](../modules/workspace/prd.md#adopting-a-running-product)) |
| **What the lens takes from the audits** | A finding names the boundary it crosses and the result; a fact outside the repository is a `Q`, with no severity; it reads OWASP ASVS 5.0 and, where the area calls a model, OWASP's Top 10 for LLM Applications |

**Why:** a whole audit needs about 80,000 tokens of instructions, many agents, and a sandbox to run the
target. The lens has 20,000 tokens per area and reviews a diff. Both kinds of tool cut false
positives the same way, with an agent that tries to disprove each finding, and verify already has
one. What the core lacked is a strict definition of a finding.
