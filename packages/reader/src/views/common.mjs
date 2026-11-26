// What every view builder shares: the IDs of a spec, its tables with their lines, and the shape of a view
// (ARCH-22). Nothing here reads a disk; every builder works on the model and the sources it is handed.
import { code, headingText, slug } from '../markdown.mjs';

/** The kinds of IDs a spec defines (artifacts.md). An `AC` hangs from its requirement: `FR-VEW-01.AC1`. */
export const ID = /\b(?:N?FR-[A-Z]{2,6}-\d+(?:\.AC\d+)?|(?:BIZ|MKT|MKG|ENT|RULE|ARCH|DEC|ADR|Q|CHG|DLT|PRC|BUC|SEC|INT|EVT|US)-\d+)\b/g;
const ONE_ID = new RegExp(`^${ID.source}$`);
export const isId = (s) => ONE_ID.test(s || '');
// An ID with a reference's prefix (`openpedd:ENT-20`) is that reference's, never this spec's (FR-VEW-11).
const PREFIXED = new RegExp(`\\b[a-z][a-z0-9-]*:(?:${ID.source})`, 'g');
export const idsIn = (s) => [...new Set((s || '').replace(PREFIXED, ' ').match(ID) || [])];

/** The family of an ID, as a node's `type`: `FR-VEW-01` → `fr`, `FR-VEW-01.AC1` → `ac`, `DEC-29` → `dec`. */
export const familyOf = (id) => (/\.AC\d+$/.test(id) ? 'ac' : id.match(/^(N?FR|[A-Z]+)-/)[1].toLowerCase());

/** IDs written as rows of a table rather than as a heading: requirements, criteria, questions, processes, business use cases, providers, events, user stories. */
const ROW_FAMILIES = new Set(['fr', 'nfr', 'ac', 'q', 'prc', 'buc', 'int', 'evt', 'us']);

