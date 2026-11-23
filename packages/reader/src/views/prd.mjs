// prd: per PRD, its use cases (roles × actions), its flows as flowcharts, and the transitions it touches.
import { at, clean, code, colOf, idsIn, isId, loose, view } from './common.mjs';
import { prep } from './prep.mjs';
import { permissionsOf } from './security.mjs';
import { stateName } from './entities.mjs';
import { stateId } from './states.mjs';

const FLOW = /^F(\d+)\s+·\s+(.*)$/;
const OLD_AC = /^AC-[A-Z]{2,6}-\d+$/;

export function build(model, sources) {
  const c = prep(model, sources);
  if (!model.prds.length) return { view: view({ sources: [`${c.root}/modules/`], empty: { artifact: 'PRD', fill: '`specify` writes `modules/<module>/prd.md`' } }), loose: [] };

  const perms = permissionsOf(c);
  const nodes = [], edges = [], out = [], matrix = [];
  for (const prd of model.prds) {
    const doc = c.docOf.get(prd.path);
    if (!doc) continue;
    const mod = prd.module;
    const group = prd.path;
    const nid = (x) => `${mod}:${x}`;

    // Flows: one `### F<n> · <name>` each, with its `Step · Role · Does` table.
    const flows = new Map();
    for (const h of doc.headings) {
      const m = h.text.replace(/`/g, '').match(FLOW);
      if (!m) continue;
      const t = doc.tables.find((x) => x.section === h && colOf(x.header, /^step$/i) >= 0);
      const steps = t ? t.rows.map((r) => ({ n: clean(r.cells[colOf(t.header, /^step$/i)]), role: clean(r.cells[colOf(t.header, /^role$/i)] ?? ''), does: r.cells[colOf(t.header, /^does$/i)] ?? '', line: r.line })) : [];
      flows.set(`F${m[1]}`, { id: `F${m[1]}`, name: m[2], line: h.line, anchor: h.anchor, steps });
    }
    for (const f of flows.values()) {
      nodes.push({ id: nid(f.id), type: 'flow', label: `${f.id} · ${f.name}`, group, at: at(prd.path, f.anchor), line: f.line });
      f.steps.forEach((s, i) => {
        nodes.push({ id: nid(`${f.id}.${s.n}`), type: 'step', label: clean(s.does), role: s.role && s.role !== '—' ? s.role : null, group, at: at(prd.path, f.anchor), line: s.line });
        edges.push(i === 0
          ? { from: nid(f.id), to: nid(`${f.id}.${s.n}`), type: 'starts', at: prd.path, line: s.line }
          : { from: nid(`${f.id}.${f.steps[i - 1].n}`), to: nid(`${f.id}.${s.n}`), type: 'next', at: prd.path, line: s.line });
      });
    }
    // Alternate and exception flows: one table `Flow · From · What changes · Ends in`.
    const alt = doc.tables.find((t) => colOf(t.header, /^flow$/i) === 0 && colOf(t.header, /^from$/i) >= 0);
    alt?.rows.forEach((r, i) => {
      const name = clean(r.cells[0]), from = clean(r.cells[colOf(alt.header, /^from$/i)]);
      const id = nid(`${/^exception/i.test(name) ? 'X' : 'A'}${i + 1}`);
      nodes.push({ id, type: /^exception/i.test(name) ? 'exception' : 'alternate', label: name, group, at: at(prd.path, alt.section?.anchor ?? null), line: r.line, changes: r.cells[colOf(alt.header, /what changes/i)] ?? '', ends: r.cells[colOf(alt.header, /ends in/i)] ?? '' });
      edges.push({ from: nid(from), to: id, type: 'leaves', at: prd.path, line: r.line });
      if (!nodes.some((n) => n.id === nid(from))) out.push(loose('prd', 'missing-end', { id: name, says: name, path: prd.path, line: r.line, message: `leaves from \`${from}\`, a step no flow has` }));
    });

    // Requirements, and the flows that carry each.
    const reqT = doc.tables.find((t) => t.rows.some((r) => /^N?FR-/.test(clean(r.cells[0]))));
    const flowsCol = reqT ? colOf(reqT.header, /^flows?$/i) : -1;
    const criteriaCol = reqT ? colOf(reqT.header, /^criteria$/i) : -1;
    // A criterion is `FR-X-01.AC1` (ENT-04), or the earlier `AC-X-01` (FR-VEW-12).
    const acs = new Set(doc.tables.flatMap((t) => t.rows.map((r) => clean(r.cells[0]))).filter((x) => /\.AC\d+$/.test(x) || OLD_AC.test(x)));
    for (const r of reqT?.rows ?? []) {
      const id = clean(r.cells[0]);
      if (!isId(id)) continue;
      const req = prd.requirements.find((x) => x.id === id);
      nodes.push({ id, type: id.startsWith('NFR') ? 'nfr' : 'fr', label: clean(req?.statement ?? r.cells[1]), status: req?.status ?? undefined, group, at: at(prd.path, reqT.section?.anchor ?? null), line: r.line });
      const carried = flowsCol >= 0 ? (r.cells[flowsCol].match(/F\d+/g) || []) : [];
      for (const f of carried) edges.push({ from: id, to: nid(f), type: 'carried by', at: prd.path, line: r.line });
      if (flows.size && !carried.some((f) => flows.has(f))) out.push(loose('prd', 'no-flow', { id, says: clean(req?.statement ?? r.cells[1]), path: prd.path, line: r.line, message: 'no flow carries it' }));
      const listed = criteriaCol >= 0 ? code(r.cells[criteriaCol]).map((x) => (x.includes('.') || OLD_AC.test(x) ? x : `${id}.${x}`)) : [];
      if (id.startsWith('FR') && !listed.some((x) => acs.has(x)) && ![...acs].some((x) => x.startsWith(`${id}.`))) out.push(loose('prd', 'no-criterion', { id, says: clean(req?.statement ?? r.cells[1]), path: prd.path, line: r.line, message: 'no acceptance criterion proves it' }));
    }

    // The transitions it touches: `Entity · From · To · Flow`, each a row of the entity's `Transitions`.
    const st = doc.tables.find((t) => colOf(t.header, /^entity$/i) >= 0 && colOf(t.header, /^from$/i) >= 0 && colOf(t.header, /^to$/i) >= 0);
    for (const r of st?.rows ?? []) {
      const ent = idsIn(r.cells[colOf(st.header, /^entity$/i)])[0];
      const from = stateName(r.cells[colOf(st.header, /^from$/i)]), to = stateName(r.cells[colOf(st.header, /^to$/i)]);
      const flow = (r.cells[colOf(st.header, /^flow$/i)] ?? '').match(/F\d+/g) || [];
      const e = ent && c.entities.get(ent);
      if (!e || !e.transitions.some((t) => stateName(t.from) === from && stateName(t.to) === to)) {
        out.push(loose('prd', 'unknown-transition', { id: ent || clean(r.cells[0]), says: e?.name ?? clean(r.cells[0]), path: prd.path, line: r.line, message: `the transition ${from} → ${to} is not among ${e ? `the transitions of ${e.name}` : 'the transitions of any entity'}` }));
        continue;
      }
      for (const s of [from, to]) nodes.push({ id: stateId(ent, s), type: 'state', label: s, group, entity: ent, at: at(e.path, null), line: e.states.find((x) => stateName(x.name) === s)?.line ?? e.line });
      edges.push({ from: stateId(ent, from), to: stateId(ent, to), type: 'transition', label: flow.join(' · ') || undefined, at: prd.path, line: r.line });
      for (const f of flow) edges.push({ from: nid(f), to: stateId(ent, to), type: 'moves', at: prd.path, line: r.line });
    }

    // Use cases: the `Permissions` matrix, roles and actions from `Roles & Permissions`.
    const pt = doc.tables.find((t) => t.section?.text === 'Permissions' && /^action$/i.test(clean(t.header[0])));
    if (pt) {
      const roles = pt.header.slice(1).map(clean);
      matrix.push({ id: prd.path, title: `Use cases · ${prd.title || mod}`, group, rows: pt.rows.map((r) => clean(r.cells[0])), cols: roles, cells: pt.rows.map((r) => roles.map((_, i) => clean(r.cells[i + 1] ?? ''))), at: at(prd.path, pt.section.anchor), line: pt.line });
      if (perms) {
        for (const role of roles.filter((x) => !perms.roles.includes(x))) out.push(loose('prd', 'unknown-role', { id: prd.path, says: prd.title || mod, path: prd.path, line: pt.line, message: `the role \`${role}\` is not in Roles & Permissions` }));
        for (const r of pt.rows) {
          const action = clean(r.cells[0]);
          if (!perms.actions.includes(action)) out.push(loose('prd', 'unknown-action', { id: prd.path, says: prd.title || mod, path: prd.path, line: r.line, message: `the action \`${action}\` is not in Roles & Permissions` }));
        }
      }
    }
  }
  return { view: view({ sources: model.prds.map((p) => p.path), nodes, edges, matrix }), loose: out };
}
