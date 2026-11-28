---
title: How interface copy is written and checked
description: MKT-22 · What the large content guides ask of buttons, links, errors and capitalization, the agent skills for UX writing, the linters for copy and messages, and the i18n rules strings must follow. Surveyed 2026-11-28
owner: Kevin
version: "1.0"
updated: "2026-11-28"
---

# MKT-22 · How interface copy is written and checked

Surveyed on 2026-11-28, from each guide's pages and each tool's repo and issues. **Not opened**:
Material 3's pages (they rendered empty), Atlassian's error-writing page (404) and Polaris's
actionable-language page (404 in its archive); what comes from them is marked *unverified*.

## The guides

| Guide | Buttons and links | Errors | Capitalization |
|---|---|---|---|
| **GOV.UK** | Link text front-loaded and specific; "select", never "click" | What went wrong and how to fix it; one message per kind (empty, too long, wrong format); reuse the label's words; an instruction for an empty field ("Enter your first name"); keep the input. Banned: "please", "sorry", "valid", "invalid", "oops", "you forgot", "An error occurred", "This field is required" | Sentence case, titles included |
| **Shopify Polaris** (archived; now on shopify.dev) | A strong verb first, no articles, no punctuation; never "click here"; at most one "Learn more" per screen | What is wrong and what to do, with exact numbers; no "invalid"; "we" only if the product caused it | Sentence case |
| **Atlassian** | — | Each error carries the steps to resolve it; empathy without over-apologizing | Sentence case for titles, headings, menus and buttons |
| **Microsoft** | Link text "brief but specific", never "click here" | — | Sentence case for headings, titles and labels |
| **Apple HIG** (2025-12-16) | Verbs on buttons and links; one set of flow verbs (Continue, Done); "tap" on touch | Next to the field, no "oops"; "Choose a password with at least 8 characters", not "too short" | One style per kind of element |
| **IBM Carbon** | A machine-readable glossary of verbs (Apache-2.0): **Delete** destroys, **Remove** takes out of a context, **Clear** empties, **Create** makes, **Add** puts something existing in a new place; "OK" only when no verb fits | — | Sentence case |
| **Vercel web-interface-guidelines** (MIT) | Numerals for counts; a non-breaking space between number and unit | Its example "Something went wrong—try again" goes against GOV.UK | **Title Case for headings and buttons** |
| **Mailchimp** | Links name the action or destination | — | — · CC BY-NC 4.0: no commercial reuse |

**NN/g**: errors visible next to their source, in human language, constructive, without blame, an
apology only for a total failure (2023); a button named for its action beats "OK" (2008);
placeholders vanish, read as prefilled data and are skipped by some screen readers (2014); "Learn
more" gives no scent and is ambiguous in a screen reader's list of links (2015). **Measured**: concise,
scannable and objective web prose was 124 % more usable than the original, 51 users (1997; prose, not
interface); replacing "Register" with "Continue" plus an optional account raised purchases 45 % (Spool,
2009; a change of flow, not only of label).

## Skills for UX writing

| Skill | Gives | License | Where it breaks |
|---|---|---|---|
| `content-designer/ux-writing-skill` | References, templates (error, empty state, onboarding), a voice chart | MIT | Its "research-backed" figures cite nothing ("8 words = 100 % comprehension"); company rules must be forked in (#44) |
| Anthropic `ux-copy` (knowledge-work-plugins) | A call to action starts with a verb; an error is what, why and fix; an empty state what, why and how to start | Apache-2.0 | Examples with fixed counts ("Delete 3 files?"), no plural guidance |
| `humbleteam/ux-writing` | A table of AI tells (preamble, promotional adjectives, Title Case labels, "Oops! Something went wrong", "Are you sure?"); missing facts become slots | MIT | Two of its rules never fired until fixed by hand (its changelog) |
| `claudianus/toss-ux-writing-skill` | A Korean skill with a regex linter | MIT | A rule matched inside another word (#1) |

## The linters

| Tool | Checks | License | Limit |
|---|---|---|---|
| **Vale** 3.29 | Prose rules in YAML: existence, substitution, capitalization, readability… | MIT | Reads locale JSON or YAML only through a View; ICU syntax is then read as prose |
| **eslint-plugin-formatjs** 8.4.1 | `no-count-without-plural`, `enforce-plural-rules`, `no-invalid-icu`, `enforce-description`, `no-literal-string-in-jsx` | MIT | Only messages declared through formatjs |
| **eslint-plugin-i18next** | Text written in JSX instead of a key | MIT | Does not judge the message |
| **alex** · **write-good** | Insensitive wording · passive voice and weasel words | MIT · MIT | Misfire out of context: "failed attempt" flagged (alex #346); "naive" by its own README |
| **messageformat** | Parses and compiles MF1 and MF2 messages | MIT | A parser, not a style check |

## The i18n rules strings follow

| Rule | Source |
|---|---|
| Plural categories zero, one, two, few, many, other; `other` is required; Welsh uses six, Russian four | Unicode CLDR |
| Never join fragments; one string with named placeholders; no inflected noun in a placeholder; a comment for the translator; at least 30 % more room | Mozilla l10n |
| Growth by length: up to 10 characters 200–300 %, 11–20 180–200 %, 31–50 140–160 %, over 70 130 % | W3C, from IBM |
| MessageFormat 2 stable since CLDR 47 (2025-03-13) | Unicode |
