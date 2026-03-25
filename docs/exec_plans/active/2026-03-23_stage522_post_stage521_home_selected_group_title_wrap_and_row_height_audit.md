# ExecPlan: Stage 522 Post-Stage-521 Home Selected-Group Title-Wrap And Row-Height Audit

## Summary
- Audit the Stage 521 `Home` selected-group title-wrap and row-height continuity deflation reset against Recall's current organized-library direction.
- Confirm that longer selected-group titles now sit more calmly inside the board without recreating a jagged row edge.
- Keep `Graph` and original-only `Reader` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - `Home`
  - `Graph`
  - original-only `Reader`
- Supporting `Home` crops:
  - selected-group title-wrap treatment
  - selected-group first-row row-height continuity
  - selected-group follow-through after the calmer title-wrap treatment

## Acceptance
- The audit states clearly whether Stage 521 materially reduced the remaining selected-group title-wrap and row-height mismatch between Recall's current `Home` benchmark and our local board.
- The audit records whether longer selected-group titles now sit more calmly without blurring source identity.
- The audit records whether the visible board row now reads more evenly instead of stepping through a jagged title rhythm.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 521/522 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`

## Outcome
- Stage 522 confirms that Stage 521 materially reduced the remaining selected-group title-wrap and row-height mismatch between the current Recall `Home` benchmark and our local board.
- Longer selected-group titles now sit more calmly without blurring source identity:
  - the dedicated title-wrap crop matched the Stage 521 capture byte-for-byte while keeping the longer visible `Captures` title in the same calmer multi-line seam beside its neighbor
  - the live DOM audit sample recorded six first-row `Captures` cards at the same `60.25px` height, including the longest visible title `Sticky transport validation 1773391583120`
- The visible board row now reads more evenly instead of stepping through a jagged title rhythm:
  - the dedicated row-height crop matched the Stage 521 capture byte-for-byte, and the selected-group follow-through crop matched too
  - the calmer title-wrap treatment continues to read like one attached results-sheet row rather than a broken set of mini-panels
- `Graph` and original-only `Reader` refreshed in real Windows Edge without surfacing a new audit blocker, and the Reader regression capture remained locked to an asserted `Original` tab selection.
- Reader lock remains unchanged:
  - no generated-content work
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no transform or mode-routing changes

## Evidence
- Live localhost GET checks returned `200` for:
  - `http://127.0.0.1:8000/recall`
  - `http://127.0.0.1:8000/recall?section=graph`
  - `http://127.0.0.1:8000/reader`
- Stage 522 audit harness:
  - `output/playwright/stage522-post-stage521-home-selected-group-title-wrap-and-row-height-audit-validation.json`
- Refreshed wide desktop captures:
  - `output/playwright/stage522-home-wide-top.png`
  - `output/playwright/stage522-home-selected-group-title-wrap-wide-top.png`
  - `output/playwright/stage522-home-selected-group-row-height-wide-top.png`
  - `output/playwright/stage522-home-selected-group-wide-top.png`
  - `output/playwright/stage522-graph-wide-top.png`
  - `output/playwright/stage522-reader-original-wide-top.png`
- Supporting live audit metrics:
  - selected organizer group: `Captures`
  - first visible row count: `6`
  - first visible row card height: `60.25px` across all six cards
  - longest visible title: `Sticky transport validation 1773391583120`
- The audit ran in real Windows Edge with `runtimeBrowser: "msedge"`.

## Next Recommendation
- Do not auto-open another top-level slice from this checkpoint.
- Return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold until the user explicitly resumes product work or a direct regression forces a correction.
- Keep generated-content Reader work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, or mode-routing work
