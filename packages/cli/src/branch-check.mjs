// The branch check (ARCH-06, creating a branch; ARCH-13, it runs first in CI): a pull request whose
// head is not named as a work branch, targets the wrong branch, or was cut from another work branch
// fails, with the `pedd branch` command that fixes it.
import { parseName } from './names.mjs';

const folderOf = (path) => path.split('/changes/')[1]?.split('/')[0];

const fixes = {
  change: () => 'pedd branch change <slug> [--track full|story|fix|chore|hotfix]',
  design: (c) => `pedd branch design ${c}`,
  architecture: (c) => `pedd branch architecture ${c}`,
  task: (c) => `pedd branch task ${c} <task>`,
  edit: (c) => `pedd branch edit ${c}`,
};

/** The change branch a design, architecture, task or edit branch belongs to, read from the remote. */
function changeBranchOf(git, ws, head, me) {
  const changes = git.remoteBranches().filter((x) => ['change', 'hotfix'].includes(parseName(x, ws.branches)?.kind));
  if (me.kind === 'edit') return changes.find((x) => git.paths(git.remoteSha(x), `${ws.spec}/changes/${me.change}`).length > 0) || null;
  return changes.find((x) => {
    const slug = parseName(x, ws.branches).slug;
    return me.kind === 'task' ? parseName(head, ws.branches, { slug }).slug === slug : slug === me.slug;
  }) || null;
}

/**
 * Checks one pull request.
 *
 * @param head    the head branch's name.
 * @param target  the branch it merges into.
 * @param commit  the head's commit; `HEAD` by default, which in CI is the PR's head checked out.
 * @returns { ok, kind, problems: string[], fix: string|null }
 */
export function checkBranch(git, ws, { head, target, commit = 'HEAD' }) {
  const b = ws.branches;
  const problems = [];
  let fix = null;
  const result = (kind) => ({ ok: problems.length === 0, kind, head, target, problems, fix: problems.length ? fix : null });
  const parsedTarget = parseName(target, b);
  const targetIsChange = parsedTarget && ['change', 'hotfix'].includes(parsedTarget.kind);
  const me = parseName(head, b, targetIsChange ? { slug: parsedTarget.slug } : {});

  if (!me) {
    problems.push(`"${head}" is not named as a work branch: ${['change', 'design', 'architecture', 'task', 'edit', 'hotfix'].map((k) => b[k]).join(' · ')}`);
    fix = targetIsChange ? `${fixes.task(target)}, or ${fixes.design(target)}` : fixes.change();
    return result(null);
  }

  // Where it may merge (ARCH-06, the branches): the base, production, or its own change branch.
  const owner = me.kind === 'change' || me.kind === 'hotfix' ? null : changeBranchOf(git, ws, head, me);
  const want = { change: [b.base], hotfix: [ws.production, b.base] }[me.kind] || (owner ? [owner] : []);
  if (!want.includes(target)) {
    const where = { change: `the base, ${b.base}`, hotfix: `production, ${ws.production}, or the base, ${b.base}` }[me.kind]
      || (owner ? `its change branch, ${owner}` : 'its change branch, which is not on the remote');
    problems.push(`a ${me.kind} branch merges into ${where}; this PR targets ${target}`);
    fix = owner || want.length ? `retarget the PR to ${want[0] || owner}` : fixes[me.kind]('<change>');
  }

  const headSha = git.sha(commit) || git.sha(head);
  const targetSha = git.sha(target);
  if (!headSha) problems.push(`the head "${head}" (${commit}) is not in this clone: check out with full history (fetch-depth: 0)`);
  if (!targetSha) problems.push(`the target "${target}" is not in this clone: check out with full history (fetch-depth: 0)`);
  if (problems.length) return result(me.kind);

  // Cut from the right branch. A change branch holds one new changes/<CHG>/ folder: two mean it
  // carries another change.
  if (me.kind === 'change' || me.kind === 'hotfix') {
    const onTarget = new Set(git.paths(targetSha, `${ws.spec}/changes`).map(folderOf));
    const ids = [...new Set(git.paths(headSha, `${ws.spec}/changes`).map(folderOf))].filter((d) => /^CHG-\d+$/.test(d) && !onTarget.has(d));
    if (ids.length > 1) {
      problems.push(`${head} holds ${ids.length} new changes (${ids.join(', ')}): it was cut from another change's branch, not from ${target}`);
      fix = fixes.change();
    }
  }
  // None of its own commits is on another work branch. Git cannot tell which of two branches was cut
  // from the other, so both are named.
  const mine = new Set(git.only(headSha, targetSha));
  const isChild = (p) => me.kind === 'change' && p && (
    (['design', 'architecture', 'task'].includes(p.kind) && p.slug === me.slug) || p.kind === 'edit');
  for (const other of problems.length ? [] : git.remoteBranches()) {
    if ([head, target, b.base, ws.production].includes(other)) continue;
    const p = parseName(other, b, me.kind === 'change' ? { slug: me.slug } : {});
    if (!p || isChild(p)) continue;
    const otherSha = git.remoteSha(other);
    if (!otherSha) continue;
    const shared = git.only(otherSha, targetSha).filter((c) => mine.has(c));
    if (!shared.length) continue;
    problems.push(`${head} shares ${shared.length} commit(s) with ${other} that ${target} does not have: one of the two was cut from the other, not from ${target}`);
    fix = me.kind === 'change' || me.kind === 'hotfix' ? fixes.change() : fixes[me.kind](owner || '<change>');
    break;
  }

  // An edit branch holds one edit to the definition (ARCH-21).
  if (me.kind === 'edit' && problems.length === 0) {
    const def = `${ws.spec}/changes/${me.change}/definition.md`;
    const others = git.changedFiles(headSha, targetSha).filter((f) => f !== def);
    if (others.length) problems.push(`an edit branch changes only ${def}; it also changes ${others.join(', ')}`);
  }
  return result(me.kind);
}
