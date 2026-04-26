# Stage 817 - Post-Stage-816 Reader Heading-First Title Seam Retirement Audit

## Summary

- Validate the Stage 816 heading-first compact Reader title-seam retirement pass against the live local app on `http://127.0.0.1:8000`.
- Confirm the existing exact-match duplicate-title case still retires the compact source-strip title while the default non-match case still keeps it visible.
- Keep the ordered-prefix duplicate case covered by targeted Vitest, since the live Microsoft Edge dataset does not currently provide that exact prefix-only variant.

## Checks

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx src/components/SourceWorkspaceFrame.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node --check scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
- `node --check scripts/playwright/stage816_reader_heading_first_title_seam_retirement_after_stage813.mjs`
- `node --check scripts/playwright/stage817_post_stage816_reader_heading_first_title_seam_retirement_audit.mjs`
- `node scripts/playwright/stage816_reader_heading_first_title_seam_retirement_after_stage813.mjs`
- `node scripts/playwright/stage817_post_stage816_reader_heading_first_title_seam_retirement_audit.mjs`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Outcome

- Recorded the live local result in `output/playwright/stage817-post-stage816-reader-heading-first-title-seam-retirement-audit-validation.json`.
- Targeted Vitest passed and covered all three bounded duplicate-title cases: exact match still hides the compact source title, one ordered-prefix difference also hides it, and non-matching heading-first content still keeps the compact source title visible; expanded Reader support still restores the source title when opened.
- The live Stage 816/817 browser runs also passed on `http://127.0.0.1:8000`. The current Edge dataset kept the exact-match preview-backed case green with `previewBackedReaderLeadingArticleHeadingMatchesSourceTitle: true`, `previewBackedReaderSourceTitleVisible: false`, and `previewBackedReaderContentHeadingCount: 1`, while the default non-match case stayed green with `defaultReaderLeadingArticleHeadingMatchesSourceTitle: false` and `defaultReaderSourceTitleVisible: true`.
- Source and Notebook reopen behavior stayed stable live with `sourceOpenReaderSourceLibraryVisible: true`, `notebookOpenWorkbenchVisible: true`, and `simplifiedViewAvailable: false`.
- During validation, the shared Playwright launcher was hardened to fall back to the healthy Codex runtime Playwright install when the temporary Windows harness directory is present but only partially populated, so the Stage 816/817 browser runs now complete reliably from this machine.
- Result: passed.
