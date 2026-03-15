# ExecPlan: Stage 31 Post-Stage-30 Recall UX Refresh

## Summary
- Stage 30 corrected the dashboard-first shell problem by letting active source work start at the top of the workspace and collapsing support chrome behind an explicit reopen action.
- This audit re-evaluated the live source-focused workspace against the product brief, Stage 30 real Edge artifacts, and current official Recall benchmark direction.
- The next remaining bottleneck is not shell chrome height anymore. It is the amount of hard tab switching required to keep reading while also working with notes, graph evidence, and study context.

## Audit Findings
- The active source is now visually primary, which is the right correction from Stage 30.
- `New` and `Search` are no longer the main friction:
  - the product brief pushes for smoother ingest and obvious next actions
  - Recall's January 9, 2025 release consolidated `+New`
  - Recall's June 13, 2025 release moved search into a dedicated modal
  - this repo already matches that direction closely enough for now
- The highest-friction remaining break is flexible split work:
  - the current source-focused workspace still forces the user to switch the main source tabs between `Reader`, `Notes`, `Graph`, and `Study`
  - the right-side support area in Reader remains lightweight and fixed, not an adaptable work surface
  - note editing beside reading exists, but graph and study still require context-breaking tab changes
  - source-focused `Notes`, `Graph`, and `Study` still replace the main reading surface instead of acting like adjacent tools
- That gap matches the clearest direction from current Recall benchmark material:
  - March 18, 2025: side-by-side Reader and Notebook
  - October 3, 2025: expanded reading space and flexible split view
  - November 18, 2025: split-screen for notes

## Recommendation
- Open Stage 32 as a bounded flexible split-work correction inside the source-focused workspace.
- Keep one active source and one main reading/overview surface visible while making nearby note, graph, and study work switchable in an adaptable side pane.
- Do not widen into chat, sync, OCR, local TTS, or another search overhaul in the same slice.

## Audit Inputs
- Product brief:
  - `C:\Users\FA507\Downloads\Building a Smarter Recall App.docx`
- Local artifacts:
  - `output/playwright/stage30-focused-source-reader.png`
  - `output/playwright/stage30-focused-source-support-open.png`
  - `output/playwright/stage30-focused-source-overview.png`
  - `output/playwright/stage30-focused-source-notes-browse.png`
  - `output/playwright/stage30-focused-source-reader-return.png`
  - `output/playwright/stage30-focused-source-validation.json`
- Official Recall benchmark sources:
  - `https://docs.getrecall.ai/`
  - `https://feedback.getrecall.ai/changelog/our-biggest-update-yet-march-18-2025-augmented-browsing-chat-more`
  - `https://feedback.getrecall.ai/changelog/release-january-9-2025-a-smoother-way-to-add-content`
  - `https://feedback.getrecall.ai/changelog/release-june-13-2025-a-step-towards-improved-search`
  - `https://feedback.getrecall.ai/changelog`

## Notes
- The broad `frontend/src/App.test.tsx` suite still has a runner-stability issue when executed as one large file. That remains a secondary stabilization item, not the main UX recommendation from this audit.
