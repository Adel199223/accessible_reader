# ExecPlan: Stage 45 Recall Graph Canvas First Pass And Home Terminology Cleanup

## Summary
- Reframed browse-mode Graph around a graph-first canvas so it feels materially closer to the Recall benchmark instead of reading like a detail-first dashboard.
- Renamed user-facing `Library` terminology to `Home` in the shared shell and landing while keeping the internal `library` section key stable.
- Kept Stage 37 browse-first entry, Stage 41 shared-shell cleanup, Stage 43 landing selectivity work, and Stage 34 focused reader-led split behavior intact.

## What Landed
- Shared shell terminology:
  - the left rail now shows `Home` instead of `Library`
  - the browse-first landing and related empty/error/search copy now consistently use `Home`
  - internal routing and continuity state still use the `library` section key, so no route churn was introduced
- Graph browse mode:
  - browse-mode Graph now opens on a graph-dominant canvas instead of a two-column detail-first layout
  - the old heavyweight browse detail framing was replaced with a lighter support rail, quick-pick list, floating detail overlay, and explicit `Focus source` / `Open in Reader` actions
  - graph selection still grounds into source-backed evidence and still supports transition into focused reader-led work
- Focused behavior preservation:
  - intentional focused graph entry still uses the reader-led split introduced in Stage 34
  - browse-first `/recall` entry behavior and cross-section continuity remain unchanged

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallShellFrame.test.tsx src/components/LibraryPane.test.tsx src/components/RecallWorkspace.stage37.test.tsx src/components/RecallWorkspace.stage34.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node scripts/playwright/stage45_graph_home_edge.mjs`

## Artifacts
- `output/playwright/stage45-home-landing-desktop.png`
- `output/playwright/stage45-graph-browse-desktop.png`
- `output/playwright/stage45-focused-graph-desktop.png`
- `output/playwright/stage45-graph-home-validation.json`

## Outcome
- The user-facing `Home` rename is now live and consistent in the shared shell.
- Graph browse mode is materially closer to the Recall benchmark and no longer the unchanged dashboard-like outlier it was after Stage 43.
- The next step should return to audit mode so the roadmap can choose between Study and any remaining Home/Graph polish from fresh evidence instead of guessing.
