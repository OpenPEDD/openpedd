---
title: Industries
description: The glossaries of each industry, researched once and reused by every project in it
owner: Kevin
version: "1.1"
updated: "2026-11-26"
---

# Industries

**An industry glossary is researched once and reused by every project in that industry**
([`DEC-30`](../spec/decisions/DEC-30-discovery-before-prds.md)). Before mapping a client, the product
engineer looks here; if the industry is missing, researches it on the web first and adds it here, each
term with its source. A project's `Glossary` then links each term it uses as the industry means it, and
writes its own meaning only where the client differs.

| Industry | Folder | Language |
|---|---|---|
| Property and casualty insurance, Argentina, for buildings under horizontal property | [`property-insurance-ar/`](property-insurance-ar/glossary.md) | Spanish (Río de la Plata) |
| Wholesale fruit and vegetables, Uruguay, local and imported | [`fresh-produce-uy/`](fresh-produce-uy/glossary.md) | Spanish (Río de la Plata) |

## How an industry glossary is written

| Rule | Why |
|---|---|
| One folder per industry and country, named in English: `property-insurance-ar/` | Law and words change by country |
| Written in the industry's own language | It is read by the client and quoted on screen |
| A table per group: `Término` · `También` · `Es` · `Fuente` | A project links the group, and the term is found by name |
| Every term has a source: a law, a regulator, an insurer's documents; what only a secondary source says is marked **(sin verificar)** | It is quoted to clients as the industry's meaning |
| A term only one client uses goes in that client's `Glossary`, not here | Here is what holds for every project |
| Budget: 4,000 tokens per file | [`RULE-04`](../spec/foundations/rules/writing.md#rule-04) |

A project links a term as
`[industria](https://github.com/openpedd/openpedd/blob/main/industries/<industry>/glossary.md#<group>)`
in its `Defined in`; the `glossary` view takes it as defined (`FR-VEW-24`).
