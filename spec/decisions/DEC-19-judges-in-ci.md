---
title: "DEC-19 · The judges are part of the method, free, and the Cloud does not run them"
description: Judges at every stage and on every PR run in the framework, on the team's own subscription or API key; the Cloud has no judges product
owner: Kevin
version: "1.1"
updated: "2026-11-19"
---

# DEC-19 · The judges are part of the method, free, and the Cloud does not run them

**Date:** 2026-11-13 · **Supersedes:** the "judges as a service" of [`DEC-02`](DEC-02-licenses.md)

Judging is how the method works, not a service on top of it. The judges of every stage, and on every
PR in the project's own CI, ship with the free framework: at a person's desk on their own
subscription, in CI on the team's own API key ([`ARCH-13`](../foundations/architecture/review.md#the-judges-in-ci)). Their metrics (the cycle metric, judge
precision, overrides) come from the trace, with `pedd status`. **OpenPEDD Cloud runs no judges.**
How the Cloud pays for itself is open (`openpedd-cloud:Q-10`).

| Option | Why not |
|---|---|
| Judges on every PR only in the Cloud | Crysk gives it free under Apache-2.0 ([`MKT-04`](../foundations/market/agent-tooling.md)), and anyone can wire `claude -p` into CI in an afternoon. A paid line a script crosses holds nobody |
| Hosted judges in the Cloud, with no token in the project | The Cloud would read customers' code, which it never does (`openpedd-cloud:DEC-04`); and it would pay the models for every customer |

**Why:** a judge that reviews the agent is what makes the method trustworthy (`P-05`); putting it
behind a payment makes the free method the untrustworthy one. It keeps the line of
[`BIZ-04`](../foundations/business/open-core.md): what runs where the team runs it is free; what
watches across systems is paid.
