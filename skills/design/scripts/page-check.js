// Measures the rendered page in the browser, at the current width and in the current state: page
// overflow, clipped text, targets under 24 px, controls with no accessible name, fields with no label,
// text contrast, heading order, images with no alt, the distinct font sizes and colors in use, and
// every layout shift since the page loaded, with what moved (a skeleton that does not match its
// screen shows here when the data arrives).
// It measures; it decides nothing. Open the state first (a menu, a dialog, hover): it sees only what is
// rendered. Text over an image or a gradient is listed as unverified, never as a pass.
//
// sweep.mjs runs it at every screen, state, width and theme. By hand, run it as an expression; it
// returns a promise of a JSON string:
//   Playwright:  const r = JSON.parse(await page.evaluate(readFileSync('page-check.js', 'utf8')));
//   A browser tool that evaluates JavaScript: paste the file as it is, and await its result.
// For the layout shifts of a load, run it once the data has arrived (after the slow network of the
// development menu, for a skeleton), on the same page load: a reload starts the count again.
// Source: OpenPEDD design skill, WCAG 2.2 (1.3.1, 1.4.3, 1.4.10, 2.5.8, 4.1.2), RULE-32 v1.0.
(async () => {
  const MAX = 25;
  const vw = document.documentElement.clientWidth;
  const visible = (el) => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const sel = (el) => {
    if (el.id) return `#${CSS.escape(el.id)}`;
    const parts = [];
    for (let e = el; e && e.nodeType === 1 && parts.length < 4; e = e.parentElement) {
      let p = e.tagName.toLowerCase();
      const guide = e.getAttribute('data-guide') || e.getAttribute('data-testid');
      if (guide) { parts.unshift(`${p}[data-${e.hasAttribute('data-guide') ? 'guide' : 'testid'}="${guide}"]`); break; }
      const cls = [...e.classList].filter((c) => !/[:[\]/]/.test(c)).slice(0, 2);
      if (cls.length) p += '.' + cls.map((c) => CSS.escape(c)).join('.');
      const sibs = e.parentElement ? [...e.parentElement.children].filter((c) => c.tagName === e.tagName) : [];
      if (sibs.length > 1) p += `:nth-of-type(${sibs.indexOf(e) + 1})`;
      parts.unshift(p);
    }
    return parts.join(' > ');
  };
  const text = (el) => (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60);

  // Any CSS color to sRGB [r, g, b, a], through a canvas, so oklch and color-mix resolve too.
  const ctx = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d', { willReadFrequently: true });
  const rgba = (c) => {
    if (!c || c === 'transparent') return [0, 0, 0, 0];
    ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000'; ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return [r, g, b, a / 255];
  };
  const lum = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
    .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  const blend = (top, under) => { const a = top[3]; return [0, 1, 2].map((i) => top[i] * a + under[i] * (1 - a)).concat(1); };
  // The background under an element: blended up the tree; null when an image or gradient is in the way.
  const background = (el) => {
    const layers = [];
    for (let e = el; e; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.backgroundImage && s.backgroundImage !== 'none') return null;
      const c = rgba(s.backgroundColor);
      if (c[3] > 0) layers.push(c);
      if (c[3] >= 1) break;
    }
    return layers.reverse().reduce((under, top) => blend(top, under), [255, 255, 255, 1]);
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

  const out = { url: location.href, width: vw, theme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark (system)' : 'light (system)',
    overflow: null, clipped: [], smallTargets: [], unnamed: [], unlabelled: [], contrast: [], contrastUnverified: [], headings: [], imagesNoAlt: [], census: {} };

  // 1. The page scrolls sideways, and who sticks out (WCAG 1.4.10).
  const all = [...document.body.querySelectorAll('*')].filter(visible);
  const wider = document.documentElement.scrollWidth > vw + 1;
  // The outermost elements that stick out: their parent still fits.
  const sticking = all.filter((el) => el.getBoundingClientRect().right > vw + 1
    && !(el.parentElement && el.parentElement !== document.body && el.parentElement.getBoundingClientRect().right > vw + 1));
  out.overflow = { pageScrollsSideways: wider, scrollWidth: document.documentElement.scrollWidth, elements: sticking.slice(0, MAX).map((el) => ({ el: sel(el), right: Math.round(el.getBoundingClientRect().right) })) };

  // 2. Text cut by its box, with no way to read the rest.
  for (const el of all) {
    const s = getComputedStyle(el);
    if (!/(hidden|clip)/.test(s.overflow + s.overflowX + s.overflowY) || !text(el)) continue;
    const cutX = el.scrollWidth > el.clientWidth + 1, cutY = el.scrollHeight > el.clientHeight + 1;
    if (!cutX && !cutY) continue;
    const full = el.getAttribute('title') || el.getAttribute('aria-label') || el.closest('[title]');
    out.clipped.push({ el: sel(el), text: text(el), ellipsis: s.textOverflow === 'ellipsis', fullTextReachable: Boolean(full) });
  }

  // 3. Targets under 24 × 24 px, except links inside a sentence (WCAG 2.5.8).
  const interactive = all.filter((el) => el.matches('a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=checkbox], [role=radio], [role=switch], [role=tab], [role=menuitem], [tabindex]:not([tabindex="-1"])'));
  for (const el of interactive) {
    const r = el.getBoundingClientRect();
    if (r.width >= 24 && r.height >= 24) continue;
    const inline = el.tagName === 'A' && el.parentElement && /^(P|LI|SPAN|TD|DD|LABEL)$/.test(el.parentElement.tagName) && text(el.parentElement).length > text(el).length + 10;
    if (!inline) out.smallTargets.push({ el: sel(el), size: `${Math.round(r.width)}×${Math.round(r.height)}`, name: text(el) || el.getAttribute('aria-label') || '' });
  }

  // 4. Controls with no accessible name, fields with no label (WCAG 4.1.2, 1.3.1).
  const named = (el) => {
    if ((el.getAttribute('aria-label') || '').trim()) return true;
    const by = el.getAttribute('aria-labelledby');
    if (by && by.split(/\s+/).some((id) => (document.getElementById(id)?.textContent || '').trim())) return true;
    if ((el.getAttribute('title') || '').trim()) return true;
    if (el.labels && [...el.labels].some((l) => text(l))) return true;
    if (el.matches('input[type=submit], input[type=button], input[type=reset]') && el.value) return true;
    if (el.matches('input, select, textarea')) return false;
    if (text(el)) return true;
    return [...el.querySelectorAll('img[alt], svg title, [aria-label]')].some((n) => (n.getAttribute('alt') || n.textContent || n.getAttribute('aria-label') || '').trim());
  };
  for (const el of interactive) {
    if (named(el)) continue;
    (el.matches('input, select, textarea') ? out.unlabelled : out.unnamed).push({ el: sel(el), tag: el.tagName.toLowerCase(), placeholder: el.getAttribute('placeholder') || undefined });
  }

  // 5. Text contrast against what is under it (WCAG 1.4.3), one row per color pair.
  const pairs = new Map();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
  const seen = new Set();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement;
    if (!el || seen.has(el) || !visible(el) || el.closest('[aria-hidden="true"], [disabled], [aria-disabled="true"]')) continue;
    seen.add(el);
    const s = getComputedStyle(el);
    const size = parseFloat(s.fontSize), bold = Number(s.fontWeight) >= 700;
    const large = size >= 24 || (bold && size >= 18.66);
    const bg = background(el);
    if (!bg) { if (out.contrastUnverified.length < MAX) out.contrastUnverified.push({ el: sel(el), text: text(el), why: 'image or gradient behind it' }); continue; }
    const fg = blend(rgba(s.color), bg);
    const r = ratio(fg, bg), need = large ? 3 : 4.5;
    if (r >= need) continue;
    const key = `${s.color}|${fg.slice(0, 3)}|${bg.slice(0, 3)}|${need}`;
    const e = pairs.get(key) ?? { color: s.color, background: `rgb(${bg.slice(0, 3).map(Math.round).join(', ')})`, ratio: Math.round(r * 100) / 100, needs: need, count: 0, example: sel(el), text: text(el) };
    e.count++; pairs.set(key, e);
  }
  out.contrast = [...pairs.values()].sort((a, b) => a.ratio - b.ratio).slice(0, MAX);

  // 6. Headings out of order, more than one h1, images with no alt (WCAG 1.3.1, 1.1.1).
  let last = 0, h1 = 0;
  for (const h of document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role=heading]')) {
    if (!visible(h)) continue;
    const level = Number(h.getAttribute('aria-level')) || Number(h.tagName[1]) || 2;
    if (level === 1) h1++;
    if (last && level > last + 1) out.headings.push({ el: sel(h), text: text(h), problem: `h${last} then h${level}` });
    last = level;
  }
  if (h1 !== 1) out.headings.unshift({ problem: `${h1} h1 on the page` });
  if (!document.documentElement.lang) out.headings.unshift({ problem: 'no lang on <html>' });
  out.imagesNoAlt = [...document.images].filter((i) => visible(i) && !i.hasAttribute('alt') && !i.closest('[aria-hidden="true"]')).slice(0, MAX).map((i) => ({ el: sel(i), src: i.currentSrc.slice(-60) }));

  // 7. What is in use: compare it with the tokens.
  const count = (map, k) => map.set(k, (map.get(k) || 0) + 1);
  const fs = new Map(), colors = new Map(), bgs = new Map(), fams = new Map(), radii = new Map();
  for (const el of all) {
    const s = getComputedStyle(el);
    if (text(el) && [...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())) { count(fs, s.fontSize); count(colors, s.color); count(fams, s.fontFamily.split(',')[0].trim()); }
    if (rgba(s.backgroundColor)[3] > 0) count(bgs, s.backgroundColor);
    if (s.borderRadius !== '0px') count(radii, s.borderRadius);
  }
  const list = (m) => [...m].sort((a, b) => b[1] - a[1]).map(([v, n]) => `${v} ×${n}`);
  out.census = { fontSizes: list(fs), textColors: list(colors), backgrounds: list(bgs), fontFamilies: list(fams), radii: list(radii) };

  // 8. Layout shifts since the page loaded, not caused by input (CLS; a skeleton that does not match).
  const shifts = await new Promise((resolve) => {
    if (!('PerformanceObserver' in window) || !PerformanceObserver.supportedEntryTypes?.includes('layout-shift')) return resolve(null);
    const got = [];
    const po = new PerformanceObserver((list) => got.push(...list.getEntries()));
    po.observe({ type: 'layout-shift', buffered: true });
    setTimeout(() => { po.disconnect(); resolve(got); }, 150);
  });
  if (shifts === null) out.layoutShift = { unverified: 'this browser does not report layout shifts' };
  else {
    const counted = shifts.filter((e) => !e.hadRecentInput);
    const moved = new Map();
    for (const e of counted) for (const s of e.sources || []) {
      if (!s.node || s.node.nodeType !== 1) continue;
      const k = sel(s.node), m = moved.get(k) ?? { el: k, times: 0, maxDy: 0 };
      m.times++; m.maxDy = Math.max(m.maxDy, Math.round(Math.abs(s.currentRect.y - s.previousRect.y)));
      moved.set(k, m);
    }
    out.layoutShift = { total: Math.round(counted.reduce((t, e) => t + e.value, 0) * 1000) / 1000, shifts: counted.length,
      moved: [...moved.values()].sort((a, b) => b.maxDy - a.maxDy).slice(0, MAX) };
  }

  out.summary = { layoutShift: out.layoutShift.total ?? 'unverified', pageScrollsSideways: wider, clipped: out.clipped.length, clippedUnreachable: out.clipped.filter((c) => !c.fullTextReachable).length,
    smallTargets: out.smallTargets.length, unnamed: out.unnamed.length, unlabelled: out.unlabelled.length, contrastPairsFailing: out.contrast.length,
    contrastUnverified: out.contrastUnverified.length, headingProblems: out.headings.length, imagesNoAlt: out.imagesNoAlt.length, distinctFontSizes: fs.size };
  return JSON.stringify(out, null, 2);
})();
