import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readSpec, viewData } from '../src/index.mjs';
import { product } from './views-fixture.mjs';

const fm = (t) => `---\ntitle: ${t}\ndescription: ${t}\nowner: Kevin\nversion: "1.0"\nupdated: "2026-11-26"\n---\n\n`;
const asIs = `${fm('Business Map · as-is')}# As-is

## Processes

| PRC | Process | Starts with | Roles | Tools | How often | Confirmed by |
|---|---|---|---|---|---|---|
| \`PRC-01\` | Post a job | A new opening | Recruiter | Email | weekly | Ana |
`;
const stories = `${fm('User stories')}# User stories

## \`jobs\` · Posting jobs

| Story | As | I want | So that | Said | Source | Process |
|---|---|---|---|---|---|---|
| \`US-01\` | Recruiter | To post a job in one step | Not to copy it to three boards | *"I paste it three times"* | Call 2026-11-20 L40 | \`PRC-01\` |
| \`US-02\` | Recruiter | To close a filled post | No one applies late | — | Call 2026-11-20 L52 | \`PRC-07\` |

## \`payroll\` · Paying

| Story | As | I want | So that | Said | Source | Process |
|---|---|---|---|---|---|---|
| \`US-03\` | Founder | To see what is owed | Collect on time | — | Call 2026-11-21 L9 | — |
`;

test('FR-VEW-29.AC1: the stories by module, in order, each with who asked and where; a wrong process or module loose', () => {
  const f = { ...product(), 'spec/foundations/business-map/as-is.md': asIs, 'spec/foundations/business-map/stories.md': stories };
  const d = viewData(readSpec(f));
  const v = d.views.stories;
  const us = v.nodes.filter((n) => n.type === 'us');
  assert.deepEqual(us.map((n) => n.id), ['US-01', 'US-02', 'US-03']);
  const one = us[0];
  assert.equal(one.label, 'To post a job in one step');
  assert.equal(one.as, 'Recruiter');
  assert.equal(one.group, 'jobs');
  assert.equal(one.order, 1);
  assert.ok(v.edges.some((e) => e.from === 'module:jobs' && e.to === 'US-01'));
  assert.ok(v.edges.some((e) => e.from === 'US-01' && e.to === 'PRC-01'));
  assert.deepEqual(v.matrix.map((m) => m.title), ['jobs · Posting jobs', 'payroll · Paying']);
  const loose = d.loose.filter((l) => l.view === 'stories').map((l) => `${l.kind} ${l.id}`).sort();
  assert.deepEqual(loose, ['undefined-id US-02', 'unknown-module module:payroll', 'unknown-process US-02']);
  assert.ok(!d.loose.some((l) => l.kind === 'undefined-id' && /US-0/.test(l.message)));
});

test('FR-VEW-29.AC1: with no stories, the view is empty and names the file', () => {
  assert.match(viewData(readSpec(product())).views.stories.empty.fill, /stories\.md/);
});
