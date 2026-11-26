import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { main } from '../src/cli.mjs';
import { HOOK, installClock, withHook } from '../src/clock.mjs';
import { EVENTS, openStep, piecesOf, readEvents } from '../src/steps.mjs';
import { humanTime, weighMessages } from '../src/time.mjs';
import { sh, write } from './helpers.mjs';

const PRD = `---
title: orders
status: draft
---

# orders

## Flows

### F1 · Take an order

Piece: \`form.compound\`

| Step | Role | Does |
|---|---|---|
| 1 | Seller | Fills the order |

### F2 · Sales by product

Piece: report.multi

| Step | Role | Does |
|---|---|---|
| 1 | Partner | Opens the report |

## Screens and copy

| Screen | State | Copy | Piece |
|---|---|---|---|
| Orders | with data | — | list.search |
| Order | empty | — | — |
`;

async function run(cwd, ...argv) {
  const out = [], err = [];
  const code = await main(argv, { out: (s) => out.push(s), err: (s) => err.push(s), cwd });
  return { code, out: out.join('\n'), err: err.join('\n') };
}

/** A project with a workspace, a PRD with pieces, and git, with `email` as its person. */
function project(email = 'kevin@studio.test') {
  const dir = mkdtempSync(join(tmpdir(), 'pedd-time-'));
  execFileSync('git', ['init', '--quiet', dir]);
  sh(dir, 'config', 'user.email', email);
  write(dir, {
    'workspace.yaml': 'project: t\npieces:\n  form.compound: 2\n  report.multi: 3\n  list.search: 0.5\n',
    'spec/modules/orders/prd.md': PRD,
  });
  return dir;
}

const human = (at, actor, step, session = 's1') => ({ at, kind: 'human', actor, session, step, source: 'claude-code' });

test('piecesOf: a flow\'s Piece line, and the Piece column of screens', () => {
  assert.deepEqual(piecesOf(PRD, 'F1'), ['form.compound']);
  assert.deepEqual(piecesOf(PRD, 'F2'), ['report.multi']);
  assert.deepEqual(piecesOf(PRD), ['form.compound', 'report.multi', 'list.search']);
});

test('weighMessages: the time to the next message under 15 minutes, else 2; per person, across sessions', () => {
  const w = weighMessages([
    human('2026-11-26T10:00:00Z', 'a', null, 's1'),
    human('2026-11-26T10:10:00Z', 'a', null, 's2'),
    human('2026-11-26T10:05:00Z', 'b', null),
    human('2026-11-26T10:40:00Z', 'a', null, 's1'),
  ]);
  const ms = (actor, at) => w.find((m) => m.actor === actor && m.at === at).ms / 60e3;
  assert.equal(ms('a', '2026-11-26T10:00:00Z'), 10);
  assert.equal(ms('a', '2026-11-26T10:10:00Z'), 2); // 30 minutes to the next: a pause
  assert.equal(ms('a', '2026-11-26T10:40:00Z'), 2);
  assert.equal(ms('b', '2026-11-26T10:05:00Z'), 2);
});

test('pedd step: start carries change, stage, PRD, flow, pieces and person; deliver closes the open step', async () => {
  const dir = project();
  const s = await run(dir, 'step', 'start', 'design', '--change', 'CHG-007', '--prd', 'modules/orders/prd.md', '--flow', 'F2', '--json');
  assert.equal(s.code, 0, s.err);
  const e = JSON.parse(s.out);
  assert.match(e.id, /^CHG-007\/design\/[0-9a-f]{6}$/);
  assert.deepEqual({ to: e.to, stage: e.stage, change: e.change, prd: e.prd, flow: e.flow, pieces: e.pieces, actor: e.actor }, { to: 'started', stage: 'design', change: 'CHG-007', prd: 'modules/orders/prd.md', flow: 'F2', pieces: ['report.multi'], actor: 'kevin@studio.test' });
  assert.equal(openStep(readEvents(dir), 'kevin@studio.test').id, e.id);
  const d = await run(dir, 'step', 'deliver');
  assert.equal(d.code, 0, d.err);
  assert.equal(openStep(readEvents(dir), 'kevin@studio.test'), null);
  assert.equal((await run(dir, 'step', 'reject', e.id, '--as', 'judge')).code, 0);
  assert.equal(openStep(readEvents(dir), 'kevin@studio.test').id, e.id, 'a rejected step opens again');
  const bad = await run(dir, 'step', 'start', 'designing');
  assert.equal(bad.code, 1);
  assert.match(bad.err, /one of map, specify/);
});

test('pedd init: installs the hook beside the hooks already there, once, with a backup; --dry-run writes nothing', async () => {
  const dir = project();
  write(dir, { '.claude/settings.json': JSON.stringify({ permissions: { deny: ['Read(.env)'] }, hooks: { UserPromptSubmit: [{ hooks: [{ type: 'command', command: 'echo other' }] }] } }) });
  const dry = await run(dir, 'init', '--dry-run');
  assert.equal(dry.code, 0, dry.err);
  assert.doesNotMatch(readFileSync(join(dir, '.claude/settings.json'), 'utf8'), /human\.mjs/);
  assert.equal((await run(dir, 'init')).code, 0);
  const settings = JSON.parse(readFileSync(join(dir, '.claude/settings.json'), 'utf8'));
  assert.deepEqual(settings.permissions, { deny: ['Read(.env)'] });
  assert.equal(settings.hooks.UserPromptSubmit.length, 2);
  assert.match(settings.hooks.UserPromptSubmit[1].hooks[0].command, /\.pedd\/hooks\/human\.mjs/);
  assert.match(readFileSync(join(dir, '.gitattributes'), 'utf8'), /\.pedd\/trace\/events\.jsonl merge=union/);
  assert.ok(readFileSync(join(dir, HOOK), 'utf8').includes('UserPromptSubmit'));
  assert.ok(installClock(dir).every((d) => d.what === 'already there'), 'a second run changes nothing');
  assert.equal(withHook(settings), null);
  const none = await run(mkdtempSync(join(tmpdir(), 'pedd-empty-')), 'init');
  assert.equal(none.code, 1);
});

