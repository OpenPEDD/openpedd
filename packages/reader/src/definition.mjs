// readDefinition · writeDefinition: a change's `changes/<CHG>/definition.md` (ARCH-18, the file).
//
//   ---
//   status: agreed              # draft · confirmed · agreed
//   agreed:
//     by: Ana
//     at: "2026-11-20T10:00"
//   prds:
//     - spec/modules/billing/prd.md
//   ---
//
//   ## Items
//
//   | Item | State | Client's words |
//   |---|---|---|
//   | Main flow | answered | "They pay, then they get the receipt" |
//
//   ## Summary
//
//   What the client confirmed, what was assumed and what was deferred.
import { body as bodyOf, frontmatter, section } from './markdown.mjs';

export const DEFINITION_STATUSES = ['draft', 'confirmed', 'agreed'];
export const ITEM_STATES = ['answered', 'assumed', 'deferred', 'missing'];
const KNOWN = ['status', 'agreed', 'prds'];

/** A table row split on its unescaped pipes, with `\|` read back as `|`. */
const cells = (line) => line.trim().replace(/^\|/, '').replace(/(?<!\\)\|$/, '').split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
const escape = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

/** The items table: its position in the body and its rows. */
function itemsTable(text) {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith('|') || !/^\|[\s:|-]+\|$/.test((lines[i + 1] || '').trim())) continue;
    const header = cells(lines[i]).map((h) => h.toLowerCase());
    const item = header.findIndex((h) => h === 'item'), state = header.findIndex((h) => h === 'state');
    if (item < 0 || state < 0) continue;
    const words = header.findIndex((h) => /words/.test(h));
    let j = i + 2;
    const rows = [];
    for (; j < lines.length && lines[j].startsWith('|'); j++) {
      const r = cells(lines[j]);
      rows.push({ item: r[item] ?? '', state: r[state] ?? '', words: words >= 0 ? r[words] ?? '' : '' });
    }
    return { start: i, end: j, rows };
  }
  return null;
}

/** A change's definition, from the text of its `definition.md`. */
export function readDefinition(text) {
  const fm = frontmatter(text);
  const body = bodyOf(text);
  const agreed = fm.agreed && typeof fm.agreed === 'object' && !Array.isArray(fm.agreed) ? { by: fm.agreed.by ?? null, at: fm.agreed.at ?? null } : null;
  const prds = Array.isArray(fm.prds) ? fm.prds : fm.prds ? [fm.prds] : [];
  const extra = Object.fromEntries(Object.entries(fm).filter(([k]) => !KNOWN.includes(k)));
  return {
    status: fm.status || null,
    agreed,
    prds,
    frontmatter: extra,
    items: itemsTable(body)?.rows ?? [],
    summary: section(body, 'Summary') ?? '',
    body,
  };
}

const yaml = (v) => {
  const s = String(v ?? '');
  return s === '' || /^[\d.]+$/.test(s) || /[:#[\]{}"',]|^\s|\s$|^[-?!&*|>%@`]/.test(s) ? JSON.stringify(s) : s;
};

const renderItems = (items) => [
  "| Item | State | Client's words |",
  '|---|---|---|',
  ...items.map((r) => `| ${escape(r.item)} | ${escape(r.state)} | ${escape(r.words)} |`),
].join('\n');

/**
 * The text of a `definition.md`. With `def.body` (as `readDefinition` gives it), the body is kept and
 * only its items table and its Summary are replaced; without it, a body is written from the items.
 */
export function writeDefinition(def) {
  if (def.status && !DEFINITION_STATUSES.includes(def.status)) throw new Error(`definition status "${def.status}" is not one of ${DEFINITION_STATUSES.join(', ')}`);
  for (const r of def.items || []) if (r.state && !ITEM_STATES.includes(r.state)) throw new Error(`item "${r.item}": state "${r.state}" is not one of ${ITEM_STATES.join(', ')}`);
  const fm = [];
  for (const [k, v] of Object.entries(def.frontmatter || {})) fm.push(`${k}: ${yaml(v)}`);
  if (def.status) fm.push(`status: ${def.status}`);
  if (def.agreed && (def.agreed.by || def.agreed.at)) {
    fm.push('agreed:');
    if (def.agreed.by) fm.push(`  by: ${yaml(def.agreed.by)}`);
    if (def.agreed.at) fm.push(`  at: ${yaml(def.agreed.at)}`);
  }
  if (def.prds?.length) fm.push('prds:', ...def.prds.map((p) => `  - ${yaml(p)}`));

  const items = def.items || [];
  const summary = (def.summary || '').trim();
  let body;
  if (def.body !== undefined) {
    const lines = def.body.split('\n');
    const t = itemsTable(def.body);
    if (t) lines.splice(t.start, t.end - t.start, renderItems(items));
    body = lines.join('\n');
    if (section(body, 'Summary') !== null) {
      const b = body.split('\n');
      const at = b.findIndex((l) => /^##\s+Summary\s*$/.test(l));
      let end = at + 1;
      while (end < b.length && !/^#{1,2}\s/.test(b[end])) end++;
      b.splice(at + 1, end - at - 1, '', ...(summary ? [summary, ''] : []));
      body = b.join('\n');
    }
  } else {
    body = `\n## Items\n\n${renderItems(items)}\n\n## Summary\n${summary ? `\n${summary}\n` : ''}`;
  }
  return `---\n${fm.join('\n')}\n---\n${body}`;
}
