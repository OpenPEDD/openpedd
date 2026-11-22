// readSpec: the spec's files, held in memory as path → text, turned into the model (ARCH-20).
import { code, headings, parseFrontmatter, stripCode, tables } from './markdown.mjs';
import { readBusinessMap } from './business-map.mjs';

/** Paths compared segment by segment, the order a recursive directory listing gives. */
export function comparePaths(a, b) {
  const x = a.split('/'), y = b.split('/');
  for (let i = 0; i < Math.min(x.length, y.length); i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
  return x.length - y.length;
}

/** A `Map` or a plain object of path → text, as a `Map` with forward-slash paths. */
export function toFiles(files) {
  const entries = files instanceof Map ? [...files] : Object.entries(files || {});
  return new Map(entries.map(([p, t]) => [p.replace(/\\/g, '/').replace(/^\.\//, ''), String(t)]));
}

/** Tables with the heading each sits under. */
function tablesBySection(text) {
  const out = [];
  const lines = stripCode(text).split('\n');
  let under = null;
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(/^#+\s+(.*)$/);
    if (h) under = h[1].replace(/\s*\[#[^\]]+\]\s*$/, '').trim();
    if (!lines[i].startsWith('|') || !/^\|[\s:|-]+\|$/.test((lines[i + 1] || '').trim())) continue;
    const t = tables(lines.slice(i).join('\n'))[0];
    out.push({ section: under, ...t });
    i += t.rows.length + 1;
  }
  return out;
}

const REQ = /^(N?FR)-([A-Z]+)-(\d+)$/;

/**
 * A requirement's statuses from least to most advanced (ENT-03). `changing` was `live` and goes back
 * to it on publish, so it sits just below. `deprecated` is retired: it holds no PRD back.
 */
export const REQUIREMENT_STATUSES = ['draft', 'specified', 'designed', 'building', 'in_review', 'accepted', 'changing', 'live', 'deprecated'];

/** The least advanced of some statuses, the one a PRD carries (DEC-28); null when none counts. */
export function leastAdvanced(statuses) {
  const ranked = statuses.filter((s) => s && s !== 'deprecated').map((s) => REQUIREMENT_STATUSES.indexOf(s)).filter((i) => i >= 0);
  return ranked.length ? REQUIREMENT_STATUSES[Math.min(...ranked)] : null;
}
const col = (header, re) => header.findIndex((h) => re.test(h));

/** The requirements of one PRD: every row of a table whose first column holds an `FR` or `NFR` ID. */
function requirementsOf(prd) {
  const out = [];
  for (const t of prd.tables) {
    const id = col(t.header, /^ID$/i) >= 0 ? col(t.header, /^ID$/i) : 0;
    const at = {
      statement: col(t.header, /statement|requirement|ears/i),
      reason: col(t.header, /reason|why/i),
      roles: col(t.header, /roles?/i),
      criteria: col(t.header, /criteria/i),
      depends: col(t.header, /depends/i),
      status: col(t.header, /^status$/i),
    };
    for (const row of t.rows) {
      const rid = (code(row[id])[0] || row[id] || '').trim();
      const m = rid.match(REQ);
      if (!m) continue;
      const cell = (k) => (at[k] >= 0 ? row[at[k]] ?? '' : '');
      const own = code(cell('status'))[0] || cell('status');
      out.push({
        id: rid, kind: m[1], module: m[2], prd: prd.path,
        statement: cell('statement'), reason: cell('reason'), roles: cell('roles'),
        criteria: code(cell('criteria')), depends_on: code(cell('depends')),
        // DEC-28: the row's own status; in a PRD without the column, the PRD's.
        status: own || prd.status || null, statusFrom: own ? 'column' : 'prd',
      });
    }
  }
  return out;
}

/** The module codes from the table of `modules/README.md`: each linked folder with its code. */
function moduleCodes(readme) {
  const codes = {};
  for (const t of tables(readme || '')) {
    const m = t.header.findIndex((h) => /^Module$/i.test(h)), c = t.header.findIndex((h) => /^Code$/i.test(h));
    if (m < 0 || c < 0) continue;
    for (const row of t.rows) {
      const folders = [...new Set([...row[m].matchAll(/\]\(([\w-]+)\//g)].map((x) => x[1]))];
      const list = code(row[c]);
      folders.forEach((f, i) => { codes[f] = list[i] ?? list[0] ?? null; });
    }
  }
  return codes;
}

/** The lines of `history.jsonl`, parsed; a line that is not JSON is kept as { error, line }. */
export function readHistory(text) {
  return (text || '').split('\n').filter((l) => l.trim()).map((l, i) => {
    try { return JSON.parse(l); } catch { return { error: 'not JSON', line: i + 1 }; }
  });
}

/**
 * The model of a spec.
 *
 * @param files  path → text (a Map or an object), every path relative to the repository root.
 * @param opts.root  the spec's folder, `spec` by default.
 */
export function readSpec(files, { root = 'spec' } = {}) {
  const all = toFiles(files);
  const prefix = root ? `${root.replace(/\/$/, '')}/` : '';
  const paths = [...all.keys()].sort(comparePaths);
  const problems = [];
  const documents = paths.filter((p) => p.endsWith('.md')).map((path) => {
    const text = all.get(path);
    const fm = parseFrontmatter(text);
    // A broken frontmatter is reported, not read around: the caller decides whether it fails.
    for (const p of fm.problems) problems.push({ path, line: p.line, kind: 'frontmatter', message: p.message });
    return { path, frontmatter: fm.data, hasFrontmatter: fm.present, frontmatterProblems: fm.problems, headings: headings(text), tables: tablesBySection(text), text };
  });
  const inSpec = documents.filter((d) => d.path.startsWith(prefix));

  const modDir = `${prefix}modules/`;
  const codes = moduleCodes(all.get(`${modDir}README.md`));
  const prds = inSpec
    .filter((d) => d.path.startsWith(modDir) && d.path.split('/').length === modDir.split('/').length + 1 && !d.path.endsWith('/README.md'))
    .map((d) => {
      const prd = { path: d.path, module: d.path.slice(modDir.length).split('/')[0], title: d.frontmatter.title || null, status: d.frontmatter.status || null, version: d.frontmatter.version || null, tables: d.tables };
      prd.requirements = requirementsOf(prd);
      delete prd.tables;
      return prd;
    });
  const modules = [...new Set(prds.map((p) => p.module))].map((id) => ({ id, code: codes[id] ?? null, prds: prds.filter((p) => p.module === id).map((p) => p.path) }));

  const historyPath = `${prefix}history/history.jsonl`;
  const history = readHistory(all.get(historyPath));
  for (const h of history) if (h.error) problems.push({ path: historyPath, line: h.line, kind: 'history', message: h.error });
  return {
    root: prefix.replace(/\/$/, ''),
    paths,
    documents,
    modules,
    prds,
    requirements: prds.flatMap((p) => p.requirements),
    history,
    businessMap: readBusinessMap(all, prefix),
    problems,
  };
}
