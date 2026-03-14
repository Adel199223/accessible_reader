# ExecPlan: Stage 20 Adaptive Context Compression and Detail Consolidation

## Summary
- Stage 19 solved the visibility problem: the shell now surfaces the current working set and recent work directly.
- That success exposed the next UX bottleneck more clearly: repeated context.
- In Reader and Notes especially, the new shell dock now overlaps too much with existing local context cards and detail metadata, so the app still spends too much vertical space repeating information the user already has in view.
- The next bounded slice is to keep the continuity and quick-switch gains while compressing redundant context and tightening where detail actually belongs.

## Goals
- Reduce repeated source, note, and status context across the shell dock and section-specific panels.
- Keep current context and recent work visible, but make them lighter and more adaptive to the active section.
- Reclaim above-the-fold space and improve scan speed without removing the Stage 18 and 19 continuity gains.

## Implementation
- Adaptive shell dock:
  - make the current-context dock section-aware so it compacts further when the active section already exposes rich local context
  - keep recent work visible, but allow the current-context card to collapse into a denser presentation on Reader and Notes
  - preserve quick actions while trimming repeated explanatory copy and duplicated metadata
- Detail consolidation:
  - remove or compress duplicated document/note/status blocks where the same facts appear both in the dock and inside the active section
  - prioritize one primary place for each type of context:
    - shell for cross-section orientation and switching
    - local section panels for section-specific detail and editing
- Reader and Notes focus:
  - tighten Reader current-source and Notes detail metadata so they complement the shell dock rather than restating it
  - preserve anchored reopen, note editing, and reading controls exactly as they work now
- Architecture:
  - keep this slice frontend-only unless a tiny shared-state cleanup materially improves maintainability
  - build on the Stage 19 dock instead of replacing it with a separate shell system

## Constraints
- Preserve local-first parsing, storage, search, settings, progress, deterministic reflow, speech behavior, note anchors, and browser-companion handoff.
- Keep `/recall` and `/reader?document=...&sentenceStart=...&sentenceEnd=...` stable.
- Do not reopen deferred scope by default:
  - local TTS
  - OCR for scanned PDFs
  - cloud sync/collaboration
  - chat/Q&A
  - new AI surfaces beyond existing `Simplify` and `Summary`

## Test Plan
- Frontend targeted coverage:
  - current-context dock remains visible and actionable while adapting its density by section
  - Reader and Notes no longer duplicate the same context in both the shell and local detail panels
  - recent-work switching still reopens the correct section/detail state after the compression pass
- Validation:
  - `frontend npm test -- --run`
  - `frontend npm run lint`
  - `frontend npm run build`
  - rerun the Stage 19 real Edge current-context smoke after the compression pass
  - add a new repo-owned real Edge visual smoke if the shell layout changes materially

## Notes
- This is a UX refinement slice that follows directly from the Stage 19 artifacts.
- The goal is not to remove the dock, but to make the shell feel lighter and more precise now that the right information is finally visible.

## Closeout
- Completed on 2026-03-14.
- Delivered:
  - a section-aware shell dock that now compresses more aggressively in Reader and Notes while keeping current-context actions and recent-work switching visible
  - a lighter Reader sidecar that no longer repeats a dedicated current-source summary block now that the shell already carries that context
  - a lighter Notes detail surface that replaces the old repeated metadata grid with compact chips, keeps the anchor preview and note editor primary, and moves promotion controls behind the actual note work
  - targeted frontend regression coverage that protects the compressed dock, lighter Reader sidecar, and condensed Notes detail behavior
  - a repo-owned real Edge context-compression smoke harness covering Reader note capture, dock compression, condensed Notes detail, and anchored Reader reopen
- Validation:
  - `frontend npm test -- --run`
  - `frontend npm run lint`
  - `frontend npm run build`
  - real Edge smoke: `scripts/playwright/stage20_context_compression_edge.mjs`
