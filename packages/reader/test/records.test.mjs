import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkChecklist, checkDecisions, checkReport, checkTaskPr, readSpec, readSpecSection, changeDeltas } from '../src/index.mjs';

const delta = (id, type, fields = {}) => [`spec/changes/CHG-040/deltas/${id}.md`, `---\ntitle: "${id} · t"\ndescription: d\nowner: K\nversion: "1.0"\nupdated: "2026-11-23"\n---\n\n# ${id} · ${id} title\n\n| Field | Value |\n|---|---|\n| \`type\` | \`${type}\` |\n${Object.entries(fields).map(([k, v]) => `| \`${k}\` | ${v} |`).join('\n')}\n`];
const model = (...ds) => readSpec(Object.fromEntries(ds));
const M = model(
  delta('DLT-0001', 'assumption', { task: 'export', target: '`FR-JOB-01`', revert: 'copy', evidence: 'FR-JOB-02', if_no: 'x', decision: '`keep`' }),
  delta('DLT-0002', 'deviation', { task: 'export', target: '`ENT-04`', revert: 'a migration', evidence: 'guess', if_no: 'x' }),
  delta('DLT-0003', 'finding', { decision: 'reject' }),
);

test('readSpecSection: the Spec heading, and each kind with its IDs or none', () => {
  const s = readSpecSection('Intro\n\n## Spec\n\n- **Covers:** `FR-JOB-01`, FR-JOB-01.AC1\n- Assumptions: DLT-0001\n- Deviations: none\n\n## Notes\n- Assumptions: DLT-0009\n');
  assert.deepEqual(s.covers, ['FR-JOB-01', 'FR-JOB-01.AC1']);
  assert.deepEqual([s.assumptions, s.deviations], [['DLT-0001'], []]);
  assert.deepEqual(s.said, { covers: true, assumptions: true, deviations: true });
  assert.equal(readSpecSection('no section'), null);
});

test('checkTaskPr: missing section, unsaid kind, unknown or mistyped delta, and a delta of the task not listed', () => {
  const deltas = changeDeltas(M, 'CHG-040');
  const what = (body, task = 'export') => checkTaskPr({ body, deltas, task, change: 'CHG-040' }).problems.map((p) => p.what);
  assert.deepEqual(what('nothing'), ['the PR has no `## Spec` section']);
  assert.deepEqual(what('## Spec\nAssumptions: DLT-0001\nDeviations: DLT-0002\n'), []);
  assert.deepEqual(what('## Spec\nAssumptions: DLT-0001\n'), ['the Spec section does not say its deviations', 'DLT-0002 (deviation) belongs to task export and the PR does not list it']);
  assert.deepEqual(what('## Spec\nAssumptions: DLT-0002, DLT-0099\nDeviations: none\n'), [
    'DLT-0002 is listed as assumption, but it is a deviation',
    'DLT-0099 is listed as assumption, and CHG-040 has no such delta',
    'DLT-0001 (assumption) belongs to task export and the PR does not list it',
  ]);
  assert.deepEqual(what('## Spec\nAssumptions: none\nDeviations: none\n', 'other'), [], 'another task owns none of them');
});

test('checkChecklist: unticked, ticked with no PR, ticked with a PR not merged', () => {
  const list = '- [x] Export claims · FR-JOB-01 — #12\n- [x] Filter claims #13\n- [x] Paginate claims\n- [ ] Email the export\n';
  assert.deepEqual(checkChecklist({ checklist: list, merged: [12] }).problems.map((p) => p.what), [
    'ticked, but #13 is not merged into the change branch: Filter claims',
    'ticked with no PR: Paginate claims',
    'task not done: Email the export',
  ]);
  assert.equal(checkChecklist({ checklist: '- [x] A #1\n', merged: [1] }).ok, true);
  assert.equal(checkChecklist({ checklist: 'no tasks', merged: [] }).ok, false);
});

test('checkReport: every delta in it, the assumptions and deviations heaviest first', () => {
  const bad = checkReport({ report: 'Assumptions: DLT-0001 (low)\nDeviations: DLT-0002 (high)\n', model: M, change: 'CHG-040' });
  assert.deepEqual(bad.problems.map((p) => p.what), ['DLT-0003 (finding) is not in the report', 'DLT-0002 (high) comes after DLT-0001 (low)']);
  assert.equal(checkReport({ report: 'DLT-0002 then DLT-0001; finding DLT-0003', model: M, change: 'CHG-040' }).ok, true);
});

test('checkDecisions: every delta keep, change or reject', () => {
  assert.deepEqual(checkDecisions({ model: M, change: 'CHG-040' }).problems.map((p) => p.what), ['DLT-0002 (deviation) has no decision']);
});
