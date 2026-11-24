// readBusinessMap: the `Business Map` foundation, `foundations/business-map/as-is.md` and `to-be.md`
// (ENT-02, DEC-24; how it is drawn is `map`'s business mode).
//
// Each file is read by its sections, the headings `map` writes:
//
//   as-is.md   ## People · ## Business use cases · ## Processes · ## Tools and spreadsheets · ## Documents
//              ## Rules and regulations · ## Pains
//   to-be.md   ## People · ## Processes · ## Modules · ## Order
//
// A process is a row whose first or `ID` column holds `PRC-nn`, or a `### PRC-nn · Name` heading
// under Processes, with its tables. In the to-be, its mark (`kept` · `changed` · `taken`) and the
// module that takes it come from the columns of those names, or of a `Field | Value` table.
import { frontmatter, headings, stripCode, tables } from './markdown.mjs';

export const PROCESS_MARKS = ['kept', 'changed', 'taken'];
const PRC = /\bPRC-\d+\b/;
const BUC = /\bBUC-\d+\b/;
export const USE_CASE_KINDS = ['core', 'supporting', 'management'];
const list = (s) => clean(s).split(/\s*(?:·|,|;|\/)\s*/).filter((x) => x && x !== '—' && x !== '-');

/**
 * The `Extends` cell of a business use case: each base it extends and, after it, the condition,
 * `BUC-01 · when the box is short`, several separated by `;` (MKT-16).
 */
function extendsOf(cell) {
  return clean(cell).split(/\s*;\s*/).map((part) => {
    const id = part.match(BUC)?.[0];
    if (!id) return null;
    const when = part.slice(part.indexOf(id) + id.length).replace(/^[\s·:,-]*/, '').replace(/^when\s+/i, '').trim();
    return { id, when: when || null };
  }).filter(Boolean);
}

/**
 * A business use case row: its ID, name, kind, business actors, the processes that realize it, the
 * business use cases it always runs (`Includes`) and those it adds to on a condition (`Extends`) (MKT-16).
 */
function useCaseOf(r) {
  const id = (r.buc || r.id || '').match(BUC)?.[0];
  if (!id) return null;
  const raw = (r.kind || '').toLowerCase();
  return {
    id, name: r.business_use_case || r.name || id, kind: USE_CASE_KINDS.find((k) => raw.includes(k)) ?? null,
    actors: list(r.business_actor || r.business_actors || r.actor || ''), processes: (r.processes || '').match(/\bPRC-\d+\b/g) ?? [],
    includes: [...new Set((r.includes || '').match(/\bBUC-\d+\b/g) ?? [])].filter((x) => x !== id),
    extends: extendsOf(r.extends || '').filter((x) => x.id !== id),
  };
}

const SECTIONS = {
  asIs: { people: 'People', useCases: 'Business use cases', processes: 'Processes', tools: 'Tools and spreadsheets', documents: 'Documents', rules: 'Rules and regulations', pains: 'Pains' },
  toBe: { people: 'People', processes: 'Processes', modules: 'Modules', order: 'Order' },
};

