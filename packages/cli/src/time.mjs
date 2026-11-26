// Human time (ENT-23, DEC-35): the hours of people, from the `human` events, by stage, person, piece
// kind and credit. Each message counts the time until the same person's next one, when under 15
// minutes; the last before a pause counts 2. That time belongs to the message's step.
import { stepsOf } from './steps.mjs';

export const GAP = 15 * 60e3, LAST = 2 * 60e3;
export const OUTSIDE = 'outside any step';
export const NO_PIECE = 'no piece kind';

/** Each human event with the milliseconds it counts. */
export function weighMessages(events) {
  const byPerson = new Map();
  for (const e of events) {
    if (e.kind !== 'human' || !e.at) continue;
    const t = Date.parse(e.at);
    if (Number.isNaN(t)) continue;
    if (!byPerson.has(e.actor)) byPerson.set(e.actor, []);
    byPerson.get(e.actor).push({ ...e, t });
  }
  const out = [];
  for (const list of byPerson.values()) {
    list.sort((a, b) => a.t - b.t);
    list.forEach((m, i) => {
      const next = list[i + 1];
      const dt = next ? next.t - m.t : Infinity;
      out.push({ ...m, ms: dt < GAP ? dt : LAST });
    });
  }
  return out;
}

const add = (map, key, ms) => map.set(key, (map.get(key) || 0) + ms);

/**
 * The report, for the whole product or narrowed to a change or a PRD.
 * @param catalog  { [piece kind]: credits }, from workspace.yaml `pieces`.
 */
export function humanTime(events, { change = null, prd = null, since = null, until = null, catalog = {} } = {}) {
  const steps = stepsOf(events);
  const scoped = !!(change || prd);
  const inScope = (s) => (!change || s.change === change) && (!prd || s.prd === prd);
  const from = since ? Date.parse(since) : -Infinity, to = until ? Date.parse(until) + 86400e3 : Infinity;

  const byStage = new Map(), byPerson = new Map(), byKind = new Map(), byKindStage = new Map(), byStep = new Map();
  let total = 0, messages = 0;
  for (const m of weighMessages(events)) {
    if (m.t < from || m.t >= to) continue;
    const s = m.step ? steps.get(m.step) : null;
    if (scoped && !(s && inScope(s))) continue;
    total += m.ms; messages++;
    add(byPerson, m.actor || 'unknown', m.ms);
    const stage = s ? s.stage : OUTSIDE;
    add(byStage, stage, m.ms);
    if (s) add(byStep, s.id, m.ms);
    const kinds = s ? (s.pieces?.length ? s.pieces : [NO_PIECE]) : [OUTSIDE];
    for (const k of kinds) {
      add(byKind, k, m.ms / kinds.length);
      add(byKindStage, `${k}\u0000${stage}`, m.ms / kinds.length);
    }
  }

  // The pieces in scope, each counted once: by its key in its PRD (form.compound#2), so the specify and
  // the design of one flow are one piece; a step that named its kinds by hand counts its own.
  const instances = new Map();
  for (const s of steps.values()) {
    if (!inScope(s) || !byStep.has(s.id)) continue;
    (s.pieces || []).forEach((k, i) => instances.set(`${s.prd || ''}|${s.piece_keys?.[i] || `${k}@${s.id}#${i}`}`, k));
  }
  const count = {};
  for (const k of instances.values()) count[k] = (count[k] || 0) + 1;
  const credits = Object.entries(count).reduce((sum, [k, n]) => sum + (Number(catalog[k]) || 0) * n, 0);

  const h = (ms) => ms / 3600e3;
  const rows = (map) => [...map.entries()].sort((a, b) => b[1] - a[1]).map(([key, ms]) => ({ key, hours: h(ms) }));
  const kinds = rows(byKind).map((r) => {
    const weight = Number(catalog[r.key]) || null;
    const n = count[r.key] || 0;
    return { kind: r.key, hours: r.hours, pieces: n, credits: weight ? weight * n : null, hoursPerCredit: weight && n ? r.hours / (weight * n) : null };
  });
  return {
    scope: change || prd ? { change, prd } : 'product',
    messages, hours: h(total), credits: credits || null,
    hoursPerCredit: credits ? h([...byKind.entries()].filter(([k]) => catalog[k]).reduce((a, [, ms]) => a + ms, 0)) / credits : null,
    byStage: rows(byStage).map((r) => ({ stage: r.key, hours: r.hours, hoursPerCredit: credits && r.key !== OUTSIDE ? r.hours / credits : null })),
    byPerson: rows(byPerson).map((r) => ({ person: r.key, hours: r.hours })),
    byKind: kinds,
    byKindStage: rows(byKindStage).map((r) => { const [kind, stage] = r.key.split('\u0000'); return { kind, stage, hours: r.hours }; }),
  };
}

/** The report as text. */
export function formatTime(r) {
  const f = (x) => (x == null ? '—' : x.toFixed(2));
  const table = (head, list) => {
    const w = head.map((c, i) => Math.max(c.length, ...list.map((row) => String(row[i]).length)));
    return [head, ...list].map((row) => row.map((c, i) => (i === 0 ? String(c).padEnd(w[i]) : String(c).padStart(w[i]))).join('  ')).join('\n');
  };
  const scope = r.scope === 'product' ? 'the product' : [r.scope.change, r.scope.prd].filter(Boolean).join(' · ');
  const out = [`Human time, ${scope}: ${f(r.hours)} h from ${r.messages} message(s)${r.credits ? ` · ${r.credits} credit(s) · ${f(r.hoursPerCredit)} h per credit` : ''}`];
  if (!r.messages) return out.concat('  No human events: is the clock installed? pedd init').join('\n');
  out.push('', 'By stage', table(['stage', 'hours', 'h/credit'], r.byStage.map((x) => [x.stage, f(x.hours), f(x.hoursPerCredit)])));
  out.push('', 'By person', table(['person', 'hours'], r.byPerson.map((x) => [x.person, f(x.hours)])));
  out.push('', 'By piece kind', table(['kind', 'hours', 'pieces', 'credits', 'h/credit'], r.byKind.map((x) => [x.kind, f(x.hours), x.pieces, x.credits ?? '—', f(x.hoursPerCredit)])));
  out.push('', 'By piece kind and stage', table(['kind', 'stage', 'hours'], r.byKindStage.map((x) => [x.kind, x.stage, f(x.hours)])));
  out.push('', 'A step on several kinds splits its time evenly among them (DEC-35).');
  return out.join('\n');
}
