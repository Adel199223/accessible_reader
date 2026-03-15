# ExecPlan: Stage 38 Post-Stage-37 Recall UX Refresh

## Summary
- Stage 37 corrected the biggest behavioral break: populated `/recall` now lands browse-first instead of auto-entering focused source mode.
- This audit re-evaluated the live app against the user benchmark, current localhost behavior, and fresh Stage 38 screenshots after correcting two clear visual regressions the user surfaced:
  - dark-on-dark landing card text
  - the high-contrast `New` button losing its active background
- The main remaining problem is no longer entry behavior. It is that the app still feels visually denser and noisier than the benchmark, especially on the landing and focused Library overview.

## Audit Inputs
- Live localhost inspection on `http://127.0.0.1:8000/recall`
- Fresh screenshots:
  - `output/playwright/stage38-audit-landing-desktop.png`
  - `output/playwright/stage38-audit-focused-library-desktop.png`
  - `output/playwright/stage38-audit-focused-notes-desktop.png`
  - `output/playwright/stage38-audit-landing-tablet.png`
- The user-shared Recall benchmark screenshot and the current product brief

## What Improved
- Browse-first Library landing now behaves correctly on populated workspaces.
- Source cards are readable again after fixing inherited button text color and long-preview overflow.
- Focused `Notes` still keeps the embedded Reader visible and feels directionally closer to the benchmark than the older overview-led layouts.

## Findings
- Landing hierarchy is still too noisy:
  - the shell repeats `Recall`, `Library`, and workspace labeling in too many places
  - the benchmark is calmer and more restrained at the top of the page
- Landing card density is still too tight:
  - too many narrow cards fit on desktop
  - titles and metadata still read like a compact log grid instead of primary collection cards
  - tablet width compresses into too many columns instead of choosing a cleaner, fewer-column layout
- Focused Library is still dashboard-heavy:
  - the `Search workspace` panel under `Source overview` duplicates the shell search entry point
  - the focused source strip and source overview stack still carry more chips, copy, and actions than the benchmark direction needs
- Focused split work is closer, but still over-framed:
  - `Notes`/Reader/detail panes all use similarly heavy card treatment
  - the next visual pass should make the primary reading/work surfaces clearer and let secondary metadata recede

## Recommendation
- Open one bounded implementation slice aimed at visual hierarchy and density cleanup rather than another shell or navigation rewrite.
- Keep the current browse-first entry model and reader-led split behavior intact while reducing repeated labels, over-dense landing cards, and dashboard-style focused Library chrome.

## Notes
- The audit itself included a small live regression cleanup in `frontend/src/index.css` so the screenshots would reflect the real Stage 37 layout instead of obvious contrast bugs.
