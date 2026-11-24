// @openpedd/reader: one reading of a spec, shared by the CLI, `npm run view` and OpenPEDD Cloud (ARCH-20).
// Every function works on the files the caller hands it, as path → text; none reads a disk except
// `renderMap` and `renderViews`, which read the pages shipped inside this package (and ELK, its dependency).
export { readSpec, readHistory, comparePaths, REQUIREMENT_STATUSES, leastAdvanced } from './spec.mjs';
export { readBusinessMap, PROCESS_MARKS, USE_CASE_KINDS } from './business-map.mjs';
export { readDefinition, writeDefinition, DEFINITION_STATUSES, ITEM_STATES } from './definition.mjs';
export { nextChangeId, changeIds } from './changes.mjs';
export { mapData, renderMap } from './map.mjs';
export { viewData, renderViews, toMermaid, scopeView, firstView, KINDS, VIEWS_FORMAT } from './views/index.mjs';
export { diffViews } from './views/diff.mjs';
export { weigh, weighChange, deltaOf, WEIGHTS, SIGNALS, FAN_OUT_THRESHOLD } from './weight.mjs';
export { SWEEP_STAGES, FINDERS, stagesAhead, normalizeQuestion, questionProblems, mergeQuestions, isAsked, renderSheet, parseReply, whereItGoes, applyReply, applyAnswers, rewriteReopened, answersSoFar, decideByAi, pendingFor, ANSWERER, ANSWERER_LABEL } from './sweep.mjs';
export { changeDeltas, readSpecSection, checkTaskPr, checkChecklist, checkReport, checkDecisions } from './records.mjs';
export * as markdown from './markdown.mjs';
export const VERSION = '0.11.0';
