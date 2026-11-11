---
title: "DEC-15 · Deploying is not launching, and the Release Note goes out at launch"
description: When something is announced
owner: Kevin
version: "1.0"
updated: "2026-11-11"
---

# DEC-15 · Deploying is not launching, and the Release Note goes out at launch

**Date:** 2026-11-11

`publish` prepares at `acceptance-merge` and publishes at launch: on the `public` environment, with a
successful deploy and, if there is a flag, the flag on for everyone. Free projects launch by hand with
`pedd launch`; the Cloud has a Launch section. The detail is in
[`ARCH-08`](../foundations/architecture/release.md).

**Why:** a note published before the feature reaches anyone announces something nobody has. The base
can hold accepted work for days.
