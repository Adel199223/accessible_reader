# ExecPlan: Stage 421 Home Organizer Summary-Preview Join Tightening After Stage 420

## Summary
- The post-Stage-420 checkpoint still leaves `Home` as the clearest remaining Recall-parity gap in the current track.
- Stage 419/420 successfully removed the boxed attached-preview treatment, but the active organizer summary still sits slightly too far above its attached previews, so the selected branch reads more stacked than Recall's leanest organizer rails.
- This stage keeps scope on `Home` only and tightens that summary-to-preview handoff so the active branch reads more like one continuous rail list.

## Source Direction
- Recall's [Tagging deep dive](https://docs.getrecall.ai/deep-dives/tagging) frames the homepage organizer as a compact rail that drives the main board through lightweight selection and attached context rather than stacked mini-panels.
- Recall's [changelog](https://feedback.getrecall.ai/changelog) continues to emphasize simpler organization surfaces, faster scanning, and less framed browse chrome.
- The remaining mismatch after Stage 420 is now mostly vertical rhythm: the active group summary and attached previews should feel more tightly joined, not like a summary block followed by a secondary preview block.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css`.
- Keep the Stage 420 organizer preview-grouping deflation structure as the base.
- Reset the remaining active summary-to-preview separation:
  - tighten the vertical handoff between the active group summary and the attached preview list
  - reduce any remaining padding or spacing that makes the active branch feel like two stacked sub-panels
  - keep the organizer spine visually continuous from the selected summary into the preview children
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
- Avoid a low-payoff trim: the active organizer selection should materially stop reading like a summary block with a separate preview tier beneath it.

## Validation
- targeted Vitest for `RecallWorkspace.stage37.test.tsx` plus `App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 421/422 harness pair
- real Windows Edge Stage 421 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` active organizer selection reads more like one continuous rail branch and less like a summary row plus a second attached tier.
- The active group summary remains legible while sitting more tightly against the attached previews.
- The organizer rail keeps clear hierarchy while looking more Recall-like.
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
