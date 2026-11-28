#!/usr/bin/env node
// Opens every screen of the plan in every state, role, width and theme, with Playwright. At each one it
// takes a screenshot, runs page-check.js and axe, and keeps the console errors. Per screen it also
// loads slowly (what moves when the data arrives), walks the keyboard (what Tab cannot reach, focus
// hidden or without an indicator, traps), and runs the plan's actions (hover, open, fill, submit with
// writes failing) with what each must show. With --baseline it compares every screenshot with the same
// one taken before (on the base branch): what changed, and where. It writes results.json, checklist.md
// and the screenshots. It measures; it decides nothing. Run from the project's root, which has
// `playwright` installed.
//
//   node sweep.mjs <plan.json> [--only <screen>,<screen>] [--widths 375,1280] [--themes light]
//                  [--base-url <url>] [--out <dir>] [--no-shots] [--shots-only] [--baseline <dir>]
//
// It reaches each state through the development menu's URL contract (design PRD, step 7):
//   ?pedd-state=<state>&pedd-role=<role>&pedd-theme=<light|dark>&pedd-delay=<ms>&pedd-fail-writes=1
// and the page confirms it by setting <html data-pedd-state="<state>">. A state the page does not
// confirm is measured anyway and reported as not confirmed: it may be showing another state.
//
// A screen of the plan:
//   { "name": "Invoices list", "route": "/invoices", "states": ["loading", "empty", "populated", "error"],
//     "roles": ["admin", "seller"], "keyboard": true,
//     "actions": [{ "name": "row menu", "state": "populated", "steps": [{ "click": "[data-guide=row-menu]" }],
//                   "expect": "[role=menu]" },
//                 { "name": "send fails", "state": "populated", "params": { "fail-writes": 1 },
//                   "steps": [{ "click": "text=Send" }, { "waitFor": "[role=alert]" }], "expect": "[role=alert]" }] }
// Steps: click, hover, focus, fill [selector, text], press <key>, wait <ms>, waitFor <selector>.
// Source: OpenPEDD design skill, design PRD v1.7, RULE-32 v1.0, WCAG 2.2 (2.1.1, 2.1.2, 2.4.7, 2.4.11), MKT-21 v1.0, ARCH-25 v1.0.
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const flag = (name) => args.includes(`--${name}`);
const VALUED = new Set(['--only', '--widths', '--themes', '--out', '--base-url', '--baseline']);
const planPath = args.find((a, i) => !a.startsWith('--') && !VALUED.has(args[i - 1]));
if (!planPath) { console.error('usage: node sweep.mjs <plan.json> [--only a,b] [--widths 375,1280] [--themes light] [--base-url <url>] [--out <dir>] [--no-shots] [--shots-only] [--baseline <dir>]'); process.exit(2); }

const plan = JSON.parse(readFileSync(planPath, 'utf8'));
const list = (s) => (s ?? '').split(',').map((x) => x.trim()).filter(Boolean);
const WIDTHS = list(opt('widths')).length ? list(opt('widths')).map(Number) : plan.widths ?? [320, 375, 768, 1024, 1280, 1440];
const THEMES = list(opt('themes')).length ? list(opt('themes')) : plan.themes ?? ['light', 'dark'];
const BASE_URL = opt('base-url') ?? plan.baseUrl;
const OUT = resolve(opt('out') ?? plan.out ?? 'design-sweep');
const BASELINE = opt('baseline') ? resolve(opt('baseline')) : null;
const DELAY = plan.delay ?? 1500;
const SHOTS_ONLY = flag('shots-only');
const SHOTS = !flag('no-shots') || SHOTS_ONLY;
const only = list(opt('only')).map((s) => s.toLowerCase());
const screens = (plan.screens ?? []).filter((s) => !only.length || only.some((o) => s.name.toLowerCase().includes(o)));
const PAGE_CHECK = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'page-check.js'), 'utf8');
const NARROW = Math.min(...WIDTHS), WIDE = Math.max(...WIDTHS);

// Playwright and axe come from the project, never from here.
const req = createRequire(join(process.cwd(), 'noop.js'));
const load = (names) => { for (const n of names) { try { return req(n); } catch {} } return null; };
const pw = load(['playwright', 'playwright-core', '@playwright/test']);
if (!pw) { console.error('not run: Playwright is not installed in this project. Install it (npm i -D playwright && npx playwright install chromium), then run again.'); process.exit(3); }
const axeModule = SHOTS_ONLY ? null : load(['@axe-core/playwright']);
const AxeBuilder = axeModule?.default ?? axeModule?.AxeBuilder ?? null;

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const urlFor = (route, params) => {
  const u = new URL(route, BASE_URL);
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null) u.searchParams.set(`pedd-${k}`, String(v));
  return u.href;
};

