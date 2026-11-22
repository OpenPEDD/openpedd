// Builds a local, self-contained map of the framework from the spec: the cycle, the concepts and
// the architecture, plus the gaps the spec shows about itself. The reading and the page are
// @openpedd/reader's (ARCH-20); this script only hands it the working tree and writes what it gives.
//
//   node scripts/view.mjs          → .pedd/view/index.html and .pedd/view/map.json
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { mapData, readSpec, renderMap } from '../packages/reader/src/index.mjs';
import { readFiles } from '../packages/reader/src/files.mjs';
import { ROOT, green } from './lib.mjs';

const model = readSpec(readFiles(ROOT));
const data = mapData(model);
const out = join(ROOT, '.pedd/view');
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'index.html'), renderMap(model, { data }));
// The same data as JSON, for the framework map in openpedd-cloud (apps/map); the Cloud gets it by
// running the pinned reader on its clone: `openpedd-reader map <clone>`.
writeFileSync(join(out, 'map.json'), JSON.stringify(data));
console.log(green(`✓ ${data.stages.length} stages, ${data.docs.length} documents, ${data.gaps.length} gaps → .pedd/view/index.html`));
