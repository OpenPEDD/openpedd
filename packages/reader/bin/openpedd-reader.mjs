#!/usr/bin/env node
// openpedd-reader: the reader from a shell, on a folder read as text.
//
//   openpedd-reader map  [root] [--built YYYY-MM-DD]   → the framework map's data, as JSON
//   openpedd-reader html [root] [--built YYYY-MM-DD]   → the framework map's page
//   openpedd-reader spec [root]                        → the model, as JSON
//   openpedd-reader next-id [root]                     → the next CHG-nnn on this tree
//   openpedd-reader version
import { resolve } from 'node:path';
import { VERSION, mapData, nextChangeId, readSpec, renderMap } from '../src/index.mjs';
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
  case 'next-id': console.log(nextChangeId(files())); break;
  case 'version': console.log(VERSION); break;
  default:
    console.error('usage: openpedd-reader map|html|spec|next-id [root] [--built YYYY-MM-DD] · version');
    process.exit(2);
}
