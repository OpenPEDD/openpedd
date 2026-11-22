// renderViews: one HTML file for every view, no network: the page, its renderer and ELK, the layout,
// inlined (ARCH-22, rendering). Positions are computed on each render, never stored.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { scopeView } from './scope.mjs';

const require = createRequire(import.meta.url);
let parts;
const load = () => (parts ??= {
  page: readFileSync(new URL('./page.html', import.meta.url), 'utf8'),
  app: readFileSync(new URL('./app.js', import.meta.url), 'utf8'),
  elk: readFileSync(require.resolve('elkjs/lib/elk.bundled.js'), 'utf8'),
});

/** JSON safe inside a `<script>`. */
const inline = (v) => JSON.stringify(v).replace(/</g, '\\u003c').replace(/[\u2028\u2029]/g, (c) => `\\u${c.charCodeAt(0).toString(16)}`);
/** Script text safe inside a `<script>`: a literal `</script` would close it. */
const script = (s) => s.replace(/<\/script/gi, '<\\/script');

/**
 * The page of every view.
 *
 * @param data            what `viewData` gives.
 * @param opts.open       { kind, id, depth }: the view and scope it opens on; the first with loose items by default.
 * @param opts.sourceBase what a node's `at` is joined to for its link: `../../` from `.pedd/view/`, or a URL.
 * @param opts.live       true when served by `pedd view --watch`: the page reloads when the views are rebuilt.
 */
export function renderViews(data, opts = {}) {
  const { page, app, elk } = load();
  const options = { open: opts.open ?? null, sourceBase: opts.sourceBase ?? '../../', live: !!opts.live };
  const title = `${data.product ? `${data.product} · ` : ''}Project views`;
  return page
    .replace('__TITLE__', () => title.replace(/[<&]/g, (c) => (c === '<' ? '&lt;' : '&amp;')))
    .replace('/*__ELK__*/', () => script(elk))
    .replace('/*__SCOPE__*/', () => script(scopeView.toString()))
    .replace('/*__APP__*/', () => script(app))
    .replace('"__DATA__"', () => inline(data))
    .replace('"__OPTIONS__"', () => inline(options));
}
