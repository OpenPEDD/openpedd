---
title: Trackers driven by git
description: MKT-05 · What a tracker moves on its own from pull requests, and how it marks duplicates. Surveyed 2026-11-17
owner: Kevin
version: "1.0"
updated: "2026-11-17"
---

# MKT-05 · Trackers driven by git

What [`ARCH-15`](../architecture/tracker.md) builds on, read in Linear's docs on 2026-11-17
(*GitLab* integration, *Issue status*, *Issue relations*, *Triage*, *Releases*). The GitHub
integration was not read; it is assumed to work the same until checked.

## Statuses moved by pull requests

| Fact | Source |
|---|---|
| An issue is linked to a PR by its ID in the PR title, in the branch name, or by a **magic word** in the PR description (`closes`, `fixes`, `resolves`, `completes`, `implements` and their forms) | Linear · GitLab integration |
| The team picks a status for each PR event: **drafted, opened, review requested, ready for merge, merged**. It is set per team, in *Settings → Team → Workflow* | Same |
| Rules can differ by the PR's **target branch** (merged to `staging` → one status, to `main` → another) | Same |
| A **non-closing word** (`ref`, `references`, `part of`, `contributes to`, `towards`, `updates`) moves the issue through every status except the one on merge | Same |
| `related to` links without moving the status | Same |
| One PR can name several issues; an issue closes only when all its closing PRs are merged or closed | Same |
| Linear suggests a *Merged* status on merge, and a release automation for *Done* once deployed | Linear · Releases (Business and Enterprise) |

## Duplicates

| Fact | Source |
|---|---|
| **Mark as duplicate** merges an issue into a canonical one: it moves to a reserved *Duplicate* status, shows a banner linking the original, and moves attachments and customer requests to it | Linear · Issue relations, Triage |
| The relation goes one way: from the duplicate to the canonical, not the reverse | Linear · Issue relations |
| Triage Intelligence suggests likely duplicates of new issues (Business and Enterprise) | Linear · Triage |

## What it leaves to the method

| Gap | Where OpenPEDD answers it |
|---|---|
| Which issue a stage's PR should name, and with which word | [`ARCH-15`](../architecture/tracker.md#what-moves-a-status) |
| A key to find "the same work" that is not its title | The anchor line, [`ARCH-15`](../architecture/tracker.md#created-once-by-one-hand) |
| Whether two open issues are one piece of work, against the spec and the roadmap | `/tracker-tidy`, [`ARCH-15`](../architecture/tracker.md#kept-clean) |
