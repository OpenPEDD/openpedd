import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatName, parseName, slugify } from '../src/names.mjs';
import { BRANCH_DEFAULTS as B } from '../src/workspace.mjs';

test('formatName: each kind from its pattern; an invalid slug is refused', () => {
  assert.equal(formatName(B.change, { prefix: 'feat', slug: 'automations' }), 'feat/automations');
  assert.equal(formatName(B.implementation, { slug: 'automations' }), 'impl/automations');
  assert.equal(formatName(B.edit, { change: 'CHG-031', n: 1 }), 'edit/CHG-031-1');
  assert.throws(() => formatName(B.change, { prefix: 'feat', slug: 'Bad Slug' }), /not a valid/);
  assert.throws(() => formatName(B.design, {}), /needs \{slug\}/);
});

test('parseName: what each branch is; a task short branch is none', () => {
  assert.deepEqual(parseName('feat/rec-412-automations', B), { kind: 'change', prefix: 'feat', slug: 'rec-412-automations' });
  assert.deepEqual(parseName('hotfix/login', B), { kind: 'hotfix', slug: 'login' });
  assert.deepEqual(parseName('arch/automations', B), { kind: 'architecture', slug: 'automations' });
  assert.deepEqual(parseName('edit/CHG-031-2', B), { kind: 'edit', change: 'CHG-031', n: '2' });
  assert.deepEqual(parseName('impl/job-posts', B), { kind: 'implementation', slug: 'job-posts' });
  assert.equal(parseName('impl/job-posts--1-2', B), null);
  assert.equal(parseName('task/job-posts-list-view', B), null);
  assert.equal(parseName('build/pedd-cli', B), null);
  assert.equal(parseName('feat/Automations', B), null);
});

test('slugify', () => {
  assert.equal(slugify('  Automatización de Jobs! '), 'automatizacion-de-jobs');
});
