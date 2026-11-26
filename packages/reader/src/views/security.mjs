// security: roles and permissions, role × action, from `Roles & Permissions` or the file workspace.yaml names
// under `views.security` (ENT-02). How the data is protected (each table and its policies, the security
// rules) is the architecture's: `protectionOf` gives it to the `context` view (ARCH-24, level 9).
import { at, clean, familyOf, loose, rowsOf, tableUnder, view } from './common.mjs';
import { prep } from './prep.mjs';

/** The permissions of `Roles & Permissions`: { roles, actions, cells: action → role → value, at, lines }. */
export function permissionsOf(c) {
  const file = c.sources.workspace?.views?.security?.permissions;
  if (file?.path && c.sources.files?.has(file.path)) return fromFile(file.path, file.format, c.sources.files.get(file.path));
  const doc = c.foundation('Roles & Permissions');
  if (!doc) return null;
  const t = tableUnder(doc, 'Permissions') ?? doc.tables.find((x) => /^action$/i.test(clean(x.header[0])));
  if (!t) return null;
  const roles = t.header.slice(1).map(clean);
  const cells = {}, lines = {};
  for (const r of t.rows) {
    const action = clean(r.cells[0]);
    if (!action) continue;
    cells[action] = Object.fromEntries(roles.map((role, i) => [role, clean(r.cells[i + 1]).toLowerCase()]));
    lines[action] = r.line;
  }
  return { roles, actions: Object.keys(cells), cells, path: doc.path, anchor: t.section?.anchor ?? null, line: t.line, lines };
}

/** role → action → yes · own · no, from a JSON, YAML or TOML file, or what a script printed as JSON. */
function fromFile(path, format, text) {
  const data = /toml/i.test(format || path) ? toml(text) : /ya?ml/i.test(format || path) ? yaml(text) : JSON.parse(text);
  const roles = Object.keys(data).sort();
  const actions = [...new Set(roles.flatMap((r) => Object.keys(data[r] || {})))].sort();
  const cells = Object.fromEntries(actions.map((a) => [a, Object.fromEntries(roles.map((r) => [r, String(data[r]?.[a] ?? 'no').toLowerCase()]))]));
  const lines = {};
  text.split('\n').forEach((l, i) => { const k = l.match(/^\s*["']?([^"'=:\s]+)["']?\s*[=:]/)?.[1]; if (k && actions.includes(k) && !(k in lines)) lines[k] = i + 1; });
  return { roles, actions, cells, path, anchor: null, line: 1, lines };
}

