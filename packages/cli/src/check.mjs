// pedd check: the spec checks, on the model @openpedd/reader gives (DEC-26).
//
//   frontmatter   each document's frontmatter reads, and carries the fields every document starts with
//   links         relative links to a missing file or anchor
//   size          token budgets per document (RULE-04): fails only when one over budget grows
//   status        each PRD's status is that of its least advanced requirement (DEC-28, ENT-03)
//   history       each line of history.jsonl is JSON with every field
//   loose         nothing stands alone (RULE-27): fails on each loose item the change adds or touches,
//                 lists the rest as pressure (modules/views, loose items)
//
// Each check gives { name, failures: [{ path, line?, message }], warnings: [...] }.
import { existsSync } from 'node:fs';
import { join, posix } from 'node:path';
import { REQUIREMENT_STATUSES, leastAdvanced, markdown } from '@openpedd/reader';

export const CHECKS = ['frontmatter', 'links', 'size', 'status', 'history', 'loose'];

const FIELDS = ['title', 'description', 'owner', 'version', 'updated'];
const HISTORY_FIELDS = ['path', 'version', 'date', 'change', 'story', 'stage', 'summary'];

/** English prose averages about 4 characters per token (RULE-04). */
export const tokens = (text) => Math.ceil(text.length / 4);

/** The budget of a document by its layer (RULE-04), with workspace.yaml's `budgets` over the defaults. */
export function budgetOf(path, spec, budgets = {}) {
  const rel = path.startsWith(`${spec}/`) ? path.slice(spec.length + 1) : null;
  if (rel === null) return null;
  const b = { modules: 4000, foundations: 2000, glossary: 4000, decisions: 1000, open: 2000, deltas: 1000, ...budgets };
  if (rel === 'foundations/glossary.md') return b.glossary;
  if (/^changes\/(archive\/)?CHG-\d+\/deltas\//.test(rel)) return b.deltas;
  return b[rel.split('/')[0]] ?? null;
}

const isDefinition = (path, spec) => new RegExp(`^${spec}/changes/(archive/)?CHG-\\d+/definition\\.md$`).test(path);

function frontmatterCheck(model, { spec }) {
  const failures = [], warnings = [];
  for (const p of model.problems.filter((x) => x.kind === 'frontmatter')) failures.push({ path: p.path, line: p.line, message: p.message });
  for (const d of model.documents) {
    if (!d.path.startsWith(`${spec}/`) || isDefinition(d.path, spec)) continue;
    if (!d.hasFrontmatter) { warnings.push({ path: d.path, message: 'no frontmatter' }); continue; }
    if (d.frontmatterProblems.length) continue;
    const missing = FIELDS.filter((f) => !d.frontmatter[f]);
    if (missing.length) failures.push({ path: d.path, line: 1, message: `the frontmatter lacks ${missing.map((f) => `\`${f}\``).join(', ')}` });
  }
  return { failures, warnings };
}

function linksCheck(model, { root }) {
  const failures = [];
  const anchors = new Map(model.documents.map((d) => [d.path, new Set(d.headings.flatMap((h) => [h.anchor, markdown.slug(h.text)]))]));
  for (const d of model.documents) {
    const text = markdown.stripCode(d.text);
    for (const [, target] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^(https?:|mailto:)/.test(target)) continue;
      const [file, anchor] = target.split('#');
      const resolved = file ? posix.normalize(posix.join(posix.dirname(d.path), file)) : d.path;
      if (!anchors.has(resolved) && !existsSync(join(root, resolved))) { failures.push({ path: d.path, message: `→ ${target}: file not found` }); continue; }
      if (anchor && resolved.endsWith('.md') && !(anchors.get(resolved)?.has(anchor))) failures.push({ path: d.path, message: `→ ${target}: anchor not found` });
    }
  }
  return { failures, warnings: [] };
}

function sizeCheck(model, { spec, budgets, before }) {
  const failures = [], warnings = [];
  for (const d of model.documents) {
    const budget = budgetOf(d.path, spec, budgets);
    if (!budget) continue;
    const now = tokens(d.text);
    if (now <= budget) continue;
    const was = before(d.path);
    if (was == null || now > tokens(was)) failures.push({ path: d.path, message: `${now} tokens, budget ${budget}` });
    else warnings.push({ path: d.path, message: `${now} tokens, budget ${budget} (did not grow)` });
  }
  return { failures, warnings };
}

function statusCheck(model) {
  const failures = [];
  const known = (s) => REQUIREMENT_STATUSES.includes(s);
  for (const prd of model.prds) {
    if (prd.status && !known(prd.status)) failures.push({ path: prd.path, line: 1, message: `status \`${prd.status}\` is not one of ${REQUIREMENT_STATUSES.join(', ')}` });
    const own = prd.requirements.filter((r) => r.statusFrom === 'column');
    for (const r of own) if (!known(r.status)) failures.push({ path: prd.path, message: `${r.id}: status \`${r.status}\` is not one of ${REQUIREMENT_STATUSES.join(', ')}` });
    // DEC-28: without the column, each requirement shows the PRD's status, so there is nothing to disagree.
    if (!own.length || !prd.status) continue;
    const least = leastAdvanced(prd.requirements.map((r) => r.status));
    if (least && least !== prd.status) failures.push({ path: prd.path, line: 1, message: `status \`${prd.status}\`, but its least advanced requirement is \`${least}\` (DEC-28)` });
  }
  return { failures, warnings: [] };
}

