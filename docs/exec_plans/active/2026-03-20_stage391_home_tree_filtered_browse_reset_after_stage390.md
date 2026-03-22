# ExecPlan: Stage 391 Home Tree-Filtered Browse Reset After Stage 390

## Summary
- The post-Stage-390 checkpoint leaves `Home` as the clearest remaining Recall-parity gap inside the refreshed `Graph` / `Home` / original-only `Reader` trio.
- Current Recall organization references now lean more clearly toward a left tag-tree or organizer rail that filters a denser card list on the right, rather than a large lead card floating inside a wide mostly-empty stage.
- This stage reopens `Home` for one broader browse-flow reset instead of another incremental density trim.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Replace the current oversized Home control seam with a slimmer workspace header that reads closer to a library shell than a hero card.
- Turn the attached Home browse strip into a stronger tree-like organizer rail:
  - keep inline search
  - promote grouped section selection
  - show clearer nested source hints or child rows
  - make the selected group feel like it is actively driving the main board
- Rework the main Home board so it reads as one denser right-side source list or card workspace instead of one large open stage plus a lower continuation wall.
- Keep a strong reopen path, but shrink the amount of empty stage space reserved around it.
- Preserve current Home behavior:
  - source search/filter
  - source reopen
  - shell `Search` and `New`
  - focused source handoff
  - reopen continuity from source workspace and Reader
- Keep `Graph` and original-only `Reader` as regression checkpoints only.

## Guardrails
- Do not widen into `Graph` implementation work in this stage.
- Do not touch generated-content workflows anywhere in `Reader`.
- Keep `Reader` original-only and cosmetic-only in this track: no `Reflowed`, `Simplified`, `Summary`, generated-view UX, transform logic, generated placeholders, generated-view controls, or mode-routing changes.
- Avoid micro-stage churn: make one broad Home hierarchy correction that specifically addresses organizer-rail fidelity, main-list density, and reduced empty stage area.

## Validation
- targeted Vitest for Home coverage plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 391/392 harness pair
- real Windows Edge Stage 391 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` reads more like a Recall-style organized library workspace and less like a hero card with a detached continuation wall.
- The left browse rail feels closer to a filtering tree or organizer, and the right main board shows a denser working set much earlier above the fold.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
