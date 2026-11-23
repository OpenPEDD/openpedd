---
title: How the industry models a business
description: MKT-14 · Processes as-is and to-be, the organization chart and the business glossary, as BPMN, process mapping and data governance define them. Surveyed 2026-11-23
owner: Kevin
version: "1.0"
updated: "2026-11-23"
---

# MKT-14 · How the industry models a business

Surveyed on 2026-11-23, from search results quoting Camunda's BPMN reference, process-mapping guides
(Signavio, Lucidchart, Miro, Asana), business-education texts and data-governance vendors. No standard
was opened in full: the BPMN 2.0 specification, the DAMA-DMBOK and Evans's book were read only through
those quotes. How a map is drawn with a client is [`MKT-11`](business-mapping.md); what OpenPEDD takes
is written where it governs ([`RULE-28`](../rules/writing.md#rule-28)).

## Process (BPMN 2.0)

| Element | The industry says | Source |
|---|---|---|
| Pool | A participant: an organization, a role or a system; two pools talk by message flows | Camunda, *BPMN 2.0 symbol reference* |
| Lane | A subdivision of a pool: who is responsible for each task | Same |
| Task | A unit of work | Same |
| Event | Something that happens: start, intermediate, end; a circle | Same |
| Gateway | Exclusive: one way out of several, or their merge; parallel: every way at once | Same |

## As-is, to-be and the gap

| Step | The industry says | Source |
|---|---|---|
| Scope | Bound the process first; a SIPOC (suppliers, inputs, process, outputs, customers) can frame it | Signavio; Asana, *SIPOC diagram* |
| As-is | Drawn first, from the people who run it, and validated with them | Lucidchart, *As-is process analysis*; Simpliaxis |
| To-be | The process as it will be | Miro, *As-is and to-be mapping* |
| Gap analysis | The difference between the two; each gap becomes a requirement or an action | University of Leeds, *Gap analysis*; Simpliaxis |

*No source gives one canonical sequence; the order above is the one they share.*

## Organization chart

| Element | The industry says | Source |
|---|---|---|
| Box | A position, with its title and, in a company's chart, who holds it | Lumen Learning, *The organization chart and reporting structure* |
| Reporting line | Who reports to whom | Same |
| Span of control | How many report directly to one manager | Same |
| Shapes | Hierarchical, flat, functional, divisional, matrix (two managers at once) | Atlassian, *9 common org charts* |

## Business glossary

| Element | The industry says | Source |
|---|---|---|
| Term · definition | Agreed definitions of business terms, related to the data; for business people, unlike a data dictionary | Collibra; DAMA-DMBOK as quoted by vendors |
| Synonyms · acronyms · related terms | Other names the term is known by | Microsoft Purview, *Business glossary* |
| Owner · status | Who stewards it, whether it is approved | Collibra; Actian |
| Ubiquitous language | One language, structured around the domain model, used by everyone and in every artifact: screens, code, documents; it holds within one bounded context | The Open Group quoting Evans; Martin Fowler, *Bounded context* |
