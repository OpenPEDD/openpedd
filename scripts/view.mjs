// Builds a local, self-contained map of the framework from the spec: the cycle, the concepts and
// the architecture, plus the gaps the spec shows about itself. Nothing in it is written by hand:
// every label comes from a table or heading of the spec.
//
//   node scripts/view.mjs          → .pedd/view/index.html
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, normalize, sep } from 'node:path';
import { ROOT, green, read, specFiles } from './lib.mjs';

// ---------- Markdown helpers ----------

/** The body of a `## heading` (any level), up to the next heading of the same or higher level. */
function section(text, heading) {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => /^#+\s/.test(l) && l.replace(/^#+\s+/, '').replace(/\s*\[#[^\]]+\]\s*$/, '').trim() === heading);
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

const splitRow = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

/** Every table in a piece of Markdown, as { header, rows } with rows as arrays of cells. */
function tables(md) {
  const out = [];
  const lines = (md || '').replace(/```[\s\S]*?```/g, '').split('\n');
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

const tableWith = (md, ...cols) => tables(md).find((t) => cols.every((c) => t.header.some((h) => h.includes(c))));
const prose = (md) => (md || '').split('\n').filter((l) => !l.startsWith('|')).join('\n').trim();
const code = (s) => [...(s || '').matchAll(/`([^`]+)`/g)].map((m) => m[1]);
const frontmatter = (text) => {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const fm = {};
  if (m) for (const l of m[1].split('\n')) {
    const kv = l.match(/^(\w+):\s*"?(.*?)"?\s*(#.*)?$/);
    if (kv) fm[kv[1]] = kv[2];
  }
  return fm;
};

// ---------- The cycle ----------

const cycle = read('spec/modules/cycle/prd.md');
const stageTable = tableWith(cycle, 'Stage', 'Mode', 'Does');
const stages = stageTable.rows.map(([n, name, mode, does]) => {
  const id = code(name)[0];
  const path = `spec/modules/${id}/prd.md`;
  const text = existsSync(join(ROOT, path)) ? read(path) : '';
  const judge = section(text, 'Judge');
  const skills = tableWith(section(text, 'Skills, agents and tools'), 'Kind', 'Name');
  return {
    id, n: Number(n), mode, does, path,
    what: prose(section(text, 'What it is')),
    inputs: tableWith(section(text, 'Inputs'), 'What')?.rows || [],
    outputs: tableWith(section(text, 'Outputs'), 'What')?.rows || [],
    judges: tableWith(judge, 'Agent')?.rows || [],
    judgeText: prose(judge),
    tools: skills?.rows || [],
    perTrack: section(text, 'Per track') === null ? null : tableWith(section(text, 'Per track'), 'Track')?.rows || [],
  };
});
const stageIds = new Set(stages.map((s) => s.id));

// Which stage feeds which: every input whose "From" names another stage.
const flows = [];
for (const s of stages) for (const [what, from] of s.inputs) {
  for (const src of code(from).filter((c) => stageIds.has(c) && c !== s.id)) flows.push({ from: src, to: s.id, what });
}

// ---------- Tracks ----------

const tracksText = read('spec/modules/tracks/prd.md');
const tt = tableWith(tracksText, 'If the change touches');
const trackCols = tt.header.slice(1).map((h) => code(h).join(' → '));
const changes = tt.rows.map(([touches, ...cells]) => ({
  touches,
  track: code(touches.match(/\(`[^)]*`\)/)?.[0] || '')[0] || null,
  cells: Object.fromEntries(trackCols.map((c, i) => [c, cells[i]])),
}));

// ---------- Review lenses ----------

const lensText = read('spec/foundations/architecture/review-lenses.md');
const lenses = tableWith(lensText, 'Lens', 'Reads', 'Off when').rows;
const lensItems = tableWith(lensText, 'Lens', 'Item').rows;

// ---------- Documents and their links ----------

const layerOf = (p) => {
  const parts = p.split('/');
  if (parts[1] === 'foundations') return parts.length > 3 ? parts[2] : 'foundations';
  return parts[1]?.endsWith('.md') ? 'spec' : parts[1];
};
const docs = specFiles().filter((p) => p.startsWith('spec/') && !p.startsWith('spec/history') && !p.startsWith('spec/changes/archive')).map((p) => {
  const text = read(p);
  const fm = frontmatter(text);
  const body = text.replace(/```[\s\S]*?```/g, '');
  const links = new Map();
  for (const [, target] of body.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^(https?:|mailto:)/.test(target)) continue;
    const file = target.split('#')[0];
    if (!file.endsWith('.md')) continue;
    const to = normalize(join(dirname(p), file)).split(sep).join('/');
    if (to !== p) links.set(to, (links.get(to) || 0) + 1);
  }
  const ids = new Set();
  const own = (fm.description || '').match(/^([A-Z]+-\d+)\s·/) || (fm.title || '').match(/^([A-Z]+-\d+)\s·/);
  if (own) ids.add(own[1]);
  for (const [, id] of body.matchAll(/^#+\s+([A-Z]+(?:-[A-Z]+)?-\d+)\s·/gm)) ids.add(id);
  return {
    path: p, layer: layerOf(p), title: (fm.title || p).replace(/^[A-Z]+-\d+\s·\s/, ''),
    description: (fm.description || '').replace(/^[A-Z]+-\d+\s·\s/, ''), status: fm.status || null,
    version: fm.version || null, updated: fm.updated || null, ids: [...ids],
    links: [...links].map(([to, n]) => ({ to, n })),
  };
});
const docPaths = new Set(docs.map((d) => d.path));
for (const d of docs) d.links = d.links.filter((l) => docPaths.has(l.to));
const incoming = new Map(docs.map((d) => [d.path, 0]));
for (const d of docs) for (const l of d.links) incoming.set(l.to, incoming.get(l.to) + 1);
for (const d of docs) d.incoming = incoming.get(d.path);

// ---------- Architecture ----------

const overview = read('spec/foundations/architecture/overview.md');
const pieces = tableWith(overview, 'Piece', 'Does').rows.map(([piece, does, detail]) => ({ piece, does, detail }));
const diagram = overview.match(/```\n([\s\S]*?)```/)?.[1] || '';
const cloudLines = [];
let inCloud = false;
for (const l of diagram.split('\n')) {
  if (l.includes('OpenPEDD Cloud')) { inCloud = true; continue; }
  if (inCloud && l.includes('└')) break;
  if (inCloud) cloudLines.push(l.replace(/[│┌┐└┘─]/g, '').trim());
}
const cloud = cloudLines.join(' · ').split('·').map((s) => s.trim()).filter(Boolean);
const openLayers = [...diagram.matchAll(/│\s*(\d+)\.\s+(\w[\w ]*?)\s{2,}(.+?)\s*│/g)].map(([, n, name, items]) => ({ n: Number(n), name: name.trim(), items: items.trim() }));
const archDocs = docs.filter((d) => d.layer === 'architecture' && d.ids.length);
const external = (diagram.match(/spec repo.*$/m)?.[0] || '').split(/\s{2,}/).map((s) => s.trim()).filter(Boolean);

// ---------- Capabilities: the published skill and judge lists ----------

const caps = read('spec/capabilities.md');
const capSkills = tableWith(section(caps, 'Skills'), 'Stage', 'Skills')?.rows || [];
const capJudges = tableWith(section(caps, 'Judges'), 'Stage', 'Judge')?.rows || [];

// ---------- Gaps: what the spec says about itself that does not add up ----------

const gaps = [];
const trackStages = new Set(trackCols.flatMap((c) => c.split(' → ')));
// "plan → verify" covers plan, build and verify.
if (trackCols.some((c) => c === 'plan → verify')) ['plan', 'build', 'verify'].forEach((s) => trackStages.add(s));
for (const s of stages) {
  if (!trackStages.has(s.id)) gaps.push({ kind: 'Tracks', where: s.path, text: `The table of which stages each change runs has no column for \`${s.id}\`` + (s.perTrack ? ', though its PRD has a "Per track" section' : ', and its PRD has no "Per track" section') });
  else if (!s.perTrack) gaps.push({ kind: 'Tracks', where: s.path, text: `\`${s.id}\` has no "Per track" section` });
  if (!s.inputs.length) gaps.push({ kind: 'Stage', where: s.path, text: `\`${s.id}\` has no Inputs table` });
  if (!s.outputs.length) gaps.push({ kind: 'Stage', where: s.path, text: `\`${s.id}\` has no Outputs table` });
}
const prdSkills = new Map(stages.map((s) => [s.id, new Set(s.tools.filter((r) => r[0] === 'Skill').flatMap((r) => code(r[1]).map((c) => c.split(' ')[0])))]));
for (const [stage, list] of capSkills) {
  for (const st of code(stage)) {
    if (!prdSkills.has(st)) continue;
    const listed = new Set(code(list));
    for (const sk of listed) if (!prdSkills.get(st).has(sk)) gaps.push({ kind: 'Skills', where: 'spec/capabilities.md', text: `\`${sk}\` is listed for \`${st}\` in capabilities, but not in the skills table of its PRD` });
    for (const sk of prdSkills.get(st)) if (!listed.has(sk) && sk !== '/sweep') gaps.push({ kind: 'Skills', where: `spec/modules/${st}/prd.md`, text: `\`${sk}\` is in the PRD of \`${st}\`, but not in capabilities` });
  }
}
for (const [stage, list] of capJudges) {
  for (const st of code(stage)) {
    const s = stages.find((x) => x.id === st);
    if (!s) continue;
    const prdJudges = new Set([...s.judges.flatMap((r) => code(r[0])), ...code(s.judgeText)]);
    for (const j of code(list)) if (!prdJudges.has(j)) gaps.push({ kind: 'Judges', where: s.path, text: `\`${j}\` is listed for \`${st}\` in capabilities, but its PRD does not name it in "Judge"` });
  }
}
for (const d of docs) if (d.incoming === 0 && !/README|index|capabilities/.test(d.path)) gaps.push({ kind: 'Links', where: d.path, text: `"${d.title}" is linked from no other document` });

// ---------- Write ----------

const data = {
  built: new Date().toISOString().slice(0, 10),
  stages, flows, trackCols, changes, lenses, lensItems, docs, pieces, openLayers, cloud, external, archDocs, gaps,
};
const template = readFileSync(join(ROOT, 'scripts/view.html'), 'utf8');
const out = join(ROOT, '.pedd/view/index.html');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, template.replace('/*__DATA__*/null', JSON.stringify(data).replace(/</g, '\\u003c')));
console.log(green(`✓ ${stages.length} stages, ${docs.length} documents, ${gaps.length} gaps → .pedd/view/index.html`));
