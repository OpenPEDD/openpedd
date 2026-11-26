// The sweep's steps that need no model (ARCH-16): merge what the finders found, drop what is answered,
// weigh and order it, write the sheet, read the person's one reply and say where each answer goes.
// The finders themselves are sessions that only read; pedd runs them and hands their output here.
import { weigh } from './weight.mjs';

/** The stages a sweep looks ahead at, in the order their answers are owned: the what, the how, the look, the cut. */
export const SWEEP_STAGES = ['specify', 'architect', 'design', 'plan'];

/**
 * Who answers each stage's questions (ARCH-16, who answers): the client answers the what; the product
 * engineer building it answers the how and the look; the AI decides what the plan needs, and records it.
 */
export const ANSWERER = { specify: 'client', architect: 'builder', design: 'builder', plan: 'ai' };
export const ANSWERER_LABEL = { client: 'the client', builder: 'the product engineer', ai: 'the AI' };

/** What each finder looks for, and whose checklist it uses (ARCH-16, step 2). */
export const FINDERS = {
  specify: { looksFor: 'What a builder would have to guess: flows, permissions, who writes each field, outside transitions, copy, the metric', checklist: 'cold-read-judge · prd-judge' },
  architect: { looksFor: 'Every decision still open: a choice with real options, an assumption the code does not prove, a cost with no price, an operation with more than one write and no crash plan', checklist: 'architecture-judge' },
  design: { looksFor: 'A screen or state with no decided behavior or copy; data a screen assumes that the spec does not give', checklist: 'design-judge' },
  plan: { looksFor: 'What stops the tasks being cut: an unclear dependency, missing test data, a criterion that cannot be tested', checklist: 'analyze-judge' },
};

/** Whose gate each stage's answers wait for (ARCH-16, step 8): before it, the owner writes; after it, a `proposal` delta. */
const GATE_STATUS = { specify: 'specified', architect: 'designed', design: 'designed', plan: 'building' };
const ORDER = ['draft', 'specified', 'designed', 'building', 'in_review', 'accepted', 'changing', 'live', 'deprecated'];

/**
 * The stages still ahead of a change, from the least advanced status of its PRDs' requirements: `specify`
 * is behind once they are `specified`, `architect` and `design` once `designed`, `plan` once `building`.
 */
export function stagesAhead(leastStatus) {
  const at = ORDER.indexOf(leastStatus || 'draft');
  return SWEEP_STAGES.filter((s) => at < ORDER.indexOf(GATE_STATUS[s]));
}

