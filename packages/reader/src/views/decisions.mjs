// decisions: every DEC and ADR, its status, what supersedes what, the IDs it cites and their modules.
import { at, familyOf, idsIn, lineOf, loose, moduleOfPath, layerOf, view } from './common.mjs';
import { prep } from './prep.mjs';

/** What a decision changes, for RULE-27: a requirement, an entity, a rule, an architecture document or a module. */
const CHANGES = new Set(['fr', 'nfr', 'ac', 'ent', 'rule', 'arch']);
const FIELD = /\*\*(Closes|Status|Supersedes|Date|Answers):\*\*\s*([^*\n]*)/g;

export function build(model, sources) {
  const c = prep(model, sources);
  const dir = `${c.root}/decisions/`;
  const docs = c.docs.filter((d) => d.path.startsWith(dir) && /\/(?:DEC|ADR)-\d+[^/]*\.md$/.test(d.path));
  if (!docs.length) return { view: view({ sources: [dir], empty: { artifact: 'Decisions', fill: '`specify` writes a `DEC-nn` when it closes a question, `architect` an `ADR-nn`' } }), loose: [] };

  const nodes = [], edges = [], out = [];
  const decisions = new Map();
  for (const doc of docs) {
    const id = doc.path.match(/\/((?:DEC|ADR)-\d+)/)[1];
    const h1 = doc.headings.find((h) => h.level === 1);
    const label = (h1?.text.replace(/`/g, '').replace(new RegExp(`^${id}\\s+·\\s+`), '') || c.byPath.get(doc.path).frontmatter.title || id).trim();
    const header = {};
    let headerLine = null;
    doc.lines.forEach((l, i) => {
      for (const m of l.matchAll(FIELD)) { header[m[1].toLowerCase()] = m[2].replace(/\s*·\s*$/, '').trim(); headerLine ??= i + 1; }
    });
    const status = id.startsWith('ADR') ? (header.status?.match(/proposed|accepted|superseded/)?.[0] ?? 'proposed') : 'accepted';
    const supersedes = idsIn(header.supersedes);
    const left = new Set([id, ...idsIn(header.closes), ...supersedes]);
    // Its edges are the IDs its body cites (ARCH-22, decision 3), outside its header fields.
    const cites = [...new Set(c.ids.cited.filter((x) => x.path === doc.path && x.line !== headerLine && !left.has(x.id)).map((x) => x.id))];
    const modules = [...new Set(c.links.filter((l) => l.from === doc.path && l.to.startsWith(`${c.root}/modules/`)).map((l) => moduleOfPath(c.root, l.to)).filter((m) => m && c.modules.has(m)))];
    decisions.set(id, { id, doc, label, status, supersedes, cites, modules, headerLine });
  }

  const groupOf = (id) => {
    const def = c.ids.defined.get(id);
    return def ? moduleOfPath(c.root, def.path) || layerOf(c.root, def.path) : null;
  };
  for (const d of decisions.values()) {
    const groups = [...d.cites.map(groupOf), ...d.modules].filter(Boolean);
    const count = new Map();
    for (const g of groups) count.set(g, (count.get(g) || 0) + 1);
    const group = [...count].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0]?.[0] ?? 'decisions';
    const superseded = [...decisions.values()].some((o) => o.supersedes.includes(d.id));
    nodes.push({ id: d.id, type: d.id.startsWith('ADR') ? 'adr' : 'dec', label: d.label, status: superseded ? 'superseded' : d.status, group, at: at(d.doc.path, null), line: d.doc.headings.find((h) => h.level === 1)?.line ?? 1 });
    for (const s of d.supersedes) {
      edges.push({ from: d.id, to: s, type: 'supersedes', at: d.doc.path, line: d.headerLine });
      if (!decisions.has(s) && c.ids.defined.has(s)) out.push(loose('decisions', 'supersedes-unknown', { id: d.id, says: d.label, path: d.doc.path, line: d.headerLine, message: `\`Supersedes\` names \`${s}\`, which is no decision` }));
    }
    for (const t of d.cites) {
      const def = c.ids.defined.get(t);
      if (!def) continue; // an ID defined nowhere is listed once, for every view (viewData)
      nodes.push({ id: t, type: familyOf(t), label: def.label, group: groupOf(t), at: at(def.path, def.anchor), line: def.line });
      edges.push({ from: d.id, to: t, type: 'cites', at: d.doc.path, line: c.ids.cited.find((x) => x.path === d.doc.path && x.id === t).line });
    }
    for (const m of d.modules) {
      const mod = c.modules.get(m);
      nodes.push({ id: `module:${m}`, type: 'module', label: m, group: m, at: mod.prds[0], line: 1 });
      edges.push({ from: d.id, to: `module:${m}`, type: 'cites', at: d.doc.path, line: c.links.find((l) => l.from === d.doc.path && l.to.startsWith(`${c.root}/modules/${m}/`)).line });
    }
    if (!d.modules.length && !d.cites.some((t) => CHANGES.has(familyOf(t)))) {
      out.push(loose('decisions', 'cites-nothing', { id: d.id, says: d.label, path: d.doc.path, line: lineOf(d.doc, /^#\s/), message: 'cites no requirement, entity, rule, architecture document or module' }));
    }
  }
  // A loop of `Supersedes`: each decision on it is loose.
  const onLoop = new Set();
  for (const start of decisions.keys()) {
    const seen = new Set();
    let cur = start;
    while (cur && decisions.has(cur) && !seen.has(cur)) { seen.add(cur); cur = decisions.get(cur).supersedes.find((s) => decisions.has(s)); }
    if (cur === start) onLoop.add(start);
  }
  for (const id of [...onLoop].sort()) {
    const d = decisions.get(id);
    out.push(loose('decisions', 'supersedes-loop', { id, says: d.label, path: d.doc.path, line: d.headerLine, message: '`Supersedes` loops back to it' }));
  }
  return { view: view({ sources: [dir], nodes, edges }), loose: out };
}
