import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readSpec, readBusinessMap } from '../src/index.mjs';

const asIs = `---
title: As-is
description: How the organization works today
owner: Kevin
version: "1.2"
updated: "2026-11-20"
---

# As-is

## People

| Team | Role | People | Reports to |
|---|---|---|---|
| Sales | \`seller\` | 4 | \`sales_lead\` |

## Business use cases

| BUC | Business use case | Kind | Business actor | Processes |
|---|---|---|---|---|
| \`BUC-01\` | Do a job for a client | Core | Client · Insurer | \`PRC-01\` · \`PRC-02\` |
| \`BUC-02\` | Know the month's margin | management | — | — |

## Processes

| ID | Name | Starts with | Role | Tool | How often | Confirmed by |
|---|---|---|---|---|---|---|
| \`PRC-01\` | Quote a job | A call | \`seller\` | Excel | Daily | \`seller\` |

### PRC-02 · Invoice

| Field | Value |
|---|---|
| Starts with | A finished job |
| Confirmed by | \`admin\` |

| Step | Role | Tool |
|---|---|---|
| 1. Copy the quote | \`admin\` | Excel |

## Tools and spreadsheets

| Tool | Holds | Written by | Used in |
|---|---|---|---|
| Quotes.xlsx | Every quote | \`seller\` | \`PRC-01\` |

## Pains

| Pain | Who said it | Process |
|---|---|---|
| "We copy every quote twice" | \`admin\` | \`PRC-02\` |
`;

const toBe = `---
title: To-be
version: "1.0"
---

## Processes

| ID | Name | Mark | Module |
|---|---|---|---|
| \`PRC-01\` | Quote a job | **taken** | \`quotes\` |
| \`PRC-02\` | Invoice | changed | \`billing\` |
| \`PRC-03\` | Follow up | new? | |

## Modules

| Module | Takes | Removes |
|---|---|---|
| \`quotes\` | \`PRC-01\` | Copying twice |

## Order

1. quotes: it removes the worst pain
2. billing
`;

const files = new Map([
  ['spec/foundations/business-map/as-is.md', asIs],
  ['spec/foundations/business-map/to-be.md', toBe],
]);

test('readBusinessMap: the as-is by its sections, processes from rows and from headings', () => {
  const m = readBusinessMap(files);
  assert.equal(m.asIs.version, '1.2');
  assert.deepEqual(m.asIs.people, [{ team: 'Sales', role: 'seller', people: '4', reports_to: 'sales_lead' }]);
  assert.deepEqual(m.asIs.processes.map((p) => [p.id, p.name]), [['PRC-01', 'Quote a job'], ['PRC-02', 'Invoice']]);
  assert.equal(m.asIs.processes[0].fields.confirmed_by, 'seller');
  assert.equal(m.asIs.processes[1].fields.confirmed_by, 'admin');
  assert.deepEqual(m.asIs.processes[1].tables[0].rows, [{ step: '1. Copy the quote', role: 'admin', tool: 'Excel' }]);
  assert.equal(m.asIs.tools[0].used_in, 'PRC-01');
  assert.equal(m.asIs.pains[0].who_said_it, 'admin');
  assert.deepEqual(m.asIs.missing, []);
});

test('readBusinessMap: the to-be with each mark and module; an order written as a list', () => {
  const m = readBusinessMap(files);
  assert.deepEqual(m.toBe.processes.map((p) => [p.id, p.mark, p.module]), [['PRC-01', 'taken', 'quotes'], ['PRC-02', 'changed', 'billing'], ['PRC-03', null, null]]);
  assert.deepEqual(m.toBe.modules, [{ module: 'quotes', takes: 'PRC-01', removes: 'Copying twice' }]);
  assert.deepEqual(m.toBe.order.map((o) => o.step), ['quotes: it removes the worst pain', 'billing']);
  assert.deepEqual(m.toBe.missing, ['People']);
});

test('readBusinessMap: every process, as-is to to-be', () => {
  assert.deepEqual(readBusinessMap(files).processes, [
    { id: 'PRC-01', name: 'Quote a job', asIs: true, mark: 'taken', module: 'quotes' },
    { id: 'PRC-02', name: 'Invoice', asIs: true, mark: 'changed', module: 'billing' },
    { id: 'PRC-03', name: 'Follow up', asIs: false, mark: null, module: null },
  ]);
});

test('readSpec: the business map in the model; null without one; another root', () => {
  assert.equal(readSpec(files).businessMap.asIs.title, 'As-is');
  assert.equal(readSpec({ 'spec/a.md': '# a' }).businessMap, null);
  const only = readSpec({ 'docs/foundations/business-map/as-is.md': asIs }, { root: 'docs' }).businessMap;
  assert.equal(only.toBe, null);
  assert.equal(only.processes.length, 2);
});

test('readBusinessMap: business use cases with their kind, business actors and processes (FR-VEW-21)', () => {
  const m = readBusinessMap(files);
  assert.deepEqual(m.useCases, [
    { id: 'BUC-01', name: 'Do a job for a client', kind: 'core', actors: ['Client', 'Insurer'], processes: ['PRC-01', 'PRC-02'] },
    { id: 'BUC-02', name: "Know the month's margin", kind: 'management', actors: [], processes: [] },
  ]);
});
