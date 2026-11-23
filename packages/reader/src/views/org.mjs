// org: a hierarchical organization chart (MKT-15): a box per role with how many hold it, reporting
// lines, and each manager's span of control; as-is and to-be side by side (FR-VEW-14).
import { clean, loose, view } from './common.mjs';
import { prep } from './prep.mjs';

export function build(model, sources) {
  const c = prep(model, sources);
  const bm = model.businessMap;
  const dir = `${c.root}/foundations/business-map/`;
  const sides = [['as-is', bm?.asIs], ['to-be', bm?.toBe]].filter(([, f]) => f && f.people.some((p) => p.role));
  if (!sides.length) return { view: view({ sources: [dir], empty: { artifact: 'People of the Business Map', fill: '`/map --business` draws it: a `People` table `Role` · `How many` · `Reports to` · `Does`' } }), loose: [] };
  const nodes = [], edges = [], out = [];
  const rolesOf = (f) => new Set((f?.people ?? []).map((p) => clean(p.role)).filter(Boolean));
  const asIs = rolesOf(bm.asIs), toBe = rolesOf(bm.toBe);
  for (const [side, f] of sides) {
    const roles = rolesOf(f);
    const line = (role) => Math.max(1, f.headings.find((h) => h.text === 'People')?.line ?? 1);
    for (const p of f.people) {
      const role = clean(p.role);
      if (!role) continue;
      const boss = clean(p.reports_to ?? '');
      const span = f.people.filter((x) => clean(x.reports_to ?? '') === role).length;
      const status = side === 'to-be' && bm.asIs && !asIs.has(role) ? 'new' : side === 'as-is' && bm.toBe && toBe.size && !toBe.has(role) ? 'gone' : undefined;
      nodes.push({ id: `org:${side}:${role}`, type: 'role', label: `${role} · ${side}`, status, group: side, at: f.path, line: line(role), how_many: clean(p.how_many ?? '') || undefined, does: clean(p.does ?? '') || undefined, span: span || undefined });
      if (!boss || boss === '—' || boss === '-') continue;
      if (!roles.has(boss)) { out.push(loose('org', 'unknown-role', { id: `org:${side}:${role}`, says: role, path: f.path, line: line(role), message: `reports to \`${boss}\`, a role the ${side} does not have` })); continue; }
      edges.push({ from: `org:${side}:${role}`, to: `org:${side}:${boss}`, type: 'reports to', at: f.path, line: line(role) });
    }
  }
  return { view: view({ sources: sides.map(([, f]) => f.path), nodes, edges }), loose: out };
}
