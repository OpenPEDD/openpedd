// pedd records <change> commit|pr|tasks|report|accept: the five counted checks that nothing went unrecorded
// (ARCH-11). The reader judges; this reads the task commit, the PR, the branch's history and the change's files.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { changeDeltas, checkChecklist, checkDecisions, checkImplementationPr, checkReport, checkTaskCommit } from '@openpedd/reader';

export class RecordsError extends Error {}

export const MOMENTS = ['commit', 'pr', 'tasks', 'report', 'accept'];

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

/** The task a task commit is for: --task, or the word that opens its subject after the type (`feat(x): 1.1 …` → `1.1`). */
export function taskOfSubject(subject) {
  const m = String(subject || '').match(/^[a-z]+(?:\([^)]*\))?!?:\s*(\S+)/i);
  return m ? m[1].replace(/[.:,]$/, '') : null;
}

/** Every commit on a branch, as full hashes. */
export const commitsOn = (git, ref) => (git.run(['rev-list', ref], { allowFail: true }) || '').split('\n').filter(Boolean);

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
    case 'commit': {
      const ref = opts.commit || 'HEAD';
      const message = git.run(['log', '-1', '--format=%B', ref], { allowFail: true });
      if (message == null) throw new RecordsError(`no commit ${ref} in this clone`);
      const task = opts.task || taskOfSubject(message.split('\n')[0]);
      if (!task) throw new RecordsError(`the subject of ${ref} opens with no task ID (feat(<scope>): 1.1 …): name it with --task`);
      return { ...checkTaskCommit({ message, deltas: changeDeltas(model, change), task, change }), task };
    }
    case 'pr': return checkImplementationPr({ body: prBody(opts, cwd), deltas: changeDeltas(model, change), change });
    case 'tasks': {
      if (!opts.checklist) throw new RecordsError('pedd records <change> tasks needs the implementation sub-issue\'s checklist: --checklist <file> (or - for stdin)');
      return checkChecklist({ checklist: readArg(opts.checklist, cwd), commits: commitsOn(git, opts.branch || 'HEAD') });
    }
    case 'report': return checkReport({ report: report(opts, root, ws, change, cwd), model, change });
    case 'accept': return checkDecisions({ model, change });
  }
}
