# ExecPlan: Stage 29 Post-Stage-28 Recall UX Refresh

## Summary
- Completed on 2026-03-14.
- Stage 28 materially improved source-focused continuity by turning source tabs into shared panes with lighter contextual browsing.
- The next highest-friction UX break is that active source work still lives underneath dashboard-level shell chrome instead of becoming the primary working canvas.

## Audit Inputs
- Reviewed the live Stage 28 artifacts, especially:
  - `output/playwright/stage28-source-overview.png`
  - `output/playwright/stage28-source-notes-focused.png`
  - `output/playwright/stage28-source-notes-browse.png`
  - `output/playwright/stage28-source-graph-focused.png`
  - `output/playwright/stage28-source-study-focused.png`
  - `output/playwright/stage28-source-pane-validation.json`
- Rechecked the live local workspace endpoints during the audit:
  - `http://127.0.0.1:5173/recall`
  - `http://127.0.0.1:8000/api/health`
- Re-benchmarked against current official Recall direction, especially:
  - the 2025-10-03 changelog entry describing redesigned Recall cards, customizable tabs, expanded reading space, and flexible split view
  - the 2025-06-13 changelog entry describing search as a more deliberate product-level surface
  - the 2025-01-09 changelog entry describing a smoother consolidated add-content flow
  - the main Recall docs at `https://docs.getrecall.ai/`

## Outcome
- Stage 28 succeeded:
  - one source now feels much more coherent across `Overview`, `Reader`, `Notes`, `Graph`, and `Study`
  - contextual browse drawers are lighter than the old always-open section rails
  - the source workspace now has a credible source home instead of acting as a thin handoff wrapper
- The next workflow break is now shell-level:
  - the hero, section tabs, and context/recent-work dock still occupy prime space above the active source
  - focused source work still looks like a dashboard module embedded inside a larger page, rather than the page taking on a card/source-first working mode
  - contextual drawers are lighter, but the source canvas still starts too low and competes with generic workspace chrome
- Inference from the Recall benchmark:
  - Recall's current direction keeps moving toward card/source-first work with more flexible tabs and split views
  - our next slice should move closer to that workflow by demoting generic shell scaffolding once the user is clearly inside one source

## Next Milestone Choice
- The next bounded slice should be Stage 30: focused source mode and collapsible workspace chrome.
- It should:
  - promote the active source workspace to the top of the working surface
  - compress hero/context/recent-work chrome during source-focused sessions
  - keep collection browsing and workspace jumps available on demand instead of ahead of the source canvas

## Notes
- This remained an audit/continuity pass; no code correction was required to complete the stage.
- The Recall benchmark remains directional workflow guidance, not a pixel-perfect cloning target.
