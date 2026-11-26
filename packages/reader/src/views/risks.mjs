// risks: a project's RAID log (MKT-18, DEC-34): its risks, assumptions, dependencies and issues, each with its
// probability, impact, owner, response and status, the worst first. From `open/risks.md` (FR-VEW-30).
import { at, clean, isId, view } from './common.mjs';
import { prep } from './prep.mjs';

export const RISK_KINDS = ['risk', 'assumption', 'dependency', 'issue'];
const LEVEL = { low: 1, medium: 2, high: 3 };
const keyOf = (h) => clean(h).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_|_$/g, '');

export function build(model, sources) {
  const c = prep(model, sources);
  const path = `${c.root}/open/risks.md`;
  const doc = c.docOf.get(path);
  const t = doc?.tables.find((x) => /^rsk$/i.test(clean(x.header[0])));
  const rows = (t?.rows ?? []).filter((r) => isId(clean(r.cells[0])));
  if (!rows.length) return { view: view({ sources: [path], empty: { artifact: 'Risks', fill: '`open/risks.md`, a table `RSK` · `Kind` · `What` · `If it happens` · `Probability` · `Impact` · `Owner` · `Response` · `Status`' } }), loose: [] };
  const keys = t.header.map(keyOf);
  const nodes = rows.map((r) => {
    const o = Object.fromEntries(keys.map((k, i) => [k, clean(r.cells[i] ?? '')]));
    const kind = RISK_KINDS.find((k) => o.kind?.toLowerCase().startsWith(k)) ?? 'risk';
    const p = LEVEL[o.probability?.toLowerCase()] ?? 0, i = LEVEL[o.impact?.toLowerCase()] ?? 0;
    return {
      id: o.rsk, type: 'rsk', label: o.what || o.rsk, status: o.status?.toLowerCase() || 'open', group: kind, at: at(path, t.section?.anchor ?? null), line: r.line,
      if_it_happens: o.if_it_happens || undefined, probability: o.probability?.toLowerCase() || undefined, impact: o.impact?.toLowerCase() || undefined,
      score: p * i || undefined, owner: o.owner || undefined, response: o.response || undefined,
    };
  });
  return { view: view({ sources: [path], nodes, edges: [] }), loose: [] };
}
