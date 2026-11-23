import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyReply, mergeQuestions, parseReply, renderSheet, rewriteReopened, stagesAhead } from '../src/index.mjs';

const q = (key, about, extra = {}) => ({ key, about, target: 'FR-JOB-01', breaks: 'x', options: [{ option: 'A', then: '' }, { option: 'B', then: '' }], recommended: 0, reason: 'r', evidence: 'FR-JOB-02', undo: '`apps/app/locales/en.json`: copy', ...extra });

test('stagesAhead: from the least advanced status of the change\'s requirements', () => {
  assert.deepEqual(stagesAhead(null), ['specify', 'architect', 'design', 'plan']);
  assert.deepEqual(stagesAhead('specified'), ['architect', 'design', 'plan']);
  assert.deepEqual(stagesAhead('designed'), ['plan']);
  assert.deepEqual(stagesAhead('building'), []);
});

test('mergeQuestions: drops the answered and the unusable, keeps one per question under its owner, heaviest first', () => {
  const { questions, dropped, rejected } = mergeQuestions({
    design: [q('copy', 'What does the empty list say?')],
    architect: [q('store', 'Where are the job posts stored?', { target: 'ENT-04', undo: 'a migration', evidence: 'guess' }), q('who2', 'Who can see the job posts list?')],
    specify: [q('who', 'Who can see the job posts?', { evidence: 'guess' }), { about: 'Is there a list?', answered_by: 'FR-JOB-01' }, { about: 'Half a question', options: ['only one'] }],
  });
  assert.deepEqual(questions.map((x) => [x.n, x.key, x.stage, x.weight]), [[1, 'store', 'architect', 'high'], [2, 'who', 'specify', 'medium'], [3, 'copy', 'design', 'low']]);
  assert.deepEqual(questions[1].alsoAskedBy, ['architect'], 'the what owns it; the how found it too');
  assert.deepEqual(dropped, [{ stage: 'specify', about: 'Is there a list?', answeredBy: 'FR-JOB-01' }]);
  assert.deepEqual(rejected[0].problems, ['has fewer than two options', 'gives no reason for its recommendation']);
});

test('mergeQuestions: a question others depend on weighs more (Fan-out); an option\'s words are no trigger', () => {
  const deps = ['a', 'b', 'c'].map((k) => q(k, `Dependent ${k}`, { depends_on: ['root'] }));
  const { questions } = mergeQuestions({ specify: [q('root', 'The root question'), ...deps, q('inv', 'What does the empty list say?', { options: ['No invoices yet', 'Nothing'] })] });
  const root = questions.find((x) => x.key === 'root');
  assert.equal(root.weight, 'medium', 'low from the table and the evidence, one up from three dependents');
  assert.deepEqual(root.dependents, ['a', 'b', 'c']);
  assert.equal(questions.find((x) => x.key === 'inv').weight, 'low');
});

test('renderSheet: the high are asked with their options; the rest are shown decided, overturnable', () => {
  const { questions } = mergeQuestions({ specify: [q('who', 'Who can see the job posts?', { evidence: 'guess', undo: 'logic' }), q('copy', 'What does the empty list say?')] });
  const md = renderSheet({ change: 'CHG-040', round: 1, questions, ran: ['specify'], notRun: [] });
  assert.match(md, /## To answer \(1\)[\s\S]*### 1 · Who can see the job posts\?[\s\S]*\| a ✓ \| A \|/);
  assert.match(md, /## Decided by their recommendation \(1\)[\s\S]*\| 2 \| What does the empty list say\? \| a: A \| low/);
});

test('parseReply: one reply in English or Spanish; a letter picks, other words are a custom answer, later leaves it open', () => {
  const { questions } = mergeQuestions({ specify: [1, 2, 3, 4].map((i) => q(`k${i}`, `Question number ${i}`, { evidence: 'guess', undo: 'logic', target: `FR-JOB-0${i}` })) });
  const by = (r) => Object.fromEntries(parseReply(r, questions).answers.map((a) => [a.n, a.open ? 'open' : a.custom ?? `${a.option}/${a.by}`]));
  assert.deepEqual(by('all as recommended, except 2: b, 3: monthly plan'), { 1: '0/recommendation', 2: '1/person', 3: 'monthly plan', 4: '0/recommendation' });
  assert.deepEqual(by('todo como recomendado, salvo 4: later'), { 1: '0/recommendation', 2: '0/recommendation', 3: '0/recommendation', 4: 'open' });
  assert.deepEqual(by('1: b'), { 1: '1/person' }, 'without accepting the rest, the asked ones stay unanswered');
  assert.deepEqual(parseReply('9: a', questions).unknown, [9]);
});

test('applyReply: an answer other than the recommendation reopens what assumed it; round 2 rewrites only those, then nothing stays unanswered', () => {
  const { questions } = mergeQuestions({ specify: [q('who', 'Who can see the job posts?', { evidence: 'guess', undo: 'logic' })], architect: [q('store', 'Where are the posts stored?', { target: 'ENT-04', undo: 'a migration', depends_on: ['who'], evidence: 'guess' })] });
  let state = { change: 'CHG-040', round: 1, questions };
  const n = questions.find((x) => x.key === 'who').n;
  assert.equal(questions.find((x) => x.key === 'store').n, 1, 'the migration weighs most and goes first');
  const r1 = applyReply(state, `all as recommended, except ${n}: b`, { passed: ['specify'] });
  const who = r1.state.questions.find((x) => x.key === 'who'), store = r1.state.questions.find((x) => x.key === 'store');
  assert.equal(who.answer.goesTo, 'A `proposal` delta, decided at the gate', 'specify is past its gate');
  assert.equal(store.answer, undefined);
  assert.equal(store.reopened, true);
  assert.equal(r1.state.round, 2);
  state = rewriteReopened(r1.state, { architect: [q('store', 'Where are the posts stored, now that everyone sees them?', { target: 'ENT-04', undo: 'a migration', evidence: 'guess' })] });
  assert.equal(state.questions.find((x) => x.key === 'store').about, 'Where are the posts stored, now that everyone sees them?');
  const r2 = applyReply(state, 'ok');
  assert.equal(r2.state.questions.find((x) => x.key === 'store').answer.by, 'recommendation');
  assert.ok(r2.state.questions.every((x) => x.answer));
});
