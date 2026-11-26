// The commands of `pedd`, with their arguments read. Each returns an exit code.
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { isAsked, pendingFor, readSpec, viewData, weighChange } from '@openpedd/reader';
import { readFiles } from '@openpedd/reader/files';
import { BranchError, cutChange, cutChild, cutEdit, renameChange } from './branch.mjs';
import { checkBranch } from './branch-check.mjs';
import { CHECKS, runChecks } from './check.mjs';
import { Git } from './git.mjs';
import { changedPaths, filesAt, viewSources } from './sources.mjs';
import { RecordsError, records } from './records.mjs';
import { SweepError, answer as sweepAnswer, sweep as runSweep } from './sweep.mjs';
import { ViewError, buildViews, firstView, mermaidOf, openInBrowser, viewLocale, viewTarget, watchViews, writeViews } from './view.mjs';
import { readWorkspace } from './workspace.mjs';
import { VERSION } from './version.mjs';

const red = (s) => `\x1b[31m${s}\x1b[0m`, yellow = (s) => `\x1b[33m${s}\x1b[0m`, green = (s) => `\x1b[32m${s}\x1b[0m`;

/** The commands the spec names (capabilities.md, CLI) that this version does not build, and why. */
export const NOT_BUILT = {
  init: 'onboarding a project (modules/workspace): the template is copied by hand for now',
  doctor: 'needs the stack detection and the baseline gaps (modules/workspace)',
  update: 'needs the manifest pedd init writes (.pedd/manifest.json)',
  install: 'needs the skills, judges and MCP to install; it will also install the permission rule that denies agents git checkout -b',
  index: 'the spec graph and the code index (ARCH-05, ARCH-19) are specified, not built',
  status: 'needs the spec graph of pedd index (modules/trace)',
  trace: 'needs the trace links (modules/trace)',
  impact: 'needs the spec graph and the code index',
  overlap: 'needs each change\'s footprint from the index (ARCH-17)',
  sync: 'needs pedd overlap (ARCH-17)',
  land: 'needs pedd overlap and the queue (ARCH-17)',
  adopt: 'needs pedd doctor and the baseline gaps',
  launch: 'needs the release adapters (ARCH-08)',
  judges: 'pedd judges bench needs the judges and past changes with known findings (ARCH-04)',
  workspace: 'pedd workspace split needs the split layout tooling (ARCH-03)',
};

const HELP = `pedd ${VERSION}

  pedd check [--only ${CHECKS.join(',')}] [--against <ref>] [--root <dir>] [--json]
      The spec checks. --against: the commit the change is compared with (default HEAD): a document
      over budget fails if it grew, a loose item if the change adds or touches it.

  pedd view [<kind> [<id>]] [--depth <n>] [--format mermaid] [--locale <code>] [--watch] [--no-open] [--root <dir>]
      Every view of the spec as a map, in .pedd/view/: stages, decisions, entities, states, security,
      context, code, business, org, activity, prd, use-cases, glossary, trace, changes. <kind> <id> opens one view on that ID; --format mermaid
      prints it instead; --watch rebuilds it on each save. Names show by their Glossary label in --locale,
      the prose's language by default.

  pedd branch change <slug> [--track full|story|fix|chore|hotfix]    (also: pedd branch request <slug>)
      A change's branch, from the base (a hotfix: from production), numbered CHG-nnn, holding only
      its changes/<CHG>/definition.md, pushed.
  pedd branch design <change>          design/{slug}, from the change branch
  pedd branch architecture <change>    arch/{slug}, from the change branch
  pedd branch implementation <change>  impl/{slug}, from the change branch; returned as it is when it exists.
      Every task is one commit on it, never a branch or a PR of its own (also: pedd branch impl)
  pedd branch edit <change>            edit/{change}-{n}, from the change branch of an agreed request
  pedd branch rename <change> --track <track> [--key <issue key>]
      The rename at spec-approval: feat/automations → feat/rec-412-automations.
  pedd branch check [--head <branch>] [--target <branch>] [--sha <commit>]
      The CI branch check: the head's name, its target and where it was cut from.

      <change> is CHG-nnn or the change branch's name. --no-push builds the branch without pushing.
      --remote <name> (default origin).

  pedd sweep <change> [--stages specify,architect,design,plan] [--all] [--ask-all] [--accept-recommended]
             [--from <dir>] [--json]
      Every question the stages ahead of a change still have, in one sheet (ARCH-16): one finder per
      stage, a session that only reads (workspace.yaml agents.finder, default claude -p with read-only
      tools), merged, weighed, the high ones asked and the rest shown decided. Writes
      <spec>/changes/<change>/sweep.md. --from: a folder of <stage>.json findings instead of finders.
  pedd sweep <change> answer [--as client|builder] "all as recommended, except 3: b, 7: monthly"
      The one reply: records each answer, says where it goes, reopens what an answer changed. The client
      answers the specify questions, the product engineer the architect and design ones; --as takes
      only that person's. The plan's are decided by the AI.

  pedd records <change> commit|pr|tasks|report|accept [--json]
      That nothing went unrecorded (ARCH-11), counted, never judged:
        commit  a task commit's Spec section against the task's deltas: --commit <ref> (default HEAD);
                the task from --task, or the ID that opens the subject (feat(x): 1.1 … → 1.1)
        pr      the implementation PR's Spec section against every delta of the change: --body <file|->
                or the GitHub event
        tasks   every task of the checklist ticked with its commit: --checklist <file|->, the commits
                read from --branch (default HEAD)
        report  every delta in the Acceptance Report, heaviest first: changes/<change>/reports/, or --report
        accept  every delta decided: keep, change or reject

  pedd weigh <change> [--fan-out DLT-0001=3,DLT-0002=1] [--root <dir>] [--json]
      The weight of each assumption and deviation of a change, high, medium or low, with the factors
      that set it, heaviest first, those with the same target and reason grouped (ARCH-23).
      --fan-out: how many tasks build on each, while the plan's dependencies are not read.

  pedd version · pedd help

Not built yet: ${Object.keys(NOT_BUILT).join(', ')}. Run one for why.`;

