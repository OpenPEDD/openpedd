// code: modules, packages and their main symbols, each linked to the requirements anchored in it, from
// the code index (ARCH-19): `.pedd/code-index/`, one file per module and per package.
import { at, clean, code, familyOf, idsIn, loose, readDoc, view } from './common.mjs';
import { prep } from './prep.mjs';

/** How many symbols of an entry the view shows: the index already ranks them. */
const SYMBOLS = 8;

/** The text under a `##` heading of an entry, by name, with the line it starts at. */
function part(doc, name) {
  const h = doc.headings.find((x) => x.level === 2 && x.text.toLowerCase() === name.toLowerCase());
  if (!h) return { lines: [], start: 0 };
  const next = doc.headings.find((x) => x.line > h.line && x.level <= 2)?.line ?? doc.lines.length + 1;
  return { lines: doc.lines.slice(h.line, next - 1), start: h.line + 1 };
}

export function build(model, sources) {
  const c = prep(model, sources);
  const index = c.sources.codeIndex;
  const dir = '.pedd/code-index/';
  const entries = index ? [...index].filter(([p]) => p.endsWith('.md') && !/(^|\/)README\.md$/.test(p)).sort(([a], [b]) => (a < b ? -1 : 1)) : [];
  if (!entries.length) return { view: view({ sources: [dir], empty: { artifact: 'Code index', fill: '`pedd index` writes it, one file per module and per package' } }), loose: [] };

  const nodes = [], edges = [], out = [];
  const docs = entries.map(([p, text]) => readDoc(p, text));
  const nameOf = (d) => clean(d.headings.find((h) => h.level === 1)?.text || d.path.split('/').pop().replace(/\.md$/, ''));
  const names = new Map(docs.map((d) => [nameOf(d), d]));
  for (const d of docs) {
    const name = nameOf(d);
    const isModule = c.modules.has(name) || /(^|\/)modules\//.test(d.path);
    const id = `${isModule ? 'module' : 'package'}:${name}`;
    nodes.push({ id, type: isModule ? 'module' : 'package', label: name, group: isModule ? 'modules' : 'packages', at: d.path, line: 1 });
    const where = part(d, 'Where');
    where.lines.forEach((l, i) => { for (const other of code(l)) if (other !== name && names.has(other)) edges.push({ from: id, to: `${c.modules.has(other) || /(^|\/)modules\//.test(names.get(other).path) ? 'module' : 'package'}:${other}`, type: /imported by/i.test(l) ? 'imported by' : 'imports', at: d.path, line: where.start + i }); });
    const syms = part(d, 'Symbols');
    let n = 0;
    syms.lines.forEach((l, i) => {
      const s = code(l)[0];
      if (!s || n >= SYMBOLS) return;
      n++;
      nodes.push({ id: `symbol:${name}:${s}`, type: 'symbol', label: s, group: name, at: d.path, line: syms.start + i });
      edges.push({ from: id, to: `symbol:${name}:${s}`, type: 'exports', at: d.path, line: syms.start + i });
    });
    const ids = part(d, 'IDs');
    ids.lines.forEach((l, i) => {
      for (const rid of idsIn(l)) {
        const def = c.ids.defined.get(rid);
        if (!def) { out.push(loose('code', 'undefined-id', { id, says: name, path: d.path, line: ids.start + i, message: `a code anchor names \`${rid}\`, defined nowhere` })); continue; }
        nodes.push({ id: rid, type: familyOf(rid), label: def.label, group: 'requirements', at: at(def.path, def.anchor), line: def.line });
        edges.push({ from: rid, to: id, type: 'anchored in', label: code(l).filter((x) => x !== rid).join(' · ') || undefined, at: d.path, line: ids.start + i });
      }
    });
  }
  // Module → package, from `components` in workspace.yaml.
  for (const comp of c.sources.workspace?.components || []) for (const m of comp?.modules || []) {
    const pkg = docs.map(nameOf).find((x) => x === comp.path || x === comp.path.split('/').pop());
    if (pkg && names.has(String(m))) edges.push({ from: `module:${m}`, to: `package:${pkg}`, type: 'implemented by', at: 'workspace.yaml', line: 1 });
  }
  return { view: view({ sources: [dir, 'workspace.yaml'], nodes, edges }), loose: out };
}
