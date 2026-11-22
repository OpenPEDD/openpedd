// nextChangeId: the next `CHG-nnn` (ARCH-21, numbering).
//
// The highest ID found, plus one. What counts as found:
//   - a path under `changes/<CHG>/` or `changes/archive/<CHG>/`, on the base or on any change branch;
//   - the `change` field of each line of `history.jsonl`;
//   - an ID given as is (`CHG-031`), such as one that clashed at the last try.
import { readHistory, toFiles } from './spec.mjs';

const ID = /^CHG-(\d+)$/;
const IN_PATH = /(?:^|\/)changes\/(?:archive\/)?(CHG-\d+)(?:\/|$)/;

/** Every change ID in one source: a files map (path → text), a history.jsonl text, a list of paths or IDs. */
export function changeIds(source) {
  const out = new Set();
  const take = (s) => {
    const id = String(s).match(ID)?.[0] || String(s).match(IN_PATH)?.[1];
    if (id) out.add(id);
  };
  if (source == null) return out;
  if (typeof source === 'string') {
    if (source.trim().startsWith('{')) for (const h of readHistory(source)) { if (h.change) take(h.change); }
    else take(source);
  } else if (Array.isArray(source) || source instanceof Set) {
    for (const s of source) for (const id of changeIds(s)) out.add(id);
  } else {
    for (const [path, text] of toFiles(source)) {
      take(path);
      if (path.endsWith('history.jsonl')) for (const h of readHistory(text)) if (h.change) take(h.change);
    }
  }
  return out;
}

/**
 * The next change ID after every one found in the sources.
 *
 *   nextChangeId(baseFiles, branchPaths, ['CHG-031'])  →  'CHG-032'
 */
export function nextChangeId(...sources) {
  let max = 0;
  for (const s of sources) for (const id of changeIds(s)) max = Math.max(max, Number(id.match(ID)[1]));
  return `CHG-${String(max + 1).padStart(3, '0')}`;
}