/** `[role]` sections of `action = "yes"` lines: the TOML a permissions file is written in. */
function toml(text) {
  const out = {};
  let cur = null;
  for (const raw of text.split('\n')) {
    const l = raw.replace(/\s+#.*$/, '').trim();
    const sec = l.match(/^\[([^\]]+)\]$/);
    if (sec) { cur = out[sec[1].replace(/^["']|["']$/g, '')] = {}; continue; }
    const kv = l.match(/^["']?([^"'=]+?)["']?\s*=\s*["']?([^"']*)["']?$/);
    if (kv && cur) cur[kv[1].trim()] = kv[2].trim();
  }
  return out;
}

/** Two levels of `key: value`, the YAML a permissions file is written in. */
function yaml(text) {
  const out = {};
  let cur = null;
  for (const raw of text.split('\n')) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const top = raw.match(/^([^\s:][^:]*):\s*$/);
    if (top) { cur = out[top[1].trim()] = {}; continue; }
    const kv = raw.match(/^\s+([^:]+):\s*(.+?)\s*(#.*)?$/);
    if (kv && cur) cur[kv[1].trim()] = kv[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

/** The tables and what protects each: the `Tables` table of `Security Policy`, or each `CREATE POLICY … ON <table>`. */
function tablesOf(c) {
  const file = c.sources.workspace?.views?.security?.policies;
  if (file?.path && c.sources.files) {
    const sql = [...c.sources.files].filter(([p]) => p === file.path || p.startsWith(`${file.path.replace(/\/$/, '')}/`)).sort(([a], [b]) => (a < b ? -1 : 1));
    if (sql.length) {
      const rows = [], created = [];
      for (const [p, text] of sql) text.split('\n').forEach((l, i) => {
        const pol = l.match(/create\s+policy\s+"?([^"\s]+)"?\s+on\s+(?:"?[\w]+"?\.)?"?([\w]+)"?/i);
        if (pol) rows.push({ table: pol[2], protectedBy: pol[1], roles: (l.match(/\bto\s+([\w, ]+?)(?:\s+using|\s+with|;|$)/i)?.[1] || '').trim(), rule: '', path: p, line: i + 1 });
        const tbl = l.match(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:"?[\w]+"?\.)?"?([\w]+)"?/i);
        if (tbl) created.push({ table: tbl[1], path: p, line: i + 1 });
      });
      return { rows, listed: created, path: file.path, anchor: null };
    }
  }
  const doc = c.foundation('Security Policy');
  const t = doc && (tableUnder(doc, 'Tables', ['Table']) ?? doc.tables.find((x) => /^table$/i.test(clean(x.header[0]))));
  if (!t) return doc ? { rows: [], listed: [], path: doc.path, anchor: null, doc } : null;
  const rows = rowsOf(t).map((r) => ({ table: clean(r.table), protectedBy: clean(r['protected by'] ?? ''), roles: clean(r.roles ?? ''), rule: r.rule ?? '', path: doc.path, line: r.line }));
  return { rows, listed: rows, path: doc.path, anchor: t.section?.anchor ?? null, line: t.line, doc };
}

export function build(model, sources) {
  const c = prep(model, sources);
  const perms = permissionsOf(c);
  if (!perms) return { view: view({ sources: [`${c.root}/foundations/`], empty: { artifact: 'Roles & Permissions', fill: 'its `Permissions` table: one column per role, one row per action; or the file `workspace.yaml` names under `views.security.permissions`' } }), loose: [] };
  const nodes = [], edges = [], matrix = [];
  {
    matrix.push({ id: 'permissions', title: 'Who does what', group: 'permissions', rows: perms.actions, cols: perms.roles, cells: perms.actions.map((a) => perms.roles.map((r) => perms.cells[a][r] || '')), at: at(perms.path, perms.anchor), line: perms.line });
    for (const r of perms.roles) nodes.push({ id: `role:${r}`, type: 'role', label: r, group: 'roles', at: at(perms.path, perms.anchor), line: perms.line });
    for (const a of perms.actions) {
      nodes.push({ id: `action:${a}`, type: 'action', label: a, group: 'actions', at: at(perms.path, perms.anchor), line: perms.lines[a] ?? perms.line });
      for (const r of perms.roles) if (/^(yes|own)$/.test(perms.cells[a][r])) edges.push({ from: `role:${r}`, to: `action:${a}`, type: 'may', label: perms.cells[a][r] === 'own' ? 'own' : undefined, at: perms.path, line: perms.lines[a] ?? perms.line });
    }
  }
  return { view: view({ sources: [perms.path], nodes, edges, matrix }), loose: [] };
}

/**
 * How the data is protected: each table with the policies that protect it, a table nothing protects loose,
 * and the security rules (`SEC-nn`) with what they cite. From `Security Policy` or the SQL workspace.yaml
 * names under `views.security.policies`; null when there is none.
 */
export function protectionOf(c) {
  const tables = tablesOf(c);
  const policyDoc = c.foundation('Security Policy');
  if (!tables && !policyDoc) return null;
  const nodes = [], edges = [], out = [], matrix = [];
  if (tables) {
    const byTable = new Map();
    for (const r of tables.rows) (byTable.get(r.table) ?? byTable.set(r.table, []).get(r.table)).push(r);
    for (const l of tables.listed) if (!byTable.has(l.table)) byTable.set(l.table, []);
    const names = [...byTable.keys()].sort();
    if (names.length) matrix.push({ id: 'tables', title: 'What protects each table', group: 'tables', rows: names, cols: ['Protected by', 'Roles', 'Rule'], cells: names.map((n) => { const rs = byTable.get(n).filter((r) => r.protectedBy && r.protectedBy !== '—'); return [rs.map((r) => r.protectedBy).join(' · '), [...new Set(rs.map((r) => r.roles).filter(Boolean))].join(' · '), rs.map((r) => clean(r.rule)).filter(Boolean).join(' · ')]; }), at: at(tables.path, tables.anchor), line: tables.line ?? 1 });
    for (const n of names) {
      const first = byTable.get(n)[0] ?? tables.listed.find((l) => l.table === n);
      nodes.push({ id: `table:${n}`, type: 'table', label: n, group: 'tables', at: at(first.path, tables.anchor), line: first.line });
      const protectedBy = byTable.get(n).filter((r) => r.protectedBy && r.protectedBy !== '—');
      for (const r of protectedBy) {
        nodes.push({ id: `policy:${r.protectedBy}`, type: 'policy', label: r.protectedBy, group: 'policies', at: at(r.path, null), line: r.line });
        edges.push({ from: `policy:${r.protectedBy}`, to: `table:${n}`, type: 'protects', label: r.roles || undefined, at: r.path, line: r.line });
      }
      if (!protectedBy.length) out.push(loose('context', 'unprotected', { id: `table:${n}`, says: n, path: first.path, line: first.line, message: 'nothing protects this table' }));
    }
  }
  // The rules: one `SEC-nn` heading each, and what it cites.
  if (policyDoc) for (const h of policyDoc.headings) {
    const m = h.text.replace(/`/g, '').match(/^(SEC-\d+)\s+·\s+(.*)$/);
    if (!m) continue;
    nodes.push({ id: m[1], type: 'sec', label: m[2], group: 'rules', at: at(policyDoc.path, h.anchor), line: h.line });
    const next = policyDoc.headings.find((x) => x.line > h.line && x.level <= h.level)?.line ?? Infinity;
    for (const x of c.ids.cited.filter((y) => y.path === policyDoc.path && y.line > h.line && y.line < next && y.id !== m[1])) {
      const def = c.ids.defined.get(x.id);
      if (!def) continue;
      nodes.push({ id: x.id, type: familyOf(x.id), label: def.label, group: 'cited', at: at(def.path, def.anchor), line: def.line });
      edges.push({ from: m[1], to: x.id, type: 'cites', at: policyDoc.path, line: x.line });
    }
  }
  return { sources: [tables?.path, policyDoc?.path].filter(Boolean), nodes, edges, matrix, loose: out };
}

