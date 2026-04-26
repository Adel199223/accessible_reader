# Stage 795 - Post-Stage-794 Reader Compact Header Lane Alignment Audit

## Summary

- Validate the Stage 794 compact-header alignment pass against the live local app on `http://127.0.0.1:8000`.
- Confirm compact Reader keeps the source metadata inline with the source heading and narrows the compact control ribbon toward the article lane without disturbing `Read aloud`.
- Reconfirm Source reopening, Notebook reopening, and wider Recall regressions in the same live browser pass.

## Checks

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/components/SourceWorkspaceFrame.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx -t \"shell exposes global Add and Search while source context stays compact until opened|compact shell styling keeps Reader support collapsed at rest and expandable on demand|global Search dialog remembers the active query and supports the keyboard shortcut|source-focused mode swaps the utility dock for the compact source strip|Reader source workspace keeps cross-surface handoff available without a full stacked tab row|reader source strip retires the secondary locator line even for source-backed documents\""`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node --check scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
- `node --check scripts/playwright/stage794_reader_compact_header_lane_alignment_after_stage793.mjs`
- `node --check scripts/playwright/stage795_post_stage794_reader_compact_header_lane_alignment_audit.mjs`
- `node scripts/playwright/stage794_reader_compact_header_lane_alignment_after_stage793.mjs`
- `node scripts/playwright/stage795_post_stage794_reader_compact_header_lane_alignment_audit.mjs`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Outcome

- Record the live local result in `output/playwright/stage795-post-stage794-reader-compact-header-lane-alignment-audit-validation.json`.
- The Stage 795 audit passed on `http://127.0.0.1:8000` with live browser evidence (`runtimeBrowser: chromium`, `headless: true`).
- Compact Reader now keeps `Source`, title, source type, and note count inside one heading seam, recording `defaultReaderSourceMetaInlineInHeading: true`, `reflowedReaderSourceMetaInlineInHeading: true`, and `previewBackedReaderSourceMetaInlineInHeading: true`.
- The compact header lane is now narrower than the compact deck across default, Reflowed, and preview-backed Reader states, recording `defaultReaderCompactHeaderWidthRatio: 0.613` versus `defaultReaderDeckWidthRatio: 0.676`, `reflowedReaderCompactHeaderWidthRatio: 0.613` versus `reflowedReaderDeckWidthRatio: 0.676`, and `previewBackedReaderCompactHeaderWidthRatio: 0.613` versus `previewBackedReaderDeckWidthRatio: 0.676`.
- `Read aloud` stayed primary inside the tightened lane, recording `defaultReaderTransportClusterNearModes: true`, `defaultReaderVisibleTransportButtonLabels: Start read aloud`, and `defaultReaderVisibleUtilityLabels: More reading controls`.
- Source and Notebook reopening stayed intact, recording `sourceOpenReaderSourceLibraryVisible: true`, `notebookOpenWorkbenchVisible: true`, and `simplifiedViewAvailable: false`.
