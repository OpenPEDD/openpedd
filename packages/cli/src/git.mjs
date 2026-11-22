// git, run as a child process in one repository. Every work branch is read from and pushed to the
// remote: a branch is cut from what the remote has, never from a local copy that may be behind.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export class Git {
  constructor(cwd, remote = 'origin') { this.cwd = cwd; this.remote = remote; }

  run(args, { input, env, allowFail = false } = {}) {
    try {
      return execFileSync('git', args, { cwd: this.cwd, input, env: env ? { ...process.env, ...env } : process.env, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    } catch (e) {
      if (allowFail) return null;
      const msg = (e.stderr || e.message || '').toString().trim();
      throw new Error(`git ${args.join(' ')}: ${msg}`);
    }
  }

  fetch() { this.run(['fetch', '--prune', this.remote]); }

  /** The remote's branches, as names without the remote. */
  remoteBranches() {
    const out = this.run(['for-each-ref', '--format=%(refname)', `refs/remotes/${this.remote}/`]);
    return out.split('\n').filter(Boolean).map((r) => r.slice(`refs/remotes/${this.remote}/`.length)).filter((b) => b !== 'HEAD');
  }

  /** The commit a remote branch points to, or null. */
  remoteSha(branch) { return this.run(['rev-parse', '--verify', '--quiet', `refs/remotes/${this.remote}/${branch}^{commit}`], { allowFail: true }) || null; }

  /** A commit for a ref: the remote's branch first, else the ref as given. */
  sha(ref) { return this.remoteSha(ref) || this.run(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], { allowFail: true }) || null; }

  currentBranch() { return this.run(['rev-parse', '--abbrev-ref', 'HEAD']); }

  /** Paths under a folder at a commit. */
  paths(commit, dir) { return this.run(['ls-tree', '-r', '--name-only', commit, '--', dir]).split('\n').filter(Boolean); }

  /** A file's text at a commit, or null. */
  show(commit, path) { return this.run(['show', `${commit}:${path}`], { allowFail: true }); }

  isAncestor(a, b) { return this.run(['merge-base', '--is-ancestor', a, b], { allowFail: true }) !== null; }

  mergeBase(a, b) { return this.run(['merge-base', a, b], { allowFail: true }); }

  /** The commits on `head` that `base` lacks. */
  only(head, base) { return this.run(['rev-list', `${base}..${head}`]).split('\n').filter(Boolean); }

  /** Files changed on `head` since it left `base`. */
  changedFiles(head, base) { return this.run(['diff', '--name-only', `${base}...${head}`]).split('\n').filter(Boolean); }

  /** A commit on `parent` that adds or replaces files, made without touching the working tree. */
  commitFiles(parent, files, message) {
    const dir = mkdtempSync(join(tmpdir(), 'pedd-index-'));
    const env = { GIT_INDEX_FILE: join(dir, 'index') };
    try {
      this.run(['read-tree', parent], { env });
      for (const [path, text] of Object.entries(files)) {
        const blob = this.run(['hash-object', '-w', '--stdin'], { input: text });
        this.run(['update-index', '--add', '--cacheinfo', `100644,${blob},${path}`], { env });
      }
      const tree = this.run(['write-tree'], { env });
      return this.run(['commit-tree', tree, '-p', parent, '-m', message]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  /** Creates the remote branch at a commit; fails, returning false, when the name exists there. */
  pushNew(commit, branch) {
    return this.run(['push', '--quiet', `--force-with-lease=refs/heads/${branch}:`, this.remote, `${commit}:refs/heads/${branch}`], { allowFail: true }) !== null;
  }

  deleteRemote(branch) { this.run(['push', '--quiet', this.remote, '--delete', branch]); }

  /** A local branch tracking the remote one, made or moved there. */
  track(branch) {
    if (this.run(['rev-parse', '--verify', '--quiet', `refs/heads/${branch}`], { allowFail: true })) return;
    this.run(['branch', '--quiet', '--track', branch, `${this.remote}/${branch}`]);
  }
}
