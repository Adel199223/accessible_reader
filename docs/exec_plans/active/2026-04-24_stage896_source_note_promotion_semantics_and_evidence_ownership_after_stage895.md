# Stage 896 - Source Note Promotion Semantics And Evidence Ownership After Stage 895

## Summary

Stage 894/895 made source-attached Notebook notes visible as first-class personal-note items in Home/Library and search. Stage 896 carries that ownership into Graph and Study promotion: source-attached notes should promote as note-owned memory objects with body/source context evidence, not as sentence-highlight artifacts or synthetic `Source note for...` anchors.

This is a scoped promotion-semantics pass. It must not add standalone global notes, AI note generation, block editing, cloud/import changes, backend migrations, or broad API/schema churn.

## Scope

- Source-attached Notebook note promotion defaults for Graph and Study.
- Promoted source-note evidence values in backend graph mentions and Study `manual_note` source spans.
- Graph and Study UI presentation/handoffs for source-note evidence.
- Stage 894/895 Home personal-note lane/search, Stage 892/893 Notebook source context, Stage 890/891 new-note draft flow, Reader generated outputs, Add Content, Graph, Study, and backend graph APIs as regression surfaces.

## Key Changes

- Source-note promotion defaults:
  - Graph label defaults to the first meaningful note-body line/sentence, clipped for a concise label.
  - Graph description defaults to the full note body.
  - Study prompt defaults to `What should you remember from this source note?`.
  - Study answer defaults to the full note body.
  - Empty source-note bodies fall back to `<source title> personal note`.
  - Sentence notes keep the current anchor-text/body promotion defaults.

- Promoted source-note evidence semantics:
  - Graph manual-note mentions use source-note body/source title evidence instead of synthetic source anchor/excerpt text.
  - Study `manual_note` source spans keep `anchor_kind: "source"` and use body/source context evidence.
  - Reader handoff from source-note Study evidence opens the source without sentence anchors.
  - Stored note `anchor_text` / `excerpt_text` may remain synthetic for compatibility, but promoted Graph/Study surfaces should not display them as highlighted passage evidence.

- Graph and Study display:
  - Promoted source-note evidence says `Source note` / `Personal note`.
  - Evidence previews use note body/source-owned context.
  - Notebook is the primary handoff when a note id is present; Reader remains available and unanchored for source notes.
  - Sentence-derived cards/nodes keep excerpt/highlight wording and anchored Reader reopening.

## Interfaces / Compatibility

- No new backend routes.
- No storage migration.
- Promotion request payloads remain unchanged.
- A narrow backwards-compatible response enrichment may expose optional manual-note metadata already stored on Graph mentions so the frontend can render note-owned evidence and Notebook handoff correctly.

## Evidence Targets

- `notebookSourceNoteGraphDefaultUsesBody`
- `notebookSourceNoteStudyDefaultUsesBody`
- `sourceNotePromotionSyntheticAnchorHidden`
- `graphSourceNoteEvidenceUsesBodyPreview`
- `studySourceNoteEvidenceUsesBodyPreview`
- `studySourceNoteReaderHandoffUnanchored`
- `sentenceNotePromotionDefaultsStable`
- Stage 894/895 Home personal-note metrics
- Stage 892/893 Notebook source/sentence metrics
- `notesSidebarVisible`

## Test Plan

- Extend `frontend/src/App.test.tsx` for:
  - Source-note Graph defaults use note body/source context and hide synthetic anchor text.
  - Source-note Study defaults use the source-note prompt/body answer.
  - Graph and Study displays for promoted source notes say `Source note` / `Personal note`.
  - Source-note Study Reader handoff is unanchored.
  - Sentence-note Graph/Study defaults and anchored Reader reopening stay stable.
  - Home personal-note lane/search and embedded Notebook reopen stay stable.

- Extend backend graph/API pytest for:
  - Promoted source-note graph mention metadata uses body/source context evidence.
  - Promoted source-note Study `manual_note` source spans use source-note body/source context and retain `anchor_kind: "source"`.
  - Sentence-note promotion evidence remains excerpt/anchor based.

- Playwright evidence:
  - Add Stage 896 implementation and Stage 897 audit scripts.
  - Record the Stage 896/897 metrics plus retained Stage 894/895 and Stage 892/893 metrics.

- Standard validation:
  - Targeted App Vitest for Notebook/Graph/Study promotion flows.
  - `npm run build`.
  - `cd backend && uv run pytest tests/test_api.py -k graph -q`.
  - `node --check` on shared Notebook/Home harnesses plus Stage 896/897 scripts.
  - Live Stage 896/897 browser runs against `http://127.0.0.1:8000`.
  - `git diff --check`.

## Assumptions

- "First-class source notes" now includes promotion into Graph and Study, not only Home/Notebook/search visibility.
- Promotion remains user-confirmed/editable, not automatic graph extraction or AI card generation.
- Compatibility storage can keep synthetic source-anchor strings, but user-facing Graph/Study evidence should use note body/source-owned context.

## Implementation Notes

- Source-note Graph promotion defaults now derive the label from the first meaningful note-body sentence/line and the description from the full note body, falling back to `<source title> personal note` for empty source notes.
- Source-note Study promotion defaults now use `What should you remember from this source note?` plus the full note body/fallback answer.
- Backend manual-note promotion metadata now carries source-aware `anchor_kind`, `note_id`, `note_body`, `note_anchor_text`, and source-title evidence values while keeping existing promotion endpoints and payloads.
- Graph and Study evidence surfaces now show source-note body previews, `Source note` / `Personal note` language, Notebook-first note handoff when a note id is present, and unanchored Reader handoff for source-note spans.
- Sentence-note promotion defaults and highlighted-passage evidence remain anchored/excerpt based.

## Validation Results

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx -t \"Notebook\""`: passed, 11 Notebook tests.
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`: passed.
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`: passed, 1 graph test.
- `node --check scripts/playwright/notebook_workbench_shared.mjs`: passed.
- `node --check scripts/playwright/stage896_source_note_promotion_semantics_and_evidence_ownership_after_stage895.mjs`: passed.
- `node --check scripts/playwright/stage897_post_stage896_source_note_promotion_semantics_and_evidence_ownership_audit.mjs`: passed.
- `node scripts/playwright/stage896_source_note_promotion_semantics_and_evidence_ownership_after_stage895.mjs`: passed against `http://127.0.0.1:8000`.
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`: passed.

## Evidence Results

- Stage 896 live evidence: `notebookSourceNoteGraphDefaultUsesBody: true`, `notebookSourceNoteStudyDefaultUsesBody: true`, `sourceNotePromotionSyntheticAnchorHidden: true`, `graphSourceNoteEvidenceUsesBodyPreview: true`, `studySourceNoteEvidenceUsesBodyPreview: true`, `studySourceNoteReaderHandoffUnanchored: true`, `sentenceNotePromotionDefaultsStable: true`.
- Retained Stage 894/895 and Stage 892/893 metrics remained green: `homePersonalNoteLaneVisible: true`, `homeNewNoteSavedAppearsInLibrary: true`, `homePersonalNoteUsesBodyPreview: true`, `homePersonalNoteSyntheticAnchorHidden: true`, `homePersonalNoteOpensEmbeddedNotebook: true`, `homePersonalNoteSearchResultVisible: true`, `workspaceSearchSourceNoteReaderHandoffUnanchored: true`, `notebookSourceAnchorContextPanelVisible: true`, `notebookSentenceAnchorHighlightPanelStable: true`.
