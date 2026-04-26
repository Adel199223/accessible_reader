# Stage 881 - Post-Stage-880 Add Content Capture Gateway Single-Surface Compaction Audit

## Summary

- Audit the Stage 880 Add Content capture gateway compaction.
- Confirm the modal now opens as one compact capture-owned workbench while keeping existing import behavior and stable regression surfaces.

## Evidence Targets

- `addContentCommandRowCompact`
- `addContentLegacyHeroVisible`
- `addContentSupportRailVisible`
- `addContentSupportSeamInline`
- `addContentModeTabsCompact`
- `addContentPrimaryWorkbenchVisible`
- `addContentDialogHeight`
- `addContentModeOrderStable`
- `addContentNotebookActionEmbedded`

## Regression Targets

- Home global `Add` and Home Add tile still open the same route-stable dialog.
- Reader global `Add` still opens the same route-stable dialog.
- Paste, Web, and File modes remain available in the same order.
- File mode still exposes the visible file import target.
- Notebook creation remains outside Add Content.
- Home, Graph, embedded Notebook, original-only Reader, Reader active Listen seam, Study Review, and Study Questions remain regression surfaces.

## Validation

- Targeted ImportPanel/App Vitest.
- `npm run build`.
- `cd backend && uv run pytest tests/test_api.py -k graph -q`.
- `node --check` on the shared Add Content harness plus Stage 880/881 scripts.
- Live Stage 880/881 browser runs.
- `git diff --check`.

## Closeout Evidence

- Stage 881 live audit passed on `http://127.0.0.1:8000`.
- Recorded `addContentCommandRowCompact: true`, `addContentDialogHeight: 928.25`, `addContentLegacyHeroVisible: false`, `addContentModeOrderStable: true`, `addContentModeTabsCompact: true`, `addContentModeTabMaxHeight: 70.265625`, `addContentPrimaryWorkbenchVisible: true`, `addContentSupportRailVisible: false`, `addContentSupportSeamInline: true`, `defaultModeLabel: Paste text`, `modeLabels: Paste text / Web page / Choose file`, `fileDropVisible: true`, `homeRouteUnchangedOnOpen: true`, `homeTileLaunchRouteUnchanged: true`, `readerRouteUnchangedOnOpen: true`, and `notebookActionEmbeddedInDialog: false`.
- Regression evidence kept Home, Graph, embedded Notebook, original-only Reader, and Study visible while preserving route-stable Add Content entry from both Home and Reader.
