// For a caller with a working tree: the files of a folder as path → text, the reader's input.
// The Cloud does not use this: it hands the reader the files it fetched.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const SKIP = new Set(['.git', 'node_modules', '.pedd']);
const TEXT = /\.(md|jsonl|ya?ml)$/;

/** Every Markdown, JSONL and YAML file under `root`, keyed by its path relative to it. */
export function readFiles(root, dir = root, out = new Map()) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) readFiles(root, full, out);
    else if (TEXT.test(name)) out.set(relative(root, full).split(sep).join('/'), readFileSync(full, 'utf8'));
  }
  return out;
}
