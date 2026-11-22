import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readDefinition, writeDefinition } from '../src/index.mjs';

const text = `---
title: CHG-031 · Automations
status: agreed
agreed:
  by: Ana
  at: "2026-11-20T10:00"
prds:
  - spec/modules/billing/prd.md
---

# CHG-031 · Automations

Notes before the items stay as they are.

## Items

| Item | State | Client's words |
|---|---|---|
| Main flow | answered | They pay, then get a receipt |
| Who can do each action | assumed | Admins \\| owners |
| Test data | missing |  |

## Summary

They pay and get a receipt. Roles were assumed.
`;

test('readDefinition: frontmatter, items and summary', () => {
  const d = readDefinition(text);
  assert.equal(d.status, 'agreed');
  assert.deepEqual(d.agreed, { by: 'Ana', at: '2026-11-20T10:00' });
  assert.deepEqual(d.prds, ['spec/modules/billing/prd.md']);
  assert.deepEqual(d.frontmatter, { title: 'CHG-031 · Automations' });
  assert.deepEqual(d.items[1], { item: 'Who can do each action', state: 'assumed', words: 'Admins | owners' });
  assert.equal(d.items.length, 3);
  assert.equal(d.summary, 'They pay and get a receipt. Roles were assumed.');
});

test('writeDefinition: written back in the same format', () => {
  assert.equal(writeDefinition(readDefinition(text)), text);
});

test('writeDefinition: an edit changes only the items and the summary', () => {
  const d = readDefinition(text);
  d.items[2] = { item: 'Test data', state: 'answered', words: 'Two buyers' };
  d.summary = 'Done.';
  const out = writeDefinition(d);
  assert.match(out, /\| Test data \| answered \| Two buyers \|/);
  assert.match(out, /## Summary\n\nDone.\n$/);
  assert.match(out, /Notes before the items stay as they are./);
  assert.deepEqual(readDefinition(out).items[2], d.items[2]);
});

test('writeDefinition: a new definition, on the branch being cut', () => {
  const out = writeDefinition({ status: 'draft', items: [{ item: 'Main flow', state: 'missing', words: '' }] });
  const d = readDefinition(out);
  assert.equal(d.status, 'draft');
  assert.equal(d.agreed, null);
  assert.deepEqual(d.prds, []);
  assert.deepEqual(d.items, [{ item: 'Main flow', state: 'missing', words: '' }]);
  assert.equal(writeDefinition(d), out);
});

test('writeDefinition: a status or a state outside the lists is refused', () => {
  assert.throws(() => writeDefinition({ status: 'accepted' }), /not one of draft, confirmed, agreed/);
  assert.throws(() => writeDefinition({ status: 'draft', items: [{ item: 'x', state: 'maybe' }] }), /not one of answered/);
});
