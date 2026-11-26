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

## Rules and regulations

| Rule | Comes from | Processes | Entities |
|---|---|---|---|
| A post closes after 30 days | Company policy | \`PRC-01\` | \`ENT-01\` |
| Every invoice carries the tax ID | Tax office | \`PRC-09\` | \`ENT-02\` |
`;

test('FR-VEW-28.AC1: each business rule with where it comes from, the processes and entities it governs', () => {
  const f = { ...product(), 'spec/foundations/business-map/as-is.md': asIs };
  f['spec/foundations/rules/business.md'] = `${fm('Business rules')}# Business rules\n\n## RULE-01 · A filled post closes at once\n\nIt applies to \`PRC-01\` and \`ENT-01\`.\n`;
  const d = viewData(readSpec(f));
  const v = d.views.rules;
  const rules = v.nodes.filter((n) => n.type === 'rule').map((n) => n.label);
  assert.deepEqual(rules.sort(), ['A filled post closes at once', 'A post closes after 30 days', 'Every invoice carries the tax ID']);
  const first = v.nodes.find((n) => n.label === 'A post closes after 30 days');
  assert.equal(first.comes_from, 'Company policy');
  assert.equal(first.line, 21);
  assert.ok(v.edges.some((e) => e.from === first.id && e.to === 'PRC-01' && e.type === 'governs'));
  assert.ok(v.edges.some((e) => e.from === first.id && e.to === 'ENT-01' && e.type === 'constrains'));
  assert.ok(v.edges.some((e) => e.from === 'RULE-01' && e.to === 'ENT-01'));
  assert.deepEqual(v.matrix[0].cols, ['Comes from', 'Processes', 'Entities']);
  assert.equal(v.matrix[0].cells[0][1], 'PRC-01 · Post a job');
  assert.deepEqual(d.loose.filter((l) => l.view === 'rules').map((l) => `${l.kind} ${l.says}`), ['unknown-process Every invoice carries the tax ID']);
});

test('FR-VEW-28.AC1: with no rules, the view is empty and names where they go', () => {
  const v = viewData(readSpec(product())).views.rules;
  assert.match(v.empty.fill, /Rules and regulations/);
});
