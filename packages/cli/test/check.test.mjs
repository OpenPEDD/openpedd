import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { readSpec } from '@openpedd/reader';
import { budgetOf, runChecks } from '../src/check.mjs';
import { main } from '../src/cli.mjs';
import { repo, sh } from './helpers.mjs';

const REPO = fileURLToPath(new URL('../../..', import.meta.url));
const fm = (extra = '') => `---\ntitle: t\ndescription: d\nowner: K\nversion: "1.0"\nupdated: "2026-11-22"\n${extra}---\n`;
const failures = (files, only) => runChecks(readSpec(files), { root: '/nonexistent', only: [only] })[0].failures.map((f) => f.message);

test('status: a PRD carries its least advanced requirement (DEC-28)', () => {
  const prd = (status, a, b) => ({ 'spec/modules/billing/prd.md': `${fm(`status: ${status}\n`)}\n| ID | Statement | Status |\n|---|---|---|\n| \`FR-BIL-01\` | x | ${a} |\n| \`FR-BIL-02\` | y | ${b} |\n` });
  assert.deepEqual(failures(prd('designed', '`designed`', '`live`'), 'status'), []);
  assert.deepEqual(failures(prd('live', '`designed`', '`live`'), 'status'), ['status `live`, but its least advanced requirement is `designed` (DEC-28)']);
  assert.deepEqual(failures(prd('designed', '`designed`', '`done`'), 'status'), ['FR-BIL-02: status `done` is not one of draft, specified, designed, building, in_review, accepted, changing, live, deprecated']);
  // Without the column, each requirement shows the PRD's status: nothing to disagree.
  assert.deepEqual(failures({ 'spec/modules/billing/prd.md': `${fm('status: draft\n')}\n| ID | Statement |\n|---|---|\n| FR-BIL-01 | x |\n` }, 'status'), []);
});

test('frontmatter: a broken one fails with its line; a missing field fails; a definition keeps its own fields', () => {
  assert.deepEqual(failures({ 'spec/a.md': '---\ntitle: "x\n---\n', 'spec/b.md': '---\ntitle: t\n---\n', 'spec/changes/CHG-001/definition.md': '---\nstatus: draft\n---\n', 'spec/c.md': fm() }, 'frontmatter'), [
    '`title`: the double quote is not closed',
    'the frontmatter lacks `description`, `owner`, `version`, `updated`',
  ]);
});

test('links: a missing file or anchor fails', () => {
  assert.deepEqual(failures({ 'spec/a.md': '# A\n\n## Two [#two]\n\n[ok](b.md#bee) [ok](#two) [x](c.md) [y](b.md#nope) [web](https://x.y)\n', 'spec/b.md': '## Bee\n' }, 'links'), ['→ c.md: file not found', '→ b.md#nope: anchor not found']);
});

test('size: over budget fails only when it grew', () => {
  const big = 'x'.repeat(4100 * 4);
  const run = (before) => runChecks(readSpec({ 'spec/decisions/DEC-01.md': big }), { only: ['size'], before: () => before })[0];
  assert.equal(run(null).failures.length, 1);
  assert.equal(run(big).failures.length, 0);
  assert.equal(run(big).warnings.length, 1);
  assert.equal(budgetOf('spec/changes/CHG-001/deltas/DLT-0001.md', 'spec'), 1000);
  assert.equal(budgetOf('spec/modules/a/prd.md', 'spec', { modules: 5000 }), 5000);
});

test('history: each line is JSON with every field', () => {
  assert.deepEqual(failures({ 'spec/history/history.jsonl': '{"path": "a"}\nnope\n' }, 'history'), ['lacks version, date, change, story, stage, summary', 'not JSON']);
});

test('pedd check passes on this repository and on the template', async () => {
  const out = [];
  const io = { out: (s) => out.push(s), err: (s) => out.push(s) };
  assert.equal(await main(['check'], { ...io, cwd: REPO }), 0, out.join('\n'));
  assert.equal(await main(['check', '--root', 'template'], { ...io, cwd: REPO }), 0, out.join('\n'));
});

test('pedd: a command the spec names and this version does not build says why', async () => {
  const err = [];
  assert.equal(await main(['status'], { out: () => {}, err: (s) => err.push(s), cwd: REPO }), 3);
  assert.match(err[0], /pedd status is not built yet/);
});

