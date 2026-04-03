# Stage 743 - Post-Stage-742 Reader Source-Strip Metadata Deflation Audit

## Summary

- Audit the completed Stage 742 Reader source-strip metadata deflation on the live app.
- Confirm the at-rest source strip no longer repeats available-view counts or current-view labels that the Reader mode strip already communicates.
- Keep the compact reading band, idle transport compaction, Source / Notebook expansion paths, generated-mode empty states, and cross-surface regression baselines intact.

## Audit Focus

- Default Reader source-strip metadata is visibly leaner and no longer includes redundant `views` or current-view chips.
- The compact source-destination trigger still opens cross-surface destinations normally.
- Source-open and Notebook-open states still expand correctly.
- Summary-capable documents still keep the proper visible mode strip and calm inline empty state behavior.
- `Home`, `Graph`, embedded `Notebook`, and `Study` remain stable in the same live-browser pass.

## Required Checks

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/App.test.tsx src/components/SourceWorkspaceFrame.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/reader_reading_first_hierarchy_shared.mjs scripts/playwright/stage742_reader_source_strip_metadata_deflation_after_stage741.mjs scripts/playwright/stage743_post_stage742_reader_source_strip_metadata_deflation_audit.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage742_reader_source_strip_metadata_deflation_after_stage741.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage743_post_stage742_reader_source_strip_metadata_deflation_audit.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`
