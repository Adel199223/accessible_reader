# ExecPlan: UI Accessibility Polish

Status: parked on 2026-03-13 when the project roadmap shifted to Stage 1A baseline stabilization plus shared document-core extraction. The current UI branch state from this plan is being stabilized under the new active ExecPlan before any further UI-only polish continues.

## Purpose
- Improve the app chrome so the interface itself is calmer and easier to use for dyslexia- and ADHD-leaning reading workflows.
- Reduce cognitive load in the mode/speech/settings area without expanding product scope.

## Scope
- In scope:
  - frontend layout and styling changes that simplify the control hierarchy
  - copy adjustments that make controls more self-explanatory
  - bounded backend support for local document deletion so the decluttered library can manage its contents directly
  - focused validation for the revised UI
- Out of scope:
  - new product features
  - local TTS implementation
  - AI scope expansion

## Assumptions
- The current scoped v1 roadmap was complete before this reprioritization.
- The user is explicitly reprioritizing interface polish as the next milestone.
- The toolbar and settings presentation are the highest-friction areas right now.

## Milestones
1. Rework the control deck and settings summary into clearer, lower-noise groups.
2. Adjust visual hierarchy, spacing, and typography for a calmer reading interface.
3. Revalidate frontend behavior and update continuity docs for the reprioritized milestone.

## Detailed Steps
1. Replace the passive post-v1 continuity plan with this active UI polish plan.
2. Split the current mixed toolbar into guided sections for view choice, read aloud, and voice pacing.
3. Tighten sidebar/settings copy and layout so the screen feels less crowded.
4. Run frontend tests, lint, and build, then update roadmap continuity notes.
5. If future Codex work resumes from a prompt-based handoff, use the inspect-first delta template rather than redoing already-good work.
6. For the delta-refinement follow-up, keep the existing three-step structure and only tighten the remaining weak spots:
   - replace text-heavy speech controls with a compact icon-first transport
   - make sentence selection keyboard-accessible without reopening speech architecture
   - expose a quick font-preset chooser in the always-visible settings summary
7. For the next bounded pass, keep the current interaction model and focus on the remaining visual noise:
   - tune the default palette toward warm sepia and repurpose the alternate theme into a dim charcoal option
   - make the settings card truly collapsed by default instead of leaving a large summary panel visible
   - replace the no-document reader shell with a compact onboarding empty state
8. For the next bounded pass after live review, keep the current app-wide theme persistence and reading controls, but fix settings clarity:
   - make it obvious that font and theme apply to the whole app, not just the open document
   - replace passive-looking summary chips and duplicated selects with clearly interactive appearance controls
   - clarify in the reading-controls copy that `Original`, `Reflowed`, `Simplified`, and `Summary` change the document view only
9. For the next bounded pass after the settings fix, keep the current interaction model and reduce left-sidebar density:
   - shorten the page-header, import, and library copy so the first column scans faster
   - reduce passive explanatory text and vertical footprint without hiding import or reopen actions
   - keep the AI/local-first boundary visible, but in a smaller, calmer sidebar note
10. For the next bounded pass after the sidebar cleanup, keep the current grouped controls but reduce main-panel control density:
   - remove repeated explanatory text inside the view and transport sections
   - compress mode switching, transport status, and voice/rate controls into a faster-scanning layout
   - preserve the same transport, view-generation, and voice behavior while reducing visual bulk
11. For the next bounded pass after the controls cleanup, keep the current reader behavior but reduce reader chrome:
   - remove the duplicated `Current document` and `Reading surface` labels plus the second visible title
   - move view/origin/cache metadata into one compact row in the reader header
   - keep the AI create action in the same compact header row when the selected AI view has not been generated yet
12. For the next bounded pass after the reader cleanup, keep the current sepia/charcoal structure but refine the darker mode and micro-metadata:
   - keep the warm charcoal foundation instead of switching to pure black or harsher high-contrast styling
   - remove repeated `Local` and `AI` pills from the mode tabs and reduce metadata to one compact place
   - shorten the collapsed settings row and other low-value helper copy so the interface reads as controls instead of status reporting
   - reduce the visual weight of the voice panel and import card while a document is already open
