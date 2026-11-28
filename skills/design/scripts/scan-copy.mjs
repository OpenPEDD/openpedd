#!/usr/bin/env node
// Reads the base locale's messages (English, DEC-21) for interface copy that leaves a person guessing:
// generic actions ("OK", "Submit", "Click here"), errors that say nothing or blame, a number before a
// plural with no plural rule, strings built by concatenation, mixed capitalization, mixed ellipses,
// and names the Glossary no longer uses. Missing, unused or malformed keys are plan's check, not this.
// It measures; it decides nothing: each hit is a candidate the agent reads in context. Zero
// dependencies, Node 18+.
//
//   node scan-copy.mjs <messages.json | dir> [--glossary <spec>/foundations/glossary.md] [--json]
//
// A directory is read for its `en.json`, `en/*.json` or `*.en.json`. Keys are flattened with dots.
// Source: OpenPEDD design skill, references/copy.md, RULE-33 v1.0, MKT-22 v1.0.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const target = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--glossary');
if (!target) { console.error('usage: node scan-copy.mjs <messages.json | dir> [--glossary <path>] [--json]'); process.exit(2); }

const files = [];
if (statSync(target).isDirectory()) {
  (function walk(dir) {
    for (const name of readdirSync(dir).sort()) {
      if (name === 'node_modules' || name.startsWith('.')) continue;
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (/(^|[./])en\.json$/.test(name) || (basename(dir) === 'en' && name.endsWith('.json'))) files.push(full);
    }
  })(target);
} else files.push(target);
if (!files.length) { console.error(`not run: no English messages (en.json, en/*.json, *.en.json) under ${target}`); process.exit(3); }

const messages = [];
const flatten = (obj, prefix, file) => {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') flatten(v, key, file);
    else if (typeof v === 'string') messages.push({ key, text: v, file });
  }
};
for (const f of files) flatten(JSON.parse(readFileSync(f, 'utf8')), '', f);

// Old names from the Glossary's "Names no longer used" table: | Old name | Now |
const oldNames = [];
const glossary = opt('glossary');
if (glossary && existsSync(glossary)) {
  const text = readFileSync(glossary, 'utf8');
  const section = text.split(/^## Names no longer used/m)[1] ?? '';
  for (const line of section.split('\n')) {
    const cells = line.split('|').map((c) => c.trim());
    if (cells.length < 4 || /^-+$/.test(cells[1]) || /^old name$/i.test(cells[1])) continue;
    for (const name of cells[1].replace(/`/g, '').split(/\s*·\s*|,\s*/)) if (name && name.length > 2) oldNames.push({ name, now: cells[2].replace(/`/g, '') });
  }
}

