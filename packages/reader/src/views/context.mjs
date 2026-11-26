// context: the architecture (ARCH-24, level 9). C4 levels 1 and 2: the system, the roles that use it, its
// apps and packages, and the external services each talks to, from workspace.yaml's components,
// .pedd/stack.json and `Integrations`; and how the data is protected, from `Security Policy`.
import { at, clean, loose, rowsOf, tableUnder, view } from './common.mjs';
import { prep } from './prep.mjs';
import { permissionsOf, protectionOf } from './security.mjs';

/** The detected stack as a list of { name, kind, file, component }, whichever shape `.pedd/stack.json` takes. */
function stackOf(stack) {
  if (!stack) return [];
  const list = Array.isArray(stack) ? stack : Array.isArray(stack.technologies) ? stack.technologies : Object.entries(stack).map(([kind, v]) => ({ kind, ...(typeof v === 'object' ? v : { name: v }) }));
  return list.filter((t) => t && t.name).map((t) => ({ name: String(t.name), kind: t.kind ? String(t.kind) : null, file: t.file ? String(t.file) : null, component: t.component ? String(t.component) : null }));
}

export function build(model, sources) {
  const c = prep(model, sources);
  const ws = c.sources.workspace || {};
  const components = (Array.isArray(ws.components) ? ws.components : []).filter((x) => x && x.path);
  const stack = stackOf(c.sources.stack);
  const integ = c.foundation('Integrations');
  const providersT = integ && (tableUnder(integ, 'Providers', ['Provider']) ?? integ.tables.find((t) => t.header.some((h) => /^provider$/i.test(clean(h)))));
  const providers = rowsOf(providersT).map((r) => ({ id: clean(r['int-nn'] ?? r.id ?? r.int ?? Object.values(r)[0]), name: clean(r.provider), usedFor: r['used for'] ?? '', usedBy: clean(r['used by'] ?? ''), line: r.line })).filter((p) => p.name);
  const perms = permissionsOf(c);
  const guard = protectionOf(c);
  const srcs = ['workspace.yaml', c.sources.stack ? '.pedd/stack.json' : null, integ?.path, ...(guard?.sources ?? [])].filter(Boolean);
  if (!components.length && !stack.length && !providers.length && !guard) {
    return { view: view({ sources: srcs, empty: { artifact: '`components` in workspace.yaml · `.pedd/stack.json` · Integrations · Security Policy', fill: '`components` in `workspace.yaml`, `pedd doctor` for the stack, the `Providers` table of `Integrations`, and the `Tables` of `Security Policy`' } }), loose: [] };
  }

  const system = ws.project || 'system';
  const nodes = [{ id: `system:${system}`, type: 'system', label: system, group: 'system', at: 'workspace.yaml', line: 1, stack: stack.filter((t) => !t.component).map((t) => (t.kind ? `${t.kind}: ${t.name}` : t.name)) }];
  const edges = [], out = [];
  for (const r of perms?.roles ?? []) {
    nodes.push({ id: `role:${r}`, type: 'role', label: r, group: 'people', at: at(perms.path, perms.anchor), line: perms.line });
    edges.push({ from: `role:${r}`, to: `system:${system}`, type: 'uses', at: perms.path, line: perms.line });
  }
  const pkgs = c.sources.packages || {};
  const byName = new Map(components.map((x) => [pkgs[x.path]?.name, x.path]).filter(([n]) => n));
  components.forEach((x, i) => {
    const id = `component:${x.path}`;
    nodes.push({ id, type: x.path.startsWith('apps/') ? 'app' : 'package', label: x.path, group: x.path.split('/')[0], at: 'workspace.yaml', line: (c.sources.workspaceLines?.[x.path]) ?? 1, modules: (x.modules || []).map(String), stack: stack.filter((t) => t.component === x.path).map((t) => (t.kind ? `${t.kind}: ${t.name}` : t.name)) });
    edges.push({ from: `system:${system}`, to: id, type: 'contains', at: 'workspace.yaml', line: c.sources.workspaceLines?.[x.path] ?? 1 });
    // Component → component, from the workspace graph: the packages each one depends on.
    for (const dep of pkgs[x.path]?.dependencies || []) if (byName.has(dep)) edges.push({ from: id, to: `component:${byName.get(dep)}`, type: 'depends on', at: `${x.path}/package.json`, line: 1 });
  });
  for (const p of providers) {
    const pid = p.id && /^INT-\d+$/.test(p.id) ? p.id : `provider:${p.name}`;
    nodes.push({ id: pid, type: 'external', label: p.name, group: 'external', at: at(integ.path, providersT.section?.anchor ?? null), line: p.line, usedFor: p.usedFor });
    const users = p.usedBy.split(/\s*[·,]\s*/).filter(Boolean);
    const matched = users.map((u) => components.find((x) => x.path === u || x.path.split('/').pop() === u || pkgs[x.path]?.name === u)).filter(Boolean);
    if (users.length && matched.length < users.length) {
      const unknown = users.filter((u) => !components.some((x) => x.path === u || x.path.split('/').pop() === u || pkgs[x.path]?.name === u));
      if (components.length) out.push(loose('context', 'missing-end', { id: pid, says: p.name, path: integ.path, line: p.line, message: `\`Used by\` names ${unknown.map((u) => `\`${u}\``).join(', ')}, not among the components of workspace.yaml` }));
    }
    if (matched.length) for (const m of matched) edges.push({ from: `component:${m.path}`, to: pid, type: 'talks to', label: clean(p.usedFor) || undefined, at: integ.path, line: p.line });
    else edges.push({ from: `system:${system}`, to: pid, type: 'talks to', label: clean(p.usedFor) || undefined, at: integ.path, line: p.line });
  }
  if (guard) { nodes.push(...guard.nodes); edges.push(...guard.edges); out.push(...guard.loose); }
  return { view: view({ sources: srcs, nodes, edges, matrix: guard?.matrix ?? [] }), loose: out };
}
