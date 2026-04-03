# Stage 787 - Post-Stage-786 Reader Loaded Reflowed Lead-In Retirement Audit

## Summary

- Validate the Stage 786 loaded-`Reflowed` cleanup against the live local app on `http://127.0.0.1:8000`.
- Confirm loaded `Reflowed` no longer renders the derived-context explainer band before the article.
- Reconfirm `Summary` / `Simplified` derived-context behavior, Notebook reopening, Source reopening, and the wider Recall regressions in the same live browser pass.

## Checks

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node --check scripts/playwright/reader_reading_first_hierarchy_shared.mjs scripts/playwright/stage786_reader_loaded_reflowed_lead_in_retirement_after_stage785.mjs scripts/playwright/stage787_post_stage786_reader_loaded_reflowed_lead_in_retirement_audit.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage786_reader_loaded_reflowed_lead_in_retirement_after_stage785.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && node scripts/playwright/stage787_post_stage786_reader_loaded_reflowed_lead_in_retirement_audit.mjs"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Outcome

- Passed on the live local app and recorded the new baseline in `output/playwright/stage787-post-stage786-reader-loaded-reflowed-lead-in-retirement-audit-validation.json`.
- The Stage 787 audit confirmed `reflowedReaderDerivedContextVisible: false`, `reflowedReaderHasArticle: true`, `summaryReaderDerivedContextVisible: true`, `sourceOpenReaderSourceLibraryVisible: true`, `notebookOpenWorkbenchVisible: true`, and `simplifiedViewAvailable: false`.
- Loaded `Reflowed` now begins directly with the source strip, mode tabs, controls, and article, while `Summary` remains on the existing derived-context path and generated outputs stay unchanged.