const ID = /\b(?:N?FR-[A-Z]{2,6}-\d+(?:\.AC\d+)?|(?:BIZ|MKT|MKG|ENT|RULE|ARCH|DEC|ADR|Q|CHG|DLT|PRC|BUC|SEC|INT|EVT|US|RSK)-\d+)\b/g;
const tokens = (s) => new Set(String(s || '').toLowerCase().replace(/`[^`]*`/g, ' ').match(/[a-z0-9]{3,}/g) || []);
const similar = (a, b) => {
  const x = tokens(a), y = tokens(b);
  if (!x.size || !y.size) return 0;
  let n = 0;
  for (const t of x) if (y.has(t)) n++;
  // Three shared words at least: two short questions on one target are not the same question.
  return n < 3 ? 0 : n / Math.min(x.size, y.size);
};

/**
 * One finder's question, as it must come out of the session (ARCH-16, step 5). Anything else it adds
 * is dropped. A question that names what already answers it (`answered_by`) is dropped at step 3.
 */
export function normalizeQuestion(raw, stage) {
  const options = (Array.isArray(raw.options) ? raw.options : []).map((o) => (typeof o === 'string' ? { option: o, then: '' } : { option: String(o.option ?? ''), then: String(o.then ?? o.consequence ?? '') })).filter((o) => o.option);
  let rec = Number.isInteger(raw.recommended) ? raw.recommended : options.findIndex((o) => o.option === raw.recommended);
  if (rec < 0 || rec >= options.length) rec = 0;
  return {
    key: String(raw.key || '').trim() || null,
    stage,
    who: ANSWERER[stage],
    about: String(raw.about || '').trim(),
    target: String(raw.target || '').trim(),
    breaks: String(raw.breaks || '').trim(),
    options,
    recommended: rec,
    reason: String(raw.reason || '').trim(),
    evidence: String(raw.evidence || '').trim(),
    undo: String(raw.undo || '').trim(),
    dependsOn: (Array.isArray(raw.depends_on) ? raw.depends_on : raw.depends_on ? [raw.depends_on] : []).map(String),
    blocksGate: raw.blocks_gate === true,
    answeredBy: String(raw.answered_by || '').trim() || null,
  };
}

/** Problems that make a finder's question unusable: it is kept out, and the problem is shown. */
export function questionProblems(q) {
  const out = [];
  if (!q.about) out.push('says nothing in `about`');
  if (q.options.length < 2) out.push('has fewer than two options');
  if (!q.reason) out.push('gives no reason for its recommendation');
  return out;
}

/**
 * Steps 3 to 6: drop what is answered, merge duplicates under their owner, weigh, order and number.
 *
 * @param findings  { [stage]: raw question[] }, as the finders gave them.
 * @returns { questions, dropped, rejected }: questions numbered from 1, heaviest first.
 */
export function mergeQuestions(findings) {
  const dropped = [], rejected = [], kept = [];
  for (const stage of SWEEP_STAGES) {
    for (const raw of findings[stage] || []) {
      const q = normalizeQuestion(raw, stage);
      if (q.answeredBy) { dropped.push({ stage, about: q.about, answeredBy: q.answeredBy }); continue; }
      const problems = questionProblems(q);
      if (problems.length) { rejected.push({ stage, about: q.about || '(no about)', problems }); continue; }
      // Step 4: asked once, by its owner; an earlier stage owns it (the what before the how before the look).
      const sameTarget = (a, b) => {
        const ia = a.target.match(ID) || [], ib = b.target.match(ID) || [];
        return ia.length && ib.length ? ia.some((i) => ib.includes(i)) : a.target.toLowerCase() === b.target.toLowerCase();
      };
      const twin = kept.find((k) => (q.key && k.key === q.key) || (sameTarget(k, q) && similar(k.about, q.about) >= 0.6));
      if (twin) { twin.alsoAskedBy = [...new Set([...(twin.alsoAskedBy || []), stage])]; continue; }
      kept.push(q);
    }
  }
  // Fan-out: the questions that depend on each, by key.
  const keyOf = (q, i) => q.key || `q${i}`;
  kept.forEach((q, i) => { q.key = keyOf(q, i); });
  for (const q of kept) {
    q.dependents = kept.filter((o) => o.dependsOn.includes(q.key)).map((o) => o.key);
    // The options are not read for hard triggers: an option's wording ("No invoices yet") is not what the question touches.
    const w = weigh({ target: q.target, reason: q.about, revert: q.undo, evidence: q.evidence, if_no: q.breaks }, { dependents: q.dependents.length });
    q.weight = w.weight;
    q.says = w.says;
    q.factors = w.factors;
  }
  const rank = { high: 0, medium: 1, low: 2 }, undo = { high: 0, medium: 1, low: 2 };
  kept.sort((a, b) => rank[a.weight] - rank[b.weight] || Number(b.blocksGate) - Number(a.blocksGate) || undo[a.factors.undo.level] - undo[b.factors.undo.level] || SWEEP_STAGES.indexOf(a.stage) - SWEEP_STAGES.indexOf(b.stage));
  kept.forEach((q, i) => { q.n = i + 1; });
  return { questions: kept, dropped, rejected };
}

/** Which questions are asked and which are shown decided (ARCH-16, step 7). */
export const isAsked = (q, { askAll = false } = {}) => q.who !== 'ai' && (askAll || q.reopened === true || q.weight === 'high');

const letter = (i) => String.fromCharCode(97 + i);
const cell = (s) => String(s || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

/** The sheet as Markdown: what `changes/<CHG>/sweep.md` holds and the chat shows. */
export function renderSheet(state) {
  const { change, round, questions, askAll } = state;
  const asked = questions.filter((q) => isAsked(q, { askAll }) && !q.answer);
  const decided = questions.filter((q) => !isAsked(q, { askAll }) && !q.answer);
  const answered = questions.filter((q) => q.answer);
  const lines = [`# Sweep · ${change}${round > 1 ? ` · round ${round}` : ''}`, ''];
  if (state.ran?.length) lines.push(`Stages swept: ${state.ran.map((s) => `\`${s}\``).join(', ')}.${state.notRun?.length ? ` Not run: ${state.notRun.map((n) => `\`${n.stage}\` (${n.why})`).join(', ')}.` : ''}`, '');
  for (const who of ['client', 'builder']) {
    const mine = asked.filter((q) => q.who === who);
    if (!mine.length) continue;
    lines.push(`## For ${ANSWERER_LABEL[who]} to answer (${mine.length})`, '', 'Answer in one reply: *"all as recommended, except 3: b, 7: …"*. Your lines in the decided list below can be overturned the same way.', '');
    for (const q of mine) {
      lines.push(`### ${q.n} · ${q.about}`, '', `*${q.says}*${q.alsoAskedBy?.length ? ` · also found by ${q.alsoAskedBy.join(', ')}` : ''}`, '');
      if (q.breaks) lines.push(`**If guessed:** ${q.breaks}`, '');
      lines.push('| | Option | Then |', '|---|---|---|');
      q.options.forEach((o, i) => lines.push(`| ${letter(i)}${i === q.recommended ? ' ✓' : ''} | ${cell(o.option)} | ${cell(o.then)} |`));
      lines.push('', `**Recommended: ${letter(q.recommended)}.** ${q.reason}`);
      if (q.evidence) lines.push(`Backed by: ${q.evidence}`);
      if (q.dependents.length) lines.push(`Questions under it: ${q.dependents.map((k) => `${questions.find((o) => o.key === k)?.n}`).join(', ')}, written assuming ${letter(q.recommended)}.`);
      lines.push('');
    }
  }
  if (decided.length) {
    lines.push(`## Decided by their recommendation (${decided.length})`, '', '| # | Question | Taken | Weight | Answers it |', '|---|---|---|---|---|');
    for (const q of decided) lines.push(`| ${q.n} | ${cell(q.about)} | ${letter(q.recommended)}: ${cell(q.options[q.recommended].option)} | ${cell(q.says)} | ${ANSWERER_LABEL[q.who]} |`);
    lines.push('');
  }
  if (answered.length) {
    lines.push(`## Answers (${answered.length})`, '', '| # | Question | Answer | By | Goes to |', '|---|---|---|---|---|');
    for (const q of answered) lines.push(`| ${q.n} | ${cell(q.about)} | ${cell(q.answer.text)} | ${q.answer.by} | ${cell(q.answer.goesTo)} |`);
    lines.push('');
  }
  if (!questions.length) lines.push('Nothing left to ask: every stage swept found its answers in the spec or the code.', '');
  return lines.join('\n');
}

