# ExecPlan: Stage 419 Home Organizer Preview Grouping Deflation After Stage 418

## Summary
- The post-Stage-418 checkpoint still leaves `Home` as the clearest remaining Recall-parity gap in the current track.
- Stage 417/418 successfully softened the active count/readout and flattened the selected organizer row, but the selected preview stack still reads too much like a grouped mini-card under the active row instead of one continuous rail-driven selection flow.
- This stage keeps scope on `Home` only and removes that remaining grouped preview framing so the active organizer state reads more like Recall's leanest utility-first rail lists.

## Source Direction
- Recall's [Tagging deep dive](https://docs.getrecall.ai/deep-dives/tagging) frames the homepage organizer as a compact rail that drives the main board through lightweight selection and attached context rather than nested card stacks.
- Recall's [changelog](https://feedback.getrecall.ai/changelog) continues to emphasize simpler organization surfaces, lighter browse flows, and faster scanning over framed panel hierarchies.
- The remaining mismatch after Stage 418 is no longer the count/readout. It is grouping: the attached selected preview should feel like part of the rail, not like a highlighted child card nested inside the rail.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Keep the Stage 418 organizer readout-softening structure as the base.
- Reset the remaining active preview grouping:
  - deflate the selected preview child so it stops reading as a bordered mini-card
  - make the active row and attached preview children read more like one continuous rail flow driven by the organizer spine
  - trim any remaining extra inset spacing or framing that separates the active row from its attached preview list
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
- Avoid a low-payoff trim: the active organizer state should materially stop looking like a parent row with a framed preview card nested beneath it.

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx` plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 419/420 harness pair
- real Windows Edge Stage 419 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` active organizer selection reads more like one continuous rail state and less like a grouped row-plus-child-card stack.
- The attached selected preview remains legible without behaving like a boxed mini-card.
- The organizer rail keeps clear hierarchy while looking flatter and more Recall-like.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
