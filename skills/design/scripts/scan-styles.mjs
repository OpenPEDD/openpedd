#!/usr/bin/env node
// Reads a codebase for styles outside its system: raw colors, arbitrary values, inline styles, raw
// px in CSS, !important, numeric z-index, and the same class set written in several files (a piece
// the catalog lacks). It also counts the distinct values in use, so an auditor sees "11 font sizes".
// It measures; it decides nothing. Zero dependencies, Node 18+.
//
//   node scan-styles.mjs <dir> [--allow <substring>]... [--min-files 3] [--min-classes 4] [--json]
//
// Files whose path contains "token", "theme" or a --allow substring are where raw values belong:
// their values are counted but not reported. Source: OpenPEDD design skill, RULE-33 v1.0, MKT-06.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const args = process.argv.slice(2);
const opt = (name, fallback) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : fallback; };
const many = (name) => args.flatMap((a, i) => (a === `--${name}` ? [args[i + 1]] : []));
const VALUED = new Set(['--allow', '--min-files', '--min-classes']);
const root = args.find((a, i) => !a.startsWith('--') && !VALUED.has(args[i - 1]));
if (!root) { console.error('usage: node scan-styles.mjs <dir> [--allow <substring>]... [--min-files 3] [--min-classes 4] [--json]'); process.exit(2); }

const MIN_FILES = Number(opt('min-files', 3));
const MIN_CLASSES = Number(opt('min-classes', 4));
const ALLOW = ['token', 'theme', ...many('allow')];
const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build', 'out', 'coverage', 'storybook-static', '.turbo', '.pedd']);
const EXT = /\.(tsx|jsx|ts|js|mjs|vue|svelte|astro|html|css|scss|less)$/;
const SKIP_FILE = /\.(test|spec|stories|d)\.[a-z]+$|\.min\.(js|css)$/;

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir).sort()) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (EXT.test(name) && !SKIP_FILE.test(name) && st.size < 1_000_000) files.push(full);
  }
})(root);

const rel = (p) => relative(root, p).split(sep).join('/');
const findings = { rawColor: [], arbitrary: [], inlineStyle: [], rawPx: [], important: [], zIndex: [] };
const census = { color: new Map(), fontSize: new Map(), spacing: new Map(), radius: new Map(), shadow: new Map() };
const classSets = new Map(); // normalized class set → Set(files)
const bump = (map, key, where) => { const e = map.get(key) ?? { count: 0, files: new Set() }; e.count++; e.files.add(where); map.set(key, e); };

const COLOR = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\([^)]*\)/g;
const ARBITRARY = /(?<![\w-])(?:[a-z]+:)*-?[a-z][a-z0-9-]*-\[[^\]\s"'`]+\]/g;
const TW_SPACE = /(?<![\w-])-?(?:p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y|inset|top|right|bottom|left)-(\d+(?:\.\d+)?|px)(?![\w-])/g;
const TW_TEXT = /(?<![\w-])text-(xs|sm|base|lg|xl|[2-9]xl)(?![\w-])/g;
const TW_RADIUS = /(?<![\w-])rounded(?:-[trbl]{1,2})?(?:-(none|xs|sm|md|lg|xl|2xl|3xl|full))?(?![\w-])/g;
const TW_SHADOW = /(?<![\w-])shadow(?:-(2xs|xs|sm|md|lg|xl|2xl|inner|none))?(?![\w-])/g;
const CSS_DECL = /(?:^|[;{\s])(margin|padding|gap|row-gap|column-gap|font-size|border-radius|top|right|bottom|left|width|height|line-height|letter-spacing)(?:-[a-z]+)?\s*:\s*([^;}{\n]+)/g;
const CLASS_ATTR = /\b(?:class|className)\s*=\s*(?:"([^"]+)"|'([^']+)'|\{\s*[`"']([^`"']+)[`"']\s*\})/g;
const CN_CALL = /\b(?:cn|clsx|cva|twMerge|classNames)\(\s*[`"']([^`"']+)[`"']/g;

