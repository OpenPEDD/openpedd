// A PRD as a document (FR-VEW-31): its sections in the template's order, each with what it holds and
// what it lacks, so a viewer can show it whole and say, section by section, what is still to write.
// What is missing comes as codes ({ code, id?, field? }): the viewer says them in the person's language.
import { tables } from '../markdown.mjs';

/** The template's sections, in order, and the headings that name each (`template/spec/modules/README.md`). */
export const PRD_SECTIONS = [
  ['frame', /^frame$/i],
  ['metric', /^(success )?metric$/i],
  ['appetite', /^appetite/i],
  ['flows', /^flows$/i],
  ['requirements', /^requirements$/i],
  ['permissions', /^permissions$/i],
  ['states', /^states$/i],
  ['contracts', /^contracts$/i],
  ['screens', /^screens/i],
  ['criteria', /^acceptance criteria$|^criteria$/i],
  ['testData', /^test data$/i],
  ['variations', /^variations$/i],
];

const strip = (s) => String(s ?? '').replace(/`/g, '').trim();
const blank = (s) => !strip(s) || /^[—-]$/.test(strip(s));
const ids = (s, re) => [...String(s ?? '').matchAll(re)].map((m) => m[0]);
const col = (header, re) => header.findIndex((h) => re.test(strip(h)));
const cell = (row, i) => (i >= 0 ? row[i] ?? '' : '');

/** The `## ` sections of a PRD's text, after its frontmatter: { title, line, body }. */
function sectionsOf(text) {
  const lines = String(text || '').split('\n');
  let start = 0;
  if (lines[0] === '---') start = lines.indexOf('---', 1) + 1;
  const out = [];
  let cur = null, fenced = false;
  for (let i = start; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith('```')) fenced = !fenced;
    const m = !fenced && l.match(/^##\s+(.*)$/);
    if (m) { cur = { title: strip(m[1]), line: i + 1, body: [] }; out.push(cur); continue; }
    if (cur) cur.body.push(l);
  }
  return out.map((s) => ({ ...s, body: s.body.join('\n').trim() }));
}

/** Each `### F<n> · <name>` with its steps, and the alternate and exception flows of the section. */
function flowsOf(body) {
  const flows = [];
  const parts = body.split(/^###\s+/m).slice(1);
  for (const part of parts) {
    const head = part.split('\n')[0].replace(/`/g, '').trim();
    const m = head.match(/^(F\d+)\s+·\s+(.*)$/);
    if (!m) continue;
    const t = tables(part).find((x) => col(x.header, /^step$/i) >= 0);
    const steps = t ? t.rows.map((r) => ({ n: strip(cell(r, col(t.header, /^step$/i))), role: strip(cell(r, col(t.header, /^role$/i))), does: cell(r, col(t.header, /^does$/i)).trim() })) : [];
    flows.push({ id: m[1], name: m[2], steps });
  }
  const alt = tables(body).find((x) => col(x.header, /^flow$/i) >= 0 && col(x.header, /^from$/i) >= 0);
  const alternates = alt ? alt.rows.map((r) => {
    const name = strip(cell(r, col(alt.header, /^flow$/i)));
    return { kind: /^exception/i.test(name) ? 'exception' : 'alternate', name: name.replace(/^(alternate|exception)\s*·\s*/i, ''), from: strip(cell(r, col(alt.header, /^from$/i))), changes: cell(r, col(alt.header, /what changes/i)).trim(), ends: cell(r, col(alt.header, /ends in/i)).trim() };
  }) : [];
  return { flows, alternates };
}

/** The `FR` and `NFR` of the requirements table, as written. */
function requirementsOf(body) {
  const t = tables(body).find((x) => /^id$/i.test(strip(x.header[0])) && col(x.header, /^requirement$/i) >= 0);
  if (!t) return [];
  return t.rows.filter((r) => /^N?FR-/.test(strip(r[0]))).map((r) => ({
    id: strip(r[0]),
    kind: strip(r[0]).startsWith('NFR-') ? 'nfr' : 'fr',
    statement: cell(r, col(t.header, /^requirement$/i)).trim(),
    reason: cell(r, col(t.header, /^reason$/i)).trim(),
    roles: strip(cell(r, col(t.header, /^roles?$/i))).split(/\s*·\s*/).filter((x) => x && !blank(x)),
    criteria: ids(cell(r, col(t.header, /^criteria$/i)), /N?FR-[A-Z]+-\d+\.AC\d+/g),
    flows: ids(cell(r, col(t.header, /^flows?$/i)), /\bF\d+\b/g),
    status: strip(cell(r, col(t.header, /^status$/i))) || null,
  }));
}

/** The Given / When / Then of each criterion. */
function criteriaOf(body) {
  const t = tables(body).find((x) => col(x.header, /^given$/i) >= 0);
  if (!t) return [];
  return t.rows.map((r) => ({ id: strip(r[0]), given: cell(r, col(t.header, /^given$/i)).trim(), when: cell(r, col(t.header, /^when$/i)).trim(), then: cell(r, col(t.header, /^then$/i)).trim() }));
}

/** The success metric's row, by its columns. */
function metricOf(body) {
  const t = tables(body)[0];
  if (!t || !t.rows.length) return null;
  const r = t.rows[0];
  const at = (re) => cell(r, col(t.header, re)).trim();
  return { metric: at(/^metric$/i), baseline: at(/^baseline$/i), target: at(/^target$/i), reviewDate: at(/review date/i), measuredBy: at(/measured by/i) };
}

/**
 * A PRD's sections, in the template's order. Each: { key, title, line, markdown, missing, … }; a section
 * the PRD does not have comes with `title: null` and `missing: [{ code: 'absent' }]`. Flows, requirements,
 * criteria and the metric also come parsed, joined where the document links them.
 */
export function prdDocument(text) {
  const found = sectionsOf(text);
  const used = new Set();
  const out = [];
  for (const [key, re] of PRD_SECTIONS) {
    const s = found.find((x) => !used.has(x) && re.test(x.title));
    if (s) used.add(s);
    out.push(s ? { key, title: s.title, line: s.line, markdown: s.body, missing: s.body ? [] : [{ code: 'empty' }] } : { key, title: null, line: null, markdown: '', missing: [{ code: 'absent' }] });
  }
  const get = (k) => out.find((x) => x.key === k);

  const metric = get('metric');
  if (metric.markdown) {
    metric.metric = metricOf(metric.markdown);
    if (!metric.metric) metric.missing.push({ code: 'no-metric-row' });
    else for (const f of ['baseline', 'target', 'reviewDate', 'measuredBy']) if (blank(metric.metric[f])) metric.missing.push({ code: 'metric-field', field: f });
  }

  const appetite = get('appetite');
  if (appetite.markdown && !tables(appetite.markdown).length) appetite.missing.push({ code: 'no-out-of-scope' });

  const flows = get('flows');
  Object.assign(flows, flowsOf(flows.markdown));
  if (flows.markdown && !flows.flows.length) flows.missing.push({ code: 'no-flows' });
  for (const f of flows.flows) {
    if (!f.steps.length) flows.missing.push({ code: 'flow-no-steps', id: f.id });
    for (const st of f.steps) if (blank(st.role)) flows.missing.push({ code: 'step-no-role', id: `${f.id}.${st.n}` });
  }

  const reqs = get('requirements');
  reqs.requirements = requirementsOf(reqs.markdown);
  const criteria = get('criteria');
  criteria.criteria = criteriaOf(criteria.markdown);
  const written = new Set(criteria.criteria.map((c) => c.id));
  if (reqs.markdown) {
    if (!reqs.requirements.some((r) => r.kind === 'fr')) reqs.missing.push({ code: 'no-fr' });
    if (!reqs.requirements.some((r) => r.kind === 'nfr')) reqs.missing.push({ code: 'no-nfr' });
    for (const r of reqs.requirements) {
      if (!r.criteria.length) reqs.missing.push({ code: 'no-criterion', id: r.id });
      if (r.kind === 'fr' && !r.flows.length) reqs.missing.push({ code: 'no-flow', id: r.id });
    }
  }
  for (const r of reqs.requirements) for (const c of r.criteria) if (!written.has(c)) criteria.missing.push({ code: 'criterion-not-written', id: c });

  return { sections: out };
}

