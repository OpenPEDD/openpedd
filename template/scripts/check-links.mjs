// Relative links that point to a missing file or a missing anchor.
//
// An anchor exists when a heading of the target ends in `[#anchor]`, or when the heading's slug
// equals it.
//
//   node scripts/check-links.mjs
import { existsSync } from 'node:fs';
import { dirname, join, normalize, relative, sep } from 'node:path';
import { ROOT, green, read, red, specFiles } from './lib.mjs';

const slug = (heading) =>
  heading
    .replace(/\[#[^\]]+\]\s*$/, '')
    .toLowerCase()
    .replace(/[`*_]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');

function anchorsOf(path) {
  const anchors = new Set();
  for (const line of read(path).split('\n')) {
    const m = line.match(/^#+\s+(.*)$/);
    if (!m) continue;
    const explicit = m[1].match(/\[#([^\]]+)\]\s*$/);
    if (explicit) anchors.add(explicit[1]);
    anchors.add(slug(m[1]));
  }
  return anchors;
}

let broken = 0;
for (const path of specFiles()) {
  const text = read(path).replace(/```[\s\S]*?```/g, '');
  for (const [, target] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^(https?:|mailto:)/.test(target)) continue;
    const [file, anchor] = target.split('#');
    const resolved = file ? normalize(join(dirname(path), file)).split(sep).join('/') : path;
    if (!existsSync(join(ROOT, resolved))) {
      broken++;
      console.log(red(`✗ ${path} → ${target}: file not found`));
      continue;
    }
    if (anchor && resolved.endsWith('.md') && !anchorsOf(resolved).has(anchor)) {
      broken++;
      console.log(red(`✗ ${path} → ${target}: anchor not found`));
    }
  }
}

console.log(broken ? red(`${broken} broken link(s).`) : green('✓ No broken links.'));
process.exit(broken ? 1 : 0);
