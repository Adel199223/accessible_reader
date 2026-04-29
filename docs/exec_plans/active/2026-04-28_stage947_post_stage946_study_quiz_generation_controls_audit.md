# Stage 947 - Post-Stage-946 Study Quiz Generation Controls Audit

## Status

Complete.

## Intent

Audit that local typed Study generation works from global Study and Source overview while preserving the completed Stage 944/945 seven-type manual question baseline and broader Recall regression surfaces.

## Scope

- Confirm Study exposes compact generation controls for all seven question types.
- Confirm selected generated types are sent to the backend and by-type generation summaries appear.
- Confirm source-scoped Study and Source overview generate only source-owned questions.
- Confirm generated choice, fill-in-the-blank, matching, ordering, true/false, short-answer, and flashcard cards render through existing Questions and Review flows.
- Confirm manual, edited, deleted, and unrequested generated cards survive generation.
- Retain Home review discovery, Source overview memory/review/search, Reader, Notebook, Graph, Add Content, backend graph/notes/study contracts, cleanup dry-run, and `notesSidebarVisible: false`.

## Evidence Metrics

- `studyQuizGenerationControlsVisible`
- `studyQuizGenerationSelectedTypesPayload`
- `studyQuizGenerationSourceScopedPayload`
- `studyQuizGenerationByTypeSummary`
- `studyGeneratedTypedReviewControls`
- `sourceOverviewGenerateQuestionsAction`
- retained `studyMatchingQuestionCreates`
- retained `studyOrderingQuestionCreates`
- retained `studyFillBlankCreatesVisibleQuestion`
- retained `studyChoiceQuestionMultipleChoiceCreates`
- retained `studyQuestionSchedulingRowActionWorks`
- retained `studyMemoryProgressPanelVisible`
- retained cleanup dry-run `matchedCount: 0`
- retained `notesSidebarVisible: false`

## Validation Plan

- Run Stage 947 browser audit after Stage 946 passes.
- Run targeted and broad frontend/backend checks, cleanup dry-run, and `git diff --check`.
- Update roadmap and assistant anchors after validation records Stage 947 as the completed audit gate.

## Validation Results

- Backend audit coverage confirmed no-body compatibility, source-scoped generation, selected generated types, `max_per_source`, generated structured payloads, search serialization, and preservation of manual, edited, deleted, and unrequested cards.
- Frontend audit coverage confirmed compact generation controls, selected type request bodies, Source overview source-scoped generation, by-type result summaries, and generated typed payload fallback into existing Review controls.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k "generation_controls_scope_types_and_payloads" -q'` passed with `1 passed`.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k "study" -q'` passed with `11 passed`.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k "graph or note or study" -q'` passed with `29 passed`.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm exec tsc -- -b --pretty false'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/App.test.tsx -t "Study quiz generation controls|Source overview can generate source-scoped Study questions|Recall Study Questions view"'` passed with `3 passed`.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/App.test.tsx'` passed with `143 passed`.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run build'` passed with the existing Vite chunk-size warning.
- Live browser smoke confirmed `studyQuizGenerationControlsVisible: true`, selected type payload support, and `studyQuizGenerationByTypeSummary: true`; generated typed Review controls are covered by the App test fixture.
- Cleanup dry-run returned `matchedCount: 0` and `searchFailures: []`.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && git diff --check'` passed with line-ending warnings only.
