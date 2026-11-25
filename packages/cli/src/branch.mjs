// pedd branch: the one way a work branch is created (ARCH-06, creating a branch; ARCH-21).
//
// Every branch is cut from what the remote has, named by `branches` in workspace.yaml, pushed, and
// printed. Where it is cut from follows from its kind, never from a choice:
//
//   change · request   the base (a hotfix: production), numbered CHG-nnn, holding changes/<CHG>/definition.md
//   design · architecture · implementation · edit   the change branch (an implementation branch that
//   exists is returned as it is: every task of the change commits on it)
import { nextChangeId, readDefinition, writeDefinition } from '@openpedd/reader';
import { TRACK_PREFIX, formatName, parseName, slugify } from './names.mjs';

/** How many times the next number is tried after a clash (ARCH-21, numbering). */
const RETRIES = 3;

export class BranchError extends Error {}

/** Every change ID a remote holds: the base's changes/ and history, and every branch's changes/. */
function changeSources(git, ws) {
  const base = git.remoteSha(ws.branches.base);
  if (!base) throw new BranchError(`the base "${ws.branches.base}" is not on ${git.remote}: set branches.base in workspace.yaml`);
  const sources = [git.paths(base, `${ws.spec}/changes`), git.show(base, `${ws.spec}/history/history.jsonl`) || ''];
  for (const b of git.remoteBranches()) sources.push(git.paths(git.remoteSha(b), `${ws.spec}/changes`));
  return sources;
}

/** The remote branches that hold `changes/<id>/`, other than the base. */
function branchesHolding(git, ws, id) {
  return git.remoteBranches().filter((b) => b !== ws.branches.base && b !== ws.production && git.paths(git.remoteSha(b), `${ws.spec}/changes/${id}`).length > 0);
}

/** The change branch of a change, given as `CHG-nnn` or as the branch's name, with its ID and slug. */
export function findChange(git, ws, ref) {
  if (/^CHG-\d+$/.test(ref)) {
    const holders = branchesHolding(git, ws, ref).filter((b) => ['change', 'hotfix'].includes(parseName(b, ws.branches)?.kind));
    if (!holders.length) throw new BranchError(`no change branch on ${git.remote} holds ${ws.spec}/changes/${ref}/`);
    if (holders.length > 1) throw new BranchError(`${ref} is on several change branches: ${holders.join(', ')}. Resolve the clash first`);
    return { id: ref, branch: holders[0], ...parseName(holders[0], ws.branches) };
  }
  const parsed = parseName(ref, ws.branches);
  if (!parsed || !['change', 'hotfix'].includes(parsed.kind)) throw new BranchError(`"${ref}" is not a change branch name (${ws.branches.change}) nor a CHG-nnn`);
  const sha = git.remoteSha(ref);
  if (!sha) throw new BranchError(`"${ref}" is not on ${git.remote}`);
  const base = git.remoteSha(ws.branches.base);
  const onBase = new Set(git.paths(base, `${ws.spec}/changes`).map((p) => p.split('/')[2]));
  const ids = [...new Set(git.paths(sha, `${ws.spec}/changes`).map((p) => p.slice(`${ws.spec}/changes/`.length).split('/')[0]))].filter((d) => /^CHG-\d+$/.test(d) && !onBase.has(d));
  return { id: ids.length === 1 ? ids[0] : null, branch: ref, ...parsed };
}

function definitionText(id, slug) {
  return writeDefinition({ status: 'draft', items: [], summary: '' }).replace('\n## Items', `\n# ${id} · ${slug}\n\n## Items`);
}

/** The branch of a change or a request: from the base, numbered, holding only its definition. */
export function cutChange(git, ws, { slug: raw, track, push = true }) {
  const slug = slugify(raw || '');
  if (!slug) throw new BranchError('a change needs a slug: pedd branch change <slug>');
  const hotfix = track === 'hotfix';
  if (track && !hotfix && !TRACK_PREFIX[track]) throw new BranchError(`track "${track}" has no branch prefix in ARCH-06: one of ${[...Object.keys(TRACK_PREFIX), 'hotfix'].join(', ')}`);
  const name = hotfix ? formatName(ws.branches.hotfix, { slug }) : formatName(ws.branches.change, { prefix: TRACK_PREFIX[track || 'full'], slug });
  const from = hotfix ? ws.production : ws.branches.base;
  git.fetch();
  const fromSha = git.remoteSha(from);
  if (!fromSha) throw new BranchError(`"${from}" is not on ${git.remote}`);
  if (git.remoteSha(name)) throw new BranchError(`${name} already exists on ${git.remote}: pick another slug`);

  const clashed = [];
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const id = nextChangeId(...changeSources(git, ws), clashed);
    const path = `${ws.spec}/changes/${id}/definition.md`;
    const commit = git.commitFiles(fromSha, { [path]: definitionText(id, slug) }, `${id} · request: ${slug}`);
    if (!push) return { branch: name, id, from, commit, pushed: false };
    if (!git.pushNew(commit, name)) throw new BranchError(`${name} was created on ${git.remote} by someone else meanwhile: pick another slug`);
    git.fetch();
    const others = branchesHolding(git, ws, id).filter((b) => b !== name);
    if (!others.length) { git.track(name); return { branch: name, id, from, commit, pushed: true, clashed }; }
    git.deleteRemote(name);
    clashed.push(id);
  }
  throw new BranchError(`numbering clashed ${RETRIES + 1} times (${clashed.join(', ')}): try again`);
}

