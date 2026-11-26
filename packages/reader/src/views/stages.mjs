// stages: the five stages of the work with a client (DEC-31), each read from the spec: its state, each
// piece present or missing with its file, what it delivers, who approves it, and what is next
// (FR-VEW-25). Nothing here is ticked by hand but the approvals of stages 1 and 2, in
// `foundations/business/stages.md`; stages 3 and 4 read each module's status.
import { leastAdvanced, REQUIREMENT_STATUSES } from '../spec.mjs';
import { clean, colOf, loose, rowsOf, view } from './common.mjs';
import { prep } from './prep.mjs';
import * as business from './business.mjs';
import * as org from './org.mjs';
import * as activity from './activity.mjs';
import * as useCases from './use-cases.mjs';
import * as glossary from './glossary.mjs';

/** The stages, in order (DEC-31). `approvedIn`: where its approval is recorded: `none`, `table` (stages.md) or `modules`. */
export const STAGES = [
  { n: 0, key: 'industry', name: 'Industry', names: ['industria'], delivers: 'The industry\'s glossary and its rules, researched before the first meeting', approver: 'Nobody: done is enough', approvedIn: 'none' },
  { n: 1, key: 'diagnosis', name: 'Diagnosis', names: ['diagnóstico', 'diagnostico'], delivers: 'How the business works today, and where it hurts: the as-is and the client\'s glossary', approver: 'The client', approvedIn: 'table' },
  { n: 2, key: 'project', name: 'Project', names: ['proyecto'], delivers: 'Where we go and what we build: the business context, the entities the system keeps, the to-be, roles and permissions, what the whole system shall be, the modules, the roadmap and its risks', approver: 'The client', approvedIn: 'table' },
  { n: 3, key: 'specification', name: 'Specification', names: ['especificación', 'especificacion'], delivers: 'One PRD per module, in the to-be\'s order, with its flows', approver: 'The client, per module, at spec-approval', approvedIn: 'modules' },
  { n: 4, key: 'construction', name: 'Construction', names: ['construcción', 'construccion'], delivers: 'Each module built and delivered', approver: 'The client, per module, at acceptance', approvedIn: 'modules' },
];
export const STAGE_STATES = ['not started', 'in progress', 'done', 'approved'];
export const PIECE_STATES = ['missing', 'partial', 'done', 'approved'];

const rank = (s) => REQUIREMENT_STATUSES.indexOf(s);
const has = (s) => !!clean(s) && !/^[—-]$/.test(clean(s));

/** The approvals table of `foundations/business/stages.md`: stage number → { by, on, notes, line }. */
function approvalsOf(c) {
  const path = `${c.root}/foundations/business/stages.md`;
  const doc = c.docOf.get(path);
  const out = new Map(), bad = [];
  const t = doc?.tables.find((x) => colOf(x.header, /^stage$/i) >= 0 && colOf(x.header, /^approved by$/i) >= 0);
  for (const r of rowsOf(t)) {
    const cell = clean(r.stage).toLowerCase();
    if (!cell) continue;
    const n = cell.match(/^(\d)\b/)?.[1];
    const s = n != null ? STAGES.find((x) => x.n === Number(n)) : STAGES.find((x) => [x.name.toLowerCase(), x.key, ...x.names].some((w) => cell.includes(w)));
    if (!s) { bad.push({ cell: clean(r.stage), line: r.line }); continue; }
    if (!has(r['approved by'])) continue;
    // The last row of a stage is in force; the earlier ones are its history (DEC-34).
    const before = out.get(s.n);
    out.set(s.n, { by: clean(r['approved by']), on: clean(r.on ?? '') || null, notes: clean(r.notes ?? '') || null, line: r.line, earlier: before ? [...before.earlier, { by: before.by, on: before.on, notes: before.notes }] : [] });
  }
  return { path, exists: !!doc, approvals: out, bad };
}

