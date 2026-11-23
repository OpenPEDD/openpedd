// scopeView: one view cut to an ID and what it reaches within a depth (FR-VEW-02). It has no imports:
// the page inlines its source, so the CLI and the page scope a view the same way.

/**
 * The part of a view an ID reaches.
 *
 * An ID that names a group (a PRD's path, an entity's states, a requirement's chain) gives that group
 * whole. An ID that names a node gives it and every node within `depth` edges, either direction.
 */
export function scopeView(view, id, depth = 1) {
  if (!id || !view || view.empty) return view;
  const file = (n) => String(n.at || '').split('#')[0];
  const ends = (a, b) => a === b || a.endsWith(`/${b}`);
  const inGroup = view.nodes.filter((n) => n.group && ends(String(n.group), id));
  let keep;
  if (inGroup.length) keep = new Set(inGroup.map((n) => n.id));
  else {
    const seeds = view.nodes.filter((n) => n.id === id || ends(file(n), id));
    keep = new Set(seeds.map((n) => n.id));
    let frontier = [...keep];
    for (let d = 0; d < Number(depth) && frontier.length; d++) {
      const next = [];
      for (const e of view.edges) {
        if (frontier.includes(e.from) && !keep.has(e.to)) { keep.add(e.to); next.push(e.to); }
        if (frontier.includes(e.to) && !keep.has(e.from)) { keep.add(e.from); next.push(e.from); }
      }
      frontier = next;
    }
  }
  const groups = new Set(view.nodes.filter((n) => keep.has(n.id)).map((n) => n.group));
  const matrix = (view.matrix || []).filter((m) => ends(String(m.id), id) || ends(String(m.group), id) || (inGroup.length && groups.has(m.group)));
  return {
    ...view,
    nodes: view.nodes.filter((n) => keep.has(n.id)),
    edges: view.edges.filter((e) => keep.has(e.from) && keep.has(e.to)),
    matrix: matrix.length ? matrix : null,
    scope: { id, depth: Number(depth), found: keep.size > 0 || matrix.length > 0 },
  };
}
