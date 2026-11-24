// pedd records <change> pr|tasks|report|accept: the four counted checks that nothing went unrecorded
// (ARCH-11). The reader judges; this reads the PR, the branch's history and the change's files.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { changeDeltas, checkChecklist, checkDecisions, checkReport, checkTaskPr } from '@openpedd/reader';
import { parseName } from './names.mjs';

export class RecordsError extends Error {}

export const MOMENTS = ['pr', 'tasks', 'report', 'accept'];

const readArg = (v, cwd) => (v === '-' ? readFileSync(0, 'utf8') : readFileSync(join(cwd, v), 'utf8'));

/** The PR's body: --body, or the pull request of the GitHub event this runs in. */
function prBody(opts, cwd) {
  if (opts.body) return readArg(opts.body, cwd);
  const ev = process.env.GITHUB_EVENT_PATH;
  if (ev && existsSync(ev)) {
    const pr = JSON.parse(readFileSync(ev, 'utf8')).pull_request;
    if (pr) return pr.body || '';
  }
  throw new RecordsError('pedd records <change> pr needs the PR\'s body: --body <file> (or - for stdin), or run it on a pull_request event');
}

/** The task a task branch is for: --task, or `task/{slug}-{task}` read with the change branch's slug. */
function taskOf(opts, ws, git) {
  if (opts.task) return opts.task;
  const head = opts.head || process.env.GITHUB_HEAD_REF || git.currentBranch();
  const base = opts.base || process.env.GITHUB_BASE_REF || '';
  const slug = parseName(base, ws.branches)?.slug;
  const p = parseName(head, ws.branches, slug ? { slug } : {});
  return p?.kind === 'task' ? p.task : null;
}

/** PR numbers merged into a branch: GitHub's merge commits and squash subjects ending in (#123). */
export function mergedPrs(git, ref) {
  const log = git.run(['log', '--format=%s', ref], { allowFail: true }) || '';
  const out = new Set();
  for (const s of log.split('\n')) {
    const m = s.match(/^Merge pull request #(\d+)\b/) || s.match(/\(#(\d+)\)\s*$/);
    if (m) out.add(Number(m[1]));
  }
  return [...out];
}

/** The Acceptance Report: --report, or the one in changes/<CHG>/reports/ whose name says acceptance. */
function report(opts, root, ws, change, cwd) {
  if (opts.report) return readArg(opts.report, cwd);
  const dir = join(root, ws.spec, 'changes', change, 'reports');
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')) : [];
  const f = files.find((x) => /acceptance/i.test(x)) || (files.length === 1 ? files[0] : null);
  if (!f) throw new RecordsError(`no Acceptance Report in ${ws.spec}/changes/${change}/reports/ (a .md whose name says acceptance)`);
  return readFileSync(join(dir, f), 'utf8');
}

export function records({ root, cwd, ws, model, git, change, moment, opts }) {
  if (!/^CHG-\d+$/.test(change || '') || !MOMENTS.includes(moment)) throw new RecordsError(`usage: pedd records CHG-nnn ${MOMENTS.join('|')}`);
  switch (moment) {
    case 'pr': {
      const task = taskOf(opts, ws, git);
      return { ...checkTaskPr({ body: prBody(opts, cwd), deltas: changeDeltas(model, change), task, change }), task };
    }
    case 'tasks': {
      if (!opts.checklist) throw new RecordsError('pedd records <change> tasks needs the implementation sub-issue\'s checklist: --checklist <file> (or - for stdin)');
      return checkChecklist({ checklist: readArg(opts.checklist, cwd), merged: mergedPrs(git, opts.branch || 'HEAD') });
    }
    case 'report': return checkReport({ report: report(opts, root, ws, change, cwd), model, change });
    case 'accept': return checkDecisions({ model, change });
  }
}
