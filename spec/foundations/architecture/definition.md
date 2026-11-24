---
title: Guided definition
description: ARCH-18 · The minimum each scope needs to be defined, who answers each item, and the conversation that fills it until it is complete
owner: Kevin
version: "1.4"
updated: "2026-11-24"
---

# ARCH-18 · Guided definition

A client says what they want in a conversation. The agent takes notes, asks only what is still
missing, **counts how complete the definition is** against the minimum its scope needs, and ends with
a summary the client confirms ([`DEC-20`](../../decisions/DEC-20-definition-chat.md)). It runs with
`/specify-interview`; what it leaves is what `specify` writes the PRD or the delta from.

## The minimum map

The map is **not a list of its own**: each item is something the spec already requires, here with
who answers it. **Client**: asked. **Proposed**: the agent proposes, the client confirms it in the
summary. **Team**: left for the sweep ([`ARCH-16`](sweep.md)), never asked of a client.

**A product**, before its first module. When it changes how an organization works, its `Business Map`
comes first ([map](../../modules/map/prd.md#business-mode)), and every item below it already answers is
dropped, citing it:

| Item | Answers | Required by |
|---|---|---|
| How the organization works today and will work with the system: the pieces every client answers, in order ([`DEC-30`](../../decisions/DEC-30-discovery-before-prds.md)) | A product engineer, from calls, documents and the industry's glossary | `Business Map`, when the product changes how an organization works |
| Goal, audience, the job the product is hired for, and what is left out | Client | `Business Context` ([`ENT-02`](../domain/foundation.md)) |
| How it is paid for | Client | `Business Context` |
| The north-star metric | Proposed, from the goal | `Business Context` |
| The modules, one line each | Client, read back as a list | [`ENT-21`](../domain/module.md) |
| The things it handles, and the states they go through | Client, in words; the agent names them | `Domain Model` |
| The roles, and what each one can do | Client | `Roles & Permissions` |
| Personal data: which, why, for how long | Client; how long is proposed | `Privacy`, if there is personal data |
| Outside services: payments, email, sign-in | Client names the need; the provider is proposed | `Integrations`, if there are any |
| The brand | Client: a link, files, or none yet | `Brand System`, if there are screens |
| Languages besides English | Client | `locales` ([`DEC-21`](../../decisions/DEC-21-i18n-from-day-one.md)) |
| `Architecture Rules`, `Security Policy`, `Quality Standards`, `Delivery Pipeline` | Team | `ENT-02` |

**A module**, one item per section of its PRD ([modules](../../modules/README.md)):

| Item | Answers |
|---|---|
| Frame: who, what starts it, how it ends | Client |
| Metric: the target | Client; the event that measures it is proposed |
| Appetite and `Out of scope` | Client |
| Main flow | Client |
| Alternate and exception flows | Proposed from the main flow; the client confirms |
| Who can do each action | Client |
| What each screen shows | Client; the copy is proposed |
| Acceptance criteria | Proposed from the flows, shown as examples; the client confirms |
| Test data | Client gives examples that look real |
| Variations: plans, flags | Client, if plans differ |
| Requirements in EARS, `NFR` numbers, contracts, states | Team |

**A request** fills the module items it touches, plus: the story (who, what, why), from the client;
**what has to exist first**, from each requirement's `depends_on` ([`ENT-03`](../domain/requirement.md)),
confirmed by the client; and how to tell it works, as examples that become its criteria.

**Conditions come first**: screens, personal data, payments. Each answer switches the items above on or
off.

## The conversation

1. **An open start**: *"tell me what you need, as you would tell a colleague"*, by text or voice. The agent reads it back in three lines.
2. **The scope**: a product, a module or a request, and its conditions.
3. **Computes the map**, and drops what is already answered: by the spec, citing the ID; by the code, citing the file ([`RULE-21`](../rules/cycle.md#rule-21)).
4. **Asks** as [`DEC-20`](../../decisions/DEC-20-definition-chat.md) says: two or three questions per turn, one topic, each with its options, a recommendation and why it matters, in the client's words ([`RULE-20`](../rules/cycle.md#rule-20)). What switches other items on or off goes first.
5. **Writes as it goes**, to `changes/<CHG>/definition.md` on the change branch cut for the request ([`ARCH-21`](requests.md)): each item with its state (answered, assumed, deferred, missing) and the client's own words. A restart resumes from it.
6. **Shows the count** every few turns: *9 of 14 · missing: payments, roles*.
7. **Ends** when nothing is missing, or when the client stops and is told what is. The summary keeps what the client said apart from what was assumed and what was deferred; the client confirms it.
8. **Hands over**: `/specify` writes the PRD or the delta from the notes, its judges run, and the Team items go to the sweep.

## The file [#the-file]

`changes/<CHG>/definition.md`, read and written by the reader ([`ARCH-20`](reader.md)). Its frontmatter:

| Field | Holds | Written when |
|---|---|---|
| `status` | `draft` · `confirmed` · `agreed` ([`DEC-27`](../../decisions/DEC-27-request-agreed.md)) | The branch is cut · the client confirms the summary · the builder takes it |
| `agreed` | `by`, the builder's name, and `at`, the date and time | The builder takes it |
| `prds` | The paths of the PRDs the client confirmed it touches | The client confirms, or an edit changes them |

The body holds each item of the map with its state and the client's words, then the summary. Once
`agreed`, it changes only through an edit branch ([`ARCH-21`](requests.md#edit-branch)).

## Free and Cloud

| | Runs |
|---|---|
| Framework | `/specify-interview` in the team's agent; the notes in the change |
| OpenPEDD Cloud | The same conversation as a chat for the client, with voice, and the map of each product with the state of every item (`openpedd-cloud`) |
