import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { get } from 'node:http';
import { main } from '../src/cli.mjs';
import { watchViews } from '../src/view.mjs';
import { product } from '../../reader/test/views-fixture.mjs';
import { commitOn, repo, sh, write } from './helpers.mjs';

const run = async (argv, cwd) => {
  const out = [], err = [];
  const code = await main(argv, { out: (s) => out.push(s), err: (s) => err.push(s), cwd });
  return { code, out: out.join('\n'), err: err.join('\n') };
};
const plain = (s) => s.replace(/\x1b\[\d+m/g, '');
const dir = (files) => { const d = mkdtempSync(join(tmpdir(), 'pedd-view-')); write(d, files); return d; };

test('pedd view: writes views.json and index.html to .pedd/view/, and opens on context when nothing is loose', async () => {
  const d = dir(product());
  const r = await run(['view', '--no-open'], d);
  assert.equal(r.code, 0, r.err);
  const data = JSON.parse(readFileSync(join(d, '.pedd/view/views.json'), 'utf8'));
  assert.equal(Object.keys(data.views).length, 14);
  assert.equal(data.product, 'acme');
  const html = readFileSync(join(d, '.pedd/view/index.html'), 'utf8');
  assert.match(html, /"open":\{"kind":"context"\}/);
  assert.match(plain(r.out), /opens on context/);
});

test('pedd view: a decision citing an ID defined nowhere opens on decisions', async () => {
  const f = product();
  f['spec/decisions/DEC-01-posts-expire.md'] += 'Also `FR-JOB-09`.\n';
  const d = dir(f);
  const r = await run(['view', '--no-open'], d);
  assert.match(plain(r.out), /1 loose/);
  assert.match(readFileSync(join(d, '.pedd/view/index.html'), 'utf8'), /"open":\{"kind":"decisions"\}/);
});

test('pedd view <kind> <id> --format mermaid prints that view, scoped, and writes nothing', async () => {
  const d = dir(product());
  const r = await run(['view', 'states', 'ENT-01', '--format', 'mermaid'], d);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /^```mermaid\nstateDiagram-v2/);
  assert.ok(!existsSync(join(d, '.pedd/view')));
  const p = await run(['view', 'prd', 'modules/jobs/prd.md', '--format', 'mermaid'], d);
  assert.match(p.out, /flowchart LR/);
  assert.doesNotMatch(p.out, /billing/);
  assert.equal((await run(['view', 'maps', '--no-open'], d)).code, 2);
  assert.match((await run(['view', 'states', 'ENT-99', '--format', 'mermaid'], d)).err, /nothing in this view is ENT-99/);
  assert.equal((await run(['view', '--format', 'mermaid'], d)).code, 2);
});

test('pedd view <kind> <id>: the page opens on that view and ID', async () => {
  const d = dir(product());
  await run(['view', 'trace', 'FR-JOB-01', '--depth', '2', '--no-open'], d);
  assert.match(readFileSync(join(d, '.pedd/view/index.html'), 'utf8'), /"open":\{"kind":"trace","id":"FR-JOB-01","depth":2\}/);
});

test('FR-VEW-07.AC1: --watch rebuilds on a save of an entity file and tells the open page to reload', async () => {
  const d = dir(product());
  const w = await watchViews(d);
  try {
    const page = await new Promise((resolve, reject) => get(w.url, (res) => { let b = ''; res.on('data', (c) => (b += c)); res.on('end', () => resolve(b)); }).on('error', reject));
    assert.match(page, /"live":true/);
    const events = await new Promise((resolve, reject) => get(`${w.url}events`, resolve).on('error', reject));
    const got = new Promise((resolve) => events.on('data', (c) => { if (String(c).startsWith('data:')) resolve(String(c)); }));
    writeFileSync(join(d, 'spec/foundations/domain/invoice.md'), readFileSync(join(d, 'spec/foundations/domain/invoice.md'), 'utf8').replace('What a company pays for a post.', 'What a company pays.'));
    assert.match(await got, /^data: 1/);
    const data = JSON.parse(readFileSync(join(d, '.pedd/view/views.json'), 'utf8'));
    assert.equal(data.views.entities.nodes.find((n) => n.id === 'ENT-02').what, 'What a company pays.');
    // Only the working tree is served.
    const status = await new Promise((resolve) => get(`${w.url}..%2F..%2Fetc%2Fpasswd`, (res) => resolve(res.statusCode)));
    assert.equal(status, 404);
    events.destroy();
  } finally {
    w.close();
  }
});

test('FR-VEW-09.AC1 · AC2: pedd check fails on a loose item the change adds, and lists an old one as pressure', async () => {
  const f = product();
  f['spec/decisions/DEC-02-old.md'] = '# DEC-02 · An old decision\n\n**Date:** 2026-11-01\n\nOnly prose.\n';
  const r = repo(f);
  // Nothing changed: the old loose decision is pressure.
  let c = await run(['check', '--only', 'loose'], r.work);
  assert.equal(c.code, 0, c.out);
  assert.match(plain(c.out), /! loose · spec\/decisions\/DEC-02-old.md:\d+: "An old decision" \(DEC-02\) cites no requirement/);
  // The change adds an entity no PRD cites.
  write(r.work, { 'spec/foundations/domain/tag.md': '# ENT-03 · Tag\n\n## Fields\n\n| Field | Type | What it holds |\n|---|---|---|\n| `name` | text | x |\n' });
  c = await run(['check', '--only', 'loose'], r.work);
  assert.equal(c.code, 1);
  assert.match(plain(c.out), /✗ loose · spec\/foundations\/domain\/tag.md:1: "Tag" \(ENT-03\) no PRD cites it · entities/);
  assert.match(plain(c.out), /! loose · spec\/decisions\/DEC-02-old.md/);
  // Touching the old decision's file makes it the change's.
  write(r.work, { 'spec/decisions/DEC-02-old.md': '# DEC-02 · An old decision\n\n**Date:** 2026-11-01\n\nOnly prose, edited.\n' });
  c = await run(['check', '--only', 'loose', '--json'], r.work);
  const res = JSON.parse(c.out).checks[0];
  assert.deepEqual(res.failures.map((x) => x.loose.id).sort(), ['DEC-02', 'ENT-03']);
  // Committed, and compared with the base: still the change's.
  sh(r.work, 'add', '-A'); sh(r.work, 'commit', '--quiet', '-m', 'tag');
  c = await run(['check', '--only', 'loose', '--against', 'origin/main'], r.work);
  assert.equal(c.code, 1);
  c = await run(['check', '--only', 'loose'], r.work);
  assert.equal(c.code, 0, c.out);
});

test('pedd check: a loose item on another change branch is that change\'s', async () => {
  const r = repo(product());
  sh(r.work, 'push', '--quiet', 'origin', 'main:refs/heads/feat/other');
  commitOn(r, 'feat/other', { 'spec/changes/CHG-005/deltas/DLT-0001.md': '# DLT-0001 · x\n\n| Field | Value |\n|---|---|\n| `target` | `FR-NOP-01` |\n| `op` | `MODIFIED` |\n' });
  sh(r.work, 'fetch', '--quiet', 'origin');
  const c = await run(['check', '--only', 'loose', '--json'], r.work);
  const res = JSON.parse(c.out).checks[0];
  assert.equal(c.code, 0);
  assert.deepEqual(res.warnings.map((w) => w.loose.at), ['feat/other:spec/changes/CHG-005/deltas/DLT-0001.md']);
  const v = await run(['view', 'changes', '--format', 'mermaid'], r.work);
  assert.match(v.out, /CHG-005/);
});

test('pedd check: without git, every loose item is the change\'s', async () => {
  const f = product();
  f['spec/foundations/domain/tag.md'] = '# ENT-03 · Tag\n';
  const c = await run(['check', '--only', 'loose'], dir(f));
  assert.equal(c.code, 1);
});
