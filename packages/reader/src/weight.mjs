// weigh · weighChange: the weight of each decision the AI took alone (ARCH-23). A lookup table led by
// Undo, then Evidence and Fan-out move it one level, and a hard trigger makes it high. Every level
// comes with the words that set it, so a person reads why, never a bare label.
import { body, tables } from './markdown.mjs';

export const WEIGHTS = ['high', 'medium', 'low'];
const RANK = { high: 0, medium: 1, low: 2 };
const up = (w) => WEIGHTS[Math.max(0, RANK[w] - 1)];
const down = (w) => WEIGHTS[Math.min(2, RANK[w] + 1)];

// ARCH-23, the table: Undo ↓ · Reach →.
const TABLE = {
  high: { high: 'high', medium: 'high', low: 'medium' },
  medium: { high: 'high', medium: 'medium', low: 'low' },
  low: { high: 'medium', medium: 'low', low: 'low' },
};

/** Fan-out: one level up from this many tasks building on it (ARCH-23, a first cut: Q-23). */
export const FAN_OUT_THRESHOLD = 3;

// The words each factor is read from (ARCH-23, "How pedd reads each factor"). Matched whole, any case.
export const SIGNALS = {
  trigger: {
    permissions: ['permission', 'permissions', 'role', 'roles', 'policy', 'policies', 'rls', 'access control', 'authorization', 'authorisation', 'auth'],
    billing: ['billing', 'payment', 'payments', 'charge', 'charges', 'invoice', 'invoices', 'price', 'prices', 'pricing', 'subscription', 'subscriptions', 'refund', 'refunds', 'stripe'],
    'personal data': ['personal data', 'pii', 'gdpr', 'email address', 'phone number', 'home address', 'date of birth'],
    security: ['security', 'secret', 'secrets', 'access token', 'api key', 'credential', 'credentials', 'password', 'passwords', 'encrypt', 'encryption'],
  },
  undoHigh: {
    migration: ['migration', 'migrations', '.sql', 'database schema'],
    'data already written': ['data already written', 'backfill', 'stored data', 'existing rows'],
    'a public contract': ['public contract', 'public api', 'api route', 'endpoint', 'webhook', 'webhooks'],
    'something sent outside': ['email', 'emails', 'notification sent', 'sms', 'charge sent', 'published'],
  },
  undoLow: {
    copy: ['copy', 'text', 'label', 'labels', 'wording', 'locale', 'locales', 'i18n', 'translation'],
    style: ['style', 'styles', 'css', 'color', 'colour', 'spacing', 'layout', 'icon'],
    configuration: ['configuration', 'config', 'setting', 'settings', 'flag', 'env', '.yaml', '.yml'],
  },
};

