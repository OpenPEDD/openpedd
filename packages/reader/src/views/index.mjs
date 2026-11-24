// viewData: the data of every project view, one builder per kind (ARCH-22). The same files give the
// same `views.json`, byte for byte: nothing in it depends on the clock or on the order files come in.
import { loose } from './common.mjs';
import { itemAt, prep } from './prep.mjs';
import * as decisions from './decisions.mjs';
import * as entities from './entities.mjs';
import * as states from './states.mjs';
import * as security from './security.mjs';
import * as context from './context.mjs';
import * as code from './code.mjs';
import * as business from './business.mjs';
import * as prd from './prd.mjs';
import * as trace from './trace.mjs';
import * as changes from './changes.mjs';
import * as org from './org.mjs';
import * as activity from './activity.mjs';
import * as useCases from './use-cases.mjs';
import * as glossary from './glossary.mjs';
import * as stages from './stages.mjs';

/** The kinds, in the order the page lists them ([views](spec/modules/views/prd.md#the-views)). */
export const KINDS = ['stages', 'decisions', 'entities', 'states', 'security', 'context', 'code', 'business', 'org', 'activity', 'prd', 'use-cases', 'glossary', 'trace', 'changes'];
const BUILDERS = { stages, decisions, entities, states, security, context, code, business, org, activity, prd, 'use-cases': useCases, glossary, trace, changes };

/** The format of `views.json`; a change to its shape is a major of the reader (ARCH-20). */
export const VIEWS_FORMAT = 1;

/** The view an ID defined nowhere is marked in: the view of the document that cites it. */
function viewOfPath(c, path) {
  const rel = path.slice(c.root.length + 1);
  if (rel.startsWith('decisions/')) return 'decisions';
  if (rel === 'foundations/business/stages.md') return 'stages';
  if (rel.startsWith('foundations/domain/')) return 'entities';
  if (rel.startsWith('foundations/business-map/')) return 'business';
  if (rel.startsWith('modules/')) return 'prd';
  if (rel.startsWith('changes/')) return 'changes';
  if (rel === 'foundations/glossary.md') return 'glossary';
  if ([c.foundation('Roles & Permissions'), c.foundation('Security Policy')].some((d) => d?.path === path)) return 'security';
  return 'context';
}

const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Every view of a spec, and every loose item (RULE-27).
 *
 * @param model    what `readSpec` gives.
 * @param sources  what the caller has beyond the spec; each one missing leaves its view empty:
 *   workspace     workspace.yaml, parsed; `workspaceLines` maps a component's path to its line
 *   files         path → text of the files `views.security` names in workspace.yaml
 *   stack         `.pedd/stack.json`, parsed
 *   packages      component path → { name, dependencies }: the workspace graph
 *   codeIndex     path → text of `.pedd/code-index/`
 *   specGraph     `.pedd/spec-graph.json`, parsed
 *   traceEvents   the events of `.pedd/trace/`, parsed, in the order they were appended
 *   branches      [{ name, files: path → text of its `changes/` }]: every change branch
 *   product · commit   what the file names it was built from
 */
export function viewData(model, sources = {}) {
  const c = prep(model, sources);
  const views = {};
  const all = [];
  for (const kind of KINDS) {
    const { view, loose: found } = BUILDERS[kind].build(model, sources);
    views[kind] = view;
    all.push(...found);
  }
  // An ID cited and defined nowhere, once per item that cites it.
  const seen = new Set();
  for (const x of c.ids.cited) {
    if (c.ids.defined.has(x.id)) continue;
    const item = itemAt(c, x.path, x.line);
    const key = `${item.id}|${x.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    all.push(loose(viewOfPath(c, x.path), 'undefined-id', { id: item.id, says: item.says, path: x.path, line: x.line, message: `cites \`${x.id}\`, defined nowhere` }));
  }
  all.sort((a, b) => cmp(KINDS.indexOf(a.view), KINDS.indexOf(b.view)) || cmp(a.at, b.at) || a.line - b.line || cmp(a.kind, b.kind) || cmp(a.id, b.id) || cmp(a.message, b.message));
  return { format: VIEWS_FORMAT, product: sources.product ?? sources.workspace?.project ?? null, commit: sources.commit ?? null, views, loose: all };
}

/** The view a page opens on: the first with loose items, or `context` (F1.3). */
export const firstView = (data) => KINDS.find((k) => data.loose.some((l) => l.view === k)) ?? 'context';

export { scopeView } from './scope.mjs';
export { toMermaid } from './mermaid.mjs';
export { renderViews } from './render.mjs';
