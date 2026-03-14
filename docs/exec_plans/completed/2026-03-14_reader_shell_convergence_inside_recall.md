# ExecPlan: Reader Shell Convergence Inside Recall

## Summary
- Converge Reader onto the Recall-first product shell without regressing import, reopen, speech, notes, anchored jump-back, or outage handling.
- Keep routes and note/browser handoff stable while replacing the remaining standalone-reader framing with Recall-native structure, copy, and layout.
- Treat this as an approved post-Stage-10 correction before any Stage 11 work begins.

## Public Interfaces
- Keep `/reader?document=&sentenceStart=&sentenceEnd=` stable.
- Keep Reader settings, progress, note capture, and speech APIs unchanged in this slice.
- Shared frontend shell primitives may move, but no backend route or payload changes are planned.

## Implementation Changes
- Extract shared Recall shell primitives so Reader and Recall stop rendering as two visually separate apps.
- Remove the standalone `Accessible Reader` identity card and render Reader inside Recall-native hero, panel, and card structure.
- Move Reader import, library, transport, reading surface, note capture, and unavailable states into a layout that matches Recall hierarchy and language.
- Keep the reading surface ergonomics specific to Reader, but collapse duplicate shell chrome and copy that still reflect the pre-Recall app identity.
- Update continuity docs after the UI convergence lands so the repo no longer describes this work as undesirable churn.

## Test Plan
- Frontend:
  - app route and Reader anchor restore tests stay green
  - Reader empty, unavailable, note, and jump-back states remain covered after layout convergence
- Validation:
  - frontend `npm test -- --run`
  - frontend `npm run lint`
  - frontend `npm run build`
  - backend `pytest` and app import check
  - extension `npm test -- --run`
  - extension `npm run build`
  - rerun the repo-owned Edge harness after the UI convergence lands

## Assumptions
- Recall remains the single product shell.
- Reader keeps its route and reading behavior while converging onto Recall structure.
- Stage 11 remains queued until this shell-convergence correction is fully closed.

## Progress
- Implemented:
  - shared Reader/Recall hero usage through `WorkspaceHero`
  - Reader shell convergence onto Recall-native hero, cards, stage tabs, and sidebar copy
  - Reader view switching surfaced in-route through Recall-style tabs while preserving settings-drawer controls
  - import/library wording updated to `Add source` and `Source library`
  - remaining product-facing runtime labels updated to `Recall Workspace` and `Recall Workspace API`
- Validation status:
  - frontend `npm test -- --run`, `npm run lint`, and `npm run build` are green
  - backend `pytest` and app import check are green
  - extension tests, `npm run build`, and `npm run build:debug` are green
  - the repo-owned real Edge unpacked-extension harness remains green after the shell convergence
  - visual review of the Edge harness artifacts confirms Reader now presents inside the Recall-first shell rather than as a separate branded app

## Closeout
- Reader shell convergence is complete and no longer needs to remain as the active roadmap correction.
- The next active ExecPlan should return to the roadmap at Stage 11: portable annotation apply and manual knowledge promotion.
