# ExecPlan: Stage 427 Home Active Bridge-Hint Retirement After Stage 426

## Summary
- The post-Stage-426 checkpoint still leaves `Home` as the clearest remaining Recall-parity gap in the current track.
- Stage 425/426 successfully deflated the active bridge copy, but the expanded active branch still carries one visible helper-hint line that Recall's leanest organizer rails often do not need at all.
- This stage keeps scope on `Home` only and retires that expanded bridge hint so the selected branch relies on the active row plus attached previews rather than a remaining helper sentence.

## Source Direction
- Recall's [Tagging deep dive](https://docs.getrecall.ai/deep-dives/tagging) frames the homepage organizer as a compact rail with lightweight attached context and fast scanning rather than verbose active-state helper copy.
- Recall's [Feb 6, 2026 release notes](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-6-2026-ocr-improved-organization-track-your-reading-pos) continue that direction by emphasizing lighter tag-tree organization UX and faster browsing.
- The remaining mismatch after Stage 426 is now mostly presence, not wording: the active branch still shows a visible helper hint that makes the selected state read slightly more coached than Recall's leanest organizer rails.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Keep the Stage 426 organizer structure as the base.
- Reset the remaining active-branch mismatch:
  - retire the visible helper hint from the expanded active organizer branch
  - let the selected row, branch spine, and attached preview rows carry the branch on their own
  - preserve broader section descriptions elsewhere they still make sense
  - preserve collapsed organizer behavior, including the compact active context when previews are hidden
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
- Avoid a low-payoff trim: the expanded active branch should materially stop reading like it needs a helper hint to explain itself.

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx` plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 427/428 harness pair
- real Windows Edge Stage 427 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` active organizer selection no longer shows a visible helper hint in the expanded branch.
- The selected branch still reads clearly through row state and attached previews alone.
- Collapsed organizer previews still keep the active group context clear.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
