// mapData · renderMap: the framework map, from the model (ARCH-20). Nothing in it is written by hand:
// every label comes from a table or heading of the spec. It reads only the model's files.
import { readFileSync } from 'node:fs';
import { dirname, join, normalize, sep } from 'node:path/posix';
import { body, code, frontmatter, headings, prose, section, tableWith, tables } from './markdown.mjs';

// The map's labels are strings: a list or a block in a frontmatter is shown as its text.
const flat = (fm) => Object.fromEntries(Object.entries(fm).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]));

// The layers whose documents a skill follows, shown whole in its card.
const FOLLOWED = new Set(['rules', 'architecture', 'domain']);

/** The spec documents a piece of Markdown links to, as paths from the repository root, in order of first link. */
function linksIn(md, from) {
  const out = [];
  for (const [, target] of (md || '').replace(/```[\s\S]*?```/g, '').matchAll(/\]\(([^)\s]+)\)/g)) {
    const file = target.split('#')[0];
    if (/^(https?:|mailto:)/.test(target) || !file.endsWith('.md')) continue;
    const to = normalize(join(dirname(from), file)).split(sep).join('/');
    if (to !== from && !out.includes(to)) out.push(to);
  }
  return out;
}

/**
 * A document cut at its headings: each part with its heading, its prose, its tables and its
 * diagrams (fenced blocks), in order, so a page can show it whole.
 */
