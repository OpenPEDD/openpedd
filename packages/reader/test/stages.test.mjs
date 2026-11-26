import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readSpec, readStages, toMermaid, viewData } from '../src/index.mjs';
import { product } from './views-fixture.mjs';

const fm = (title) => `---\ntitle: ${title}\ndescription: ${title}\nowner: Ana\nversion: "1.0"\nupdated: "2026-11-24"\n---\n\n`;
const stagesOf = (f) => readStages(readSpec(f));
const pieces = (s) => Object.fromEntries(s.items.map((p) => [p.key, p.state]));
const INDUSTRY = 'https://github.com/openpedd/openpedd/blob/main/industries/staffing-ar/glossary.md#roles';

/** A product whose diagnosis and project are whole: the as-is, the to-be, the business context, the roadmap. */
const mapped = () => {
  const f = product();
  f['spec/foundations/glossary.md'] = `${fm('Glossary')}## Jobs

| Name | Is | Defined in |
|---|---|---|
| Recruiter | Who fills a role | [industria](${INDUSTRY}) |
| Job post | What a company publishes | [\`ENT-01\`](domain/job-post.md) |
`;
  f['spec/foundations/business-map/as-is.md'] = `${fm('Business Map · as-is')}## People

| Role | How many | Reports to | Does |
|---|---|---|---|
| Founder | 1 | — | Runs it |
| Recruiter | 2 | Founder | Fills roles |

## Business use cases

| BUC | Business use case | Kind | Business actor | Processes |
|---|---|---|---|---|
| \`BUC-01\` | Fill a role | core | Company | \`PRC-01\` |

## Processes

| ID | Process | Starts with | Roles | Tools | How often | Confirmed by |
|---|---|---|---|---|---|---|
| \`PRC-01\` | Post a job | A company calls | Recruiter | Sheets | 10 a month | Recruiter |

### PRC-01 · Post a job

| Step | Role | Does | Tool |
|---|---|---|---|
| 1 | Recruiter | Writes the post | Sheets |

## Tools and spreadsheets

| Tool | Holds | Written by | Processes |
|---|---|---|---|
| Sheets | The posts | Recruiter | \`PRC-01\` |

## Documents

| Document | Comes in from · goes out to | Processes | How many |
|---|---|---|---|
| Job brief | Company | \`PRC-01\` | 10 a month |

## Rules and regulations

| Rule | Comes from | Processes |
|---|---|---|
| A post names the salary | Labor law | \`PRC-01\` |

## Pains

| Pain | Said by | Process |
|---|---|---|
| "We lose posts in the sheet" | Recruiter | \`PRC-01\` |
`;
  f['spec/foundations/business-map/to-be.md'] = `${fm('Business Map · to-be')}## People

| Role | Change |
|---|---|
| Recruiter | kept |

## Processes

| PRC | Mark | Module | Roles |
|---|---|---|---|
| \`PRC-01\` | taken | jobs | Recruiter |

## Modules

| Module | Takes | Removes |
|---|---|---|
| billing | — | — |
| jobs | \`PRC-01\` | Lost posts |

## Order

1. jobs: it removes the pain
2. billing
`;
  f['spec/foundations/business/product.md'] = `${fm('Business Context')}## Goal\n\nFill roles faster.\n\n## North-star metric\n\nDays to fill.\n\n## Out of scope\n\nPayroll.\n`;
  f['spec/foundations/architecture/system.md'] = `${fm('System architecture')}# ARCH-01 · The system

A web app, an API and Postgres; each role sees its rows.
`;
  f['spec/open/roadmap.md'] = `${fm('Roadmap')}| # | Step | Leaves |\n|---|---|---|\n| 1 | jobs | The posts in the app |\n`;
  return f;
};

const approve = (f, rows) => { f['spec/foundations/business/stages.md'] = `${fm('Stages')}| Stage | Approved by | On | Notes |\n|---|---|---|---|\n${rows.join('\n')}\n`; return f; };