13. For the next bounded pass after the calm-charcoal cleanup, fix the remaining structural defects instead of recoloring again:
   - stop inactive library entries from inheriting the global accent-button treatment
   - stop the reader card from stretching to fill vertical space when a document is short
   - collapse import into an `Add another document` disclosure while a document is already open
   - compress the collapsed settings row and sidebar header into thinner reading-state chrome
14. For the next bounded pass after the structural fixes, keep the existing palette and behavior model but declutter the active-reading experience for new users:
   - use balanced progressive disclosure so core reading actions stay visible while low-frequency guidance and controls collapse behind accessible info/disclosure controls
   - remove repeated standing helper copy in the appearance bar, controls deck, sidebar, and reader shell
   - reduce the weight of secondary panels like voice settings, library metadata, and support notes without hiding essential actions
15. For the next bounded pass after the newbie-first declutter, keep the same behavior but remove the remaining obvious clutter and split settings from reading controls:
   - remove the standalone top appearance bar and replace it with one persistent settings entrypoint that opens a right-side drawer
   - move secondary reading items such as voice, rate, reading progress, shortcut help, and summary detail behind a three-dot overflow in the read-aloud section
   - remove visible info/tips pills and obvious helper sentences from the main reading layout instead of replacing them with more chrome
   - simplify settings into compact Appearance and Reading layout sections with segmented controls and inline values
16. For the next bounded pass after the drawer split, keep the same behavior model but reduce always-visible choice even further:
   - move `View` out of the main page and into the settings drawer so the top reading layout keeps only transport visible
   - turn the settings drawer into a segmented, document-aware drawer with `View`, `Appearance`, and `Layout` sections instead of one long stacked panel
   - keep `Summary detail` with `View` inside the drawer and leave the existing AI create action in the reader header rather than duplicating it
17. For the next bounded pass after the segmented drawer, keep the settings split but make the active-reading shell more utility-first:
   - replace the in-flow transport card with a thin sticky read-aloud bar that stays visible while the reader scrolls
   - collapse the library by default only while a document is open, while keeping it open in the empty state
   - add single-document delete to the library through a compact row action and backend delete route
   - replace the larger top-left hero copy with a compact `Accessible Reader` brand block plus a short tagline
   - reduce the reading-state sidebar note weight so the reader surface and sticky transport dominate the page

