#!/usr/bin/env node
// OpenPEDD's human clock (ENT-23, human time), installed by `pedd init` in .pedd/hooks/. Claude Code runs
// it on every message a person types (UserPromptSubmit). It appends one `human` event to
// .pedd/trace/events.jsonl: the time, the person's git user.email, the session and their open step.
//
// It never keeps the message: the prompt is dropped unread. It prints nothing, since what a
// UserPromptSubmit hook prints reaches the agent, and it always exits 0, so it never stops the agent.
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const events = join(root, '.pedd', 'trace', 'events.jsonl');

function readStdin() {
  try { return readFileSync(0, 'utf8'); } catch { return ''; }
}

function person() {
  try {
    return execFileSync('git', ['config', 'user.email'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 3000 }).trim() || 'unknown';
  } catch { return 'unknown'; }
}

/** The person's open step: the last one they started or that was rejected, and not delivered since. */
function openStep(who) {
  if (!existsSync(events)) return null;
  const steps = new Map();
  for (const line of readFileSync(events, 'utf8').split('\n')) {
    if (!line.includes('"step"')) continue;
    let e; try { e = JSON.parse(line); } catch { continue; }
    if (e.kind !== 'step' || !e.id) continue;
    if (e.to === 'started' && !steps.has(e.id)) steps.set(e.id, { id: e.id, actor: e.actor });
    const s = steps.get(e.id);
    if (s) { s.state = e.to; s.at = e.at; }
  }
  let open = null;
  for (const s of steps.values()) {
    if (s.actor !== who || (s.state !== 'started' && s.state !== 'rejected')) continue;
    if (!open || s.at >= open.at) open = s;
  }
  return open?.id || null;
}

try {
  let input = {};
  try { input = JSON.parse(readStdin() || '{}'); } catch { input = {}; }
  const session = typeof input.session_id === 'string' ? input.session_id : null;
  input = null; // the prompt is never read nor kept
  const actor = person();
  const event = { at: new Date().toISOString(), kind: 'human', actor, session, step: openStep(actor), source: 'claude-code' };
  mkdirSync(dirname(events), { recursive: true });
  appendFileSync(events, JSON.stringify(event) + '\n');
} catch { /* the clock never stops the agent */ }
process.exit(0);
