# ExecPlan: Stage 115 Recall Home Continuation Handoff Tightening And Lower Reopen Row Compaction

## Summary
- Implement the bounded Home follow-up selected by the Stage 114 benchmark audit.
- Reduce the remaining staged feel in browse-mode Home by tightening the handoff from the opening spotlight into the lower continuation flow.
- Keep the landing selective and calm without reopening Study, Graph, focused reader-led work, or the deferred narrow-width shell regression.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 111 materially improved the Home opening flow, and Stage 114 confirmed that Stage 113 kept Home stable while materially calming Study.
- Home now leads the remaining mismatch list again because the landing still hands off too abruptly from the `Start here` spotlight into a lower stack of boxed reopen cards.
- The lower continuation rows still read more like an archive-style secondary block than part of the same selective reopen sequence, leaving too much quiet lower canvas before the landing feels complete.

## Goals
- Tighten the handoff from the opening spotlight and nearby support into the lower `Keep going` continuation.
- Make the lower reopen rows feel lighter and more connected to the same primary flow.
- Reduce the remaining boxed/archive feel without restoring a dense archive wall.

## Non-Goals
- Do not reopen browse-mode Study, Graph, or focused reader-led work during this pass.
- Do not broaden into the deferred narrow-width rail/top-grid regression unless the Home changes directly expose a must-fix break.
- Do not change backend or storage behavior.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - tighten the Home continuation handoff after the opening spotlight
  - rebalance lower reopen rows so they feel like part of one calm reopen flow instead of a separate archive block
- `frontend/src/index.css`
  - reduce lower continuation framing, spacing, and card weight while preserving selective hierarchy
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Home assertions to cover the tighter continuation flow and calmer lower reopen rows
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if Home browse structure shifts materially
- `scripts/playwright/stage115_home_continuation_handoff_tightening_edge.mjs`
  - capture fresh Stage 115 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage116_post_stage115_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage115_home_continuation_handoff_tightening_edge.mjs`
- `node --check scripts/playwright/stage116_post_stage115_benchmark_audit_edge.mjs`

## Exit Criteria
- Browse-mode Home feels more like one continuous selective reopen flow from top to bottom.
- Lower reopen rows read lighter and less like a second archive block.
- Study, Graph, and focused Study remain visually stable in fresh artifacts.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