## Decision Log
- 2026-03-12: The user explicitly reprioritized interface accessibility polish after reviewing the live localhost app.
- 2026-03-12: The control deck was split into guided view/read-aloud/voice sections, settings gained an always-visible summary, and the sidebar copy was simplified to reduce cognitive load.
- 2026-03-12: Live review found reader text bleeding through the controls chrome during long-document scroll because the full controls card remained sticky and semi-transparent; the next correction removes that overlap path and tightens the top-of-page chrome.
- 2026-03-12: The full controls card now scrolls naturally instead of pinning over the reader, and the card/control surfaces are fully opaque so long-document text no longer bleeds through them.
- 2026-03-12: Inspect-first review confirmed that the grouped controls, calmer surfaces, settings summary, sentence highlight sync, curated Edge voice ordering, and speech reset-loop fixes were already good and should be preserved.
- 2026-03-12: The remaining bounded delta is narrower: text-heavy transport controls still feel clunky, sentence selection is mouse-first instead of keyboard-accessible, and the dyslexia-friendly font choice is still buried behind the full settings panel.
- 2026-03-12: The follow-up refinement replaced the text-heavy speech row with an icon-first transport, added keyboard activation for sentence selection, surfaced a quick font chooser in the collapsed settings card, and filtered global shortcuts so sentence and button focus no longer collide with the Space shortcut.
- 2026-03-12: Chromium and Edge validation passed for the refined transport, quick font chooser, and keyboard sentence selection; no extra Edge-specific speech handoff changes were needed after this pass.
- 2026-03-12: The next polish pass should preserve the Atkinson-first font stack, shift the visual theme toward sepia plus charcoal rather than bright paper plus generic high contrast, and remove the oversized pre-document reader chrome.
- 2026-03-12: The palette and empty-state refinement kept the Atkinson-first font stack, converted the UI to a warmer sepia default plus dim charcoal alternate, made settings truly collapsed by default, and replaced the oversized pre-document reader shell with a compact onboarding state.
- 2026-03-12: Inspect-first review of the latest settings panel confirmed that theme and font already persist app-wide through the app shell, but the expanded disclosure mixes summary chips, quick-preset buttons, and duplicate form controls in a way that makes appearance settings feel passive or document-scoped.
- 2026-03-12: The next bounded delta should preserve the existing theme logic and persistence model, but reframe the panel as explicit app appearance plus reading layout controls so users can immediately see how to switch sepia versus charcoal for the whole interface.
- 2026-03-12: The settings clarity refinement kept the existing app-shell theme persistence, added a closed-state quick app-theme switch, rewrote the expanded disclosure into explicit `App appearance` plus `Reading layout` sections, and clarified that document view buttons change only the open document.
- 2026-03-12: The next bounded follow-up should stay in the sidebar: live review still shows too much passive copy and vertical bulk in the left column even though theme/settings behavior is now clearer.
- 2026-03-12: The sidebar-density refinement kept the existing import and reopen workflow, shortened the left-column copy, compacted the import and library cards, and replaced the larger support note with a smaller `AI stays optional` card.
- 2026-03-12: The next bounded follow-up should stay in the main controls deck: live review still shows unnecessary height from repeated helper copy, tall mode cards, and a full-width voice section even though the underlying behavior is already correct.
- 2026-03-12: The control-density refinement kept the same view, transport, and voice behavior, but reduced repeated helper text, converted the mode buttons into lighter label-plus-origin controls, moved sentence status into the transport section, and placed the voice panel alongside the main controls on desktop.
- 2026-03-12: The next bounded follow-up should stay in the reader card: live review still shows duplicated document chrome because the reader header and reading surface both present context labels and titles before the actual content starts.
- 2026-03-12: The reader-chrome refinement kept the same reader behavior, removed the duplicated `Current document` and `Reading surface` labels, moved view/origin/cache metadata into the compact reader header, and kept the AI create action in that header row when an AI view has not been generated yet.
- 2026-03-12: Follow-up review of the darker mode confirmed that the warm charcoal foundation is the right direction, but not yet the cleanest implementation; the remaining friction is small teal-on-dark chips, repeated `Local` / `AI` pills, and summary-style helper text that adds clutter without helping navigation.
- 2026-03-12: The calm-charcoal refinement kept the warm dark palette, removed the repeated `Local` / `AI` pills from the mode tabs, reduced reader metadata to minimal conditional chips, shortened the closed settings row, calmed passive dark-mode chips to warm neutral surfaces, and trimmed the voice/import chrome without changing behavior.
- 2026-03-12: Live review of the calm-charcoal build showed two remaining objective defects: inactive library rows still look active because they inherit the global button accent, and short documents still sit inside an overstretched reader card with too much dead space beneath the content.
- 2026-03-12: The follow-up layout fix kept the charcoal palette and behavior model, but corrected the remaining structural defects: inactive library rows now use passive styling, short reader cards stop stretching to viewport height, the import form collapses behind `Add another document` during active reading, and the closed settings row/header are thinner.
- 2026-03-12: Live review after the structural fixes confirmed that the main remaining friction is scanability for a new user, not behavior: the app still repeats too much helper copy, leaves low-frequency controls open, and gives equal weight to primary and secondary UI.
- 2026-03-12: The next declutter pass should use balanced disclosure with short inline help plus accessible info toggles so view, transport, and current progress stay visible while secondary help and controls become on-demand.
- 2026-03-12: The newbie-first declutter pass kept the existing palette and behavior model, but replaced repeated helper text with reusable info/tips disclosures, collapsed voice and rate behind an on-demand panel, shortened the active-reading sidebar chrome, and reduced library metadata noise without hiding core reading actions.
- 2026-03-13: Live review of the decluttered build showed that the remaining friction is no longer card count alone but where secondary controls live: the standalone appearance bar still steals top-of-page attention, visible info/tips chips still read as clutter, and settings need to move into a contained drawer while read-aloud secondary controls move into a tighter overflow.
- 2026-03-13: The controls-overflow follow-up removed the standalone appearance bar, moved settings into a right-side drawer, moved secondary read-aloud controls into a three-dot overflow, removed the remaining visible info/tips/helper chrome from the main layout, and kept primary reading actions visible.
- 2026-03-13: Live review of the drawer split showed that `View` still competes too heavily with transport when it stays on the page, while the drawer itself is still too long and stacked for a settings surface.
- 2026-03-13: The next bounded follow-up should move `View` into the settings drawer, make the drawer segmented and document-aware, and keep the main reading page transport-only while leaving AI creation behavior in the reader header.
- 2026-03-13: The settings-drawer consolidation follow-up moved `View` into the drawer, converted the drawer into segmented `View` / `Appearance` / `Layout` sections, kept transport as the only always-visible control group on the main page, and moved `Summary detail` out of the read-aloud overflow into the drawer `View` section.
- 2026-03-13: Live review after the drawer consolidation showed three remaining hierarchy issues: the transport still feels like an in-flow card instead of a persistent reading tool, the library still cannot manage or hide itself during active reading, and the top-left brand/header still carries more copy than the current polished layout needs.
- 2026-03-13: The next bounded pass should convert transport into a sticky top bar, make the library collapsible by context and deletable, and simplify the sidebar brand/note chrome without reopening speech, AI, or local-TTS scope.