/**
 * A design, architecture or implementation branch, from its change branch. The implementation branch
 * is one per change and every task commits on it, so when it exists it is returned as it is.
 */
export function cutChild(git, ws, { kind, change, push = true }) {
  git.fetch();
  const c = findChange(git, ws, change);
  const name = formatName(ws.branches[kind], { slug: c.slug });
  const existing = git.remoteSha(name);
  if (existing && kind === 'implementation') {
    if (push) git.track(name);
    return { branch: name, from: c.branch, id: c.id, commit: existing, pushed: push, existed: true };
  }
  if (existing) throw new BranchError(`${name} already exists on ${git.remote}`);
  const commit = git.remoteSha(c.branch);
  if (push) {
    if (!git.pushNew(commit, name)) throw new BranchError(`${name} was created on ${git.remote} meanwhile`);
    git.track(name);
  }
  return { branch: name, from: c.branch, id: c.id, commit, pushed: push };
}

/** An edit branch of an agreed request, numbered per change (ARCH-21, edit branch). */
export function cutEdit(git, ws, { change, push = true }) {
  git.fetch();
  const c = findChange(git, ws, change);
  if (!c.id) throw new BranchError(`${c.branch} holds no single changes/<CHG>/ folder`);
  const commit = git.remoteSha(c.branch);
  const def = git.show(commit, `${ws.spec}/changes/${c.id}/definition.md`);
  if (def == null) throw new BranchError(`${c.branch} has no ${ws.spec}/changes/${c.id}/definition.md`);
  const status = readDefinition(def).status;
  if (status !== 'agreed') throw new BranchError(`${c.id}'s definition is "${status || 'without status'}", not agreed: it is edited on ${c.branch} itself`);
  const pattern = ws.branches.edit;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const taken = git.remoteBranches().map((b) => parseName(b, ws.branches)).filter((p) => p?.kind === 'edit' && p.change === c.id).map((p) => Number(p.n));
    const name = formatName(pattern, { change: c.id, n: Math.max(0, ...taken) + 1 });
    if (!push) return { branch: name, from: c.branch, id: c.id, commit, pushed: false };
    if (git.pushNew(commit, name)) { git.track(name); return { branch: name, from: c.branch, id: c.id, commit, pushed: true }; }
    git.fetch();
  }
  throw new BranchError(`edit numbering for ${c.id} clashed ${RETRIES + 1} times: try again`);
}

/**
 * The rename at spec-approval (ARCH-21): the prefix of the computed track and, when the tracker links
 * branches by issue key, the parent issue's key: feat/automations → feat/rec-412-automations.
 */
export function renameChange(git, ws, { change, track, key, push = true }) {
  if (!TRACK_PREFIX[track]) throw new BranchError(`the rename needs the computed track: --track ${Object.keys(TRACK_PREFIX).join('|')}`);
  git.fetch();
  const c = findChange(git, ws, change);
  if (c.kind !== 'change') throw new BranchError(`${c.branch} is a ${c.kind} branch: only a change branch is renamed`);
  const k = key ? slugify(key) : '';
  const slug = k && !c.slug.startsWith(`${k}-`) ? `${k}-${c.slug}` : c.slug;
  const name = formatName(ws.branches.change, { prefix: TRACK_PREFIX[track], slug });
  if (name === c.branch) return { branch: name, from: c.branch, id: c.id, renamed: false };
  const children = git.remoteBranches().filter((b) => {
    const p = parseName(b, ws.branches);
    return (['design', 'architecture', 'implementation'].includes(p?.kind) && p.slug === c.slug) || (p?.kind === 'edit' && p.change === c.id);
  });
  if (children.length) throw new BranchError(`branches were cut from ${c.branch} before the rename: ${children.join(', ')}. The rename comes first (ARCH-21)`);
  if (git.remoteSha(name)) throw new BranchError(`${name} already exists on ${git.remote}`);
  const commit = git.remoteSha(c.branch);
  if (push) {
    if (!git.pushNew(commit, name)) throw new BranchError(`${name} was created on ${git.remote} meanwhile`);
    git.deleteRemote(c.branch);
    if (git.run(['rev-parse', '--verify', '--quiet', `refs/heads/${c.branch}`], { allowFail: true })) git.run(['branch', '--quiet', '-m', c.branch, name]);
    git.run(['branch', '--quiet', `--set-upstream-to=${git.remote}/${name}`, name], { allowFail: true });
    git.track(name);
  }
  return { branch: name, from: c.branch, id: c.id, commit, renamed: true, pushed: push };
}
