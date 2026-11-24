---
title: How the industry defines each model
description: MKT-14 · Entities, state machines, use cases and activities, as the ER model and UML define them, and what OpenPEDD takes from each. Surveyed 2026-11-23
owner: Kevin
version: "1.2"
updated: "2026-11-24"
---

# MKT-14 · How the industry defines each model

Surveyed on 2026-11-23, from search results quoting lecture notes, tool references (IBM, Microsoft,
Altova, Visual Paradigm) and the UML 2.4.1 superstructure; neither Chen's 1976 paper nor the UML 2.5
specification was opened. Where sources disagree it is said. What OpenPEDD takes from each is written
where it governs ([`RULE-29`](../rules/writing.md#rule-29)).

## Entity (ER model)

| Element | The industry says | Source |
|---|---|---|
| Entity | An object, person, event or concept of the real world, physical or abstract, about which the system keeps data, and that is told apart from others like it | Lecture notes on the ER model (Harper College, KSU) |
| Key | Each instance is unique and identified, usually by a primary key | Same |
| Attributes | Its own properties, which describe it | Same |
| Relationship and cardinality | It is linked to other entities, one-to-one, one-to-many or many-to-many, with a minimum and a maximum per side | Red Gate, *Chen notation* |
| Strong · weak | Strong: identified by its own attributes. Weak: cannot be, depends on an owner to exist, and is identified by the owner's key plus its own; its link to the owner is many-to-one | Same; Harper College |
| Associative | An entity that resolves a many-to-many relationship that has attributes of its own. *The term is used inconsistently across sources* | Same |

## State machine (UML)

| Element | The industry says | Source |
|---|---|---|
| State | A condition the object is in | IBM, *States, regions and transitions* |
| Transition | From one state to another, labelled `trigger [guard] / effect`, all three optional; with no trigger it is a completion transition | IBM; Altova |
| Initial pseudostate | A solid dot, not a state; its one transition leads to the first state and has no trigger or guard | IBM, *Pseudostates* |
| Final state | Ends the region or the machine | Altova |

## Use case diagram (UML)

| Element | The industry says | Source |
|---|---|---|
| Actor | A coherent set of roles that users play when they interact with use cases; drawn outside the boundary | Visual Paradigm, quoting UML 2.4.1 |
| Use case | Something the system does that yields a result for an actor | Microsoft, *Use case diagrams: reference* |
| System boundary | The rectangle of the system or subsystem holding its use cases | Same |
| Association | Actor to use case | Same |
| `«include»` | Behavior common to several use cases, factored out; **the base always runs it**, at a point of its flow, and it does not stand alone: *Withdraw cash* includes *Authenticate*. Arrow from the base to the included | Warwick UML notes; Visual Paradigm |
| `«extend»` | Optional or conditional behavior inserted into a base at one of its extension points; the base runs without it. Arrow from the extending to the base. *UML is inconsistent on whether the condition is part of the model or of each run* | O'Reilly, *Use case patterns*, ch. 9; Martin Fowler, *Include and extend* |
| Generalization | Between actors or use cases; *its semantics for use cases is not agreed* | Same |

## Activity diagram (UML)

| Element | The industry says | Source |
|---|---|---|
| Initial node | Where the flow starts. **UML allows several**, each starting a flow; teaching notes and tool guides require exactly one. **OpenPEDD takes one**: a process or flow starts in one place | uml-diagrams.org, *Activity controls*; Pretoria lecture notes; Visual Paradigm |
| Action | A unit of work, a rounded box | Edinburgh lecture notes |
| Decision · merge | A diamond: edges out decide, edges in merge without waiting | Microsoft, *Activity diagrams: reference* |
| Fork · join | A bar: one flow into several in parallel, and several back into one | Same |
| Partition | The UML 2 name for a swimlane: actions grouped by who is responsible | Altova |
| Final nodes | Zero or more. Activity final ends every flow, the first reached wins; flow final ends one path only. **OpenPEDD draws one activity final per way the activity ends** | uml-diagrams.org; Agile Modeling; Edinburgh lecture notes |
| Object node · object flow | An object node is an entity **in a particular state**, `Name [state]`; an object flow shows an action creating or using it | RUP, *Activity diagram in the business use-case model* **(unverified)** |

**In business modeling** (RUP, read 2026-11-24 from secondary sources, **(unverified)**): a business use case's
realization is drawn first as an activity diagram whose **partitions are the business workers** taking
part, one per responsibility, their order meaningless; **object flows** show how business entities are
created and used. A large workflow gets **one overview diagram without partitions**, its parts as macro
activities, and **one detailed diagram with partitions per macro activity**, each on one page. A class
diagram of workers and entities and sequence diagrams of the interactions are its companions. Sources:
swi.cs.vsb.cz/RUPLarge/extend.bus_model/guidances/guidelines/activity_diagram_in_the_business_use-case_model_5862EB50.html;
cin.ufpe.br/~if682/RUP/process/modguide/md_bactdbom.htm; cin.ufpe.br/~if682/RUP/process/artifact/ar_bucr.htm;
sceweb.uhcl.edu/helm/ROLE-Tester/myfiles/IBMRUP/process/workguid/wg_bomws.htm. **OpenPEDD draws** a process
as the detailed diagram (partitions = roles, object nodes from `Object`) and a business use case as the
overview, its processes as macro activities ([views](../../modules/views/business.md)).