test('pedd branch check from the command line, on a clone', async () => {
  const r = repo({ 'spec/history/history.jsonl': '' });
  const out = [];
  const io = { out: (s) => out.push(s), err: (s) => out.push(s), cwd: r.work };
  assert.equal(await main(['branch', 'request', 'Job', 'posts'], io), 0, out.join('\n'));
  assert.equal(out[0], 'feat/job-posts');
  sh(r.work, 'checkout', '--quiet', 'feat/job-posts');
  assert.equal(await main(['branch', 'check', '--head', 'feat/job-posts', '--target', 'dev'], io), 0, out.join('\n'));
  assert.equal(await main(['branch', 'check', '--head', 'feat/job-posts', '--target', 'main'], io), 1);
});

test('pedd weigh: a change of this repository, heaviest first; a bad argument is a usage error', async () => {
  const lines = [], errs = [];
  const io = { cwd: REPO, out: (s) => lines.push(s), err: (s) => errs.push(s) };
  assert.equal(await main(['weigh', 'CHG-030'], io), 0);
  assert.match(lines[0], /^CHG-030: \d+ assumption\(s\) and deviation\(s\), \d+ decision\(s\), heaviest first$/);
  assert.ok(lines.some((l) => /DLT-0007/.test(l)));
  lines.length = 0;
  assert.equal(await main(['weigh', 'CHG-030', '--json', '--fan-out', 'DLT-0008=3'], io), 0);
  const r = JSON.parse(lines.join('\n'));
  assert.equal(r.groups.flatMap((g) => g.items).find((i) => i.id === 'DLT-0008').factors.fanOut.why, '3 build on it');
  assert.equal(await main(['weigh', 'nope'], io), 2);
  assert.equal(await main(['weigh', 'CHG-999'], io), 1);
});

test('pedd sweep: finders in parallel, one sheet, one reply, round 2 rewrites only what an answer changed', async () => {
  const { mkdtempSync, mkdirSync, readFileSync, existsSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const dir = mkdtempSync(join(tmpdir(), 'pedd-sweep-'));
  mkdirSync(join(dir, 'spec/changes/CHG-001'), { recursive: true });
  process.env.PEDD_FINDER = `"${process.execPath}" "${fileURLToPath(new URL('./fixtures/finder.mjs', import.meta.url))}"`;
  const lines = [], errs = [];
  const io = { cwd: dir, out: (s) => lines.push(s), err: (s) => errs.push(s) };
  try {
    assert.equal(await main(['sweep', 'CHG-001'], io), 1, 'a finder that did not run fails the sweep');
    assert.match(errs.join('\n'), /the design finder did not run: exited 4: no session/);
    assert.match(lines[0], /^CHG-001: swept specify, architect, plan · 4 question\(s\): 1 for the client, 1 for the product engineer, 1 decided by recommendation, 1 decided by the AI · 1 already answered$/);
    const sheet = readFileSync(join(dir, 'spec/changes/CHG-001/sweep.md'), 'utf8');
    assert.match(sheet, /Not run: `design` \(exited 4: no session\)/);
    assert.ok(existsSync(join(dir, 'spec/changes/CHG-001/sweep/findings/specify.json')));
    const state = () => JSON.parse(readFileSync(join(dir, 'spec/changes/CHG-001/sweep/state.json'), 'utf8'));
    const n = (key) => state().questions.find((q) => q.key === key).n;
    lines.length = 0;
    assert.equal(await main(['sweep', 'CHG-001', 'answer', '--as', 'client', `todo como recomendado, salvo ${n('who')}: b`], io), 0);
    assert.match(lines.join('\n'), /Round 2: 1 assumed an answer you changed/);
    assert.equal(state().questions.find((q) => q.key === 'store').reopened, true);
    lines.length = 0;
    assert.equal(await main(['sweep', 'CHG-001'], io), 0);
    assert.match(lines[0], /^CHG-001: round 2 · 1 question\(s\) rewritten with your answers/);
    assert.equal(state().questions.find((q) => q.key === 'store').about, 'Where are invoices stored, now that everyone sees them?');
    assert.equal(await main(['sweep', 'CHG-001', 'answer', '--as', 'builder', `${n('store')}: a`], io), 0);
    assert.ok(state().questions.every((q) => q.answer));
    assert.match(readFileSync(join(dir, 'spec/changes/CHG-001/sweep.md'), 'utf8'), /## Answers \(4\)/);
    assert.equal(await main(['sweep', 'nope'], io), 1);
  } finally {
    delete process.env.PEDD_FINDER;
  }
});
