import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readSpec, weigh, weighChange } from '../src/index.mjs';

// One item per factor level: Undo from `revert`, Reach from `target`, Evidence backed so it moves
// the table down, unless a test says otherwise.
const UNDO = { high: '`supabase/migrations/0042_jobs.sql`', medium: '`apps/app/src/jobs.ts`: `publish`', low: '`apps/app/locales/en.json`: the label' };
const REACH = { high: 'ENT-04', medium: 'FR-JOB-03', low: 'nothing' };

test('weigh: the table, Undo ↓ · Reach →, before Evidence and Fan-out (ARCH-23)', () => {
  const want = { high: { high: 'high', medium: 'high', low: 'medium' }, medium: { high: 'high', medium: 'medium', low: 'low' }, low: { high: 'medium', medium: 'low', low: 'low' } };
  for (const u of ['medium', 'low']) for (const r of ['high', 'medium', 'low']) {
    const w = weigh({ target: REACH[r], revert: UNDO[u], evidence: 'inferred from another requirement', if_no: 'x' });
    assert.equal(w.factors.undo.level, u, `${u}/${r} undo`);
    assert.equal(w.factors.reach.level, r, `${u}/${r} reach`);
    assert.equal(w.table, want[u][r], `${u}/${r}`);
    assert.equal(w.weight, want[u][r], 'inferred evidence moves nothing');
  }
  // A migration reaches the data model: high Undo is high Reach too.
  assert.equal(weigh({ target: 'nothing', revert: UNDO.high, evidence: 'inferred', if_no: 'x' }).table, 'high');
});

test('weigh: Evidence moves one level, Fan-out raises one from three, a hard trigger makes it high', () => {
  const base = { target: 'FR-JOB-03', revert: UNDO.medium, if_no: 'x' };
  assert.equal(weigh({ ...base, evidence: 'FR-JOB-01 says it' }).weight, 'low');
  assert.equal(weigh({ ...base, evidence: '`apps/app/src/jobs.ts` does it' }).weight, 'low');
  assert.equal(weigh({ ...base, evidence: 'inferred from FR-JOB-01' }).weight, 'medium');
  assert.equal(weigh({ ...base, evidence: 'guess' }).weight, 'high');
  assert.equal(weigh({ ...base }).factors.evidence.why, 'no evidence written');
  assert.equal(weigh({ ...base, evidence: 'inferred' }, { dependents: 2 }).weight, 'medium');
  assert.equal(weigh({ ...base, evidence: 'inferred' }, { dependents: 3 }).weight, 'high');
  assert.equal(weigh({ ...base, evidence: 'inferred' }).factors.fanOut.why, 'fan-out unknown');
  const billing = weigh({ target: 'FR-JOB-03', revert: UNDO.low, evidence: 'FR-JOB-01', if_no: 'x', reason: 'The price shows with taxes' });
  assert.equal(billing.weight, 'high');
  assert.deepEqual(billing.triggers, ['billing']);
  assert.match(billing.says, /^high · touches billing · easy to undo \(copy\)/);
});

test('weigh: a one-word code span is a name, not a signal; a path is read word by word', () => {
  const view = weigh({ target: 'ARCH-22', reason: 'the `security` view has two matrices', revert: '`packages/reader/src/views/common.mjs`', evidence: 'ARCH-22', if_no: 'x' });
  assert.deepEqual(view.triggers, []);
  const path = weigh({ target: 'FR-BIL-01', revert: '`supabase/migrations/0007_billing.sql`', evidence: 'FR-BIL-02', if_no: 'x' });
  assert.deepEqual(path.triggers, ['billing']);
  assert.equal(path.factors.undo.why, 'hard to undo (migration)');
});

test('weigh: what is not written is named, and an empty revert reads as hard to undo', () => {
  const w = weigh({ target: 'FR-JOB-03' });
  assert.deepEqual(w.missing, ['revert', 'evidence', 'if_no']);
  assert.equal(w.factors.undo.why, 'no revert written');
  assert.equal(w.weight, 'high');
});

test('weighChange: heaviest first, the same target and reason as one decision, other types apart', () => {
  const delta = (id, type, target, reason, revert, evidence) => `---\ntitle: "${id} · t"\ndescription: d\nowner: K\nversion: "1.0"\nupdated: "2026-11-23"\n---\n\n# ${id} · Title ${id}\n\n| Field | Value |\n|---|---|\n| \`target\` | ${target} |\n| \`type\` | \`${type}\` |\n| \`reason\` | ${reason} |\n| \`revert\` | ${revert} |\n| \`evidence\` | ${evidence} |\n| \`if_no\` | x |\n`;
  const p = (id) => `spec/changes/CHG-040/deltas/${id}.md`;
  const model = readSpec({
    [p('DLT-0001')]: delta('DLT-0001', 'assumption', '`FR-JOB-03`', 'Copy', UNDO.low, 'FR-JOB-01'),
    [p('DLT-0002')]: delta('DLT-0002', 'assumption', '`FR-JOB-03`', 'copy', UNDO.low, 'guess'),
    [p('DLT-0003')]: delta('DLT-0003', 'deviation', '`ENT-04`', 'Kept the old column', UNDO.high, 'guess'),
    [p('DLT-0004')]: delta('DLT-0004', 'proposal', '`FR-JOB-04`', 'Better', UNDO.low, '—'),
  });
  const r = weighChange(model, 'CHG-040');
  assert.equal(r.found, true);
  assert.deepEqual(r.groups.map((g) => [g.weight, g.items.map((i) => i.id)]), [['high', ['DLT-0003']], ['medium', ['DLT-0002', 'DLT-0001']]]);
  assert.deepEqual(r.other.map((o) => [o.id, o.type]), [['DLT-0004', 'proposal']]);
  assert.equal(weighChange(model, 'CHG-041').found, false);
});
