# ExecPlan: Stage 686 Graph Panel and Utility Chrome Recall-Parity Tightening After Stage 685

## Summary
- Reopen `Graph` for one bounded follow-through pass after the completed Stage 684/685 reset.
- Keep this slice `Graph`-only and chrome-focused: preserve the Stage 684 canvas, tour sequence, route shape, backend graph APIs, saved-view semantics, local-first storage, `Home`, and original-only `Reader`.
- Use the March 26, 2026 Recall Graph screenshots as the active benchmark again, but treat the remaining mismatch as a panel-and-controls hierarchy issue rather than a canvas or workflow-capability gap.

## Scope
- Update continuity so Stage 686 becomes the active checkpoint and Stage 687 becomes the paired audit.
- Tighten the left settings panel:
  - keep it docked open by default
  - flatten the panel shell and reduce inner card framing
  - keep `Presets`, `Filters`, and `Groups` as the visible top-level sections
  - keep `Save as preset` prominent while demoting update/rename/delete/reset actions into lighter secondary management
  - keep filter query, visibility, and timeline visible by default
  - collapse node/source-type filters plus connection-depth controls under `Advanced filters`
  - keep color-mode and legend visible while leaving custom-group details behind lighter disclosure state
  - move spacing, appearance, and reset-view tuning under `Advanced layout`
- Tighten the top-right utility corner:
  - keep `Search by title` dominant
  - keep `Fit to view` and `Lock graph` in the same compact utility corner
  - hide search stepping until search has multiple matches
  - reduce the persistent chip seam to a single subtle status note at most
- Tighten the bottom utility corners and contextual overlays:
  - shrink the count pill to a lighter single-line chip
  - keep replay-tour/help controls as a smaller two-button utility cluster
  - preserve the selected-node focus tray and detail dock behavior, but soften their visual weight
- Continue extracting browse-only Graph presentation seams into bounded subcomponents where it reduces the Graph branch size without moving shared state or handlers out of `RecallWorkspace.tsx`.

## Acceptance
- Wide-desktop browse `Graph` reads closer to the March 26 Recall screenshots because the settings rail is flatter, the control corner is slimmer, and the utility corners no longer feel chip-heavy.
- The visible section order remains `Presets`, `Filters`, and `Groups`.
- `Advanced filters` and `Advanced layout` are collapsed by default while preserving access to the underlying features.
- Search stepping only appears once search has multiple matches; one-match search states stay lighter.
- The bottom-left utility chip no longer duplicates visible count text, and the bottom-right help controls remain compact after dismissing the tour.
- `Home`, focused reader-led `Graph`, and original-only `Reader` remain stable.

## Validation
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
- `frontend/src/components/RecallWorkspace.stage34.test.tsx`
- `frontend/src/App.test.tsx`
- `frontend/src/lib/appRoute.test.ts`
- `frontend/src/lib/graphViewFilters.test.ts`
- `backend/tests/test_api.py -k graph -q`
- `npm run build`
- `node --check` for the Stage 686/687 Playwright pair
- real Windows Edge validation against `http://127.0.0.1:8000`
- targeted `git diff --check -- ...` over the touched Graph/docs/harness set

## Notes
- The user explicitly chose `panel + controls` as the next Graph mismatch to prioritize.
- `Recall-first defaults` is locked for this slice: prominent benchmark-facing controls stay visible while less benchmarked controls move into lighter collapsed disclosures.
