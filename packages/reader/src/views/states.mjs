// states: one state machine per entity, from its `States` and `Transitions` tables.
import { at, loose, view } from './common.mjs';
import { prep } from './prep.mjs';
import { stateName } from './entities.mjs';

/** The node ID of an entity's state: `ENT-06:open`. */
export const stateId = (entity, state) => `${entity}:${state}`;

export function build(model, sources) {
  const c = prep(model, sources);
  const withStates = [...c.entities.values()].filter((e) => e.states.length || e.transitions.length);
  const dir = `${c.root}/foundations/domain/`;
  if (!withStates.length) return { view: view({ sources: [dir], empty: { artifact: 'States and Transitions of an entity', fill: 'an entity\'s `States` (`State` · `Means`) and `Transitions` (`From` · `To` · `When` · `By`) tables' } }), loose: [] };

  const nodes = [], edges = [], out = [];
  for (const e of withStates) {
    const names = new Set(e.states.map((s) => stateName(s.name)));
    e.states.forEach((s, i) => nodes.push({ id: stateId(e.id, stateName(s.name)), type: 'state', label: stateName(s.name), status: i === 0 ? 'initial' : null, group: e.id, at: at(e.path, null), line: s.line, means: s.means }));
    for (const t of e.transitions) {
      const from = stateName(t.from), to = stateName(t.to);
      const missing = [from, to].filter((x) => !names.has(x));
      if (missing.length) {
        out.push(loose('states', 'missing-end', { id: e.id, says: e.name, path: e.path, line: t.line, message: `the transition ${from} → ${to} names ${missing.map((m) => `\`${m}\``).join(' and ')}, not among its states` }));
        continue;
      }
      edges.push({ from: stateId(e.id, from), to: stateId(e.id, to), type: 'transition', label: [t.when, t.by && `by ${t.by}`].filter(Boolean).join(' · ') || undefined, at: e.path, line: t.line });
    }
  }
  return { view: view({ sources: [dir], nodes: nodes.map((n) => (n.status ? n : { ...n, status: undefined })), edges }), loose: out };
}
