# Frontend: how a screen is built in code

**The project's `Architecture Rules` and the patterns already in its code win over everything here.**
Read them first, and copy how the product already does each thing. The stack-specific part at the end
applies only when `.pedd/stack.json` lists that stack.

## Layers

| Layer | Holds | Imports from |
|---|---|---|
| Catalog (`packages/ui`) | Primitives and the product's shared pieces, each with its stories | Tokens only |
| Feature components | The pieces of one module | The catalog |
| Screens and routes | A screen's layout, its states, and its call to the seam | Feature components and the catalog |
| The seam | Every read and write of the feature, in one file (design PRD, step 4) | The data layer |

A layer imports only from the ones below it. A component that fetches its own data cannot be
designed in every state, because its states cannot be reached from the outside.

## Components

| Rule | Why |
|---|---|
| A component receives its data and reports its events; the screen decides | It can be shown in every state from a story |
| State lives in the lowest component that every user of it contains | Higher, everything re-renders; lower, it is copied |
| Derive, do not sync: what can be computed from props or the server is computed, not copied into state | A copy goes stale |
| Composition over configuration ([tokens.md](tokens.md)) | — |
| Extract a piece only on its second real use (closing pass 4) | A guessed abstraction fits neither use |

## Where each kind of state lives

Choose in this order; the first that fits wins.

| Kind | Lives in | For example |
|---|---|---|
| Server data | The data layer the project uses (server components, a query cache), behind the seam | The list of invoices |
| What a link should keep | The URL | Filters, sorting, page, the open tab |
| A form being filled | The form | Field values, errors, dirty fields |
| Local UI | The component | A menu open, a row hovered |
| Shared across the app | A context or store, only when nothing above fits | The signed-in member, the theme |

## Forms

| Rule | Why |
|---|---|
| One schema validates on the client and on the server, as `Architecture Rules` names it | Two validations disagree |
| The server's errors come back per field, and go where [states.md](states.md) says | — |
| Submit is disabled only while submitting, never to signal that the form is invalid | A disabled button does not say what is wrong |
| The input stays when a write fails | — |

## Loading, errors and writes

| Rule | Why |
|---|---|
| Each region that loads on its own has its own loading and error boundary; the skeleton draws that region | One slow card does not blank the page |
| A write follows the contract in `Quality Standards`: when it applies, what happens when it fails, who announces success | Closing pass 3 checks each write against it |
| An optimistic update keeps the previous value, and on failure reverts it and says so | ARCH-14 State lens |

## Performance

| Rule | Measured by |
|---|---|
| Space is reserved for what loads: skeleton sizes, image width and height, fonts with a fallback of the same metrics | No layout shift: `layoutShift` of [page-check.js](../scripts/page-check.js) after the data arrives; at most 0.1 for the page (Core Web Vitals' "good") unless `Quality Standards` says less |
| No code copied: a second copy is a component or a function | The copy detector, `npx jscpd@5.4.3 --min-tokens 50` |
| Nothing heavy runs on input; long lists paginate in the database, or virtualize past a few hundred rows | Input responsiveness (INP) |
| The largest element of the page loads first | LCP |
| Memoize only what a measurement shows is slow | — |
| The reads a screen needs at mount go in one; no request twice | ARCH-14 Performance lens |

## React and Next.js

Only when `.pedd/stack.json` lists them.

| Rule | Why |
|---|---|
| Server Components by default; `"use client"` only on the leaves that need state, effects or browser APIs | Less JavaScript sent, and data read where it lives |
| Props that cross into a client component are serializable; server-only code never imports into one | It fails at build, or leaks |
| Each route segment maps its states: `loading.tsx` is its skeleton, `error.tsx` its error with a retry, `not-found.tsx` its not found | The states come from the framework, not from each screen |
| Writes go through Server Actions or route handlers, and revalidate what they change | What reads after a write is refreshed (ARCH-14) |
| `useActionState` and `useFormStatus` for a form's errors and pending state; `useOptimistic` for an optimistic update, reverted on failure | — |
| `next/image` and `next/font` | Reserved space, no layout shift |
| Stable keys from the data, never the index, in a list that can reorder | Rows keep their state |