/** The modules, in the to-be's order when it names them, then as the index lists them. */
function modulesOf(c, model) {
  const ids = [...new Set([...model.modules.map((m) => m.id), ...(model.unmapped || []).map((m) => m.id)])];
  const tb = model.businessMap?.toBe;
  const text = JSON.stringify([...(tb?.order ?? []), ...(tb?.modules ?? [])]).toLowerCase();
  const at = (id) => { const i = text.indexOf(id.toLowerCase()); return i < 0 ? Infinity : i; };
  return ids.map((id, i) => ({ id, i })).sort((a, b) => at(a.id) - at(b.id) || a.i - b.i).map(({ id }) => {
    const m = c.modules.get(id);
    const prds = m ? model.prds.filter((p) => p.module === id) : [];
    const status = leastAdvanced(prds.map((p) => leastAdvanced(p.requirements.map((r) => r.status)) ?? p.status));
    const flows = prds.some((p) => c.docOf.get(p.path)?.headings.some((h) => /^F\d+\s+·/.test(h.text.replace(/`/g, ''))));
    const reqs = prds.some((p) => p.requirements.length);
    return { id, prd: prds[0]?.path ?? null, status, flows, reqs };
  });
}

/** One piece of a stage: what it is, its state, where it lives, what is missing in it, and what to do; a module done waits for the client. */
const piece = (key, label, state, { at, line = 1, detail = [], next, owner = 'team' }) => ({ key, label, state, at, line, detail, next: state === 'approved' || (state === 'done' && !key.startsWith('module:')) ? null : next, owner });

/** The line of a `## heading` in a document, or 1. */
const headingLine = (c, path, text) => c.docOf.get(path)?.headings.find((h) => h.text === text)?.line ?? 1;

/** The pieces of each stage, read from the spec. */
function piecesOf(model, sources, c) {
  const bm = model.businessMap;
  const dir = `${c.root}/foundations/business-map/`;
  const asIsPath = bm?.asIs?.path ?? `${dir}as-is.md`, toBePath = bm?.toBe?.path ?? `${dir}to-be.md`;
  const glossaryPath = `${c.root}/foundations/glossary.md`;
  const gdoc = c.docOf.get(glossaryPath);
  const gRows = (gdoc?.tables ?? []).filter((t) => colOf(t.header, /^old name$/i) < 0).flatMap((t) => t.rows);
  const industryLink = /\]\(https?:[^)]*\/industries\/[^)]*\)/i;
  const industryRow = gRows.find((r) => r.cells.some((x) => industryLink.test(x)));

  // Stage 0 · Industry
  const s0 = [piece('industry-glossary', 'Industry glossary, linked', industryRow ? 'done' : 'missing', { at: glossaryPath, line: industryRow?.line ?? 1, next: 'Research the industry\'s glossary and rules on the web into `industries/<industry>/`, and link it from the `Glossary`' })];

  // Stage 1 · Diagnosis: the as-is, section by section (map, business mode), and the glossary: the business today.
  const asIs = bm?.asIs;
  const section = (key, label, heading, rows, next) => {
    const state = !asIs || asIs.missing.includes(heading) || !rows.length ? 'missing' : 'done';
    return piece(key, label, state, { at: asIsPath, line: asIs ? headingLine(c, asIsPath, heading) : 1, next });
  };
  const procs = [...new Map((asIs?.processes ?? []).map((p) => [p.id, { id: p.id, fields: {}, tables: [] }])).values()];
  for (const p of asIs?.processes ?? []) { const q = procs.find((x) => x.id === p.id); Object.assign(q.fields, p.fields); q.tables.push(...p.tables); }
  const noSteps = procs.filter((p) => !p.tables.some((t) => t.header.some((h) => /^step$/i.test(h)))).map((p) => p.id);
  const unconfirmed = procs.filter((p) => !has(p.fields.confirmed_by)).map((p) => p.id);
  // What the business views find loose in the map and the glossary (RULE-27): the map does not hold together yet.
  const inMap = (l) => l.at.startsWith(dir) || l.at === glossaryPath;
  const mapLoose = [business, org, activity, useCases, glossary].flatMap((b) => b.build(model, sources).loose).filter(inMap);
  const s1 = [
    section('people', 'People and the organization chart', 'People', asIs?.people.filter((p) => has(p.role)) ?? [], 'Map the roles: a `People` table `Role` · `How many` · `Reports to` · `Does`'),
    section('business-use-cases', 'Business use cases', 'Business use cases', bm?.useCases ?? [], 'List what the business does and for whom: `Business use cases`, with `Includes` and `Extends`'),
    piece('processes', 'Processes, step by step', !procs.length ? 'missing' : noSteps.length ? 'partial' : 'done', { at: asIsPath, line: headingLine(c, asIsPath, 'Processes'), detail: noSteps, next: procs.length ? 'Write the steps of each process: `### PRC-nn` with `Step` · `Role` · `Does` · `Tool`' : 'List the processes, then the steps of each' }),
    piece('confirmed', 'Each process confirmed', !procs.length ? 'missing' : unconfirmed.length ? 'partial' : 'done', { at: asIsPath, line: headingLine(c, asIsPath, 'Processes'), detail: unconfirmed, next: 'Confirm each process with the role that runs it, in `Confirmed by`', owner: 'client' }),
    section('tools', 'Tools and spreadsheets', 'Tools and spreadsheets', asIs?.tools ?? [], 'List the tools and spreadsheets: what each holds, who writes it, which processes use it'),
    section('documents', 'Documents in and out', 'Documents', asIs?.documents ?? [], 'List the documents that come in and go out: `Document` · `Comes in from · goes out to` · `Processes` · `How many`'),
    section('rules', 'Rules and regulations', 'Rules and regulations', asIs?.rules ?? [], 'List the rules it must follow: `Rule` · `Comes from` · `Processes`'),
    section('pains', 'Pains', 'Pains', asIs?.pains ?? [], 'Write down what hurts, in the client\'s words, with who said it and its process'),
    piece('glossary', 'The client\'s glossary', gRows.some((r) => !industryLink.test(r.cells.join(' '))) ? 'done' : 'missing', { at: glossaryPath, next: 'Write the client\'s own words in the `Glossary`, linking the industry\'s' }),
    piece('linked', 'The map holds together', asIs && !mapLoose.length ? 'done' : asIs ? 'partial' : 'missing', { at: mapLoose[0]?.at ?? asIsPath, line: mapLoose[0]?.line ?? 1, detail: [...new Set(mapLoose.map((l) => l.id))], next: 'Link what is loose in the map: `pedd view business`' }),
  ];

  // Stage 2 · Project: what the system keeps (the entities, as the to-be handles them), then the to-be cut into modules.
  const bizDir = `${c.root}/foundations/business/`;
  const bizDocs = c.docs.filter((d) => d.path.startsWith(bizDir) && !/\/(README|stages)\.md$/.test(d.path));
  const bizText = bizDocs.map((d) => d.text.replace(/^---[\s\S]*?\n---/, '')).join('\n');
  const want = [['goal', /\b(goal|objective|objetivo|problem|problema)\b/i], ['metric', /\b(metric|north[- ]star|métrica|metrica)\b/i], ['left out', /(out of scope|left out|queda afuera|fuera de(l)? alcance)/i]];
  const bizMissing = want.filter(([, re]) => !re.test(bizText)).map(([k]) => k);
  const tb = bm?.toBe;
  const unmarked = (bm?.processes ?? []).filter((p) => p.asIs && !p.mark).map((p) => p.id);
  const mods = modulesOf(c, model);
  const roles = c.foundation('Roles & Permissions');
  const archDocs = [...c.docOf.values()].filter((d) => d.path.startsWith(`${c.root}/foundations/architecture/`) && !/README.md$/i.test(d.path));
  const rolesRows = (roles?.tables ?? []).filter((t) => /^action$/i.test(clean(t.header[0]))).flatMap((t) => t.rows);
  const quality = c.foundation('Quality Standards');
  const nfrs = (quality?.tables ?? []).filter((t) => /^nfr$/i.test(clean(t.header[0]))).flatMap((t) => t.rows).filter((r) => /^NFR-[A-Z]+-\d+$/.test(clean(r.cells[0])));
  const risksPath = `${c.root}/open/risks.md`;
  const risks = (c.docOf.get(risksPath)?.tables ?? []).filter((t) => /^rsk$/i.test(clean(t.header[0]))).flatMap((t) => t.rows).filter((r) => /^RSK-\d+$/.test(clean(r.cells[0])));
  const roadmapPath = `${c.root}/open/roadmap.md`;
  const roadmapRows = (c.docOf.get(roadmapPath)?.tables ?? []).flatMap((t) => t.rows).filter((r) => r.cells.some((x) => clean(x)));
  const s2 = [
    piece('business-context', 'Business context: goal, metric, what is left out', !bizDocs.length ? 'missing' : bizMissing.length ? 'partial' : 'done', { at: bizDocs[0]?.path ?? bizDir, detail: bizDocs.length ? bizMissing : [], next: 'Write the goal, the one metric that says it works, and what is left out, in `foundations/business/`', owner: 'client' }),
    piece('entities', 'Entities and their states', c.entities.size ? 'done' : 'missing', { at: `${c.root}/foundations/domain/`, next: 'Derive the entities the system keeps from what the processes and documents handle, each with its states' }),
    piece('to-be', 'To-be: every process marked', !tb ? 'missing' : !tb.processes.length || unmarked.length ? 'partial' : 'done', { at: toBePath, line: tb ? headingLine(c, toBePath, 'Processes') : 1, detail: unmarked, next: 'Mark each process in the to-be: `kept`, `changed` or `taken`, and the module that takes it' }),
    piece('modules', 'Modules', tb?.modules.length && mods.length ? 'done' : tb?.modules.length || mods.length ? 'partial' : 'missing', { at: tb?.modules.length ? toBePath : `${c.root}/modules/README.md`, line: tb ? headingLine(c, toBePath, 'Modules') : 1, next: 'List the modules in the to-be and in the modules index, each `unmapped` until its PRD' }),
    piece('order', 'The order they are built in', tb?.order.length ? 'done' : 'missing', { at: toBePath, line: tb ? headingLine(c, toBePath, 'Order') : 1, next: 'Write the order the modules are built in, and why, in the to-be' }),
    piece('roles', 'Roles and permissions', rolesRows.length ? 'done' : 'missing', { at: roles?.path ?? `${c.root}/foundations/`, next: 'Derive `Roles & Permissions` from the people: one column per role, one row per action' }),
    // ARCH-24 level 9: how the system is built and how each piece of data is protected, before any PRD.
    piece('architecture', 'System architecture: context, containers and how data is protected', archDocs.length ? 'done' : 'missing', { at: archDocs[0]?.path ?? `${c.root}/foundations/architecture/`, next: 'Write the system architecture in `foundations/architecture/`: the system in context, its containers, how roles and permissions are enforced, one ADR per decision' }),
    piece('quality', 'The system\'s qualities', nfrs.length ? 'done' : 'missing', { at: quality?.path ?? `${c.root}/foundations/`, next: 'Write what the whole system shall be in `Quality Standards`: a table `NFR` (`NFR-SYS-nn`) · `Quality` · `The system shall` · `Measured by`' }),
    piece('roadmap', 'Roadmap', roadmapRows.length ? 'done' : 'missing', { at: roadmapPath, next: 'Write the roadmap from the to-be\'s order: one step per delivery' }),
    piece('risks', 'Risks and assumptions', risks.length ? 'done' : 'missing', { at: risksPath, next: 'List what may stop the project in `open/risks.md`: each risk, assumption or dependency with its probability, impact, owner and response' }),
  ];

  // Stage 3 · Specification and 4 · Construction: one piece per module, from its PRD's status.
  const s3 = mods.map((m) => {
    const state = !m.prd ? 'missing' : rank(m.status) >= rank('specified') ? 'approved' : m.flows && m.reqs ? 'done' : 'partial';
    return piece(`module:${m.id}`, m.id, state, { at: m.prd ?? `${c.root}/modules/README.md`, detail: m.status ? [m.status] : [], next: state === 'done' ? `The client approves the PRD of \`${m.id}\` at spec-approval` : `Write the PRD of \`${m.id}\`: its flows, requirements and criteria (\`/specify\`)`, owner: state === 'done' ? 'client' : 'team' });
  });
  const s4 = mods.map((m) => {
    const r = rank(m.status);
    const state = !m.prd || r < rank('building') ? 'missing' : r >= rank('accepted') ? 'approved' : r >= rank('in_review') ? 'done' : 'partial';
    return piece(`module:${m.id}`, m.id, state, { at: m.prd ?? `${c.root}/modules/README.md`, detail: m.status ? [m.status] : [], next: state === 'done' ? `The client accepts \`${m.id}\`` : `Build \`${m.id}\``, owner: state === 'done' ? 'client' : 'team' });
  });
  return [s0, s1, s2, s3, s4];
}

/**
 * The stages of a spec (DEC-31): each with its state, its pieces, what it delivers, who approves it and
 * what is next; `current`, the first stage not finished (approved, or done when it needs no approval).
 */
export function readStages(model, sources = {}) {
  const c = prep(model, sources);
  const { path, approvals, bad } = approvalsOf(c);
  const pieces = piecesOf(model, sources, c);
  const stages = STAGES.map((s, i) => {
    const items = pieces[i];
    const finished = (p) => p.state === 'done' || p.state === 'approved';
    const done = items.length > 0 && items.every(finished);
    const approval = s.approvedIn === 'table' ? approvals.get(s.n) ?? null : null;
    const approved = done && (s.approvedIn === 'table' ? !!approval : s.approvedIn === 'modules' ? items.every((p) => p.state === 'approved') : false);
    const state = approved ? 'approved' : done ? 'done' : items.some((p) => p.state !== 'missing') ? 'in progress' : 'not started';
    const complete = approved || (done && s.approvedIn === 'none');
    const open = items.find((p) => p.next);
    const next = complete ? null : open ? open.next : !items.length ? 'List the modules in the project first: each is a PRD here and a delivery in construction' : s.approvedIn === 'table' ? `The client approves the ${s.name.toLowerCase()}: a row in \`foundations/business/stages.md\`` : null;
    return { ...s, state, complete, items, approval, next, progress: { done: items.filter(finished).length, of: items.length } };
  });
  const current = stages.find((s) => !s.complete)?.n ?? null;
  return { current, approvalsAt: path, stages, bad };
}

export function build(model, sources) {
  const c = prep(model, sources);
  const { current, approvalsAt, stages, bad } = readStages(model, sources);
  const nodes = [], edges = [];
  for (const s of stages) {
    const id = `stage:${s.n}`;
    nodes.push({
      id, type: 'stage', label: `${s.n} · ${s.name}`, status: s.state, group: 'stages', at: s.approvedIn === 'table' ? approvalsAt : s.items[0]?.at ?? approvalsAt, line: s.approval?.line ?? 1,
      key: s.key, delivers: s.delivers, approver: s.approver, approved_by: s.approval?.by, approved_on: s.approval?.on ?? undefined, notes: s.approval?.notes ?? undefined, earlier: s.approval?.earlier.length ? s.approval.earlier : undefined,
      next: s.next ?? undefined, progress: `${s.progress.done} of ${s.progress.of}`, current: s.n === current || undefined,
    });
    if (s.n > 0) edges.push({ from: `stage:${s.n - 1}`, to: id, type: 'then', at: approvalsAt, line: 1 });
    for (const p of s.items) {
      nodes.push({ id: `${id}:${p.key}`, type: 'piece', label: p.label, status: p.state, group: `${s.n} · ${s.name}`, at: p.at, line: p.line, stage: s.n, key: p.key, detail: p.detail.length ? p.detail : undefined, next: p.next ?? undefined, owner: p.owner });
      edges.push({ from: id, to: `${id}:${p.key}`, type: 'needs', at: p.at, line: p.line });
    }
  }
  const matrix = [{
    id: 'stages', title: 'The stages', group: 'stages', at: approvalsAt, line: 1,
    rows: stages.map((s) => `${s.n} · ${s.name}`), cols: ['State', 'Pieces', 'Next', 'Delivers', 'Approved by'],
    cells: stages.map((s) => [s.state, `${s.progress.done} of ${s.progress.of}`, s.next ?? '—', s.delivers, s.approval ? `${s.approval.by}${s.approval.on ? `, ${s.approval.on}` : ''}` : s.approver]),
  }];
  // A piece not written yet has no file: it names where it goes instead (FR-VEW-25).
  const exists = (p) => c.byPath.has(String(p).split('#')[0]);
  for (const x of [...nodes, ...edges]) if (!exists(x.at)) { x.where = x.at; delete x.at; delete x.line; }
  const out = bad.map((b) => loose('stages', 'unknown-stage', { id: b.cell, says: b.cell, path: approvalsAt, line: b.line, message: `an approval of \`${b.cell}\`, a stage that does not exist: 0 to 4, or its name` }));
  return { view: view({ sources: [approvalsAt, `${c.root}/foundations/`, `${c.root}/modules/`], nodes, edges, matrix }), loose: out };
}
