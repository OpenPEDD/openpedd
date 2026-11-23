// activity: a UML activity diagram per business process (MKT-13): one initial node at `Starts with`,
// each step an action in its role's partition, a decision where an alternate leaves, and one final node
// per way the process ends; the partitions as a table of lanes (FR-VEW-15).
import { clean, loose, view } from './common.mjs';
import { prep } from './prep.mjs';

const roleList = (s) => clean(s).split(/\s*(?:·|,|;|\/)\s*/).filter(Boolean);

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
  if (!withSteps.length) return { view: view({ sources: [dir], empty: { artifact: 'steps of a business process', fill: '`/map --business`: under each `### PRC-nn · <name>`, a table `Step` · `Role` · `Does` · `Tool`' } }), loose: [] };
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
  return { view: view({ sources: [...new Set(withSteps.map((x) => x.file.path))], nodes, edges, matrix }), loose: out };
}
