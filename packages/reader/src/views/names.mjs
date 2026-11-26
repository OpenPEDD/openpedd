// The spec's names in the reader's language (DEC-33, FR-VEW-26). A name stays as the spec and the code
// write it; what is shown is its label for the locale, from the Glossary's column for it, which `viewData`
// carries as `names`. A name with no label is shown as written. `mountViews` uses it; `renderViews`
// inlines this file into the page, so it imports nothing.

/** Who does a transition, at the end of its label: `… · by A · B`. */
const BY_NAMES = /(?:^| · )by (.+)$/;

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The locales `names` has a label for, `en` first. */
export function namesLocales(names) {
  const all = new Set(['en']);
  for (const n of Object.values(names || {})) for (const l of Object.keys(n)) all.add(l);
  return [...all].sort((a, b) => (a === 'en' ? -1 : b === 'en' ? 1 : a < b ? -1 : a > b ? 1 : 0));
}

/**
 * One name's label for a locale; the name itself when it has none. A label that is a name and what the
 * view adds after it (`Supply a supermarket · core`) gives the name's label with the rest as it is.
 */
export function labelOf(names, locale, name) {
  if (!names || name == null) return name;
  const n = names[name] || names[String(name).trim()];
  if (n && n[locale]) return n[locale];
  const at = String(name).indexOf(' · ');
  if (at > 0) {
    const head = names[name.slice(0, at)];
    if (head && head[locale]) return head[locale] + name.slice(at);
  }
  return name;
}

/**
 * A transition's label: who does it (`by A · B`) name by name, and the names inside its guard (`[a = 0]`)
 * word by word. The prose around it is the spec's, already in its language, and stays as written.
 */
export function localizeLabel(names, locale, label) {
  const said = Object.keys(names || {}).filter((n) => names[n][locale] && names[n][locale] !== n).sort((a, b) => b.length - a.length);
  if (!said.length || !label) return label;
  const words = new RegExp(`(?<![\\w])(${said.map(escapeRe).join('|')})(?![\\w])`, 'g');
  let out = label.replace(/\[[^\]]*\]/g, (guard) => guard.replace(words, (n) => labelOf(names, locale, n)));
  const by = out.match(BY_NAMES);
  if (by) out = out.slice(0, out.length - by[1].length) + by[1].split(/(\s·\s|,\s*)/).map((part, i) => (i % 2 ? part : labelOf(names, locale, part))).join('');
  return out;
}

/**
 * Every view with its names in `locale`: each node's label and fields, each edge's guard and roles. A node
 * whose label changed keeps the name as written in `written`. The IDs never change: they link the views.
 * The same object when `data` carries no labels.
 */
export function localizeViews(data, locale) {
  const names = data && data.names;
  if (!names || !Object.keys(names).length || !locale) return data;
  const node = (n) => {
    const label = labelOf(names, locale, n.label);
    return { ...n, label, ...(label !== n.label ? { written: n.label } : {}), ...(n.lane ? { lane: labelOf(names, locale, n.lane) } : {}), ...(n.fields ? { fields: n.fields.map((f) => ({ ...f, name: labelOf(names, locale, f.name), ...(labelOf(names, locale, f.name) !== f.name ? { written: f.name } : {}) })) } : {}) };
  };
  const edge = (e) => (e.label ? { ...e, label: localizeLabel(names, locale, e.label) } : e);
  const views = Object.fromEntries(Object.entries(data.views).map(([k, v]) => [k, { ...v, nodes: (v.nodes || []).map(node), edges: (v.edges || []).map(edge) }]));
  return { ...data, views };
}
