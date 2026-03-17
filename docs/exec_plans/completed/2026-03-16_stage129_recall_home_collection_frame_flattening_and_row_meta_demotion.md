# ExecPlan: Stage 129 Recall Home Collection Frame Flattening And Row Meta Demotion

## Summary
- Implement the bounded Home follow-up selected by the Stage 128 benchmark audit.
- Flatten or materially soften the large Home collection frame so the landing reads more like a lighter Recall-style collection canvas.
- Demote repeated row labels, timestamps, and secondary meta so titles and reopen intent lead without disturbing Study, Graph, focused Study, or the deferred narrow-width shell regression.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 127 materially improved Study, and Stage 128 confirmed that Study no longer leads the remaining mismatch list.
- Home now leads again because the populated landing still presents the reopen flow with too much container and meta framing:
  - the entire landing still reads as one boxed archive panel rather than a lighter collection canvas
  - repeated `Nearby` and `Next` row labels keep drawing attention back to support chrome instead of source titles
  - right-heavy timestamps and row meta still make the list feel more utilitarian than the benchmark direction wants
- The next bounded pass should keep the selective `Start here` and `Keep going` flow while making Home feel less boxed and more immediately browsable.

## Goals
- Flatten or soften the large Home collection frame so the primary canvas feels lighter.
- Demote repeated row labels, timestamps, and secondary meta so source titles and previews lead the landing.
- Preserve the calmer selective reopen flow already established by the recent Home passes.

## Non-Goals
- Do not reopen Study, Graph, or focused reader-led work during this pass.
- Do not widen into the deferred narrow-width rail/top-grid regression unless the Home changes directly expose a must-fix break.
- Do not restore the old archive-wall feel or add new product scope.
- Do not change backend or storage behavior.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - rebalance the Home browse structure so the collection feels less boxed and repeated row/meta labels are quieter
- `frontend/src/index.css`
  - soften the Home collection frame, row separators, and timestamp/meta treatment while keeping the selective reopen rhythm intact
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Home assertions to cover the lighter collection frame and calmer row meta treatment
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Home browse structure shifts materially
- `scripts/playwright/stage129_home_collection_frame_flattening_edge.mjs`
  - capture fresh Stage 129 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage130_post_stage129_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage129_home_collection_frame_flattening_edge.mjs`
- `node --check scripts/playwright/stage130_post_stage129_benchmark_audit_edge.mjs`
- rerun the Stage 129 Edge capture after the production build so the final artifact reflects the new Home shell

## Exit Criteria
- Browse-mode Home no longer reads as one heavy archive panel in fresh artifacts.
- Row labels, timestamps, and secondary meta are quieter enough that titles and reopen intent lead the landing.
- Study, Graph, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
