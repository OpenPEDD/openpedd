// pedd sweep (ARCH-16): reads where the change stands, runs one finder per stage still ahead as a
// session that only reads, hands what they found to the reader's merge, and writes the sheet. The
// person's reply goes through `pedd sweep <change> answer "…"`. The order is the tool's (RULE-24).
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { FINDERS, SWEEP_STAGES, answersSoFar, applyReply, decideByAi, leastAdvanced, mergeQuestions, readDefinition, renderSheet, rewriteReopened, stagesAhead } from '@openpedd/reader';

export class SweepError extends Error {}

/** The finder command when workspace.yaml names none: the headless form of ARCH-04, read-only tools. */
export const DEFAULT_FINDER = 'claude -p --allowedTools Read,Grep,Glob --disallowedTools Edit,Write,Bash,NotebookEdit';

/** How long one finder may run before it is stopped and reported as not run. */
const FINDER_TIMEOUT_MS = 15 * 60 * 1000;

const PROMPT = readFileSync(new URL('../prompts/sweep-finder.md', import.meta.url), 'utf8');

export const paths = (root, ws, change) => {
  const dir = join(root, ws.spec, 'changes', change);
  return { dir, sheet: join(dir, 'sweep.md'), state: join(dir, 'sweep', 'state.json'), findings: join(dir, 'sweep', 'findings') };
};

