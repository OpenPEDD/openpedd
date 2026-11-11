---
title: Feature flags
description: ARCH-09 · How a feature ships hidden, how a flag launches it, and how the Release Note goes out with it
owner: Kevin
version: "1.0"
updated: "2026-11-11"
---

# ARCH-09 · Feature flags

The code reaches production hidden, and **a flag decides at run time who sees it**, with no new
deploy. **It is optional**, and meant for large or risky changes: a release flag is short-lived debt,
and small changes launch without one.

## The API

Code asks through **OpenFeature**, the vendor-neutral standard
([`DEC-14`](../../decisions/DEC-14-openfeature.md)), whichever tool holds the flags:

```ts
const on = await client.getBooleanValue('automations', false, { workspaceId, plan });
```

| OpenFeature gives | It does not give |
|---|---|
| One way to ask, in the server and the browser | A place to store flags, or a panel |
| The context: user, account, plan | Targeting rules: those stay in the provider |
| Hooks, to record each evaluation | A way to **change** a flag |

So turning a flag on needs an adapter per provider, in `pedd launch` and in the Cloud.

## The flags table

The simplest provider, and the default for a project with its own database:

| Column | Holds |
|---|---|
| `key` | The change's slug: `automations` |
| `state` | `off` · `partial` · `on` |
| `audience` | Percentage, plans or accounts, for `partial` |
| `change` | Its `CHG` |
| `announce_at` | When the Release Note goes out; empty means at `on` |
| `announced_at` | When it went out. Set once, so it never goes out twice |
| `remove_by` | The date the flag must be gone |
| `updated_by` | Who changed it last |

## One change launches everything

Moving `state` to `on` is the launch: customers see the feature, and **the Release Note goes out at
the moment the row says**, with the help and the Walkthrough.

| The row says | Happens |
|---|---|
| `state: partial` | The feature reaches the audience. Nothing is announced |
| `state: on`, no `announce_at` | Everything publishes now |
| `state: on`, `announce_at` in the future | The feature is on; the note waits for that date |
| `state: off` after being announced | The feature hides, the note stays, and a person is alerted to decide what to say |

A row that sends something to customers is outward-facing
([`RULE-14`](../rules/cycle.md#rule-14)): only Launch or `pedd launch` write it, on a person's action.

## Through the cycle

| Stage | Does |
|---|---|
| `specify` | Says in `Variations` whether the change has a flag |
| `plan` | Creates it, `off`, and writes a task to remove it |
| `build` | Puts it at the **entry points**: route, menu, assistant tool, and **the contract** |
| Tests | Run with it off (the feature does not exist) and on, using OpenFeature's in-memory provider |
| `publish` | Launches on `on` |
| After launch | The removal task's date is `remove_by` |

Hiding a screen is not enough: without the check in the contract, the feature is reachable through
its URL or the API.

## Keeping them few

`pedd doctor` lists every flag past its `remove_by` and every flag in the code that is not in the
provider. A flag only ever on, or only ever off, for its whole window is reported for removal.
