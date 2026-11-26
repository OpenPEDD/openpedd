---
title: Measuring effort
description: MKT-19 · How tools count the hours a person worked, and how the industry sizes software by its functional pieces. Surveyed 2026-11-26
owner: Kevin
version: "1.0"
updated: "2026-11-26"
---

# MKT-19 · Measuring effort

Surveyed on 2026-11-26, from what each tool's documentation says. The pages were not fetched in this
survey; each row names the page to read again ([`RULE-22`](../rules/cycle.md#rule-22)).

## Counting hours

| Tool | Signal | Rule | Keeps the content | Source |
|---|---|---|---|---|
| **WakaTime** | A heartbeat from the editor on each edit or save | Heartbeats less than the *keystroke timeout* apart (15 minutes by default) are one span | File and project names, never the code | WakaTime docs, *FAQ: How are coding stats calculated?* |
| **git-hours** | Each commit's time | Commits under 2 hours apart are one span; 2 hours added before the first | No | `kimmobrunfeldt/git-hours`, README |
| **Toggl, Clockify** | A timer the person starts and stops | What the timer says | A description the person writes | Toggl Track and Clockify help |
| **Claude Code** | Hooks: `UserPromptSubmit` receives the session, the folder and the prompt; OpenTelemetry's `user_prompt` event | — | The hook gets the prompt and decides; telemetry redacts it unless `OTEL_LOG_USER_PROMPTS` is set | Claude Code docs, *Hooks reference* and *Monitoring* |
| **The studio's script** (`medir-tiempo-humano.cjs`) | The person's messages in Claude Code's transcripts | Under 15 minutes apart, one span; 2 minutes for the last | No: time, folder and session only | OpenPEDD Studio, 2026-11 |

## Sizing by pieces

| Method | Counts | Turns size into effort by | Source |
|---|---|---|---|
| **IFPUG function points** | Inputs, outputs, inquiries, internal and external files, each low, average or high | Hours per point, from the team's own history | IFPUG, *Function Point Counting Practices Manual* |
| **COSMIC** | Data movements: entry, exit, read, write | The same, per COSMIC function point | ISO/IEC 19761 |
| **Story points** | A team's relative guess per story | Velocity per sprint | Scrum and XP practice |

## What they agree on

| Pattern | Seen in |
|---|---|
| A span closes after a quiet gap, and the last signal gets a fixed tail | WakaTime, git-hours, the studio's script |
| What the person wrote is not kept to measure time | WakaTime, Claude Code telemetry, the studio's script |
| A size is turned into hours only from the team's own measured history | IFPUG, COSMIC, story points |
