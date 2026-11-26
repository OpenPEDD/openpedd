// The step clock (ENT-23, steps): `pedd step start|deliver|pass|reject` append `step` events to
// .pedd/trace/events.jsonl, with the tool's time and the person's git user.email, never the agent's.
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const EVENTS = '.pedd/trace/events.jsonl';
export const STAGES = ['map', 'specify', 'architect', 'design', 'plan', 'build', 'verify', 'accept', 'publish', 'measure'];

export class StepError extends Error {}

/** Every event of the project, in file order. A line that is not JSON is skipped. */
export function readEvents(root) {
  const path = join(root, EVENTS);
  if (!existsSync(path)) return [];
  const out = [];
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try { out.push(JSON.parse(line)); } catch { /* a broken line is not an event */ }
  }
  return out;
}

export function appendEvent(root, event) {
  const path = join(root, EVENTS);
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(path, JSON.stringify(event) + '\n');
  return event;
}

/** The person: git user.email in the project, else "unknown". */
export function person(root) {
  try {
    return execFileSync('git', ['config', 'user.email'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || 'unknown';
  } catch { return 'unknown'; }
}

/** The steps, by ID: what started them, and their last state. */
export function stepsOf(events) {
  const steps = new Map();
  for (const e of events) {
    if (e.kind !== 'step' || !e.id) continue;
    if (e.to === 'started' && !steps.has(e.id)) steps.set(e.id, { ...e, state: 'started', startedAt: e.at });
    const s = steps.get(e.id);
    if (s) { s.state = e.to; s.lastAt = e.at; }
  }
  return steps;
}

/** A person's open step (DLT-0013): the last one they started, or that was rejected, and not delivered since. */
export function openStep(events, who) {
  let open = null;
  for (const s of stepsOf(events).values()) {
    if (s.actor !== who || (s.state !== 'started' && s.state !== 'rejected')) continue;
    if (!open || s.lastAt >= open.lastAt) open = s;
  }
  return open;
}

const clean = (s) => s.replace(/`/g, '').trim();
const list = (s) => s.split(',').map(clean).filter(Boolean);

/**
 * The piece kinds a step carries (DLT-0013): the `Piece:` line under a flow's heading, and the `Piece`
 * column of the PRD's tables. With a flow, only that flow's; without, every one the PRD names.
 */
export function piecesOf(text, flow) {
  return pieceUnits(text, flow).map((u) => u.kind);
}

/** The same, each with its key in the PRD, `form.compound#2`: the kind's n-th, in the order written. */
export function pieceUnits(text, flow) {
  const lines = text.split('\n');
  const flows = [], tables = [];
  let current = null, header = null;
  for (const line of lines) {
    const h = line.match(/^#{2,4}\s+`?(F\d+)`?\s*·/);
    if (/^#{1,6}\s/.test(line)) { current = h ? h[1] : null; header = null; }
    const p = line.match(/^\s*Pieces?:\s*(.+)$/i);
    if (p && current) flows.push(...list(p[1]).map((kind) => ({ flow: current, kind })));
    if (/^\s*\|/.test(line)) {
      const cells = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      if (!header) { header = cells; continue; }
      if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
      const at = header.findIndex((c) => /^pieces?$/i.test(clean(c)));
      if (at >= 0 && cells[at] && clean(cells[at]) !== '—') tables.push(...list(cells[at]).map((kind) => ({ flow: current, kind })));
    } else header = null;
  }
  const n = {};
  const all = [...flows, ...tables].map((x) => ({ ...x, key: `${x.kind}#${(n[x.kind] = (n[x.kind] || 0) + 1)}` }));
  return flow ? all.filter((x) => x.flow === flow) : all;
}

/** `start_step`: a new step, its ID printed for deliver. */
export function startStep(root, { stage, change = null, prd = null, flow = null, pieces = null, spec = 'spec', as = null, now = new Date() }) {
  if (!STAGES.includes(stage)) throw new StepError(`pedd step start <stage>: one of ${STAGES.join(', ')}`);
  if (change && !/^CHG-\d+$/.test(change)) throw new StepError(`--change ${change}: a change is CHG-nnn`);
  if (flow && !/^F\d+$/.test(flow)) throw new StepError(`--flow ${flow}: a flow is F<n>`);
  if (flow && !prd) throw new StepError('--flow needs --prd: the PRD the flow is in');
  const id = `${change || 'none'}/${stage}/${randomBytes(3).toString('hex')}`;
  let units = (pieces || []).map((kind) => ({ kind, key: `${kind}@${id}` }));
  if (prd) {
    const path = join(root, spec, prd);
    if (!existsSync(path)) throw new StepError(`--prd ${prd}: no ${spec}/${prd}`);
    if (!pieces) units = pieceUnits(readFileSync(path, 'utf8'), flow);
  }
  const event = { at: now.toISOString(), kind: 'step', id, to: 'started', stage, change, prd, flow, pieces: units.map((u) => u.kind), piece_keys: units.map((u) => u.key), actor: as || person(root), source: 'cli' };
  return appendEvent(root, event);
}

/** `deliver_step`, and the judge's `passed` or `rejected`: on the given step, or the person's open one. */
export function closeStep(root, { to, step = null, as = null, now = new Date() }) {
  const events = readEvents(root);
  const who = as || person(root);
  const steps = stepsOf(events);
  const s = step ? steps.get(step) : openStep(events, who);
  if (!s) throw new StepError(step ? `no step ${step} in ${EVENTS}` : `${who} has no open step: pedd step ${to === 'delivered' ? 'deliver' : to.replace(/ed$/, '')} <step>`);
  const allowed = { delivered: ['started', 'rejected'], passed: ['delivered'], rejected: ['delivered'] }[to];
  if (!allowed.includes(s.state)) throw new StepError(`${s.id} is ${s.state}: it cannot go to ${to}`);
  const event = { at: now.toISOString(), kind: 'step', id: s.id, to, stage: s.stage, change: s.change, prd: s.prd, flow: s.flow, pieces: s.pieces, piece_keys: s.piece_keys, actor: who, source: 'cli' };
  return appendEvent(root, event);
}
