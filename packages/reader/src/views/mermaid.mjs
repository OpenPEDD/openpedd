// toMermaid: one view as Markdown ready to paste in a PR or a README (FR-VEW-08): its graph in a
// ```mermaid block (`stateDiagram-v2`, `erDiagram` or `flowchart`), and each matrix as a table.

const safe = (id) => `n_${String(id).replace(/[^A-Za-z0-9]/g, '_')}`;
const text = (s) => String(s ?? '').replace(/"/g, '#quot;').replace(/</g, '#lt;').replace(/>/g, '#gt;').replace(/\|/g, '#124;').replace(/[\n\r]+/g, ' ').trim();
const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

function states(view) {
  const lines = ['stateDiagram-v2'];
  const groups = [...new Set(view.nodes.map((n) => n.group))];
  for (const g of groups) {
    const ns = view.nodes.filter((n) => n.group === g);
    if (groups.length > 1) lines.push(`  state "${text(g)}" as ${safe(g)} {`);
    const pad = groups.length > 1 ? '    ' : '  ';
    for (const n of ns) lines.push(`${pad}state "${text(n.label)}" as ${safe(n.id)}`);
    const first = ns.find((n) => n.status === 'initial');
    if (first) lines.push(`${pad}[*] --> ${safe(first.id)}`);
    for (const e of view.edges.filter((x) => ns.some((n) => n.id === x.from))) lines.push(`${pad}${safe(e.from)} --> ${safe(e.to)}${e.label ? ` : ${text(e.label).replace(/:/g, ' ')}` : ''}`);
    if (groups.length > 1) lines.push('  }');
  }
  return lines.join('\n');
}

function er(view) {
  const lines = ['erDiagram'];
  for (const n of view.nodes.filter((x) => x.type === 'entity')) {
    lines.push(`  ${safe(n.id)}["${text(`${n.label} (${n.id})`)}"] {`);
    for (const f of n.fields || []) lines.push(`    ${(f.type || 'field').replace(/[^A-Za-z0-9_]/g, '_') || 'field'} ${String(f.name).replace(/[^A-Za-z0-9_]/g, '_') || 'field'}`);
    lines.push('  }');
  }
  for (const e of view.edges.filter((x) => x.type === 'relation')) lines.push(`  ${safe(e.from)} ${/\[\]/.test(e.label || '') ? '||--o{' : '||--||'} ${safe(e.to)} : "${text(e.label)}"`);
  return lines.join('\n');
}

function flowchart(view, dir) {
  const lines = [`flowchart ${dir}`];
  const groups = [...new Set(view.nodes.map((n) => n.group ?? ''))];
  for (const g of groups) {
    const ns = view.nodes.filter((n) => (n.group ?? '') === g);
    if (g && groups.length > 1) lines.push(`  subgraph ${safe(`g_${g}`)}["${text(g)}"]`);
    for (const n of ns) lines.push(`    ${safe(n.id)}["${text(n.label)}${/^[a-z]+:/.test(n.id) ? '' : ` · ${text(n.id)}`}"]`);
    if (g && groups.length > 1) lines.push('  end');
  }
  for (const e of view.edges) lines.push(`  ${safe(e.from)} -->|${text([e.type, e.label].filter(Boolean).join(': '))}| ${safe(e.to)}`);
  return lines.join('\n');
}

function table(m) {
  return [`**${m.title}**`, '', `| | ${m.cols.map(cell).join(' | ')} |`, `|---|${m.cols.map(() => '---').join('|')}|`, ...m.rows.map((r, i) => `| ${cell(r)} | ${m.cells[i].map(cell).join(' | ')} |`)].join('\n');
}

/** One view of `views.json` as Markdown: its diagram in a ```mermaid block, then its matrices as tables. */
export function toMermaid(view, kind) {
  if (!view) return '';
  if (view.empty) return `_${kind ?? 'This view'} is empty: it needs ${view.empty.artifact}. ${view.empty.fill}._\n`;
  const parts = [];
  if (view.nodes.length) {
    const body = kind === 'states' ? states(view) : kind === 'entities' ? er(view) : flowchart(view, ['prd', 'trace', 'changes'].includes(kind) ? 'LR' : 'TD');
    parts.push(['```mermaid', body, '```'].join('\n'));
  }
  for (const m of view.matrix || []) parts.push(table(m));
  return `${parts.join('\n\n')}\n`;
}
