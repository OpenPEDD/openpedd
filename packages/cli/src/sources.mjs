// What `pedd view` and `pedd check` hand the reader beyond the spec (ARCH-22): the workspace, the files
// `views.security` names, the stack, the workspace graph, the code index, the trace, and every change
// branch's `changes/`. Each one missing leaves its view empty; nothing here fails for lack of it.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const rel = (root, p) => relative(root, p).split(sep).join('/');
const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; } };

/** Every file under a folder whose name matches, as path (from `root`) → text. */
function walk(root, dir, match, out = new Map()) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir).sort()) {
    if (name === 'node_modules' || name === '.git') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(root, full, match, out);
    else if (match.test(name)) out.set(rel(root, full), readFileSync(full, 'utf8'));
  }
  return out;
}

/** git in a folder; null when it fails or there is no repository. */
export function git(root, args, input) {
  try { return execFileSync('git', args, { cwd: root, input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], maxBuffer: 256 * 1024 * 1024 }); } catch { return null; }
}

/**
 * The text of every file under some folders at a commit, as path (from `root`) → text, read in one
 * `git cat-file --batch`. Null when the commit cannot be read.
 */
export function filesAt(root, ref, dirs) {
  const prefix = (git(root, ['rev-parse', '--show-prefix']) ?? '').trim();
  if (git(root, ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`]) === null) return null;
  const listed = git(root, ['ls-tree', '-r', '--name-only', '--full-tree', ref, '--', ...dirs.map((d) => `${prefix}${d}`)]);
  if (listed === null) return null;
  const paths = listed.split('\n').filter((p) => p && /\.(md|jsonl|ya?ml)$/.test(p));
  const out = new Map();
  if (!paths.length) return out;
  const buf = execFileSync('git', ['cat-file', '--batch'], { cwd: root, input: paths.map((p) => `${ref}:${p}`).join('\n') + '\n', maxBuffer: 256 * 1024 * 1024 });
  let at = 0;
  for (const p of paths) {
    const nl = buf.indexOf(10, at);
    const header = buf.subarray(at, nl).toString();
    const size = Number(header.split(' ')[2]);
    if (/ missing$/.test(header) || Number.isNaN(size)) { at = nl + 1; continue; }
    out.set(p.slice(prefix.length), buf.subarray(nl + 1, nl + 1 + size).toString('utf8'));
    at = nl + 1 + size + 1;
  }
  return out;
}

/** The changes of each remote branch that differ from the working tree's: [{ name, files, changes }]. */
function branchesOf(root, spec, here) {
  const refs = (git(root, ['for-each-ref', '--format=%(refname:short)', 'refs/remotes/']) ?? '').split('\n').filter((r) => r && !/\/HEAD$/.test(r) && r.includes('/'));
  const out = [];
  for (const ref of refs.sort()) {
    const files = filesAt(root, ref, [`${spec}/changes/`]);
    if (!files) continue;
    const byChange = new Map();
    for (const [p, text] of files) {
      const id = p.match(/\/changes\/(CHG-\d+)\//)?.[1];
      if (!id || p.includes('/changes/archive/')) continue;
      (byChange.get(id) ?? byChange.set(id, new Map()).get(id)).set(p, text);
    }
    const mine = new Map();
    for (const [id, fs] of byChange) {
      const same = [...fs].every(([p, t]) => here.get(p) === t) && [...here.keys()].filter((p) => p.includes(`/changes/${id}/`)).every((p) => fs.has(p));
      if (!same) for (const [p, t] of fs) mine.set(p, t);
    }
    if (mine.size) out.push({ name: ref.replace(/^[^/]+\//, ''), files: mine, changes: [...new Set([...mine.keys()].map((p) => p.match(/\/changes\/(CHG-\d+)\//)[1]))] });
  }
  return out;
}

/**
 * The sources of the views for a working tree.
 *
 * @param files  the working tree's files, as readFiles gives them.
 * @param opts.branches  false to skip reading the change branches (the base of `pedd check`).
 */
export function viewSources(root, ws, files, { branches = true } = {}) {
  const data = ws.data || {};
  const wsText = existsSync(join(root, 'workspace.yaml')) ? readFileSync(join(root, 'workspace.yaml'), 'utf8') : '';
  const workspaceLines = {};
  for (const c of Array.isArray(data.components) ? data.components : []) {
    const i = wsText.split('\n').findIndex((l) => l.includes(`path: ${c?.path}`));
    if (c?.path && i >= 0) workspaceLines[c.path] = i + 1;
  }
  const named = new Map();
  const sec = data.views?.security || {};
  if (sec.permissions?.path) {
    const p = join(root, sec.permissions.path);
    if (sec.permissions.format === 'script') {
      try { named.set(sec.permissions.path, execFileSync(p, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 20000 })); } catch { /* the view shows the table from the spec, or empty */ }
    } else if (existsSync(p)) named.set(sec.permissions.path, readFileSync(p, 'utf8'));
  }
  if (sec.policies?.path) {
    const p = join(root, sec.policies.path);
    if (existsSync(p) && statSync(p).isDirectory()) for (const [k, v] of walk(root, p, /\.sql$/i)) named.set(k, v);
    else if (existsSync(p)) named.set(sec.policies.path, readFileSync(p, 'utf8'));
  }
  const packages = {};
  for (const c of Array.isArray(data.components) ? data.components : []) {
    const pkg = c?.path && readJson(join(root, c.path, 'package.json'));
    if (pkg) packages[c.path] = { name: pkg.name ?? null, dependencies: Object.keys({ ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies }).sort() };
  }
  const traceEvents = [];
  for (const [p, text] of walk(root, join(root, '.pedd/trace'), /\.jsonl$/)) text.split('\n').forEach((l, i) => {
    if (!l.trim()) return;
    try { traceEvents.push({ ...JSON.parse(l), file: p, line: i + 1 }); } catch { /* a line that is not JSON is the trace's problem, not the view's */ }
  });
  const codeIndex = walk(root, join(root, '.pedd/code-index'), /\.md$/);
  const commit = (git(root, ['rev-parse', '--short', 'HEAD']) ?? '').trim() || null;
  return {
    product: data.project ?? null,
    commit,
    workspace: data,
    workspaceLines,
    files: named,
    stack: readJson(join(root, '.pedd/stack.json')),
    packages,
    codeIndex: codeIndex.size ? codeIndex : null,
    specGraph: readJson(join(root, '.pedd/spec-graph.json')),
    traceEvents,
    branches: branches ? branchesOf(root, ws.spec, files) : [],
  };
}

/** Paths changed against a commit, tracked or not, from `root`; null without git. */
export function changedPaths(root, ref) {
  const diff = git(root, ['diff', '--name-only', '--relative', ref]);
  if (diff === null) return null;
  const untracked = git(root, ['ls-files', '--others', '--exclude-standard']) ?? '';
  return new Set([...diff.split('\n'), ...untracked.split('\n')].filter(Boolean));
}
