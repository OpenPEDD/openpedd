import { test } from 'node:test';
import assert from 'node:assert/strict';
import { code, frontmatter, headings, prose, section, tableWith, tables } from '../src/markdown.mjs';

const doc = `---
title: "DEC-26 · One reader"
version: "1.0"
status: draft | live          # spec/modules/ only
agreed:
  by: Ana
  at: "2026-11-20T10:00"
prds:
  - spec/modules/a/prd.md
  - spec/modules/b/prd.md
tags: [one, two]
---

# Title

## The file [#the-file]

| Field | Holds |
|---|---|
| \`status\` | draft |

\`\`\`
| not | a |
|---|---|
\`\`\`

### Inside

Text.

## Next
`;

test('frontmatter: flat strings lose quotes and comments; blocks become objects and lists', () => {
  const fm = frontmatter(doc);
  assert.equal(fm.title, 'DEC-26 · One reader');
  assert.equal(fm.version, '1.0');
  assert.equal(fm.status, 'draft | live');
  assert.deepEqual(fm.agreed, { by: 'Ana', at: '2026-11-20T10:00' });
  assert.deepEqual(fm.prds, ['spec/modules/a/prd.md', 'spec/modules/b/prd.md']);
  assert.deepEqual(fm.tags, ['one', 'two']);
  assert.deepEqual(frontmatter('no frontmatter'), {});
});

// section reads lines, as scripts/view.mjs always did: a heading inside a code block still ends a section.
test('section: the body under a heading, its explicit anchor ignored, up to the next of its level', () => {
  const s = section(doc, 'The file');
  assert.match(s, /^\| Field/);
  assert.match(s, /### Inside/);
  assert.doesNotMatch(s, /## Next/);
  assert.equal(section(doc, 'Missing'), null);
});

test('headings: outside code, with the explicit anchor or the slug', () => {
  const h = headings(doc);
  assert.deepEqual(h.map((x) => [x.level, x.text, x.anchor]), [[1, 'Title', 'title'], [2, 'The file', 'the-file'], [3, 'Inside', 'inside'], [2, 'Next', 'next']]);
});

test('tables: code blocks skipped; tableWith finds by columns', () => {
  const t = tables(doc);
  assert.equal(t.length, 1);
  assert.deepEqual(t[0], { header: ['Field', 'Holds'], rows: [['`status`', 'draft']] });
  assert.deepEqual(tableWith(doc, 'Field', 'Holds'), t[0]);
  assert.equal(tableWith(doc, 'Nope'), undefined);
});

test('prose and code', () => {
  assert.equal(prose('a\n| x |\nb'), 'a\nb');
  assert.deepEqual(code('`a` and `b c`'), ['a', 'b c']);
});

test('headings: one inside a code block is not a heading', () => {
  assert.deepEqual(headings('```\n# no\n```\n# yes').map((h) => h.text), ['yes']);
});
