#!/usr/bin/env node
// openpedd-reader: the reader from a shell, on a folder read as text.
//
//   openpedd-reader map  [root] [--built YYYY-MM-DD]   → the framework map's data, as JSON
//   openpedd-reader html [root] [--built YYYY-MM-DD]   → the framework map's page
//   openpedd-reader spec [root]                        → the model, as JSON
//   openpedd-reader business-map [root]                → the Business Map, as JSON (null when absent)
//   openpedd-reader problems [root]                    → what cannot be read: broken frontmatter, history lines; exits 1 when any
//   openpedd-reader next-id [root]                     → the next CHG-nnn on this tree
//   openpedd-reader views [root]                       → views.json from the spec alone (pedd view adds the rest)
//   openpedd-reader views-html [root]                  → its page
//   openpedd-reader version
import { resolve } from 'node:path';
import { VERSION, mapData, nextChangeId, readSpec, renderMap, renderViews, viewData } from '../src/index.mjs';
import { readFiles } from '../src/files.mjs';

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
const built = flag('--built');
const [command, root = '.'] = args;
const opts = built ? { built } : {};
const files = () => readFiles(resolve(root));

switch (command) {
  case 'map': process.stdout.write(JSON.stringify(mapData(readSpec(files()), opts))); break;
  case 'html': process.stdout.write(renderMap(readSpec(files()), opts)); break;
  case 'spec': process.stdout.write(JSON.stringify(readSpec(files()))); break;
  case 'business-map': process.stdout.write(JSON.stringify(readSpec(files()).businessMap)); break;
  case 'problems': {
    const { problems } = readSpec(files());
    for (const p of problems) console.log(`${p.path}:${p.line}: ${p.kind}: ${p.message}`);
    process.exitCode = problems.length ? 1 : 0;
    break;
  }
  case 'next-id': console.log(nextChangeId(files())); break;
  case 'views': process.stdout.write(JSON.stringify(viewData(readSpec(files())))); break;
  case 'views-html': process.stdout.write(renderViews(viewData(readSpec(files())))); break;
  case 'version': console.log(VERSION); break;
  default:
    console.error('usage: openpedd-reader map|html|spec|business-map|problems|next-id|views|views-html [root] [--built YYYY-MM-DD] · version');
    process.exit(2);
}
