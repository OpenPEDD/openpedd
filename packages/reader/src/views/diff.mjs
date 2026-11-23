// diffViews: what changed between two builds of the views (FR-VEW-18). Nodes are matched by ID, edges
// by `from` · `to` · `type`; a node is changed when its label, status or group differs. No imports: an
// app imports it from `@openpedd/reader/diff`, in the browser or on a server.

const edgeKey = (e) => `${e.from}|${e.to}|${e.type}`;
const SAME = ['label', 'status', 'group'];

/**
 * @param older  a `views.json`.
 * @param newer  a `views.json` of the same `format`.
 * @returns { from, to, kinds: { [kind]: { added: [id], changed: [id], removed: [{ id, label, type }],
 *            edgesAdded: [key], edgesRemoved: [key], count: { added, changed, removed, edges } } } }
 */
export function diffViews(older, newer) {
  if (!older || !newer) throw new Error('diffViews needs two views.json');
  if (older.format !== newer.format) throw new Error(`diffViews: format ${older.format} and ${newer.format} cannot be compared; build the older one again with this reader`);
  const kinds = {};
  for (const kind of [...new Set([...Object.keys(older.views || {}), ...Object.keys(newer.views || {})])].sort()) {
    const a = older.views?.[kind] ?? { nodes: [], edges: [] }, b = newer.views?.[kind] ?? { nodes: [], edges: [] };
    const na = new Map((a.nodes || []).map((n) => [n.id, n])), nb = new Map((b.nodes || []).map((n) => [n.id, n]));
    const added = [...nb.keys()].filter((id) => !na.has(id)).sort();
    const removed = [...na.keys()].filter((id) => !nb.has(id)).sort().map((id) => ({ id, label: na.get(id).label, type: na.get(id).type }));
    const changed = [...nb.keys()].filter((id) => na.has(id) && SAME.some((k) => (na.get(id)[k] ?? null) !== (nb.get(id)[k] ?? null))).sort();
    const ea = new Set((a.edges || []).map(edgeKey)), eb = new Set((b.edges || []).map(edgeKey));
    const edgesAdded = [...eb].filter((k) => !ea.has(k)).sort(), edgesRemoved = [...ea].filter((k) => !eb.has(k)).sort();
    kinds[kind] = { added, changed, removed, edgesAdded, edgesRemoved, count: { added: added.length, changed: changed.length, removed: removed.length, edges: edgesAdded.length + edgesRemoved.length } };
  }
  return { from: older.commit ?? null, to: newer.commit ?? null, kinds };
}
