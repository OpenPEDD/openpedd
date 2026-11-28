# Screens: how each kind is laid out

Start from the product. **A screen like one the product already has copies that one's structure**:
the same header, the same filter bar, the same table. The patterns below apply only where the product
has none yet, and the `Brand System`'s patterns win over them.

## From a requirement to a layout

1. **The job.** Write one line: who arrives here, from where, and what they leave having done. That line ranks everything else.
2. **Rank what is on the screen.** List each element by how often the job needs it: first, second, rest. Only one thing is first. What the job rarely needs goes behind a click (a menu, a tab, a "More" section).
3. **Name the pieces.** Write the screen as the catalog pieces it is made of, before drawing (design PRD, step 5): "page header, filter bar, data table, empty state, pagination".
4. **Place by rank.** The first item goes where the eye lands: top left in left-to-right locales, or the center of a focused task. Primary actions sit next to what they act on; the page's primary action goes in its header.
5. **Then the states**: the inventory row of this screen ([states.md](states.md)).

A wireframe is that list in boxes: regions, their rank and their pieces, without styling. Build it in
code with the real pieces; the box drawing is only for talking it through.

## Navigation and information architecture

| Rule | Why |
|---|---|
| Entries are named with the `Glossary`'s words, the ones the person uses | A menu in the team's words is a menu nobody finds |
| At most two levels in the main navigation; a third lives inside the page, as tabs or a side list | Every level is one more place to get lost |
| The current place is always visible: the selected entry, and a breadcrumb past the second level | The person always knows where they are and how to go back |
| A new entry is confirmed with the person before building (design PRD, step 3) | Navigation is what gets rebuilt when decided late |
| Every screen has a URL; filters, tabs, sorting and the page go in it | A link can be shared, and Back works |

## The kinds

| Kind | Structure, top to bottom | Watch |
|---|---|---|
| **List or table of records** | Header: title, total count, primary action. Filter bar: search, filters as removable chips, saved views when there are any. Table: the first column identifies the record and opens it; status as a badge; numbers right-aligned with tabular figures; row actions at the end, behind a menu past two. Pagination at the foot | Paginated in the database, never cut in silence. Sort and filters in the URL. Bulk selection shows the count and its actions in a bar. Under the `Brand System`'s narrow width, the columns that matter most stay and the row becomes a card |
| **Detail of a record** | Identity header: name, status, the two or three actions on it. The key facts in a summary. Sections or tabs ordered by how often they are used. Activity or history last | Editing in place for a field, a page or a dialog for a group; one way across the product. "Not found" and "no access" are two different screens |
| **Form, create or edit** | One column. Sections with a heading when it passes about seven fields. Label above the field. Mark the minority: "optional" when most are required, or the reverse. The submit button at the end, named with the verb ("Create invoice") | Defaults that are right for most people. What the product already knows is not asked again (WCAG 3.3.7). Leaving with unsaved changes asks first |
| **Long or multi-step form** | Steps only when each can be finished alone; a step indicator with names, not only numbers; Back keeps every answer; progress saved | A review step before an irreversible submit. The error on step 3 does not send the person back to step 1 |
| **Settings** | Grouped by what they change, with a side list of sections when there are more than four. Each setting: label, one line on what it does, the control. The destructive ones last, set apart | **One way to save across the product**: each control saves alone and confirms, or each section has its button. Never both on one screen |
| **Dashboard** | It answers the three to five questions the role comes with, and nothing else. A row of key figures, each with its comparison and period. One main chart. Then the lists that need action | Each card loads and fails on its own. One time range for the whole page. A chart that answers no question goes. A new account has an empty dashboard that says what will appear and how to start |
| **Onboarding** | The shortest path to the first moment of value. A checklist with progress, skippable, that can be picked up later | Ask only what that first moment needs. Sample data when the empty product says nothing |
| **Profile and account** | Identity, then the editable details, then security and sessions, then the destructive actions | Sign-in steps follow WCAG 3.3.8: paste allowed, no puzzle |
| **Search** | The input, results as the person types (debounced), recent searches when empty | No results suggests a fix: the spelling, fewer filters |
| **Dialog** | A title that names the action, the body, then the actions: the primary one names the verb ("Delete invoice"), the other cancels | Prefer undo to confirming when the action can be undone. Confirm a destructive one with the object's name and what will be lost |
| **Landing or product page** (`apps/landing`) | One message per section. One primary action, repeated at the end. The proof next to the claim it proves | Its largest image loads first (LCP); the page keeps its layout while it loads |

## Consistency between related screens

| Check | How |
|---|---|
| The same thing looks the same | The same record's name, status, date and amount use one format and one piece on every screen that shows it |
| The same action sits in the same place | Create in the header; save at the end of the form; delete in the record's menu |
| The same pattern is the same piece | Two filter bars, two empty states or two tables built apart are a finding and one of them goes (closing pass 4) |

Before adding a pattern, look for the one the product uses. A new pattern needs a reason that the
existing one cannot hold, and enters the `Brand System` as a delta (RULE-33).
