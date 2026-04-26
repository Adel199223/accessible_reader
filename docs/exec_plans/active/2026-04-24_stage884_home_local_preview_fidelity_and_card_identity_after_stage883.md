# ExecPlan: Stage 884 Home Local Preview Fidelity And Card Identity After Stage 883

## Summary
- Reopen `Home` intentionally from the completed Stage 882/883 Study task-workbench baseline.
- Improve the default organizer-visible Home board's first impression by giving weak local-capture cards more deterministic content-owned visual identity.
- Preserve the Stage 870/871 mixed-preview balance: Web, Documents, HTML snapshots, and image-rich cards should keep meaningful rendered previews when assets exist.

## Implementation Focus
- In `frontend/src/components/RecallWorkspace.tsx`, upgrade weak local/paste preview cards from plain text-first blocks into richer deterministic local-preview posters using existing `homePreviewContentById` content.
- Keep the change UI-only: no generated previews, no OCR, no URL refetch, no AI, and no backend/schema/storage/import-pipeline changes.
- Preserve Home density and ownership baselines: Add tile, chronology, four-across first row, shared lead band, single-row toolbar, selected-card metadata cleanup, organizer rail rhythm, hidden Home, hidden Captures, hidden Matches, and organizer-visible Matches.
- Extend Home Vitest and Playwright evidence with local-preview fidelity metrics while keeping Web/Documents rendered-preview preservation checks green.

## Validation
- targeted Home/App Vitest
- `npm run build`
- backend graph pytest
- `node --check` on the shared Home harness and Stage 884/885 scripts
- live Stage 884/885 browser runs
- `git diff --check`
