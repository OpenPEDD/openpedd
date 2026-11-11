---
title: Release
description: ARCH-08 · Environments, the difference between deploying and launching, and what happens when production breaks or a feature retires
owner: Kevin
version: "1.0"
updated: "2026-11-11"
---

# ARCH-08 · Release

**Deploying is not launching** ([`DEC-15`](../../decisions/DEC-15-launch.md)). Deploying puts code in
an environment. Launching is the moment customers get the feature, and only then is it announced.

## Environments

A configurable list, in order, in `workspace.yaml`. One is marked `public`.

```yaml
environments:
  - { name: staging, branch: release }          # optional
  - { name: production, branch: main, public: true }
```

A project with no staging goes from the base straight to `main`. Each step between environments is
promoted on its own.

## The two moments of `publish`

| Moment | When | What |
|---|---|---|
| **Prepare** | At `acceptance-merge`, on the base | Applies the deltas to the spec; writes help, Walkthrough and Release Note with `status: prepared`, unlisted. Requirements move to `accepted` |
| **Launch** | On the `public` environment, with a successful deploy and, if there is a flag, the flag on for everyone | Publishes what was prepared; requirements move to `live`; the change is archived |

A launch is run by a person: `pedd launch` by hand, or the Cloud's Launch section. Launching several
changes separately needs a flag on each ([`ARCH-09`](flags.md)); without flags, what is on the base
launches together.

## The Release Note

| Links | To |
|---|---|
| Public | The article (*how it is used*), the Walkthrough, the requests it solves |
| Internal | The change, its PRs, its deploy |

## After launching

With the `observability` capability, each error event carries the flags evaluated, so an error can
be tied to a feature. During a **watch window** set in the `Delivery Pipeline`, a regression alerts
the person and proposes turning the flag off. It turns off on its own only if the project configured
it. A partial rollout stops growing.

## When production breaks

In this order, because each step costs more than the one before:

| # | Action | When |
|---|---|---|
| 1 | **Turn the flag off** | The feature has one: no deploy, seconds |
| 2 | **Roll back the deploy** | A known good deploy exists and no migration ran since |
| 3 | **Roll forward with a `hotfix`** | Anything else, and always after a migration |

The `hotfix` track:

1. Branches from the `public` environment's branch: `hotfix/{slug}`.
2. `build` writes the test that reproduces it, red, then fixes it.
3. `verify` on the bug's area. One person approves.
4. Merges into production, and **merges back into the base at once**, as a sub-issue that blocks closing it.
5. If the spec did not cover it, a `story` follows.

## Migrations

A migration cannot hide behind a flag. Each one **works with the previous version of the code and
the next** (expand, migrate, contract): adding comes first, removing ships in a later change.

## Retiring a feature

A retirement is a change with `REMOVED` deltas and a `DEC`; its requirements end `deprecated`.

| Goes | How |
|---|---|
| The announcement | A Release Note of type *removed*, with its date, before the flag goes off |
| The flag | Off on that date, then removed with the code, as a `chore` |
| The help | The article redirects to what replaces it |
| The Walkthrough | Deleted |
| The API | Marked deprecated first, removed in a breaking version |
| The data | Kept or deleted as the `Privacy` foundation says |
| The tests | Removed; their lines leave `tests.lock` by decision in `accept` |