/** A cell as text: code ticks, bold and links dropped. */
export const clean = (s) => (s ?? '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/`/g, '').replace(/\*\*/g, '').trim();
const split = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

/**
 * A document read with its lines: every heading and every table outside code, each table under the
 * heading it sits in, each row with its line (1-based, in the whole file).
 */
export function readDoc(path, text) {
  const lines = (text || '').split('\n');
  const headings = [], tables = [];
  let fenced = false, frontmatter = lines[0] === '---', under = null;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (frontmatter) { if (i > 0 && l.trim() === '---') frontmatter = false; continue; }
    if (l.startsWith('```')) { fenced = !fenced; continue; }
    if (fenced) continue;
    const h = l.match(/^(#+)\s+(.*)$/);
    if (h) {
      const explicit = h[2].match(/\[#([^\]]+)\]\s*$/)?.[1];
      under = { level: h[1].length, text: headingText(l), anchor: explicit || slug(h[2]), line: i + 1 };
      headings.push(under);
      continue;
    }
    if (!l.startsWith('|') || !/^\|[\s:|-]+\|$/.test((lines[i + 1] || '').trim())) continue;
    const t = { section: under, header: split(l), rows: [], line: i + 1 };
    let j = i + 2;
    for (; j < lines.length && lines[j].startsWith('|'); j++) t.rows.push({ cells: split(lines[j]), line: j + 1 });
    tables.push(t);
    i = j - 1;
  }
  return { path, text: text || '', lines, headings, tables };
}

/** The column of a header matching a pattern, or -1. */
export const colOf = (header, re) => header.findIndex((h) => re.test(clean(h)));

/** The first table under a heading (any level) named `name`, or whose header has every one of `cols`. */
export function tableUnder(doc, name, cols = []) {
  const has = (t) => cols.every((c) => t.header.some((h) => clean(h).toLowerCase() === c.toLowerCase()));
  return doc.tables.find((t) => t.section && t.section.text === name && has(t)) ?? (cols.length ? doc.tables.find(has) : null) ?? null;
}

/** A table's rows as objects keyed by the header's text in lower case, with the row's line. */
export const rowsOf = (t) => (t ? t.rows.map((r) => ({ ...Object.fromEntries(t.header.map((h, i) => [clean(h).toLowerCase(), r.cells[i] ?? ''])), line: r.line })) : []);

/** The line of the first line of a document matching a pattern, or 1. */
export function lineOf(doc, re) {
  const i = doc.lines.findIndex((l) => re.test(l));
  return i < 0 ? 1 : i + 1;
}

/** `path#anchor`: where a node opens. */
export const at = (path, anchor) => (anchor ? `${path}#${anchor}` : path);

/** The anchor of the heading closest above a line. */
export function anchorAt(doc, line) {
  let found = null;
  for (const h of doc.headings) { if (h.line <= line) found = h; else break; }
  return found?.anchor ?? null;
}

/**
 * Every ID the spec defines and every ID it cites, with where.
 *
 * Defined: a document whose title or description starts with `ID ·`; a heading `ID · …`; for
 * requirements, criteria, questions, processes, providers and events, a row whose first cell is the ID;
 * a question a decision closes; a change by its folder or its history lines; an ID an `ADDED` delta adds.
 * Cited: any other ID outside code, frontmatter titles and history.
 */
export function idIndex({ model, docs, byPath, sources = {} }) {
  const defined = new Map();
  const cited = [];
  const define = (id, where) => { if (!defined.has(id)) defined.set(id, where); };
  for (const doc of docs) {
    const fm = byPath.get(doc.path)?.frontmatter || {};
    const own = [fm.title, fm.description].map((s) => (s || '').match(/^([A-Z][\w.-]*-\d+(?:\.AC\d+)?)\s+·\s+(.*)$/)).find((m) => m && isId(m[1]));
    if (own) define(own[1], { path: doc.path, line: 1, label: headingLabel(doc, own[1]) || own[2], anchor: null });
    for (const h of doc.headings) {
      const m = h.text.replace(/`/g, '').match(/^([A-Z][\w.-]*-\d+(?:\.AC\d+)?)\s+·\s+(.*)$/);
      if (m && isId(m[1])) define(m[1], { path: doc.path, line: h.line, label: m[2], anchor: h.level === 1 ? null : h.anchor });
    }
    for (const t of doc.tables) for (const r of t.rows) {
      const first = clean(r.cells[0]);
      if (!isId(first) || !ROW_FAMILIES.has(familyOf(first))) continue;
      const label = clean(r.cells.find((c, i) => i > 0 && clean(c) && !isId(clean(c))) || first);
      define(first, { path: doc.path, line: r.line, label, anchor: t.section?.anchor ?? null });
    }
    // A decision's `Closes` names the question it answered; a closed question lives on there.
    for (const m of doc.text.matchAll(/\*\*Closes:\*\*\s*([^·\n]*)/g)) for (const q of idsIn(m[1])) define(q, { path: doc.path, line: lineOf(doc, /\*\*Closes:\*\*/), label: `Closed by ${doc.path.split('/').pop().replace(/\.md$/, '')}`, anchor: null });
  }
  for (const p of model.paths) {
    const m = p.match(/(?:^|\/)changes\/(?:archive\/)?(CHG-\d+)\//);
    if (m) define(m[1], { path: p.replace(/(CHG-\d+)\/.*$/, '$1'), line: 1, label: m[1], anchor: null });
  }
  for (const h of model.history) if (h.change && isId(h.change)) define(h.change, { path: `${model.root}/history/history.jsonl`, line: 1, label: h.change, anchor: null });
  for (const b of sources.branches || []) for (const id of b.changes || []) define(id, { path: `${b.name}`, line: 1, label: id, anchor: null });
  for (const doc of docs) {
    if (!/\/deltas\/DLT-\d+/.test(doc.path)) continue;
    const f = deltaFields(doc);
    if (/ADDED/.test(f.op || '')) for (const id of idsIn(f.target)) define(id, { path: doc.path, line: f.line, label: `Added by ${doc.path.split('/').pop().replace(/\.md$/, '')}`, anchor: null });
  }
  for (const doc of docs) {
    if (doc.path.includes('/history/')) continue;
    let fenced = false, fm = doc.lines[0] === '---';
    doc.lines.forEach((l, i) => {
      if (fm) { if (i > 0 && l.trim() === '---') fm = false; else if (!/^(title|description):/.test(l)) return; }
      if (l.startsWith('```')) { fenced = !fenced; return; }
      if (fenced) return;
      // An ID linked to another spec (`[RULE-01](https://…)`) is defined there, not in this one.
      for (const id of idsIn(l.replace(/\[[^\]]*\]\((?:https?:)[^)]*\)/g, ' '))) cited.push({ id, path: doc.path, line: i + 1 });
    });
  }
  return { defined, cited };
}

function headingLabel(doc, id) {
  const h = doc.headings.find((x) => x.level === 1 && x.text.replace(/`/g, '').startsWith(`${id} ·`));
  return h ? h.text.replace(/`/g, '').slice(id.length + 3).trim() : null;
}

/** A delta's `Field | Value` table, as an object with the table's line. */
export function deltaFields(doc) {
  const t = doc.tables.find((x) => /^field$/i.test(clean(x.header[0])));
  if (!t) return { line: 1 };
  return { ...Object.fromEntries(t.rows.map((r) => [clean(r.cells[0]), r.cells[1] ?? ''])), line: t.line };
}

/** A view, sorted so that the same files give the same bytes (NFR-VEW-01). */
export function view({ sources = [], nodes = [], edges = [], matrix = null, empty = null }) {
  const byId = new Map();
  for (const n of nodes) if (!byId.has(n.id)) byId.set(n.id, clean0(n));
  const seen = new Set();
  const kept = edges.filter((e) => byId.has(e.from) && byId.has(e.to)).map(clean0).filter((e) => {
    const k = `${e.from}|${e.to}|${e.type}|${e.label ?? ''}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  return {
    sources: [...new Set(sources)].sort(),
    nodes: [...byId.values()].sort((a, b) => cmp(a.id, b.id)),
    edges: kept.sort((a, b) => cmp(a.from, b.from) || cmp(a.to, b.to) || cmp(a.type, b.type) || cmp(a.label ?? '', b.label ?? '')),
    matrix: matrix && matrix.length ? matrix : null,
    empty,
  };
}

/** An object without its undefined fields, with keys in a fixed order. */
function clean0(o) {
  const order = ['id', 'from', 'to', 'type', 'label', 'status', 'group', 'at', 'line'];
  const keys = [...order.filter((k) => k in o), ...Object.keys(o).filter((k) => !order.includes(k)).sort()];
  return Object.fromEntries(keys.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));
}

/** A loose item (RULE-27): which view marks it, the item as written, and what is loose about it. */
export const loose = (viewKind, kind, { id, says, path, line, message }) => ({ view: viewKind, id, says, at: path, line: line ?? 1, kind, message });

/** The module a document belongs to: `spec/modules/views/prd.md` → `views`. */
export function moduleOfPath(root, path) {
  if (!path.startsWith(`${root}/modules/`)) return null;
  const rel = path.slice(root.length + 9).split('/');
  return rel.length > 1 ? rel[0] : null;
}

/** The layer of a document, the group of a node that belongs to no module. */
export function layerOf(root, path) {
  const rel = path.slice(root.length + 1).split('/');
  if (rel[0] === 'modules') return rel[1]?.endsWith('.md') ? 'modules' : rel[1];
  if (rel[0] === 'foundations') return rel.length > 2 ? rel[1] : 'foundations';
  return rel[0].replace(/\.md$/, '');
}

export { code };
