// workspace.yaml (ENT-16), read as the subset of YAML it is written in: `key: value`, nested blocks by
// indentation, `- item` lists, and flow `{ a: b }` / `[a, b]` values. Comments are dropped.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** The defaults of `branches` (ARCH-06, configuration). `hotfix` is the name ARCH-06 gives a hotfix. */
export const BRANCH_DEFAULTS = {
  base: 'dev',
  change: '{prefix}/{slug}',
  design: 'design/{slug}',
  architecture: 'arch/{slug}',
  implementation: 'impl/{slug}',
  edit: 'edit/{change}-{n}',
  hotfix: 'hotfix/{slug}',
};

/** A line without its comment: a `#` outside quotes that starts the line or follows a space. */
function uncomment(line) {
  let q = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === q) q = null; continue; }
    if (c === '"' || c === "'") q = c;
    else if (c === '#' && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i).trimEnd();
  }
  return line.trimEnd();
}

/** Splits a flow collection's inside at its top-level commas. */
function splitFlow(s) {
  const out = [];
  let depth = 0, q = null, cur = '';
  for (const c of s) {
    if (q) { cur += c; if (c === q) q = null; continue; }
    if (c === '"' || c === "'") q = c;
    if (c === '{' || c === '[') depth++;
    if (c === '}' || c === ']') depth--;
    if (c === ',' && depth === 0) { out.push(cur); cur = ''; continue; }
    cur += c;
  }
  if (cur.trim()) out.push(cur);
  return out.map((x) => x.trim()).filter((x) => x !== '');
}

/** One scalar or flow value. */
export function value(raw) {
  const s = raw.trim();
  if (s === '') return null;
  if (s.startsWith('{') && s.endsWith('}')) {
    return Object.fromEntries(splitFlow(s.slice(1, -1)).map((kv) => {
      const at = kv.indexOf(':');
      return [kv.slice(0, at).trim(), value(kv.slice(at + 1))];
    }));
  }
  if (s.startsWith('[') && s.endsWith(']')) return splitFlow(s.slice(1, -1)).map(value);
  const q = s.match(/^"(.*)"$/) || s.match(/^'(.*)'$/);
  if (q) return q[1];
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return s;
}

/** The YAML subset of workspace.yaml, as plain data. */
export function parseYaml(text) {
  const lines = (text || '').split('\n').map(uncomment).filter((l) => l.trim() !== '' && l.trim() !== '---');
  let i = 0;
  const indent = (l) => l.match(/^ */)[0].length;
  function block(level) {
    const first = lines[i];
    if (first.trim().startsWith('- ')) {
      const list = [];
      while (i < lines.length && indent(lines[i]) === level && lines[i].trim().startsWith('- ')) {
        list.push(value(lines[i].trim().slice(2)));
        i++;
      }
      return list;
    }
    const obj = {};
    while (i < lines.length && indent(lines[i]) === level) {
      const m = lines[i].trim().match(/^([^:]+):(?:\s+(.*))?$/);
      i++;
      if (!m) continue;
      const key = m[1].trim().replace(/^["']|["']$/g, '');
      if (m[2] !== undefined && m[2].trim() !== '') obj[key] = value(m[2]);
      else if (i < lines.length && (indent(lines[i]) > level || (indent(lines[i]) === level && lines[i].trim().startsWith('- ')))) obj[key] = block(indent(lines[i]));
      else obj[key] = null;
    }
    return obj;
  }
  return lines.length ? block(indent(lines[0])) : {};
}

/**
 * The workspace of a repository: workspace.yaml at its root, with the branch names filled from the
 * defaults, the spec's folder and the production branch (the environment marked `public`, ARCH-08).
 */
export function readWorkspace(root) {
  const path = join(root, 'workspace.yaml');
  const data = existsSync(path) ? parseYaml(readFileSync(path, 'utf8')) : {};
  const envs = Array.isArray(data.environments) ? data.environments : [];
  const pub = envs.find((e) => e && e.public === true) || envs[envs.length - 1];
  return {
    data,
    found: existsSync(path),
    spec: data.paths?.spec || 'spec',
    branches: { ...BRANCH_DEFAULTS, ...(data.branches || {}) },
    production: pub?.branch || 'main',
    budgets: data.budgets || {},
  };
}