export function blocksOf(text) {
  const md = body(text);
  const lines = md.split('\n');
  const hs = headings(md);
  const cuts = [{ level: 0, heading: '', anchor: '', line: 0 }, ...hs.map((h) => ({ level: h.level, heading: h.text, anchor: h.anchor, line: h.line }))];
  return cuts.map((c, i) => {
    const part = lines.slice(c.line, i + 1 < cuts.length ? cuts[i + 1].line - 1 : lines.length).join('\n');
    const diagrams = [...part.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map((m) => m[1].replace(/\n$/, ''));
    const text = prose(part.replace(/```[\s\S]*?```/g, '')).replace(/\n{3,}/g, '\n\n');
    return { level: c.level, heading: c.heading, anchor: c.anchor, text, tables: tables(part), diagrams };
  }).filter((b) => b.heading || b.text || b.tables.length || b.diagrams.length);
}

/**
 * The map's data, as `npm run view` writes it to `.pedd/view/map.json`.
 *
 * @param model  what `readSpec` gives, for the framework's own repository.
 * @param opts.built  the build date, `YYYY-MM-DD`; today by default.
 */
export function mapData(model, { built = new Date().toISOString().slice(0, 10) } = {}) {
  const byPath = new Map(model.documents.map((d) => [d.path, d.text]));
  const all = new Set(model.paths);
  const has = (p) => all.has(p);
  const read = (p) => {
    if (!byPath.has(p)) throw new Error(`the map needs ${p}, which is not among the files given`);
    return byPath.get(p);
  };

  // ---------- The cycle ----------

  const cycle = read('spec/modules/cycle/prd.md');
  const stageTable = tableWith(cycle, 'Stage', 'Mode', 'Does');
  const stages = stageTable.rows.map(([n, name, mode, does]) => {
    const id = code(name)[0];
    const path = `spec/modules/${id}/prd.md`;
    const text = has(path) ? read(path) : '';
    const judge = section(text, 'Judge');
    const skills = tableWith(section(text, 'Skills, agents and tools'), 'Kind', 'Name');
    return {
      id, n: Number(n), mode, does, path,
      // The PRD's header line: **Gate:** `spec-approval` (or none).
      gate: text.match(/\*\*Gate:\*\* `([\w-]+)`/)?.[1] ?? null,
      what: prose(section(text, 'What it is')),
      // The procedure's top-level steps, as written: "1. **Reads the pack**, …".
      steps: (section(text, 'Procedure') || '').split('\n').map((l) => l.match(/^\d+\.\s+(.*)$/)?.[1]).filter(Boolean),
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
  const docs = model.paths.filter((p) => p.endsWith('.md') && p.startsWith('spec/') && !p.startsWith('spec/history') && !p.startsWith('spec/changes/archive')).map((p) => {
    const text = read(p);
    const fm = flat(frontmatter(text));
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
    const layer = layerOf(p);
    return {
      path: p, layer, title: (fm.title || p).replace(/^[A-Z]+-\d+\s·\s/, ''),
      description: (fm.description || '').replace(/^[A-Z]+-\d+\s·\s/, ''), status: fm.status || null,
      version: fm.version || null, updated: fm.updated || null, ids: [...ids],
      links: [...links].map(([to, n]) => ({ to, n })),
      // The documents a skill follows are shown whole, with their tables and diagrams.
      ...(FOLLOWED.has(layer) ? { blocks: blocksOf(text) } : {}),
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
  // The arrows from the Cloud to each external system, labeled on the line above the system names.
  const viaLine = diagram.split('\n').find((l) => /│\s*webhooks/.test(l)) || '';
  const via = viaLine.split('│').slice(1).map((s) => s.trim());
  const connections = external.map((name, i) => ({ name, via: via[i] || '' }));
  // Each piece of the overview, with the documents its "Detail" column points to.
  for (const p of pieces) p.docs = [...p.detail.matchAll(/\]\(([^)#\s]+)/g)].map(([, t]) => normalize(join('spec/foundations/architecture', t)).split(sep).join('/')).filter((t) => docPaths.has(t));

  // The reading order of the spec's layers, from its README.
  const readingOrder = tableWith(read('spec/README.md'), 'Where', 'What it holds').rows.map(([, where]) => {
    const p = code(where)[0] || '';
    return p === 'foundations/glossary.md' ? 'foundations' : p.replace(/\/$/, '').split('/').pop();
  });

  // ---------- Capabilities: the published skill and judge lists ----------

  const caps = read('spec/capabilities.md');
  const capSkills = tableWith(section(caps, 'Skills'), 'Stage', 'Skills')?.rows || [];
  const capJudges = tableWith(section(caps, 'Judges'), 'Stage', 'Judge')?.rows || [];

  // ---------- Artifacts: what each stage makes, reads and checks ----------

  const catalog = read('spec/foundations/artifacts.md');
  const artifacts = [];
  for (const [group, t] of [['The spec', 'The spec: what governs'], ['Not decided yet', 'What does not govern yet'], ['Records', 'Records: what happened'], ['Derived', 'Derived artifacts: produced from the spec']].map(([g, h]) => [g, tables(section(catalog, h))[0]])) {
    if (!t) continue;
    const col = (row, name) => row[t.header.findIndex((h) => h.startsWith(name))] ?? '';
    for (const row of t.rows) {
      {
        const name = col(row, 'Artifact');
        artifacts.push({
          group, name,
          defines: col(row, 'Defines') || col(row, 'Records'),
          comesFrom: col(row, 'Comes from'), lives: col(row, 'Lives in'),
          ids: code(col(row, 'ID')).map((c) => c.replace(/-.*$/, '')),
          madeBy: code(col(row, 'Written by') || col(row, 'Produced by')).filter((c) => stageIds.has(c)),
          madeByText: col(row, 'Written by') || col(row, 'Produced by'),
        });
      }
    }
  }
  // Terms the spec names in backticks with more than one word (`Test Data`): a shorter name inside one is not a mention.
  const namedTerms = new Set();
  for (const st of stages) for (const t of [...st.inputs, ...st.outputs, ...st.judges].flat()) for (const m of t.matchAll(/`([A-Z][\w-]*(?: [A-Z][\w-]*)+)`/g)) namedTerms.add(m[1]);
  // How an artifact is named in a stage's text: its name, its ID codes, and the initials of a two-word name (Pull request → PR).
  // A name of three words or more is also found without its last word (Help Center article → Help Center).
  const aliases = (a) => {
    const out = [...a.ids];
    for (const base of a.name.replace(/\s*\(.*\)$/, '').split(' · ')) {
      out.push(base);
      const words = base.split(/\s+/);
      if (words.length === 2) out.push(words.map((w) => w[0].toUpperCase()).join(''));
      if (words.length >= 3) out.push(words.slice(0, -1).join(' '));
    }
    return out;
  };
  // Another named term in backticks (`Test Data`) is not a mention of a shorter name inside it (Test).
  const mentions = (text, a) => aliases(a).some((al) => {
    if (/^[A-Z]{2,}$/.test(al)) return new RegExp(`(^|[^A-Za-z])${al}s?([^A-Za-z]|$)`).test(text);
    const low = al.toLowerCase();
    for (const term of namedTerms) if (term.toLowerCase().includes(low) && term.toLowerCase() !== low) text = text.replace(new RegExp(term, 'gi'), ' ');
    const clean = text.split('`').map((part, i) => (i % 2 && /\s/.test(part) && part.toLowerCase().includes(low) && part.toLowerCase() !== low ? '' : part)).join(' ');
    return new RegExp(`\\b${al.replace(/s$/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}s?\\b`, 'i').test(clean);
  });
  for (const a of artifacts) {
    a.made = {}; a.read = {}; a.checked = {};
    for (const s of stages) {
      const outs = s.outputs.filter((r) => mentions(r[0], a)).map((r) => r[0]);
      if (outs.length) a.made[s.id] = outs;
      const ins = s.inputs.filter((r) => mentions(r[0], a)).map((r) => `${r[0]} — from ${r[1]}`);
      if (ins.length) a.read[s.id] = ins;
      const checks = [...s.judges.filter((r) => mentions(r[1] + ' ' + (r[2] || ''), a)).map((r) => `${r[0]}: ${r[1]}`), ...(s.judgeText && mentions(s.judgeText, a) ? [s.judgeText] : [])];
      if (checks.length) a.checked[s.id] = checks;
    }
  }

  // ---------- Skills and judges: one row each ----------

  const agentsDoc = read('spec/foundations/architecture/agents.md');
  const judgeInput = (tableWith(section(agentsDoc, 'How judges run'), 'Form', 'How')?.rows.find((r) => /subagent/i.test(r[0])) || [])[1] || '';
  const promptPath = (kind, name) => (kind === 'Skill' ? `skills/${name.replace(/^\//, '').split(' ')[0]}/SKILL.md` : `agents/${name}.md`);
  const skills = [];
  for (const s of stages) for (const [kind, names, purpose, reads = '', leaves = ''] of s.tools) {
    if (kind !== 'Skill' && kind !== 'Agent') continue;
    for (const name of code(names)) {
      const judge = s.judges.find((r) => code(r[0]).includes(name));
      const path = promptPath(kind, name);
      // The rules and mechanisms it follows: those its own row links first, then those its stage's PRD links.
      const follows = [...new Set([...linksIn([purpose, reads, leaves].join(' '), s.path), ...linksIn(has(s.path) ? read(s.path) : '', s.path)])]
        .filter((t) => docPaths.has(t) && FOLLOWED.has(layerOf(t)));
      skills.push({
        name, kind: kind === 'Skill' ? 'skill' : 'judge', stage: s.id, purpose,
        reads: reads === '—' ? '' : reads, leaves: leaves === '—' ? '' : leaves,
        checks: judge?.[1] || (kind === 'Agent' ? s.judgeText.replace(/^`[^`]+`:\s*/, '').split(/\s*Passes when/)[0] : ''),
        passes: judge?.[2] || (kind === 'Agent' ? (s.judgeText.match(/Passes when ([^.]+)/) || [])[1] || '' : ''),
        checkedBy: kind === 'Skill' ? [...s.judges.flatMap((r) => code(r[0])), ...code(s.judgeText).filter((c) => c.endsWith('-judge'))] : [],
        checkedByText: kind === 'Skill' && !s.judges.length && !code(s.judgeText).some((c) => c.endsWith('-judge')) ? s.judgeText : '',
        prompt: has(path) ? path : null, promptPath: path, follows,
      });
    }
  }

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
  for (const s of stages) {
    const missing = artifacts.filter((a) => a.madeBy.includes(s.id) && !a.made[s.id]).map((a) => `"${a.name}"`);
    if (missing.length) gaps.push({ kind: 'Artifacts', where: s.path, text: `The artifact catalog says \`${s.id}\` writes ${missing.join(', ')}, but its Outputs table does not name ${missing.length > 1 ? 'them' : 'it'}` });
  }
  for (const a of artifacts.filter((x) => x.group === 'Derived')) if (!Object.keys(a.read).length && !Object.keys(a.checked).length) gaps.push({ kind: 'Artifacts', where: 'spec/foundations/artifacts.md', text: `No stage declares "${a.name}" as an input or names it in a judge's checks` });
  {
    const sk = skills.filter((x) => x.kind === 'skill'), jd = skills.filter((x) => x.kind === 'judge');
    for (const x of sk.filter((y) => !y.reads || !y.leaves)) gaps.push({ kind: 'Skills', where: `spec/modules/${x.stage}/prd.md`, text: `\`${x.name}\` does not say what it ${!x.reads ? 'reads' : 'leaves'}` });
    const noPrompt = skills.filter((x) => !x.prompt);
    if (noPrompt.length) gaps.push({ kind: 'Prompts', where: '.claude/', text: `${noPrompt.length} of ${skills.length} skills and judges have no prompt file yet (${sk.filter((x) => !x.prompt).length} skills, ${jd.filter((x) => !x.prompt).length} judges)` });
  }
  for (const d of docs) if (d.incoming === 0 && !/README|index|capabilities/.test(d.path)) gaps.push({ kind: 'Links', where: d.path, text: `"${d.title}" is linked from no other document` });

  return {
    built,
    stages, flows, trackCols, changes, lenses, lensItems, docs, pieces, openLayers, cloud, external, connections, readingOrder, archDocs, artifacts, skills, judgeInput, gaps,
  };
}

let template;
/** The map's HTML: one self-contained page with its data inlined. */
export function renderMap(model, opts = {}) {
  const data = opts.data || mapData(model, opts);
  template ??= readFileSync(new URL('./view.html', import.meta.url), 'utf8');
  return template.replace('/*__DATA__*/null', JSON.stringify(data).replace(/</g, '\\u003c'));
}
