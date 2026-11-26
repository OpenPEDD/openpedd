// The human clock in a project (workspace, the human clock): the hook in .pedd/hooks/, its entry in
// .claude/settings.json beside the hooks already there, and the union merge for the events. Writes
// only what is missing; backs up a file before changing it (writing safely); --dry-run writes nothing.
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const HOOK = '.pedd/hooks/human.mjs';
export const HOOK_COMMAND = `node "$CLAUDE_PROJECT_DIR/${HOOK}"`;
export const UNION = '.pedd/trace/events.jsonl merge=union';
const SOURCE = join(dirname(fileURLToPath(import.meta.url)), '..', 'hooks', 'human.mjs');
const KEEP = 5;

export class ClockError extends Error {}

function backup(root, rel, stamp) {
  const from = join(root, rel);
  if (!existsSync(from)) return null;
  const dir = join(root, '.pedd', 'backups', stamp);
  mkdirSync(dirname(join(dir, rel)), { recursive: true });
  copyFileSync(from, join(dir, rel));
  const all = readdirSync(join(root, '.pedd', 'backups')).sort();
  for (const old of all.slice(0, Math.max(0, all.length - KEEP))) rmSync(join(root, '.pedd', 'backups', old), { recursive: true, force: true });
  return `.pedd/backups/${stamp}/${rel}`;
}

/** The settings with the hook added, or null when it is there already. */
export function withHook(settings) {
  const s = structuredClone(settings || {});
  s.hooks ??= {};
  const groups = (s.hooks.UserPromptSubmit ??= []);
  if (!Array.isArray(groups)) throw new ClockError('.claude/settings.json: hooks.UserPromptSubmit is not a list');
  if (groups.some((g) => (g.hooks || []).some((h) => typeof h.command === 'string' && h.command.includes(HOOK)))) return null;
  groups.push({ hooks: [{ type: 'command', command: HOOK_COMMAND }] });
  return s;
}

/** Installs the human clock in a project; returns each file and what was (or would be) done. */
export function installClock(root, { dryRun = false, now = new Date() } = {}) {
  const stamp = now.toISOString().replace(/[:.]/g, '-');
  const done = [];
  const write = (rel, text, what) => {
    const changed = existsSync(join(root, rel));
    const item = { path: rel, what, backup: null };
    if (!dryRun) {
      if (changed) item.backup = backup(root, rel, stamp);
      mkdirSync(dirname(join(root, rel)), { recursive: true });
      writeFileSync(join(root, rel), text);
    }
    done.push(item);
  };

  const hook = readFileSync(SOURCE, 'utf8');
  const hookAt = join(root, HOOK);
  if (!existsSync(hookAt)) write(HOOK, hook, 'created');
  else if (readFileSync(hookAt, 'utf8') !== hook) write(HOOK, hook, 'updated to this pedd\'s version');
  else done.push({ path: HOOK, what: 'already there' });

  const settingsRel = '.claude/settings.json';
  const settingsAt = join(root, settingsRel);
  let settings = {};
  if (existsSync(settingsAt)) {
    try { settings = JSON.parse(readFileSync(settingsAt, 'utf8')); } catch { throw new ClockError(`${settingsRel} is not JSON: fix it, then run pedd init again`); }
  }
  const next = withHook(settings);
  if (next) write(settingsRel, JSON.stringify(next, null, 2) + '\n', existsSync(settingsAt) ? 'UserPromptSubmit hook added, the rest kept' : 'created with the UserPromptSubmit hook');
  else done.push({ path: settingsRel, what: 'already there' });

  const attrsAt = join(root, '.gitattributes');
  const attrs = existsSync(attrsAt) ? readFileSync(attrsAt, 'utf8') : '';
  if (attrs.split('\n').some((l) => l.trim() === UNION)) done.push({ path: '.gitattributes', what: 'already there' });
  else write('.gitattributes', `${attrs}${attrs && !attrs.endsWith('\n') ? '\n' : ''}${UNION}\n`, existsSync(attrsAt) ? 'union merge added' : 'created with the union merge');
  return done;
}
