# ExecPlan: Stage 425 Home Active Summary Copy-Weight Deflation After Stage 424

## Summary
- The post-Stage-424 checkpoint still leaves `Home` as the clearest remaining Recall-parity gap in the current track.
- Stage 423/424 successfully integrated the active summary note into the attached preview flow, but the expanded active description still carries slightly too much sentence weight compared with Recall's leanest organizer rails.
- This stage keeps scope on `Home` only and deflates that remaining copy weight by using a shorter expanded-branch bridge description while keeping the broader section descriptions and collapsed behavior intact.

## Source Direction
- Recall's [Tagging deep dive](https://docs.getrecall.ai/deep-dives/tagging) frames the homepage organizer as a compact rail that drives the main board through lightweight, attached context instead of verbose explanatory text.
- Recall's [Feb 6, 2026 release notes](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-6-2026-ocr-improved-organization-track-your-reading-pos) continue that direction by emphasizing lighter tag-tree organization UX and faster scanning.
- The remaining mismatch after Stage 424 is now mostly copy weight: the active description should read like a concise rail hint, not a full explanatory sentence.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and keep CSS changes minimal or unnecessary unless required for the shorter bridge copy to read correctly.
- Keep the Stage 424 summary-note integration structure as the base.
- Reset the remaining active-description mismatch:
  - use a shorter, lower-weight bridge description for the active expanded organizer branch
  - preserve the broader section descriptions anywhere else they are still appropriate
  - preserve collapsed organizer behavior, including the compact active context line when previews are hidden
  - keep the selected branch reading like one continuous rail-driven flow without reviving heavier helper copy
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
- Avoid a low-payoff trim: the expanded active description should materially feel less sentence-like than the Stage 424 bridge copy.

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx` plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 425/426 harness pair
- real Windows Edge Stage 425 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` active organizer selection uses a noticeably lighter expanded bridge description.
- The active branch remains legible and calm without restoring explanatory sentence weight.
- Collapsed organizer previews still keep the active group context clear.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
