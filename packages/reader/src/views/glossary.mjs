// glossary: a business glossary (MKT-15): each term with its definition, its translations and where it
// is defined; names no longer used beside their new name. From the `Glossary` (FR-VEW-13).
import { posix } from 'node:path';
import { clean, colOf, loose, view } from './common.mjs';
import { prep } from './prep.mjs';

const isOld = (t) => colOf(t.header, /^old name$/i) >= 0;

export function build(model, sources) {
  const c = prep(model, sources);
  const doc = c.docOf.get(`${c.root}/foundations/glossary.md`) ?? c.foundation('Glossary');
  if (!doc || !doc.tables.some((t) => t.rows.length)) return { view: view({ sources: [`${c.root}/foundations/glossary.md`], empty: { artifact: 'Glossary', fill: 'the `Glossary`: one table per group, a name in its first column, what it is, and where it is defined' } }), loose: [] };
  const matrix = [], out = [];
  const owed = localesOf(sources?.workspace).filter((l) => l !== 'en');
  for (const t of doc.tables.filter((x) => x.rows.length)) {
    const title = t.section?.text || 'Names';
    if (isOld(t)) {
      matrix.push({ id: `glossary:${title}`, title, group: 'no longer used', rows: t.rows.map((r) => clean(r.cells[0])), cols: t.header.slice(1).map(clean), cells: t.rows.map((r) => r.cells.slice(1).map(clean)), at: `${doc.path}${t.section ? `#${t.section.anchor}` : ''}`, line: t.line });
      continue;
    }
    const where = colOf(t.header, /^defined in$/i);
    matrix.push({ id: `glossary:${title}`, title, group: 'names', rows: t.rows.map((r) => clean(r.cells[0])), cols: t.header.slice(1).map(clean), cells: t.rows.map((r) => r.cells.slice(1).map(clean)), at: `${doc.path}${t.section ? `#${t.section.anchor}` : ''}`, line: t.line });
    out.push(...unlabelled(doc, t, title, owed));
    if (where < 0) continue;
    for (const r of t.rows) {
      const cell = r.cells[where] ?? '';
      // A link to a web address (an industry glossary, FR-VEW-24) is the industry's, never loose.
      const files = [...cell.matchAll(/\]\(([^)#\s]+\.md)/g)].filter((m) => !/^[a-z][a-z0-9+.-]*:/i.test(m[1])).map((m) => posix.normalize(posix.join(posix.dirname(doc.path), m[1])));
      // An ID defined nowhere is listed once, for every view (viewData); here, a link to no document.
      const missing = files.filter((f) => !c.byPath.has(f) && !c.docOf.has(f));
      if (missing.length) out.push(loose('glossary', 'undefined-term', { id: clean(r.cells[0]), says: clean(r.cells[0]), path: doc.path, line: r.line, message: `its \`Defined in\` points to ${missing.map((m) => `\`${m}\``).join(', ')}, which does not exist` }));
    }
  }
  return { view: view({ sources: [doc.path], matrix }), loose: out };
}

/**
 * DEC-33, FR-VEW-27: each name owes a label in every locale the workspace declares but `en`, where a name
 * with none reads as written. A table with no column for a locale is one loose item; else each name whose
 * cell is empty, or with a label count that is not its name count (`A · B`), is one.
 */
function unlabelled(doc, t, title, owed) {
  const out = [];
  const head = t.header.map((h) => clean(h).toLowerCase());
  const add = (id, line, message) => out.push(loose('glossary', 'unlabelled', { id, says: id, path: doc.path, line, message }));
  for (const locale of owed) {
    const i = head.indexOf(locale);
    if (i <= 0) { add(title, t.line, `has no \`${locale}\` column: its names read as written in \`${locale}\``); continue; }
    for (const r of t.rows) {
      const said = clean(r.cells[0]).split(/\s+·\s+/).filter(Boolean);
      if (!said.length) continue;
      const labels = clean(r.cells[i] ?? '').split(/\s+·\s+/).filter(Boolean);
      if (!labels.length) add(clean(r.cells[0]), r.line, `has no \`${locale}\` label: it reads as written`);
      else if (said.length > 1 && labels.length !== said.length) add(clean(r.cells[0]), r.line, `names ${said.length}, its \`${locale}\` label ${labels.length}: one label per name, in the same order`);
    }
  }
  return out;
}

/** The locales a Glossary may have a column for: `en`, the workspace's `locales` and its prose `language` (DEC-33). */
export const localesOf = (workspace) => [...new Set(['en', ...(Array.isArray(workspace?.locales) ? workspace.locales : []), workspace?.language].filter((x) => typeof x === 'string' && x).map((x) => x.toLowerCase()))];

/**
 * Each Glossary name with what a person reads in each locale (DEC-33, FR-VEW-26): `{ 'Job post': { es: 'Aviso' } }`.
 * A column headed by a locale's code is that locale's label; a cell left empty gives none. A name cell
 * with several names (`A · B`) gives each the label in the same place, when the label has as many.
 */
export function names(model, sources) {
  const c = prep(model, sources);
  const doc = c.docOf.get(`${c.root}/foundations/glossary.md`) ?? c.foundation('Glossary');
  const out = {};
  if (!doc) return out;
  const locales = localesOf(sources?.workspace);
  for (const t of doc.tables) {
    if (!t.rows.length || isOld(t)) continue;
    const cols = t.header.map((h, i) => [clean(h).toLowerCase(), i]).filter(([h, i]) => i > 0 && locales.includes(h));
    if (!cols.length) continue;
    for (const r of t.rows) {
      const said = clean(r.cells[0]).split(/\s+·\s+/).filter(Boolean);
      for (const [locale, i] of cols) {
        const labels = clean(r.cells[i]).split(/\s+·\s+/).filter(Boolean);
        if (!labels.length) continue;
        const each = said.length === 1 ? [clean(r.cells[i])] : labels.length === said.length ? labels : null;
        if (!each) continue;
        said.forEach((n, k) => { (out[n] ??= {})[locale] = each[k]; });
      }
    }
  }
  // Sorted, so the same files give the same views.json byte for byte.
  return Object.fromEntries(Object.keys(out).sort().map((n) => [n, Object.fromEntries(Object.keys(out[n]).sort().map((l) => [l, out[n][l]]))]));
}