/** A cell without its code ticks and bold, trimmed. */
const clean = (s) => (s ?? '').replace(/`/g, '').replace(/\*\*/g, '').trim();
const keyOf = (h) => clean(h).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_|_$/g, '');

/** A table's rows as objects keyed by the header, in snake case: `Confirmed by` → `confirmed_by`. */
const rowsOf = (t) => t.rows.map((r) => Object.fromEntries(t.header.map((h, i) => [keyOf(h), clean(r[i])])));

/** The text under each heading of `level`, keyed by the heading's text. */
function sectionsAt(text, level) {
  const out = {};
  const lines = stripCode(text).split('\n');
  let at = null;
  for (const l of lines) {
    const m = l.match(/^(#+)\s+(.*)$/);
    if (m && m[1].length <= level) at = m[1].length === level ? m[2].replace(/\s*\[#[^\]]+\]\s*$/, '').trim() : null;
    if (at === null) continue;
    if (m && m[1].length === level) { out[at] = []; continue; }
    out[at].push(l);
  }
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.join('\n').trim()]));
}

/** The fields of a `Field | Value` table, as an object. */
function fieldsOf(md) {
  const t = tables(md).find((x) => x.header.length === 2 && /^field$/i.test(clean(x.header[0])));
  return t ? Object.fromEntries(t.rows.map((r) => [keyOf(r[0]), clean(r[1])])) : {};
}

/** The processes under a Processes section: table rows with a `PRC` ID, then `### PRC-nn` headings. */
function processesOf(md) {
  const out = [];
  for (const t of tables(md.split(/^###\s/m)[0])) {
    const idCol = Math.max(0, t.header.findIndex((h) => /^id$/i.test(clean(h))));
    const rows = rowsOf(t);
    t.rows.forEach((r, i) => {
      const id = clean(r[idCol]).match(PRC)?.[0];
      if (!id) return;
      const fields = rows[i];
      out.push({ id, name: fields.name || fields.process || clean(r[idCol]).replace(PRC, '').replace(/^\s*[·:-]\s*/, ''), fields, tables: [] });
    });
  }
  for (const [heading, text] of Object.entries(sectionsAt(md, 3))) {
    const id = heading.match(PRC)?.[0];
    if (!id) continue;
    const fields = fieldsOf(text);
    const rest = tables(text).filter((x) => !(x.header.length === 2 && /^field$/i.test(clean(x.header[0]))));
    out.push({ id, name: clean(heading.replace(PRC, '').replace(/^\s*[·:-]\s*/, '')), fields, tables: rest.map((t) => ({ header: t.header.map(clean), rows: rowsOf(t) })) });
  }
  return out;
}

/** A to-be process with its mark and its module, read from its fields. */
function marked(p) {
  const f = p.fields;
  const raw = (f.mark || f.status || f.change || '').toLowerCase();
  const mark = PROCESS_MARKS.find((m) => raw.split(/[^a-z]+/).includes(m)) ?? null;
  return { ...p, mark, module: f.module || f.taken_by || null };
}

/** One file of the map: its frontmatter, its sections as tables of rows, and its processes. */
function readFile(path, text, kind) {
  const fm = frontmatter(text);
  const bySection = sectionsAt(text, 2);
  const file = { path, title: fm.title || null, version: fm.version || null, updated: fm.updated || null, status: fm.status || null, headings: headings(text) };
  for (const [key, heading] of Object.entries(SECTIONS[kind])) {
    const md = bySection[heading];
    if (key === 'processes') { file.processes = md == null ? [] : processesOf(md); continue; }
    file[key] = md == null ? [] : tables(md).flatMap(rowsOf);
  }
  if (kind === 'toBe') {
    file.processes = file.processes.map(marked);
    // The order may be a list instead of a table.
    if (!file.order.length && bySection.Order) file.order = bySection.Order.split('\n').map((l) => l.match(/^\s*(?:\d+\.|[-*])\s+(.*)$/)?.[1]).filter(Boolean).map((step, i) => ({ position: String(i + 1), step: clean(step) }));
  }
  file.missing = Object.entries(SECTIONS[kind]).filter(([, h]) => !(h in bySection)).map(([, h]) => h);
  return file;
}

/**
 * The Business Map of a spec, or null when it has none.
 *
 * @param files  path → text, as a Map.
 * @param prefix the spec's folder with its slash: `spec/`.
 */
export function readBusinessMap(files, prefix = 'spec/') {
  const dir = `${prefix}foundations/business-map/`;
  const asIs = files.get(`${dir}as-is.md`), toBe = files.get(`${dir}to-be.md`);
  if (asIs == null && toBe == null) return null;
  const map = {
    asIs: asIs == null ? null : readFile(`${dir}as-is.md`, asIs, 'asIs'),
    toBe: toBe == null ? null : readFile(`${dir}to-be.md`, toBe, 'toBe'),
  };
  // Each as-is process with what the to-be does with it; a to-be process unknown to the as-is is kept too.
  const ids = [...new Set([...(map.asIs?.processes ?? []), ...(map.toBe?.processes ?? [])].map((p) => p.id))];
  map.processes = ids.map((id) => {
    const was = map.asIs?.processes.find((p) => p.id === id) ?? null;
    const will = map.toBe?.processes.find((p) => p.id === id) ?? null;
    return { id, name: was?.name || will?.name || null, asIs: !!was, mark: will?.mark ?? null, module: will?.module ?? null };
  });
  // The business use cases, from the as-is; the to-be keeps them, and may list its own (map, business mode).
  const ucRows = [...(map.asIs?.useCases ?? []), ...(map.toBe?.useCases ?? [])].map(useCaseOf).filter(Boolean);
  map.useCases = [...new Map(ucRows.map((u) => [u.id, u])).values()];
  // «include» from the processes too: a step that names a process of another business use case runs
  // it, so the business use case of the step includes that one (MKT-16).
  const ucOf = (prc) => map.useCases.filter((u) => u.processes.includes(prc));
  for (const p of map.asIs?.processes ?? []) for (const t of p.tables) for (const row of t.rows) {
    for (const named of (row.does || '').match(/\bPRC-\d+\b/g) ?? []) {
      if (named === p.id) continue;
      for (const from of ucOf(p.id)) for (const to of ucOf(named)) if (to.id !== from.id && !from.includes.includes(to.id)) from.includes.push(to.id);
    }
  }
  return map;
}
