# ExecPlan: Stage 417 Home Organizer Readout Softening After Stage 416

## Summary
- The post-Stage-416 checkpoint still leaves `Home` as the clearest remaining Recall-parity gap in the current track.
- Stage 415/416 successfully deflated the organizer highlight chrome, but the active count/readout still lands slightly too much like a standalone badge instead of a quiet attached status hint inside the rail.
- This stage keeps scope on `Home` only and softens that remaining active-row readout emphasis so the selected organizer state reads more like Recall's leanest utility-first tag list.

## Source Direction
- Recall's [Tagging deep dive](https://docs.getrecall.ai/deep-dives/tagging) frames the homepage organizer as a compact rail that drives the main board through lightweight selection states and fast scanning.
- Recall's [changelog](https://feedback.getrecall.ai/changelog) continues to emphasize simpler organization surfaces, lighter browse flows, and cleaner at-a-glance control states.
- The remaining mismatch after Stage 416 is mostly in the readout treatment: the active row should still be unmistakable, but more through a continuous rail rhythm than through a pill-like count marker or extra selection tint.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Keep the Stage 416 organizer continuity structure as the base.
- Reset the remaining active readout emphasis:
  - further soften the selected-row count chip so it reads closer to an attached inline status hint than a rounded badge
  - trim the last bit of framed row tint around the active organizer entry so the rail reads flatter and more continuous
  - keep attached preview children visually subordinate and in the same organizer rhythm
  - preserve clear selection affordance in both expanded and collapsed organizer states
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
- Avoid another no-op trim: the active organizer row should materially stop depending on chip-and-wash emphasis to feel selected.

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx` plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 417/418 harness pair
- real Windows Edge Stage 417 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` active organizer selection reads more like a minimal rail selection and less like a row with a standalone badge.
- The active count/readout remains legible without behaving like a prominent chip.
- The selected row and attached previews feel flatter and more continuous.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
