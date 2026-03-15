# ExecPlan: Stage 36 Post-Stage-35 Recall UX Refresh

## Summary
- Stage 34 corrected the split workspace so focused note, graph, and study work stays beside live Reader content.
- Stage 35 then reset the default Recall shell into a collection-first layout with a left rail, slim top bar, lighter utility dock, and compact focused-source mode.
- The next step should be an audit, not another implementation slice, so the new shell is evaluated against the product brief, the live app, and the user's benchmark direction before more code work resumes.

## Audit Focus
- Default Recall landing:
  - collection-first clarity
  - source list/grid density
  - usefulness of the lighter utility dock
  - whether onboarding/help states are now light enough
- Focused source mode:
  - compact source strip hierarchy
  - reader-led split usefulness in focused `Notes`, `Graph`, and `Study`
  - whether rail, top bar, and focused strip compete too much with the work surface
- Narrow-width and responsiveness:
  - left-rail collapse quality
  - top-bar wrapping
  - split-work readability on smaller desktop widths
- Error, empty, and sparse-workspace states:
  - whether outage banners are compact enough
  - whether empty default-shell states still feel intentional instead of unfinished
- Benchmark fit:
  - compare the current shell against the user-shared reference screenshot from the 2026-03-15 Codex thread
  - use the product brief and current Recall benchmark sources to decide whether the next bounded slice should target default-shell polish, focused-mode polish, responsiveness, or empty/error-state cleanup

## Audit Inputs
- Product brief:
  - `C:\Users\FA507\Downloads\Building a Smarter Recall App.docx`
- User benchmark:
  - the reference Recall collection screenshot shared in the 2026-03-15 Codex thread
- Local artifacts:
  - `output/playwright/stage34-reader-led-notes.png`
  - `output/playwright/stage34-reader-led-graph.png`
  - `output/playwright/stage34-reader-led-study.png`
  - `output/playwright/stage34-reader-led-notes-browse.png`
  - `output/playwright/stage34-reader-led-graph-browse.png`
  - `output/playwright/stage34-reader-led-study-browse.png`
  - `output/playwright/stage34-reader-led-validation.json`

## Constraints
- Do not reopen backend, storage, route, or browser-companion scope during this audit.
- Preserve local-first behavior, routes, anchors, embedded Reader continuity, and explicit full Reader deep links.
- Keep local TTS, OCR, cloud sync, collaboration, and chat/Q&A deferred unless a later roadmap decision explicitly reprioritizes them.

## Expected Output
- Identify the highest-friction remaining UX break after the Stage 35 shell reset.
- Name one bounded next slice only after the audit is complete.
- If the shell reset already closes the main benchmark gap, say that explicitly and choose the next slice from the remaining smaller UX breaks rather than reopening shell structure blindly.
