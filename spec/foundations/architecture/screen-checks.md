---
title: Measuring screens
description: ARCH-25 · How every screen is opened in every state, role, width and theme, measured, compared with the base, and reported as the closing checklist
owner: Kevin
version: "1.0"
updated: "2026-11-28"
---

# ARCH-25 · Measuring screens

A screen is checked by **measuring it, not by looking at one screenshot of its ideal state**: every
state it can reach ([`RULE-32`](../rules/interface.md#rule-32)), at every width and theme, with the
keyboard, with its writes failing, and against how it looked before. `design` measures in its closing
passes, `design-judge` measures again, and `/design-audit` measures what exists
([design](../../modules/design/prd.md), [`DEC-36`](../../decisions/DEC-36-interface-quality.md)).

## The development menu and its URL [#the-url-contract]

In development only, the app opens every state of the inventory from a menu, and from its URL:

| Parameter | Does |
|---|---|
| `pedd-state=<state>` | The seam returns that state |
| `pedd-role=<role>` | Signs in as that role's test user |
| `pedd-theme=light\|dark` | Forces the theme |
| `pedd-delay=<ms>` | Every read waits that long |
| `pedd-fail-writes=1` | Every write fails |

Once the state is on screen, the page sets `<html data-pedd-state="<state>">`. **A state the page does
not confirm is reported as not confirmed**: the screen may be showing another one.

## The sweep [#the-sweep]

The app keeps one plan, `design-sweep.json`, with **every screen of the product**: its route, its
states, the roles that reach it, and one action per inline state and per write (click, hover, fill,
press, wait) with what each must show. Each change adds its screens. The sweep, a script of the
`/design` skill on Playwright, opens each screen of the plan in each state, role, width and theme:

| At each | Measures |
|---|---|
| Load | A screenshot; overflow, clipping, targets under 24 px, unnamed controls, unlabelled fields, contrast and headings, in the rendered page; axe at WCAG 2.2 AA; console errors |
| Slow load, per width | Every element that moves when the data arrives: a skeleton that does not match |
| Keyboard walk | What Tab cannot reach, focus hidden under something or with no indicator, traps, focus that jumps back up |
| Action | Whether its steps ran and what it must show appeared, with a screenshot |

## Against the base [#against-the-base]

After the refactor, every screen of the plan is captured on the base and on the change, on the same
machine, and compared pixel by pixel. **A screen outside the change that changed is meant, by a delta
that says so (a token, a shared piece), or it is a regression.** Two screenshots are compared only
when the same system and browser took both: fonts render differently on each.

## The closing checklist [#the-closing-checklist]

What the closing passes deliver: one row per screen of the inventory, one column per check (states
confirmed, values outside the system, copied code, layout shift, inline states, widths, axe, keyboard,
writes, copy, against the base), **each cell with the number the tool printed, or *not run* and why**
([`RULE-22`](../rules/cycle.md#rule-22)). The agent does not tick its own list; the judge runs every cell
again ([`RULE-24`](../rules/cycle.md#rule-24)). The screenshots are read too: a number says what broke;
only the picture says whether the screen reads right.

## The tools

| Tool | Reads | Source |
|---|---|---|
| `scan-styles` | The code: values outside the tokens, inline styles, class sets repeated across files, the values in use | The `/design` skill |
| `scan-copy` | The base locale's messages: generic actions, errors with no way out, plurals with no rule, joined strings, retired names | The `/design` skill |
| `page-check` | The rendered page, at one state and width | The `/design` skill |
| The sweep | Every screen of the plan, as above | The `/design` skill, on Playwright |
| `jscpd` | Blocks of code copied across files | [`MKT-20`](../market/interface-design.md) |
| Playwright, its library and its CLI | The browser: the sweep drives the library; an agent looks and acts by hand with the CLI | [`MKT-21`](../market/agent-browsers.md) |
