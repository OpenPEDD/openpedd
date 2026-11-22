// How a spec's Markdown is read: frontmatter, headings, sections and tables.
// Every function takes text and returns plain data; nothing here touches a disk.

const FENCE = /```[\s\S]*?```/g;

/** Drops fenced code blocks, so a heading or a table inside one is not read. */
export const stripCode = (md) => (md || '').replace(FENCE, '');

/** A heading's text without its explicit anchor: `## The file [#the-file]` → `The file`. */
export const headingText = (line) => line.replace(/^#+\s+/, '').replace(/\s*\[#[^\]]+\]\s*$/, '').trim();

/** The slug GitHub gives a heading, the anchor when it names none. */
export const slug = (heading) =>
  heading
    .replace(/\[#[^\]]+\]\s*$/, '')
    .toLowerCase()
    .replace(/[`*_]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');

/** The body of a heading (any level), up to the next heading of the same or higher level. `null` when absent. */
export function section(text, heading) {
  const lines = (text || '').split('\n');
  const start = lines.findIndex((l) => /^#+\s/.test(l) && headingText(l) === heading);
  if (start < 0) return null;
  const level = lines[start].match(/^#+/)[0].length;
  const out = [];
  for (const l of lines.slice(start + 1)) {
    const m = l.match(/^(#+)\s/);
    if (m && m[1].length <= level) break;
    out.push(l);
  }
  return out.join('\n').trim();
}

/** Every heading outside code, as { level, text, anchor, explicit, line }. */
export function headings(text) {
  const out = [];
  let fenced = false;
  (text || '').split('\n').forEach((l, line) => {
    if (l.startsWith('```')) fenced = !fenced;
    if (fenced) return;
    const m = l.match(/^(#+)\s+(.*)$/);
    if (!m) return;
    const explicit = m[2].match(/\[#([^\]]+)\]\s*$/)?.[1] ?? null;
    out.push({ level: m[1].length, text: headingText(l), anchor: explicit || slug(m[2]), explicit, line: line + 1 });
  });
  return out;
}

export const splitRow = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

/** Every table in a piece of Markdown, as { header, rows } with rows as arrays of cells. */
export function tables(md) {
  const out = [];
  const lines = stripCode(md).split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith('|') || !/^\|[\s:|-]+\|$/.test((lines[i + 1] || '').trim())) continue;
    const header = splitRow(lines[i]);
    const rows = [];
    let j = i + 2;
    for (; j < lines.length && lines[j].startsWith('|'); j++) rows.push(splitRow(lines[j]));
    out.push({ header, rows });
    i = j;
  }
  return out;
}

/** The first table whose header has a column containing each of `cols`. */
export const tableWith = (md, ...cols) => tables(md).find((t) => cols.every((c) => t.header.some((h) => h.includes(c))));

/** The lines of a piece of Markdown that are not table rows. */
export const prose = (md) => (md || '').split('\n').filter((l) => !l.startsWith('|')).join('\n').trim();

/** Every `code span` in a string. */
export const code = (s) => [...(s || '').matchAll(/`([^`]+)`/g)].map((m) => m[1]);

const scalar = (v) => {
  const quoted = v.trim().match(/^(["'])(.*?)\1\s*(#.*)?$/);
  if (quoted) return quoted[2];
  const s = v.replace(/\s+#.*$/, '').trim();
  if (/^\[.*\]$/.test(s)) return s.slice(1, -1).split(',').map((x) => scalar(x)).filter((x) => x !== '');
  return s;
};

/**
 * The frontmatter between the first two `---` lines, with what is wrong in it.
 *
 * A flat key gives a string with its quotes and trailing comment dropped; an indented block gives an
 * object (`key: value` lines) or a list (`- item`). `present` is false when the text has no
 * frontmatter at all. Each problem is { line, message }, `line` counted in the whole text; a line that
 * cannot be read is reported and skipped, never guessed.
 */
export function parseFrontmatter(text) {
  const src = text || '';
  const data = {};
  const problems = [];
  const lines = src.split('\n');
  const first = lines.findIndex((l) => l.trim() !== '');
  if (first < 0 || lines[first].trim() !== '---') return { present: false, data, problems };
  if (first > 0 || lines[0] !== '---') problems.push({ line: first + 1, message: 'the frontmatter must open with `---` on the first line' });
  const close = lines.findIndex((l, i) => i > first && l.trim() === '---');
  if (close < 0) {
    problems.push({ line: first + 1, message: 'the frontmatter is not closed: no second `---` line' });
    return { present: true, data, problems };
  }
  const seen = new Set();
  let key = null, nested = false;
  for (let i = first + 1; i < close; i++) {
    const l = lines[i], line = i + 1;
    if (l.trim() === '' || /^\s*#/.test(l)) continue;
    const top = l.match(/^([\w-]+):(?:\s+(.*)|\s*)$/);
    if (top) {
      key = top[1];
      if (seen.has(key)) problems.push({ line, message: `\`${key}\` is set twice` });
      seen.add(key);
      const raw = top[2] ?? '';
      const quote = unclosedQuote(raw);
      if (quote) problems.push({ line, message: `\`${key}\`: ${quote}` });
      nested = raw.replace(/\s+#.*$/, '').trim() === '';
      data[key] = nested ? null : scalar(raw);
      continue;
    }
    if (/^\s+\S/.test(l) && key && nested) {
      const item = l.match(/^\s+-\s+(.*)$/);
      const sub = l.match(/^\s+([\w-]+):\s*(.*)$/);
      if (item && !(data[key] && typeof data[key] === 'object' && !Array.isArray(data[key]))) { data[key] = [...(data[key] || []), scalar(item[1])]; continue; }
      if (sub && !Array.isArray(data[key])) { data[key] = { ...(data[key] || {}), [sub[1]]: scalar(sub[2]) }; continue; }
      problems.push({ line, message: `\`${key}\` mixes a list and \`key: value\` lines` });
      continue;
    }
    problems.push({ line, message: /^\s/.test(l) ? `an indented line with no key above it to belong to: \`${l.trim()}\`` : `not \`key: value\`: \`${l.trim()}\`` });
  }
  for (const k of Object.keys(data)) if (data[k] === null) data[k] = '';
  return { present: true, data, problems };
}

/** What is wrong with a value's quotes, or null. */
function unclosedQuote(raw) {
  const s = raw.trim();
  const q = s[0];
  if (q !== '"' && q !== "'") return null;
  const end = s.indexOf(q, 1);
  if (end < 0) return `the ${q === '"' ? 'double' : 'single'} quote is not closed`;
  if (!/^\s*(#.*)?$/.test(s.slice(end + 1))) return `text after the closing quote: \`${s.slice(end + 1).trim()}\``;
  return null;
}

/** The frontmatter's data, read the same way as `parseFrontmatter`; its problems are dropped. */
export const frontmatter = (text) => parseFrontmatter(text).data;

/** The text after the frontmatter. */
export const body = (text) => (text || '').replace(/^---\n[\s\S]*?\n---\n?/, '');
