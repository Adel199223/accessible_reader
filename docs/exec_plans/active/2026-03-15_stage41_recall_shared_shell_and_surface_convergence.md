# ExecPlan: Stage 41 Recall Shared Shell And Surface Convergence

## Summary
- Use the Stage 40 benchmark matrix to make the app materially closer to Recall across the shared shell, Library/home, Add Content, Graph, and Study.
- Prioritize shared shell structure first so the next surface-specific work lands inside the right frame instead of polishing the wrong layout.
- Preserve local-first behavior, Stage 37 browse-first entry, and Stage 34 reader-led focused work while substantially rewriting the visible shell and browse surfaces.

## Key Changes
- Shared shell:
  - slim the left rail and reduce branding weight
  - thin the top utility bar and reduce repeated title/section chips
  - shift from heavy card framing to calmer canvas-led layout with secondary panels only when they materially help
- Library / home:
  - move toward a Recall-style two-zone browse surface instead of the current full source-card wall
  - reduce the visual dominance of the inline `Add source` tile and make the top-right `New` action the primary add affordance
  - simplify metadata density and repeated labels on source cards and collection chrome
- Add Content:
  - restyle the global add-source dialog into a more deliberate Recall-like import modal with clearer grouping and CTA hierarchy
  - keep only supported local-first import paths; do not invent unsupported Recall source types
- Graph:
  - make the graph canvas the dominant browse surface
  - collapse settings, detail, and validation support into lighter secondary framing instead of multiple heavy columns
- Study:
  - reframe Study around the review task and a simpler queue support pattern
  - reduce the current dashboard-like density and make the main review step more visually obvious
- Focused source work:
  - keep reader-led `Notes`, `Graph`, and `Study` behavior intact
  - reduce chip overload and extra framing so focused work visually fits the calmer shell

## Interfaces
- Primary implementation scope:
  - `frontend/src/components/RecallShellFrame.tsx`
  - `frontend/src/components/RecallWorkspace.tsx`
  - `frontend/src/components/SourceWorkspaceFrame.tsx`
  - `frontend/src/index.css`
- No route-contract, backend, storage, anchor, or Reader deep-link changes.
- No change to Stage 34 evidence-retargeting semantics.

## Test Plan
- Update targeted frontend coverage for:
  - shared shell chrome in browse vs focused modes
  - Library landing structure and add-source entry
  - Graph browse framing
  - Study browse framing
  - preservation of focused reader-led Notes/Graph/Study behavior
- Validation:
  - `frontend npm run lint`
  - `frontend npm run build`
  - targeted Vitest for shell and Recall workspace behavior
  - refreshed real Edge screenshot harness covering Library, Add Content, Graph, Study, and a focused reader-led surface
  - side-by-side review against `docs/ux/recall_benchmark_matrix.md`

## Assumptions
- Benchmark sources are limited to the user-provided screenshots plus official Recall properties listed in the benchmark matrix.
- The goal is strong Recall-like hierarchy and cleanliness, not a pixel-perfect copy.
- The shell may change substantially, but local-first product behavior and reader-led focused work must survive intact.