test('the hook: one human event with the open step, and never a word of the message', async () => {
  const dir = project();
  await run(dir, 'init');
  const { out } = await run(dir, 'step', 'start', 'specify', '--change', 'CHG-007', '--prd', 'modules/orders/prd.md');
  const step = out.split('\n')[0];
  const prompt = JSON.stringify({ session_id: 'abc-123', cwd: dir, hook_event_name: 'UserPromptSubmit', prompt: 'the client SECRET-PRICE is 42' });
  const printed = execFileSync(process.execPath, [join(dir, HOOK)], { input: prompt, encoding: 'utf8' });
  assert.equal(printed, '', 'a UserPromptSubmit hook that prints reaches the agent');
  const text = readFileSync(join(dir, EVENTS), 'utf8');
  assert.doesNotMatch(text, /SECRET|PRICE|42|prompt/);
  const h = readEvents(dir).filter((e) => e.kind === 'human');
  assert.equal(h.length, 1);
  assert.deepEqual({ actor: h[0].actor, session: h[0].session, step: h[0].step }, { actor: 'kevin@studio.test', session: 'abc-123', step });
  execFileSync(process.execPath, [join(dir, HOOK)], { input: 'not json' });
  assert.equal(readEvents(dir).filter((e) => e.kind === 'human').length, 2, 'it records even when the input is not JSON');
});

test('pedd time: a specify and a design step by two people, by stage, person, piece kind and credit', async () => {
  const dir = project('kevin@studio.test');
  const spec = JSON.parse((await run(dir, 'step', 'start', 'specify', '--change', 'CHG-007', '--prd', 'modules/orders/prd.md', '--json')).out);
  sh(dir, 'config', 'user.email', 'nacho@studio.test');
  const design = JSON.parse((await run(dir, 'step', 'start', 'design', '--change', 'CHG-007', '--prd', 'modules/orders/prd.md', '--flow', 'F1', '--json')).out);
  const events = [
    // Kevin specifies: 10:00, 10:10, 10:20 → 10 + 10 + 2 = 22 minutes, over three piece kinds.
    human('2026-11-26T10:00:00Z', 'kevin@studio.test', spec.id),
    human('2026-11-26T10:10:00Z', 'kevin@studio.test', spec.id),
    human('2026-11-26T10:20:00Z', 'kevin@studio.test', spec.id),
    // Nacho designs F1: 11:00 → 11:14 → 11:28 → 11:58 (pause) → 14 + 14 + 2 + 2 = 32 minutes.
    human('2026-11-26T11:00:00Z', 'nacho@studio.test', design.id),
    human('2026-11-26T11:14:00Z', 'nacho@studio.test', design.id),
    human('2026-11-26T11:28:00Z', 'nacho@studio.test', design.id),
    human('2026-11-26T11:58:00Z', 'nacho@studio.test', design.id),
    // Kevin outside any step: 2 minutes.
    human('2026-11-26T18:00:00Z', 'kevin@studio.test', null),
  ];
  const path = join(dir, EVENTS);
  write(dir, { [EVENTS]: readFileSync(path, 'utf8') + events.map((e) => JSON.stringify(e)).join('\n') + '\n' });

  const r = humanTime(readEvents(dir), { catalog: { 'form.compound': 2, 'report.multi': 3, 'list.search': 0.5 } });
  const min = (h) => Math.round(h * 60);
  assert.equal(r.messages, 8);
  assert.equal(min(r.hours), 56);
  assert.deepEqual(r.byStage.map((s) => [s.stage, min(s.hours)]), [['design', 32], ['specify', 22], ['outside any step', 2]]);
  assert.deepEqual(r.byPerson.map((p) => [p.person, min(p.hours)]), [['nacho@studio.test', 32], ['kevin@studio.test', 24]]);
  const kind = Object.fromEntries(r.byKind.map((k) => [k.kind, k]));
  assert.ok(Math.abs(kind['form.compound'].hours * 60 - (32 + 22 / 3)) < 1e-9, 'the specify step splits evenly over its three kinds');
  assert.equal(kind['form.compound'].pieces, 1, 'the specify and the design of F1 are one piece');
  assert.equal(r.credits, 2 + 3 + 0.5);
  assert.ok(Math.abs(kind['form.compound'].hoursPerCredit - (32 + 22 / 3) / 60 / 2) < 1e-9);
  assert.equal(r.byKindStage.find((x) => x.kind === 'form.compound' && x.stage === 'design').hours * 60, 32);

  const scoped = humanTime(readEvents(dir), { change: 'CHG-007' });
  assert.equal(min(scoped.hours), 54, 'a change leaves out what was outside any step');

  const text = await run(dir, 'time', '--change', 'CHG-007');
  assert.equal(text.code, 0, text.err);
  for (const s of ['By stage', 'By person', 'By piece kind', 'nacho@studio.test', 'form.compound', 'h/credit']) assert.ok(text.out.includes(s), s);
});