test('FR-VEW-25.AC1: a spec with no business map stands at stage 0, and what is next is the industry', () => {
  const f = product();
  delete f['spec/modules/jobs/prd.md'];
  delete f['spec/modules/billing/prd.md'];
  const s = stagesOf(f);
  assert.equal(s.current, 0);
  assert.deepEqual(s.stages.map((x) => x.state), ['not started', 'in progress', 'in progress', 'not started', 'not started']);
  assert.match(s.stages[0].next, /industries\//);
  assert.equal(s.stages[0].items[0].state, 'missing');
});

test('FR-VEW-25.AC2: a whole diagnosis approved in stages.md is approved; stage 0 needs no approval; the next stage is current', () => {
  const s = stagesOf(approve(mapped(), ['| 1 · Diagnosis | Ana, the owner | 2026-11-20 | In the call |']));
  assert.equal(s.stages[0].state, 'done');
  assert.ok(s.stages[0].complete);
  assert.deepEqual(pieces(s.stages[1]), { people: 'done', 'business-use-cases': 'done', processes: 'done', confirmed: 'done', tools: 'done', documents: 'done', rules: 'done', pains: 'done', glossary: 'done', entities: 'done', linked: 'done' });
  assert.equal(s.stages[1].state, 'approved');
  assert.deepEqual(s.stages[1].approval, { by: 'Ana, the owner', on: '2026-11-20', notes: 'In the call', line: 11 });
  assert.equal(s.stages[2].state, 'done');
  assert.equal(s.current, 2);
  assert.match(s.stages[2].next, /The client approves the project/);
});

test('FR-VEW-25.AC3: a piece missing keeps its stage in progress, names where it goes, and an earlier approval does not count', () => {
  const f = approve(mapped(), ['| Diagnosis | Ana | 2026-11-20 | |']);
  const p = 'spec/foundations/business-map/as-is.md';
  f[p] = f[p].replace(/## Documents[\s\S]*?## Rules/, '## Rules').replace('| Recruiter | Sheets | 10 a month | Recruiter |', '| Recruiter | Sheets | 10 a month | — |');
  const s = stagesOf(f);
  assert.equal(s.stages[1].state, 'in progress');
  assert.equal(pieces(s.stages[1]).documents, 'missing');
  assert.equal(pieces(s.stages[1]).confirmed, 'partial');
  assert.deepEqual(s.stages[1].items.find((x) => x.key === 'confirmed').detail, ['PRC-01']);
  assert.match(s.stages[1].next, /Confirmed by/);
  assert.equal(s.current, 1);
  const v = viewData(readSpec(f)).views.stages;
  assert.equal(v.nodes.find((n) => n.id === 'stage:1').status, 'in progress');
  assert.equal(v.nodes.find((n) => n.id === 'stage:1').current, true);
});

test('FR-VEW-25.AC4: stages 3 and 4 read each module\'s status, in the to-be\'s order', () => {
  const f = approve(mapped(), ['| 1 | Ana | 2026-11-20 | |', '| 2 | Ana | 2026-11-21 | |']);
  let s = stagesOf(f);
  assert.deepEqual(s.stages[3].items.map((x) => `${x.label} ${x.state}`), ['jobs done', 'billing done']);
  assert.equal(s.stages[3].state, 'done');
  assert.match(s.stages[3].next, /approves the PRD of `jobs`/);
  assert.equal(s.current, 3);
  f['spec/modules/jobs/prd.md'] = f['spec/modules/jobs/prd.md'].replaceAll('| `draft` |', '| `live` |');
  f['spec/modules/billing/prd.md'] = f['spec/modules/billing/prd.md'].replaceAll('| `draft` |', '| `in_review` |');
  s = stagesOf(f);
  assert.equal(s.stages[3].state, 'approved');
  assert.deepEqual(pieces(s.stages[4]), { 'module:jobs': 'approved', 'module:billing': 'done' });
  assert.equal(s.stages[4].state, 'done');
  assert.match(s.stages[4].next, /accepts `billing`/);
});

test('FR-VEW-25.AC5: a module the index lists unmapped is a PRD still to write', () => {
  const f = mapped();
  f['spec/modules/README.md'] += '| reports | `REP` | unmapped |\n';
  const s = stagesOf(f);
  const r = s.stages[3].items.find((x) => x.key === 'module:reports');
  assert.equal(r.state, 'missing');
  assert.match(r.next, /Write the PRD of `reports`/);
});

test('FR-VEW-25.AC6: an approval of a stage that does not exist is loose; the view exports a table', () => {
  const d = viewData(readSpec(approve(mapped(), ['| Discovery | Ana | 2026-11-20 | |'])));
  assert.deepEqual(d.loose.filter((l) => l.view === 'stages').map((l) => l.kind), ['unknown-stage']);
  assert.match(toMermaid(d.views.stages, 'stages'), /\*\*The stages\*\*/);
});
