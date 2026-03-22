# ExecPlan: Stage 423 Home Active Summary-Note Integration After Stage 422

## Summary
- The post-Stage-422 checkpoint still leaves `Home` as the clearest remaining Recall-parity gap in the current track.
- Stage 421/422 successfully tightened the active summary-to-preview join, but the active summary note still reads slightly too much like its own block above the attached previews instead of part of one continuous organizer branch.
- This stage keeps scope on `Home` only and integrates that active summary note into the attached preview flow when previews are expanded so the selected branch reads more like Recall's leanest organizer rails.

## Source Direction
- Recall's [Tagging deep dive](https://docs.getrecall.ai/deep-dives/tagging) frames the homepage organizer as a compact rail that drives the main board through lightweight, attached context rather than stacked secondary sub-panels.
- Recall's [Feb 6, 2026 release notes](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-6-2026-ocr-improved-organization-track-your-reading-pos) emphasize tag-tree improvements that make organization surfaces feel lighter, faster, and more integrated.
- The remaining mismatch after Stage 422 is no longer mostly spacing. It is placement: the active summary note should feel like a bridge into the attached preview list, not a standalone explanatory block between the row header and the previews.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Keep the Stage 422 summary-preview join structure as the base.
- Reset the remaining active summary-note mismatch:
  - when organizer previews are expanded for the active group, integrate the active summary note into the attached preview flow instead of leaving it as a standalone note inside the active button block
  - keep the active title/count row legible and selected
  - preserve the active note inside the button when previews are collapsed so the active group still carries context in compact mode
  - make the active branch read more like one continuous rail-driven selection without reviving boxed preview treatment
- Preserve current product behavior:
  - source search and filtering
  - group selection
  - collapse/expand organizer previews
  - pinned reopen actions
  - `Home` to focused-source handoff
  - shell `Search` and `New` actions
- Keep `Graph` and original-only `Reader` as regression checkpoints only.

## Guardrails
- Do not reopen generated-content `Reader` work.
- Keep `Reader` original-only and cosmetic-only in this track:
  - no `Reflowed`
  - no `Simplified`
  - no `Summary`
  - no generated-view UX
  - no transform logic
  - no generated placeholders
  - no generated-view controls
  - no mode-routing changes
- Do not widen into `Graph`, `Notes`, `Study`, or backend work in this stage unless a tiny shared-shell adjustment is required for the Home organizer reset to read correctly.
- Avoid a low-payoff trim: the active summary note should materially stop feeling like a detached explanatory line above a second preview tier.

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx` plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 423/424 harness pair
- real Windows Edge Stage 423 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` active organizer selection reads more like one continuous branch because the active summary note now bridges into the attached previews when expanded.
- The active summary note remains legible without carrying separate panel weight.
- Collapsed organizer previews still keep the active group context clear.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
