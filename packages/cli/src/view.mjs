// pedd view: every view of the spec as a map (modules/views). The reader makes the data and the page
// (ARCH-22); this writes them to `.pedd/view/`, opens the page, and with `--watch` serves it and
// rebuilds it on each save.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, watch, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';
import { KINDS, firstView, localizeViews, readSpec, renderViews, scopeView, toMermaid, viewData } from '@openpedd/reader';
import { readFiles } from '@openpedd/reader/files';
import { viewSources } from './sources.mjs';
import { readWorkspace } from './workspace.mjs';

export class ViewError extends Error {}

/** Every view of the working tree at `root`, as `views.json` gives it. */
export function buildViews(root) {
  const ws = readWorkspace(root);
  const files = readFiles(root);
  const model = readSpec(files, { root: ws.spec });
  return viewData(model, viewSources(root, ws, files));
}

/**
 * The locale the views show the spec's names in (FR-VEW-26): `--locale`, else the prose's `language` of
 * workspace.yaml, else `en`.
 */
export function viewLocale(root, locale) {
  if (locale) return String(locale).toLowerCase();
  const language = readWorkspace(root).data.language;
  return typeof language === 'string' && language ? language.toLowerCase() : 'en';
}

/** Writes `views.json` and `index.html` to `.pedd/view/`; gives the page's path. */
export function writeViews(root, data, open, { live = false, locale = null } = {}) {
  const dir = join(root, '.pedd', 'view');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'views.json'), `${JSON.stringify(data, null, 2)}\n`);
  writeFileSync(join(dir, 'index.html'), renderViews(data, { open, sourceBase: live ? '/' : '../../', live, locale }));
  return join(dir, 'index.html');
}

/** Opens a path or URL with the system's browser; quietly does nothing where there is none. */
export function openInBrowser(target) {
  const [cmd, args] = process.platform === 'darwin' ? ['open', [target]] : process.platform === 'win32' ? ['cmd', ['/c', 'start', '', target]] : ['xdg-open', [target]];
  try { spawn(cmd, args, { stdio: 'ignore', detached: true }).on('error', () => {}).unref(); } catch { /* no browser: the path is printed */ }
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.md': 'text/plain; charset=utf-8', '.yaml': 'text/plain; charset=utf-8', '.yml': 'text/plain; charset=utf-8', '.jsonl': 'text/plain; charset=utf-8' };

/**
 * `--watch`: serves the page on localhost and rebuilds the views each time a file of the spec is saved;
 * the open page reloads (FR-VEW-07). Gives { url, rebuilt, close }; `rebuilt` counts the rebuilds.
 */
export async function watchViews(root, { open = null, port = 0, locale = null, onBuild = () => {} } = {}) {
  const ws = readWorkspace(root);
  const clients = new Set();
  const state = { rebuilt: 0 };
  const build = () => {
    const data = buildViews(root);
    writeViews(root, data, open, { live: true, locale });
    onBuild(data);
    for (const res of clients) res.write(`data: ${state.rebuilt}\n\n`);
  };
  build();
  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/events') {
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' });
      res.write(': views\n\n');
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }
    // The page, and the files of the working tree its links open; nothing outside `root`.
    const path = url.pathname === '/' ? join('.pedd', 'view', 'index.html') : normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
    const full = join(root, path);
    if (path.split(sep).includes('..') || !full.startsWith(root) || !existsSync(full) || !statSync(full).isFile() || !TYPES[extname(full)]) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'content-type': TYPES[extname(full)] });
    res.end(readFileSync(full));
  });
  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
  let timer = null;
  const watcher = watch(join(root, ws.spec), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => { state.rebuilt++; try { build(); } catch (e) { onBuild(null, e); } }, 120);
  });
  return {
    url: `http://127.0.0.1:${server.address().port}/`,
    get rebuilt() { return state.rebuilt; },
    close: () => { clearTimeout(timer); watcher.close(); for (const c of clients) c.end(); server.close(); },
  };
}

/** The arguments of `pedd view [<kind> [<id>]]`, checked. */
export function viewTarget(rest, opts) {
  const [kind, ...id] = rest;
  if (kind && !KINDS.includes(kind)) throw new ViewError(`pedd view: no view named "${kind}". The views: ${KINDS.join(', ')}`);
  if (opts.format && opts.format !== 'mermaid') throw new ViewError(`pedd view: --format ${opts.format}: the one format is mermaid`);
  if (opts.format && !kind) throw new ViewError('pedd view --format mermaid prints one view: name it, pedd view <kind> [id] --format mermaid');
  return { kind: kind || null, id: id.join(' ') || null, depth: Number(opts.depth) || 1 };
}

/** The text `--format mermaid` prints for one view, scoped, its names by their label in `locale`. */
export function mermaidOf(data, { kind, id, depth }, locale = null) {
  data = localizeViews(data, locale);
  const v = id ? scopeView(data.views[kind], id, depth) : data.views[kind];
  if (id && v.scope && !v.scope.found) throw new ViewError(`pedd view ${kind} ${id}: nothing in this view is ${id}`);
  return toMermaid(v, kind);
}

export { firstView };
