// business: roles × business processes, as-is and to-be, each process with its mark and the module
// that takes it; from the `Business Map` (map, business mode).
import { clean, loose, readDoc, view } from './common.mjs';
import { prep } from './prep.mjs';

const roleList = (s) => clean(s).split(/\s*(?:·|,|;|\/)\s*/).filter(Boolean);

export function build(model, sources) {
  const c = prep(model, sources);
  const bm = model.businessMap;
  const dir = `${c.root}/foundations/business-map/`;
  if (!bm) return { view: view({ sources: [dir], empty: { artifact: 'Business Map', fill: '`/map --business` draws it: `as-is.md` and `to-be.md`' } }), loose: [] };

  const files = { asIs: bm.asIs && readDoc(bm.asIs.path, c.byPath.get(bm.asIs.path)?.text), toBe: bm.toBe && readDoc(bm.toBe.path, c.byPath.get(bm.toBe.path)?.text) };
  const lineIn = (doc, id) => (doc ? Math.max(1, doc.lines.findIndex((l) => l.includes(id)) + 1) : 1);
  const nodes = [], edges = [], out = [], matrix = [];
  // A module the index lists as `unmapped` exists: it waits for its PRD (RULE-30, FR-VEW-20).
  const known = new Set([...c.modules.keys(), ...c.unmapped.keys(), ...[...c.modules.values(), ...c.unmapped.values()].map((m) => m.code).filter(Boolean)]);

  for (const [side, file] of [['as-is', bm.asIs], ['to-be', bm.toBe]]) {
    if (!file) continue;
    const doc = side === 'as-is' ? files.asIs : files.toBe;
    const procs = file.processes;
    const roles = [...new Set(procs.flatMap((p) => roleList(p.fields.roles ?? p.fields.role ?? '')))].sort();
    if (procs.length) matrix.push({ id: side, title: side === 'as-is' ? 'How it works today' : 'How it will work', group: side, rows: procs.map((p) => p.id), cols: roles, cells: procs.map((p) => roles.map((r) => (roleList(p.fields.roles ?? p.fields.role ?? '').includes(r) ? (side === 'to-be' ? p.mark || 'runs' : 'runs') : ''))), at: file.path, line: 1 });
    for (const r of roles) nodes.push({ id: `role:${r}`, type: 'role', label: r, group: 'roles', at: file.path, line: 1 });
    for (const p of procs) for (const r of roleList(p.fields.roles ?? p.fields.role ?? '')) edges.push({ from: `role:${r}`, to: p.id, type: side === 'as-is' ? 'runs' : 'will run', at: file.path, line: lineIn(doc, p.id) });
  }
  for (const p of bm.processes) {
    const doc = p.asIs ? files.asIs : files.toBe;
    const path = p.asIs ? bm.asIs.path : bm.toBe.path;
    nodes.push({ id: p.id, type: 'prc', label: p.name || p.id, status: p.mark ?? (bm.toBe ? 'unmarked' : null) ?? undefined, group: p.module || 'processes', at: path, line: lineIn(doc, p.id) });
    if (!bm.toBe) continue;
    const tline = lineIn(files.toBe, p.id);
    if (!p.mark) out.push(loose('business', 'no-mark', { id: p.id, says: p.name || p.id, path: bm.toBe.path, line: tline, message: 'the to-be gives it no mark: `kept`, `changed` or `taken`' }));
    if (p.module) {
      const m = clean(p.module);
      if (!known.has(m)) out.push(loose('business', 'unknown-module', { id: p.id, says: p.name || p.id, path: bm.toBe.path, line: tline, message: `taken by \`${m}\`, a module that does not exist` }));
      nodes.push({ id: `module:${m}`, type: 'module', label: m, group: m, at: c.modules.get(m)?.prds[0] ?? bm.toBe.path, line: 1 });
      edges.push({ from: p.id, to: `module:${m}`, type: 'taken by', at: bm.toBe.path, line: tline });
    }
  }
  return { view: view({ sources: [dir], nodes, edges, matrix }), loose: out };
}
