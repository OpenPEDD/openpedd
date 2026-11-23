import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { VERSION, mapData, readSpec, renderMap } from '../src/index.mjs';
import { blocksOf } from '../src/map.mjs';
import { readFiles } from '../src/files.mjs';

const REPO = fileURLToPath(new URL('../../..', import.meta.url));
const model = readSpec(readFiles(REPO));

test('mapData: the map of this repository, every part present', () => {
  const d = mapData(model, { built: '2026-01-01' });
  assert.equal(d.built, '2026-01-01');
  for (const k of ['stages', 'flows', 'trackCols', 'changes', 'lenses', 'lensItems', 'docs', 'pieces', 'openLayers', 'cloud', 'external', 'connections', 'readingOrder', 'archDocs', 'artifacts', 'skills', 'judgeInput', 'gaps']) assert.ok(k in d, k);
  assert.equal(d.stages.length, 10);
  assert.ok(d.docs.every((x) => x.path.startsWith('spec/') && !x.path.startsWith('spec/history')));
  assert.ok(d.skills.some((s) => s.prompt === 'skills/specify-interview/SKILL.md'));
});

test('blocksOf: a document cut at its headings, with its prose, tables and diagrams', () => {
  const b = blocksOf('---\ntitle: x\n---\n\n# A\n\nIntro.\n\n## B [#b]\n\n| H | I |\n|---|---|\n| 1 | 2 |\n\n```\na ──▶ b\n```\n');
  assert.deepEqual(b.map((x) => [x.level, x.heading, x.anchor]), [[1, 'A', 'a'], [2, 'B', 'b']]);
  assert.equal(b[0].text, 'Intro.');
  assert.deepEqual(b[1].tables, [{ header: ['H', 'I'], rows: [['1', '2']] }]);
  assert.deepEqual(b[1].diagrams, ['a ──▶ b']);
  assert.equal(b[1].text, '');
});

test('mapData: each skill card has its stage steps and the documents it follows, shown whole', () => {
  const d = mapData(model, { built: 'x' });
  const plan = d.stages.find((s) => s.id === 'plan');
  assert.ok(plan.steps.length > 5 && plan.steps[0].startsWith('**Traceability matrix.**'));
  const sweep = d.skills.find((s) => s.name === '/sweep');
  assert.equal(sweep.follows[0], 'spec/foundations/architecture/sweep.md', 'its own row links first');
  const byPath = new Map(d.docs.map((x) => [x.path, x]));
  for (const s of d.skills) for (const p of s.follows) assert.ok(byPath.get(p)?.blocks?.length, p);
  assert.ok(d.docs.filter((x) => x.layer === 'modules').every((x) => !('blocks' in x)), 'module PRDs are not inlined');
});

test('mapData: the same files give the same JSON, whatever order they come in', () => {
  const files = readFiles(REPO);
  const reversed = new Map([...files].reverse());
  assert.equal(JSON.stringify(mapData(readSpec(reversed), { built: 'x' })), JSON.stringify(mapData(model, { built: 'x' })));
});

test('mapData: a missing document the map needs is named', () => {
  assert.throws(() => mapData(readSpec({ 'spec/a.md': '' })), /spec\/modules\/cycle\/prd.md/);
});

test('renderMap: the page with its data inlined, no raw "<" inside it', () => {
  const data = mapData(model, { built: '2026-01-01' });
  const html = renderMap(model, { data });
  const inlined = html.match(/const D=(\{.*?\});\n/s)?.[1];
  assert.ok(inlined, 'data is inlined');
  assert.ok(!inlined.includes('<'));
  assert.deepEqual(JSON.parse(inlined), data);
});

test('the bin writes the same JSON as mapData', () => {
  const out = execFileSync(process.execPath, [fileURLToPath(new URL('../bin/openpedd-reader.mjs', import.meta.url)), 'map', REPO, '--built', '2026-01-01'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  assert.equal(out, JSON.stringify(mapData(model, { built: '2026-01-01' })));
});

test('VERSION is the package version', () => {
  assert.equal(VERSION, JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version);
});
