// A stand-in for a finder session: reads the prompt on stdin and prints its questions as a finder would.
// `design` fails, to show a finder that did not run. Round 2 rewrites the reopened question.
let prompt = '';
process.stdin.on('data', (d) => { prompt += d; });
process.stdin.on('end', () => {
  const stage = prompt.match(/You are the `(\w+)` finder/)[1];
  if (stage === 'design') { process.stderr.write('no session'); process.exit(4); }
  const round2 = prompt.includes('## Round 2');
  const q = (key, about, extra = {}) => ({ key, about, target: 'FR-BIL-01', breaks: 'a guess ships', options: [{ option: 'A', then: 'a' }, { option: 'B', then: 'b' }], recommended: 0, reason: 'because', evidence: 'guess', undo: 'logic', ...extra });
  const out = {
    specify: [q('who', 'Who can see the invoices of a company?'), q('copy', 'What does the empty list say?', { evidence: 'FR-BIL-02', undo: 'copy' }), { about: 'Is there a billing page?', answered_by: 'FR-BIL-01' }],
    architect: [q('store', round2 ? 'Where are invoices stored, now that everyone sees them?' : 'Where are invoices stored?', { target: 'ENT-04', undo: 'a migration', depends_on: ['who'] })],
    plan: [q('data', 'Which test data do the invoice tests use?', { target: 'FR-BIL-03' })],
  }[stage];
  process.stdout.write(`Found:\n\`\`\`json\n${JSON.stringify(out)}\n\`\`\`\n`);
});
