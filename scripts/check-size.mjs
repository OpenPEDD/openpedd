// RULE-04: token budget per document.
//
// A document over budget fails only if it grew against the last commit: what was already large
// shows as visible pressure and shrinks when someone touches it.
//
//   node scripts/check-size.mjs
import { execFileSync } from 'node:child_process';
import { ROOT, green, read, red, specFiles, tokens, yellow } from './lib.mjs';

/** The first rule whose prefix matches wins. */
const BUDGETS = [
  ['spec/foundations/glossary.md', 4000],
  ['spec/product/', 4000],
  ['spec/foundations/', 2000],
  ['spec/decisions/', 1000],
  ['spec/open/', 2000],
];

const budgetOf = (path) => BUDGETS.find(([prefix]) => path.startsWith(prefix))?.[1];

function committedTokens(path) {
  try {
    return tokens(execFileSync('git', ['show', `HEAD:${path}`], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
  } catch {
    return undefined; // new file, or no commits yet
  }
}

let failed = 0;
for (const path of specFiles()) {
  const budget = budgetOf(path);
  if (!budget) continue;
  const now = tokens(read(path));
  if (now <= budget) continue;
  const before = committedTokens(path);
  const grew = before === undefined || now > before;
  if (grew) {
    failed++;
    console.log(red(`✗ ${path}: ${now} tokens, budget ${budget}`));
  } else {
    console.log(yellow(`! ${path}: ${now} tokens, budget ${budget} (did not grow)`));
  }
}

console.log(failed ? red(`${failed} document(s) over budget.`) : green('✓ Every document within budget, or not growing.'));
process.exit(failed ? 1 : 0);
