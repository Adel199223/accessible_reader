# Stage 907 - Post-Stage-906 Source Memory Stack And Reader-Led Memory Handoffs Audit

## Status

Complete.

## Intent

Stage 907 audits that Stage 906 source-memory stack behavior remains stable across the broader Recall workspace. It keeps Home, Notebook, Graph, Study, Reader generated outputs, Add Content, backend graph/notes APIs, and cleanup hygiene as regression surfaces while confirming source-local personal notes, graph nodes, and study cards remain first-class memory objects.

## Scope

- Re-run Source overview memory-stack evidence and Reader-led count handoff checks.
- Confirm personal-note source memory still hides synthetic source anchors and source-note Reader handoff remains unanchored.
- Confirm graph memory items open focused Graph and study memory items open focused Study.
- Retain Stage 905 cleanup hygiene: any current-run harness notes are tracked and deleted, and historical audit-artifact dry-run remains empty.
- Preserve Home Personal notes lane/board/search, Notebook source/sentence semantics, Graph/Study source-note evidence, Reader generated-output freeze, and Add Content route stability.

## Evidence Metrics

- `sourceOverviewMemoryStackVisible`
- `sourceOverviewMemoryStackIncludesPersonalNotes`
- `sourceOverviewMemoryStackIncludesGraphItems`
- `sourceOverviewMemoryStackIncludesStudyItems`
- `sourceOverviewGraphMemoryItemOpensFocusedGraph`
- `sourceOverviewStudyMemoryItemOpensFocusedStudy`
- `sourceOverviewSourceNoteReaderHandoffUnanchored`
- `readerSourceMemoryCountsActionable`
- `readerSourceGraphCountOpensFocusedGraph`
- `readerSourceStudyCountOpensFocusedStudy`
- retained Stage 905 cleanup and absence metrics
- retained Stage 901/899/897/893 regression metrics
- retained `notesSidebarVisible: false`

## Evidence Captured

- Live Stage 907 audit retained `sourceOverviewMemoryStackVisible: true`, graph/study memory inclusion, focused Graph/Study handoffs, and actionable Reader source memory counts.
- Retained source-note Reader handoff and cleanup hygiene with `sourceOverviewSourceNoteReaderHandoffUnanchored: true`, `stageHarnessCreatedNotesCleanedUp: true`, and `stageHarnessCreatedNoteCleanupFailures: []`.
- Cleanup dry-run after Stage 907 matched `0` historical audit artifacts.
- Broad regression captures retained Home personal notes, Notebook source/sentence semantics, Graph/Study promotion evidence, Add Content/Home/Reader/Graph/Study surfaces, and `notesSidebarVisible: false`.
- Evidence JSON: `output/playwright/stage907-post-stage906-source-memory-stack-and-reader-led-memory-handoffs-audit-validation.json`.

## Validation Plan

- `node scripts/playwright/stage907_post_stage906_source_memory_stack_and_reader_led_memory_handoffs_audit.mjs`
- targeted App Vitest, frontend build, backend graph/notes pytest
- `node --check` for shared Notebook/Home harnesses and Stage 906/907 scripts
- cleanup utility dry-run remains `matchedCount: 0`
- `git diff --check`
