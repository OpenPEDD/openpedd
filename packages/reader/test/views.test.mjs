import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { KINDS, firstView, readSpec, renderViews, scopeView, toMermaid, viewData } from '../src/index.mjs';
import { readFiles } from '../src/files.mjs';
import { product } from './views-fixture.mjs';

const REPO = fileURLToPath(new URL('../../..', import.meta.url));
const build = (files, sources = {}) => viewData(readSpec(files), sources);
const kinds = (data, view) => data.loose.filter((l) => !view || l.view === view).map((l) => `${l.kind} ${l.id}`);

test('FR-VEW-01.AC1: the fourteen kinds, and nothing loose opens on context', () => {
  const d = build(product());
  assert.deepEqual(Object.keys(d.views), KINDS);
  assert.equal(d.format, 1);
  assert.equal(d.product, null);
  assert.deepEqual(d.loose, [], JSON.stringify(d.loose, null, 1));
  assert.equal(firstView(d), 'context');
  for (const k of ['decisions', 'entities', 'states', 'security', 'context', 'prd']) assert.equal(d.views[k].empty, null, k);
});

test('FR-VEW-01.AC2: a decision citing an ID defined nowhere opens on decisions, the decision marked loose', () => {
  const f = product();
  f['spec/decisions/DEC-01-posts-expire.md'] += 'It also changes `FR-JOB-09`.\n';
  const d = build(f);
  assert.equal(firstView(d), 'decisions');
  const l = d.loose.find((x) => x.kind === 'undefined-id');
  assert.equal(l.id, 'DEC-01');
  assert.equal(l.says, 'Posts close when filled');
  assert.match(l.message, /FR-JOB-09/);
  assert.equal(l.at, 'spec/decisions/DEC-01-posts-expire.md');
});

test('FR-VEW-02.AC1: a PRD scoped by its path shows only its use cases, flows and transitions', () => {
  const d = build(product());
  const v = scopeView(d.views.prd, 'modules/jobs/prd.md');
  assert.ok(v.nodes.length && v.nodes.every((n) => n.group === 'spec/modules/jobs/prd.md'));
  assert.ok(v.nodes.some((n) => n.id === 'jobs:F1') && v.nodes.some((n) => n.id === 'jobs:F2'));
  assert.ok(v.nodes.some((n) => n.id === 'ENT-01:closed'));
  assert.ok(!v.nodes.some((n) => n.id.startsWith('billing:')));
  assert.deepEqual(v.matrix.map((m) => m.id), ['spec/modules/jobs/prd.md']);
  // An ID that is a node: it and what it reaches within the depth.
  const one = scopeView(d.views.decisions, 'DEC-01', 1);
  assert.deepEqual(one.nodes.map((n) => n.id), ['DEC-01', 'FR-JOB-02', 'module:jobs']);
  assert.equal(scopeView(d.views.decisions, 'DEC-99').scope.found, false);
});

test('FR-VEW-03.AC1: every node and edge names the file and line it came from', () => {
  const files = product();
  const d = build(files);
  for (const [k, v] of Object.entries(d.views)) for (const x of [...v.nodes, ...v.edges]) {
    assert.ok(x.at && Number.isInteger(x.line) && x.line >= 1, `${k}: ${JSON.stringify(x)}`);
    const file = x.at.split('#')[0];
    assert.ok(file in files, `${k}: ${file}`);
    assert.ok(x.line <= files[file].split('\n').length, `${k}: ${file}:${x.line}`);
  }
});

test('FR-VEW-04.AC1: a new decision file is a new node, no other file edited', () => {
  const f = product();
  const before = build(f).views.decisions;
  f['spec/decisions/DEC-02-invoices.md'] = '---\ntitle: x\n---\n# DEC-02 · Invoices are monthly\n\n**Date:** 2026-11-22\n\nChanges `FR-BIL-01`.\n';
  const after = build(f).views.decisions;
  assert.ok(after.nodes.some((n) => n.id === 'DEC-02' && n.label === 'Invoices are monthly'));
  for (const n of before.nodes) assert.deepEqual(after.nodes.find((x) => x.id === n.id), n);
});

test('FR-VEW-05: a node is its item as written, its ID next to it, its file at its anchor', () => {
  const d = build(product());
  const e = d.views.entities.nodes.find((n) => n.id === 'ENT-01');
  assert.equal(e.label, 'Job Post');
  assert.equal(e.what, 'A role a company wants to fill, published for candidates.');
  assert.equal(e.at, 'spec/foundations/domain/job-post.md');
  assert.deepEqual(e.fields.map((x) => x.name), ['title', 'invoices']);
  const r = d.views.prd.nodes.find((n) => n.id === 'FR-JOB-01');
  assert.equal(r.at, 'spec/modules/jobs/prd.md#requirements');
  const sec = d.views.security.nodes.find((n) => n.id === 'SEC-01');
  assert.equal(sec.at, 'spec/foundations/security/README.md#sec-01-a-company-sees-only-its-own-posts');
});