// A code span that is one name (`security`, a view) is not read; one that is a path is read word by
// word (`supabase/migrations/…_billing.sql` → billing, sql), keeping its extension.
const words = (s) => ` ${String(s || '').toLowerCase()
  .replace(/`([^`]*)`/g, (_, c) => (/[/.]/.test(c) ? ` ${c.replace(/[/_-]/g, ' ')} ` : ' '))
  .replace(/[*|()[\],;:]/g, ' ').replace(/\s+/g, ' ')} `;
/** The first signal of a group found in the text, as [label, word], or null. */
function find(text, groups) {
  const t = words(text);
  for (const [label, list] of Object.entries(groups)) {
    for (const w of list) {
      const re = w.startsWith('.') ? new RegExp(`${w.replace('.', '\\.')}\\b`) : new RegExp(`(^|[^a-z0-9-])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9-]|$)`);
      if (re.test(t)) return [label, w];
    }
  }
  return null;
}

const ID = /\b(?:N?FR-[A-Z]{2,6}-\d+(?:\.AC\d+)?|(?:BIZ|MKT|MKG|ENT|RULE|ARCH|DEC|ADR|Q|CHG|DLT|PRC|SEC|INT|EVT)-\d+)\b/g;
const PATH = /`([\w@.-]+\/[\w@./-]+|[\w-]+\.(?:mjs|js|ts|tsx|sql|md|json|yaml|yml|css))`/g;

/** The files a field names in backticks: `packages/reader/src/map.mjs` (`mapData`) → the path. */
export const pathsIn = (s) => [...String(s || '').matchAll(PATH)].map((m) => m[1]);

/** The module a path belongs to: `apps/app/…` → apps/app, `spec/modules/views/…` → spec/modules/views. */
const moduleOf = (p) => {
  const parts = p.split('/');
  if (parts[0] === 'spec' && parts[1] === 'modules') return parts.slice(0, 3).join('/');
  if (['apps', 'packages', 'services', 'modules'].includes(parts[0])) return parts.slice(0, 2).join('/');
  return parts[0];
};

/**
 * The weight of one item: a delta (`assumption`, `deviation`) or a sweep question, as its fields.
 *
 * @param item  { target, reason, revert, evidence, if_no, alternative }: text, as written.
 * @param opts.dependents  how many tasks (or, for a sweep question, questions) build on it; unknown
 *   when absent, and then Fan-out is not applied.
 * @returns { weight, table, factors: { undo, reach, evidence, fanOut }, triggers, says, missing }
 *   where each factor is { level, why }.
 */
export function weigh(item, { dependents } = {}) {
  const all = [item.target, item.reason, item.revert, item.if_no, item.alternative].join(' ');
  const missing = ['revert', 'evidence', 'if_no'].filter((f) => !String(item[f] || '').trim());

  // Undo, from `revert`. Nothing written there is read as hard to undo: nobody said how.
  let undo;
  const hard = find(item.revert, SIGNALS.undoHigh);
  const easy = find(item.revert, SIGNALS.undoLow);
  if (!String(item.revert || '').trim()) undo = { level: 'high', why: 'no revert written' };
  else if (hard) undo = { level: 'high', why: `hard to undo (${hard[0]})` };
  else if (easy) undo = { level: 'low', why: `easy to undo (${easy[0]})` };
  else undo = { level: 'medium', why: 'logic or an internal contract' };

  // Reach, from `target` and the files of `revert`.
  const targets = String(item.target || '').match(ID) || [];
  const modules = [...new Set(pathsIn(item.revert).filter((p) => p.includes('/')).map(moduleOf))];
  let reach;
  if (targets.some((t) => t.startsWith('ENT-'))) reach = { level: 'high', why: `the data model (${targets.find((t) => t.startsWith('ENT-'))})` };
  else if (modules.length > 1) reach = { level: 'high', why: `more than one module (${modules.join(', ')})` };
  else if (hard?.[0] === 'migration') reach = { level: 'high', why: 'the data model (a migration)' };
  else if (targets.some((t) => /^N?FR-/.test(t))) reach = { level: 'medium', why: `behavior a user sees (${targets.find((t) => /^N?FR-/.test(t))})` };
  else if (targets.some((t) => /^(ARCH|ADR|SEC|INT|EVT)-/.test(t))) reach = { level: 'medium', why: `how it is built (${targets.find((t) => /^(ARCH|ADR|SEC|INT|EVT)-/.test(t))})` };
  else reach = { level: 'low', why: 'internal, or one screen' };

  // Evidence, from `evidence`.
  const ev = String(item.evidence || '').trim();
  let evidence;
  if (!ev || /^guess\b/i.test(ev)) evidence = { level: 'high', why: ev ? 'a guess' : 'no evidence written' };
  else if (/^(inferred|from)\b/i.test(ev)) evidence = { level: 'medium', why: `inferred (${ev.replace(/^(inferred|from)\s*/i, '').slice(0, 60) || 'another requirement'})` };
  else if ((ev.match(ID) || []).length || pathsIn(ev).length || /\/[\w.-]+\.\w+/.test(ev)) evidence = { level: 'low', why: `backed (${[...(ev.match(ID) || []), ...pathsIn(ev)][0] || ev.slice(0, 60)})` };
  else evidence = { level: 'medium', why: 'stated, not cited' };

  const fanOut = dependents === undefined || dependents === null
    ? { level: null, why: 'fan-out unknown' }
    : { level: dependents >= FAN_OUT_THRESHOLD ? 'high' : 'low', why: `${dependents} build on it` };

  const table = TABLE[undo.level][reach.level];
  let weight = table;
  if (evidence.level === 'low') weight = down(weight);
  if (evidence.level === 'high') weight = up(weight);
  if (fanOut.level === 'high') weight = up(weight);

  const triggers = [];
  for (const [label, list] of Object.entries(SIGNALS.trigger)) {
    const hit = find(all, { [label]: list }) || (label === 'security' && targets.some((t) => t.startsWith('SEC-')) ? [label, 'SEC'] : null);
    if (hit) triggers.push(label);
  }
  if (triggers.length) weight = 'high';

  const says = [weight, ...triggers.map((t) => `touches ${t}`), undo.why, reach.why, evidence.why, ...(fanOut.level === 'high' ? [fanOut.why] : [])].join(' · ');
  return { weight, table, factors: { undo, reach, evidence, fanOut }, triggers, says, missing };
}

/** A delta file's fields: its `Field | Value` table, with its ID and title from the heading. */
export function deltaOf(path, text) {
  const t = tables(body(text)).find((x) => /^field$/i.test(x.header[0].replace(/`/g, '')));
  const fields = Object.fromEntries((t?.rows || []).map(([k, v = '']) => [k.replace(/`/g, '').trim(), v.trim()]));
  const head = body(text).match(/^#\s+(DLT-\d+)\s+·\s+(.*)$/m);
  if (fields.type) fields.type = fields.type.replace(/`/g, '').trim();
  return { id: head?.[1] || path.match(/DLT-\d+/)?.[0] || path, title: head?.[2]?.replace(/`/g, '') || '', path, ...fields };
}

/**
 * Every `assumption` and `deviation` of a change, weighed, grouped and ordered heaviest first
 * (ARCH-23, grouping): items with the same target and reason are one decision, at the weight of the
 * heaviest. Other delta types are listed apart, unweighed.
 *
 * @param model  what `readSpec` gives.
 * @param change  `CHG-nnn`.
 * @param opts.dependents  { [DLT-nnnn]: n } for Fan-out, when the plan's dependencies are known.
 */
export function weighChange(model, change, { dependents = {} } = {}) {
  const prefix = `${model.root}/changes/${change}/deltas/`;
  const docs = model.documents.filter((d) => d.path.startsWith(prefix) && /DLT-\d+\.md$/.test(d.path));
  if (!docs.length) return { change, groups: [], other: [], found: false };
  const deltas = docs.map((d) => deltaOf(d.path, d.text));
  const weighed = deltas.filter((d) => /assumption|deviation/.test(d.type || '')).map((d) => ({ ...d, ...weigh(d, { dependents: dependents[d.id] }) }));
  const other = deltas.filter((d) => !/assumption|deviation/.test(d.type || '')).map((d) => ({ id: d.id, title: d.title, type: d.type || '', path: d.path }));
  const key = (d) => `${(String(d.target).match(ID) || [d.target]).join(',')}|${String(d.reason || '').toLowerCase().trim()}`;
  const byKey = new Map();
  for (const d of weighed) {
    if (!byKey.has(key(d))) byKey.set(key(d), []);
    byKey.get(key(d)).push(d);
  }
  const groups = [...byKey.values()].map((items) => {
    const sorted = items.sort((a, b) => RANK[a.weight] - RANK[b.weight] || a.id.localeCompare(b.id));
    return { weight: sorted[0].weight, items: sorted };
  }).sort((a, b) => RANK[a.weight] - RANK[b.weight] || a.items[0].id.localeCompare(b.items[0].id));
  return { change, groups, other, found: true };
}