/** Reads `--flag value` and `--flag` (boolean) options out of the arguments. */
function options(args, booleans = []) {
  const opts = {}, rest = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!a.startsWith('--')) { rest.push(a); continue; }
    const key = a.slice(2);
    if (booleans.includes(key)) opts[key] = true;
    else opts[key] = args[++i];
  }
  return { opts, rest };
}

/** The loose items of the working tree and of the base, and what changed between them (F3). */
function looseState(root, ws, files, model, against) {
  const sources = viewSources(root, ws, files);
  const now = viewData(model, sources).loose;
  const baseFiles = filesAt(root, against, [ws.spec]);
  if (!baseFiles) return { now, base: null, changed: null };
  // The base keeps the working tree's other sources: only the spec is compared.
  const base = viewData(readSpec(baseFiles, { root: ws.spec }), { ...sources }).loose;
  return { now, base, changed: changedPaths(root, against) };
}

async function check(args, { cwd, out }) {
  const { opts } = options(args, ['json']);
  const root = resolve(cwd, opts.root || '.');
  const ws = readWorkspace(root);
  const files = readFiles(root);
  const model = readSpec(files, { root: ws.spec });
  const against = opts.against || 'HEAD';
  const before = (path) => {
    try { return execFileSync('git', ['show', `${against}:${path}`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch { return null; }
  };
  const only = opts.only ? opts.only.split(',') : CHECKS;
  const loose = only.includes('loose') ? looseState(root, ws, files, model, against) : null;
  const results = runChecks(model, { root, spec: ws.spec, budgets: ws.budgets, before, only, loose });
  if (opts.json) {
    out(JSON.stringify({ against, checks: results }, null, 2));
    return results.some((r) => r.failures.length) ? 1 : 0;
  }
  let failed = 0;
  for (const r of results) {
    const where = (f) => `${f.path}${f.line ? `:${f.line}` : ''}`;
    for (const f of r.failures) out(red(`✗ ${r.name} · ${where(f)}: ${f.message}`));
    for (const w of r.warnings) out(yellow(`! ${r.name} · ${where(w)}: ${w.message}`));
    out(r.failures.length ? red(`✗ ${r.name}: ${r.failures.length} problem(s)`) : green(`✓ ${r.name}`));
    failed += r.failures.length;
  }
  return failed ? 1 : 0;
}

async function view(args, { cwd, out, err }) {
  const { opts, rest } = options(args, ['watch', 'no-open']);
  const root = resolve(cwd, opts.root || '.');
  const target = viewTarget(rest, opts);
  const locale = viewLocale(root, opts.locale);
  if (opts.format === 'mermaid') { out(mermaidOf(buildViews(root), target, locale).trimEnd()); return 0; }
  const summary = (data) => {
    const n = data.loose.length;
    out(`${green('✓')} ${Object.values(data.views).filter((v) => !v.empty).length} of ${Object.keys(data.views).length} views, ${n ? yellow(`${n} loose`) : 'nothing loose'}`);
  };
  if (opts.watch) {
    const w = await watchViews(root, { open: target.kind ? target : null, port: Number(opts.port) || 0, locale, onBuild: (data, e) => (e ? err(red(`✗ ${e.message}`)) : summary(data)) });
    out(`Serving the views on ${w.url} · rebuilt on each save of the spec · ctrl-c to stop`);
    if (!opts['no-open']) openInBrowser(w.url);
    await new Promise((done) => process.once('SIGINT', () => { w.close(); done(); }));
    return 0;
  }
  const data = buildViews(root);
  const open = target.kind ? target : { kind: firstView(data) };
  const page = writeViews(root, data, open, { locale });
  summary(data);
  out(`  ${page}${target.kind ? ` · opens on ${target.kind}${target.id ? ` ${target.id}` : ''}` : ` · opens on ${open.kind}`}`);
  if (!opts['no-open'] && !process.env.CI) openInBrowser(page);
  return 0;
}

function weighCmd(args, { cwd, out, err }) {
  const { opts, rest } = options(args, ['json']);
  const change = rest[0];
  if (!/^CHG-\d+$/.test(change || '')) { err(red('✗ usage: pedd weigh CHG-nnn [--json]')); return 2; }
  const root = resolve(cwd, opts.root || '.');
  const ws = readWorkspace(root);
  const model = readSpec(readFiles(root), { root: ws.spec });
  const dependents = Object.fromEntries((opts['fan-out'] || '').split(',').filter(Boolean).map((kv) => {
    const [id, n] = kv.split('=');
    return [id.trim(), Number(n)];
  }));
  const r = weighChange(model, change, { dependents });
  if (opts.json) { out(JSON.stringify(r, null, 2)); return r.found ? 0 : 1; }
  if (!r.found) { err(red(`✗ ${change} has no deltas in ${ws.spec}/changes/${change}/deltas/`)); return 1; }
  const color = { high: red, medium: yellow, low: green };
  const n = r.groups.reduce((a, g) => a + g.items.length, 0);
  out(`${change}: ${n} assumption(s) and deviation(s), ${r.groups.length} decision(s), heaviest first`);
  for (const g of r.groups) {
    const lead = g.items[0];
    out(`${color[g.weight](g.weight.padEnd(6))} ${lead.title || lead.id} (${g.items.map((i) => i.id).join(', ')})`);
    for (const i of g.items) {
      out(`       ${i.says.replace(/^\w+ · /, '')}`);
      if (i.missing.length) out(yellow(`       ! ${i.id} does not write ${i.missing.map((f) => `\`${f}\``).join(', ')}`));
    }
  }
  if (r.other.length) out(`Not weighed (${r.other.map((o) => o.type || 'no type').filter((v, k, a) => a.indexOf(v) === k).join(', ')}): ${r.other.map((o) => o.id).join(', ')}`);
  return 0;
}

async function sweepCmd(args, { cwd, out, err }) {
  const { opts, rest } = options(args, ['all', 'ask-all', 'accept-recommended', 'json']);
  const [change, sub, ...words] = rest;
  const root = resolve(cwd, opts.root || '.');
  const ws = readWorkspace(root);
  const color = { high: red, medium: yellow, low: green };
  if (sub === 'answer') {
    const r = sweepAnswer(root, ws, change, words.join(' '), { who: opts.as || null });
    if (opts.json) { out(JSON.stringify(r.state, null, 2)); return 0; }
    const answered = r.state.questions.filter((q) => q.answer);
    out(`${change}: ${answered.length} of ${r.state.questions.length} answered · ${r.paths.sheet}`);
    for (const q of answered) out(`  ${String(q.n).padStart(2)} ${q.answer.open ? yellow('open') : q.answer.by === 'person' ? green('you ') : 'rec '} ${q.about} → ${q.answer.goesTo.replace(/`/g, '')}`);
    if (r.unknown.length) err(yellow(`! no question numbered ${r.unknown.join(', ')}`));
    if (r.reopened.length) out(yellow(`Round ${r.state.round}: ${r.reopened.join(', ')} assumed an answer you changed. pedd sweep ${change} rewrites only those; then answer them.`));
    return 0;
  }
  if (sub) throw new SweepError(`pedd sweep ${change} ${sub}: the only subcommand is answer`);
  const model = readSpec(readFiles(root), { root: ws.spec });
  const stages = opts.stages ? opts.stages.split(',').map((s) => s.trim()).filter(Boolean) : null;
  const r = await runSweep(root, ws, model, change, { stages, all: opts.all, askAll: opts['ask-all'], acceptRecommended: opts['accept-recommended'], from: opts.from });
  if (opts.json) { out(JSON.stringify(r.state, null, 2)); return r.state.notRun.length ? 1 : 0; }
  const s = r.state;
  if (r.round === 2) {
    const open = s.questions.filter((q) => q.reopened && !q.answer);
    out(`${change}: round 2 · ${open.length} question(s) rewritten with your answers · ${r.paths.sheet}`);
    for (const q of open) out(`  ${String(q.n).padStart(2)} ${color[q.weight](q.weight.padEnd(6))} ${q.about}`);
    for (const n of s.notRun) err(red(`✗ the ${n.stage} finder did not run: ${n.why}`));
    if (open.length) out(`  Answer them: pedd sweep ${change} answer "${open[0].n}: a"`);
    return s.notRun.length ? 1 : 0;
  }
  if (!s.ran.length && !s.notRun.length) { out(`${change}: no stage ahead to sweep (its PRDs are ${r.where.least}); --all sweeps every stage`); return 0; }
  const pending = pendingFor(s);
  const asked = s.questions.filter((q) => isAsked(q, { askAll: s.askAll }) && !q.answer);
  const byAi = s.questions.filter((q) => q.answer?.by === 'ai').length;
  out(`${change}: swept ${s.ran.join(', ') || 'nothing'} · ${s.questions.length} question(s): ${pending.client} for the client, ${pending.builder} for the product engineer, ${s.questions.length - asked.length - byAi} decided by recommendation, ${byAi} decided by the AI · ${s.dropped.length} already answered`);
  for (const q of s.questions) out(`  ${String(q.n).padStart(2)} ${color[q.weight](q.weight.padEnd(6))} ${q.answer ? '✓ ' : ''}${q.about}${q.who === 'ai' ? ' (the AI)' : isAsked(q, { askAll: s.askAll }) ? ` (${q.who === 'client' ? 'the client' : 'the product engineer'})` : ''}`);
  for (const x of s.rejected) out(yellow(`  ! a ${x.stage} question was left out: it ${x.problems.join(', ')}`));
  for (const n of s.notRun) err(red(`✗ the ${n.stage} finder did not run: ${n.why}`));
  out(`  ${r.paths.sheet}`);
  if (asked.length) out(`  Answer in one reply each: pedd sweep ${change} answer --as client|builder "all as recommended, except 3: b"`);
  return s.notRun.length ? 1 : 0;
}

function recordsCmd(args, { cwd, out }) {
  const { opts, rest } = options(args, ['json']);
  const [change, moment] = rest;
  const root = resolve(cwd, opts.root || '.');
  const ws = readWorkspace(root);
  const model = readSpec(readFiles(root), { root: ws.spec });
  const r = records({ root, cwd, ws, model, git: new Git(root), change, moment, opts });
  if (opts.json) { out(JSON.stringify(r, null, 2)); return r.ok ? 0 : 1; }
  const label = { commit: `the commit${r.task ? ` of task ${r.task}` : ''}`, pr: 'the implementation PR', tasks: 'the task checklist', report: 'the Acceptance Report', accept: 'the decisions' }[moment];
  if (r.ok) { out(green(`✓ ${change}: ${label} records everything`)); return 0; }
  for (const p of r.problems) out(red(`✗ ${p.what}`) + `\n    fix: ${p.fix}`);
  out(red(`✗ ${change}: ${label}: ${r.problems.length} problem(s)`));
  return 1;
}

function branch(args, { cwd, out }) {
  const { opts, rest } = options(args, ['no-push']);
  const [sub, ...params] = rest;
  const git = new Git(cwd, opts.remote || 'origin');
  const root = git.run(['rev-parse', '--show-toplevel']);
  const ws = readWorkspace(root);
  const push = !opts['no-push'];
  const report = (r) => {
    out(r.branch);
    out(`  from ${r.from}${r.id ? ` · ${r.id}` : ''}${r.existed ? ` · already on ${git.remote}: commit each task on it` : r.pushed === false ? ' · not pushed (--no-push)' : ` · pushed to ${git.remote}`}`);
    if (r.clashed?.length) out(`  numbering clashed with ${r.clashed.join(', ')} on another branch; took the next`);
    return 0;
  };
  switch (sub) {
    case 'change':
    case 'request': return report(cutChange(git, ws, { slug: params.join(' '), track: opts.track, push }));
    case 'design':
    case 'architecture': return report(cutChild(git, ws, { kind: sub, change: need(params[0], `pedd branch ${sub} <change>`), push }));
    case 'impl':
    case 'implementation': return report(cutChild(git, ws, { kind: 'implementation', change: need(params[0], 'pedd branch implementation <change>'), push }));
    case 'task': throw new BranchError('a task has no branch: it is one commit on the implementation branch (ARCH-06). pedd branch implementation <change>');
    case 'edit': return report(cutEdit(git, ws, { change: need(params[0], 'pedd branch edit <change>'), push }));
    case 'rename': {
      const r = renameChange(git, ws, { change: need(params[0], 'pedd branch rename <change> --track <track>'), track: opts.track, key: opts.key, push });
      if (!r.renamed) { out(`${r.branch}: already named so`); return 0; }
      out(r.branch);
      out(`  renamed from ${r.from}${r.pushed === false ? ' · not pushed (--no-push)' : ` · ${r.from} deleted on ${git.remote}`}`);
      return 0;
    }
    case 'check': {
      git.run(['fetch', '--prune', git.remote], { allowFail: true });
      const head = opts.head || process.env.GITHUB_HEAD_REF || git.currentBranch();
      const target = opts.target || process.env.GITHUB_BASE_REF || ws.branches.base;
      const r = checkBranch(git, ws, { head, target, commit: opts.sha || 'HEAD' });
      if (r.ok) { out(green(`✓ ${head} → ${target}: a ${r.kind} branch, cut from the right branch`)); return 0; }
      for (const p of r.problems) out(red(`✗ ${p}`));
      if (r.fix) out(`  fix: ${r.fix}`);
      return 1;
    }
    case undefined: throw new BranchError('pedd branch change|design|architecture|implementation|edit|rename|check … (pedd help)');
    default:
      throw new BranchError(`pedd branch ${sub}: cutting a branch from a tracker issue needs the tracker adapter (ARCH-15), not built yet. Name the kind: pedd branch change|design|architecture|implementation|edit …`);
  }
}

function need(v, usage) {
  if (!v) throw new BranchError(`usage: ${usage}`);
  return v;
}

export async function main(argv, io) {
  const [command, ...args] = argv;
  try {
    switch (command) {
      case 'check': return await check(args, io);
      case 'branch': return branch(args, io);
      case 'view': return await view(args, io);
      case 'weigh': return weighCmd(args, io);
      case 'records': return recordsCmd(args, io);
      case 'sweep': return await sweepCmd(args, io);
      case 'version': case '--version': io.out(VERSION); return 0;
      case undefined: case 'help': case '--help': io.out(HELP); return 0;
      default:
        if (NOT_BUILT[command]) { io.err(`pedd ${command} is not built yet: ${NOT_BUILT[command]}.`); return 3; }
        io.err(`pedd: unknown command "${command}". pedd help lists them.`);
        return 2;
    }
  } catch (e) {
    if (e instanceof BranchError || e instanceof SweepError || e instanceof RecordsError) { io.err(red(`✗ ${e.message}`)); return 1; }
    if (e instanceof ViewError) { io.err(red(`✗ ${e.message}`)); return 2; }
    throw e;
  }
}
