# ExecPlan: Stage 117 Recall Home Lower Canvas Fill And Reveal Control Integration

## Summary
- Implement the bounded Home follow-up selected by the Stage 116 benchmark audit.
- Reduce the remaining abrupt ending in browse-mode Home by integrating the reveal control into the continuation flow and filling the lower canvas more intentionally.
- Keep the landing selective and calm without reopening Study, Graph, focused reader-led work, or the deferred narrow-width shell regression.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Release: 22 August 2024 // UI Improvements](https://feedback.getrecall.ai/changelog/release-22-august-2024-ui-improvements)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 115 materially improved the Home continuation flow, and Stage 116 confirmed that Study, Graph, and focused Study stayed stable after that pass.
- Home still leads the remaining mismatch list because the landing still ends too abruptly in the lower canvas:
  - the `Show all … earlier sources` control sits too isolated below the continuation rows
  - the lower section still leaves too much empty canvas after the calmer top flow
- The next bounded pass should keep the selective reopen direction while making the lower landing feel more complete and intentionally finished.

## Goals
- Integrate the reveal control more naturally into the Home continuation flow.
- Reduce the isolated empty lower-canvas feel at the end of the landing.
- Preserve the calmer selective reopening hierarchy created in Stages 111, 115, and earlier Home passes.

## Non-Goals
- Do not reopen browse-mode Study, Graph, or focused reader-led work during this pass.
- Do not broaden into the deferred narrow-width rail/top-grid regression unless the Home changes directly expose a must-fix break.
- Do not restore a dense archive wall or expand the landing into a generic full list.
- Do not change backend or storage behavior.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - rebalance the Home lower continuation ending and relocate or restyle the reveal control so it feels part of the same reopen flow
  - keep the selective top-of-landing structure intact while reducing the abrupt lower stop
- `frontend/src/index.css`
  - reduce lower-canvas dead space and integrate the reveal affordance into the calmer continuation layout
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Home assertions to cover the integrated reveal control and calmer lower-canvas finish
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Home browse structure shifts materially
- `scripts/playwright/stage117_home_lower_canvas_fill_edge.mjs`
  - capture fresh Stage 117 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage118_post_stage117_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage117_home_lower_canvas_fill_edge.mjs`
- `node --check scripts/playwright/stage118_post_stage117_benchmark_audit_edge.mjs`

## Exit Criteria
- Browse-mode Home no longer ends with an isolated reveal control plus excess dead lower canvas.
- The reveal control feels integrated into the continuation flow instead of tacked on afterward.
- Study, Graph, and focused Study remain visually stable in fresh artifacts.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.