/**
 * The person's one reply (ARCH-16, step 7): *"all as recommended, except 3: b, 7: monthly"*. A number
 * followed by a letter picks that option; by other words, a custom answer; by `later` or `?`, left open.
 * Every other question takes its recommendation when the reply accepts the rest (all, ok, recommended,
 * todo, recomendado, dale, sí), and only the shown-decided ones otherwise.
 */
export function parseReply(reply, questions, { askAll = false, who = null } = {}) {
  const text = String(reply || '');
  const picks = new Map();
  const re = /(?:^|[\s,;])(\d+)\s*[:=)]\s*([^,;\n]+?)(?=\s*(?:[,;\n]|\s\d+\s*[:=)]|$))/g;
  for (const m of text.matchAll(re)) picks.set(Number(m[1]), m[2].trim());
  const acceptsRest = /\b(all|ok|okay|recommended|todo|todos|recomendad[ao]s?|dale|s[ií]|yes)\b/i.test(text.replace(re, ' '));
  const unknown = [...picks.keys()].filter((n) => !questions.some((q) => q.n === n));
  const answers = [];
  for (const q of questions) {
    // The AI's questions are decided by it; a person answers only theirs when the reply says who they are.
    if (q.answer || q.who === 'ai' || (who && q.who !== who)) continue;
    const pick = picks.get(q.n);
    if (pick !== undefined) {
      if (/^(later|despu[eé]s|\?|open|abierta)$/i.test(pick)) { answers.push({ n: q.n, open: true }); continue; }
      const i = /^[a-z]$/i.test(pick) ? pick.toLowerCase().charCodeAt(0) - 97 : -1;
      if (i >= 0 && i < q.options.length) answers.push({ n: q.n, option: i, by: i === q.recommended ? 'recommendation' : 'person' });
      else answers.push({ n: q.n, custom: pick, by: 'person' });
    } else if (acceptsRest || !isAsked(q, { askAll })) answers.push({ n: q.n, option: q.recommended, by: 'recommendation' });
  }
  return { answers, unknown, acceptsRest };
}

/** Where an answer is written (ARCH-16, step 8), by its owner and whether the owner's gate is behind. */
export function whereItGoes(stage, gatePassed, open = false) {
  if (open) return 'A `Q`, open';
  if (gatePassed) return 'A `proposal` delta, decided at the gate';
  return { specify: '`specify` writes it in the PRD', architect: "A row in the area's decisions table, or an `ADR`, on the architecture branch", design: 'The design branch', plan: '`plan`, in the tasks it cuts' }[stage];
}

/**
 * Applies a reply to the sweep's state. An answer other than the recommendation reopens the questions
 * under it for a second round (step 9); after round 2, whatever stays unanswered stays open.
 *
 * @returns { state, reopened, unknown }
 */
export function applyReply(state, reply, { passed = [], who = null } = {}) {
  const { answers, unknown } = parseReply(reply, state.questions, { askAll: state.askAll, who });
  const r = applyAnswers(state, answers, { passed, who });
  return { ...r, unknown: [...unknown, ...r.unknown] };
}

