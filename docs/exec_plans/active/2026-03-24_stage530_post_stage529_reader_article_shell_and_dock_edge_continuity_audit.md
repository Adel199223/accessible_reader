# ExecPlan: Stage 530 Post-Stage-529 Reader Article-Shell And Dock-Edge Continuity Audit

## Summary
- Audit the Stage 529 original-only `Reader` article-shell and dock-edge continuity deflation reset against the current Recall reading-first benchmark direction.
- Confirm that wide-desktop original-only `Reader` now behaves more like one attached reading deck without reopening generated-content work.
- Keep `Home` and `Graph` as regression surfaces.

## Audit Scope
- Wide desktop captures first:
  - original-only `Reader`
  - `Home`
  - `Graph`
- Supporting Reader crops:
  - original-only article shell and deck join
  - original-only dock edge and source-support continuity
  - original-only article start and reading-lane dominance

## Acceptance
- The audit states clearly whether Stage 529 materially reduced the remaining original-only Reader deck-framing mismatch against Recall's current reading direction.
- The audit records whether the article shell now feels less boxed and more dominant inside the reading deck.
- The audit records whether the dock edge now feels more attached without losing source, note, or source-library continuity.
- The handoff repeats the Reader lock explicitly: no generated-content work, no `Reflowed`, `Simplified`, or `Summary` changes, and no transform or mode-routing changes.

## Validation
- `node --check` for the Stage 529/530 harness pair
- real Windows Edge audit run against `http://127.0.0.1:8000`
- `git diff --check`

## Outcome
- Complete.
- The Stage 530 audit confirmed that Stage 529 materially reduced the remaining original-only `Reader` deck-framing mismatch: the reading deck now behaves like one dominant article surface with an attached companion rail instead of two separate bordered cards.
- `Home` and `Graph` refreshed cleanly in the same Edge audit, so the checkpoint returns to refreshed-baseline hold instead of auto-opening another product slice.

## Evidence
- Real Windows Edge Stage 530 audit against `http://127.0.0.1:8000` refreshed:
  - `output/playwright/stage530-home-wide-top.png`
  - `output/playwright/stage530-graph-wide-top.png`
  - `output/playwright/stage530-reader-original-wide-top.png`
  - `output/playwright/stage530-reader-deck-join-wide-top.png`
  - `output/playwright/stage530-reader-article-lead-wide-top.png`
  - `output/playwright/stage530-reader-dock-edge-wide-top.png`
- Live Reader deck metrics in Edge:
  - `0px` deck gap
  - `0px` document-shell inset
  - `12px` article top-right seam radius and `12px` dock top-left seam radius
  - `-2.23px` article-to-dock gap / `2.23px` seam overlap
  - `882.73px` article width, `226.24px` dock width, and a `3.9` article-to-dock ratio
- Validation remained green:
  - `node --check` for the Stage 529/530 harness pair
  - real Windows Edge Stage 529 and Stage 530 runs
  - `Home`, `Graph`, and `/reader` live localhost `200` checks
  - targeted Vitest, `npm run lint`, `npm run build`, and `git diff --check`

## Next Recommendation
- Do not auto-open another top-level slice from this checkpoint.
- Return `Home`, `Graph`, and original-only `Reader` to refreshed-baseline hold unless the user explicitly resumes product work or a direct regression forces a correction.
- Keep generated-content Reader work explicitly locked:
  - no `Reflowed`, `Simplified`, or `Summary` changes
  - no generated-view UX, transform, or mode-routing work