## Validation
- Frontend: `npm test`, `npm run lint`, `npm run build`
- Live app: visual check in Edge after the layout changes land
- Latest refinement artifacts: `output/playwright/ui-accessibility-delta-chromium.png` and `output/playwright/ui-accessibility-delta-edge.png`
- Latest palette/empty-state artifacts: `output/playwright/ui-sepia-empty-chromium.png`, `output/playwright/ui-sepia-empty-edge.png`, `output/playwright/ui-charcoal-document-chromium.png`, and `output/playwright/ui-charcoal-document-edge.png`
- Latest settings-clarity artifacts: `output/playwright/settings-clarity-chromium.png`, `output/playwright/settings-clarity-edge.png`, and `output/playwright/settings-clarity-validation.json`
- Latest sidebar-density artifacts: `output/playwright/sidebar-density-chromium.png`, `output/playwright/sidebar-density-edge.png`, and `output/playwright/sidebar-density-validation.json`
- Latest control-density artifacts: `output/playwright/control-density-chromium.png`, `output/playwright/control-density-edge.png`, and `output/playwright/control-density-validation.json`
- Latest reader-chrome artifacts: `output/playwright/reader-chrome-local-chromium.png`, `output/playwright/reader-chrome-summary-chromium.png`, `output/playwright/reader-chrome-local-edge.png`, `output/playwright/reader-chrome-summary-edge.png`, and `output/playwright/reader-chrome-validation.json`
- Latest calm-charcoal artifacts: `output/playwright/charcoal-refinement-chromium.png`, `output/playwright/charcoal-refinement-edge.png`, and `output/playwright/charcoal-refinement-validation.json`
- Latest layout-fix artifacts: `output/playwright/charcoal-fixes-top-chromium.png`, `output/playwright/charcoal-fixes-short-chromium.png`, `output/playwright/charcoal-fixes-top-edge.png`, `output/playwright/charcoal-fixes-short-edge.png`, and `output/playwright/charcoal-fixes-validation.json`
- Latest newbie-first declutter artifacts: `output/playwright/newbie-declutter-charcoal-chromium.png`, `output/playwright/newbie-declutter-sepia-chromium.png`, `output/playwright/newbie-declutter-sepia-edge.png`, and `output/playwright/newbie-declutter-validation.json`
- Latest controls-overflow artifacts: `output/playwright/controls-overflow-chromium.png`, `output/playwright/settings-drawer-chromium.png`, and `output/playwright/edge-active-reader.png`
- Latest view-in-settings artifacts: `output/playwright/view-in-settings-chromium.png`, `output/playwright/view-in-settings-edge.png`, and `output/playwright/view-in-settings-validation.json`

## Progress
- [x] Milestone one
- [x] Milestone two
- [x] Milestone three

## Surprises and Adjustments
- 2026-03-12: The first polish pass improved hierarchy but kept the old sticky-controls behavior, which is incompatible with semi-transparent card surfaces on long documents.
- 2026-03-12: The current implementation already satisfies most of the prototype-inspired refinement prompt, so this follow-up should not rebuild the layout or reopen completed speech/search/reopen milestones.
- 2026-03-12: Live review after the transport/theme pass showed that the biggest remaining friction is not function but initial density: too much interface is still visible before there is anything to read.
- 2026-03-12: The collapsed settings card and true empty state removed most of the pre-document clutter without changing the underlying reading workflow or reopening backend scope.

