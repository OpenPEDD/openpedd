// use-cases: a UML use case diagram (MKT-14): roles as actors, each module as the system boundary, each
// main flow as a use case associated with the roles of its steps, an «include» to each flow a step
// names, and each alternate or exception flow as an «extend» of the flow it leaves from (FR-VEW-16).
import { clean, colOf, loose, view } from './common.mjs';
import { prep } from './prep.mjs';

const FLOW = /^F(\d+)\s+·\s+(.*)$/;
const roleList = (s) => clean(s).split(/\s*(?:·|,|;|\/)\s*/).filter((x) => x && x !== '—' && x !== '-');

export function build(model, sources) {
  const c = prep(model, sources);
  const flows = new Map(); // `${module}:F1` → { module, n, name, prd, line, anchor, steps }
  for (const prd of model.prds) {
    const doc = c.docOf.get(prd.path);
    if (!doc) continue;
    for (const h of doc.headings) {
      const m = h.text.replace(/`/g, '').match(FLOW);
      if (!m) continue;
      const t = doc.tables.find((x) => x.section === h && colOf(x.header, /^step$/i) >= 0);
      const steps = t ? t.rows.map((r) => ({ n: clean(r.cells[colOf(t.header, /^step$/i)]), role: clean(r.cells[colOf(t.header, /^role$/i)] ?? ''), does: r.cells[colOf(t.header, /^does$/i)] ?? '', line: r.line })) : [];
      flows.set(`${prd.module}:F${m[1]}`, { module: prd.module, n: `F${m[1]}`, name: m[2], prd, doc, line: h.line, anchor: h.anchor, steps });
    }
  }
  if (!flows.size) return { view: view({ sources: [`${c.root}/modules/`], empty: { artifact: 'flows of a PRD', fill: 'one `### F<n> · <name>` per flow in a PRD, with a table `Step` · `Role` · `Does`' } }), loose: [] };
  const nodes = [], edges = [], out = [];
  const uc = (k) => `uc:${k}`;
  for (const [k, f] of flows) {
    nodes.push({ id: uc(k), type: 'usecase', label: `${f.n} · ${f.name}`, group: f.module, at: `${f.prd.path}#${f.anchor}`, line: f.line });
    const roles = [...new Set(f.steps.flatMap((s) => roleList(s.role)))];
    if (!roles.length) out.push(loose('use-cases', 'no-actor', { id: uc(k), says: `${f.n} · ${f.name}`, path: f.prd.path, line: f.line, message: 'no step names a role: the use case has no actor' }));
    for (const r of roles) {
      nodes.push({ id: `actor:${r}`, type: 'actor', label: r, group: 'actors', at: f.prd.path, line: f.line });
      edges.push({ from: `actor:${r}`, to: uc(k), type: 'uses', at: f.prd.path, line: f.line });
    }
    // «include»: a step whose `Does` names another flow, `F2` or `<module> F2`.
    for (const s of f.steps) for (const m of clean(s.does).matchAll(/(?:\b([a-z][\w-]*)\s+)?\bF(\d+)\b/g)) {
      const mod = m[1] && c.modules.has(m[1]) ? m[1] : f.module;
      const target = `${mod}:F${m[2]}`;
      if (target === k) continue;
      if (!flows.has(target)) { out.push(loose('use-cases', 'missing-end', { id: uc(k), says: `${f.n} · ${f.name}`, path: f.prd.path, line: s.line, message: `step ${s.n} names \`${mod === f.module ? '' : `${mod} `}F${m[2]}\`, a flow that does not exist` })); continue; }
      edges.push({ from: uc(k), to: uc(target), type: '«include»', label: `at ${f.n}.${s.n}`, at: f.prd.path, line: s.line });
    }
  }
  // «extend»: each alternate or exception flow, at the step it leaves from.
  for (const prd of model.prds) {
    const doc = c.docOf.get(prd.path);
    const alt = doc?.tables.find((t) => colOf(t.header, /^flow$/i) === 0 && colOf(t.header, /^from$/i) >= 0);
    alt?.rows.forEach((r, i) => {
      const name = clean(r.cells[0]), from = clean(r.cells[colOf(alt.header, /^from$/i)]);
      const base = `${prd.module}:${from.split('.')[0]}`;
      if (!flows.has(base)) return; // the prd view marks it
      const id = `ext:${prd.module}:${i + 1}`;
      nodes.push({ id, type: /^exception/i.test(name) ? 'exception' : 'alternate', label: name, group: prd.module, at: prd.path, line: r.line });
      edges.push({ from: id, to: uc(base), type: '«extend»', label: `at ${from}`, at: prd.path, line: r.line });
    });
  }
  return { view: view({ sources: [...new Set([...flows.values()].map((f) => f.prd.path))], nodes, edges }), loose: out };
}
