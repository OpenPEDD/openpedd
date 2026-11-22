import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { changeIds, nextChangeId } from '../src/index.mjs';
import { readFiles } from '../src/files.mjs';

test('nextChangeId: the highest on the base, its archive, its history and every branch, plus one (ARCH-21)', () => {
  const base = {
    'spec/changes/CHG-007/definition.md': '',
    'spec/changes/archive/CHG-012/deltas/DLT-0001.md': '',
    'spec/history/history.jsonl': '{"change": "CHG-015"}\n{"change": null}\n',
    'spec/foundations/glossary.md': 'Mentions CHG-999 in prose, which does not count.',
  };
  const branches = ['spec/changes/CHG-016/definition.md', 'changes/CHG-003/definition.md'];
  assert.equal(nextChangeId(base), 'CHG-016');
  assert.equal(nextChangeId(base, branches), 'CHG-017');
  assert.equal(nextChangeId(base, branches, ['CHG-017']), 'CHG-018');
  assert.deepEqual([...changeIds(base)].sort(), ['CHG-007', 'CHG-012', 'CHG-015']);
});

test('nextChangeId: nothing found starts at CHG-001; the number grows past three digits', () => {
  assert.equal(nextChangeId(), 'CHG-001');
  assert.equal(nextChangeId({}), 'CHG-001');
  assert.equal(nextChangeId(['CHG-999']), 'CHG-1000');
  assert.equal(nextChangeId('{"change": "CHG-041"}'), 'CHG-042');
});

test('nextChangeId: on this repository, after CHG-029', () => {
  const files = readFiles(fileURLToPath(new URL('../../..', import.meta.url)));
  assert.ok(Number(nextChangeId(files).slice(4)) >= 30);
});