const words = (t) => t.replace(/\{[^}]*\}/g, ' ').trim().split(/\s+/).filter(Boolean);
const isAction = (key) => /(^|[._-])(button|btn|cta|action|submit|confirm|cancel|save|link)s?([._-]|$)/i.test(key);
const isError = (key, t) => /(^|[._-])(error|errors|fail|failed|failure|invalid)([._-]|$)/i.test(key) || /^(error|oops|uh[- ]oh)\b/i.test(t);
const GENERIC = /^(ok|okay|submit|yes|no|click here|here|learn more|read more|more|go|continue|confirm|done|send|proceed)[.!]?$/i;
const NEXT_STEP = /\b(try|check|enter|use|choose|select|contact|make sure|add|remove|sign in|log in|refresh|reload|wait|retry|ask|update|change|upload|open|go to|call|email)\b/i;
const VAGUE = /^(an? )?(unknown |unexpected )?(error|something went wrong|invalid( input| value| data)?|oops|this field is required|required)( occurred| has occurred| happened)?[.!]*$/i;
const JARGON = /\b(illegal|fatal|exception|null|undefined|NaN|stack|payload|request failed|status code|error code|HTTP|500|404|403|401|abort(ed)?|execute|invalid)\b/i;
const BLAME = /\b(you (failed|forgot|didn't|did not|must|entered an? (invalid|wrong))|your (mistake|fault))\b/i;
const titleCase = (t) => { const w = words(t).filter((x) => /^[A-Za-z]/.test(x)); return w.length >= 2 && w.filter((x) => x.length > 3).every((x) => /^[A-Z]/.test(x)); };
const sentenceCase = (t) => { const w = words(t).filter((x) => /^[A-Za-z]/.test(x)); return w.length >= 2 && /^[A-Z]/.test(w[0]) && w.slice(1).filter((x) => x.length > 3).some((x) => /^[a-z]/.test(x)); };

const hits = { generic: [], vagueError: [], noNextStep: [], jargon: [], blame: [], plural: [], concatenation: [], oldName: [], exclamation: [] };
const caps = { title: [], sentence: [] };
let dots = 0, ellipsis = 0;
for (const m of messages) {
  const t = m.text.trim(), item = { key: m.key, text: m.text };
  if (GENERIC.test(t) && (isAction(m.key) || /^(click here|here|learn more|read more)$/i.test(t))) hits.generic.push(item);
  if (/\b(click here|learn more|read more)\b/i.test(t) && !GENERIC.test(t)) hits.generic.push({ ...item, why: 'link text that says nothing alone' });
  if (isError(m.key, t)) {
    if (VAGUE.test(t)) hits.vagueError.push(item);
    else if (!NEXT_STEP.test(t)) hits.noNextStep.push(item);
    if (/!/.test(t)) hits.exclamation.push(item);
  }
  if (JARGON.test(t)) hits.jargon.push({ ...item, why: t.match(JARGON)[0] });
  if (BLAME.test(t)) hits.blame.push(item);
  if (/\{\s*\w+\s*\}\s+[a-z]+s\b/i.test(t) && !/plural|select|selectordinal/.test(t)) hits.plural.push(item);
  if (/\(s\)/.test(t)) hits.plural.push({ ...item, why: '(s)' });
  else if (/\b\d+\s+[a-z]+s\b/i.test(t) && !/plural/.test(t)) hits.plural.push({ ...item, why: 'a fixed number in the message' });
  if (/^\s|\s$/.test(m.text) || /(^|[._-])(prefix|suffix|part\d*|start|end)$/i.test(m.key)) hits.concatenation.push(item);
  for (const o of oldNames) if (new RegExp(`\\b${o.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(t)) hits.oldName.push({ ...item, why: `"${o.name}" is now "${o.now}"` });
  if (t.length <= 48 && !/[.?!:]$/.test(t)) { if (titleCase(t)) caps.title.push(item); else if (sentenceCase(t)) caps.sentence.push(item); }
  if (t.includes('...')) dots++;
  if (t.includes('…')) ellipsis++;
}
const minority = caps.title.length && caps.sentence.length ? (caps.title.length <= caps.sentence.length ? { style: 'Title Case', items: caps.title, other: caps.sentence.length } : { style: 'Sentence case', items: caps.sentence, other: caps.title.length }) : null;
const report = { files, messages: messages.length, hits, capitalization: { title: caps.title.length, sentence: caps.sentence.length, minority }, ellipsis: { threeDots: dots, character: ellipsis } };

if (args.includes('--json')) { console.log(JSON.stringify(report, null, 2)); process.exit(0); }
const LABEL = {
  generic: 'Actions and links that say nothing alone ("OK", "Submit", "Click here")', vagueError: 'Errors that say only that something failed',
  noNextStep: 'Errors with no next step for the person', jargon: 'System words a person does not use', blame: 'Copy that blames the person',
  plural: 'A number before a plural with no plural rule', concatenation: 'Strings built by joining pieces (spaces at the ends, prefix or suffix keys)',
  oldName: 'Names the Glossary no longer uses', exclamation: 'Exclamation marks in errors',
};
console.log(`# Copy scan\n\n${messages.length} English messages in ${files.length} file(s).${glossary ? '' : ' No --glossary: old names not checked.'}\n`);
console.log('| Kind | Total |\n|---|---|');
for (const [k, v] of Object.entries(hits)) console.log(`| ${LABEL[k]} | ${v.length} |`);
console.log(`| Labels in the minority capitalization | ${minority ? `${minority.items.length} in ${minority.style}, against ${minority.other}` : 0} |`);
console.log(`| Mixed ellipses ("..." and "…") | ${dots && ellipsis ? `${dots} and ${ellipsis}` : 0} |`);
for (const [k, v] of Object.entries(hits)) {
  if (!v.length) continue;
  console.log(`\n## ${LABEL[k]}\n`);
  for (const h of v.slice(0, 30)) console.log(`- \`${h.key}\`: "${h.text}"${h.why ? ` (${h.why})` : ''}`);
  if (v.length > 30) console.log(`- … ${v.length - 30} more (use --json)`);
}
if (minority) { console.log(`\n## Labels in ${minority.style}, the minority\n`); for (const h of minority.items.slice(0, 30)) console.log(`- \`${h.key}\`: "${h.text}"`); }
