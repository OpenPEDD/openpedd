// entities: each entity with its fields; a field that names another entity is a relation; the modules
// whose PRDs cite it.
import { posix } from 'node:path';
import { at, clean, idsIn, loose, moduleOfPath, view } from './common.mjs';
import { prep } from './prep.mjs';

export function build(model, sources) {
  const c = prep(model, sources);
  const dir = `${c.root}/foundations/domain/`;
  if (!c.entities.size) return { view: view({ sources: [dir], empty: { artifact: 'Domain Model', fill: 'one file per entity in `foundations/domain/`, `# ENT-nn · <Name>`, with its `Fields` table' } }), loose: [] };

  const byFile = new Map([...c.entities.values()].map((e) => [e.path, e.id]));
  const nodes = [], edges = [], out = [];
  for (const e of c.entities.values()) {
    nodes.push({ id: e.id, type: 'entity', label: e.name, group: 'domain', at: at(e.path, null), line: e.line, what: e.what, fields: e.fields.map((f) => ({ name: f.name, type: f.type || null, holds: f.holds, line: f.line })) });
    for (const f of e.fields) {
      // A field naming another entity, by link or by ID, is a relation; its type says how many.
      const linked = [...`${f.type} ${f.holds}`.matchAll(/\]\(([^)#\s]+\.md)/g)].map((m) => byFile.get(posix.normalize(posix.join(posix.dirname(e.path), m[1])))).filter(Boolean);
      const named = idsIn(`${f.type} ${f.holds}`).filter((x) => c.entities.has(x));
      for (const to of new Set([...linked, ...named])) if (to !== e.id || named.includes(to)) {
        edges.push({ from: e.id, to, type: 'relation', label: `${f.name}${/\[\]/.test(f.type) ? ' []' : ''}`, at: e.path, line: f.line });
      }
    }
    // The modules that use it: those whose PRDs cite it, by ID or by link.
    const users = new Map();
    for (const x of c.ids.cited) if (x.id === e.id && moduleOfPath(c.root, x.path) && !users.has(moduleOfPath(c.root, x.path))) users.set(moduleOfPath(c.root, x.path), x);
    for (const l of c.links) if (l.to === e.path && moduleOfPath(c.root, l.from) && !users.has(moduleOfPath(c.root, l.from))) users.set(moduleOfPath(c.root, l.from), { path: l.from, line: l.line });
    for (const [m, x] of users) {
      nodes.push({ id: `module:${m}`, type: 'module', label: m, group: m, at: c.modules.get(m)?.prds[0] ?? x.path, line: 1 });
      edges.push({ from: `module:${m}`, to: e.id, type: 'used by', at: x.path, line: x.line });
    }
    // While modules wait for their PRDs (RULE-30), an entity another document cites is planned, not loose.
    const citedElsewhere = c.unmapped.size && (c.ids.cited.some((x) => x.id === e.id && x.path !== e.path && !x.path.endsWith('/domain/index.md'))
      || c.links.some((l) => l.to === e.path && l.from !== e.path && !l.from.endsWith('/domain/index.md')));
    if (!users.size && !citedElsewhere) out.push(loose('entities', 'not-cited', { id: e.id, says: e.name, path: e.path, line: e.line, message: 'no PRD cites it' }));
  }
  // RULE-31: two entities that hold many of each other want an associative entity between them.
  const many = edges.filter((x) => x.type === 'relation' && x.from !== x.to && x.label?.endsWith(' []'));
  for (const x of many) {
    const back = many.find((y) => y.from === x.to && y.to === x.from);
    if (!back || x.from > x.to) continue;
    const a = c.entities.get(x.from), b = c.entities.get(x.to);
    out.push(loose('entities', 'many-to-many', { id: a.id, says: a.name, path: a.path, line: x.line, message: `holds many ${b.name} and ${b.name} holds many of it: add an associative entity between them, on the many side of both (RULE-31)` }));
  }
  return { view: view({ sources: [dir], nodes, edges }), loose: out };
}

/** The name of a state as written in a cell: `draft`, **draft** or `draft` (initial). */
export const stateName = (s) => clean(s).split(/\s+\(/)[0].trim();
