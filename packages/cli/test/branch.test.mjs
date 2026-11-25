import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readDefinition, writeDefinition } from '@openpedd/reader';
import { cutChange, cutChild, cutEdit, findChange, renameChange } from '../src/branch.mjs';
import { readWorkspace } from '../src/workspace.mjs';
import { commitOn, repo, sh } from './helpers.mjs';

const base = {
  'spec/changes/CHG-003/definition.md': '---\nstatus: agreed\n---\n',
  'spec/changes/archive/CHG-005/report.md': '# done\n',
  'spec/history/history.jsonl': '{"path": "a.md", "change": "CHG-007"}\n',
};

test('pedd branch change: from the base, numbered past the base, its history and every branch', () => {
  const r = repo(base);
  const ws = readWorkspace(r.work);
  sh(r.work, 'push', '--quiet', 'origin', 'origin/dev:refs/heads/feat/other');
  commitOn(r, 'feat/other', { 'spec/changes/CHG-009/definition.md': '---\nstatus: draft\n---\n' });
  const out = cutChange(r.git, ws, { slug: 'Automations' });
  assert.equal(out.branch, 'feat/automations');
  assert.equal(out.id, 'CHG-010');
  assert.equal(out.from, 'dev');
  const sha = sh(r.work, 'rev-parse', 'origin/feat/automations');
  assert.equal(sh(r.work, 'rev-parse', `${sha}^`), sh(r.work, 'rev-parse', 'origin/dev'));
  assert.deepEqual(sh(r.work, 'diff', '--name-only', 'origin/dev', sha).split('\n'), ['spec/changes/CHG-010/definition.md']);
  const def = readDefinition(sh(r.work, 'show', `${sha}:spec/changes/CHG-010/definition.md`));
  assert.equal(def.status, 'draft');
  assert.equal(sh(r.work, 'rev-parse', '--abbrev-ref', 'feat/automations@{upstream}'), 'origin/feat/automations');
  assert.throws(() => cutChange(r.git, ws, { slug: 'automations' }), /already exists/);
});

test('pedd branch change: the prefix follows the track; a hotfix is cut from production', () => {
  const r = repo(base);
  const ws = readWorkspace(r.work);
  assert.equal(cutChange(r.git, ws, { slug: 'typo', track: 'fix' }).branch, 'fix/typo');
  const hot = cutChange(r.git, ws, { slug: 'login', track: 'hotfix' });
  assert.equal(hot.branch, 'hotfix/login');
  assert.equal(hot.from, 'main');
  assert.equal(hot.id, 'CHG-009');
  assert.throws(() => cutChange(r.git, ws, { slug: 'x', track: 'cover' }), /no branch prefix/);
});

test('pedd branch change: a clash on the number tries the next', () => {
  const r = repo(base);
  const ws = readWorkspace(r.work);
  // Another branch takes CHG-008 between our read and our push.
  const push = r.git.pushNew.bind(r.git);
  let once = true;
  r.git.pushNew = (commit, branch) => {
    if (once) { once = false; sh(r.work, 'push', '--quiet', 'origin', 'origin/dev:refs/heads/feat/rival'); commitOn(r, 'feat/rival', { 'spec/changes/CHG-008/definition.md': 'x' }); }
    return push(commit, branch);
  };
  const out = cutChange(r.git, ws, { slug: 'mine' });
  assert.equal(out.id, 'CHG-009');
  assert.deepEqual(out.clashed, ['CHG-008']);
  assert.equal(sh(r.work, 'ls-tree', '--name-only', 'origin/feat/mine', 'spec/changes/'), 'spec/changes/CHG-003\nspec/changes/CHG-009\nspec/changes/archive');
});

test('pedd branch design · architecture · implementation: from the change branch, found by its folder or its name', () => {
  const r = repo(base);
  const ws = readWorkspace(r.work);
  const c = cutChange(r.git, ws, { slug: 'automations' });
  const tip = sh(r.work, 'rev-parse', 'origin/feat/automations');
  assert.equal(cutChild(r.git, ws, { kind: 'design', change: c.id }).branch, 'design/automations');
  assert.equal(cutChild(r.git, ws, { kind: 'architecture', change: 'feat/automations' }).branch, 'arch/automations');
  const t = cutChild(r.git, ws, { kind: 'implementation', change: c.id });
  assert.equal(t.branch, 'impl/automations');
  for (const b of ['design/automations', 'arch/automations', 'impl/automations']) assert.equal(sh(r.work, 'rev-parse', `origin/${b}`), tip);
  assert.throws(() => cutChild(r.git, ws, { kind: 'design', change: c.id }), /already exists/);
  commitOn(r, 'impl/automations', { 'apps/a.js': '1' });
  const again = cutChild(r.git, ws, { kind: 'implementation', change: c.id });
  assert.equal(again.existed, true, 'one implementation branch per change: the second call returns it');
  assert.equal(again.commit, sh(r.work, 'rev-parse', 'origin/impl/automations'));
  assert.deepEqual(findChange(r.git, ws, c.id), { id: c.id, branch: 'feat/automations', kind: 'change', prefix: 'feat', slug: 'automations' });
  assert.throws(() => cutChild(r.git, ws, { kind: 'design', change: 'CHG-099' }), /no change branch/);
});

test('pedd branch edit: only for an agreed definition, numbered per change', () => {
  const r = repo(base);
  const ws = readWorkspace(r.work);
  const c = cutChange(r.git, ws, { slug: 'automations' });
  assert.throws(() => cutEdit(r.git, ws, { change: c.id }), /"draft", not agreed/);
  commitOn(r, 'feat/automations', { [`spec/changes/${c.id}/definition.md`]: writeDefinition({ status: 'agreed', agreed: { by: 'Ana', at: '2026-11-20T10:00' }, items: [] }) });
  assert.equal(cutEdit(r.git, ws, { change: c.id }).branch, `edit/${c.id}-1`);
  assert.equal(cutEdit(r.git, ws, { change: c.id }).branch, `edit/${c.id}-2`);
});

test('pedd branch rename: the track\'s prefix and the issue key, once, before any branch is cut from it', () => {
  const r = repo(base);
  const ws = readWorkspace(r.work);
  const c = cutChange(r.git, ws, { slug: 'automations' });
  const tip = sh(r.work, 'rev-parse', 'origin/feat/automations');
  const out = renameChange(r.git, ws, { change: c.id, track: 'story', key: 'REC-412' });
  assert.equal(out.branch, 'feat/rec-412-automations');
  assert.equal(sh(r.work, 'rev-parse', 'origin/feat/rec-412-automations'), tip);
  assert.equal(r.git.remoteSha('feat/automations'), null);
  assert.equal(renameChange(r.git, ws, { change: c.id, track: 'story', key: 'REC-412' }).renamed, false);
  const fix = renameChange(r.git, ws, { change: c.id, track: 'fix' });
  assert.equal(fix.branch, 'fix/rec-412-automations');
  cutChild(r.git, ws, { kind: 'design', change: c.id });
  assert.throws(() => renameChange(r.git, ws, { change: c.id, track: 'chore' }), /before the rename/);
});
