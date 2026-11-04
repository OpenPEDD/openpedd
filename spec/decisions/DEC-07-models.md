---
title: "DEC-07 · Models are configurable"
description: Model profiles, overrides and the one fixed rule
owner: Kevin
version: "1.0"
updated: "2026-11-04"
---

# DEC-07 · Models are configurable

**Date:** 2026-11-04

Each team picks its models by its usage and its Claude Code plan. OpenPEDD ships profiles, and every
role and every stage can be overridden.

| Profile | `generator` | `judge` | `judge_confirm` | For |
|---|---|---|---|---|
| `max` | Opus | Sonnet | Opus | Plans with heavy usage |
| `balanced` (**default**) | Sonnet | Haiku | Opus | Most teams |
| `economy` | Sonnet | Haiku | Sonnet | Plans with light usage |

```yaml
models:
  profile: balanced
  overrides:
    architect: { generator: opus }
    verify:    { judge: sonnet }
```

And per command, for one run: `/build --model opus`.

**The one fixed rule:** a stage's judge is never the same session as its generator
([`RULE-12`](../foundations/rules/cycle.md#rule-12)). If both end up with the same model, the
framework warns, because part of the judge's value is lost.
