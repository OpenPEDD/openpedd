// The names of work branches (ARCH-06): each kind's pattern from `branches` in workspace.yaml, filled
// to cut a branch and read back to check one.

/** The prefix of a change branch by track (ARCH-06): `feat/` while the track is unknown. */
export const TRACK_PREFIX = { full: 'feat', story: 'feat', fix: 'fix', chore: 'chore' };
export const PREFIXES = [...new Set(Object.values(TRACK_PREFIX))];

/** What each placeholder may hold. */
const PART = {
  prefix: `(?:${PREFIXES.join('|')})`,
  slug: '[a-z0-9]+(?:-[a-z0-9]+)*',
  change: 'CHG-\\d+',
  n: '\\d+',
};

/** The kinds in the order a name is read: the most specific first. */
export const KINDS = ['edit', 'design', 'architecture', 'implementation', 'hotfix', 'change'];

const escape = (s) => s.replace(/[.*+?^$()|[\]\\]/g, '\\$&');

/** The regular expression of a pattern, with one named group per placeholder. */
export function patternRegex(pattern) {
  const src = pattern.split(/(\{\w+\})/).map((part) => {
    const k = part.match(/^\{(\w+)\}$/)?.[1];
    if (!k) return escape(part);
    if (!PART[k]) throw new Error(`branches: unknown placeholder {${k}} in "${pattern}"`);
    return `(?<${k}>${PART[k]})`;
  }).join('');
  return new RegExp(`^${src}$`);
}

/** A name from a pattern. Every placeholder must be given and valid. */
export function formatName(pattern, values) {
  const name = pattern.replace(/\{(\w+)\}/g, (_, k) => {
    if (values[k] == null || values[k] === '') throw new Error(`branches: "${pattern}" needs {${k}}`);
    return String(values[k]);
  });
  if (!patternRegex(pattern).test(name)) throw new Error(`"${name}" is not a valid ${pattern} name: a slug is lowercase words joined by hyphens`);
  return name;
}

/**
 * What a branch name is: { kind, ...placeholders }, or null when it is no work branch. A task's short
 * branch (`impl/{slug}--{task}`, ARCH-06) is no work branch: it never opens a PR.
 */
export function parseName(name, branches) {
  for (const kind of KINDS) {
    const m = name.match(patternRegex(branches[kind]));
    if (m) return { kind, ...m.groups };
  }
  return null;
}

/** A slug from free text: `Automations for jobs` → `automations-for-jobs`. */
export const slugify = (s) => String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
