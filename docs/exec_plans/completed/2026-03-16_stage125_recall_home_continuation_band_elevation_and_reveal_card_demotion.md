# ExecPlan: Stage 125 Recall Home Continuation Band Elevation And Reveal Card Demotion

## Summary
- Implemented the bounded Home follow-up selected by the Stage 124 benchmark audit.
- Elevated the lower continuation band so it reads like the next step in the same reopen flow, not a footer strip.
- Demoted the final reveal card into a quieter footer control so the landing ends more naturally while keeping Study, Graph, focused Study, and the deferred narrow-width shell regression stable.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 123 materially improved Study, and Stage 124 confirmed that Study, Graph, and focused Study stayed stable afterward.
- Home now leads the remaining mismatch list again because its lower landing still breaks the otherwise calmer flow:
  - the `Keep going` continuation band still reads like a separate terminal row rather than the next step in the same selective reopen sequence
  - the final `Show all … earlier sources` reveal card still reads too much like a standalone endpoint
  - the lower landing therefore feels more abruptly finished than the benchmark direction wants
- The next bounded pass should keep the calmer opening flow while making the lower continuation feel more intentional and continuous.

## Goals
- Lift the lower continuation band so it reads as a natural follow-on step after the spotlight and nearby handoff.
- Demote the final reveal card so it behaves more like a supporting continuation control than a terminating feature card.
- Preserve the calmer Home opening hierarchy gained in Stages 111, 117, and 121.

## Non-Goals
- Do not reopen Study, Graph, or focused reader-led work during this pass.
- Do not widen into the deferred narrow-width rail/top-grid regression unless the Home changes directly expose a must-fix break.
- Do not restore the old archive-wall feel or add new product scope.
- Do not change backend or storage behavior.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - rebalance the lower Home continuation flow and reveal-card treatment so the landing ends more like one continuous reopen sequence
- `frontend/src/index.css`
  - reduce footer-row feel, soften the final reveal-card weight, and keep the landing rhythm connected
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Home assertions to cover the more continuous lower-band and reveal-control treatment
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Home browse structure shifts materially
- `scripts/playwright/stage125_home_continuation_band_elevation_edge.mjs`
  - capture fresh Stage 125 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage126_post_stage125_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage125_home_continuation_band_elevation_edge.mjs`
- `node --check scripts/playwright/stage126_post_stage125_benchmark_audit_edge.mjs`

## Exit Criteria
- Browse-mode Home ends with a lower continuation band that feels like part of the same reopen flow.
- The final reveal control is lighter and less endpoint-like in fresh artifacts.
- Study, Graph, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
