// The reading every view shares, made once per model and sources: the spec's documents with their
// lines, the IDs it defines and cites, the links between documents, its entities and its foundations.
import { posix } from 'node:path';
import { clean, colOf, idIndex, isId, readDoc, rowsOf, tableUnder } from './common.mjs';

const cache = new WeakMap();
const NO_SOURCES = {};

/** The shared reading of a model, cached per model and sources object. */
export function prep(model, sources = NO_SOURCES) {
  let per = cache.get(model);
  if (!per) cache.set(model, (per = new WeakMap()));
  if (!per.has(sources)) per.set(sources, make(model, sources));
  return per.get(sources);
}

function make(model, sources) {
  const root = model.root || 'spec';
  const byPath = new Map(model.documents.map((d) => [d.path, d]));
  const docs = model.documents.filter((d) => d.path.startsWith(`${root}/`) && !d.path.startsWith(`${root}/changes/archive/`)).map((d) => readDoc(d.path, d.text));
  const docOf = new Map(docs.map((d) => [d.path, d]));
  const ctx = { model, sources, root, byPath, docs, docOf };
  ctx.ids = idIndex(ctx);
  ctx.links = linksOf(docs);
  ctx.entities = entitiesOf(ctx);
  ctx.foundation = (name) => foundationDoc(ctx, name);
  ctx.modules = new Map(model.modules.map((m) => [m.id, m]));
  return ctx;
}

/** Every relative link between documents of the spec, as { from, to, anchor, line }. */
function linksOf(docs) {
  const out = [];
  for (const d of docs) {
    let fenced = false;
    d.lines.forEach((l, i) => {
      if (l.startsWith('```')) fenced = !fenced;
      if (fenced) return;
      for (const [, target] of l.matchAll(/\]\(([^)\s]+)\)/g)) {
        if (/^(https?:|mailto:)/.test(target)) continue;
        const [file, anchor] = target.split('#');
        if (!file.endsWith('.md')) continue;
        out.push({ from: d.path, to: posix.normalize(posix.join(posix.dirname(d.path), file)), anchor: anchor || null, line: i + 1 });
      }
    });
  }
  return out;
}

/** The entities of the domain: each file of `foundations/domain/` whose heading is `ENT-nn · Name`. */
function entitiesOf(ctx) {
  const dir = `${ctx.root}/foundations/domain/`;
  const out = new Map();
  for (const doc of ctx.docs.filter((d) => d.path.startsWith(dir))) {
    const h1 = doc.headings.find((h) => h.level === 1);
    const m = h1?.text.replace(/`/g, '').match(/^(ENT-\d+)\s+·\s+(.*)$/);
    if (!m) continue;
    const fieldsT = tableUnder(doc, 'Fields') ?? doc.tables.find((t) => /^field$/i.test(clean(t.header[0])) && colOf(t.header, /^what it holds$|^holds$/i) >= 0) ?? null;
    const statesT = tableUnder(doc, 'States', ['State']) ?? null;
    const transT = tableUnder(doc, 'Transitions', ['From', 'To']) ?? null;
    const fields = fieldsT ? rowsOf(fieldsT).map((r) => ({ name: clean(r.field), type: clean(r.type ?? ''), holds: r['what it holds'] ?? r.holds ?? '', raw: r, line: r.line })) : [];
    const states = statesT ? rowsOf(statesT).map((r) => ({ name: clean(r.state), means: r.means ?? '', line: r.line })).filter((s) => s.name) : [];
    const transitions = transT ? rowsOf(transT).map((r) => ({ from: clean(r.from), to: clean(r.to), when: r.when ?? '', by: clean(r.by ?? ''), line: r.line })) : [];
    // The paragraph under the heading, as written: what the entity is.
    const start = h1.line;
    const para = [];
    for (const l of doc.lines.slice(start)) { if (l.startsWith('#') || l.startsWith('|')) break; if (!l.trim() && para.length) break; if (l.trim()) para.push(l.trim()); }
    out.set(m[1], { id: m[1], name: m[2], path: doc.path, line: h1.line, what: para.join(' '), fields, states, transitions, doc });
  }
  return out;
}

const SLUGS = { 'Roles & Permissions': ['roles-and-permissions', 'roles', 'permissions'], 'Security Policy': ['security-policy', 'security'], Integrations: ['integrations'] };

/** A foundation by its name: a document under `foundations/` titled so, or the README of its folder. */
function foundationDoc(ctx, name) {
  const dir = `${ctx.root}/foundations/`;
  const found = ctx.docs.filter((d) => d.path.startsWith(dir)).find((d) => (ctx.byPath.get(d.path)?.frontmatter.title || '').toLowerCase() === name.toLowerCase());
  if (found) return found;
  for (const s of SLUGS[name] || []) for (const p of [`${dir}${s}.md`, `${dir}${s}/README.md`, `${dir}${s}/index.md`]) if (ctx.docOf.has(p)) return ctx.docOf.get(p);
  return null;
}

/** The ID of the item a line of a document belongs to: the row's own ID, the heading's above, or the document's. */
export function itemAt(ctx, path, line) {
  const doc = ctx.docOf.get(path);
  if (!doc) return { id: path, says: path };
  for (const t of doc.tables) for (const r of t.rows) if (r.line === line && isId(clean(r.cells[0]))) {
    const id = clean(r.cells[0]);
    return { id, says: ctx.ids.defined.get(id)?.label ?? id };
  }
  let h = null;
  for (const x of doc.headings) { if (x.line > line) break; const m = x.text.replace(/`/g, '').match(/^([A-Z][\w.-]*-\d+(?:\.AC\d+)?)\s+·/); if (m && isId(m[1])) h = m[1]; }
  const fm = ctx.byPath.get(path)?.frontmatter || {};
  const own = (fm.description || '').match(/^([A-Z][\w.-]*-\d+)\s+·/)?.[1];
  const id = h || (own && isId(own) ? own : null);
  if (id) return { id, says: ctx.ids.defined.get(id)?.label ?? id };
  return { id: path, says: fm.title || path };
}
