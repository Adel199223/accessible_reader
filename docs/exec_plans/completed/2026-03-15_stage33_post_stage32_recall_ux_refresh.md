# ExecPlan: Stage 33 Post-Stage-32 Recall UX Refresh

## Summary
- Stage 32 corrected the previous hard full-surface swaps by keeping one source visible beside source-local note, graph, and study work.
- This audit re-evaluated the live split-work workspace against the product brief, Stage 32 real Edge artifacts, and current official Recall benchmark direction.
- The next remaining bottleneck is no longer whether source-local work stays adjacent. It is that the split workspace is still too overview-led instead of live-source-led.

## Audit Findings
- Stage 32 achieved its main correction:
  - source-local `Notes`, `Graph`, and `Study` no longer replace the full source workspace
  - manual section clicks still reopen browse-first surfaces
  - one source stays visually present through source-local work
- The highest-friction remaining break is now the quality of the primary pane:
  - in focused `Notes`, `Graph`, and `Study`, the stable center pane is usually `Source overview`, not the live reading surface
  - many important actions still reopen `Reader` as a separate step instead of keeping the active source itself visible beside the tool work
  - note anchors, graph mentions, and study evidence remain adjacent to source metadata more often than adjacent to live source content
- That means the workspace is now split, but still not split around the right anchor. The current anchor is a summary card, not the live source.
- `New`, `Search`, source identity, and shell chrome are no longer the main friction:
  - the product brief pushes for stronger reading focus, tighter note adjacency, and easier split-view work
  - Recall's January 9, 2025 release consolidated `+New`
  - Recall's June 13, 2025 release clarified dedicated search flow
  - Stage 26-32 already resolved source identity, contextual browse, chrome height, and adjacent tool access enough that they are no longer the next bottleneck
- The clearest Recall benchmark direction still points toward live-content-first split work:
  - March 18, 2025: side-by-side Reader and Notebook
  - October 3, 2025: expanded reading space and flexible split view
  - November 18, 2025: split-screen notes

## Recommendation
- Open Stage 34 as a bounded reader-led split-work correction inside the source-focused workspace.
- Keep `Overview` as the source home and summary surface, but stop making it the default anchor during note, graph, and study work.
- Make the live source surface in `Reader` the primary pane for source-local handoffs whenever the user is working from note anchors, graph evidence, study excerpts, or Reader/open-in-reader flows.
- Keep the secondary pane adaptable and lightweight, and preserve manual browse-first section entry plus current route/deep-link behavior.

## Audit Inputs
- Product brief:
  - `C:\Users\FA507\Downloads\Building a Smarter Recall App.docx`
- Local artifacts:
  - `output/playwright/stage32-source-split-notes.png`
  - `output/playwright/stage32-source-split-graph.png`
  - `output/playwright/stage32-source-split-study.png`
  - `output/playwright/stage32-source-split-notes-browse.png`
  - `output/playwright/stage32-source-split-study-browse.png`
  - `output/playwright/stage32-source-split-validation.json`
- Official Recall benchmark sources:
  - `https://docs.getrecall.ai/`
  - `https://feedback.getrecall.ai/changelog/our-biggest-update-yet-march-18-2025-augmented-browsing-chat-more`
  - `https://feedback.getrecall.ai/changelog/release-january-9-2025-a-smoother-way-to-add-content`
  - `https://feedback.getrecall.ai/changelog/release-june-13-2025-a-step-towards-improved-search`
  - `https://feedback.getrecall.ai/changelog/release-october-3-2025`
  - `https://feedback.getrecall.ai/changelog/release-november-18-2025`

## Notes
- The real Edge Stage 32 smoke is now green, so this audit is based on live validated behavior rather than the earlier blocked-validation note.
- The broad `frontend/src/App.test.tsx` runner-stability issue still exists, but it is secondary to the next UX recommendation.
