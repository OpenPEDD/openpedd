// Shared helpers for the spec checks.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));

const SKIP = new Set(['.git', 'node_modules', 'scripts', '.pedd']);

/** Every Markdown file in the spec, as a path relative to the root with forward slashes. */
export function specFiles(dir = ROOT) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...specFiles(full));
    else if (name.endsWith('.md')) out.push(relative(ROOT, full).split(sep).join('/'));
  }
  return out;
}

export const read = (path) => readFileSync(join(ROOT, path), 'utf8');

/** English prose averages about 4 characters per token. */
export const tokens = (text) => Math.ceil(text.length / 4);

export const red = (s) => `\x1b[31m${s}\x1b[0m`;
export const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
export const green = (s) => `\x1b[32m${s}\x1b[0m`;
