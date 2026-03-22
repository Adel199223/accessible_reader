# ExecPlan: Stage 413 Home Organizer-Selection Continuity Reset After Stage 412

## Summary
- The post-Stage-412 checkpoint still leaves `Home` as the clearest remaining Recall-parity gap in the current track.
- Stage 411/412 flattened the organizer rows and reduced the mini-card feel, but the active organizer selection still reads a little too much like a bounded panel with attached content.
- This stage keeps the scope on `Home` only and resets the selected organizer state so the chosen row plus its attached previews read more like one continuous rail list, closer to Recall's lean tag-tree flow.

## Source Direction
- Recall's [Tagging deep dive](https://docs.getrecall.ai/deep-dives/tagging) frames tags as a compact organizer that drives the library rather than a nested card shelf.
- Recall's [changelog](https://feedback.getrecall.ai/changelog) continues to emphasize quicker organization, clearer library scanning, and lighter browse chrome over boxed browse treatments.
- The remaining mismatch after Stage 412 is mostly selection continuity: the active organizer state should feel selected and grounded without becoming a separate panel inside the rail.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Keep the Stage 412 flatter row rhythm as the base.
- Reset the active organizer selection so it reads more like one continuous selected rail state:
  - reduce the sense of a boxed active panel around the selected row
  - visually connect the selected row and its attached previews into one continuous rail list
  - lighten the active-row background treatment while preserving clear selection affordance
  - keep the selected preview children visibly subordinate and list-like instead of feeling like inset cards
  - preserve a clear collapsed state when previews are hidden
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
- Avoid another micro-pass: the visible result should materially reduce the sense that the active organizer group is a self-contained panel.

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx` plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 413/414 harness pair
- real Windows Edge Stage 413 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` active organizer selection reads as one continuous rail state instead of a compact highlighted panel.
- The selected row remains clearly active without reviving bulky card chrome.
- Attached preview children feel like part of the same rail flow, not inset cards living inside a panel.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
