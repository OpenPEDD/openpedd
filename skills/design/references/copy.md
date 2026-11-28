# Copy: the words on the screen

**`Voice & Tone` says how the product sounds; the `Glossary` says what each thing is called. This
file says how each piece of interface text is written.** Read the two first: a word on screen that is
not in the `Glossary` is a delta to it (design PRD), and a tone the product does not use is a finding.
Copy is written in the base locale, English (DEC-21), as keys, never in code.

## Before writing a word

1. **Name things with the `Glossary`'s words**, the ones the person uses. One thing, one word, on every screen: "invoice" everywhere, never "bill" on one screen and "invoice" on the next.
2. **Write the job, then cut.** The first draft says what the person needs to know or do; the second removes every word that does not change what they do.
3. **Front-load.** The word that decides goes first: people scan the first two words of a line.

## Each piece

| Piece | Write it so that | Not |
|---|---|---|
| **Button** | A verb, and the object when it is not obvious: "Create invoice", "Send invoices". It says what happens, matches the title of what it opens, and has no articles or end punctuation. A count goes through a plural rule (below), never a fixed number | "OK" (only where no verb fits), "Submit", "Yes", "Click here" |
| **Link** | Its text alone says where it goes: "See the tax rates". It makes sense read out of context, as a screen reader lists links | "Click here", "Learn more" alone, a bare URL |
| **Label** | A short noun, above its field: "Due date". No colon, no question unless the form is a conversation | The placeholder as the only label |
| **Helper text** | Under the label, only what prevents an error: the format, a limit, why it is asked. Visible before typing | Instructions that vanish when typing starts |
| **Placeholder** | An example of the format at most ("31/12/2026"), never needed to fill the field | A label, or a hint the person needs while typing |
| **Error on a field** | Next to the field, reusing the label's words. Empty: an instruction, "Enter a due date". Wrong: what is expected, "Enter an amount greater than 0". One message per kind of error (empty, too long, wrong format) | "Invalid amount", "This field is required", "please", "sorry", "oops", blame ("You forgot…") |
| **Error on a page or an action** | What failed, that the person's input is kept, and what to do: "The invoice wasn't sent. Your changes are saved. Try again in a few minutes". "We" only when the product caused it | "Something went wrong", "Error 500", an exclamation mark |
| **Outage** | What does not work, since when if known, what still works, and when to come back. An apology belongs here, and only here | A technical cause, a stack trace |
| **Empty state** | What will appear here and the one action that fills it: "No invoices yet. Create one to bill a client." With no results: what was searched and how to widen it | "No data", "Nothing here" |
| **Confirmation dialog** | The title asks the action with its object: "Delete invoice INV-204?". The body says what is lost and whether it can be undone. The buttons repeat the verb: "Delete invoice" and "Cancel" | "Are you sure?", "OK / Cancel" |
| **Success** | What happened, briefly, with a link to it when it lives elsewhere: "Invoice sent to Acme. View invoice". Past tense | "Success!", or a message for something the person can see happened |
| **Loading and progress** | What is happening, when it takes more than a moment: "Importing 1,240 rows…". The ellipsis character, the same everywhere | "Please wait" for ten seconds |
| **Disabled and no permission** | Why, and what enables it: "Only admins can delete invoices. Ask an admin." | A greyed control with no reason |
| **Title and heading** | What this screen or section is for, in a few words; the page title names the screen | A slogan on a working screen |
| **Tooltip** | Extra detail for something already labelled; nothing the person needs to complete the task | The only place an essential instruction lives |
| **Notification or email** | Who did what to which thing, and the action it asks for, in the first line | A first line that says only "Update" |

## The verbs

One verb, one meaning, on every screen (from Carbon's glossary):

| Verb | Means | So |
|---|---|---|
| **Create** | Makes something that did not exist | "Create invoice" |
| **Add** | Puts something that exists into a new place | "Add client to project" |
| **Delete** | Destroys it; it cannot be found again | Confirm it, with what is lost |
| **Remove** | Takes it out of a place; it still exists elsewhere | "Remove from project", no warning about loss |
| **Clear** | Empties fields or filters | "Clear filters" |
| **Cancel** | Stops a process and discards what it would do | Never next to a "Close" that does the same |
| **Edit** · **Save** | Opens for changing · keeps the change | A form that saves alone needs no "Save" |

A "Delete" that only removes from a list scares; a "Remove" that destroys loses data.

## Rules that hold everywhere

| Rule | Why |
|---|---|
| **One capitalization per kind of element**, chosen once in `Voice & Tone`. The default is **sentence case** for every label, button, title and menu item, as GOV.UK, Microsoft, Atlassian and Carbon use; a product that chose Title Case for buttons keeps it everywhere | The guides disagree; a product that mixes both reads as two products |
| "Select" for choosing; "tap" on touch-only screens; "click" nowhere | The person may not be using a mouse |
| Plain words: "use" not "utilize", "start" not "initiate". The words of the person's trade are plain to them; the system's are not ("payload", "null", "request", "invalid") | People read the screen in a hurry |
| Speak to the person as "you"; the product as "we" only when it is a person speaking, such as an apology | One voice |
| Positive and specific: say what to do, not what not to do | "Use 8 or more characters", not "Password too short" |
| Numbers as digits, with the locale's format: `Intl`. Dates and amounts the same way on every screen | — |
| No exclamation marks in errors; few anywhere | An error is not exciting |
| Inclusive and neutral: no idioms, no gendered default, no "simply" or "just" | They do not translate, and they make a hard step feel like the person's fault |

## Copy that survives translation

The base is English and every other language is a file (DEC-21). Write the English so that it can be
translated without changing code:

| Rule | Why |
|---|---|
| **One whole message per key**, with its variables inside: `"Sent to {client}"`. Never join pieces in code | Word order changes by language; a joined sentence cannot be translated |
| **Plurals and choices with ICU MessageFormat**: `{count, plural, one {# invoice} other {# invoices}}`, `{role, select, admin {…} other {…}}` | Languages have up to six plural forms; "(s)" and `{count} invoices` break in all of them |
| Room to grow: **the shorter the string, the more it grows**. Up to 10 characters (a button) can double or triple; past 70, about 30 % (W3C, from IBM). No fixed width on anything with copy | The pseudo-locale pass shows where (closing pass 1) |
| No noun inside a variable when the language inflects it: "Delete {name}" with a name is fine, "Delete the {thing}" with a translated noun is not | The article and the noun change together in many languages |
| No text in images, and no meaning carried only by word play | It cannot be translated |
| A note for the translator on any key whose meaning is not obvious from its text ("Post" as a verb or a noun) | One English word can be two in another language |

## Measure it

[scripts/scan-copy.mjs](../scripts/scan-copy.mjs) reads the base locale's messages and lists
candidates: generic actions and links, errors that say only that something failed or give no next
step, system words, blame, a number before a plural with no plural rule, a fixed number in a message,
joined strings, the minority capitalization, mixed ellipses, and names the `Glossary` no longer uses.
Where the stack uses formatjs, its ESLint rules (`no-count-without-plural`, `enforce-plural-rules`,
`no-invalid-icu`) check the messages as they are written. Each hit is read in context:
"Submit" may be right on the one form whose action is submitting.

```
node <design skill>/scripts/scan-copy.mjs packages/i18n --glossary spec/foundations/glossary.md
```

Then read the copy **on the screen**, in the sweep's screenshots: a message that is right in the file
can be wrong next to what it describes.