test('FR-VEW-06.AC1: a view with no source is empty and names what fills it', () => {
  const d = build(product());
  assert.match(d.views.business.empty.artifact, /Business Map/);
  assert.match(d.views.business.empty.fill, /\/map --business/);
  for (const k of ['code', 'trace', 'changes']) assert.ok(d.views[k].empty, k);
  assert.deepEqual(d.views.business.nodes, []);
});

test('FR-VEW-08.AC1: an entity with states, as a stateDiagram-v2 in a mermaid block', () => {
  const d = build(product());
  const text = toMermaid(scopeView(d.views.states, 'ENT-01'), 'states');
  assert.match(text, /^```mermaid\nstateDiagram-v2\n/);
  assert.match(text, /\[\*\] --> n_ENT_01_draft/);
  assert.match(text, /n_ENT_01_draft --> n_ENT_01_published : The company publishes it · by company/);
  assert.match(toMermaid(d.views.entities, 'entities'), /erDiagram[\s\S]*n_ENT_01 \|\|--o\{ n_ENT_02 : "invoices \[\]"/);
  assert.match(toMermaid(d.views.security, 'security'), /\*\*Who does what\*\*\n\n\| \| company \| candidate \|/);
  assert.match(toMermaid(d.views.business, 'business'), /empty/);
});

test('NFR-VEW-01.AC1: the same files give the same views.json, in any order', () => {
  const f = product();
  const a = JSON.stringify(build(f));
  const b = JSON.stringify(build(Object.fromEntries(Object.entries(f).reverse())));
  assert.equal(a, b);
  assert.doesNotMatch(a, /20\d\d-\d\d-\d\dT/);
});

test('NFR-VEW-02.AC1: 500 documents build in under 5 seconds, and the page needs no network', () => {
  const f = product();
  for (let i = 1; i <= 120; i++) f[`spec/foundations/domain/e${i}.md`] = `---\ntitle: E${i}\n---\n# ENT-${100 + i} · Thing ${i}\n\n## Fields\n\n| Field | Type | What it holds |\n|---|---|---|\n| \`next\` | ENT-${101 + (i % 120)} | The next |\n`;
  for (let i = 1; i <= 120; i++) f[`spec/decisions/DEC-${100 + i}-d.md`] = `# DEC-${100 + i} · Decision ${i}\n\n**Date:** 2026-11-22\n\nChanges \`ENT-${100 + i}\` and \`FR-M${i % 9}A-01\`.\n`;
  for (let i = 1; i <= 260; i++) f[`spec/modules/m${i}/prd.md`] = `---\ntitle: m${i}\n---\n### F1 · Go\n\n| Step | Role | Does |\n|---|---|---|\n| 1 | company | Goes |\n\n| ID | Requirement | Reason | Roles | Criteria | Flows | Status |\n|---|---|---|---|---|---|---|\n| \`FR-M${i}A-01\` | It goes \`ENT-${100 + (i % 120) + 1}\` | x | company | \`AC1\` | F1 | \`draft\` |\n`;
  assert.ok(Object.keys(f).filter((p) => p.endsWith('.md')).length >= 500);
  const t = Date.now();
  const d = build(f);
  assert.ok(Date.now() - t < 5000, `${Date.now() - t} ms`);
  const html = renderViews(d);
  assert.doesNotMatch(html, /<(?:script|link|img)[^>]+(?:src|href)=["']?https?:/i);
  assert.match(html, /function mountViews\(/);
  assert.match(html, /function scopeView\(/);
  assert.ok(html.includes('"format":1'));
});

test('renderViews: options inlined, a </script> in the spec cannot close the page script', () => {
  const f = product();
  f['spec/decisions/DEC-01-posts-expire.md'] = f['spec/decisions/DEC-01-posts-expire.md'].replace('# DEC-01 · Posts close when filled', '# DEC-01 · Posts close </script><b>x</b>');
  const html = renderViews(build(f), { open: { kind: 'prd', id: 'modules/jobs/prd.md', depth: 2 }, sourceBase: 'https://example.com/blob/main/' });
  assert.ok(!html.includes('close </script>'));
  assert.ok(html.includes('"sourceBase":"https://example.com/blob/main/"'));
  assert.ok(html.includes('"kind":"prd"'));
});

test('decisions: supersedes, a status, and what is loose about them', () => {
  const f = product();
  f['spec/decisions/DEC-02-x.md'] = '# DEC-02 · Posts close after 30 days\n\n**Supersedes:** `DEC-01` · **Date:** 2026-11-23\n\nChanges `FR-JOB-02`.\n';
  f['spec/decisions/DEC-03-y.md'] = '# DEC-03 · A name\n\n**Supersedes:** `DEC-04` · **Date:** 2026-11-23\n\nOnly prose.\n';
  f['spec/decisions/DEC-04-z.md'] = '# DEC-04 · Another\n\n**Supersedes:** `DEC-03` · **Date:** 2026-11-23\n\nSee [jobs](../modules/jobs/prd.md).\n';
  f['spec/decisions/ADR-01-w.md'] = '# ADR-01 · Postgres\n\n**Status:** accepted · **Supersedes:** `ENT-02` · **Date:** 2026-11-23\n\nFor `ENT-01`.\n';
  const d = build(f);
  const v = d.views.decisions;
  assert.equal(v.nodes.find((n) => n.id === 'DEC-01').status, 'superseded');
  assert.equal(v.nodes.find((n) => n.id === 'ADR-01').status, 'accepted');
  assert.ok(v.edges.some((e) => e.from === 'DEC-02' && e.to === 'DEC-01' && e.type === 'supersedes'));
  assert.ok(v.edges.some((e) => e.from === 'DEC-04' && e.to === 'module:jobs'));
  assert.deepEqual(kinds(d, 'decisions').sort(), ['cites-nothing DEC-03', 'supersedes-loop DEC-03', 'supersedes-loop DEC-04', 'supersedes-unknown ADR-01'].sort());
});

test('entities and states: a relation, the modules that use it, and what is loose', () => {
  const f = product();
  f['spec/foundations/domain/tag.md'] = '# ENT-03 · Tag\n\n## Fields\n\n| Field | Type | What it holds |\n|---|---|---|\n| `name` | text | x |\n';
  f['spec/foundations/domain/job-post.md'] += '| `archived` | `gone` | Never | admin |\n';
  const d = build(f);
  assert.ok(d.views.entities.edges.some((e) => e.from === 'ENT-01' && e.to === 'ENT-02' && e.label === 'invoices []'));
  assert.ok(d.views.entities.edges.some((e) => e.from === 'module:jobs' && e.to === 'ENT-01' && e.type === 'used by'));
  assert.ok(d.views.entities.edges.some((e) => e.from === 'module:billing' && e.to === 'ENT-02'));
  assert.deepEqual(kinds(d, 'entities'), ['not-cited ENT-03']);
  assert.deepEqual(kinds(d, 'states'), ['missing-end ENT-01']);
  assert.equal(d.views.states.nodes.find((n) => n.id === 'ENT-01:draft').status, 'initial');
});

test('prd: what a PRD leaves loose', () => {
  const f = product();
  f['spec/modules/jobs/prd.md'] = f['spec/modules/jobs/prd.md']
    .replace('| `AC1` | F2 | `draft` |', '| | | `draft` |')
    .replace('| `ENT-01` | `published` | `closed` | F2 |', '| `ENT-01` | `closed` | `draft` | F2 |')
    .replace('| Publish a post | yes | no |\n\n## States', '| Publish a post | yes | no |\n| Delete a post | yes | no |\n\n## States')
    .replace('| Action | company | candidate |\n|---|---|---|\n| Publish', '| Action | company | admin |\n|---|---|---|\n| Publish')
    .replace('| F1.1 |', '| F1.7 |')
    .replace('| `FR-JOB-02.AC1` | A published post | It is filled | It is closed |\n', '');
  const d = build(f);
  assert.deepEqual(kinds(d, 'prd').sort(), ['missing-end Alternate · A draft saved', 'no-criterion FR-JOB-02', 'no-flow FR-JOB-02', 'unknown-action spec/modules/jobs/prd.md', 'unknown-role spec/modules/jobs/prd.md', 'unknown-transition ENT-01'].sort());
});

test('security: from the files workspace.yaml names, and a table nothing protects', () => {
  const d = build(product(), {
    workspace: { views: { security: { permissions: { path: 'perms.toml', format: 'toml' }, policies: { path: 'db', format: 'sql' } } } },
    files: new Map([
      ['perms.toml', '[company]\npublish = "yes"\npay = "own"\n\n[candidate]\napply = "yes"\n'],
      ['db/001.sql', 'create table job_posts (id int);\ncreate table invoices (id int);\nCREATE POLICY "posts_rls" ON public.job_posts TO company USING (true);\n'],
    ]),
  });
  const m = d.views.security.matrix.find((x) => x.id === 'permissions');
  assert.deepEqual(m.cols, ['candidate', 'company']);
  assert.deepEqual(m.rows, ['apply', 'pay', 'publish']);
  assert.deepEqual(m.cells, [['yes', 'no'], ['no', 'own'], ['no', 'yes']]);
  assert.ok(d.views.security.edges.some((e) => e.from === 'policy:posts_rls' && e.to === 'table:job_posts'));
  assert.deepEqual(kinds(d, 'security'), ['unprotected table:invoices']);
});

test('context: the system, its roles, its components and the services each talks to', () => {
  const d = build(product(), {
    workspace: { project: 'acme', components: [{ path: 'apps/app', modules: ['jobs'] }, { path: 'packages/ui', modules: [] }] },
    packages: { 'apps/app': { name: '@acme/app', dependencies: ['@acme/ui'] }, 'packages/ui': { name: '@acme/ui', dependencies: [] } },
    stack: [{ name: 'Next.js', kind: 'framework', component: 'apps/app', file: 'apps/app/package.json' }],
  });
  const v = d.views.context;
  assert.ok(v.nodes.some((n) => n.id === 'system:acme'));
  assert.ok(v.edges.some((e) => e.from === 'role:company' && e.to === 'system:acme'));
  assert.ok(v.edges.some((e) => e.from === 'component:apps/app' && e.to === 'component:packages/ui' && e.type === 'depends on'));
  assert.ok(v.edges.some((e) => e.from === 'component:apps/app' && e.to === 'INT-01' && e.label === 'Payments'));
  assert.deepEqual(v.nodes.find((n) => n.id === 'component:apps/app').stack, ['framework: Next.js']);
  assert.equal(d.product, 'acme');
});

test('code: the index, its symbols and the requirements anchored in it', () => {
  const d = build(product(), { workspace: { components: [{ path: 'apps/app', modules: ['jobs'] }] }, codeIndex: new Map([
    ['.pedd/code-index/README.md', '# Index\n'],
    ['.pedd/code-index/jobs.md', '# jobs\n\n## Where\n\nImports `app`.\n\n## IDs\n\n| ID | Files |\n|---|---|\n| `FR-JOB-01` | `apps/app/posts.ts` |\n| `FR-JOB-77` | `apps/app/x.ts` |\n'],
    ['.pedd/code-index/app.md', '# app\n\n## Symbols\n\n- `publishPost`\n- `closePost`\n'],
  ]) });
  const v = d.views.code;
  assert.ok(v.edges.some((e) => e.from === 'FR-JOB-01' && e.to === 'module:jobs' && e.label === 'apps/app/posts.ts'));
  assert.ok(v.edges.some((e) => e.from === 'module:jobs' && e.to === 'package:app' && e.type === 'imports'));
  assert.ok(v.edges.some((e) => e.from === 'package:app' && e.to === 'symbol:app:publishPost'));
  assert.ok(v.edges.some((e) => e.from === 'module:jobs' && e.to === 'package:app' && e.type === 'implemented by'));
  assert.deepEqual(kinds(d, 'code'), ['undefined-id module:jobs']);
});

test('business: roles × processes, marks, and the module that takes each', () => {
  const f = product();
  f['spec/foundations/business-map/as-is.md'] = '# As-is\n\n## Processes\n\n| PRC | Process | Roles |\n|---|---|---|\n| PRC-01 | Post a job | recruiter · manager |\n| PRC-02 | Invoice | finance |\n';
  f['spec/foundations/business-map/to-be.md'] = '# To-be\n\n## Processes\n\n| PRC | Mark | Module | Roles |\n|---|---|---|---|\n| PRC-01 | taken | jobs | recruiter |\n| PRC-02 | | ledger | finance |\n';
  const d = build(f);
  const v = d.views.business;
  assert.deepEqual(v.matrix.map((m) => m.id), ['as-is', 'to-be']);
  assert.deepEqual(v.matrix[0].cols, ['finance', 'manager', 'recruiter']);
  assert.ok(v.edges.some((e) => e.from === 'PRC-01' && e.to === 'module:jobs' && e.type === 'taken by'));
  assert.deepEqual(kinds(d, 'business').sort(), ['no-mark PRC-02', 'unknown-module PRC-02']);
});

test('trace: one chain per requirement, each link with its state and freshness', () => {
  const d = build(product(), {
    specGraph: { 'FR-JOB-01': { hash: 'abc' } },
    traceEvents: [
      { id: 'FR-JOB-01', kind: 'code', ref: '#4', from: null, to: 'open', file: '.pedd/trace/a.jsonl', line: 1 },
      { id: 'FR-JOB-01', kind: 'code', ref: '#4', from: 'open', to: 'merged', anchor: 'old', file: '.pedd/trace/a.jsonl', line: 2 },
      { id: 'FR-JOB-01', kind: 'test', ref: 'FR-JOB-01.AC1', to: 'green', anchor: 'abc', file: '.pedd/trace/a.jsonl', line: 3 },
      { id: 'FR-ZZZ-01', kind: 'code', ref: '#5', to: 'open', file: '.pedd/trace/a.jsonl', line: 4 },
    ],
  });
  const v = d.views.trace;
  const code = v.nodes.find((n) => n.id === 'FR-JOB-01:code:#4');
  assert.equal(code.status, 'merged');
  assert.equal(code.freshness, 'stale');
  assert.equal(v.nodes.find((n) => n.id === 'FR-JOB-01:test:FR-JOB-01.AC1').freshness, 'fresh');
  assert.deepEqual(v.edges.map((e) => `${e.from} → ${e.to}`), ['FR-JOB-01 → FR-JOB-01:code:#4', 'FR-JOB-01:code:#4 → FR-JOB-01:test:FR-JOB-01.AC1']);
  assert.deepEqual(kinds(d, 'trace'), ['undefined-id FR-ZZZ-01']);
});

test('changes: in flight on the base and on each branch, and where two overlap', () => {
  const delta = (n, target, op = 'MODIFIED') => `# DLT-${n} · x\n\n| Field | Value |\n|---|---|\n| \`target\` | \`${target}\` |\n| \`op\` | \`${op}\` |\n`;
  const f = product();
  f['spec/changes/CHG-002/definition.md'] = '---\nstatus: agreed\ntitle: Expiring posts\n---\n';
  f['spec/changes/CHG-002/deltas/DLT-0001.md'] = delta('0001', 'FR-JOB-02');
  f['spec/changes/CHG-002/deltas/DLT-0002.md'] = delta('0002', 'FR-JOB-03', 'ADDED');
  const d = build(f, { branches: [{ name: 'feat/invoices', changes: ['CHG-003'], files: { 'spec/changes/CHG-003/deltas/DLT-0003.md': delta('0003', 'FR-JOB-02'), 'spec/changes/CHG-003/deltas/DLT-0004.md': delta('0004', 'FR-NOP-01') } }] });
  const v = d.views.changes;
  assert.equal(v.nodes.find((n) => n.id === 'CHG-002').label, 'Expiring posts');
  assert.equal(v.nodes.find((n) => n.id === 'CHG-003').group, 'feat/invoices');
  assert.ok(v.edges.some((e) => e.from === 'CHG-002' && e.to === 'FR-JOB-03' && e.label === 'ADDED'));
  assert.ok(v.edges.some((e) => e.from === 'CHG-002' && e.to === 'CHG-003' && e.type === 'overlaps' && e.label === 'FR-JOB-02'));
  assert.deepEqual(kinds(d, 'changes'), ['undefined-id CHG-003']);
  assert.equal(d.loose.find((l) => l.view === 'changes').at, 'feat/invoices:spec/changes/CHG-003/deltas/DLT-0004.md');
});

test('an ID linked to another spec is defined there', () => {
  const f = product();
  f['spec/modules/README.md'] += '\nOne place ([`RULE-01`](https://github.com/openpedd/openpedd/blob/main/spec/foundations/rules/writing.md#rule-01)).\n';
  assert.deepEqual(build(f).loose, []);
});

test('this repository and the template build, and every loose item names its file and line', () => {
  for (const root of [REPO, `${REPO}template`]) {
    const d = viewData(readSpec(readFiles(root)));
    assert.deepEqual(Object.keys(d.views), KINDS);
    for (const l of d.loose) assert.ok(l.at && l.line >= 1 && l.says && l.message, JSON.stringify(l));
  }
});

test('FR-VEW-11.AC1: an ID with a reference\'s prefix is that reference\'s, never loose nor this spec\'s', () => {
  const f = product();
  f['spec/decisions/DEC-01-posts-expire.md'] += 'It builds on `openpedd:ENT-20` and `openpedd:DEC-01`.\n';
  const d = build(f);
  assert.deepEqual(d.loose, [], JSON.stringify(d.loose, null, 1));
  assert.ok(!d.views.decisions.edges.some((e) => e.from === 'DEC-01' && e.to === 'DEC-01'));
});

test('FR-VEW-12.AC1: a criterion written AC-<MOD>-nn, a row of the criteria table, proves its requirement', () => {
  const f = product();
  const p = 'spec/modules/jobs/prd.md';
  f[p] = f[p].replace('| company | `AC1` | F1 |', '| company | `AC-JOB-01` | F1 |').replace('| `FR-JOB-01.AC1` |', '| `AC-JOB-01` |');
  assert.match(f[p], /`AC-JOB-01` \| F1/);
  const d = build(f);
  assert.ok(!kinds(d, 'prd').includes('no-criterion FR-JOB-01'), JSON.stringify(kinds(d, 'prd')));
});

const fmx = (title) => `---\ntitle: ${title}\ndescription: ${title}\nowner: Ana\nversion: "1.0"\nupdated: "2026-11-23"\n---\n\n`;
const withBusiness = () => {
  const f = product();
  f['spec/foundations/business-map/as-is.md'] = `${fmx('Business Map · as-is')}## People

| Role | How many | Reports to | Does |
|---|---|---|---|
| Founder | 1 | — | Runs it |
| Seller | 1 | Founder | Sells |
| Product engineer | 2 | Founder | Builds |

## Processes

| ID | Process | Starts with | Roles | Tools | How often | Confirmed by |
|---|---|---|---|---|---|---|
| \`PRC-01\` | Ask for a change | The client wants something | Seller · Product engineer | WhatsApp | Weekly | Seller |

### PRC-01 · Ask for a change

| Step | Role | Does | Tool |
|---|---|---|---|
| 1 | Seller | Hears the request | WhatsApp |
| 2 | Product engineer | Writes it down | Linear |
| 3 | Seller | Confirms it with the client | WhatsApp |

| Flow | From | What changes | Ends in |
|---|---|---|---|
| Alternate · Not worth it | 2 | The engineer says no | Declined |

## Tools and spreadsheets

## Pains
`;
  f['spec/foundations/glossary.md'] = `${fmx('Glossary')}## Jobs

| Name | Is | Defined in |
|---|---|---|
| Job post | What a company publishes | [\`ENT-01\`](domain/job-post.md) |

## Names no longer used

| Old name | Now |
|---|---|
| Offer | Job post |
`;
  return f;
};

test('FR-VEW-10.AC1: the prd view has modules and PRDs as its first level, each PRD linked to its flows', () => {
  const d = build(product());
  const level1 = d.views.prd.nodes.filter((n) => n.level === 1);
  assert.deepEqual(level1.map((n) => n.id).sort(), ['module:billing', 'module:jobs', 'prd:spec/modules/billing/prd.md', 'prd:spec/modules/jobs/prd.md']);
  assert.ok(d.views.prd.edges.some((e) => e.from === 'prd:spec/modules/jobs/prd.md' && e.to === 'jobs:F1'));
  assert.deepEqual(level1.find((n) => n.id === 'prd:spec/modules/jobs/prd.md').requirements, ['2 draft']);
});

test('FR-VEW-13.AC1: the glossary lists each name with what it is, and its old names apart', () => {
  const d = build(withBusiness());
  const m = d.views.glossary.matrix;
  assert.deepEqual(m.map((x) => x.title), ['Jobs', 'Names no longer used']);
  assert.deepEqual(m[0].rows, ['Job post']);
  assert.deepEqual(m[0].cells[0], ['What a company publishes', 'ENT-01']);
  assert.deepEqual(kinds(d, 'glossary'), []);
  const f = withBusiness();
  f['spec/foundations/glossary.md'] = f['spec/foundations/glossary.md'].replace('[`ENT-01`](domain/job-post.md)', '[post](domain/post.md)');
  assert.deepEqual(kinds(build(f), 'glossary'), ['undefined-term Job post']);
});

test('FR-VEW-24.AC1: a name defined in an industry glossary links to it and is not loose', () => {
  const f = withBusiness();
  f['spec/foundations/glossary.md'] = f['spec/foundations/glossary.md'].replace('[`ENT-01`](domain/job-post.md)', '[industry](https://github.com/openpedd/openpedd/blob/main/industries/property-insurance-ar/glossary.md#la-plata)');
  assert.deepEqual(kinds(build(f), 'glossary'), []);
});

test('FR-VEW-14.AC1: the org view is the reporting tree, with each manager\'s span of control', () => {
  const d = build(withBusiness());
  const v = d.views.org;
  assert.ok(v.edges.some((e) => e.from === 'org:as-is:Seller' && e.to === 'org:as-is:Founder' && e.type === 'reports to'));
  assert.equal(v.nodes.find((n) => n.id === 'org:as-is:Founder').span, 2);
  const f = withBusiness();
  f['spec/foundations/business-map/as-is.md'] = f['spec/foundations/business-map/as-is.md'].replace('| Seller | 1 | Founder |', '| Seller | 1 | CEO |');
  assert.deepEqual(kinds(build(f), 'org'), ['unknown-role org:as-is:Seller']);
});

test('FR-VEW-15.AC1: an activity has one initial node, actions in lanes, a decision where an alternate leaves, and a final per ending', () => {
  const d = build(withBusiness());
  const v = d.views.activity;
  const of = (t) => v.nodes.filter((n) => n.type === t);
  assert.equal(of('initial').length, 1);
  assert.equal(of('initial')[0].label, 'The client wants something');
  assert.deepEqual(of('action').map((n) => n.lane), ['Seller', 'Product engineer', 'Seller']);
  assert.equal(of('decision').length, 1);
  assert.deepEqual(of('final').map((n) => n.label).sort(), ['Declined', 'Ends']);
  assert.ok(v.edges.some((e) => e.from === 'act:as-is:PRC-01:2' && e.to === 'act:as-is:PRC-01:decision-2'));
  assert.deepEqual(v.matrix[0].cols, ['Seller', 'Product engineer', 'Tool']);
  assert.deepEqual(kinds(d, 'activity'), []);
});

test('FR-VEW-22.AC1: an activity shows each object in its state, and a business use case an overview of its processes', () => {
  const f = withBusiness();
  const p = 'spec/foundations/business-map/as-is.md';
  f[p] = f[p]
    .replace('| Step | Role | Does | Tool |\n|---|---|---|---|\n| 1 | Seller | Hears the request | WhatsApp |\n| 2 | Product engineer | Writes it down | Linear |',
      '| Step | Role | Does | Tool | Object |\n|---|---|---|---|---|\n| 1 | Seller | Hears the request | WhatsApp | |\n| 2 | Product engineer | Writes it down | Linear | [`ENT-01`](../domain/job-post.md) · `draft` |')
    .replace('| 3 | Seller | Confirms it with the client | WhatsApp |', '| 3 | Seller | Confirms it with the client | WhatsApp | ENT-01 · published; ENT-09 · sent |')
    .replace('## Processes', '## Business use cases\n\n| BUC | Business use case | Kind | Business actor | Processes |\n|---|---|---|---|---|\n| `BUC-01` | Change the product | `core` | Client | `PRC-01` |\n\n## Processes');
  const d = build(f);
  const v = d.views.activity;
  const objects = v.nodes.filter((n) => n.type === 'object');
  assert.deepEqual(objects.map((n) => n.label), ['Job Post [draft]', 'Job Post [published]']);
  assert.ok(v.edges.some((e) => e.type === 'object-flow' && e.from === 'act:as-is:PRC-01:2' && e.to === objects[0].id));
  const macro = v.nodes.filter((n) => n.group === 'overview:BUC-01');
  assert.deepEqual(macro.map((n) => n.type).sort(), ['action', 'final', 'initial']);
  assert.equal(macro.find((n) => n.type === 'action').lane, undefined);
  assert.ok(v.edges.some((e) => e.type === 'detail' && e.from === 'act:overview:BUC-01:PRC-01' && e.to === 'act:as-is:PRC-01:start'));
  assert.deepEqual(kinds(d, 'activity'), ['unknown-entity PRC-01']);
  f[p] = f[p].replace('ENT-09 · sent', 'ENT-01 · archived');
  assert.deepEqual(kinds(build(f), 'activity'), ['unknown-state PRC-01']);
});

test('FR-VEW-16.AC1: use cases have actors, a boundary per module, «include» from a step naming a flow, and «extend» from an alternate', () => {
  const f = product();
  f['spec/modules/jobs/prd.md'] = f['spec/modules/jobs/prd.md'].replace('| 2 | company | Publishes it |', '| 2 | company | Publishes it, after billing F1 |');
  const d = build(f);
  const v = d.views['use-cases'];
  assert.ok(v.edges.some((e) => e.from === 'actor:company' && e.to === 'uc:jobs:F1' && e.type === 'uses'));
  assert.ok(v.edges.some((e) => e.from === 'uc:jobs:F1' && e.to === 'uc:billing:F1' && e.type === '«include»'));
  assert.ok(v.edges.some((e) => e.to === 'uc:jobs:F1' && e.type === '«extend»' && e.label === 'at F1.1'));
  assert.equal(v.nodes.find((n) => n.id === 'uc:jobs:F1').group, 'jobs');
});

test('FR-VEW-17.AC1: use cases export as usecase-beta', () => {
  const d = build(product());
  const md = toMermaid(d.views['use-cases'], 'use-cases');
  assert.match(md, /usecase-beta/);
  assert.match(md, /<<extend>>/);
});

test('FR-VEW-18.AC1: diffViews gives per kind what was added, changed and removed, and refuses two formats', async () => {
  const { diffViews } = await import('../src/views/diff.mjs');
  const a = build(product());
  const f = product();
  f['spec/decisions/DEC-02-posts-expire-later.md'] = '---\ntitle: DEC-02 · Posts expire after 60 days\ndescription: DEC-02 · Posts expire after 60 days\nowner: Ana\nversion: "1.0"\nupdated: "2026-11-23"\n---\n\n# DEC-02 · Posts expire after 60 days\n\nIt changes `FR-JOB-02`.\n';
  f['spec/foundations/domain/job-post.md'] = f['spec/foundations/domain/job-post.md'].replace('# ENT-01 · Job Post', '# ENT-01 · Job Offer');
  const b = build(f);
  const d = diffViews(a, b);
  assert.deepEqual(d.kinds.decisions.added, ['DEC-02']);
  assert.deepEqual(d.kinds.entities.changed, ['ENT-01']);
  assert.equal(d.kinds.states.count.added + d.kinds.states.count.changed + d.kinds.states.count.removed, 0);
  assert.deepEqual(d.kinds.security.changed, ['ENT-01'], 'a security rule cites the entity');
  assert.deepEqual(diffViews(b, a).kinds.decisions.removed.map((n) => n.id), ['DEC-02']);
  assert.throws(() => diffViews({ ...a, format: 0 }, b), /format/);
});

test('FR-VEW-20.AC1: a module listed unmapped exists, and an entity another document cites is not loose', () => {
  const entity = '---\ntitle: Stock\ndescription: x\n---\n\n# ENT-01 · Stock\n\nWhat is in a cold room.\n\n## Fields\n\n| Field | Type | What it holds |\n|---|---|---|\n| `qty` | number | How much |\n';
  const files = (listed) => ({
    'spec/modules/README.md': `---\ntitle: Modules\n---\n\n| Module | Code | PRDs |\n|---|---|---|\n${listed ? '| `stock` | `STK` | `unmapped` |\n' : ''}`,
    'spec/foundations/domain/stock.md': entity,
    'spec/decisions/DEC-01-one-stock.md': '---\ntitle: One stock\n---\n\n# DEC-01 · One stock\n\nOne stock for every company ([`ENT-01`](../foundations/domain/stock.md)).\n',
    'spec/foundations/business-map/to-be.md': '---\ntitle: To-be\n---\n\n## People\n\n| Role | How many | Reports to | Does |\n|---|---|---|---|\n| Worker | 1 | — | Counts |\n\n## Processes\n\n| ID | Process | Mark | Module | Roles |\n|---|---|---|---|---|\n| `PRC-01` | Count the stock | `taken` | `stock` | Worker |\n\n## Modules\n\n## Order\n',
  });
  const on = build(files(true));
  assert.deepEqual(kinds(on, 'business'), []);
  assert.deepEqual(kinds(on, 'entities'), []);
  const off = build(files(false));
  assert.deepEqual(kinds(off, 'business'), ['unknown-module PRC-01']);
  assert.deepEqual(kinds(off, 'entities'), ['not-cited ENT-01']);
});

test('FR-VEW-21.AC1: business use cases inside the business boundary with their actors, each realized by its processes', () => {
  const f = product();
  f['spec/foundations/business-map/as-is.md'] = '# As-is\n\n## Business use cases\n\n| BUC | Business use case | Kind | Business actor | Processes |\n|---|---|---|---|---|\n| `BUC-01` | Sell by the box | core | Market customer | `PRC-01` |\n| `BUC-02` | Know the day\'s result | management | — | `PRC-02` |\n| `BUC-03` | Supply a supermarket | core | — | `PRC-09` |\n\n## Processes\n\n| PRC | Process | Roles |\n|---|---|---|\n| PRC-01 | Sell | seller |\n| PRC-02 | Close the day | owner |\n| PRC-03 | Count the stock | worker |\n';
  const d = build(f);
  const u = d.views['use-cases'];
  assert.ok(u.nodes.some((n) => n.id === 'bactor:Market customer' && n.type === 'actor'));
  assert.equal(u.nodes.find((n) => n.id === 'buc:BUC-01').group, 'the business');
  assert.match(u.nodes.find((n) => n.id === 'buc:BUC-02').label, /management/);
  assert.ok(u.edges.some((e) => e.from === 'bactor:Market customer' && e.to === 'buc:BUC-01'));
  const b = d.views.business;
  assert.ok(b.edges.some((e) => e.from === 'BUC-01' && e.to === 'PRC-01' && e.type === 'realized by'));
  assert.ok(b.edges.some((e) => e.from === 'BUC-02' && e.to === 'PRC-02'));
  assert.deepEqual(kinds(d, 'business').sort(), ['no-business-actor BUC-03', 'no-use-case PRC-03', 'undefined-id BUC-03']);
  assert.ok(!kinds(d).some((k) => /BUC-0[12]$/.test(k)));
});

test('FR-VEW-23.AC1: «include» and «extend» between business use cases, the condition on the extend', () => {
  const f = product();
  f['spec/foundations/business-map/as-is.md'] = '# As-is\n\n## Business use cases\n\n| BUC | Business use case | Kind | Business actor | Processes | Includes | Extends |\n|---|---|---|---|---|---|---|\n| `BUC-01` | Sell by the box | core | Market customer | `PRC-01` | `BUC-02` | — |\n| `BUC-02` | Weigh the box | supporting | — | `PRC-02` | — | — |\n| `BUC-03` | Sell on credit | core | Market customer | `PRC-03` | — | `BUC-01` · when the customer has an account |\n| `BUC-04` | Return a box | core | Market customer | `PRC-04` | `BUC-09` | — |\n\n## Processes\n\n| PRC | Process | Roles |\n|---|---|---|\n| PRC-01 | Sell | seller |\n| PRC-02 | Weigh | seller |\n| PRC-03 | Credit | seller |\n| PRC-04 | Return | seller |\n';
  const d = build(f);
  const u = d.views['use-cases'];
  assert.ok(u.edges.some((e) => e.from === 'buc:BUC-01' && e.to === 'buc:BUC-02' && e.type === '«include»'));
  const ext = u.edges.find((e) => e.from === 'buc:BUC-03' && e.to === 'buc:BUC-01');
  assert.equal(ext.type, '«extend»');
  assert.equal(ext.label, 'when the customer has an account');
  assert.ok(kinds(d, 'use-cases').includes('missing-end buc:BUC-04'));
});
