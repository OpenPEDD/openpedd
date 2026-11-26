// stories: the client's user stories (MKT-15), as Connextra writes them and a story map orders them: one
// section per module of the to-be, its stories in the order they are built, each with who asked, in their
// words, and where. From `foundations/business-map/stories.md` (FR-VEW-29).
import { at, clean, isId, loose, view } from './common.mjs';
import { prep } from './prep.mjs';

const keyOf = (h) => clean(h).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_|_$/g, '');
const PRC = /\bPRC-\d+\b/g;

export function build(model, sources) {
  const c = prep(model, sources);
  const path = `${c.root}/foundations/business-map/stories.md`;
  const doc = c.docOf.get(path);
  const tables = (doc?.tables ?? []).filter((t) => /^(story|us)$/i.test(clean(t.header[0])));
  if (!tables.length) return { view: view({ sources: [path], empty: { artifact: 'User stories of the Business Map', fill: '`stories.md`, a section per module with a table `Story` · `As` · `I want` · `So that` · `Said` · `Source` · `Process`' } }), loose: [] };

  const processes = new Map((model.businessMap?.processes ?? []).map((p) => [p.id, p.name || p.id]));
  const known = new Set([...(model.businessMap?.toBe?.modules ?? []).map((m) => clean(m.module ?? '')), ...c.modules.keys(), ...c.unmapped.keys()].filter(Boolean));
  const nodes = [], edges = [], out = [], matrix = [];
  tables.forEach((t, ti) => {
    const heading = clean(t.section?.text ?? '');
    const module = clean(heading.split(/\s+·\s+/)[0]).split(/[\s,]+/)[0] || null;
    const mid = module ? `module:${module}` : null;
    if (mid) {
      nodes.push({ id: mid, type: 'module', label: heading || module, group: 'modules', at: at(path, t.section?.anchor ?? null), line: t.section?.line ?? t.line, order: ti + 1 });
      if (!known.has(module)) out.push(loose('stories', 'unknown-module', { id: mid, says: heading, path, line: t.section?.line ?? t.line, message: `\`${module}\` is not a module of the to-be` }));
    }
    const keys = t.header.map(keyOf);
    const rows = [];
    t.rows.forEach((r, ri) => {
      const row = Object.fromEntries(keys.map((k, i) => [k, r.cells[i] ?? '']));
      const id = clean(r.cells[0]);
      if (!isId(id)) return;
      const want = clean(row.i_want ?? '');
      nodes.push({ id, type: 'us', label: want || id, group: module ?? 'stories', at: at(path, t.section?.anchor ?? null), line: r.line, as: clean(row.as ?? '') || undefined, so_that: clean(row.so_that ?? '') || undefined, said: clean(row.said ?? '') || undefined, source: clean(row.source ?? '') || undefined, order: ri + 1 });
      if (mid) edges.push({ from: mid, to: id, type: 'holds', at: path, line: r.line });
      for (const p of new Set(clean(row.process ?? row.processes ?? '').match(PRC) ?? [])) {
        if (!processes.has(p)) { out.push(loose('stories', 'unknown-process', { id, says: want, path, line: r.line, message: `names \`${p}\`, a process the Business Map does not have` })); continue; }
        nodes.push({ id: p, type: 'prc', label: processes.get(p), group: 'processes', at: model.businessMap?.asIs?.path ?? path, line: 1 });
        edges.push({ from: id, to: p, type: 'in', at: path, line: r.line });
      }
      rows.push([id, clean(row.as ?? ''), want, clean(row.so_that ?? ''), clean(row.source ?? '')]);
    });
    matrix.push({ id: `stories:${ti + 1}`, title: heading || 'Stories', group: module ?? 'stories', rows: rows.map((x) => x[0]), cols: ['As', 'I want', 'So that', 'Source'], cells: rows.map((x) => x.slice(1)), at: at(path, t.section?.anchor ?? null), line: t.line });
  });
  return { view: view({ sources: [path], nodes, edges, matrix }), loose: out };
}
