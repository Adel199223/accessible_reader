# ExecPlan: Stage 455 Home Direct Board And Organizer Hierarchy Reset After Stage 454

## Summary
- The Stage 454 audit closed the latest broad `Graph` slice and moved the clearest remaining Recall-parity gap back to `Home`.
- Wide desktop `Home` is materially calmer than it used to be, but the current hierarchy still diverges from Recall's current library flow in three visible ways:
  - the organizer rail is calmer, but it still shares too much ownership with the shell seam instead of reading as the primary tag-tree control center
  - the right side still opens with a featured `Open next` composition before the real working board fully begins
  - filtered and grouped browsing still carry more repeated board-heading chrome than Recall's more direct tag-to-card flow
- This stage resets `Home` around that broader interaction model instead of reopening another micro pass on labels, chips, or single-card sizing.

## Source Direction
- Recall's [Tagging deep dive](https://docs.getrecall.ai/deep-dives/tagging) defines the left tags panel as the central organizer:
  - filter tags
  - sort tags/cards
  - collapse all
  - close sidebar
  - click a tag to filter the card list on the right side of the home page
- The [Feb 6, 2026 release notes](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-6-2026-ocr-improved-organization-track-your-reading-pos) reinforce that direction with improved organization and tag-tree improvements:
  - flexible sorting
  - expand/collapse all
  - faster tag-tree interaction
  - filter by untagged items
  - a stronger left-panel organization model rather than a featured landing-card model
- The benchmark target is still directional rather than pixel-perfect: keep the organizer clearly in charge, and make the right side feel more like the active filtered card board itself.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css` as one broader organizer-and-board hierarchy reset.
- Make the organizer rail read more like the true tag-tree control center:
  - reduce repeated helper chrome at the top
  - tighten the handoff between search, sort, collapse, and the active group list
  - keep the selected branch and attached previews readable without feeling like a second featured content area
- Rebuild the right side as a more direct filtered card board:
  - demote the current featured `Open next` treatment
  - fold reopen continuity into a smaller attached rail or board header treatment
  - let the actual saved-source cards start earlier and occupy more of the visible board
- Keep grouped and filtered browsing inside the same canonical board shell:
  - fewer repeated headings
  - less “hero first, board second” staging
  - clearer sense that the selected organizer branch directly drives the board on the right
- Preserve current Home behaviors:
  - search
  - sort
  - collapse previews
  - hide organizer
  - pinned reopen continuity
  - direct source open / focused overview entry
  - organizer-hidden fallback stream
- Use only supported behaviors. Do not introduce fake tag-tree actions like create, rename, drag-and-drop, or bulk actions unless they map to real product behavior.

## Guardrails
- Do not widen into `Graph`, `Notes`, `Study`, backend, or storage work unless a tiny shared-shell adjustment is required for the Home reset to read correctly.
- Keep `Reader` original-only and cosmetic-only in this parity track:
  - no `Reflowed`
  - no `Simplified`
  - no `Summary`
  - no generated-view UX
  - no transform logic
  - no generated placeholders
  - no generated-view controls
  - no mode-routing changes

## Public Interfaces / Types
- No backend, schema, or API contract changes.
- No route changes are expected.

## Validation
- targeted Vitest for `src/components/RecallWorkspace.stage37.test.tsx` and `src/App.test.tsx`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node --check` for the Stage 455/456 harness pair
- real Windows Edge Stage 455 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` reads more like a Recall-style organizer-led library surface:
  - the organizer more clearly owns navigation and filtering state
  - the right side begins sooner as the real filtered card board
  - reopen continuity is present without behaving like a featured hero above the board
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
