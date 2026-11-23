// trace: per requirement, spec → design → code → test → deploy, each link with its state and freshness;
// from `.pedd/spec-graph.json` and the events in `.pedd/trace/` (ARCH-05, ENT-22, ENT-23).
import { at, familyOf, loose, view } from './common.mjs';
import { prep } from './prep.mjs';

/** The kinds of link in the order a chain runs (ENT-22); `step` belongs to a change, not to the chain. */
export const CHAIN = ['origin', 'spec', 'change', 'design', 'task', 'code', 'test', 'deploy', 'flag', 'docs', 'metric'];

export function build(model, sources) {
  const c = prep(model, sources);
  const graph = c.sources.specGraph || null;
  const events = c.sources.traceEvents || [];
  const srcs = ['.pedd/spec-graph.json', '.pedd/trace/'];
  if (!graph && !events.length) return { view: view({ sources: srcs, empty: { artifact: '`.pedd/spec-graph.json` · `.pedd/trace/`', fill: '`pedd index` writes the spec graph; `pedd trace <id>` gathers the links' } }), loose: [] };

  // Each link's state now: the last event of each (id, kind, ref), in the order they were appended.
  const links = new Map();
  for (const e of events) {
    if (!e || !e.id || !e.kind || e.kind === 'step') continue;
    const key = `${e.id}|${e.kind}|${e.ref ?? ''}`;
    links.set(key, { id: e.id, kind: e.kind, ref: e.ref ?? null, state: e.to ?? null, anchor: e.anchor ?? links.get(key)?.anchor ?? null, file: e.file, line: e.line });
  }
  const nodes = [], edges = [], out = [];
  const reqs = new Set([...Object.keys(graph || {}).filter((id) => /^N?FR-/.test(id)), ...[...links.values()].map((l) => l.id)]);
  for (const id of [...reqs].sort()) {
    const def = c.ids.defined.get(id);
    const req = model.requirements.find((r) => r.id === id);
    if (!def) {
      const l = [...links.values()].find((x) => x.id === id);
      out.push(loose('trace', 'undefined-id', { id, says: id, path: l?.file ?? '.pedd/spec-graph.json', line: l?.line ?? 1, message: `the trace names \`${id}\`, defined nowhere` }));
      continue;
    }
    nodes.push({ id, type: familyOf(id), label: def.label, status: req?.status ?? undefined, group: id, at: at(def.path, def.anchor), line: def.line, hash: graph?.[id]?.hash ?? undefined });
    const chain = [...links.values()].filter((l) => l.id === id).sort((a, b) => CHAIN.indexOf(a.kind) - CHAIN.indexOf(b.kind) || String(a.ref).localeCompare(String(b.ref)));
    let prev = id;
    for (const kind of CHAIN.filter((k) => k !== 'spec')) {
      const here = chain.filter((l) => l.kind === kind);
      if (!here.length) continue;
      for (const l of here) {
        const nid = `${id}:${kind}:${l.ref ?? ''}`;
        const fresh = l.anchor && graph?.[id]?.hash ? (l.anchor === graph[id].hash ? 'fresh' : 'stale') : undefined;
        nodes.push({ id: nid, type: kind, label: l.ref ?? kind, status: l.state ?? undefined, group: id, at: l.file ?? '.pedd/trace/', line: l.line ?? 1, freshness: fresh });
        edges.push({ from: prev, to: nid, type: kind === 'origin' ? 'asked' : 'then', at: l.file ?? '.pedd/trace/', line: l.line ?? 1 });
      }
      prev = `${id}:${kind}:${here[here.length - 1].ref ?? ''}`;
    }
  }
  return { view: view({ sources: srcs, nodes, edges }), loose: out };
}
