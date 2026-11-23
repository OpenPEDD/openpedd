// changes: the changes in flight, the IDs each touches, and where two overlap; from `changes/` on the
// base and on every change branch (ARCH-17), listed the way `nextChangeId` lists them.
import { at, clean, deltaFields, familyOf, idsIn, loose, readDoc, view } from './common.mjs';
import { readDefinition } from '../definition.mjs';
import { toFiles } from '../spec.mjs';
import { prep } from './prep.mjs';

const IN_FLIGHT = /^(?:.*\/)?changes\/(CHG-\d+)\/(.*)$/;

/** The changes in flight in one tree: CHG → { definition, deltas: [{ path, doc, fields }] }. */
function changesIn(files, where) {
  const out = new Map();
  for (const [path, text] of files) {
    const m = path.match(IN_FLIGHT);
    if (!m || /\/changes\/archive\//.test(path)) continue;
    const ch = out.get(m[1]) ?? out.set(m[1], { id: m[1], where, path: path.slice(0, path.indexOf(m[1]) + m[1].length), definition: null, deltas: [] }).get(m[1]);
    if (m[2] === 'definition.md') ch.definition = readDefinition(text);
    if (/^deltas\/DLT-\d+[^/]*\.md$/.test(m[2])) { const doc = readDoc(path, text); ch.deltas.push({ path, doc, fields: deltaFields(doc) }); }
  }
  return out;
}

export function build(model, sources) {
  const c = prep(model, sources);
  const dir = `${c.root}/changes/`;
  const base = changesIn(new Map(c.docs.filter((d) => d.path.startsWith(dir)).map((d) => [d.path, d.text])), null);
  for (const b of c.sources.branches || []) for (const [id, ch] of changesIn(toFiles(b.files || {}), b.name)) {
    const mine = base.get(id);
    // The branch's copy is the newer one: its deltas are what is in flight.
    if (!mine || mine.where === null) base.set(id, ch);
  }
  if (!base.size) return { view: view({ sources: [dir], empty: { artifact: '`changes/<CHG>/`', fill: '`pedd branch change <slug>` opens one' } }), loose: [] };

  const nodes = [], edges = [], out = [];
  const touching = new Map();
  for (const ch of [...base.values()].sort((a, b) => (a.id < b.id ? -1 : 1))) {
    const title = ch.definition?.frontmatter?.title || ch.definition?.summary?.split('\n')[0] || null;
    nodes.push({ id: ch.id, type: 'change', label: title || ch.id, status: ch.definition?.status ?? undefined, group: ch.where ?? 'base', at: ch.where ? `${ch.where}:${ch.path}` : ch.path, line: 1 });
    for (const d of ch.deltas) {
      const targets = idsIn(d.fields.target);
      const op = clean(d.fields.op) || undefined;
      for (const t of targets) {
        const def = c.ids.defined.get(t);
        if (!def && !/ADDED/.test(op || '')) {
          if (ch.where) out.push(loose('changes', 'undefined-id', { id: ch.id, says: title || ch.id, path: `${ch.where}:${d.path}`, line: d.fields.line, message: `a delta targets \`${t}\`, defined nowhere` }));
          continue;
        }
        nodes.push({ id: t, type: familyOf(t), label: def?.label ?? t, group: 'spec', at: def ? at(def.path, def.anchor) : d.path, line: def?.line ?? d.fields.line });
        edges.push({ from: ch.id, to: t, type: 'targets', label: op, at: ch.where ? `${ch.where}:${d.path}` : d.path, line: d.fields.line });
        (touching.get(t) ?? touching.set(t, new Set()).get(t)).add(ch.id);
      }
    }
  }
  // Two changes on one ID overlap (ARCH-17).
  for (const [t, set] of touching) {
    const list = [...set].sort();
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) edges.push({ from: list[i], to: list[j], type: 'overlaps', label: t, at: dir, line: 1 });
  }
  return { view: view({ sources: [dir, ...(c.sources.branches || []).map((b) => b.name)], nodes, edges }), loose: out };
}
