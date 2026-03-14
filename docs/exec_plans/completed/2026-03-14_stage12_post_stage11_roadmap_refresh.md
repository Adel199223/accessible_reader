# ExecPlan: Stage 12 Post-Stage-11 Roadmap Refresh

## Summary
- Stage 11 is complete, including note portability visibility, manual graph/study promotion, and the real-browser fix that keeps promoted manual cards active in Study.
- Stage 12 audited the current product state against the user's product brief, the current localhost app, and the original Recall app's workflow patterns.
- The highest-leverage gap is now workflow polish, not another backend feature tier.

## Inputs Used
- live localhost walkthrough of Library, Study, Notes, and Reader on the current app
- the user's product brief, especially its emphasis on lower-friction knowledge flows, contextual resurfacing, and study continuity
- the current Recall-benchmark UX guidance already recorded in the build brief, roadmap, and anchor
- public Recall product patterns around smoother add-content entry, dedicated search access, expanded reading space, and split-screen context

## Findings
- Add-source entry is still too buried inside Reader instead of being a workspace-level action.
- Search and reopen are still too buried inside Library instead of acting like an always-near workspace capability.
- Reader still spends too much vertical space on shell chrome before the reading surface begins.
- Source and note context are available but not adjacent enough to active reading on desktop, which weakens split-view usefulness.
- Graph and Study behavior are functional, but the core add/search/read/note loop remains the stronger leverage point for the next slice.

## Decision
- Stage 13 is the next bounded milestone: `Recall Workflow Polish and Focused Reader Split View`.
- Keep the next slice frontend-first when possible, reusing current local-first APIs and storage contracts.
- Preserve routes, note anchors, browser-companion handoff, speech, and reading continuity while reshaping the shell and Reader layout.

## Deliverables Produced
- roadmap and anchor updates recording Stage 12 as complete
- assistant continuity updates pointing future work to the new active milestone
- a successor active ExecPlan for Stage 13 that is specific enough to implement directly

