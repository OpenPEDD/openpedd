// The project template (template/) against this repo: the check scripts it ships are the same files
// as ours, and each guide it copies names a source that exists, at the version it was copied from.
//
// A guide's frontmatter says `source: <path>` or `source: <path>@<version>`. With a version, the
// check fails when the source has moved on: update the guide, then its version here.
//
//   node scripts/check-template.mjs
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, green, read, red, specFiles } from './lib.mjs';

const SCRIPTS = ['check-links.mjs', 'check-size.mjs', 'lib.mjs'];
const versionOf = (text) => text.match(/^---\n[\s\S]*?^version:\s*"?([^"\n]+)"?\s*$/m)?.[1];

let failed = 0;
const fail = (msg) => { failed++; console.log(red(`✗ ${msg}`)); };

for (const name of SCRIPTS) {
  const copy = join(ROOT, 'template/scripts', name);
  if (!existsSync(copy)) fail(`template/scripts/${name}: missing`);
  else if (readFileSync(copy, 'utf8') !== read(`scripts/${name}`)) fail(`template/scripts/${name}: differs from scripts/${name}`);
}

for (const path of specFiles().filter((p) => p.startsWith('template/'))) {
  const source = read(path).match(/^---\n[\s\S]*?^source:\s*(\S+)\s*$/m)?.[1];
  if (!source) continue;
  const [file, version] = source.split('@');
  if (!existsSync(join(ROOT, file))) { fail(`${path}: source ${file} not found`); continue; }
  const now = versionOf(read(file));
  if (version && now !== version) fail(`${path}: copied from ${file}@${version}, which is now ${now}`);
}

console.log(failed ? red(`${failed} template problem(s).`) : green('✓ The template matches its sources.'));
process.exit(failed ? 1 : 0);
