import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BRANCH_DEFAULTS, parseYaml, readWorkspace } from '../src/workspace.mjs';

const REPO = fileURLToPath(new URL('../../..', import.meta.url));

test('parseYaml: blocks, lists, flow maps and comments', () => {
  const y = parseYaml(`project: x   # the name
mode: mono
tools: {}
references: []
components:
  - { path: apps/app, modules: [] }
  - { path: "packages/ui", modules: [a, b] }
stages:
  architect:
    mode: guided
branches:
  base: dev
  change: "{prefix}/{slug}" # by track
environments:
  - { name: production, branch: main, public: true }
budgets:
  modules: 4000
`);
  assert.equal(y.project, 'x');
  assert.deepEqual(y.tools, {});
  assert.deepEqual(y.references, []);
  assert.deepEqual(y.components, [{ path: 'apps/app', modules: [] }, { path: 'packages/ui', modules: ['a', 'b'] }]);
  assert.equal(y.stages.architect.mode, 'guided');
  assert.equal(y.branches.change, '{prefix}/{slug}');
  assert.equal(y.environments[0].public, true);
  assert.equal(y.budgets.modules, 4000);
});

test('readWorkspace: the template fills every branch name from its file and the defaults', () => {
  const ws = readWorkspace(`${REPO}template`);
  assert.deepEqual(ws.branches, BRANCH_DEFAULTS);
  assert.equal(ws.production, 'main');
  assert.equal(ws.spec, 'spec');
  assert.equal(parseYaml(readFileSync(`${REPO}template/workspace.yaml`, 'utf8')).locales[0], 'en');
});

test('readWorkspace: this repository lands on main, its spec in spec/', () => {
  const ws = readWorkspace(REPO);
  assert.equal(ws.branches.base, 'main');
  assert.equal(ws.spec, 'spec');
});