for (const file of files) {
  const path = rel(file);
  const text = readFileSync(file, 'utf8');
  const allowed = ALLOW.some((s) => path.toLowerCase().includes(s.toLowerCase()));
  const isCss = /\.(css|scss|less)$/.test(file);
  const lines = text.split('\n');

  lines.forEach((line, i) => {
    const at = `${path}:${i + 1}`;
    if (/^\s*(\/\/|\/\*|\*|<!--)/.test(line)) return;
    for (const m of line.matchAll(COLOR)) {
      const value = m[0].toLowerCase();
      if (isCss && /--[\w-]+\s*:/.test(line) && allowed) { bump(census.color, value, path); continue; }
      bump(census.color, value, path);
      if (!allowed && !/var\(--/.test(m[0])) findings.rawColor.push({ at, value: m[0] });
    }
    for (const m of line.matchAll(ARBITRARY)) {
      if (/^(?:[a-z]+:)*(?:data|aria|group|peer|supports|has)-\[/.test(m[0])) continue; // variants, not values
      if (!allowed) findings.arbitrary.push({ at, value: m[0] });
    }
    if (/\bstyle\s*=\s*\{\{|\bstyle\s*=\s*"[^"]*\d+px/.test(line) && !allowed) findings.inlineStyle.push({ at, value: line.trim().slice(0, 120) });
    if (/!important/.test(line) && !allowed) findings.important.push({ at, value: line.trim().slice(0, 120) });
    const z = line.match(/z-index\s*:\s*(-?\d+)|(?<![\w-])z-(\d{2,})(?![\w-])|zIndex\s*:\s*(\d+)/);
    if (z && !allowed) findings.zIndex.push({ at, value: z[0] });
    for (const m of line.matchAll(TW_SPACE)) bump(census.spacing, m[1], path);
    for (const m of line.matchAll(TW_TEXT)) bump(census.fontSize, `text-${m[1]}`, path);
    for (const m of line.matchAll(TW_RADIUS)) bump(census.radius, m[0], path);
    for (const m of line.matchAll(TW_SHADOW)) bump(census.shadow, m[0], path);
  });

  if (isCss || /\.(vue|svelte|astro|html)$/.test(file) || /styled\.|css`/.test(text)) {
    for (const m of text.matchAll(CSS_DECL)) {
      const [prop, value] = [m[1], m[2].trim()];
      const line = text.slice(0, m.index).split('\n').length;
      if (prop === 'font-size') bump(census.fontSize, value, path);
      else if (prop === 'border-radius') bump(census.radius, value, path);
      else if (/margin|padding|gap/.test(prop)) bump(census.spacing, value, path);
      if (!allowed && /(?<![\w.-])\d*\.?\d+px\b/.test(value) && !/var\(--|calc\(|^0(px)?$/.test(value) && !/^1px\b/.test(value)) {
        findings.rawPx.push({ at: `${path}:${line}`, value: `${prop}: ${value}` });
      }
    }
  }

  for (const re of [CLASS_ATTR, CN_CALL]) {
    for (const m of text.matchAll(re)) {
      const raw = (m[1] ?? m[2] ?? m[3] ?? '').replace(/\$\{[^}]*\}/g, ' ');
      const set = [...new Set(raw.split(/\s+/).filter((c) => c && !c.includes('${')))].sort();
      if (set.length < MIN_CLASSES) continue;
      const key = set.join(' ');
      (classSets.get(key) ?? classSets.set(key, new Set()).get(key)).add(path);
    }
  }
}

const repeated = [...classSets].filter(([, fs]) => fs.size >= MIN_FILES)
  .map(([classes, fs]) => ({ classes, files: [...fs].sort() }))
  .sort((a, b) => b.files.length - a.files.length);
const top = (map) => [...map].map(([value, e]) => ({ value, count: e.count, files: e.files.size })).sort((a, b) => b.count - a.count);
const report = {
  root, files: files.length, allowed: ALLOW,
  findings: Object.fromEntries(Object.entries(findings).map(([k, v]) => [k, { total: v.length, items: v }])),
  repeatedClassSets: repeated,
  census: Object.fromEntries(Object.entries(census).map(([k, m]) => [k, top(m)])),
};

if (args.includes('--json')) { console.log(JSON.stringify(report, null, 2)); process.exit(0); }

const LABEL = {
  rawColor: 'Raw colors outside token files', arbitrary: 'Arbitrary values (`x-[…]`)', inlineStyle: 'Inline styles',
  rawPx: 'Raw px in CSS declarations', important: '`!important`', zIndex: 'Numeric z-index',
};
console.log(`# Style scan of ${root}\n\n${files.length} files read. Token files (path contains ${ALLOW.map((a) => `"${a}"`).join(', ')}) are counted, not reported.\n`);
console.log('| Kind | Total |\n|---|---|');
for (const [k, v] of Object.entries(findings)) console.log(`| ${LABEL[k]} | ${v.length} |`);
console.log(`| Class sets of ${MIN_CLASSES}+ classes repeated in ${MIN_FILES}+ files | ${repeated.length} |`);
for (const [k, v] of Object.entries(findings)) {
  if (!v.length) continue;
  console.log(`\n## ${LABEL[k]}\n`);
  for (const f of v.slice(0, 40)) console.log(`- \`${f.at}\` ${'`' + f.value.replace(/`/g, "'") + '`'}`);
  if (v.length > 40) console.log(`- … ${v.length - 40} more (use --json)`);
}
if (repeated.length) {
  console.log('\n## Repeated class sets: a piece the catalog may lack\n');
  for (const r of repeated.slice(0, 20)) console.log(`- ${r.files.length} files: \`${r.classes}\`\n  ${r.files.slice(0, 6).join(', ')}${r.files.length > 6 ? ', …' : ''}`);
}
console.log('\n## Distinct values in use\n');
for (const [k, list] of Object.entries(report.census)) {
  if (!list.length) continue;
  console.log(`- **${k}** (${list.length} distinct): ${list.slice(0, 16).map((e) => `\`${e.value}\` ×${e.count}`).join(', ')}${list.length > 16 ? ', …' : ''}`);
}
