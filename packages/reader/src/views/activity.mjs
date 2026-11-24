// activity: a UML activity diagram per business process (MKT-14): one initial node at `Starts with`,
// each step an action in its role's partition, a decision where an alternate leaves, and one final node
// per way the process ends; the partitions as a table of lanes (FR-VEW-15). As RUP draws a business
// use-case realization: an object node per business entity a step leaves in a state (`Object`), and one
// overview activity per business use case, its processes as macro activities (FR-VEW-22).
import { clean, loose, view } from './common.mjs';
import { prep } from './prep.mjs';

const roleList = (s) => clean(s).split(/\s*(?:·|,|;|\/)\s*/).filter(Boolean);

/** The objects of a step's `Object` cell: `ENT-nn · state`, several separated by `;`. */
export function objectsOf(cell) {
  return String(cell ?? '').split(';').map((part) => {
    const id = part.match(/\bENT-\d+\b/)?.[0];
    if (!id) return null;
    const after = part.slice(part.indexOf(id) + id.length).replace(/\]\([^)]*\)/g, '').replace(/[`\]\[*]/g, '');
    const state = after.includes('·') ? after.slice(after.indexOf('·') + 1).trim() : '';
    return { id, state: state || null };
  }).filter(Boolean);
}

export function build(model, sources) {
  const c = prep(model, sources);
  const bm = model.businessMap;
  const dir = `${c.root}/foundations/business-map/`;
  const withSteps = [];
  for (const [side, f] of [['as-is', bm?.asIs], ['to-be', bm?.toBe]]) {
    for (const p of f?.processes ?? []) {
      const steps = p.tables.find((t) => t.header.some((h) => /^step$/i.test(h)) && t.header.some((h) => /^does$/i.test(h)));
      if (!steps) continue;
      const row = f.processes.find((x) => x.id === p.id && !x.tables.length);
      withSteps.push({ side, file: f, p, row, steps, alts: p.tables.find((t) => t.header.some((h) => /^flow$/i.test(h)) && t.header.some((h) => /^from$/i.test(h))) });
    }
  }
  const overviews = (bm?.useCases ?? []).filter((u) => u.processes.length);
  if (!withSteps.length && !overviews.length) return { view: view({ sources: [dir], empty: { artifact: 'steps of a business process', fill: '`/map --business`: under each `### PRC-nn · <name>`, a table `Step` · `Role` · `Does` · `Tool`' } }), loose: [] };
  const nodes = [], edges = [], matrix = [], out = [];
  for (const { side, file, p, row, steps, alts } of withSteps) {
    const g = `${side}:${p.id}`;
    const id = (x) => `act:${g}:${x}`;
    const lineOf = (needle) => Math.max(1, file.headings.find((h) => h.text.includes(p.id))?.line ?? 1);
    const roles = new Set(roleList(row?.fields.roles ?? p.fields.roles ?? ''));
    const rows = steps.rows.filter((r) => clean(r.step));
    nodes.push({ id: id('start'), type: 'initial', label: clean(row?.fields.starts_with ?? '') || `${p.name} starts`, group: g, at: file.path, line: lineOf() });
    rows.forEach((r, i) => {
      const role = clean(r.role ?? '');
      nodes.push({ id: id(clean(r.step)), type: 'action', label: clean(r.does), lane: role || undefined, tool: clean(r.tool ?? '') || undefined, group: g, at: file.path, line: lineOf() });
      if (roles.size && role && !roleList(role).every((x) => roles.has(x))) out.push(loose('activity', 'unknown-role', { id: p.id, says: p.name, path: file.path, line: lineOf(), message: `step ${clean(r.step)} is run by \`${role}\`, not among the process's roles` }));
      objectsOf(r.object).forEach((o, k) => {
        const e = c.entities.get(o.id);
        if (!e) { out.push(loose('activity', 'unknown-entity', { id: p.id, says: p.name, path: file.path, line: lineOf(), message: `step ${clean(r.step)} names \`${o.id}\`, an entity that does not exist` })); return; }
        if (o.state && !e.states.some((x) => x.name.replace(/`/g, '') === o.state)) out.push(loose('activity', 'unknown-state', { id: p.id, says: p.name, path: file.path, line: lineOf(), message: `step ${clean(r.step)} leaves ${e.name} \`${o.state}\`, a state ${o.id} does not have` }));
        const on = id(`obj-${clean(r.step)}-${k + 1}`);
        nodes.push({ id: on, type: 'object', label: o.state ? `${e.name} [${o.state}]` : e.name, entity: o.id, state: o.state ?? undefined, group: g, at: file.path, line: lineOf() });
        edges.push({ from: id(clean(r.step)), to: on, type: 'object-flow', at: file.path, line: lineOf() });
      });
    });
    const leaves = new Map();
    (alts?.rows ?? []).forEach((a, i) => {
      const from = clean(a.from ?? '').replace(/^.*\./, '');
      if (!rows.some((r) => clean(r.step) === from)) { out.push(loose('activity', 'missing-end', { id: p.id, says: p.name, path: file.path, line: lineOf(), message: `the alternate \`${clean(a.flow)}\` leaves from step \`${from}\`, which the process does not have` })); return; }
      (leaves.get(from) ?? leaves.set(from, []).get(from)).push({ a, n: i + 1 });
    });
    let prev = id('start');
    rows.forEach((r) => {
      const s = clean(r.step);
      edges.push({ from: prev, to: id(s), type: 'next', at: file.path, line: lineOf() });
      prev = id(s);
      const list = leaves.get(s);
      if (!list) return;
      const d = id(`decision-${s}`);
      nodes.push({ id: d, type: 'decision', label: '◇', group: g, at: file.path, line: lineOf() });
      edges.push({ from: prev, to: d, type: 'next', at: file.path, line: lineOf() });
      for (const { a, n } of list) {
        nodes.push({ id: id(`alt-${n}`), type: 'alternate', label: clean(a.what_changes ?? a.flow), group: g, at: file.path, line: lineOf() });
        nodes.push({ id: id(`end-${n}`), type: 'final', label: clean(a.ends_in ?? '') || 'Ends', group: g, at: file.path, line: lineOf() });
        edges.push({ from: d, to: id(`alt-${n}`), type: 'next', label: clean(a.flow), at: file.path, line: lineOf() });
        edges.push({ from: id(`alt-${n}`), to: id(`end-${n}`), type: 'next', at: file.path, line: lineOf() });
      }
      prev = d;
    });
    nodes.push({ id: id('end'), type: 'final', label: 'Ends', group: g, at: file.path, line: lineOf() });
    edges.push({ from: prev, to: id('end'), type: 'next', at: file.path, line: lineOf() });
    const lanes = [...new Set(rows.map((r) => clean(r.role ?? '')).filter(Boolean))];
    matrix.push({ id: g, title: `${p.id} · ${p.name} (${side})`, group: g, rows: rows.map((r) => clean(r.step)), cols: [...lanes, 'Tool'], cells: rows.map((r) => [...lanes.map((l) => (clean(r.role ?? '') === l ? clean(r.does) : '')), clean(r.tool ?? '')]), at: file.path, line: lineOf() });
  }
  // One overview per business use case: no partitions, its processes as macro activities, in the order listed.
  const asIs = bm?.asIs;
  for (const u of overviews) {
    const g = `overview:${u.id}`;
    const line = Math.max(1, asIs?.headings.find((h) => /business use cases/i.test(h.text))?.line ?? 1);
    const oid = (x) => `act:${g}:${x}`;
    nodes.push({ id: oid('start'), type: 'initial', label: `${u.name} starts`, group: g, at: asIs?.path, line });
    let prev = oid('start');
    for (const prc of u.processes) {
      const p = bm.processes.find((x) => x.id === prc);
      const detail = withSteps.find((x) => x.p.id === prc && x.side === 'as-is') ? `act:as-is:${prc}:start` : undefined;
      nodes.push({ id: oid(prc), type: 'action', label: `${prc} · ${p?.name ?? prc}`, macro: true, detail, group: g, at: asIs?.path, line });
      edges.push({ from: prev, to: oid(prc), type: 'next', at: asIs?.path, line });
      if (detail) edges.push({ from: oid(prc), to: detail, type: 'detail', at: asIs?.path, line });
      prev = oid(prc);
    }
    nodes.push({ id: oid('end'), type: 'final', label: 'Ends', group: g, at: asIs?.path, line });
    edges.push({ from: prev, to: oid('end'), type: 'next', at: asIs?.path, line });
  }
  const srcs = [...new Set([...withSteps.map((x) => x.file.path), ...(overviews.length && asIs ? [asIs.path] : [])])];
  return { view: view({ sources: srcs, nodes, edges, matrix }), loose: out };
}
