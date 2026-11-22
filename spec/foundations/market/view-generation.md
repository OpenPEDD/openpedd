---
title: Views generated from a model
description: MKT-12 · How tools draw architecture, decisions, entities, permissions and traceability from one source, and which check for loose items. Surveyed 2026-11-22
owner: Kevin
version: "1.0"
updated: "2026-11-22"
---

# MKT-12 · Views generated from a model

Surveyed on 2026-11-22. **No primary page could be opened from this session**: docs.structurizr.com,
likec4.dev and sphinx-needs.readthedocs.io were blocked by the network, and GitHub refused repos outside
this one. Every row comes from search results that quote the official docs and issues. **(unverified)**
marks what only a third party said. Swimm, Sourcegraph, Oso and ADR Manager returned too little to list.

| Tool | Views | Generated from | Loose-item checks | Output · layout | Free · paid | Where it breaks | Source |
|---|---|---|---|---|---|---|---|
| **Structurizr** | C4 levels 1–3, dynamic, deployment, ADRs | One DSL model; each view selects from it | "Inspections": missing descriptions, docs, views | JSON workspace; dagre | CLI and local free; server licensed; cloud closes 2026-09-30 **(unverified)** | Manual layout lost on rename; `workspace.json` conflicts in git (cli#162) | docs.structurizr.com |
| **LikeC4** | C4-like, dynamic | DSL; a view is a predicate computed into nodes and edges | — | Laid-out JSON; DOT, PNG | Open source | — | npm @likec4/core |
| **C4-PlantUML** | C4 levels 1–3 | Hand-written text | None | SVG; Graphviz | Open source | Layout hints conflict | github.com/plantuml-stdlib/C4-PlantUML |
| **IcePanel** | C4 with flows | A model edited by hand | — | Web | Free to 100 objects; paid from about $40/month **(unverified)** | Drifts from the code **(unverified)** | icepanel.io/pricing |
| **Mermaid** | flowchart, state, ER, requirement, C4 (experimental) | Text | None | SVG; ELK by default in v12 | Open source; GitHub renders it | Big graphs unreadable; split them | mermaid.js.org/config/layouts.html |
| **D2** | General, sequence, ER | Text | None | SVG; dagre, ELK, TALA | TALA open-sourced (MPL-2.0) | Vendor winding down **(unverified)** | d2lang.com |
| **Backstage** | Catalog graph: `ownedBy`, `dependsOn`, `partOf` | Catalog YAML; inverse relations computed | None built in | React graph, filtered by relation and depth | Open source; Portal paid | Decays without owners **(unverified)** | backstage.io/docs |
| **adr-tools** | ADR links: supersedes, amends | ADR markdown links | None | DOT | Open source | No status, nothing on what it affects | adr(1) |
| **log4brains** | ADR site, timeline | ADR markdown | None | Static site | Open source | No graph | github.com/thomvaill/log4brains |
| **Sphinx-needs** | needflow, needtable, `needs.json` | Typed items in the docs | Dead links; allowed statuses; custom warnings | PlantUML or Graphviz | Open source | Slow on big projects; scoped by root and depth | sphinx-needs docs |
| **StrictDoc** | Traceability matrix, deep trace | `.sdoc` and code links | Unique IDs; parent–child consistency | HTML | Open source | — | strictdoc.readthedocs.io |
| **Doorstop** | Item tree | YAML items | Missing links; **suspect links** when a parent's fingerprint changes | HTML | Open source | — | doorstop.readthedocs.io |
| **OpenFastTrace** | Trace report | Tags in specs and code | Uncovered, outdated, orphaned, duplicate, cycles; **non-zero exit** | Text, HTML | Open source | No diagram | github.com/itsallcode/openfasttrace |
| **Context Mapper** | Context map, class, state, use case, BPMN | One DSL model | DSL validators **(unverified)** | PlantUML | Open source | Editor plugins only | contextmapper.org |
| **SchemaSpy** | ER, orphan tables | The live database | Orphan tables **(unverified)** | HTML; Graphviz | LGPL | Nothing links it to modules | schemaspy.org |
| **prisma-erd-generator** | ER | Prisma schema, on each `generate` | None | Mermaid | Open source | Needs a headless browser | npm |
| **Supabase** | Schema visualizer; Security Advisor | The live database | RLS off on a public table; a policy with RLS off | Studio | Hosting paid; linter open | Checks RLS is on, not what each policy allows **(unverified)** | supabase.com/docs/guides/database/database-advisors |
| **OpenFGA** | Model graph | FGA DSL | None | Playground | Open source | Local only | github.com/openfga/model-visualizer |
| **Cerbos Hub** | Role × action matrix, diffs | Policies and their tests | The matrix shows gaps | Web | Hub paid; engine open | — | cerbos.dev/blog |
| **Stately / XState** | State machines | Code or a visual editor | None | Web | Old visualizer unmaintained; private projects paid | Abandoned visualizer | stately.ai/docs |
| **Gherkin living docs** | Features with results | `.feature` files and runs | None | HTML | SpecFlow ended 2024-12-31; LivingDoc never opened | Died with its vendor | reqnroll.net/news/2025/01 |
| **Archi / ArchiMate** | Viewpoints from one model | A model drawn by hand | None built in | Exchange XML | Open source | Manual layout | — |
| **EventCatalog** | Domain, service, message maps | Markdown, OpenAPI, AsyncAPI | — | Static site | Free under $10M revenue; Enterprise from $24,995/year | — | eventcatalog.dev/pricing |
| **Spec Kit · Kiro** | None built in; Kiro previews diagrams in `design.md` | Spec markdown | None | Mermaid **(unverified)** | Open · paid | Diagrams written by the agent, not generated | github.github.com/spec-kit · kiro.dev |
| **CodeSee** | Code maps | Code | None | Web | Shut down after its 2024 acquisition **(unverified)** | Gone | sdtimes.com |

## What it shows

| Finding | From |
|---|---|
| **One model, many views**: a view is a filter over the model, not a drawing | Structurizr, LikeC4, Context Mapper, Archi |
| A JSON step between the model and the picture lets several renderers share one reading | Structurizr, LikeC4, `needs.json` |
| A saved layout drifts, breaks on rename and conflicts in git: layout is computed on every render | Structurizr |
| ELK is replacing dagre and Graphviz as the default layout | Mermaid v12 |
| A big graph stays readable by scoping (a root, a depth, a relation) and splitting | Sphinx-needs, Backstage, Mermaid |
| Loose-item checks exist only in requirement tools, and the useful ones fail the build | OpenFastTrace, Doorstop |
| **No architecture tool checks for a decision with no effect or an entity nobody uses** | Structurizr, Backstage, Archi |
| A role × action matrix is sold as a paid feature; database tools check that RLS is on, not what it protects | Cerbos, Supabase |
| Generating and rendering are free; hosting, collaboration and history are paid. A closed generator dies with its vendor | Structurizr, Stately, LivingDoc, CodeSee |
| Mermaid is the only format GitHub renders, and its C4 is experimental | Mermaid |
| Nothing argued against C4 levels 1–2, entity state machines or traceability; **no tool shows changes in flight** | All |
