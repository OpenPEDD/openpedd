// rules: the business rules (MKT-16; definition map, level 7): what always holds, from a law, a regulator,
// a contract or a policy, each with where it comes from and the processes and entities it governs. From
// the `Rules and regulations` of the as-is and the product's own `RULE-nn` in `foundations/rules/` (FR-VEW-28).
import { at, clean, loose, view } from './common.mjs';
import { prep } from './prep.mjs';

const PRC = /\bPRC-\d+\b/g, ENT = /\bENT-\d+\b/g;

export function build(model, sources) {
  const c = prep(model, sources);
  const asIs = model.businessMap?.asIs;
  const rows = (asIs?.rules ?? []).filter((r) => clean(r.rule ?? Object.values(r)[0] ?? ''));
  const dir = `${c.root}/foundations/rules/`;
  const own = [...c.ids.defined].filter(([id, d]) => /^RULE-\d+$/.test(id) && d.path.startsWith(dir));
  if (!rows.length && !own.length) return { view: view({ sources: [`${c.root}/foundations/business-map/as-is.md`, dir], empty: { artifact: 'Rules and regulations of the Business Map', fill: 'a `Rules and regulations` table `Rule` · `Comes from` · `Processes` · `Entities` in the as-is, or `RULE-nn` in `foundations/rules/`' } }), loose: [] };

  const nodes = [], edges = [], out = [], table = [];
  const processes = new Map((model.businessMap?.processes ?? []).map((p) => [p.id, p.name || p.id]));
  const entity = (id) => c.ids.defined.get(id);
  // What a rule governs: each process and entity it names, linked; one it names that does not exist, loose.
  const govern = (id, says, path, line, prcs, ents) => {
    for (const p of prcs) {
      if (!processes.has(p)) { out.push(loose('rules', 'unknown-process', { id, says, path, line, message: `names \`${p}\`, a process the Business Map does not have` })); continue; }
      nodes.push({ id: p, type: 'prc', label: processes.get(p), group: 'processes', at: asIs?.path ?? `${c.root}/foundations/business-map/as-is.md`, line: 1 });
      edges.push({ from: id, to: p, type: 'governs', at: path, line });
    }
    for (const e of ents) {
      const d = entity(e);
      if (!d) { out.push(loose('rules', 'unknown-entity', { id, says, path, line, message: `names \`${e}\`, an entity defined nowhere` })); continue; }
      nodes.push({ id: e, type: 'ent', label: d.label, group: 'entities', at: at(d.path, d.anchor), line: d.line });
      edges.push({ from: id, to: e, type: 'constrains', at: path, line });
    }
  };
  // A row's line: the table starts two lines under its heading; each row, one under the other.
  const head = asIs?.headings.find((h) => h.text === 'Rules and regulations');
  rows.forEach((r, i) => {
    const id = `rule:${i + 1}`, says = clean(r.rule ?? Object.values(r)[0]), line = head ? head.line + 4 + i : 1;
    const prcs = [...new Set((r.processes ?? '').match(PRC) ?? [])], ents = [...new Set((r.entities ?? '').match(ENT) ?? [])];
    nodes.push({ id, type: 'rule', label: says, group: 'as-is', at: at(asIs.path, head?.anchor ?? null), line, comes_from: clean(r.comes_from ?? '') || undefined });
    govern(id, says, asIs.path, line, prcs, ents);
    table.push({ says, from: clean(r.comes_from ?? ''), prcs, ents });
  });
  for (const [id, d] of own) {
    const doc = c.docs.find((x) => x.path === d.path);
    const next = doc?.headings.find((h) => h.line > d.line && h.level <= 2)?.line ?? Infinity;
    const body = (doc?.text ?? '').split('\n').slice(d.line, next - 1).join('\n');
    const prcs = [...new Set(body.match(PRC) ?? [])], ents = [...new Set(body.match(ENT) ?? [])];
    nodes.push({ id, type: 'rule', label: d.label, group: 'rules', at: at(d.path, d.anchor), line: d.line });
    govern(id, d.label, d.path, d.line, prcs, ents);
    table.push({ says: d.label, from: id, prcs, ents });
  }
  const names = (ids, of) => ids.filter(of).map((x) => `${x} · ${of(x)}`).join('; ');
  const matrix = [{ id: 'rules', title: 'Business rules', group: 'rules', rows: table.map((t) => t.says), cols: ['Comes from', 'Processes', 'Entities'], cells: table.map((t) => [t.from, names(t.prcs, (p) => processes.get(p)), names(t.ents, (e) => entity(e)?.label)]), at: asIs ? at(asIs.path, head?.anchor ?? null) : dir, line: head?.line ?? 1 }];
  return { view: view({ sources: [asIs?.path, ...own.map(([, d]) => d.path)].filter(Boolean), nodes, edges, matrix }), loose: out };
}