/** Where the change stands (step 1): its PRDs, their least advanced status, and the stages ahead. */
export function standing(root, ws, model, change) {
  const p = join(root, ws.spec, 'changes', change, 'definition.md');
  const def = existsSync(p) ? readDefinition(readFileSync(p, 'utf8')) : null;
  const wanted = new Set((def?.prds || []).map((x) => x.replace(/^\.?\//, '')));
  const prds = model.prds.filter((x) => wanted.has(x.path) || wanted.has(x.path.slice(ws.spec.length + 1)));
  const least = prds.length ? leastAdvanced(prds.flatMap((x) => x.requirements.map((r) => r.status))) : null;
  const ahead = stagesAhead(least);
  return { definition: !!def, prds: prds.map((x) => x.path), least, ahead, passed: SWEEP_STAGES.filter((s) => !ahead.includes(s)) };
}

export function finderPrompt(ws, change, stage) {
  const f = FINDERS[stage];
  return PROMPT.replaceAll('{stage}', stage).replaceAll('{change}', change).replaceAll('{looksFor}', f.looksFor).replaceAll('{checklist}', f.checklist).replaceAll('{spec}', ws.spec);
}

/** The JSON array a finder printed: the last fenced block, or the whole output. */
export function parseFinderOutput(text) {
  const blocks = [...String(text).matchAll(/```(?:json)?\s*\n([\s\S]*?)```/g)].map((m) => m[1]);
  for (const candidate of [...blocks.reverse(), String(text).trim()]) {
    try {
      const v = JSON.parse(candidate);
      if (Array.isArray(v)) return v;
      if (v && typeof v.result === 'string') return parseFinderOutput(v.result); // claude -p --output-format json
    } catch { /* the next candidate */ }
  }
  throw new SweepError('its output holds no JSON array of questions');
}

/** Runs one finder: the command through the shell, the prompt on stdin, its output parsed. */
function runFinder(command, prompt, cwd) {
  return new Promise((done) => {
    const child = spawn(command, { cwd, shell: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '', err = '';
    const timer = setTimeout(() => { child.kill('SIGTERM'); err += `\nstopped after ${FINDER_TIMEOUT_MS / 60000} minutes`; }, FINDER_TIMEOUT_MS);
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('error', (e) => { clearTimeout(timer); done({ error: e.message }); });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) { done({ error: `exited ${code}${err.trim() ? `: ${err.trim().split('\n').slice(-3).join(' ')}` : ''}` }); return; }
      try { done({ questions: parseFinderOutput(out), raw: out }); } catch (e) { done({ error: e.message, raw: out }); }
    });
    child.stdin.end(prompt);
  });
}

const write = (file, text) => { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, text); };

/**
 * A sweep: the finders of the stages asked for, in parallel, then the merge and the sheet.
 *
 * @param opts.stages   the stages to sweep; default those still ahead, or every one with `all`.
 * @param opts.from     a folder of `<stage>.json` findings to use instead of running finders.
 * @param opts.command  the finder command; default workspace.yaml `agents.finder`, then DEFAULT_FINDER.
 */
export async function sweep(root, ws, model, change, opts = {}) {
  if (!/^CHG-\d+$/.test(change || '')) throw new SweepError('usage: pedd sweep CHG-nnn');
  const p0 = paths(root, ws, change);
  if (!opts.fresh && existsSync(p0.state)) {
    const prior = JSON.parse(readFileSync(p0.state, 'utf8'));
    if (prior.questions.some((q) => q.reopened && !q.answer)) return secondRound(root, ws, change, prior, opts);
  }
  const where = standing(root, ws, model, change);
  const stages = opts.stages?.length ? opts.stages : opts.all ? SWEEP_STAGES : where.ahead;
  const bad = stages.filter((s) => !SWEEP_STAGES.includes(s));
  if (bad.length) throw new SweepError(`not a stage a sweep looks at: ${bad.join(', ')} (one of ${SWEEP_STAGES.join(', ')})`);
  const p = paths(root, ws, change);
  const command = opts.command || process.env.PEDD_FINDER || ws.data?.agents?.finder || DEFAULT_FINDER;
  const findings = {}, notRun = [];
  const results = await Promise.all(stages.map(async (stage) => {
    if (opts.from) {
      const f = join(opts.from, `${stage}.json`);
      if (!existsSync(f)) return [stage, { error: `no ${stage}.json in ${opts.from}` }];
      try { return [stage, { questions: parseFinderOutput(readFileSync(f, 'utf8')) }]; } catch (e) { return [stage, { error: e.message }]; }
    }
    return [stage, await runFinder(command, finderPrompt(ws, change, stage), root)];
  }));
  for (const [stage, r] of results) {
    if (r.error) { notRun.push({ stage, why: r.error }); if (r.raw) write(join(p.findings, `${stage}.out.txt`), r.raw); continue; }
    findings[stage] = r.questions;
    write(join(p.findings, `${stage}.json`), JSON.stringify(r.questions, null, 2) + '\n');
  }
  const { questions, dropped, rejected } = mergeQuestions(findings);
  let state = decideByAi({ change, round: 1, askAll: !!opts.askAll, ran: Object.keys(findings), notRun, passed: where.passed, questions, dropped, rejected }, { passed: where.passed });
  if (opts.acceptRecommended) state = applyReply({ ...state, askAll: true }, 'all as recommended', { passed: where.passed }).state;
  write(p.state, JSON.stringify(state, null, 2) + '\n');
  write(p.sheet, renderSheet(state));
  return { state, where, paths: p };
}

/** Step 9: only the reopened questions, each rewritten by its own finder with the answers given. */
async function secondRound(root, ws, change, state, opts) {
  const p = paths(root, ws, change);
  const command = opts.command || process.env.PEDD_FINDER || ws.data?.agents?.finder || DEFAULT_FINDER;
  const open = state.questions.filter((q) => q.reopened && !q.answer);
  const byStage = {};
  for (const q of open) (byStage[q.stage] ||= []).push(q);
  const rewritten = {}, notRun = [];
  await Promise.all(Object.entries(byStage).map(async ([stage, qs]) => {
    const extra = `\n\n## Round 2\n\nThe person already answered:\n${answersSoFar(state)}\n\nRewrite **only** these questions, which assumed an answer that changed, and keep each one's \`key\`: ${qs.map((q) => `\`${q.key}\` (${q.about})`).join(', ')}. Drop one, with \`answered_by\`, if the answers above settle it.\n`;
    const r = opts.from
      ? (() => { try { return { questions: parseFinderOutput(readFileSync(join(opts.from, `${stage}.json`), 'utf8')) }; } catch (e) { return { error: e.message }; } })()
      : await runFinder(command, finderPrompt(ws, change, stage) + extra, root);
    if (r.error) notRun.push({ stage, why: r.error }); else rewritten[stage] = r.questions;
  }));
  const next = decideByAi(rewriteReopened(state, rewritten), { passed: state.passed || [] });
  next.notRun = notRun;
  write(p.state, JSON.stringify(next, null, 2) + '\n');
  write(p.sheet, renderSheet(next));
  return { state: next, where: { least: null }, paths: p, round: 2 };
}

/** The person's reply to the sheet (steps 7 to 9): recorded, and the sheet rewritten. */
export function answer(root, ws, change, reply, { who = null } = {}) {
  const p = paths(root, ws, change);
  if (!existsSync(p.state)) throw new SweepError(`${change} has no sweep yet: run pedd sweep ${change} first`);
  if (!String(reply || '').trim()) throw new SweepError(`usage: pedd sweep ${change} answer "all as recommended, except 3: b"`);
  const before = JSON.parse(readFileSync(p.state, 'utf8'));
  if (who && !['client', 'builder'].includes(who)) throw new SweepError(`--as is client or builder, not "${who}"`);
  const { state, reopened, unknown } = applyReply(before, reply, { passed: before.passed || [], who });
  write(p.state, JSON.stringify(state, null, 2) + '\n');
  write(p.sheet, renderSheet(state));
  return { state, reopened, unknown, paths: p };
}
