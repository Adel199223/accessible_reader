# ExecPlan: Stage 459 Home Inline Reopen Strip And Board-Dominant Workspace Reset After Stage 458

## Summary
- The Stage 458 audit closed the latest broad `Graph` slice and moved the clearest remaining Recall-parity gap back to `Home`.
- Wide desktop `Home` is materially calmer than it used to be, but the current hierarchy still diverges from Recall's current organizer-led library flow in one broad way:
  - the active board is stronger, but the pinned reopen continuity still occupies a competing right-side lane instead of reading like a compact continuation strip inside the same working board
- This stage resets `Home` around that broader structural issue instead of reopening another micro pass on labels, chips, or row spacing.

## Source Direction
- Recall's [Tagging deep dive](https://docs.getrecall.ai/deep-dives/tagging) keeps the left tags panel as the primary organizer:
  - click a tag to filter the cards on the right
  - sort tags and cards
  - collapse all
  - close the sidebar when more board space is needed
- The [Feb 6, 2026 release notes](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-6-2026-ocr-improved-organization-track-your-reading-pos) reinforce that direction with stronger organization and reading-position continuity:
  - improved organization
  - flexible sorting
  - expand/collapse improvements
  - continuity that supports the board instead of overtaking it
- The benchmark target remains directional rather than pixel-perfect: keep the organizer as the owner of browsing state, and make the right side feel like one working board with a compact attached continuation strip instead of a board-plus-sidecar split.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css` as one broader board-dominant workspace reset.
- Rebuild the pinned reopen continuity as an inline board companion:
  - remove the dedicated right-side lane in the direct-board layout
  - place pinned reopen content inside the main board flow near the top
  - keep the lead reopen target obvious without letting it dominate the board
- Let the active filtered/grouped board begin sooner:
  - reduce the visible weight of the selected-group heading block
  - shorten the gap between board heading and first card row
  - keep matching-results and selected-group browsing inside the same structural model
- Preserve current Home behaviors:
  - search
  - sort
  - collapse previews
  - hide organizer
  - pinned reopen continuity
  - direct source open / focused overview entry
  - organizer-hidden fallback stream
- Keep the changes broad enough to matter visually, but constrained to `Home` presentation and hierarchy rather than navigation semantics or data rules.

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
- `node --check` for the Stage 459/460 harness pair
- real Windows Edge Stage 459 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` reads more like Recall's current organizer-led library flow:
  - the organizer more clearly owns browsing and filtering state
  - the right side behaves like one board-dominant working surface
  - reopen continuity stays visible without behaving like a separate featured side lane
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