function historyCheck(model, { spec }) {
  const failures = [], warnings = [];
  const path = `${spec}/history/history.jsonl`;
  model.history.forEach((h, i) => {
    if (h.error) { failures.push({ path, line: h.line, message: h.error }); return; }
    const missing = HISTORY_FIELDS.filter((f) => !(f in h));
    if (missing.length) failures.push({ path, line: i + 1, message: `lacks ${missing.join(', ')}` });
    const n = tokens(JSON.stringify(h));
    if (n > 80) warnings.push({ path, line: i + 1, message: `${n} tokens, budget 80 (RULE-04)` });
  });
  return { failures, warnings };
}

/** The key of a loose item that stays the same when only its line moves. */
export const looseKey = (l) => `${l.view}|${l.kind}|${l.id}|${l.at}|${l.message}`;

/**
 * RULE-27, F3: a loose item fails when the change adds it (it is not among the base's) or touches it
 * (its file changed); the rest is pressure, like a document over budget that did not grow.
 * Without a base to compare with, every loose item is the change's.
 */
function looseCheck(model, { loose }) {
  const failures = [], warnings = [];
  if (!loose) return { failures, warnings };
  const old = loose.base ? new Set(loose.base.map(looseKey)) : null;
  for (const l of loose.now) {
    // An item on another change branch (`feat/x:spec/…`) is that change's, never this one's.
    const other = /^[^:/][^:]*:/.test(l.at);
    const file = l.at.replace(/^[^:]+:/, '').split('#')[0];
    const item = { path: file, line: l.line, message: `${l.says === l.id ? `\`${l.id}\`` : `"${l.says}" (${l.id})`} ${l.message} · ${l.view}`, loose: l };
    const touched = !other && (!old || !old.has(looseKey(l)) || (loose.changed && loose.changed.has(file)));
    (touched ? failures : warnings).push(item);
  }
  return { failures, warnings };
}

const RUN = { frontmatter: frontmatterCheck, links: linksCheck, size: sizeCheck, status: statusCheck, history: historyCheck, loose: looseCheck };

/**
 * Runs the checks on a model.
 *
 * @param opts.root     the working tree, for link targets that are not text files.
 * @param opts.spec     the spec's folder.
 * @param opts.budgets  workspace.yaml's `budgets`.
 * @param opts.before   path → its text at the commit to compare against, or null; for `size`.
 * @param opts.only     the checks to run; every one by default.
 * @param opts.loose    for `loose`: { now, base, changed }, the loose items of the working tree and of the
 *                      base (null when there is none), and the paths changed against it.
 */
export function runChecks(model, { root, spec = 'spec', budgets = {}, before = () => null, only = CHECKS, loose = null } = {}) {
  return only.map((name) => {
    if (!RUN[name]) throw new Error(`unknown check "${name}": ${CHECKS.join(', ')}`);
    return { name, ...RUN[name](model, { root, spec, budgets, before, loose }) };
  });
}
