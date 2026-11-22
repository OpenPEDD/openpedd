import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { readSpec, comparePaths } from '../src/index.mjs';
import { readFiles } from '../src/files.mjs';

const REPO = fileURLToPath(new URL('../../..', import.meta.url));

const files = {
  'spec/modules/README.md': `| Module | Code | PRDs |
|---|---|---|
| [billing](billing/prd.md) | \`BIL\` | Pay |
| [jobs](jobs/prd.md) · [posts](jobs/posts.md) | \`JOB\` | Jobs |
`,
  'spec/modules/billing/prd.md': `---
title: billing
status: specified
---

## Requirements

| ID | Statement | Reason | Roles | Criteria | Status |
|---|---|---|---|---|---|
| \`FR-BIL-01\` | When paid, the system shall send a receipt | Proof | \`buyer\` | \`AC1\` · \`AC2\` | \`designed\` |
| \`FR-BIL-02\` | When refunded, the system shall notify | Trust | \`buyer\` | \`AC3\` | |
| \`NFR-BIL-01\` | The system shall answer in 200 ms | Speed | — | \`AC4\` | specified |
`,
  'spec/modules/jobs/prd.md': `---
title: jobs
status: draft
---

| ID | Statement | Criteria | Depends on |
|---|---|---|---|
| FR-JOB-01 | When posted, the system shall list it | \`AC1\` | \`FR-BIL-01\` |
`,
  'spec/history/history.jsonl': '{"path": "modules/jobs/prd.md", "version": "1.0", "change": "CHG-004"}\nnot json\n',
  'spec/a/x.md': '# x',
  'spec/a.md': '# a',
  'README.md': '# outside',
};

test('readSpec: documents in directory order, with frontmatter, headings and tables', () => {
  const m = readSpec(files);
  assert.deepEqual(m.documents.map((d) => d.path), ['README.md', 'spec/a/x.md', 'spec/a.md', 'spec/modules/README.md', 'spec/modules/billing/prd.md', 'spec/modules/jobs/prd.md']);
  const billing = m.documents.find((d) => d.path === 'spec/modules/billing/prd.md');
  assert.equal(billing.frontmatter.status, 'specified');
  assert.equal(billing.tables[0].section, 'Requirements');
  assert.deepEqual(billing.headings.map((h) => h.anchor), ['requirements']);
});

test('readSpec: modules with their code, PRDs and requirements; status from the column, else the PRD (DEC-28)', () => {
  const m = readSpec(files);
  assert.deepEqual(m.modules, [
    { id: 'billing', code: 'BIL', prds: ['spec/modules/billing/prd.md'] },
    { id: 'jobs', code: 'JOB', prds: ['spec/modules/jobs/prd.md'] },
  ]);
  const by = Object.fromEntries(m.requirements.map((r) => [r.id, r]));
  assert.equal(by['FR-BIL-01'].status, 'designed');
  assert.equal(by['FR-BIL-01'].statusFrom, 'column');
  assert.deepEqual(by['FR-BIL-01'].criteria, ['AC1', 'AC2']);
  assert.equal(by['FR-BIL-02'].status, 'specified');
  assert.equal(by['FR-BIL-02'].statusFrom, 'prd');
  assert.equal(by['NFR-BIL-01'].kind, 'NFR');
  assert.equal(by['NFR-BIL-01'].status, 'specified');
  assert.equal(by['FR-JOB-01'].status, 'draft');
  assert.deepEqual(by['FR-JOB-01'].depends_on, ['FR-BIL-01']);
  assert.equal(by['FR-JOB-01'].module, 'JOB');
});

test('readSpec: history lines, a broken one kept as an error', () => {
  const m = readSpec(files);
  assert.equal(m.history[0].change, 'CHG-004');
  assert.deepEqual(m.history[1], { error: 'not JSON', line: 2 });
});

test('readSpec: a Map works the same, and another spec root', () => {
  const m = readSpec(new Map(Object.entries({ 'docs/modules/x/prd.md': '---\nstatus: live\n---\n' })), { root: 'docs' });
  assert.equal(m.root, 'docs');
  assert.deepEqual(m.prds.map((p) => [p.module, p.status]), [['x', 'live']]);
});

test('comparePaths: a folder sorts by its name, as a directory listing does', () => {
  assert.deepEqual(['a.md', 'a/x.md', 'a-b.md', 'B.md'].sort(comparePaths), ['B.md', 'a/x.md', 'a-b.md', 'a.md']);
});

test('readSpec: this repository reads without error', () => {
  const m = readSpec(readFiles(REPO));
  assert.ok(m.documents.length > 100);
  assert.ok(m.modules.some((x) => x.id === 'cycle' && x.code === 'CYC'));
  assert.ok(m.history.length > 300);
  assert.ok(m.history.every((h) => !h.error));
});