/**
 * The same with answers already structured, as the Cloud sends them: [{ n, option } | { n, custom } |
 * { n, open: true }], each `by` the person or the recommendation.
 */
export function applyAnswers(state, answers, { passed = [], who = null } = {}) {
  const unknown = [];
  answers = answers.filter((a) => {
    const q = state.questions.find((x) => x.n === a.n);
    if (!q || q.who === 'ai' || (who && q.who !== who)) { unknown.push(a.n); return false; }
    if (a.by === undefined) a.by = a.custom === undefined && !a.open && a.option === q.recommended ? 'recommendation' : 'person';
    return true;
  });
  const byN = new Map(state.questions.map((q) => [q.n, q]));
  // First, what an answer other than the recommendation reopens: those are not taken by recommendation now.
  const reopen = new Set();
  for (const a of answers) {
    const q = byN.get(a.n);
    if (a.by === 'person' && (a.custom !== undefined || a.option !== q.recommended)) for (const k of q.dependents) reopen.add(k);
  }
  const reopened = [];
  for (const q of state.questions) {
    if (!reopen.has(q.key)) continue;
    if (!q.answer || q.answer.by === 'recommendation') { delete q.answer; q.reopened = true; reopened.push(q.n); }
  }
  for (const a of answers) {
    const q = byN.get(a.n);
    if (reopen.has(q.key) && a.by === 'recommendation') continue;
    const gatePassed = passed.includes(q.stage);
    if (a.open) { q.answer = { text: 'Left open', by: 'person', goesTo: whereItGoes(q.stage, gatePassed, true), open: true }; continue; }
    const text = a.custom !== undefined ? a.custom : `${letter(a.option)}: ${q.options[a.option].option}`;
    q.answer = { text, by: a.by, goesTo: whereItGoes(q.stage, gatePassed), option: a.option ?? null };
    if (reopen.has(q.key)) { delete q.reopened; reopened.splice(reopened.indexOf(q.n), 1); }
  }
  const next = { ...state, round: reopened.length ? Math.min(2, state.round + 1) : state.round };
  if (state.round >= 2) {
    for (const q of next.questions) if (!q.answer && q.who !== 'ai' && (!who || q.who === who)) q.answer = { text: 'Left open after two rounds', by: 'sweep', goesTo: whereItGoes(q.stage, passed.includes(q.stage), true), open: true };
  }
  return { state: next, reopened: [...new Set(reopened)].sort((a, b) => a - b), unknown };
}

/**
 * Round 2 (step 9): the reopened questions, rewritten by their finder knowing the answers given, take
 * the place of the old ones, keeping their number. A rewritten question that is dropped as answered
 * takes the answer its finder names.
 */
export function rewriteReopened(state, rewritten) {
  const byKey = new Map();
  for (const [stage, list] of Object.entries(rewritten)) for (const raw of list) byKey.set(String(raw.key || ''), normalizeQuestion(raw, stage));
  for (const q of state.questions) {
    if (!q.reopened) continue;
    const r = byKey.get(q.key);
    if (!r) continue;
    if (r.answeredBy) { q.answer = { text: `Answered by ${r.answeredBy}`, by: 'sweep', goesTo: '—' }; delete q.reopened; continue; }
    if (questionProblems(r).length) continue;
    const w = weigh({ target: r.target, reason: r.about, revert: r.undo, evidence: r.evidence, if_no: r.breaks }, { dependents: q.dependents.length });
    Object.assign(q, { about: r.about, target: r.target || q.target, breaks: r.breaks, options: r.options, recommended: r.recommended, reason: r.reason, evidence: r.evidence, undo: r.undo, weight: w.weight, says: w.says, factors: w.factors });
  }
  return state;
}

/** What a finder must know to rewrite its reopened questions: the answers given, as plain lines. */
export function answersSoFar(state) {
  return state.questions.filter((q) => q.answer).map((q) => `- ${q.about} → ${q.answer.text}`).join('\n');
}

/** The AI's questions (the plan's), decided by their recommendation and recorded as its (ARCH-16, who answers). */
export function decideByAi(state, { passed = [] } = {}) {
  for (const q of state.questions) {
    if (q.who !== 'ai' || q.answer) continue;
    q.answer = { text: `${letter(q.recommended)}: ${q.options[q.recommended].option}`, by: 'ai', goesTo: whereItGoes(q.stage, passed.includes(q.stage)), option: q.recommended };
    delete q.reopened;
  }
  return state;
}

/** How many questions are still waiting on each person: { client, builder }. */
export function pendingFor(state) {
  const out = { client: 0, builder: 0 };
  for (const q of state.questions || []) if (!q.answer && isAsked(q, { askAll: state.askAll }) && out[q.who] !== undefined) out[q.who]++;
  return out;
}
