# ExecPlan: Stage 704 Study Review Dashboard And Questions Hierarchy Reset After Stage 703

## Summary
- Stage 704/705 reopens `Study` as the sole active product surface after the Stage 702/703 Reader generated-mode follow-through.
- This slice is a parity reset for wide-desktop `Study`, using the March 18, 2026 Recall review screenshots plus the current Recall quiz/review docs and February 19, 2026 Quiz 2.0 release notes as the benchmark direction.
- Keep `Graph`, `Home`, embedded `Notebook`, and original-only `Reader` as regression surfaces only.

## Why This Milestone Exists
- Stage 378/379 made `Study` materially calmer than the older review dashboard, but the current surface still leads with too much stage-shell framing and still treats queue/evidence like co-equal docks instead of quieter review support.
- The queued roadmap after Stage 703 explicitly unlocks `Study` next, before closeout, so the product can end the parity ladder with every primary surface intentionally evaluated.
- Recall’s current review direction emphasizes a review dashboard, a questions-management layer, and a clearer review task hierarchy. Our local-first Study flow should move closer to that structure without introducing unsupported server features.

## Benchmark Basis
- Primary benchmark:
  - user-provided Recall Study screenshots from this thread on 2026-03-18
- Supporting official sources:
  - [Quiz & Spaced Repetition](https://docs.getrecall.ai/docs/features/quiz-and-spaced-repetition)
  - [Recall Release Notes: Feb 19, 2026 - Quiz 2.0 with Shared Challenges](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-19-2026-quiz-20-with-shared-challenges)
  - [Release: 29 November 2024 // Recall Review Reminders](https://feedback.getrecall.ai/changelog/release-29-november-2024-recall-review-reminders)
- Directional product cues to reflect locally:
  - review-first dashboard instead of a broad empty shell
  - clearer question-management hierarchy
  - simpler, lighter support chrome
  - stronger emphasis on the one active review task

## Milestone Rules
- Keep this milestone scoped to `Study` plus only the minimal shared style/test/harness work strictly required by the reset.
- Preserve local FSRS scheduling, review semantics, reveal/rating flow, source evidence grounding, Reader reopen actions, note-to-study promotion, and route continuity.
- Do not change generated Reader output text, prompts, cache behavior, or backend APIs.
- Do not reopen `Graph`, `Home`, embedded `Notebook`, or shared shell chrome except for regression validation.

## Problem Statement
- Wide-desktop `Study` still opens with a large stage-shell banner that competes with the actual review task.
- The queue and evidence areas still read like two prominent support cards rather than a lighter questions-and-grounding layer.
- The current desktop browse state is calmer than the old dashboard, but it still stops short of Recall’s more review-led and questions-led organization.

## Goals
- Make the current review task visibly primary on wide desktop.
- Recast the upper Study surface as a lighter review dashboard rather than a presentation banner.
- Reframe queue support around a more Recall-like `Questions` hierarchy while keeping the local filter model.
- Keep evidence nearby and obvious without letting it read like a second destination pane.
- Carry only regression-safe adjustments into focused reader-led `Study`.

## Non-Goals
- No backend schema, storage, or API changes.
- No new question types, challenge flows, timers, streak systems, or bulk-management backends.
- No changes to `Graph`, `Home`, embedded `Notebook`, or Reader generated content.
- No removal of the current local-first study model in favor of a literal clone of Recall’s live product.

## Implementation Targets
- `/home/fa507/dev/accessible_reader/frontend/src/components/RecallWorkspace.tsx`
  - primary target for desktop Study structure and any focused Study regression-safe alignment
- `/home/fa507/dev/accessible_reader/frontend/src/index.css`
  - primary target for review dashboard, questions lane, and evidence/support visual hierarchy
- `/home/fa507/dev/accessible_reader/frontend/src/components/RecallWorkspace.stage37.test.tsx`
  - primary wide-desktop Study regression updates
- `/home/fa507/dev/accessible_reader/frontend/src/components/RecallWorkspace.stage34.test.tsx`
  - preserve focused Study split behavior
- `/home/fa507/dev/accessible_reader/frontend/src/App.test.tsx`
  - preserve route continuity and Reader/source handoffs
- `/home/fa507/dev/accessible_reader/scripts/playwright/*`
  - add Stage 704 implementation and Stage 705 audit harnesses for wide Study plus focused regression captures

## Internal Checkpoints

### Checkpoint 1: Review Dashboard Reset
- Replace the current large Study banner with a lighter review-dashboard header that uses overview metrics and a clearer current-review lead.
- Keep one active review card/workbench as the obvious primary action.

### Checkpoint 2: Questions And Evidence Hierarchy Reset
- Rework the side support so the queue reads more like a `Questions` manager and the evidence panel reads lighter and more attached.
- Preserve preview/reopen/filter/review behavior while removing unnecessary prose and card framing.

### Checkpoint 3: Focused Regression Alignment
- Keep focused Study stable beside Reader with only the minimal alignment needed after the desktop reset.
- No broad focused-mode redesign unless the desktop changes expose a direct regression.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm test -- src/components/RecallWorkspace.stage37.test.tsx src/components/RecallWorkspace.stage34.test.tsx src/App.test.tsx"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/backend && uv run pytest tests/test_api.py -k graph -q"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `node --check` for any new Stage 704/705 Playwright files
- real Windows Edge implementation run for Stage 704
- full Stage 705 audit run against `http://127.0.0.1:8000`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`

## Exit Criteria
- Wide desktop `Study` now reads as a clearer review dashboard with a dominant active review task and a lighter questions/evidence support structure.
- The browse state is materially closer to Recall’s current review direction than the Stage 703 regression baseline.
- Focused Study remains stable beside Reader.
- `Graph`, `Home`, embedded `Notebook`, and original-only `Reader` stay green as regression surfaces.
- Continuity rotates to Stage 704/705 and the queue advances to Stage 706/707 closeout only after the audit is green.
