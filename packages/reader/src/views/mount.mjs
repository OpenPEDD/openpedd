// The renderer of the project views (ARCH-22, FR-VEW-19). It reads `views.json` and lays out each graph
// with ELK on every render: no position is stored. `renderViews` inlines it into one page; an app imports
// it from `@openpedd/reader/mount` and mounts it into one element, with `views.css`.
import { scopeView } from './scope.mjs';

/**
 * Draws every view into `root`.
 *
 * @param data              what `viewData` gives; `loose` may be absent (a host that strips it).
 * @param options.ELK       the ELK constructor (`elkjs/lib/elk.bundled.js`); `globalThis.ELK` by default.
 * @param options.open      { kind, id, depth }: where it opens.
 * @param options.sourceBase what a node's `at` is joined to for its link.
 * @param options.links     node → [{ label, href }]: the host's links of a node (the Cloud's PRD, request, deploy).
 * @param options.overlay   ID → { state, label }: live data drawn on top, never part of `data`.
 * @param options.diff      what `diffViews(older, data)` gives: added and changed nodes marked, removed ones listed.
 * @param options.labels    the page's words, by key, in the person's language.
 * @param options.hash      false when the host keeps the state in its own URL; `onNavigate(state)` is told.
 */
export function mountViews(root, data, options) {
  'use strict';
  options = options || {};
  const ELK = options.ELK ?? globalThis.ELK;
  const L = (key, fallback) => (options.labels && options.labels[key]) || fallback;
  const useHash = options.hash !== false;
  if (options.sourceBase == null) options = { ...options, sourceBase: '' };
  const KINDS = ['decisions', 'entities', 'states', 'security', 'context', 'code', 'business', 'org', 'activity', 'prd', 'use-cases', 'glossary', 'trace', 'changes'];
  const SHOWS0 = {
    decisions: 'Every decision: its status, what supersedes what, and what it cites',
    entities: 'Each entity with its fields, its relations, and the modules that use it',
    states: 'One state machine per entity',
    security: 'Who does what, what protects each table, and the security rules',
    context: 'The system, who uses it, its apps and packages, and the services each talks to',
    code: 'Modules, packages and their main symbols, with the requirements anchored in each',
    business: 'Roles × business processes, as-is and to-be, and the module that takes each',
    org: 'Who reports to whom, as-is and to-be, with each role\'s span of control',
    activity: 'Each business process as an activity: one start, its steps in each role\'s lane, its decisions and its ends',
    prd: 'Modules and their PRDs; a PRD opens to its flows, use cases, transitions, requirements and criteria',
    'use-cases': 'Who uses which flow: actors, use cases by module, «include» and «extend»',
    glossary: 'Every name: what it is, how it is said, and where it is defined',
    trace: 'Per requirement: spec → design → code → test → deploy',
    changes: 'The changes in flight, what each touches, and where two overlap',
  };
  const SHOWS = Object.fromEntries(Object.entries(SHOWS0).map(([k, v]) => [k, L(`shows.${k}`, v)]));
  const TITLES = { prd: L('kind.prd', 'PRDs') };
  const DIRECTION = { prd: 'RIGHT', trace: 'RIGHT', states: 'RIGHT', changes: 'RIGHT', activity: 'RIGHT', org: 'UP', 'use-cases': 'RIGHT' };
  const GROUPED_OVER = 150;
  const elk = new ELK();
  const el = (tag, attrs = {}, ...kids) => {
    const svg = ['svg', 'g', 'rect', 'path', 'text', 'tspan', 'title', 'circle'].includes(tag);
    const n = svg ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'on') for (const [ev, fn] of Object.entries(v)) n.addEventListener(ev, fn);
      else if (k === 'text') n.textContent = v;
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null) n.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    return n;
  };
  const allLoose = data.loose || [];
  const looseOf = (kind) => allLoose.filter((l) => l.view === kind);
  const diffOf = (kind) => (options.diff && options.diff.kinds && options.diff.kinds[kind]) || null;
  const first = KINDS.find((k) => looseOf(k).length) || 'context';
  const live = options.overlay || {};
  const state = { kind: first, id: '', depth: 1, selected: null, expanded: new Set() };
  const fromHash = () => {
    const [kind, id, depth] = decodeURIComponent(location.hash.slice(1)).split('|');
    if (KINDS.includes(kind)) Object.assign(state, { kind, id: id || '', depth: Number(depth) || 1 });
  };
  if (options.open && KINDS.includes(options.open.kind)) Object.assign(state, { kind: options.open.kind, id: options.open.id || '', depth: Number(options.open.depth) || 1 });
  if (useHash && location.hash) fromHash();

  const side = el('nav', { class: 'side', 'aria-label': 'Views' });
  const main = el('main', { class: 'main' });
  const detail = el('aside', { class: 'detail', 'aria-label': 'Item' });
  root.replaceChildren(side, main, detail);

  function go(patch) {
    Object.assign(state, patch);
    const h = `#${[state.kind, state.id, state.id ? state.depth : ''].filter((x) => x !== '').join('|')}`;
    if (useHash && location.hash !== h) history.replaceState(null, '', h);
    if (options.onNavigate) options.onNavigate({ kind: state.kind, id: state.id, depth: state.depth });
    draw();
  }

  function drawSide() {
    side.replaceChildren(
      el('h1', { text: data.product ? `${data.product} · views` : 'Project views' }),
      el('p', { class: 'meta', text: [data.commit && `commit ${data.commit}`, data.loose ? `${allLoose.length} ${L('loose', 'loose')}` : null].filter(Boolean).join(' · ') }),
      ...KINDS.map((k) => {
        const v = data.views[k];
        if (!v) return null;
        const n = looseOf(k).length, d = diffOf(k), changed = d ? d.count.added + d.count.removed + d.count.changed : 0;
        return el('button', { 'aria-current': state.kind === k ? 'page' : null, class: v.empty ? 'empty' : null, title: SHOWS[k], on: { click: () => go({ kind: k, id: '', selected: null, expanded: new Set() }) } }, L(`kind.${k}`, k), data.loose ? el('span', { class: `n${n ? '' : ' zero'}`, text: n }) : null, changed ? el('span', { class: 'n diff', title: L('changed', 'changed'), text: `±${changed}` }) : null);
      }),
    );
  }

  /** The text of a label cut into lines that fit a node. */
  function wrap(s, width = 30) {
    const words = String(s || '').split(/\s+/), lines = [];
    let cur = '';
    for (const w of words) { if ((cur + ' ' + w).trim().length > width && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
    if (cur) lines.push(cur);
    return lines.slice(0, 4).map((l, i, a) => (i === 3 && words.join(' ').length > a.join(' ').length ? `${l.slice(0, width - 1)}…` : l));
  }
  const color = (type) => {
    const all = ['dec', 'adr', 'entity', 'module', 'state', 'role', 'action', 'table', 'policy', 'sec', 'system', 'app', 'package', 'external', 'symbol', 'prc', 'buc', 'flow', 'step', 'alternate', 'exception', 'fr', 'nfr', 'change', 'prd', 'initial', 'action', 'decision', 'final', 'actor', 'usecase', 'object'];
    const i = all.indexOf(type);
    return `var(--t${((i < 0 ? type.length : i) % 9) + 1})`;
  };

  /** The nodes and edges drawn: when the view is big, every group not expanded is one node. */
  function visible(view) {
    if (view.nodes.length <= GROUPED_OVER) return { nodes: view.nodes, edges: view.edges, grouped: false };
    const group = new Map(view.nodes.map((n) => [n.id, n.group || '—']));
    const shown = (id) => (state.expanded.has(group.get(id)) ? id : `group:${group.get(id)}`);
    const nodes = [], seen = new Set();
    for (const n of view.nodes) {
      const id = shown(n.id);
      if (seen.has(id)) continue;
      seen.add(id);
      nodes.push(id === n.id ? n : { id, type: 'group', label: `${group.get(n.id)} (${view.nodes.filter((x) => group.get(x.id) === group.get(n.id)).length})`, group: group.get(n.id) });
    }
    const edges = new Map();
    for (const e of view.edges) {
      const from = shown(e.from), to = shown(e.to);
      if (from === to) continue;
      const k = `${from}|${to}|${e.type}`;
      edges.set(k, edges.has(k) ? { ...edges.get(k), count: edges.get(k).count + 1 } : { ...e, from, to, count: 1 });
    }
    return { nodes, edges: [...edges.values()], grouped: true };
  }

  async function drawGraph(kind, view, box) {
    const { nodes, edges, grouped } = visible(view);
    const loose = new Set(looseOf(kind).map((l) => l.id));
    const sized = nodes.map((n) => {
      const lines = wrap(n.label);
      const idLine = n.type !== 'group' && !/^[a-z]+:/.test(n.id) ? n.id : null;
      const w = Math.max(90, Math.min(250, Math.max(...lines.map((l) => l.length), (idLine || '').length) * 7 + 26));
      return { n, lines, idLine, width: w, height: 16 * lines.length + (idLine ? 16 : 0) + 16 };
    });
    const graph = {
      id: 'root',
      layoutOptions: { 'elk.algorithm': 'layered', 'elk.direction': DIRECTION[kind] || 'DOWN', 'elk.spacing.nodeNode': '24', 'elk.layered.spacing.nodeNodeBetweenLayers': '46', 'elk.edgeRouting': 'SPLINES', 'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES' },
      children: sized.map((s) => ({ id: s.n.id, width: s.width, height: s.height })),
      edges: edges.map((e, i) => ({ id: `e${i}`, sources: [e.from], targets: [e.to] })),
    };
    const laid = await elk.layout(graph);
    if (state.kind !== kind) return;
    const pos = new Map(laid.children.map((c) => [c.id, c]));
    const W = Math.ceil(laid.width + 40), H = Math.ceil(laid.height + 40);
    const svg = el('svg', { width: W, height: H, viewBox: `-20 -20 ${W} ${H}`, role: 'img', 'aria-label': `${kind} view` });
    const gEdges = el('g'), gNodes = el('g');
    laid.edges.forEach((le, i) => {
      const e = edges[i];
      for (const s of le.sections || []) {
        const pts = [s.startPoint, ...(s.bendPoints || []), s.endPoint];
        const d = pts.map((p, j) => `${j ? 'L' : 'M'}${p.x},${p.y}`).join(' ');
        const end = pts[pts.length - 1], prev = pts[pts.length - 2];
        const a = Math.atan2(end.y - prev.y, end.x - prev.x);
        const head = `M${end.x},${end.y} L${end.x - 7 * Math.cos(a - 0.4)},${end.y - 7 * Math.sin(a - 0.4)} M${end.x},${end.y} L${end.x - 7 * Math.cos(a + 0.4)},${end.y - 7 * Math.sin(a + 0.4)}`;
        const mid = pts[Math.floor(pts.length / 2)];
        const label = [e.type, e.label, e.count > 1 ? `×${e.count}` : null].filter(Boolean).join(' · ');
        gEdges.append(el('g', { class: `edge ${e.type.replace(/\s+/g, '-')}` }, el('path', { d }), el('path', { d: head }), el('title', { text: `${e.from} → ${e.to}: ${label}${e.at ? ` (${e.at}:${e.line})` : ''}` }), pts.length > 2 || edges.length < 60 ? el('text', { x: mid.x + 4, y: mid.y - 4, text: label.length > 28 ? `${label.slice(0, 27)}…` : label }) : null));
      }
    });
    for (const s of sized) {
      const p = pos.get(s.n.id);
      const dk = diffOf(kind), mark = dk ? (dk.added.includes(s.n.id) ? 'added' : dk.changed.includes(s.n.id) ? 'changed' : '') : '';
      const cls = ['node', s.n.type === 'group' ? 'group' : '', loose.has(s.n.id) ? 'loose' : '', state.selected === s.n.id ? 'sel' : '', mark, live[s.n.id] ? `live live-${live[s.n.id].state}` : ''].filter(Boolean).join(' ');
      const g = el('g', { class: cls, 'data-id': s.n.id, transform: `translate(${p.x},${p.y})`, tabindex: 0, role: 'button', 'aria-label': `${s.n.label}${s.idLine ? ` (${s.idLine})` : ''}`, on: {
        click: () => (s.n.type === 'group' ? (state.expanded.add(s.n.group), draw()) : kind === 'prd' && !state.id && s.n.type === 'prd' ? go({ id: s.n.group, selected: s.n.id }) : select(s.n.id)),
        keydown: (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); g.dispatchEvent(new MouseEvent('click')); } },
      } });
      g.append(el('rect', { width: s.width, height: s.height, rx: 7 }), el('rect', { class: 'bar-t', width: 4, height: s.height, rx: 2, fill: color(s.n.type) }));
      if (live[s.n.id]) g.append(el('circle', { class: 'dot', cx: s.width - 9, cy: 9, r: 4 }));
      s.lines.forEach((l, i) => g.append(el('text', { x: 12, y: 20 + i * 16, text: l })));
      if (s.idLine) g.append(el('text', { class: 'nid', x: 12, y: 20 + s.lines.length * 16, text: s.idLine }));
      g.append(el('title', { text: `${s.n.label}${s.idLine ? ` (${s.idLine})` : ''}` }));
      gNodes.append(g);
    }
    svg.append(gEdges, gNodes);
    pan(svg, box);
    box.replaceChildren(svg);
    if (grouped) box.prepend(el('p', { class: 'hint', style: 'margin:8px 16px', text: `${view.nodes.length} items: grouped by ${kind === 'decisions' ? 'module' : 'group'}. A group opens on click.` }));
  }

  /** Drag to pan, wheel with ctrl or ⌘ to zoom. */
  function pan(svg, box) {
    let start = null, zoom = 1;
    const W = Number(svg.getAttribute('width')), H = Number(svg.getAttribute('height'));
    svg.addEventListener('pointerdown', (e) => { if (e.target.closest('.node')) return; start = { x: e.clientX, y: e.clientY, l: box.scrollLeft, t: box.scrollTop }; svg.classList.add('drag'); });
    window.addEventListener('pointermove', (e) => { if (start) { box.scrollLeft = start.l - (e.clientX - start.x); box.scrollTop = start.t - (e.clientY - start.y); } });
    window.addEventListener('pointerup', () => { start = null; svg.classList.remove('drag'); });
    svg.addEventListener('wheel', (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      zoom = Math.min(3, Math.max(0.2, zoom * (e.deltaY < 0 ? 1.1 : 0.9)));
      svg.setAttribute('width', W * zoom); svg.setAttribute('height', H * zoom);
    }, { passive: false });
  }

  function drawMatrices(view) {
    if (!view.matrix) return null;
    return el('div', { class: 'matrices' }, view.matrix.map((m) => el('section', { class: 'matrix' },
      el('h3', { text: m.title }),
      el('div', { class: 'scroll' }, el('table', {},
        el('thead', {}, el('tr', {}, el('th', { text: '' }), m.cols.map((c) => el('th', { scope: 'col', text: c })))),
        el('tbody', {}, m.rows.map((r, i) => el('tr', {}, el('th', { scope: 'row', text: r }), m.cells[i].map((c) => el('td', { class: /^(yes|own|no)$/.test(c) ? c : null, text: c })))))),
      ),
      m.at ? el('a', { href: options.sourceBase + m.at, class: 'hint', text: `${m.at}:${m.line}` }) : null,
    )));
  }

  function drawLoose(kind) {
    const list = looseOf(kind);
    if (!list.length) return null;
    return el('section', { class: 'looselist' }, el('h3', { text: `${list.length} ${L('loose', 'loose')}` }), el('ul', {}, list.map((l) => el('li', {},
      el('button', { class: 'tool', on: { click: () => select(l.id) }, text: l.says }), ' ', el('code', { text: l.id === l.says ? '' : `(${l.id})` }), ` ${l.message} · `,
      el('a', { href: options.sourceBase + l.at, text: `${l.at}:${l.line}` })))));
  }

  /** What a diff found removed: not in the view drawn, so listed under it. */
  function drawRemoved(kind) {
    const d = diffOf(kind);
    if (!d || !d.removed.length) return null;
    return el('section', { class: 'looselist removed' }, el('h3', { text: `${d.removed.length} ${L('removed', 'removed since the version compared')}` }), el('ul', {}, d.removed.map((n) => el('li', {}, el('span', { text: n.label }), ' ', el('code', { text: /^[a-z-]+:/.test(n.id) ? '' : `(${n.id})` })))));
  }

  function draw() {
    drawSide();
    const full = data.views[state.kind];
    // The prd view opens on modules and their PRDs; a PRD opens to its detail (FR-VEW-10).
    const level1 = (v) => { const keep = new Set(v.nodes.filter((n) => n.level === 1).map((n) => n.id)); return { ...v, nodes: v.nodes.filter((n) => keep.has(n.id)), edges: v.edges.filter((e) => keep.has(e.from) && keep.has(e.to)), matrix: null }; };
    const view = state.id ? scopeView(full, state.id, state.depth) : state.kind === 'prd' && !full.empty ? level1(full) : full;
    const box = el('div', { class: 'canvas' });
    const id = el('input', { value: state.id, placeholder: L('scopePlaceholder', 'An ID, a group or a path'), 'aria-label': 'Scope to', on: { change: (e) => go({ id: e.target.value.trim() }) } });
    const depth = el('input', { class: 'depth', type: 'number', min: 1, max: 6, value: state.depth, 'aria-label': 'Depth', on: { change: (e) => go({ depth: Number(e.target.value) || 1 }) } });
    main.replaceChildren(
      el('div', { class: 'bar' }, el('h2', { text: TITLES[state.kind] || state.kind }), el('span', { class: 'src', title: (full.sources || []).join('\n'), text: (full.sources || []).length > 3 ? `${full.sources.slice(0, 2).join(' · ')} · and ${full.sources.length - 2} more` : (full.sources || []).join(' · ') }), el('span', { class: 'spacer' }), id, depth, state.id ? el('button', { on: { click: () => go({ id: '' }) }, text: L('wholeView', 'Whole view') }) : null),
      box,
    );
    if (full.empty) {
      box.append(el('div', { class: 'empty-view' }, el('h3', { text: `Empty: no ${full.empty.artifact.replace(/`/g, '')}` }), el('p', { text: SHOWS[state.kind] + '.' }), el('p', { text: `It fills from ${full.empty.fill.replace(/`/g, '')}.` })));
    } else if (state.id && view.scope && !view.scope.found) {
      box.append(el('div', { class: 'empty-view' }, el('h3', { text: `Nothing here is ${state.id}` }), el('p', { text: 'Try an ID, a group, or a file path of this view.' })));
    } else if (view.nodes.length) {
      box.append(el('p', { class: 'hint', style: 'margin:16px', text: 'Laying out…' }));
      drawGraph(state.kind, view, box).catch((e) => box.replaceChildren(el('p', { class: 'hint', style: 'margin:16px', text: `The layout failed: ${e.message}` })));
    }
    const extra = [drawMatrices(view), drawLoose(state.kind), drawRemoved(state.kind)].filter(Boolean);
    if (extra.length) main.append(el('div', { style: view.nodes.length ? 'max-height:45%;overflow:auto;border-top:1px solid var(--line)' : 'overflow:auto;flex:1' }, extra));
    if (!view.nodes.length && !full.empty && !extra.length) box.append(el('p', { class: 'hint', style: 'margin:16px', text: 'Nothing to draw.' }));
    drawDetail();
  }

  /** Marks an item and reads it on the right, without laying the graph out again. */
  function select(id) {
    state.selected = id;
    for (const g of main.querySelectorAll('.node')) g.classList.toggle('sel', g.dataset.id === id);
    drawDetail();
  }

  function drawDetail() {
    const view = data.views[state.kind];
    const n = view.nodes.find((x) => x.id === state.selected);
    if (!n) { detail.replaceChildren(el('p', { class: 'hint', text: `${SHOWS[state.kind]}. Click an item to read it as written.` })); return; }
    const skip = new Set(['id', 'label', 'type', 'at', 'line', 'fields']);
    const linkTo = (id) => { const t = view.nodes.find((x) => x.id === id); return el('button', { class: 'linkish', on: { click: () => select(id) }, text: t ? t.label : id }); };
    const out = view.edges.filter((e) => e.from === n.id), inc = view.edges.filter((e) => e.to === n.id);
    detail.replaceChildren(...[
      el('h3', { text: n.label }),
      /^[a-z]+:/.test(n.id) ? el('div', { class: 'id', text: n.type }) : el('div', { class: 'id', text: `${n.id} · ${n.type}` }),
      ...looseOf(state.kind).filter((l) => l.id === n.id).map((l) => el('div', { class: 'warn', text: `${L('looseOne', 'Loose')}: ${l.message} (${l.at}:${l.line})` })),
      live[n.id] ? el('div', { class: `live-note live-${live[n.id].state}`, text: live[n.id].label || live[n.id].state }) : null,
      options.links ? (() => { const ls = options.links(n) || []; return ls.length ? el('ul', { class: 'links' }, ls.map((x) => el('li', {}, el('a', { href: x.href, text: x.label })))) : null; })() : null,
      el('dl', {}, Object.entries(n).filter(([k, v]) => !skip.has(k) && v != null && v !== '' && !(Array.isArray(v) && !v.length)).flatMap(([k, v]) => [el('dt', { text: k }), el('dd', { text: Array.isArray(v) ? v.join(' · ') : String(v) })])),
      n.fields && n.fields.length ? el('table', {}, el('thead', {}, el('tr', {}, el('th', { text: 'Field' }), el('th', { text: 'Type' }), el('th', { text: 'What it holds' }))), el('tbody', {}, n.fields.map((f) => el('tr', {}, el('td', {}, el('code', { text: f.name })), el('td', { text: f.type || '' }), el('td', { text: f.holds }))))) : null,
      n.at ? el('p', {}, el('a', { href: options.sourceBase + n.at, text: `Open ${n.at}` }), el('span', { class: 'hint', text: ` · line ${n.line}` })) : null,
      out.length ? el('div', {}, el('strong', { text: 'To' }), el('ul', {}, out.map((e) => el('li', {}, `${e.type}${e.label ? ` (${e.label})` : ''} → `, linkTo(e.to))))) : null,
      inc.length ? el('div', {}, el('strong', { text: 'From' }), el('ul', {}, inc.map((e) => el('li', {}, linkTo(e.from), ` → ${e.type}${e.label ? ` (${e.label})` : ''}`)))) : null,
      el('p', {}, el('button', { class: 'tool', on: { click: () => go({ id: n.id, depth: state.depth }) }, text: 'Scope to it' })),
    ].filter(Boolean));
  }

  if (useHash) window.addEventListener('hashchange', () => { fromHash(); draw(); });
  if (options.live && typeof EventSource !== 'undefined') new EventSource('/events').onmessage = () => location.reload();
  draw();
  return { go, data, destroy: () => root.replaceChildren() };
}
