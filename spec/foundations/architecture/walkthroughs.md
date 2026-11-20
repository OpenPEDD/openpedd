---
title: Walkthroughs
description: ARCH-07 · How a product's assistant answers, points, takes the user there or acts, and why a Walkthrough cannot go stale unnoticed
owner: Kevin
version: "1.1"
updated: "2026-11-20"
---

# ARCH-07 · Walkthroughs

A Walkthrough shows **how to do one thing, on the real screen, on request**: the product's assistant
takes the user to a screen and points at where something is. **It is optional**: it exists only if
the product has an assistant and declares it in `workspace.yaml`.

| Name | Is | Started by |
|---|---|---|
| **Onboarding** | The path of the first visit | The product |
| **Walkthrough** | How to do one concrete thing | The person, from the chat |

[`DEC-16`](../../decisions/DEC-16-walkthrough.md) says why it is not called a tour.

## The four levels of help

The assistant uses the lowest level that solves what was asked.

| Level | Does | Uses |
|---|---|---|
| **Answer** | Explains | The Help Center |
| **Point** | Highlights an element on the current screen | A Walkthrough |
| **Take there** | Opens the screen, then points | A Walkthrough |
| **Act** | Does it for the person | The product's contracts, with their permissions |

A Walkthrough stops at *Take there*: it never clicks or writes. Acting goes through a contract, where
the permissions already are.

## The file

```yaml
# apps/help/walkthroughs/create-job.yaml
sources: [FR-JOB-03@3fa9c1]
article: apps/help/create-job.mdx
roles: [owner, recruiter]
steps:
  - screen: /jobs/new
    target: job-title        # data-guide="job-title" in the component
    say: walkthrough.create-job.title   # a copy key, one text per locale
```

## One name through the whole chain

The target is **one stable attribute**, the same one end-to-end tests locate by. In Playwright,
`testIdAttribute: 'data-guide'` makes `getByTestId` read it; any runner that locates by attribute
works the same. Only what a Walkthrough points at needs it: everything else is located by role.

| Stage | With `job-title` |
|---|---|
| `design` | Marks the component |
| `plan` | The acceptance test locates by it |
| `build` | Keeps it |
| `verify` | Drafts the Walkthrough from the green tests' steps, and walks it in the browser |
| `accept` | The person tries it with the feature |
| `publish` | Publishes it at launch |
| Production | The assistant highlights `[data-guide="job-title"]` |

An attribute is used instead of a role because a role's accessible name changes with the language.

## Staying fresh

| What can go wrong | Caught by |
|---|---|
| The requirement changes | Its anchor goes `stale`, like an article ([`ARCH-02`](freshness.md)) |
| A screen or target is removed | A `Delivery Pipeline` check fails: every `screen` and `target` must exist in the code |
| The flow changes | The test that produced it fails first |
| Another role or plan does not see the element | At run time the step is skipped, the article is offered, and the miss is recorded |

Other tools find this out afterwards, when the guide fails for a user. Here the first three are
caught before production.

## Rules

| Rule | Why |
|---|---|
| The highlight is the product's own, from the `Brand System`, and stays until the person acts or moves on | It looks like the product, and pointing needs the time a person takes |
| A step a role cannot perform is not shown | A Walkthrough does not teach what the person cannot do |
| The text comes from the glossary, one per locale | Like any screen |
| A new Walkthrough is reviewed by a person the first time | Like an article ([`DEC-05`](../../decisions/DEC-05-help-review.md)) |
