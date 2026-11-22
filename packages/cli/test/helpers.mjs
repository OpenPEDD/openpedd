// A throwaway remote and a clone of it, to run pedd branch against real git.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { Git } from '../src/git.mjs';

export const ENV = { GIT_AUTHOR_NAME: 'Test', GIT_AUTHOR_EMAIL: 'test@example.com', GIT_COMMITTER_NAME: 'Test', GIT_COMMITTER_EMAIL: 'test@example.com' };
Object.assign(process.env, ENV);

export const sh = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

export function write(dir, files) {
  for (const [p, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), text);
  }
}

/** A remote with `dev` (the base) and `main` (production), and a clone; `files` go on the base. */
export function repo(files = {}) {
  const top = mkdtempSync(join(tmpdir(), 'pedd-test-'));
  const remote = join(top, 'remote.git'), work = join(top, 'work');
  execFileSync('git', ['init', '--quiet', '--bare', '--initial-branch=main', remote]);
  execFileSync('git', ['init', '--quiet', '--initial-branch=main', work]);
  write(work, { 'workspace.yaml': 'project: t\nbranches:\n  base: dev\nenvironments:\n  - { name: production, branch: main, public: true }\n', 'README.md': '# t\n', ...files });
  sh(work, 'add', '-A');
  sh(work, 'commit', '--quiet', '-m', 'init');
  sh(work, 'remote', 'add', 'origin', remote);
  sh(work, 'push', '--quiet', 'origin', 'main', 'main:dev');
  sh(work, 'fetch', '--quiet', 'origin');
  return { top, remote, work, git: new Git(work) };
}

/** A commit on a remote branch, made in the clone. */
export function commitOn(r, branch, files, message = 'work') {
  sh(r.work, 'fetch', '--quiet', 'origin');
  sh(r.work, 'checkout', '--quiet', '-B', `tmp-${branch.replace(/\//g, '-')}`, `origin/${branch}`);
  write(r.work, files);
  sh(r.work, 'add', '-A');
  sh(r.work, 'commit', '--quiet', '-m', message);
  sh(r.work, 'push', '--quiet', 'origin', `HEAD:refs/heads/${branch}`);
  sh(r.work, 'checkout', '--quiet', 'main');
  return sh(r.work, 'rev-parse', `origin/${branch}`);
}
