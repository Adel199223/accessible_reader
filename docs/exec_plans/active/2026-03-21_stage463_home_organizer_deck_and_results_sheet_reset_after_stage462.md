# ExecPlan: Stage 463 Home Organizer Deck And Results Sheet Reset After Stage 462

## Summary
- The Stage 462 audit closed the latest broad `Graph` slice and moved the clearest remaining Recall-parity gap back to `Home`.
- Wide desktop `Home` is already much closer to Recall's organizer-led library flow, but the current top-of-workbench hierarchy still diverges in three visible ways:
  - the organizer rail still spends too much height on a card-like heading/search/control deck before the real tag list begins
  - the right side still uses stacked stage framing before the real card board fully starts
  - the attached reopen continuity is integrated, but it still reads more like a mini feature shelf than a light inline workbench strip
- This stage resets that broader top-of-workbench hierarchy in one pass instead of reopening another tiny typography or chip-only tweak.

## Source Direction
- Recall's [Tagging deep dive](https://docs.getrecall.ai/deep-dives/tagging) still defines the left tags panel as the central organizer:
  - filter tags
  - sort tags/cards
  - collapse all
  - close sidebar
  - click a tag to filter the card list on the right side of the home page
- The [Feb 6, 2026 release notes](https://feedback.getrecall.ai/changelog/recall-release-notes-feb-6-2026-ocr-improved-organization-track-your-reading-pos) reinforce that direction with faster tag-tree interaction, stronger sorting, and a calmer organization-first flow.
- The benchmark target remains directional rather than pixel-perfect: the organizer rail should feel more like the true control deck, and the right side should begin sooner as the real filtered card sheet.

## Scope
- Rework wide-desktop `Home` in `frontend/src/components/RecallWorkspace.tsx` and `frontend/src/index.css` as one organizer-deck and board-header reset.
- Compress the organizer rail top into a tighter control deck:
  - lighter heading framing
  - faster search-to-sort handoff
  - calmer collapse/hide controls
  - less dead vertical space before the active group list begins
- Rebuild the right-side board top so the card field starts sooner:
  - demote repeated stage framing
  - keep the selected-group summary direct and utility-like
  - reduce the sense of a separate feature band above the cards
- Keep reopen continuity attached, but make it read more like a lightweight inline strip inside the board:
  - less banner-like heading weight
  - less split between the pinned lead and nearby reopen cards
  - clearer sense that it is part of the same working sheet
- Preserve current Home behaviors:
  - search
  - sort
  - collapse previews
  - hide organizer
  - pinned reopen continuity
  - direct source open / focused overview entry
  - organizer-hidden fallback stream

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
- `node --check` for the Stage 463/464 harness pair
- real Windows Edge Stage 463 implementation run against `http://127.0.0.1:8000`

## Exit Criteria
- Wide-desktop `Home` reads more like a Recall-style organizer workbench:
  - the organizer deck starts faster and feels more like the control surface than a boxed header card
  - the active board begins sooner as the real filtered results sheet
  - the attached reopen continuity reads like part of the same working board instead of a featured band above it
- `Graph` and original-only `Reader` remain visually stable behind the Home pass.
