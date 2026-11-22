import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { VERSION, mapData, readSpec, renderMap } from '../src/index.mjs';
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
