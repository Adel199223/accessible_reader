# Stage 789 - Post-Stage-788 Reader Source Preview Retirement Audit

## Summary

- Validate the Stage 788 Reader source-preview cleanup against the live local app on `http://127.0.0.1:8000`.
- Confirm Reader-active source strips no longer render the secondary locator or filename line, including on a live preview-backed source.
- Reconfirm Source reopening, Notebook reopening, and the wider Recall regressions in the same live browser pass.

## Checks

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx src/components/SourceWorkspaceFrame.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/reader_reading_first_hierarchy_shared.mjs scripts/playwright/stage788_reader_source_preview_retirement_after_stage787.mjs scripts/playwright/stage789_post_stage788_reader_source_preview_retirement_audit.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage788_reader_source_preview_retirement_after_stage787.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage789_post_stage788_reader_source_preview_retirement_audit.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Outcome

- The live local result is recorded in `output/playwright/stage789-post-stage788-reader-source-preview-retirement-audit-validation.json`.
- The live preview-backed Reader document resolved `previewBackedSourcePreviewReference: at_tariq_86_pronoun_research_v3.html` and `previewBackedSourceTitle: 1. Short answer` while confirming `previewBackedReaderSourcePreviewVisible: false`, `previewBackedReaderSourcePreviewText: null`, and `previewBackedReaderHasArticle: true`.
- The wider Reader and Recall regressions stayed stable with `sourceOpenReaderSourceLibraryVisible: true`, `notebookOpenWorkbenchVisible: true`, and `simplifiedViewAvailable: false`, alongside the existing compact Reader chrome.
