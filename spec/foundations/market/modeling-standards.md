---
title: How the industry defines each model
description: MKT-13 · Entities, state machines, use cases and activities, as the ER model and UML define them, and what OpenPEDD takes from each. Surveyed 2026-11-23
owner: Kevin
version: "1.0"
updated: "2026-11-23"
---

# MKT-13 · How the industry defines each model

Surveyed on 2026-11-23, from search results quoting lecture notes, tool references (IBM, Microsoft,
Altova, Visual Paradigm) and the UML 2.4.1 superstructure; neither Chen's 1976 paper nor the UML 2.5
specification was opened. Where sources disagree it is said. What OpenPEDD takes from each is written
where it governs ([`RULE-28`](../rules/writing.md#rule-28)).

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
| `«include»` · `«extend»` | Include: a base always runs the included one. Extend: an optional behavior inserted into a base, the arrow pointing to the base | Visual Paradigm; uml-diagrams.org |
| Generalization | Between actors or use cases; *its semantics for use cases is not agreed* | Same |

## Activity diagram (UML)

| Element | The industry says | Source |
|---|---|---|
| Initial node | Where the flow starts; *one source says exactly one, IBM and Altova allow several* | IBM, *Control nodes*; Altova |
| Action | A unit of work, a rounded box | Edinburgh lecture notes |
| Decision · merge | A diamond: edges out decide, edges in merge without waiting | Microsoft, *Activity diagrams: reference* |
| Fork · join | A bar: one flow into several in parallel, and several back into one | Same |
| Partition | The UML 2 name for a swimlane: actions grouped by who is responsible | Altova |
| Final nodes | Activity final ends everything; flow final ends one path | Edinburgh lecture notes |
