// @openpedd/reader: one reading of a spec, shared by the CLI, `npm run view` and OpenPEDD Cloud (ARCH-20).
// Every function works on the files the caller hands it, as path → text; none reads a disk except
// `renderMap` and `renderViews`, which read the pages shipped inside this package (and ELK, its dependency).
export { readSpec, readHistory, comparePaths, REQUIREMENT_STATUSES, leastAdvanced } from './spec.mjs';
export { readBusinessMap, PROCESS_MARKS } from './business-map.mjs';
export { readDefinition, writeDefinition, DEFINITION_STATUSES, ITEM_STATES } from './definition.mjs';
export { nextChangeId, changeIds } from './changes.mjs';
export { mapData, renderMap } from './map.mjs';
export { viewData, renderViews, toMermaid, scopeView, firstView, KINDS, VIEWS_FORMAT } from './views/index.mjs';
export * as markdown from './markdown.mjs';
export const VERSION = '0.4.0';
