# Stage 797 - Post-Stage-796 Reader Compact Control Cluster Convergence Audit

## Summary

- Validate the Stage 796 compact control-cluster convergence pass against the live local app on `http://127.0.0.1:8000`.
- Confirm compact Reader keeps the narrowed Stage 795 header lane while pulling the mode strip and `Read aloud` cluster into one tighter packed control row.
- Reconfirm Source reopening, Notebook reopening, and wider Recall regressions in the same live browser pass.

## Checks

- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run test -- --run src/App.test.tsx -t \"compact shell styling keeps Reader support collapsed at rest and expandable on demand|Reader source workspace keeps cross-surface handoff available without a full stacked tab row\""`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node --check scripts/playwright/reader_reading_first_hierarchy_shared.mjs`
- `node --check scripts/playwright/stage796_reader_compact_control_cluster_convergence_after_stage795.mjs`
- `node --check scripts/playwright/stage797_post_stage796_reader_compact_control_cluster_convergence_audit.mjs`
- `node scripts/playwright/stage796_reader_compact_control_cluster_convergence_after_stage795.mjs`
- `node scripts/playwright/stage797_post_stage796_reader_compact_control_cluster_convergence_audit.mjs`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Outcome

- Record the live local result in `output/playwright/stage797-post-stage796-reader-compact-control-cluster-convergence-audit-validation.json`.
- The Stage 797 audit passed on `http://127.0.0.1:8000` with live browser evidence (`runtimeBrowser: chromium`, `headless: true`).
- Compact Reader kept the Stage 795 source seam and header width while tightening the control-cluster gap to `defaultReaderControlClusterGap: 7.359` (`ratio: 0.01`), `reflowedReaderControlClusterGap: 14.078` (`ratio: 0.02`), and `previewBackedReaderControlClusterGap: 14.078` (`ratio: 0.02`).
- The compact control band stayed on one row across those loaded Reader states, recording `defaultReaderControlClusterSameRow: true`, `reflowedReaderControlClusterSameRow: true`, and `previewBackedReaderControlClusterSameRow: true`.
- `Read aloud` stayed primary while Source and Notebook reopening remained intact, recording `defaultReaderVisibleTransportButtonLabels: Start read aloud`, `sourceOpenReaderSourceLibraryVisible: true`, `notebookOpenWorkbenchVisible: true`, and `simplifiedViewAvailable: false`.
