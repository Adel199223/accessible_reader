# Stage 946 - Study Quiz Generation Controls After Stage 945

## Status

Complete.

## Intent

Turn Study's blind generated-card refresh into a Recall-style local quiz generation workbench that can generate the seven supported Study question types with source-aware controls.

## Scope

- Extend `POST /api/recall/study/cards/generate` with optional `source_document_id`, selected `question_types`, and bounded `max_per_source` controls while keeping no-body calls compatible.
- Replace generated `relation` / `cloze` cards with deterministic generated `short_answer`, `flashcard`, `multiple_choice`, `true_false`, `fill_in_blank`, `matching`, and `ordering` cards.
- Store generated structured payloads in `scheduling_state_json.generated_question_payload` while preserving `manual_question_payload` for manual cards.
- Preserve manual cards, manually edited generated cards, soft-deleted cards, and generated cards outside the requested source/type scope.
- Add compact Study generation controls and a Source overview `Generate source questions` action.
- Keep the work local-first; do not add AI generation, shared challenges, timers, hints, explanations, persisted attempt analytics, schema migrations, Edge extension changes, or Reader generated-output changes.

## Evidence Metrics

- `studyQuizGenerationControlsVisible`
- `studyQuizGenerationSelectedTypesPayload`
- `studyQuizGenerationSourceScopedPayload`
- `studyQuizGenerationByTypeSummary`
- `studyGeneratedTypedReviewControls`
- `sourceOverviewGenerateQuestionsAction`
- retained Stage 944/945 matching/ordering metrics
- retained Study management, schedule, review-history, progress, memory progress, collection subset, Home review, Source overview, Reader, Notebook, Graph, Add Content, cleanup dry-run, and `notesSidebarVisible: false`

## Validation Plan

- Backend pytest for request defaults, selected-type generation, source-scoped generation, max-per-source bounding, generated typed payload serialization/search, and preservation of manual/edited/deleted/unrequested cards.
- Frontend App tests for generation controls, selected type payloads, source-scoped generation, by-type result summary, and generated typed review controls.
- Run targeted backend and frontend tests, frontend typecheck/build, broad Study/graph/note backend tests, cleanup dry-run, and `git diff --check`.

## Validation Results

- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && uv run python -m compileall app >/tmp/stage946_compile.log && tail -n 20 /tmp/stage946_compile.log'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k "generation_controls_scope_types_and_payloads" -q'` passed with `1 passed`.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k "study" -q'` passed with `11 passed`.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k "graph or note or study" -q'` passed with `29 passed`.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm exec tsc -- -b --pretty false'`
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/App.test.tsx -t "Study quiz generation controls|Source overview can generate source-scoped Study questions|Recall Study Questions view"'` passed with `3 passed`.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/App.test.tsx'` passed with `143 passed`.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader/frontend && npm run build'` passed with the existing Vite chunk-size warning.
- Live browser smoke against `http://127.0.0.1:8000/recall?section=study` confirmed `studyQuizGenerationControlsVisible: true`, selected type payload support, and `studyQuizGenerationByTypeSummary: true`.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && node scripts/playwright/cleanup_recall_note_audit_artifacts.mjs --base-url=http://127.0.0.1:8000'` returned `matchedCount: 0` and `searchFailures: []`.
- `wsl.exe bash -lc 'cd /home/fa507/dev/accessible_reader && git diff --check'` passed with line-ending warnings only.
