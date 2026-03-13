# ExecPlan: Interactive Edge Validation and Search Checks

## Purpose
- Continue the active stabilization milestone after the reopen-flow fix.
- Validate the remaining interactive Edge controls and confirm search behavior has no reopening regressions.

## Scope
- In scope:
  - Edge validation for pause/resume, sentence navigation, and keyboard shortcuts where the environment allows it
  - search interaction checks against the local library
  - targeted frontend fixes found during that validation
- Out of scope:
  - backend schema changes unless a frontend-only fix proves insufficient
  - local TTS work
  - new AI capabilities

## Assumptions
- Reopen support now restores the last document and mode locally.
- The next highest-priority work is validating the remaining interactive reading controls and search flow.
- Browser automation may still be partially constrained by the local Edge environment.

## Milestones
1. Validate search interactions and remaining reopen fallback cases.
2. Validate interactive Edge controls as far as the machine allows.
3. Fix any targeted regressions and update continuity docs.

## Detailed Steps
1. Use the WSL-hosted app and Windows Edge as the primary validation path.
2. Confirm search filters and document switching behave cleanly with restored context.
3. Check pause/resume, previous/next sentence, and keyboard shortcuts in Edge.
4. Implement focused fixes only for confirmed issues.

## Decision Log
- 2026-03-12: The reopen-flow work is complete and moved to `docs/exec_plans/completed/`.
- 2026-03-12: Interactive Edge validation is running through a temporary Windows-side Playwright harness with mocked browser speech so pause/resume, sentence navigation, and keyboard shortcuts can be exercised deterministically against the localhost app.
- 2026-03-12: Live Edge control validation exposed two speech reset loops, so this plan expanded just enough to fix rerender-triggered cancellation and parent progress-sync cancellation before closing.

## Validation
- Frontend: `npm test`, `npm run lint`, `npm run build`
- Live app: Windows Edge interaction checks against the localhost app

## Progress
- [x] Milestone one
- [x] Milestone two
- [x] Milestone three

## Surprises and Adjustments
- 2026-03-12: Search validation uncovered a reader-context regression risk, so the fix now preserves the active document while library results are filtered and adds explicit component-level interaction coverage.
- 2026-03-12: Live Edge control checks found that playback was cancelling itself after `Start` and `Next sentence`, which traced back to hook reset logic tied to equivalent rerenders and parent progress synchronization.

## Handoff
- Search filtering now behaves as a library filter instead of silently replacing the active reader document.
- Interactive Edge controls are now validated, including pause/resume, sentence navigation, keyboard shortcuts, and active-sentence highlight updates.
- Continue from `docs/exec_plans/active/2026-03-12_hardening_and_long_document_polish.md`.