let browser;
try { browser = await pw.chromium.launch(); } catch (e) {
  console.error(`not run: Chromium did not start (${e.message.split('\n')[0]}). Run: npx playwright install chromium`);
  process.exit(3);
}

// What the focused element is, whether it shows focus, and whether something covers it (WCAG 2.4.7, 2.4.11).
const FOCUS_PROBE = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body || el === document.documentElement) return null;
  const sel = (n) => { if (n.id) return '#' + CSS.escape(n.id); const p = []; for (let e = n; e && e.nodeType === 1 && p.length < 4; e = e.parentElement) {
    const g = e.getAttribute('data-guide') || e.getAttribute('data-testid'); if (g) { p.unshift(e.tagName.toLowerCase() + '[data-' + (e.hasAttribute('data-guide') ? 'guide' : 'testid') + '="' + g + '"]'); break; }
    let s = e.tagName.toLowerCase(); const c = [...e.classList].filter((x) => !/[:[\\]/]/.test(x)).slice(0, 2); if (c.length) s += '.' + c.map((x) => CSS.escape(x)).join('.'); p.unshift(s); } return p.join(' > '); };
  const r = el.getBoundingClientRect(), s = getComputedStyle(el);
  const indicator = (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || (s.boxShadow && s.boxShadow !== 'none');
  const pts = [[r.left + r.width / 2, r.top + r.height / 2], [r.left + 2, r.top + 2], [r.right - 2, r.top + 2], [r.left + 2, r.bottom - 2], [r.right - 2, r.bottom - 2]]
    .filter(([x, y]) => x >= 0 && y >= 0 && x < innerWidth && y < innerHeight);
  let covered = 0, by = null;
  for (const [x, y] of pts) { const top = document.elementFromPoint(x, y); if (top && top !== el && !el.contains(top) && !top.contains(el)) { covered++; by = sel(top); } }
  return { key: sel(el), name: (el.getAttribute('aria-label') || el.innerText || el.value || '').trim().slice(0, 40), top: Math.round(r.top + scrollY), left: Math.round(r.left),
    indicator, hidden: pts.length > 0 && covered === pts.length, partly: covered > 0 && covered < pts.length, by, offscreen: pts.length === 0 };
})()`;
const FOCUSABLE = `(() => [...document.querySelectorAll('a[href], button:not([disabled]), input:not([type=hidden]):not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"]), [contenteditable=true]')]
  .filter((el) => { const s = getComputedStyle(el), r = el.getBoundingClientRect(); return s.visibility !== 'hidden' && s.display !== 'none' && r.width > 0 && r.height > 0 && !el.closest('[inert], [aria-hidden=true]'); })
  .map((el) => { if (el.id) return '#' + CSS.escape(el.id); const p = []; for (let e = el; e && e.nodeType === 1 && p.length < 4; e = e.parentElement) {
    const g = e.getAttribute('data-guide') || e.getAttribute('data-testid'); if (g) { p.unshift(e.tagName.toLowerCase() + '[data-' + (e.hasAttribute('data-guide') ? 'guide' : 'testid') + '="' + g + '"]'); break; }
    let s = e.tagName.toLowerCase(); const c = [...e.classList].filter((x) => !/[:[\\]/]/.test(x)).slice(0, 2); if (c.length) s += '.' + c.map((x) => CSS.escape(x)).join('.'); p.unshift(s); } return p.join(' > '); }))()`;

async function keyboardWalk(page) {
  const reachable = await page.evaluate(FOCUSABLE);
  const seen = [], problems = { hidden: [], partly: [], noIndicator: [], backwards: [], trap: null, offscreen: [] };
  let same = 0, prev = null;
  for (let i = 0; i < Math.min(200, reachable.length * 2 + 10); i++) {
    await page.keyboard.press('Tab');
    const f = await page.evaluate(FOCUS_PROBE);
    if (!f) { if (seen.length) break; continue; }
    if (seen.length && f.key === seen[0].key) break;
    if (prev && f.key === prev.key) { if (++same >= 2 && reachable.length > 1) { problems.trap = f.key; break; } continue; }
    same = 0;
    if (!seen.some((s) => s.key === f.key)) seen.push(f);
    if (f.hidden) problems.hidden.push(`${f.key}${f.by ? ` under ${f.by}` : ''}`);
    else if (f.partly) problems.partly.push(`${f.key}${f.by ? ` under ${f.by}` : ''}`);
    if (f.offscreen) problems.offscreen.push(f.key);
    if (!f.indicator) problems.noIndicator.push(f.key);
    if (prev && f.top < prev.top - 40) problems.backwards.push(`${prev.key} → ${f.key}`);
    prev = f;
  }
  const reached = new Set(seen.map((s) => s.key));
  return { focusable: reachable.length, reached: seen.length, unreachable: reachable.filter((k) => !reached.has(k)).slice(0, 25), order: seen.map((s) => s.name || s.key).slice(0, 60), ...problems };
}

async function runSteps(page, steps = []) {
  for (const s of steps) {
    if (s.click) await page.click(s.click, { timeout: 5000 });
    else if (s.hover) await page.hover(s.hover, { timeout: 5000 });
    else if (s.focus) await page.focus(s.focus, { timeout: 5000 });
    else if (s.fill) await page.fill(s.fill[0], s.fill[1], { timeout: 5000 });
    else if (s.press) await page.keyboard.press(s.press);
    else if (s.wait) await page.waitForTimeout(s.wait);
    else if (s.waitFor) await page.waitForSelector(s.waitFor, { timeout: 5000 });
  }
}

const results = [];
async function measure({ screen, kind, state, role, width, theme, params = {}, action }) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 200)));
  const url = urlFor(screen.route, { state, role, theme, ...params });
  const run = { screen: screen.name, kind, state, role: role ?? null, width, theme, url, ...(action ? { action: action.name } : {}) };
  try {
    const res = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    run.status = res?.status() ?? null;
    if (params.delay) await page.waitForTimeout(params.delay + 800);
    run.confirmed = await page.waitForSelector(`html[data-pedd-state="${state}"]`, { timeout: params.delay ? 1000 : 5000 }).then(() => true, () => false);
    await page.waitForTimeout(150);
    if (kind === 'keyboard') run.keyboard = await keyboardWalk(page);
    if (kind === 'action') {
      try { await runSteps(page, action.steps); run.stepsOk = true; } catch (e) { run.stepsOk = false; run.stepError = e.message.split('\n')[0]; }
      if (action.expect) run.expectOk = await page.waitForSelector(action.expect, { state: 'visible', timeout: 3000 }).then(() => true, () => false);
      await page.waitForTimeout(150);
    }
    if (kind !== 'keyboard' && !SHOTS_ONLY) {
      const check = JSON.parse(await page.evaluate(PAGE_CHECK));
      run.check = kind === 'shift' ? { layoutShift: check.layoutShift } : check;
      if (kind !== 'shift' && AxeBuilder) {
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
        run.axe = axe.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help }));
      }
    }
    if ((kind === 'state' || kind === 'action') && SHOTS) {
      const dir = join(OUT, slug(screen.name));
      mkdirSync(dir, { recursive: true });
      run.shot = join(dir, `${[kind === 'action' ? `action-${action.name}` : null, state, role, width, theme].filter(Boolean).map(slug).join('-')}.png`);
      await page.screenshot({ path: run.shot, fullPage: true, animations: 'disabled' });
    }
  } catch (e) {
    run.error = e.message.split('\n')[0];
  }
  run.consoleErrors = errors;
  await context.close();
  results.push(run);
  const s = run.check?.summary, k = run.keyboard;
  process.stdout.write(`${run.error ? '✗' : run.confirmed ? '·' : '?'} ${screen.name} · ${kind === 'action' ? `${action.name} · ` : kind === 'keyboard' ? 'keyboard · ' : ''}${state}${role ? ` · ${role}` : ''} · ${width} · ${theme}${kind === 'shift' ? ' · slow load' : ''}${run.error ? ` · ${run.error}` : ''}${s ? ` · overflow ${s.pageScrollsSideways ? 'yes' : 'no'} · contrast ${s.contrastPairsFailing} · small ${s.smallTargets}` : ''}${k ? ` · reached ${k.reached} of ${k.focusable}` : ''}${kind === 'action' ? ` · ${run.stepsOk && run.expectOk !== false ? 'ok' : 'failed'}` : ''}\n`);
}

for (const screen of screens) {
  const roles = screen.roles?.length ? screen.roles : [null];
  for (const state of screen.states) for (const role of roles) for (const width of WIDTHS) for (const theme of THEMES) await measure({ screen, kind: 'state', state, role, width, theme });
  for (const action of screen.actions ?? []) {
    for (const width of action.widths ?? [...new Set([NARROW, WIDE])]) {
      await measure({ screen, kind: 'action', action, state: action.state ?? screen.states[0], role: action.role ?? roles[0], width, theme: THEMES[0], params: action.params ?? {} });
    }
  }
  if (SHOTS_ONLY) continue;
  const loaded = screen.states.includes('populated') ? 'populated' : screen.states.find((s) => s !== 'loading');
  if (!loaded) continue;
  for (const width of WIDTHS) await measure({ screen, kind: 'shift', state: loaded, role: roles[0], width, theme: THEMES[0], params: { delay: DELAY } });
  if (screen.keyboard !== false) for (const width of [...new Set([NARROW, WIDE])]) await measure({ screen, kind: 'keyboard', state: loaded, role: roles[0], width, theme: THEMES[0] });
}

// Each screenshot against the same one in the baseline, compared in the browser: no other package.
const regression = [];
if (BASELINE) {
  const page = await browser.newPage();
  const shots = results.filter((r) => r.shot);
  for (const r of shots) {
    const rel = r.shot.slice(OUT.length + 1), before = join(BASELINE, rel);
    if (!existsSync(before)) { regression.push({ shot: rel, status: 'new' }); continue; }
    const out = await page.evaluate(async ([a, b]) => {
      const img = (src) => new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; });
      const [x, y] = await Promise.all([img(a), img(b)]);
      const w = Math.max(x.width, y.width), h = Math.max(x.height, y.height);
      const data = (i) => { const c = new OffscreenCanvas(w, h), g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.drawImage(i, 0, 0); return g.getImageData(0, 0, w, h).data; };
      const [p, q] = [data(x), data(y)];
      const c = new OffscreenCanvas(w, h), g = c.getContext('2d'), out = g.createImageData(w, h);
      let diff = 0, top = h, bottom = -1;
      for (let i = 0; i < p.length; i += 4) {
        const d = Math.max(Math.abs(p[i] - q[i]), Math.abs(p[i + 1] - q[i + 1]), Math.abs(p[i + 2] - q[i + 2]));
        const grey = (p[i] + p[i + 1] + p[i + 2]) / 3;
        if (d > 24) { diff++; out.data.set([255, 0, 0, 255], i); const row = Math.floor(i / 4 / w); top = Math.min(top, row); bottom = Math.max(bottom, row); }
        else out.data.set([grey, grey, grey, 60], i);
      }
      g.putImageData(out, 0, 0);
      const blob = await c.convertToBlob({ type: 'image/png' });
      const png = diff ? await new Promise((ok) => { const fr = new FileReader(); fr.onload = () => ok(String(fr.result).split(',')[1]); fr.readAsDataURL(blob); }) : null;
      return { ratio: diff / (w * h), sizeChanged: x.width !== y.width || x.height !== y.height, before: `${x.width}×${x.height}`, after: `${y.width}×${y.height}`, rows: diff ? [top, bottom] : null, png };
    }, [`data:image/png;base64,${readFileSync(before).toString('base64')}`, `data:image/png;base64,${readFileSync(r.shot).toString('base64')}`]).catch((e) => ({ error: e.message.split('\n')[0] }));
    const entry = { shot: rel, status: out.error ? 'error' : out.ratio > 0.001 || out.sizeChanged ? 'changed' : 'same', ...out };
    if (out.png) { entry.diff = r.shot.replace(/\.png$/, '.diff.png'); writeFileSync(entry.diff, Buffer.from(out.png, 'base64')); }
    delete entry.png;
    regression.push(entry);
  }
  await page.close();
}
await browser.close();

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'results.json'), JSON.stringify({ plan: planPath, at: new Date().toISOString(), axe: Boolean(AxeBuilder), baseline: BASELINE, results, regression }, null, 2));

// The measured columns of the closing checklist; inline states beyond the actions, and the screen reader, are by hand.
const cut = (xs, n = 4) => (xs.length ? `${xs.length}: ${xs.slice(0, n).join(', ')}${xs.length > n ? ', …' : ''}` : '0');
const rows = [];
for (const screen of screens) {
  const mine = results.filter((r) => r.screen === screen.name);
  const runs = mine.filter((r) => r.kind === 'state'), shifts = mine.filter((r) => r.kind === 'shift');
  const walks = mine.filter((r) => r.kind === 'keyboard' && r.keyboard), acts = mine.filter((r) => r.kind === 'action');
  const states = [...new Set(runs.map((r) => r.state))];
  const unconfirmed = states.filter((st) => runs.some((r) => r.state === st && !r.confirmed));
  const failed = mine.filter((r) => r.error);
  const ok = runs.filter((r) => r.check?.summary);
  const at = (pred) => [...new Set(ok.filter(pred).map((r) => `${r.state}@${r.width}${r.theme === 'dark' ? ' dark' : ''}`))];
  const measured = (v) => (SHOTS_ONLY ? 'not run: --shots-only' : v);
  const contrast = new Set(ok.flatMap((r) => r.check.contrast.map((c) => `${c.color} on ${c.background} ${c.ratio}:1`)));
  const unverified = ok.reduce((n, r) => n + r.check.summary.contrastUnverified, 0);
  const axe = AxeBuilder ? cut([...new Set(ok.flatMap((r) => (r.axe ?? []).map((v) => v.id)))]) : 'not run: @axe-core/playwright not installed';
  const moved = shifts.filter((r) => r.check?.layoutShift?.moved?.length);
  const kb = walks.length ? walks.map((w) => `${w.width}: ${w.keyboard.reached} of ${w.keyboard.focusable}${w.keyboard.unreachable.length ? ` · unreachable ${w.keyboard.unreachable.length}` : ''}${w.keyboard.hidden.length ? ` · hidden ${w.keyboard.hidden.length}` : ''}${w.keyboard.noIndicator.length ? ` · no indicator ${w.keyboard.noIndicator.length}` : ''}${w.keyboard.trap ? ' · trap' : ''}${w.keyboard.backwards.length ? ` · jumps back ${w.keyboard.backwards.length}` : ''}`).join(' / ') : screen.keyboard === false ? 'off in plan' : measured('not run');
  const actions = acts.length ? `${acts.filter((a) => a.stepsOk && a.expectOk !== false).length} of ${acts.length}${acts.some((a) => !(a.stepsOk && a.expectOk !== false)) ? `: failed ${[...new Set(acts.filter((a) => !(a.stepsOk && a.expectOk !== false)).map((a) => `${a.action}@${a.width}`))].join(', ')}` : ''}` : '—';
  rows.push(`| ${screen.name} | ${states.length - unconfirmed.length} of ${states.length}${unconfirmed.length ? ` · not confirmed: ${unconfirmed.join(', ')}` : ''}${failed.length ? ` · ${failed.length} loads failed` : ''} | ${measured(cut(at((r) => r.check.summary.pageScrollsSideways)))} | ${measured(cut(at((r) => r.check.summary.clippedUnreachable > 0)))} | ${measured(cut(at((r) => r.check.summary.smallTargets > 0)))} | ${measured(cut(at((r) => r.check.summary.unnamed + r.check.summary.unlabelled > 0)))} | ${measured(`${contrast.size}${unverified ? ` · ${unverified} unverified` : ''}`)} | ${SHOTS_ONLY ? 'not run: --shots-only' : axe} | ${shifts.length ? (moved.length ? `moves at ${moved.map((r) => r.width).join(', ')}: ${moved[0].check.layoutShift.moved.slice(0, 2).map((m) => `${m.el} ${m.maxDy}px`).join(', ')}` : '0 moved') : measured('not run')} | ${kb} | ${actions} | ${new Set(mine.flatMap((r) => r.consoleErrors)).size} |`);
}
const changed = regression.filter((r) => r.status === 'changed');
const md = `# Design sweep\n\n${new Date().toISOString().slice(0, 16)} · ${screens.length} screens · widths ${WIDTHS.join(', ')} · themes ${THEMES.join(', ')} · ${results.length} loads · screenshots ${SHOTS ? `in ${OUT}` : 'off'}\n\n` +
  '| Screen | States confirmed | Page scrolls sideways | Clipped, unreachable | Targets < 24 px | Unnamed or unlabelled | Contrast pairs failing | axe rules failing | Layout shift on slow load | Keyboard (width: reached of focusable) | Actions | Console errors |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n' +
  rows.join('\n') + '\n\nEach cell counts the state@width where it happened; the details are in results.json.\n' +
  (BASELINE ? `\n## Against the baseline\n\n${regression.length} screenshots · ${changed.length} changed · ${regression.filter((r) => r.status === 'new').length} new · ${regression.filter((r) => r.status === 'same').length} the same\n\n${changed.length ? '| Screenshot | Pixels changed | Rows | Size | Diff |\n|---|---|---|---|---|\n' + changed.sort((a, b) => b.ratio - a.ratio).map((r) => `| ${r.shot} | ${(r.ratio * 100).toFixed(2)} % | ${r.rows ? r.rows.join('–') : '—'} | ${r.sizeChanged ? `${r.before} → ${r.after}` : 'same'} | ${r.diff ? r.diff.slice(OUT.length + 1) : '—'} |`).join('\n') + '\n' : ''}\nScreenshots compare only when both were taken on the same OS and browser.\n` : '');
writeFileSync(join(OUT, 'checklist.md'), md);
console.log(`\n${md}`);
