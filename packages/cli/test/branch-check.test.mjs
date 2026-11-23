import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeDefinition } from '@openpedd/reader';
import { cutChange, cutChild, cutEdit } from '../src/branch.mjs';
import { checkBranch } from '../src/branch-check.mjs';
import { readWorkspace } from '../src/workspace.mjs';
import { commitOn, repo, sh } from './helpers.mjs';

function setup() {
  const r = repo({ 'spec/history/history.jsonl': '' });
  const ws = readWorkspace(r.work);
  const c = cutChange(r.git, ws, { slug: 'automations' });
  return { r, ws, c, check: (head, target) => checkBranch(r.git, ws, { head, target, commit: `origin/${head}` }) };
}

test('branch check: each kind into its target passes', () => {
  const { r, ws, c, check } = setup();
  cutChild(r.git, ws, { kind: 'task', change: c.id, task: 'triggers' });
  cutChild(r.git, ws, { kind: 'design', change: c.id });
  commitOn(r, 'task/automations-triggers', { 'apps/a.js': '1' });
  commitOn(r, 'design/automations', { 'apps/screen.js': '1' });
  assert.equal(check('feat/automations', 'dev').ok, true);
  assert.equal(check('task/automations-triggers', 'feat/automations').ok, true);
  assert.equal(check('design/automations', 'feat/automations').ok, true);
  const hot = cutChange(r.git, ws, { slug: 'login', track: 'hotfix' });
  assert.equal(check(hot.branch, 'main').ok, true);
});

test('branch check: a name that is no work branch fails, with the command that fixes it', () => {
  const { r, check } = setup();
  sh(r.work, 'push', '--quiet', 'origin', 'origin/dev:refs/heads/build/pedd-cli');
  const out = check('build/pedd-cli', 'dev');
  assert.equal(out.ok, false);
  assert.match(out.problems[0], /not named as a work branch/);
  assert.match(out.fix, /^pedd branch change <slug>/);
});

test('branch check: the wrong target fails', () => {
  const { r, ws, c, check } = setup();
  cutChild(r.git, ws, { kind: 'task', change: c.id, task: 'triggers' });
  const toBase = check('task/automations-triggers', 'dev');
  assert.equal(toBase.ok, false);
  assert.match(toBase.problems[0], /merges into its change branch, feat\/automations; this PR targets dev/);
  assert.equal(toBase.fix, 'retarget the PR to feat/automations');
  const other = cutChange(r.git, ws, { slug: 'billing' });
  assert.equal(check(other.branch, 'feat/automations').ok, false);
});

test('branch check: a change cut from another change fails; both are named, git cannot tell which', () => {
  const { r, check } = setup();
  commitOn(r, 'feat/automations', { 'apps/x.js': '1' });
  sh(r.work, 'push', '--quiet', 'origin', 'origin/feat/automations:refs/heads/feat/billing');
  commitOn(r, 'feat/billing', { 'apps/y.js': '1' });
  const out = check('feat/billing', 'dev');
  assert.equal(out.ok, false);
  assert.match(out.problems[0], /shares 2 commit\(s\) with feat\/automations that dev does not have/);
  assert.match(out.fix, /^pedd branch change/);
  assert.match(check('feat/automations', 'dev').problems[0], /with feat\/billing/);
});

test('branch check: a change branch holding two new changes was cut from another', () => {
  const { r, check } = setup();
  commitOn(r, 'feat/automations', { 'spec/changes/CHG-002/definition.md': 'x' });
  const out = check('feat/automations', 'dev');
  assert.equal(out.ok, false);
  assert.match(out.problems[0], /holds 2 new changes \(CHG-001, CHG-002\)/);
});

test('branch check: the change is not held against its own task branches', () => {
  const { r, ws, c, check } = setup();
  cutChild(r.git, ws, { kind: 'task', change: c.id, task: 'triggers' });
  commitOn(r, 'feat/automations', { 'apps/x.js': '1' });
  sh(r.work, 'push', '--quiet', '--force', 'origin', 'origin/feat/automations:refs/heads/task/automations-triggers');
  commitOn(r, 'task/automations-triggers', { 'apps/a.js': '1' });
  assert.equal(check('feat/automations', 'dev').ok, true);
  assert.equal(check('task/automations-triggers', 'feat/automations').ok, true);
});

test('branch check: a task cut from a sibling task fails', () => {
  const { r, ws, c, check } = setup();
  cutChild(r.git, ws, { kind: 'task', change: c.id, task: 'triggers' });
  commitOn(r, 'task/automations-triggers', { 'apps/a.js': '1' });
  sh(r.work, 'push', '--quiet', 'origin', 'origin/task/automations-triggers:refs/heads/task/automations-actions');
  const out = check('task/automations-actions', 'feat/automations');
  assert.equal(out.ok, false);
  assert.match(out.problems[0], /with task\/automations-triggers/);
  assert.equal(out.fix, 'pedd branch task feat/automations <task>');
});

test('branch check: an edit branch goes to the change holding its folder, and holds only the definition', () => {
  const { r, ws, c, check } = setup();
  commitOn(r, 'feat/automations', { [`spec/changes/${c.id}/definition.md`]: writeDefinition({ status: 'agreed', items: [] }) });
  const e = cutEdit(r.git, ws, { change: c.id });
  commitOn(r, e.branch, { [`spec/changes/${c.id}/definition.md`]: writeDefinition({ status: 'agreed', items: [{ item: 'Main flow', state: 'answered', words: 'Pay' }] }) });
  assert.equal(check(e.branch, 'feat/automations').ok, true);
  commitOn(r, e.branch, { 'apps/z.js': '1' });
  const out = check(e.branch, 'feat/automations');
  assert.equal(out.ok, false);
  assert.match(out.problems[0], /changes only spec\/changes\/CHG-001\/definition.md; it also changes apps\/z.js/);
  assert.equal(check(e.branch, 'dev').ok, false);
});
