// The five counted checks that nothing went unrecorded (ARCH-11, nothing left unrecorded). Each takes
// text and the change's deltas, and gives { ok, problems }, each problem with what is missing and the
// fix. No model judges any of them (RULE-24).
import { deltaOf, weighChange } from './weight.mjs';

const DLT = /\bDLT-\d+\b/g;
const unique = (xs) => [...new Set(xs)];

/** Every delta of a change, read from `<root>/changes/<CHG>/deltas/`. */
export function changeDeltas(model, change) {
  const prefix = `${model.root}/changes/${change}/deltas/`;
  return model.documents.filter((d) => d.path.startsWith(prefix) && /DLT-\d+[^/]*\.md$/.test(d.path)).map((d) => deltaOf(d.path, d.text));
}

const isRecorded = (d) => /^(assumption|deviation)$/.test(d.type || '');
const clean = (s) => String(s || '').replace(/[`*]/g, '').trim();

/**
 * A PR's **Spec** section: the `## Spec` heading, then one line per kind, `Covers:`, `Assumptions:`
 * and `Deviations:`, each with IDs or `none`. Null when the PR has no such heading.
 */
export function readSpecSection(body) {
  const lines = String(body || '').split(/\r?\n/);
  const start = lines.findIndex((l) => /^#{2,3}\s+Spec\s*$/i.test(l.trim()));
  if (start < 0) return null;
  const out = { covers: [], assumptions: [], deviations: [], said: { covers: false, assumptions: false, deviations: false } };
  for (const l of lines.slice(start + 1)) {
    if (/^#{1,3}\s/.test(l.trim())) break;
    const m = clean(l).replace(/^[-*]\s*/, '').match(/^(covers|ids covered|assumptions?|deviations?)\s*:\s*(.*)$/i);
    if (!m) continue;
    const kind = /^cover|^ids/i.test(m[1]) ? 'covers' : /^assum/i.test(m[1]) ? 'assumptions' : 'deviations';
    out.said[kind] = true;
    out[kind] = kind === 'covers' ? unique(m[2].match(/\b[A-Z][\w.-]*-\d+(?:\.AC\d+)?\b/g) || []) : unique(m[2].match(DLT) || []);
  }
  return out;
}

/**
 * A task commit (ARCH-06, the tasks are commits): the Spec section in its message against the change's
 * deltas. Fails when the section is missing or does not say both kinds (even as `none`), when a listed
 * delta does not exist or is of another kind, or when a delta whose `task` is this one is not listed.
 */
export function checkTaskCommit({ message, deltas, task, change }) {
  return checkSection({ text: message, where: 'the commit', deltas, change, owes: (d) => task && clean(d.task) === task, whose: `belongs to task ${task}` });
}

/** The implementation PR: its Spec section lists every assumption and deviation of the change. */
export function checkImplementationPr({ body, deltas, change }) {
  return checkSection({ text: body, where: 'the PR', deltas, change, owes: () => true, whose: `is of ${change}` });
}

function checkSection({ text, where, deltas, change, owes, whose }) {
  const problems = [];
  const s = readSpecSection(text);
  if (!s) return { ok: false, problems: [{ what: `${where} has no \`## Spec\` section`, fix: 'add it: `Covers:`, `Assumptions:` and `Deviations:`, each with IDs or `none`' }] };
  for (const kind of ['assumptions', 'deviations']) if (!s.said[kind]) problems.push({ what: `the Spec section does not say its ${kind}`, fix: `add \`${kind[0].toUpperCase()}${kind.slice(1)}: none\` if there are none` });
  const byId = new Map(deltas.map((d) => [d.id, d]));
  for (const kind of ['assumptions', 'deviations']) {
    const type = kind.slice(0, -1);
    for (const id of s[kind]) {
      const d = byId.get(id);
      if (!d) problems.push({ what: `${id} is listed as ${type}, and ${change} has no such delta`, fix: `record it in changes/${change}/deltas/${id}.md, or drop it from ${where}` });
      else if (d.type !== type) problems.push({ what: `${id} is listed as ${type}, but it is a ${d.type || 'delta with no type'}`, fix: `list it under ${d.type === 'deviation' ? 'Deviations' : 'Assumptions'}` });
    }
  }
  const listed = new Set([...s.assumptions, ...s.deviations]);
  for (const d of deltas.filter((x) => isRecorded(x) && owes(x) && !listed.has(x.id))) {
    problems.push({ what: `${d.id} (${d.type}) ${whose} and ${where} does not list it`, fix: `add it under ${d.type === 'deviation' ? 'Deviations' : 'Assumptions'}` });
  }
  return { ok: !problems.length, problems, section: s };
}

/** The commit a checklist line names: the last 7-to-40 hex word outside a link (`1.1 triggers · a1b2c3d`). */
const commitOf = (text) => (text.replace(/https?:\/\/\S+/g, ' ').match(/\b[0-9a-f]{7,40}\b/gi) || []).pop()?.toLowerCase() || null;

/**
 * The implementation sub-issue's checklist, as Markdown: one `- [ ]` or `- [x]` line per task, a ticked
 * one naming its commit (ARCH-15, the tasks). `commits` are the full hashes on the implementation branch.
 * Fails on an unticked task, or a ticked one with no commit or with a commit not on the branch.
 */
export function checkChecklist({ checklist, commits }) {
  const items = String(checklist || '').split(/\r?\n/).map((l) => l.match(/^\s*[-*]\s+\[( |x|X)\]\s+(.*)$/)).filter(Boolean)
    .map(([, mark, rest]) => ({ ticked: mark !== ' ', text: rest.trim(), commit: commitOf(rest) }));
  const problems = [];
  if (!items.length) problems.push({ what: 'the checklist holds no task', fix: 'paste the implementation sub-issue\'s checklist, one `- [ ]` line per task' });
  const all = (commits || []).map((c) => c.toLowerCase());
  for (const i of items) {
    const name = i.text.replace(/\s+(?:(?:·|—|-)\s*)?[0-9a-f]{7,40}\s*$/i, '');
    if (!i.ticked) problems.push({ what: `task not done: ${name}`, fix: 'finish it, or take it out of the change through plan' });
    else if (!i.commit) problems.push({ what: `ticked with no commit: ${name}`, fix: 'name its commit on the line (· a1b2c3d)' });
    else if (!all.some((c) => c.startsWith(i.commit))) problems.push({ what: `ticked, but ${i.commit} is not on the implementation branch: ${name}`, fix: `push ${i.commit} to the implementation branch, or untick it` });
  }
  return { ok: !problems.length, problems, items };
}

/**
 * The Acceptance Report against the change's deltas: every delta's ID appears in it, and the assumptions
 * and deviations appear heaviest first (ARCH-23), a lighter one never before a heavier one.
 */
export function checkReport({ report, model, change }) {
  const problems = [];
  const deltas = changeDeltas(model, change);
  const text = String(report || '');
  for (const d of deltas) if (!new RegExp(`\\b${d.id}\\b`).test(text)) problems.push({ what: `${d.id} (${d.type || 'no type'}) is not in the report`, fix: 'verify writes every delta of the change into the Acceptance Report' });
  const order = weighChange(model, change).groups.flatMap((g) => g.items.map((i) => ({ id: i.id, weight: i.weight })));
  const rank = { high: 0, medium: 1, low: 2 };
  const at = (id) => text.search(new RegExp(`\\b${id}\\b`));
  const shown = order.filter((o) => at(o.id) >= 0).sort((a, b) => at(a.id) - at(b.id));
  for (let i = 1; i < shown.length; i++) {
    if (rank[shown[i].weight] < rank[shown[i - 1].weight]) problems.push({ what: `${shown[i].id} (${shown[i].weight}) comes after ${shown[i - 1].id} (${shown[i - 1].weight})`, fix: 'order the assumptions and deviations by weight: pedd weigh ' + change });
  }
  return { ok: !problems.length, problems };
}

/** `acceptance-merge`: every delta of the change has a decision, `keep`, `change` or `reject`. */
export function checkDecisions({ model, change }) {
  const problems = [];
  for (const d of changeDeltas(model, change)) {
    const v = clean(d.decision).toLowerCase();
    if (!['keep', 'change', 'reject'].includes(v)) problems.push({ what: `${d.id} (${d.type || 'no type'}) has ${v ? `"${v}" as` : 'no'} decision`, fix: 'accept decides it: keep, change or reject' });
  }
  return { ok: !problems.length, problems };
}
