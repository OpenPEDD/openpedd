// glossary: a business glossary (MKT-14): each term with its definition, its translations and where it
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
  for (const t of doc.tables.filter((x) => x.rows.length)) {
    const title = t.section?.text || 'Names';
    if (isOld(t)) {
      matrix.push({ id: `glossary:${title}`, title, group: 'no longer used', rows: t.rows.map((r) => clean(r.cells[0])), cols: t.header.slice(1).map(clean), cells: t.rows.map((r) => r.cells.slice(1).map(clean)), at: `${doc.path}${t.section ? `#${t.section.anchor}` : ''}`, line: t.line });
      continue;
    }
    const where = colOf(t.header, /^defined in$/i);
    matrix.push({ id: `glossary:${title}`, title, group: 'names', rows: t.rows.map((r) => clean(r.cells[0])), cols: t.header.slice(1).map(clean), cells: t.rows.map((r) => r.cells.slice(1).map(clean)), at: `${doc.path}${t.section ? `#${t.section.anchor}` : ''}`, line: t.line });
    if (where < 0) continue;
    for (const r of t.rows) {
      const cell = r.cells[where] ?? '';
      const files = [...cell.matchAll(/\]\(([^)#\s]+\.md)/g)].map((m) => posix.normalize(posix.join(posix.dirname(doc.path), m[1])));
      // An ID defined nowhere is listed once, for every view (viewData); here, a link to no document.
      const missing = files.filter((f) => !c.byPath.has(f) && !c.docOf.has(f));
      if (missing.length) out.push(loose('glossary', 'undefined-term', { id: clean(r.cells[0]), says: clean(r.cells[0]), path: doc.path, line: r.line, message: `its \`Defined in\` points to ${missing.map((m) => `\`${m}\``).join(', ')}, which does not exist` }));
    }
  }
  return { view: view({ sources: [doc.path], matrix }), loose: out };
}
