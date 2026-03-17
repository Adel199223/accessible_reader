# ExecPlan: Stage 131 Recall Home Collection Unboxing And Date Gutter Collapse

## Summary
- Implement the bounded Home follow-up selected by the Stage 130 benchmark audit.
- Unbox the remaining full-width Home collection panel so the landing reads more like a lighter collection zone than a single ledger card.
- Collapse the persistent right-side date gutter into quieter inline meta so titles and reopen intent lead without disturbing Study, Graph, focused Study, or the deferred narrow-width shell regression.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 129 materially calmed Home, and Stage 130 confirmed that Study, Graph, and focused Study stayed stable afterward.
- Home still leads the remaining mismatch list because the populated landing still carries two visible structural leftovers from the pre-flattened layout:
  - the entire reopen flow still sits inside one broad boxed panel instead of feeling like a lighter collection zone
  - the right-aligned date gutter still competes with source titles across the spotlight, support rows, and follow-on rows
- The next bounded pass should keep the calmer row/meta styling from Stage 129 while making the Home landing feel less ledger-like and more open.

## Goals
- Reduce the remaining full-width panel feel on the Home landing.
- Collapse the strong right-side date gutter into quieter inline meta.
- Preserve the selective `Start here` and `Keep going` flow while making the collection feel more open.

## Non-Goals
- Do not reopen Study, Graph, or focused reader-led work during this pass.
- Do not widen into the deferred narrow-width rail/top-grid regression unless the Home changes directly expose a must-fix break.
- Do not restore the old archive-wall feel or add new product scope.
- Do not change backend or storage behavior.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - rebalance the Home browse structure so the collection no longer reads like one boxed ledger and row dates sit in quieter inline positions
- `frontend/src/index.css`
  - remove more of the remaining panel feel and soften date-gutter alignment while preserving the current selective reopen rhythm
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Home assertions to cover the lighter collection-zone treatment and quieter date placement
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Home browse structure shifts materially
- `scripts/playwright/stage131_home_collection_unboxing_edge.mjs`
  - capture fresh Stage 131 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage132_post_stage131_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage131_home_collection_unboxing_edge.mjs`
- `node --check scripts/playwright/stage132_post_stage131_benchmark_audit_edge.mjs`

## Exit Criteria
- Browse-mode Home no longer reads as one broad boxed ledger in fresh artifacts.
- The right-side date gutter is quiet enough that titles and previews lead the landing.
- Study, Graph, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
