# Stage 880 - Add Content Capture Gateway Single-Surface Compaction After Stage 879

## Summary

- Reopen `Add Content`, not `Reader`, `Home`, `Graph`, `Study`, or embedded `Notebook`.
- The Stage 879 Reader active Listen baseline is stable; the oldest high-impact surface is now the universal capture gateway.
- Make the Add Content modal feel like one compact capture workbench instead of a stacked hero, mode deck, primary card, and separate support rail.

## Scope

- Keep supported capture modes unchanged: `Paste text`, `Web page`, and `Choose file`.
- Preserve route-stable modal opening from Home, Reader, and the Home Add tile.
- Collapse the internal import hero into a compact command row with active mode context and local-first status.
- Convert the support rail into an attached inline support seam owned by the selected mode.
- Keep Notebook creation separate from Add Content.

## Non-Goals

- No backend, route, schema, storage, import pipeline, generated Reader output, local TTS, OCR, extension import, cloud sync, or standalone Notebook note creation changes.
- Do not redesign Home board Add tile behavior beyond keeping it as an existing launcher.

## Validation

- Targeted ImportPanel/App Vitest for compact command row, mode order, mode switching, route stability, and no embedded Notebook creation.
- Extend the shared Add Content Playwright harness with metrics for command-row compaction and retired support rail.
- Live Stage 880/881 browser evidence plus existing Home, Graph, Notebook, Reader, and Study regressions.

## Closeout Evidence

- Implemented in `frontend/src/components/ImportPanel.tsx`, `frontend/src/index.css`, `frontend/src/App.test.tsx`, `frontend/src/components/ImportPanel.test.tsx`, and the shared Add Content Playwright harness.
- Stage 880 live validation recorded `addContentCommandRowCompact: true`, `addContentDialogHeight: 928.25`, `addContentLegacyHeroVisible: false`, `addContentModeTabsCompact: true`, `addContentModeTabMaxHeight: 70.265625`, `addContentSupportRailVisible: false`, `addContentSupportSeamInline: true`, `homeRouteUnchangedOnOpen: true`, `homeTileLaunchRouteUnchanged: true`, `readerRouteUnchangedOnOpen: true`, and `notebookActionEmbeddedInDialog: false`.
- The pass stayed UI-only: no backend, route, schema, storage, import pipeline, generated Reader output, OCR, extension import, local TTS, cloud sync, or standalone Notebook note-creation behavior changed.
