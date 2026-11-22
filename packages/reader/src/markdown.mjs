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
  const s = v.replace(/\s+#.*$/, '').trim();
  const q = s.match(/^"(.*)"$/) || s.match(/^'(.*)'$/);
  if (q) return q[1];
  if (/^\[.*\]$/.test(s)) return s.slice(1, -1).split(',').map((x) => scalar(x)).filter((x) => x !== '');
  return s;
};

/**
 * The frontmatter between the first two `---` lines. A flat key gives a string with its quotes and
 * trailing comment dropped; an indented block gives an object (`key: value` lines) or a list (`- item`).
 */
export function frontmatter(text) {
  const m = (text || '').match(/^---\n([\s\S]*?)\n---/);
  const fm = {};
  if (!m) return fm;
  let key = null;
  for (const l of m[1].split('\n')) {
    const top = l.match(/^(\w+):\s*(.*)$/);
    if (top) {
      key = top[1];
      fm[key] = top[2].trim() === '' ? null : scalar(top[2]);
      continue;
    }
    if (!key || !/^\s+\S/.test(l)) continue;
    const item = l.match(/^\s+-\s+(.*)$/);
    const sub = l.match(/^\s+(\w+):\s*(.*)$/);
    if (item) fm[key] = [...(Array.isArray(fm[key]) ? fm[key] : []), scalar(item[1])];
    else if (sub) fm[key] = { ...(fm[key] && typeof fm[key] === 'object' && !Array.isArray(fm[key]) ? fm[key] : {}), [sub[1]]: scalar(sub[2]) };
  }
  for (const k of Object.keys(fm)) if (fm[k] === null) fm[k] = '';
  return fm;
}

/** The text after the frontmatter. */
export const body = (text) => (text || '').replace(/^---\n[\s\S]*?\n---\n?/, '');
