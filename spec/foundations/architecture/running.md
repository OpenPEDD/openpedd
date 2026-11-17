---
title: Running agents
description: ARCH-12 · Where each stage's agents run, the quota guard, and keeping their context small
owner: Kevin
version: "1.2"
updated: "2026-11-17"
---

# ARCH-12 · Running agents

What agents run with is in [`ARCH-04`](agents.md); this is where they run and what they cost.

## Where agents run [#where-agents-run]

Each stage runs where `workspace.yaml` says ([`DEC-18`](../../decisions/DEC-18-runners.md)):

| Runner | Is | Default for |
|---|---|---|
| `local` | A session on the person's machine | `specify`, `architect`, `design`, `plan`: they run with the person, or prepare what the cloud uses |
| `cloud` | One session per task in the agent provider's cloud: a fresh VM, the repo from GitHub, the project's setup script | `build` and `verify` |
| `self-hosted` | The same sessions, routed to the project's own machine | When the cloud's resources fall short |

```yaml
runners:
  build: { runner: cloud, environment: reclee, parallel: 4 }
  verify: { runner: cloud, environment: reclee }
```

To launch a cloud task, `pedd`:

1. **Pushes the change branch**: a cloud session sees only what is on the code host.
2. **Checks the quota** (below).
3. **Launches one session per unblocked task**, up to `parallel`, and writes each session's link next to its task in the implementation sub-issue's checklist.
4. **Opens each PR from outside the session** when the agent pushes, because the session's access to the code host may not open PRs.

| Rule | Why |
|---|---|
| The environment's setup script installs and starts what the tests need (the database, the services), and holds **only test credentials** | Anyone who can use the environment can read its variables |
| A cloud session costs the same tokens as a local one | The model runs in the same place; what changes is only the machine running the tools |
| **The context decides the cost**, not the runner: it is kept small ([below](#keeping-the-context-small)) | Each call rereads the whole context; on Reclee's automations it was 275,000 tokens a call, and 95 % of the cost |
| **Small work is not delegated**: a task marked `small` (one area, no migration, no permissions, billing or personal data; marked by `plan`, or for a `fix` or `chore` by whoever opens it) runs `build` in one local session, with no cloud launch and no subagent. `verify` still runs in another session | Starting a session costs more than a small task: gentle-ai measured a 3-line task at 335 s and USD 0.34 delegated, 77 s and USD 0.11 inline ([`MKT-04`](../market/agent-tooling.md)). What is delegated is chosen by reason (parallel work, a separate judge, a context that would grow), not by size |

### The quota guard

Before a batch, `pedd` reads how much of the plan's window and week is used, and estimates the batch
from the measured cost of similar tasks in the trace ([`ENT-23`](../domain/trace-event.md#steps)). If it
does not fit, it launches fewer tasks or waits for the reset, and says so. **A batch is never started
that the quota cannot finish**: tasks stopped halfway cost a round to pick up.

## Keeping the context small [#keeping-the-context-small]

Every model call rereads the whole context, so what an agent reads, it pays for on every later call.
On Reclee's automations each call reread about 275,000 tokens, and that was 95 % of the cost. The pack
is where a task starts; these keep it from growing:

| Practice | How | Why |
|---|---|---|
| **One session, one task** of the plan, never a batch | `pedd` launches one session per task | A batch carries every earlier task's reading into the next |
| **Tests report only what fails** | A project script for agents (`test:agent`) writes the full report to a file and prints the counts and the failures, cut to a maximum length. The agent opens the file only if it needs more | Thousands of passing tests say nothing, and are reread on every call |
| **Logs, cut to their end** | Long command output goes to a file; the agent sees the last lines | The same |
| **The pack points at the code**: the files the task touches, and the relevant line ranges | `plan` writes them in the pack | An agent that knows where to go does not explore |
| **What is never opened is denied**: old migrations, generated code, lockfiles, build output | Permission rules in the agent's settings | Reading it costs and teaches nothing |
| **A long file is read by parts** | A hook before each read: over **400 lines** with no range asked for, the read is refused with *"search first, then read the fragment"* | The tool keeps the rule, not the prompt ([`RULE-24`](../rules/cycle.md#rule-24)) |

`pedd install` installs the permission rules and the hook. A task whose context passes
**100,000 tokens** is marked in the trace as badly cut: the fix is in `plan`, not in a longer
session.
