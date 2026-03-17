# ExecPlan: Stage 201 Recall Home Landing Endpoint Convergence Bundle

## Summary
- Implement the bundled Home follow-up selected by the Stage 200 benchmark audit.
- Group the remaining landing-endpoint fixes into one bounded convergence pass before the next full benchmark audit.
- Extend the visible tail by more than one additional reopen item, delay the reveal footer, and tighten lower-canvas spacing/meta only as needed so the fuller carry reads calm rather than archive-dense.

## Sources Used
- User-provided Recall screenshots in this thread for:
  - Home / items
  - Graph
- Official supporting Recall sources:
  - [Recall docs](https://docs.getrecall.ai/)
  - [Changelog | Recall](https://feedback.getrecall.ai/changelog)

## Problem Statement
- Stage 200 confirmed that Stage 199 materially calmed Home again by carrying slightly more visible continuation through the landing tail and by pushing the reveal footer lower.
- The remaining mismatch is still concentrated in the landing endpoint:
  - the visible continuation tail still ends too soon
  - the reveal footer still lands above too much empty lower canvas
- Repeating one tiny Home tweak per implementation stage is no longer the most efficient cadence here because Home has remained the dominant blocker for many consecutive audits and the remaining defect is localized.
- The next pass should therefore bundle the remaining Home landing-endpoint corrections into one bounded convergence stage while preserving the calmer shell, the restrained opening, and the current Graph, Study, and focused-study baselines.

## Goals
- Carry the visible Home continuation materially farther through the tail of the landing before the reveal footer row.
- Delay the reveal footer so it appears later inside the continuation flow instead of ending the visible landing too early.
- Tighten lower-canvas spacing/meta only as needed so the fuller tail stays calm instead of reverting toward an archive wall.
- Preserve the calmer Stage 199 shell and keep Graph, Study, and focused Study stable.

## Non-Goals
- Do not reopen Graph, Study, Add Content, or focused reader-led work during this pass.
- Do not widen into backend, storage, search behavior, or source import logic.
- Do not revive the old dense archive wall, boxed spotlight band, or over-framed support columns.
- Do not reopen the deferred narrow-width rail/top-grid regression unless the Home changes directly expose a must-fix break.
- Do not split this bundle back into one-fix-per-stage work unless a direct regression forces an early audit.

## Implementation Targets
- `frontend/src/components/RecallWorkspace.tsx`
  - extend the visible Home continuation by more than one additional reopen item, delay the reveal footer, and keep the fuller tail reading as one calm reopen flow
- `frontend/src/index.css`
  - rebalance Home follow-on spacing/meta only as needed so the fuller tail carry still reads calm and not archive-dense
- `frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - update Home assertions to cover the fuller visible continuation tail and later reveal footer inside the bundled landing-endpoint pass
- `frontend/src/App.test.tsx`
  - keep broad shell continuity coverage aligned if the Home landing structure shifts materially
- `scripts/playwright/stage201_home_landing_endpoint_convergence_bundle_edge.mjs`
  - capture fresh Stage 201 Home, Graph, Study, and focused-Study artifacts in Windows Edge
- `scripts/playwright/stage202_post_stage201_benchmark_audit_edge.mjs`
  - stage the next audit harness so the follow-up benchmark pass can run immediately

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage201_home_landing_endpoint_convergence_bundle_edge.mjs`
- `node --check scripts/playwright/stage202_post_stage201_benchmark_audit_edge.mjs`

## Exit Criteria
- Home shows a materially fuller visible continuation tail before the reveal footer row in fresh artifacts.
- The reveal footer lands later and the lower canvas feels more complete without regressing into the old archive-wall feel.
- Lower-canvas spacing/meta stays calm enough that the bundled carry does not reintroduce a boxed or ledger-like landing feel.
- Graph, Study, and focused Study remain visually stable.

## Execution Note
- On this machine, continue running the repo-owned Edge screenshot harnesses through Windows `node`; WSL `node` still attempts to launch Linux `msedge`, which is not installed.

## Outcome
- Stage 201 is complete.
- Home now carries materially farther through the landing tail before the inline reveal footer row by keeping a longer visible continuation in the merged `Earlier` section.
- Lower-tail spacing and meta were tightened slightly so the denser carry stays calm instead of reverting toward an archive-wall feel.
- Validation is green:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
  - `node --check scripts/playwright/stage201_home_landing_endpoint_convergence_bundle_edge.mjs`
  - `node --check scripts/playwright/stage202_post_stage201_benchmark_audit_edge.mjs`
  - `node scripts/playwright/stage201_home_landing_endpoint_convergence_bundle_edge.mjs`
- Fresh Stage 201 artifacts were captured for Home, Graph, Study, and focused Study.
- Graph and focused Study matched the Stage 200 captures byte-for-byte, and Study rerendered without material visual drift on visual review.
