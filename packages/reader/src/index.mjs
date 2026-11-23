// @openpedd/reader: one reading of a spec, shared by the CLI, `npm run view` and OpenPEDD Cloud (ARCH-20).
// Every function works on the files the caller hands it, as path → text; none reads a disk except
// `renderMap`, which reads the page template shipped inside this package.
export { readSpec, readHistory, comparePaths } from './spec.mjs';
export { readDefinition, writeDefinition, DEFINITION_STATUSES, ITEM_STATES } from './definition.mjs';
export { nextChangeId, changeIds } from './changes.mjs';
export { mapData, renderMap } from './map.mjs';
export * as markdown from './markdown.mjs';
export const VERSION = '0.2.0';