## Handoff
- Keep follow-up feedback bounded to interface clarity and ergonomics; do not reopen completed speech/search/reopen milestones unless the new layout exposes a regression.
- For future prompt-based continuation, use `docs/assistant/templates/CODEX_DELTA_REFINEMENT_PROMPT.md` and keep the pass bounded to `add if missing, correct if weak, keep if already good`.
- Latest validation artifacts for this sub-pass are `output/playwright/ui-overlap-fixed-chromium.png`, `output/playwright/ui-overlap-fixed-edge.png`, and `output/playwright/ui-overlap-fixed-mobile.png`.
- The next refinement pass should validate transport labels/tooltips in Chromium and Edge and record whether any extra Edge-specific speech handoff work was actually necessary after the UI tightening.
- This delta confirmed the existing speech hook was already stable enough; future polish should stay at the interface level unless a new live-browser regression appears.
- The next bounded refinement should validate the true empty-state flow, the settings disclosure behavior, and the sepia/charcoal palettes in Chromium and Edge, then return to post-v1 continuity if accepted.
- This pass confirmed the current font and interaction model were already strong enough; the remaining improvement came from calmer theme values and reducing what is shown before a document exists.
- The current follow-up should stay bounded to settings clarity and appearance control discoverability; it should not reopen theme persistence, reading-mode behavior, or backend settings storage.
- Live review confirmed that the theme logic was working but under-signaled; the fix was better control grouping and wording rather than another theme-system rewrite.
- The current follow-up should preserve the left-column workflow and only compress wording, spacing, and low-signal chrome in the sidebar cards.
- Live Chromium and Edge review confirmed that the sidebar can be reduced further without hiding import or reopen actions; the improvement came from shorter wording and smaller card chrome rather than introducing new collapsible behavior.
- The current follow-up should preserve the existing controls behavior and focus only on reducing vertical control density and repeated instructional text in the main panel.
- Live Chromium and Edge review confirmed that the controls deck can be compressed substantially without reopening speech or AI behavior; the improvement came from shared notes, smaller mode buttons, and a denser desktop layout.
- The current follow-up should preserve sentence rendering and header actions while reducing the reader shell to one visible title plus one compact metadata/action row.
- Live Chromium and Edge review confirmed that the reader area can lose its duplicate inner header without hurting scan order; the improvement came from collapsing metadata and actions into the outer reader header and leaving the article content to start immediately.
- The current follow-up should preserve the warm charcoal direction and grouped controls while removing micro-metadata clutter, calming passive dark-mode chips, and shortening low-value helper copy.
- Live Chromium-family Chrome and Edge validation confirmed that the dark mode did not need a wholesale palette change; the strongest improvement came from neutralizing passive chips, removing repeated local/AI pills, and shortening report-like helper copy.
- Live Chromium-family Chrome and Edge validation confirmed that the remaining friction was structural rather than color-related; the stronger result came from passive library styling, compact reading-state chrome, and letting short reader cards size to content instead of filling the viewport.
- The current follow-up should preserve the same palette and behavior while fixing the remaining layout defects, collapsing import during active reading, and thinning the toolbar-like settings/header chrome.
- The current follow-up should stay bounded to newbie-first decluttering: keep primary reading actions visible, introduce one reusable accessible info/disclosure pattern, and collapse secondary help and low-frequency controls in the active-reading state.
- This pass confirmed the next UI polish gains should come from reducing remaining card count and label density rather than adding new controls; the behavior model is stable enough to keep treating this as interface polish.
- This pass confirmed that the remaining high-value cleanup is now inside the settings drawer and reader surface, not in the top-of-page control hierarchy; future refinements should keep the drawer/overflow split unless a live usability issue proves it wrong.
- This pass confirmed that the next hierarchy win comes from simplifying the drawer contents themselves rather than keeping more controls visible on the main reading page; future follow-ups should keep transport primary and continue reducing drawer noise without reopening the behavior model.
