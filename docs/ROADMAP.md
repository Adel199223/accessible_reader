# Roadmap

## Product Direction

Keep this repository as one local-first workspace.

- `Recall` is the product shell and workspace identity.
- `Reader` remains an integrated section inside that shell, but the current layout is not frozen; preserve reading behavior, deep links, and data contracts while changing UI structure whenever that materially improves Recall-quality UX.
- `backend/` remains the single local service host for Reader, Recall, and future shared workspace surfaces.
- Shared storage and domain contracts must support current reading behavior first, then expand toward Recall graph/study/export features without a rewrite.
- The original Recall app is the workflow benchmark for navigation clarity, reading focus, note adjacency, split-view usefulness, and obvious next actions; use it directionally without requiring pixel-perfect visual parity.

## Execution Strategy

- The project remains in desktop-first milestone mode after the completed Stage 355/356 `Graph`, Stage 357/358 `Home`, Stage 359/360 `Reader`, and Stage 361/362 `Notes` redesigns.
- Keep exactly one active redesign or baseline-consolidation target at a time, and finish that bounded slice end-to-end before switching surfaces.
- Each remaining milestone uses three internal checkpoints inside one stage pair:
  - wide-desktop redesign for the active section
  - focused/narrow adaptation for the same section
  - one full benchmark audit with wide desktop surfaces first and focused regressions second
- Audits are regression gates and evidence snapshots, not automatic permission to reprioritize to a different section after every pass.
- The original desktop-first milestone set for `Graph`, `Home`, `Reader`, and `Notes` is complete, and Stage 366/367 also redesigned `Study`.
- The March 19, 2026 Stage 369 reopen audit then confirmed that the user-priority surfaces should not be treated as finished yet.
- The March 19, 2026 Stage 376/377 Notes finish pass then closed that reopened user-priority queue again.
- The March 19, 2026 Stage 378/379 Study finish pass then closed that explicit Study reopen again.
- The March 19, 2026 Stage 380 Recall-parity audit then reopened the benchmark track around `Graph`, `Home`, and original-only `Reader`.
- The March 19, 2026 Stage 381/382 Graph Recall-parity reset then completed the current Graph slice inside that reopened track.
- The March 19, 2026 Stage 383/384 Home Recall-parity reset then completed the current Home slice inside that same reopened track.
- The March 20, 2026 Stage 385/386 Reader Recall-parity reset then completed the current original-only `Reader` slice inside that same reopened track.
- The March 20, 2026 Stage 387/388 Home density reset then reopened `Home` for one second-pass correction and closed that slice again.
- The March 20, 2026 Stage 389/390 Graph View 2.0 reset then reopened `Graph` for one second-pass correction and closed that slice again.
- The March 20, 2026 Stage 391/392 Home tree-filtered browse reset then reopened `Home` for one broader organizer-rail correction and closed that slice again.
- The March 20, 2026 Stage 393/394 Reader reading-space reset then reopened original-only `Reader` for one broader reading-space correction and closed that slice again.
- The March 20, 2026 Stage 395/396 Home tag-tree board reset then reopened `Home` for one broader organizer-tree and library-board correction and closed that slice again.
- The March 20, 2026 Stage 397/398 Home board-fill reset then reopened `Home` for one broader selected-group-board and companion-shelf correction and closed that slice again.
- The March 20, 2026 Stage 399/400 Home filtered-card density reset then reopened `Home` for one broader above-the-fold card-density correction and closed that slice again.
- The March 20, 2026 Stage 401/402 Home continuous-board-coverage reset then reopened `Home` for one broader continuous-board-coverage correction and closed that slice again.
- The March 20, 2026 Stage 403/404 Home library-sheet flattening reset then reopened `Home` for one broader continuous-library-sheet correction and closed that slice again.
- The March 20, 2026 Stage 405/406 Home tag-tree control-surface reset then reopened `Home` for one broader organizer-rail and board-entry correction and closed that slice again.
- The March 20, 2026 Stage 407/408 Home minimal-entry reset then reopened `Home` for one broader entry-stack correction and closed that slice again.
- The March 20, 2026 Stage 409/410 Home organizer-rail header compression reset then reopened `Home` for one broader organizer-entry compression correction and closed that slice again.
- The March 21, 2026 Stage 411/412 Home organizer-row flattening reset then reopened `Home` for one broader organizer-row rhythm correction and closed that slice again.
- The March 21, 2026 Stage 413/414 Home organizer-selection continuity reset then reopened `Home` for one broader active-selection continuity correction and closed that slice again.
- The March 21, 2026 Stage 415/416 Home organizer highlight-deflation reset then reopened `Home` for one broader selected-row highlight correction and closed that slice again.
- The March 21, 2026 Stage 417/418 Home organizer readout-softening reset then reopened `Home` for one broader active-readout correction and closed that slice again.
- The March 21, 2026 Stage 419/420 Home organizer preview-grouping deflation reset then reopened `Home` for one broader attached-preview correction and closed that slice again.
- The March 21, 2026 Stage 421/422 Home summary-preview join tightening reset then reopened `Home` for one broader active-branch join correction and closed that slice again.
- The March 21, 2026 Stage 423/424 Home active summary-note integration reset then reopened `Home` for one broader summary-note placement correction and closed that slice again.
- The March 21, 2026 Stage 425/426 Home active summary copy-weight deflation reset then reopened `Home` for one broader active-bridge copy correction and closed that slice again.
- The March 21, 2026 Stage 427/428 Home active bridge-hint retirement reset then reopened `Home` for one broader selected-branch simplification correction and closed that slice again.
- The March 21, 2026 Stage 431/432 Home organizer-control deck reset then reopened `Home` for one broader organizer-led control-model correction and closed that slice again.
- The March 21, 2026 Stage 433/434 Graph canvas-first drawer reset then reopened `Graph` for one broader canvas-first default-state correction and closed that slice again.
- The March 21, 2026 Stage 435/436 Home board-first organizer reset then reopened `Home` for one broader organizer-led board-workspace correction and closed that slice again.
- The March 21, 2026 Stage 437/438 Graph corner-pods and overlay-drawer reset then reopened `Graph` for one broader canvas-stability correction and closed that slice again.
- The March 21, 2026 Stage 439/440 Home unified workbench reset then reopened `Home` for one broader organizer-led workbench hierarchy correction and closed that slice again.
- The March 21, 2026 Stage 441/442 Graph minimal launcher and compact path rail reset then reopened `Graph` for one broader default-state hierarchy correction and closed that slice again.
- The March 21, 2026 Stage 443/444 Home single-board pinned-cluster reset then reopened `Home` for one broader board-composition correction and closed that slice again.
- The March 21, 2026 Stage 445/446 Graph working-control hierarchy reset then reopened `Graph` for one broader light-control and active-trail correction and closed that slice again.
- The March 21, 2026 Stage 447/448 Home organizer-owned navigation reset then reopened `Home` for one broader organizer-owned control and quieter-board correction and closed that slice again.
- The March 21, 2026 Stage 449/450 Graph corner-actions and drawer-hierarchy reset then reopened `Graph` for one broader launcher/search-corner/tools-drawer correction and closed that slice again.
- The March 21, 2026 Stage 451/452 Home compact reopen rail and board-top hierarchy reset then reopened `Home` for one broader compact-reopen-rail and earlier-board-start correction and closed that slice again.
- The March 21, 2026 Stage 453/454 Graph settings-sidebar and search-navigation reset then reopened `Graph` for one broader settings-owned filter split, real graph-search navigation corner, and lighter hover-preview exploration correction and closed that slice again.
- The March 21, 2026 Stage 455/456 Home direct-board and organizer-hierarchy reset then reopened `Home` for one broader organizer-owned rail plus direct-board correction and closed that slice again.
- The March 21, 2026 Stage 457/458 Graph node-language and hover-hierarchy reset then reopened `Graph` for one broader lighter-at-rest canvas plus stronger hover/selection correction and closed that slice again.
- The March 21, 2026 Stage 459/460 Home inline-reopen-strip and board-dominant workspace reset then reopened `Home` for one broader board-dominant continuity correction and closed that slice again.
- The March 21, 2026 Stage 461/462 Graph bottom-bar and drawer workflow reset then reopened `Graph` for one broader working-state hierarchy correction and closed that slice again.
- The March 21, 2026 Stage 463/464 Home organizer-deck and results-sheet reset then reopened `Home` for one broader flatter-organizer-deck and earlier-working-board correction and closed that slice again.
- The March 21, 2026 Stage 465/466 Graph settings-panel and view-controls reset then reopened `Graph` for one broader true-settings-sidebar, live-view-controls, and selected-workflow split correction and closed that slice again.
- The March 21, 2026 Stage 467/468 Home organizer sorting and board-view reset then reopened `Home` for one broader organizer-owned sorting, direction, and board/list working-state correction and closed that slice again.
- The March 21, 2026 Stage 469/470 Graph focus-mode and drawer exploration reset then reopened `Graph` for one broader selected-node focus-mode, bottom-rail ownership, and tabbed-drawer exploration correction and closed that slice again.
- The March 21, 2026 Stage 471/472 Home organizer tree-branch navigation reset then reopened `Home` for one broader tree-driven organizer-navigation correction and closed that slice again.
- The March 21, 2026 Stage 473/474 Graph multi-select path-exploration reset then reopened `Graph` for one broader multi-node selection and shortest-path exploration correction and closed that slice again.
- The March 21, 2026 Stage 475/476 Home collection-lens and organizer-model reset then reopened `Home` for one broader collection-led organizer correction, a deliberate `Recent` fallback lens, and a truer organizer model split instead of styling recency buckets as the only browse structure, then closed that slice again.
- The March 21, 2026 Stage 477/478 Graph timeline-presets and filter-customization reset then reopened `Graph` for one broader settings-led presets, timeline, and content-filter correction and closed that slice again.
- The March 21, 2026 Stage 479/480 Home overview-board and group drill-in reset then reopened `Home` for one broader organizer-owned overview workspace correction and closed that slice again.
- The March 21, 2026 Stage 481/482 Graph navigation-controls and locked-layout reset then reopened `Graph` for one broader interactive-canvas navigation correction and closed that slice again.
- The March 22, 2026 Stage 483/484 Home manual organizer ordering and selection reset then reopened `Home` for one broader active organizer work-mode correction and closed that slice again.
- The March 22, 2026 Stage 485/486 Graph color-groups, legend, and resizable-settings reset then reopened `Graph` for one broader settings-surface correction and closed that slice again.
- The March 22, 2026 Stage 487/488 Home drag-drop organizer workbench reset then reopened `Home` for one broader direct-manipulation organizer correction and closed that slice again.
- The March 22, 2026 Stage 489/490 Graph saved-view presets workflow reset then reopened `Graph` for one broader saved-view management correction and closed that slice again.
- The March 22, 2026 Stage 491/492 Home resizable organizer rail reset then reopened `Home` for one broader organizer-rail ergonomics correction and closed that slice again.
- The March 22, 2026 Stage 493/494 Graph card drawer and connection-follow reset then reopened `Graph` for one broader selected-card drawer correction and closed that slice again.
- The March 22, 2026 Stage 495/496 Home custom collection management reset then reopened `Home` for one broader organizer-owned collection-management correction and closed that slice again.
- The March 22, 2026 Stage 497 repo closeout is complete:
  - the full pending Stage 369-496 backlog was committed in the required two-commit split
  - the last green Stage 495/496 validation ladder was rerun during closeout
  - the branch was promoted to clean `main`, the feature branch was pruned, and local/remote Git state was verified clean
- The March 22, 2026 Stage 498/499 Graph filter-query and visibility-controls pair is complete:
  - wide desktop `Graph` now supports bounded Recall-like filter queries, explicit unconnected/leaf/reference visibility controls, and saved-view continuity for those controls
  - the Stage 499 audit confirmed that the settings sidebar now behaves more like a real graph-management control center while `Home` and original-only `Reader` stayed stable
- The March 22, 2026 Stage 500/501 Home organizer-overview and grouped-board pair is complete:
  - wide desktop `Home` now gives the organizer a clearer `OVERVIEW` / `RESET` state and a calmer grouped-overview board above the fold
  - the Stage 501 audit confirmed that `Home` is materially closer to Recall's current organizer-owned overview direction while `Graph` and original-only `Reader` stayed stable
- The March 22, 2026 Stage 502/503 Home organizer header-and-control-stack pair is complete:
  - wide desktop `Home` now uses a tighter organizer utility header, a shorter helper line, and a denser upper control deck while preserving collection management, search, sorting, manual ordering, resize, and hide/show behavior
  - the Stage 503 audit confirmed that the organizer top stack now reads materially closer to Recall's leaner utility rail while `Graph` and original-only `Reader` stayed stable
- The March 22, 2026 Stage 504 Home organizer utility-button flattening and branch-list density deflation implementation is complete locally:
  - wide desktop `Home` now folds `New`, collapse or clear, and hide into the same compact organizer control surface while the active branch list reads flatter and denser beneath it
  - the Stage 504 validation pass kept collection management, search, sort, view, manual ordering, resize, and hide/show behavior intact while `Graph` and original-only `Reader` remained the regression surfaces for the next audit
- The March 23, 2026 Stage 505 Home organizer utility-button and branch-list audit is complete:
  - wide desktop `Home` now holds a flatter integrated organizer utility cluster and a denser selected-branch list that read materially closer to Recall's current organizer rail
  - the Stage 505 audit confirmed that the utility actions now feel attached to the organizer controls and that the `Captures` branch stays continuous while `Graph` and original-only `Reader` remain stable
- The March 23, 2026 Stage 506 reliable local app opener blocker correction is complete:
  - the repo now owns one Windows launcher path at `scripts/open_recall_app.ps1` that starts or reuses the backend, rebuilds the served shell when needed, and opens Microsoft Edge through the repo-owned Playwright path
  - this was a tooling correction only; the active product queue returns immediately to the post-Stage-505 `Home` baseline
- The March 23, 2026 Stage 507 Home organizer group-row and count-badge deflation implementation is complete locally:
  - wide desktop `Home` now treats the overview/reset row, top-level organizer groups, and count readouts as a flatter continuous organizer list with lighter badge treatment and softer row chrome
  - the Stage 507 validation pass kept overview/reset continuity, custom collections, explicit `Untagged`, search, sort, board/list, manual ordering, drag-drop, resize, and hide/show behavior intact while `Graph` and original-only `Reader` remained the regression surfaces for the next audit
- The March 23, 2026 Stage 508 Home organizer group-row and count-badge audit is complete:
  - wide desktop `Home` now holds a flatter overview/reset row, calmer top-level organizer groups, and lighter count readouts that read materially closer to Recall's current organizer rail
  - the Stage 508 audit confirmed that the top-level row language no longer leads the remaining mismatch while `Graph` and original-only `Reader` stayed stable
- The March 23, 2026 Stage 509 Home organizer child-row metadata and branch-footer deflation implementation is complete locally:
  - wide desktop `Home` now treats active-branch child rows and the `Show all` footer as lighter attached continuation beneath the selected organizer group instead of a metadata-heavier list ending in a pill-like control
  - the Stage 509 validation pass kept overview/reset continuity, branch drill-in, search, sort, board/list, manual ordering, drag-drop, resize, and hide/show behavior intact while `Graph` and original-only `Reader` remained the regression surfaces for the next audit
- The March 23, 2026 Stage 510 Home organizer child-row metadata and branch-footer audit is complete:
  - wide desktop `Home` now holds a lighter active-branch continuation where child-row metadata stays legible without reading like separate mini-panels and the organizer-side footer reads as attached continuation instead of a detached chip
  - the Stage 510 audit confirmed that this calmer organizer-branch rhythm holds in live `Captures` drill-in while `Graph` and original-only `Reader` stayed stable
- The March 23, 2026 Stage 511 Home selected-group board-footer and lower-sheet continuation deflation implementation is complete locally:
  - wide desktop `Home` now treats the right-side selected-group board footer as attached results-sheet continuation instead of a detached pill action, while the lower board edge reads calmer and more continuous
  - the Stage 511 validation pass kept organizer drill-in, board/list switching, search, sort, manual ordering, drag-drop, resize, and hide/show behavior intact while `Graph` and original-only `Reader` remained the regression surfaces for the next audit
- The March 23, 2026 Stage 512 Home selected-group board-footer and lower-sheet audit is complete:
  - wide desktop `Home` now holds a calmer selected-group board ending where the lower `Show all` stop reads like attached continuation and the board edge no longer breaks the results-sheet rhythm
  - the Stage 512 audit confirmed that this calmer board ending holds in live `Captures` drill-in while `Graph` and original-only `Reader` stayed stable
- The March 23, 2026 Stage 513 Home selected-group header summary and count-seam deflation implementation is complete locally:
  - wide desktop `Home` now starts the selected-group board faster because the summary copy is leaner and the top-right count reads more like part of the same heading seam
  - the Stage 513 validation pass kept organizer drill-in, board/list switching, search, sort, manual ordering, drag-drop, resize, and hide/show behavior intact while `Graph` and original-only `Reader` remained the regression surfaces for the next audit
- The March 23, 2026 Stage 514 Home selected-group header summary and count-seam audit is complete:
  - wide desktop `Home` now holds a calmer selected-group board header where the summary bridge starts faster and the top-right count reads like a quieter seam-end label instead of a detached badge
  - the Stage 514 audit confirmed that this lighter header rhythm holds in live `Captures` drill-in while `Graph` and original-only `Reader` stayed stable
- The March 23, 2026 Stage 515 Home selected-group card eyebrow and metadata density deflation implementation is complete locally:
  - wide desktop `Home` now treats the first visible selected-group cards as lighter grouped board entries because the eyebrow no longer leads the card, redundant source-preview copy falls away, and the metadata collapses into one calmer compact line
  - the Stage 515 validation pass kept organizer drill-in, board/list switching, search, sort, manual ordering, drag-drop, resize, and hide/show behavior intact while `Graph` and original-only `Reader` remained the regression surfaces for the next audit
- The March 23, 2026 Stage 516 Home selected-group card eyebrow and metadata audit is complete:
  - wide desktop `Home` now holds a lighter first visible selected-group card where the source-type eyebrow stays quiet and the date-plus-view readout behaves like one compact seam instead of a mini metadata stack
  - the Stage 516 audit confirmed that this lighter card treatment holds in live `Captures` drill-in while `Graph` and original-only `Reader` stayed stable
- The March 23, 2026 Stage 517 Home selected-group card title emphasis and shell continuity deflation implementation is complete locally:
  - wide desktop `Home` now treats the selected-group cards as calmer attached board continuation because the title reads less like a boxed mini heading and the shell is lighter against the surrounding results sheet
  - the Stage 517 validation pass kept organizer drill-in, board/list switching, search, sort, manual ordering, drag-drop, resize, and hide/show behavior intact while `Graph` and original-only `Reader` remained the regression surfaces for the next audit
- The March 23, 2026 Stage 518 Home selected-group card title and shell audit is complete:
  - wide desktop `Home` now holds calmer selected-group cards where the shell feels less boxed and the title reads more like one attached board row instead of a boxed mini heading panel
  - the Stage 518 audit confirmed that this lighter title-and-shell treatment holds in live `Captures` drill-in while `Graph` and original-only `Reader` stayed stable
- The March 23, 2026 Stage 519 Home selected-group card gutter and board-grid continuity deflation implementation is complete locally:
  - wide desktop `Home` now reduces gutter weight between adjacent selected-group cards and softens the board grid so the selected-group field reads more like one continuous results sheet instead of a tiled card wall
  - the Stage 519 validation pass kept organizer drill-in, board/list switching, search, sort, manual ordering, drag-drop, resize, and hide/show behavior intact while `Graph` and original-only `Reader` remained the regression surfaces for the next audit
- The March 23, 2026 Stage 520 Home selected-group gutter and board-grid audit is complete:
  - wide desktop `Home` now holds a calmer selected-group board where adjacent cards hand off with less dead space and the visible `Captures` run reads more like one continuous results sheet instead of separate tiles
  - the Stage 520 audit confirmed that this softer gutter plus calmer board-grid treatment holds in live `Captures` drill-in while `Graph` and original-only `Reader` stayed stable
- The March 23, 2026 Stage 521 Home selected-group title-wrap and row-height continuity deflation implementation is complete locally:
  - wide desktop `Home` now keeps longer selected-group titles calmer and steadies the first visible board-row rhythm so the `Captures` run reads more evenly instead of stepping through a jagged title edge
  - the Stage 521 validation pass kept organizer drill-in, board/list switching, search, sort, manual ordering, drag-drop, resize, and hide/show behavior intact while `Graph` and original-only `Reader` remained the regression surfaces for the next audit
- The March 24, 2026 Stage 498-521 backlog closeout is the new clean-`main` publish baseline:
  - the Stage 498/499 Graph pair, the Stage 500-521 Home checkpoint set, and the Stage 506 launcher correction now ship together on `main`
  - the next honest roadmap move remains the pre-staged Stage 522 live `Home` audit from the Stage 521 baseline
- Current active queue: run the pre-staged Stage 522 `Home` live audit around selected-group title-wrap and row-height continuity while `Graph` and original-only `Reader` remain refreshed parity baselines and `Notes` plus `Study` remain regression baselines.
- Current mode: post-Stage-521 implementation and pre-Stage-522 audit. Keep Reader generated-content work explicitly out of scope unless the user explicitly reprioritizes it.
- Current Reader restriction: do not change `Reflowed`, `Simplified`, or `Summary` workflows, transform logic, generated placeholders, generated-view controls, or mode-routing unless the user explicitly reprioritizes generated-content work.

## Status As Of 2026-03-23

- The March 18, 2026 Stage 355/356 milestone is complete:
  - wide desktop `Graph` now uses a canvas-first composition with a lighter utility strip and a docked evidence flow instead of the old standing right-card layout
  - focused/narrow `Graph` now inherits that same hierarchy instead of continuing as a separate micro-language
- The March 19, 2026 Stage 357/358 milestone is complete:
  - wide desktop `Home` now uses one active collection workspace with a clear lead reopen path, nearby resumptions, shell-led search/new reinforcement, and a denser saved-source library much earlier above the fold
  - focused overview and narrower desktop `Home` now inherit that same hierarchy instead of preserving the older landing-card language
- The March 19, 2026 Stage 359/360 milestone is complete:
  - wide desktop `Reader` now uses a stronger text-first reading deck with one calmer control ribbon and a docked source/notes support flow instead of the old co-equal right context column
  - focused/narrow `Reader` now inherits that same hierarchy, including the slimmer focused source strip, calmer transport rhythm, and docked support treatment
- The March 19, 2026 Stage 361/362 milestone is complete:
  - wide desktop `Notes` now uses a clearer browse/detail workspace with a stronger note stage, denser browsing, and quieter context support instead of the old left rail plus blank detail plus strong context column
  - focused/narrow `Notes` now inherit that same hierarchy instead of preserving the older disconnected empty/detail language
- The March 19, 2026 Stage 363/364 baseline-consolidation pass is complete:
  - wide desktop `Home`, `Graph`, `Reader`, and `Notes` now share one calmer stage-shell and support-rail family instead of carrying separate milestone accents
  - the wide baseline set is now locked to the Stage 364 captures for `Home`, `Graph`, `Reader`, and `Notes`
- The March 19, 2026 Stage 366/367 milestone is complete:
  - wide desktop `Study` now uses one active review workspace with a dominant review lane, docked queue/evidence support, and a clearer desktop-first hierarchy instead of the older boxed review dashboard
  - focused and narrower `Study` now inherit that same calmer hierarchy instead of preserving the older detached review/support split
- The March 19, 2026 Stage 369 reopen audit is complete:
  - wide-desktop `Home`, `Graph`, `Reader`, and `Notes` were refreshed against the current benchmark set while `Study` was explicitly removed from the active queue again
  - `Graph` now leads the unfinished priority set because the top banner, boxed browse rail, and standing node-detail dock still compete too much with the canvas
  - `Home` remains the next unfinished surface, while `Reader` and `Notes` are materially calmer and lower priority for now
- The March 19, 2026 Stage 370/371 Graph finish milestone is complete:
  - wide desktop `Graph` now uses a lighter title-and-utility seam, a slimmer browse strip, and one attached inspect tray with grouped continuation instead of the older standing detail panel language
  - focused/narrow `Graph` keeps the same hierarchy, so the desktop-first shift does not drift back into a separate micro-language
  - the Stage 371 audit confirmed that `Graph` is materially calmer at first glance and no longer leads the unfinished queue
- The March 19, 2026 Stage 372/373 Home finish milestone is complete:
  - wide desktop `Home` now uses one stronger collection workspace that keeps the primary reopen path, nearby resumptions, and saved library above the fold instead of handing off into a detached archive tail
  - focused overview and narrower `Home` keep that same hierarchy instead of drifting back toward the old landing-card language
  - the Stage 373 audit confirmed that `Home` is materially calmer and no longer leads the unfinished queue
- The March 19, 2026 Stage 374/375 Reader finish milestone is complete:
  - wide desktop `Reader` now further compresses the chrome around reading and keeps the support dock calmer relative to the document lane
  - focused and narrower `Reader` remain aligned with the same calmer hierarchy
  - the Stage 375 audit confirmed that `Reader` is materially calmer and no longer leads the unfinished queue
- The March 19, 2026 Stage 376/377 Notes finish milestone is complete:
  - wide desktop `Notes` now uses a stronger current-source glance, a denser next-note detail stage, and a calmer note-workbench/dock split instead of the earlier instruction-heavy empty stage and equally weighted side support
  - focused and narrower `Notes` keep that same calmer hierarchy instead of drifting back toward a separate micro-language
  - the Stage 377 audit confirmed that `Notes` is materially calmer at first glance, while `Graph`, `Home`, and `Reader` stayed stable behind it
- The March 19, 2026 Stage 378/379 Study finish milestone is complete:
  - wide desktop `Study` now uses a narrower current-review workbench, a guided review-flow strip, and a queue/evidence companion rail that surfaces grounding sooner instead of the older full-width banner plus co-equal dock
  - focused and narrower `Study` keep that calmer hierarchy instead of drifting back toward the older detached dashboard language
  - the Stage 379 audit confirmed that `Study` is materially calmer at first glance, while `Home`, `Graph`, `Reader`, and `Notes` stayed stable behind it
- The explicit Study reopen is now closed again:
  - `Graph`, `Home`, `Reader`, `Notes`, and `Study` are refreshed wide-desktop regression baselines
  - no new redesign slice is open until the user explicitly reprioritizes another surface or a direct regression forces a detour
- The March 19, 2026 Stage 380 Recall-parity audit is complete:
  - the active benchmark track is now `Graph`, `Home`, and original-only `Reader`
- The March 22, 2026 Stage 497 repo closeout is complete:
  - the Stage 369-496 backlog now lives on clean `main` after the required two-commit closeout, validation rerun, branch promotion, and prune pass
  - the next product slice should start from `main`, not from the retired feature branch
- The March 22, 2026 Stage 498/499 Graph filter-query and visibility-controls pair is complete:
  - the broader Graph filtering/customization gap now centers on a bounded local filter-query model, explicit visibility controls, and saved-view continuity rather than more canvas-chrome trimming
  - the Stage 499 audit confirmed that `Graph` is materially closer to Recall's current settings-led customization direction, while `Home` and original-only `Reader` stayed stable
- The March 22, 2026 Stage 500/501 Home organizer-overview and grouped-board pair is complete:
  - the next broad Home gap is no longer the overview/reset row or grouped overview board; it is the organizer header/control stack, where the top intro copy and utility deck still read heavier than Recall's leaner left rail
  - `Graph` and original-only `Reader` stay regression surfaces while `Notes` and `Study` remain parked
  - Reader generated-content work is explicitly locked out in this track: no `Reflowed`, `Simplified`, or `Summary` workflow changes, no generated-view UX work, and no transform or mode-routing changes
- The March 22, 2026 Stage 502/503 Home organizer header-and-control-stack pair is complete:
  - wide desktop `Home` now reads more like Recall's leaner organizer utility rail because the upper stack collapses into a shorter heading/status line, a briefer helper note, a tighter tools row, and a denser control deck
  - the Stage 503 audit confirmed that this tighter upper stack survives the selected-branch handoff, while `Graph` and original-only `Reader` stayed stable and generated-content `Reader` work remained out of scope
- The March 23, 2026 Stage 505 Home organizer utility-button and branch-list audit is complete:
  - wide desktop `Home` now reads more like Recall's current organizer rail because the utility actions stay attached to the organizer control surface and the selected branch reads flatter and denser during drill-in
  - the Stage 505 audit confirmed that this calmer utility cluster and branch density hold together in `Captures`, while `Graph` and original-only `Reader` stayed stable and generated-content `Reader` work remained out of scope
- The March 23, 2026 Stage 506 reliable local app opener blocker correction is complete:
  - `scripts/open_recall_app.ps1` now acts as the canonical repo command for opening the backend-served app from Windows, and `scripts/playwright/open_recall_in_edge.mjs` owns the real Edge launch path
  - this correction does not change product scope; it removes launcher friction and then returns the roadmap to the Stage 505 `Home` audit baseline
- The March 23, 2026 Stage 507 Home organizer group-row and count-badge deflation implementation is complete locally:
  - wide desktop `Home` now reads more like Recall's leanest organizer rail because the overview/reset row, top-level branch rows, and count readouts sit in a flatter continuous list with lighter count treatment
  - the Stage 507 validation pass confirmed that overview/reset continuity, custom collections, explicit `Untagged`, search/sort/view controls, manual ordering, drag-drop, resize, and hide/show all remain intact while `Graph` and original-only `Reader` stay stable ahead of the Stage 508 audit
- The March 23, 2026 Stage 508 Home organizer group-row and count-badge audit is complete:
  - wide desktop `Home` now reads more like Recall's leanest organizer rail because the overview/reset row, top-level branch rows, and count readouts hold together as one continuous organizer list instead of mini-panels with chip-like counts
  - the Stage 508 audit confirmed that this calmer top-level rail language holds in live `Captures` drill-in while `Graph` and original-only `Reader` stayed stable and generated-content `Reader` work remained out of scope
- The March 23, 2026 Stage 509 Home organizer child-row metadata and branch-footer deflation implementation is complete locally:
  - wide desktop `Home` now reads more like Recall's leanest attached branch lists because active child rows carry lighter metadata and the `Show all` footer reads more like attached continuation than a detached button
  - the Stage 509 validation pass confirmed that child-row scan order, active-branch continuity, expansion/collapse, manual ordering, drag-drop, resize, and hide/show all remain intact while `Graph` and original-only `Reader` stay stable ahead of the Stage 510 audit
- The March 23, 2026 Stage 510 Home organizer child-row metadata and branch-footer audit is complete:
  - wide desktop `Home` now reads more like Recall's leanest organizer continuation because active child rows stay lighter and the organizer-side branch footer no longer reads like a detached pill button
  - the Stage 510 audit confirmed that this calmer branch rhythm holds in live `Captures` drill-in while `Graph` and original-only `Reader` stayed stable, and the next honest Home gap has shifted into the right-side selected-group board footer
- The March 23, 2026 Stage 511 Home selected-group board-footer and lower-sheet continuation deflation implementation is complete locally:
  - wide desktop `Home` now reads more like Recall's calmer selected-group board endings because the right-side `Show all` stop behaves like attached continuation and the lower board edge no longer ends in a detached chip
  - the Stage 511 validation pass confirmed that the selected-group board stays dominant, explicit expansion remains intact, and `Graph` plus original-only `Reader` stay stable ahead of the Stage 512 audit
- The March 23, 2026 Stage 512 Home selected-group board-footer and lower-sheet audit is complete:
  - wide desktop `Home` now reads more like Recall's calmer selected-group board endings because the right-side footer stays attached to the sheet and the lower edge no longer breaks the card field into a detached action stop
  - the Stage 512 audit confirmed that this calmer lower-sheet continuation holds in live `Captures` drill-in while `Graph` and original-only `Reader` stayed stable, and the next honest Home gap has shifted into the selected-group header summary and count seam
- The March 23, 2026 Stage 513 Home selected-group header summary and count-seam deflation implementation is complete locally:
  - wide desktop `Home` now reads more like Recall's calmer selected-group board header because the summary copy is shorter, wraps less heavily, and the top-right count feels more attached to the header cluster
  - the Stage 513 validation pass confirmed that the selected-group board still starts cleanly above the card field while `Graph` and original-only `Reader` stay stable ahead of the Stage 514 audit
- The March 23, 2026 Stage 514 Home selected-group header summary and count-seam audit is complete:
  - wide desktop `Home` now reads more like Recall's calmer selected-group board header because the summary bridge no longer behaves like a mini body block and the top-right count reads like a quieter seam-end label
  - the Stage 514 audit confirmed that this calmer header seam holds in live `Captures` drill-in while `Graph` and original-only `Reader` stayed stable, and the next honest Home gap has shifted into selected-group card eyebrow and metadata density
- The March 23, 2026 Stage 515 Home selected-group card eyebrow and metadata density deflation implementation is complete locally:
  - wide desktop `Home` now reads more like Recall's lighter grouped board cards because the first-row eyebrow is quieter, redundant source-preview copy drops away, and the date-plus-view line no longer stacks into a mini metadata panel
  - the Stage 515 validation pass confirmed that the selected-group board still stays dominant above the fold while `Graph` and original-only `Reader` stay stable ahead of the Stage 516 audit
- The March 23, 2026 Stage 516 Home selected-group card eyebrow and metadata audit is complete:
  - wide desktop `Home` now reads more like Recall's lighter grouped board cards because the first-row eyebrow stays quiet, the date-plus-view line holds as one compact seam, and the board still scans clearly in live `Captures` drill-in
  - the Stage 516 audit confirmed that the remaining Home mismatch has moved out of eyebrow/meta density and into selected-group card title plus shell emphasis while `Graph` and original-only `Reader` stayed stable
- The March 23, 2026 Stage 517 Home selected-group card title emphasis and shell continuity deflation implementation is complete locally:
  - wide desktop `Home` now reads more like Recall's calmer grouped board cards because the first visible selected-group row uses a lighter shell and the title behaves more like part of one continuous card seam instead of a boxed mini heading
  - the Stage 517 validation pass confirmed that the selected-group board still stays dominant above the fold while `Graph` and original-only `Reader` stay stable ahead of the Stage 518 audit
- The March 23, 2026 Stage 518 Home selected-group card title and shell audit is complete:
  - wide desktop `Home` now reads more like Recall's calmer grouped board cards because the first visible selected-group row feels less boxed, the title behaves more like row content, and the board still scans cleanly in live `Captures` drill-in
  - the Stage 518 audit confirmed that the remaining Home mismatch has shifted out of title/shell emphasis and into selected-group card gutter plus board-grid continuity while `Graph` and original-only `Reader` stayed stable
- The March 19, 2026 Stage 381/382 Graph Recall-parity reset is complete:
  - wide desktop `Graph` now uses a slimmer control seam, a lighter browse strip, a more dominant canvas shell, and one attached inspect tray instead of the older banner-plus-standing-rail composition
  - the Stage 382 audit confirmed that `Graph` is materially closer to the current Recall direction, `Home` is the next likely parity target, and original-only `Reader` stayed visually stable behind the Graph pass
- The March 19, 2026 Stage 383/384 Home Recall-parity reset is complete:
  - wide desktop `Home` now uses a slimmer control seam, a lighter browse strip, a denser primary saved-source flow, and one calmer lower continuation lane instead of the older hero-plus-split-library composition
  - focused overview and narrower `Home` regressions stayed aligned with that calmer hierarchy instead of drifting back toward the older detached landing-card language
  - the Stage 384 audit confirmed that `Home` is materially closer to the current Recall direction, `Graph` stayed stable, and original-only `Reader` is now the next likely parity target in the active track
- The March 20, 2026 Stage 385/386 Reader Recall-parity reset is complete:
  - wide desktop original-only `Reader` now uses a slimmer top seam, a more dominant article lane, and a calmer attached support dock instead of the older heavier header stack plus lower support treatment
  - focused original-only `Reader` stayed visually stable behind that reset instead of drifting into a separate micro-language
  - the Stage 386 audit confirmed that original-only `Reader` is materially closer to the current Recall direction, while `Graph` and `Home` stayed stable behind it
- The March 20, 2026 Stage 387/388 Home density reset is complete:
  - wide desktop `Home` now uses a slimmer control seam, a side-attached browse strip, a denser saved-source card flow, and a calmer lower continuation lane instead of the earlier hero-band-plus-stacked-library composition
  - focused overview and narrower `Home` stayed aligned with that denser hierarchy instead of drifting back toward the older detached landing-card language
  - the Stage 388 audit confirmed that `Home` is materially closer to the current Recall direction, while `Graph` and original-only `Reader` stayed stable behind the Home second pass
- The March 20, 2026 Stage 389/390 Graph View 2.0 reset is complete:
  - wide desktop `Graph` now uses a slimmer in-workbench control overlay, a tighter attached browse drawer, a stronger canvas-first shell, and one drawer-first inspect flow instead of the earlier top-band-plus-standing-strip composition
  - focused and narrower `Graph` regressions stayed aligned with that calmer hierarchy instead of drifting back toward the older detached graph chrome language
  - the Stage 390 audit confirmed that `Graph` is materially closer to the current Recall Graph View 2.0 direction, while `Home` and original-only `Reader` stayed stable behind the Graph second pass
- The March 20, 2026 Stage 391/392 Home tree-filtered browse reset is complete:
  - wide desktop `Home` now uses a slimmer control seam, a stronger organizer-tree rail, a pinned reopen shelf, and a denser selected-group board instead of the earlier side-strip-plus-hero-card composition
  - focused overview and narrower `Home` regressions stayed aligned with that calmer organized-library hierarchy instead of drifting back toward the older detached landing-card language
  - the Stage 392 audit confirmed that `Home` is materially closer to Recall's current organized-library direction, while `Graph` and original-only `Reader` stayed stable behind the Home third pass
- The March 20, 2026 Stage 393/394 Reader reading-space reset is complete:
  - wide desktop original-only `Reader` now uses a tighter top seam, an earlier article start, and a calmer attached dock instead of the earlier boxed reading deck plus heavier side support treatment
  - focused original-only `Reader` stayed visually stable behind that reading-space reset instead of drifting into a separate micro-language
  - the Stage 394 audit confirmed that original-only `Reader` is materially closer to Recall's current reading direction, while `Home` and `Graph` stayed stable behind the Reader second pass
- The March 20, 2026 Stage 395/396 Home tag-tree board reset is complete:
  - wide desktop `Home` now uses a slimmer control seam, a denser organizer rail with collapsible previews, a stronger selected-group board, and a calmer pinned reopen shelf instead of the earlier tree-plus-board composition that still left a large dead center
  - focused overview and narrower `Home` regressions stayed aligned with that denser organized-library hierarchy instead of drifting back toward the older detached landing-card language
  - the Stage 396 audit confirmed that `Home` is materially closer to Recall's current tag-tree-driven library direction, while `Graph` and original-only `Reader` stayed stable behind the Home pass
- The March 20, 2026 Stage 397/398 Home board-fill reset is complete:
  - wide desktop `Home` now gives the selected-group board the dominant lane, renders the active group as a fuller multi-card board, and keeps the reopen flow in a tighter companion shelf instead of squeezing the board into a narrow side strip
  - focused overview and narrower `Home` regressions stayed aligned with that fuller organized-library hierarchy instead of drifting back toward the older detached landing-card language
  - the Stage 398 audit confirmed that `Home` is materially closer to Recall's current filtered-card board direction, while `Graph` and original-only `Reader` stayed stable behind the Home pass
- The March 20, 2026 Stage 399/400 Home filtered-card density reset is complete:
  - wide desktop `Home` now keeps the selected-group board denser above the fold with shorter cards, broader visible card coverage, and a tighter reopen sidecar instead of the earlier tall-card board that still stopped early
  - focused overview and narrower `Home` regressions stayed aligned with that denser board-first hierarchy instead of drifting back toward the older detached landing-card language
  - the Stage 400 audit confirmed that `Home` is materially closer to Recall's current dense filtered-card board direction, while `Graph` and original-only `Reader` stayed stable behind the Home pass
- The March 20, 2026 Stage 401/402 Home continuous-board-coverage reset is complete:
  - wide desktop `Home` now keeps the selected-group board running farther down the viewport with longer default active-group coverage, a tighter sidecar, and a more continuous card sheet instead of the earlier dense board that still stopped too early
  - focused overview and narrower `Home` regressions stayed aligned with that longer board-first hierarchy instead of drifting back toward the older detached landing-card language
  - the Stage 402 audit confirmed that `Home` is materially closer to Recall's current continuous filtered-card board direction, while `Graph` and original-only `Reader` stayed stable behind the Home pass
- The March 20, 2026 Stage 403/404 Home library-sheet flattening reset is complete:
  - wide desktop `Home` now keeps the selected-group board flatter and more sheet-like, with longer default active-group coverage, a softer inline footer stop, and a tighter reopen sidecar instead of the earlier framed dense card cluster
  - focused overview and narrower `Home` regressions stayed aligned with that flatter board-first hierarchy instead of drifting back toward the older detached landing-card language
  - the Stage 404 audit confirmed that `Home` is materially closer to Recall's current library-sheet direction, while `Graph` and original-only `Reader` stayed stable behind the Home pass
- The March 20, 2026 Stage 405/406 Home tag-tree control-surface reset is complete:
  - wide desktop `Home` now uses a slimmer top seam, a denser organizer rail control surface, a clearer tag-tree working stack, and an earlier board entry point instead of the earlier flatter sheet that still spent too much height on explanatory chrome before the card field
  - focused overview and narrower `Home` regressions stayed aligned with that denser organizer-led hierarchy instead of drifting back toward the older detached landing-card language
  - the Stage 406 audit confirmed that `Home` is materially closer to Recall's current tag-tree-driven homepage direction, while `Graph` and original-only `Reader` stayed stable behind the Home pass
- The March 20, 2026 Stage 407/408 Home minimal-entry reset is complete:
  - wide desktop `Home` now uses a flatter utility seam, a lighter organizer entry, a slimmer board header, and a calmer next-source sidecar instead of the earlier entry stack that still read like multiple intro cards before the working board
  - focused overview and narrower `Home` regressions stayed aligned with that leaner organizer-led hierarchy instead of drifting back toward the older detached landing-card language
  - the Stage 408 audit confirmed that `Home` is materially closer to Recall's current minimal-entry homepage direction, while `Graph` and original-only `Reader` stayed stable behind the Home pass
- The March 20, 2026 Stage 409/410 Home organizer-rail header compression reset is complete:
  - wide desktop `Home` now starts the organizer rail with a tighter working header, a faster search/control handoff, and an earlier first visible group instead of the earlier rail-top stack that still read like a second intro card before the tree
  - focused overview and narrower `Home` regressions stayed aligned with that tighter organizer-led hierarchy instead of drifting back toward the older detached landing-card language
  - the Stage 410 audit confirmed that `Home` is materially closer to Recall's current utility-first, tag-tree-driven homepage direction, while `Graph` and original-only `Reader` stayed stable behind the Home pass
- The March 21, 2026 Stage 411/412 Home organizer-row flattening reset is complete:
  - wide desktop `Home` now uses flatter organizer rows, a stronger selected-row treatment, and lighter attached preview children instead of the earlier mini-card tree that still felt too boxed inside the rail
  - focused overview and narrower `Home` regressions stayed aligned with that leaner organizer-led hierarchy instead of drifting back toward the older detached landing-card language
  - the Stage 412 audit confirmed that `Home` is materially closer to Recall's current lean tag-list-driven homepage direction, while `Graph` and original-only `Reader` stayed stable behind the Home pass
- The March 21, 2026 Stage 413/414 Home organizer-selection continuity reset is complete:
  - wide desktop `Home` now uses a lighter selected-row treatment, one continuous organizer spine, and attached previews that read more like one rail flow instead of content sitting inside a highlighted panel
  - focused overview and narrower `Home` regressions stayed aligned with that more continuous organizer-led hierarchy instead of drifting back toward the older detached landing-card language
  - the Stage 414 audit confirmed that `Home` is materially closer to Recall's current continuous tag-list-driven homepage direction, while `Graph` and original-only `Reader` stayed stable behind the Home pass
- The March 21, 2026 Stage 415/416 Home organizer highlight-deflation reset is complete:
  - wide desktop `Home` now uses a lighter active-row wash, a softer count chip, and quieter attached preview emphasis instead of the earlier selected state that still relied too much on badge-and-border chrome
  - focused overview and narrower `Home` regressions stayed aligned with that calmer organizer-led hierarchy instead of drifting back toward the older detached landing-card language
  - the Stage 416 audit confirmed that `Home` is materially closer to Recall's current minimal continuous tag-list-driven homepage direction, while `Graph` and original-only `Reader` stayed stable behind the Home pass
- The March 21, 2026 Stage 417/418 Home organizer readout-softening reset is complete:
  - wide desktop `Home` now uses an inline active count/readout hint, a flatter selected row, and calmer attached preview rhythm instead of the earlier selected state that still separated the count into a badge-like chip
  - focused overview and narrower `Home` regressions stayed aligned with that leaner organizer-led hierarchy instead of drifting back toward the older detached landing-card language
  - the Stage 418 audit confirmed that `Home` is materially closer to Recall's current lean utility-first organizer direction, while `Graph` and original-only `Reader` stayed stable behind the Home pass
- The March 21, 2026 Stage 419/420 Home organizer preview-grouping deflation reset is complete:
  - wide desktop `Home` now uses an unboxed attached preview, a flatter selected row, and a more continuous organizer spine instead of the earlier selected state that still nested the lead preview inside a mini-card
  - focused overview and narrower `Home` regressions stayed aligned with that leaner organizer-led hierarchy instead of drifting back toward the older detached landing-card language
  - the Stage 420 audit confirmed that `Home` is materially closer to Recall's current lean utility-first organizer direction, while `Graph` and original-only `Reader` stayed stable behind the Home pass
- The March 21, 2026 Stage 421/422 Home summary-preview join tightening reset is complete:
  - wide desktop `Home` now uses a tighter active summary-to-preview handoff, a calmer attached preview join, and a more continuous selected branch instead of the earlier selected state that still stacked the active summary above a slightly detached preview tier
  - focused overview and narrower `Home` regressions stayed aligned with that tighter organizer-led hierarchy instead of drifting back toward the older detached landing-card language
  - the Stage 422 audit confirmed that `Home` is materially closer to Recall's current lean utility-first organizer direction, while `Graph` and original-only `Reader` stayed stable behind the Home pass
- The March 21, 2026 Stage 423/424 Home active summary-note integration reset is complete:
  - wide desktop `Home` now integrates the active summary note into the attached preview flow, keeps collapsed organizer context intact, and makes the selected branch read more like one continuous rail instead of a title-plus-note block above the previews
  - focused overview and narrower `Home` regressions stayed aligned with that tighter organizer-led hierarchy instead of drifting back toward the older detached landing-card language
  - the Stage 424 audit confirmed that `Home` is materially closer to Recall's current lean utility-first organizer direction, while `Graph` and original-only `Reader` stayed stable behind the Home pass
- The March 21, 2026 Stage 425/426 Home active summary copy-weight deflation reset is complete:
  - wide desktop `Home` now uses a shorter active bridge hint inside the expanded organizer branch while keeping broader section descriptions and collapsed context intact, so the selected branch reads less like explanatory helper copy and more like a lean rail hint
  - focused overview and narrower `Home` regressions stayed aligned with that lighter organizer-led hierarchy instead of drifting back toward the older detached landing-card language
  - the Stage 426 audit confirmed that `Home` is materially closer to Recall's current lean utility-first organizer direction, while `Graph` and original-only `Reader` stayed stable behind the Home pass
- The March 21, 2026 Stage 427/428 Home active bridge-hint retirement reset is complete:
  - wide desktop `Home` now removes the visible helper hint from the expanded organizer branch and lets the selected row plus attached previews carry the branch on their own, while keeping collapsed organizer context intact
  - focused overview and narrower `Home` regressions stayed aligned with that leaner organizer-led hierarchy instead of drifting back toward the older detached landing-card language
  - the Stage 428 audit confirmed that `Home` is materially closer to Recall's current lean utility-first organizer direction, while `Graph` and original-only `Reader` stayed stable behind the Home pass; further Home-only trims were lower leverage at that checkpoint, so `Graph` became the likeliest next broad parity target
  - the Stage 430 audit then confirmed that `Graph` is materially closer to Recall's current corner-controls and focus-rail direction after the broader workbench reset, while `Home` and original-only `Reader` stayed stable; `Home` then became the likeliest next broad parity target
- The March 21, 2026 Stage 431/432 Home organizer-control deck reset is complete:
  - wide desktop `Home` now uses a slimmer utility seam, a real organizer control deck with attached search/sort/hide behavior, and a compact organizer-hidden fallback that lets the board widen without losing control access
  - focused overview and narrower `Home` regressions stayed aligned with that organizer-led hierarchy instead of drifting back toward the older detached landing-card language
  - the Stage 432 audit confirmed that `Home` is materially closer to Recall's current organizer-led homepage direction, while `Graph` and original-only `Reader` stayed stable; `Graph` became the likeliest next broad parity target at that checkpoint
- The March 21, 2026 Stage 433/434 Graph canvas-first drawer reset is complete:
  - wide desktop `Graph` now defaults to a hidden-by-default tools drawer, a slimmer top seam, a stronger bottom path rail, and no always-visible empty inspect lane, so the canvas reads closer to Recall's current drawer-secondary default state
  - focused and narrower `Graph` regressions stayed aligned with that calmer canvas-first hierarchy instead of drifting back toward the older standing-rail layout
  - the Stage 434 audit confirmed that `Graph` is materially closer to Recall's current canvas-first, drawer-secondary direction, while `Home` and original-only `Reader` stayed stable; `Home` became the likeliest next broad parity target at that checkpoint
- The March 21, 2026 Stage 435/436 Home board-first organizer reset is complete:
  - wide desktop `Home` now uses a slimmer organizer rail, an attached reopen cluster at the top of the main board, a more dominant active board lane, and in-place filtered results instead of splitting attention between a standing reopen sidecar, a detached filtered card, and a lower library stream
  - focused overview and narrower `Home` regressions stayed aligned with that board-first organizer hierarchy instead of drifting back toward the older multi-panel library dashboard language
  - the Stage 436 audit confirmed that `Home` is materially closer to Recall's current organizer-led, board-first direction, while `Graph` and original-only `Reader` stayed stable; `Graph` is now the likeliest next broad parity target if another slice opens
- The March 21, 2026 Stage 437/438 Graph corner-pods and overlay-drawer reset is complete:
  - wide desktop `Graph` now uses compact corner pods, a true overlay tools drawer, a stable full-width canvas, and a smaller floating path rail instead of the earlier canvas that still reflowed around chrome and over-weighted the top seam
  - focused and narrower `Graph` regressions stayed aligned with that calmer canvas-first hierarchy instead of drifting back toward the older banner-plus-standing-drawer language
  - the Stage 438 audit confirmed that `Graph` is materially closer to Recall's current corner-controls-plus-overlay-drawer direction, while `Home` and original-only `Reader` stayed stable; `Home` is now the likeliest next broad parity target if another slice opens
- The March 21, 2026 Stage 439/440 Home unified workbench reset is complete:
  - wide desktop `Home` now uses a slimmer workbench bar, a more docked organizer rail, and a flatter single-shell library board instead of the earlier stacked hero-plus-rail-plus-board framing
  - focused overview and narrower `Home` regressions stayed aligned with that calmer organizer-led workbench hierarchy instead of drifting back toward the older multi-panel library dashboard language
  - the Stage 440 audit confirmed that `Home` is materially closer to Recall's current organizer-led workbench direction, while `Graph` and original-only `Reader` stayed stable; `Graph` is now the likeliest next broad parity target if another slice opens
- The March 21, 2026 Stage 441/442 Graph minimal launcher and compact path rail reset is complete:
  - wide desktop `Graph` now uses a smaller top-left launcher pod, a lighter top-right search pod, a tighter floating path rail, and slightly denser node footprints instead of the earlier graph state that still read like a mini banner plus bottom HUD
  - focused and narrower `Graph` regressions stayed aligned with that calmer canvas-first hierarchy instead of drifting back toward the older heavier launcher-and-rail framing
  - the Stage 442 audit confirmed that `Graph` is materially closer to Recall's current lightweight-launcher graph direction, while `Home` and original-only `Reader` stayed stable; `Home` is now the likeliest next broad parity target if another slice opens
- The March 21, 2026 Stage 443/444 Home single-board pinned-cluster reset is complete:
  - wide desktop `Home` now fuses the pinned reopen cluster into the main library board, keeps filtered matches inside the same canonical board shell, and starts the active source list earlier instead of splitting the board area between a separate pinned shelf and a separate selected-group panel
  - focused overview and narrower `Home` regressions stayed aligned with that calmer organizer-led board hierarchy instead of drifting back toward the older multi-destination library stack
  - the Stage 444 audit confirmed that `Home` is materially closer to Recall's current organizer-led single-board library direction, while `Graph` and original-only `Reader` stayed stable; `Graph` is now the likeliest next broad parity target if another slice opens
- The March 21, 2026 Stage 445/446 Graph working-control hierarchy reset is complete:
  - wide desktop `Graph` now uses a lighter launcher pod, a lighter search/status pod, and a more active bottom working trail instead of the earlier corner controls that still read like mini cards plus passive HUD copy
  - focused and narrower `Graph` regressions stayed aligned with that calmer canvas-first hierarchy instead of drifting back toward the older heavier launcher-and-rail framing
  - the Stage 446 audit confirmed that `Graph` is materially closer to Recall's current light-control, canvas-first direction, while `Home` and original-only `Reader` stayed stable; `Home` is now the likeliest next broad parity target if another slice opens
- The March 21, 2026 Stage 447/448 Home organizer-owned navigation reset is complete:
  - wide desktop `Home` now uses a smaller shell-status seam, keeps search/sort/collapse/hide behavior in the organizer rail, and lets the right-side board read more like the quieter filtered results surface instead of a second command deck
  - focused overview and narrower `Home` regressions stayed aligned with that calmer organizer-owned navigation hierarchy instead of drifting back toward the older repeated-control stack
  - the Stage 448 audit confirmed that `Home` is materially closer to Recall's current organizer-owned navigation direction, while `Graph` and original-only `Reader` stayed stable; `Graph` is now the likeliest next broad parity target if another slice opens
- The March 21, 2026 Stage 449/450 Graph corner-actions and drawer-hierarchy reset is complete:
  - wide desktop `Graph` now uses a truer launcher-only pod, a tighter search-action corner, a slimmer utility-style tools drawer, and a clearer split between bottom working trail plus right inspect drawer instead of letting selected-node context creep back into the top seam
  - focused and narrower `Graph` regressions stayed aligned with that calmer canvas-first hierarchy instead of drifting back toward the older heavier corner-control framing
  - the Stage 450 audit confirmed that `Graph` is materially closer to Recall's current corner-action and drawer hierarchy direction, while `Home` and original-only `Reader` stayed stable; `Home` is now the likeliest next broad parity target if another slice opens
- The March 21, 2026 Stage 451/452 Home compact reopen rail and board-top hierarchy reset is complete:
  - wide desktop `Home` now uses a compact reopen rail, a calmer board-top handoff, and an earlier active saved-source start instead of a taller featured reopen hero followed by the actual working board
  - focused overview and narrower `Home` regressions stayed aligned with that calmer organizer-led board-top hierarchy instead of drifting back toward the older reopen-shelf-heavy stack
  - the Stage 452 audit confirmed that `Home` is materially closer to Recall's current organizer-led compact-board direction, while `Graph` and original-only `Reader` stayed stable; `Graph` is now the likeliest next broad parity target if another slice opens
- The March 21, 2026 Stage 453/454 Graph settings-sidebar and search-navigation reset is complete:
  - wide desktop `Graph` now uses a truer settings launcher, a distinct top-right graph-search navigation corner, a settings-owned filter lane, and lighter hover-preview exploration instead of leaning on the older search-as-filter strip plus heavier always-carded canvas model
  - focused and narrower `Graph` regressions stayed aligned with that calmer canvas-first hierarchy instead of drifting back toward the older heavier control chrome
  - the Stage 454 audit confirmed that `Graph` is materially closer to Recall's current settings-sidebar and search-navigation direction, while `Home` and original-only `Reader` stayed stable; `Home` is now the likeliest next broad parity target if another slice opens
- The March 21, 2026 Stage 455/456 Home direct-board and organizer-hierarchy reset is complete:
  - wide desktop `Home` now uses a truer organizer-owned rail, a direct working board that begins earlier, and a compact attached reopen rail instead of a featured reopen shelf stacked above the board
  - focused overview and narrower `Home` regressions stayed aligned with that calmer organizer-led direct-board hierarchy instead of drifting back toward the older reopen-shelf-heavy stack
  - the Stage 456 audit confirmed that `Home` is materially closer to Recall's current organizer-led direct-board direction, while `Graph` and original-only `Reader` stayed stable; `Graph` is now the likeliest next broad parity target if another slice opens
- The March 21, 2026 Stage 457/458 Graph node-language and hover-hierarchy reset is complete:
  - wide desktop `Graph` now uses lighter at-rest node treatment, a calmer full-canvas read, and hover previews that carry type/source/count context before selection hands off to the bottom working trail and right inspect drawer
  - focused and narrower `Graph` regressions stayed aligned with that calmer canvas-first hierarchy instead of drifting back toward the older always-carded node field
  - the Stage 458 audit confirmed that `Graph` is materially closer to Recall's current canvas-first node-language direction, while `Home` and original-only `Reader` stayed stable; `Home` is now the likeliest next broad parity target if another slice opens
- The March 21, 2026 Stage 459/460 Home inline-reopen-strip and board-dominant workspace reset is complete:
  - wide desktop `Home` now keeps the pinned reopen continuity inside the active board as a compact inline strip instead of a competing right-side lane, so the grouped or filtered cards start sooner and hold more of the visible workspace
  - focused overview and narrower `Home` regressions stayed aligned with that organizer-led board-dominant hierarchy instead of drifting back toward the older board-plus-side-lane split
  - the Stage 460 audit confirmed that `Home` is materially closer to Recall's current organizer-led board-dominant direction, while `Graph` and original-only `Reader` stayed stable; `Graph` is now the likeliest next broad parity target if another slice opens
- The March 21, 2026 Stage 461/462 Graph bottom-bar and drawer workflow reset is complete:
  - wide desktop `Graph` now keeps the top-right seam utility-first, lets the settings drawer stay focused on filtering and quick picks, and moves more of the selected-node/path workflow into the stronger bottom rail plus the right inspect drawer
  - focused and narrower `Graph` regressions stayed aligned with that bottom-bar-plus-right-drawer workflow instead of drifting back toward the older metrics-heavy seam plus duplicated pinned-node framing
  - the Stage 462 audit confirmed that `Graph` is materially closer to Recall's current working-state direction, while `Home` and original-only `Reader` stayed stable; `Home` is now the likeliest next broad parity target if another slice opens
- The March 21, 2026 Stage 463/464 Home organizer-deck and results-sheet reset is complete:
  - wide desktop `Home` now uses a flatter organizer deck, a lighter inline reopen strip, and an earlier active-board start so the right side reads more like one Recall-style filtered working sheet
  - focused overview and narrower `Home` regressions stayed aligned with that organizer-led direct-results-sheet hierarchy instead of drifting back toward the older staged header-plus-feature-strip composition
  - the Stage 464 audit confirmed that `Home` is materially closer to Recall's current organizer-led direct-results-sheet direction, while `Graph` and original-only `Reader` stayed stable; `Graph` is now the likeliest next broad parity target if another slice opens
- The March 21, 2026 Stage 465/466 Graph settings-panel and view-controls reset is complete:
  - wide desktop `Graph` now uses a true settings sidebar with live connection-depth, spacing, hover-focus, and count-visibility controls instead of letting the left drawer drift back toward a mixed utility-plus-inspect rail
  - focused and narrower `Graph` regressions stayed aligned with that calmer canvas-first hierarchy instead of drifting back toward the older mixed-sidebar language
  - the Stage 466 audit confirmed that `Graph` is materially closer to Recall's current settings-sidebar and live-view-controls direction, while `Home` and original-only `Reader` stayed stable; `Home` became the likeliest next broad parity target at that checkpoint
- The March 21, 2026 Stage 467/468 Home organizer sorting and board-view reset is complete:
  - wide desktop `Home` now uses organizer-owned `Updated`, `Created`, and `A-Z` sorting, explicit direction toggles, real `Board` / `List` view switching, and an organizer-hidden compact fallback that preserves the same command surface
  - focused overview and narrower `Home` regressions stayed aligned with that richer organizer-led hierarchy instead of drifting back toward the older thinner sort-strip model
  - the Stage 468 audit confirmed that `Home` is materially closer to Recall's current organizer-led control and board-view direction, while `Graph` and original-only `Reader` stayed stable; `Graph` then became the likeliest next broad parity target if another slice opened
- The March 21, 2026 Stage 469/470 Graph focus-mode and drawer exploration reset is complete:
  - wide desktop `Graph` now uses a stronger selected-node focus mode, a bottom working rail that owns more source continuity and jump-back flow, and a calmer tabbed right drawer for overview, mentions, and relations instead of one long stacked evidence wall
  - focused and narrower `Graph` regressions stayed aligned with that calmer drawer-led exploration hierarchy instead of drifting back toward the older stacked dashboard language
  - the Stage 470 audit confirmed that `Graph` is materially closer to Recall's current focus-mode and drawer-led exploration direction, while `Home` and original-only `Reader` stayed stable; `Home` is now the likeliest next broad parity target if another slice opens
- The March 21, 2026 Stage 471/472 Home organizer tree-branch navigation reset is complete:
  - wide desktop `Home` now lets the active organizer branch own more direct source navigation with fuller inline source rows, expandable earlier-source tails, and a cleaner board start that no longer competes with a reopen shelf when the organizer is visible
  - focused overview and narrower `Home` regressions stayed aligned with that tree-driven organizer hierarchy instead of drifting back toward a grouped preview strip
  - the Stage 472 audit confirmed that `Home` is materially closer to Recall's current tree-driven organizer direction, while `Graph` and original-only `Reader` stayed stable; `Graph` is now the likeliest next broad parity target if another slice opens
- The March 21, 2026 Stage 473/474 Graph multi-select path-exploration reset is complete:
  - wide desktop `Graph` now supports bounded multi-select with a bottom-rail-led path workflow, a visible shortest-path highlight across the current canvas, and a restored single-node focus handoff back into the right detail drawer instead of treating the bottom rail as passive status chrome
  - focused and narrower `Graph` regressions stayed aligned with that calmer path-exploration hierarchy instead of drifting back toward banner-plus-drawer competition
  - the Stage 474 audit confirmed that `Graph` is materially closer to Recall's current multi-select and path-exploration direction, while `Home` and original-only `Reader` stayed stable; `Home` is now the likeliest next broad parity target if another slice opens
- The March 21, 2026 Stage 475/476 Home collection-lens and organizer-model reset is complete:
  - wide desktop `Home` now opens with a real collection-led organizer lens, a deliberate `Recent` lens for the tree-driven recency branch, and organizer-owned controls that no longer depend on recency buckets as the only underlying browse model
  - focused overview and narrower `Home` regressions stayed aligned with that collection-led organizer hierarchy instead of drifting back toward recency-first grouping dressed up as a tag rail
  - the Stage 476 audit confirmed that `Home` is materially closer to Recall's current collection-led organizer direction, while `Graph` and original-only `Reader` stayed stable; `Graph` is now the likeliest next broad parity target if another slice opens
- The March 21, 2026 Stage 477/478 Graph timeline-presets and filter-customization reset is complete:
  - wide desktop `Graph` now uses named presets, an active timeline lens, and content filters inside the settings drawer while keeping selected-node workflow owned by the bottom rail plus right drawer instead of reviving heavier banner or top-seam chrome
  - focused and narrower `Graph` regressions stayed aligned with that calmer settings-led hierarchy instead of drifting back toward the older depth-and-layout-only drawer language
  - the Stage 478 audit confirmed that `Graph` is materially closer to Recall's current presets, timeline, and filter-customization direction, while `Home` and original-only `Reader` stayed stable; `Home` is now the likeliest next broad parity target if another slice opens
- The March 21, 2026 Stage 479/480 Home overview-board and group drill-in reset is complete:
  - wide desktop `Home` now opens in an organizer-owned grouped overview workspace for the active lens, then drills into one branch only when the user explicitly selects it instead of auto-committing to the first branch board
  - focused overview and organizer-hidden `Home` regressions stayed aligned with that calmer overview-first hierarchy instead of reviving the older default-single-board model
  - the Stage 480 audit confirmed that `Home` is materially closer to Recall's current organizer-led homepage direction, while `Graph` and original-only `Reader` stayed stable; `Graph` is now the likeliest next broad parity target if another slice opens
- The March 21, 2026 Stage 481/482 Graph navigation-controls and locked-layout reset is complete:
  - wide desktop `Graph` now owns fit-to-view, lock/unlock, wheel zoom, empty-space pan, keyboard search stepping, and lock-gated manual node arrangement directly from the corner control seam instead of treating the canvas as a mostly fixed poster
  - focused and narrower `Graph` regressions stayed aligned with that interactive-canvas hierarchy instead of drifting back toward a search-plus-drawer-only graph model
  - the Stage 482 audit confirmed that `Graph` is materially closer to Recall's current interactive-canvas direction, while `Home` and original-only `Reader` stayed stable; `Home` is now the likeliest next broad parity target if another slice opens
- The March 22, 2026 Stage 483/484 Home manual organizer ordering and selection reset is complete:
  - wide desktop `Home` now treats `Manual` as a real organizer work mode with bounded group/source reordering, multi-select, and a bottom organizer selection bar instead of a mostly passive browse rail
  - focused and narrower `Home` regressions stayed aligned with that organizer-workbench direction instead of reviving older card-first library hierarchy
  - the Stage 484 audit confirmed that `Home` is materially closer to Recall's current tag-tree workbench direction, while `Graph` and original-only `Reader` stayed stable; `Graph` is now the likeliest next broad parity target if another slice opens
- The March 22, 2026 Stage 485/486 Graph color-groups, legend, and resizable-settings reset is complete:
  - wide desktop `Graph` now uses explicit color-group ownership, a live legend, and a resizable settings drawer that reads more like a real configuration surface instead of fixed filter chrome
  - focused and narrower `Graph` regressions stayed aligned with that settings-customization hierarchy instead of weakening the canvas-first graph workbench
  - the Stage 486 audit confirmed that `Graph` is materially closer to Recall's current settings-customization direction, while `Home` and original-only `Reader` stayed stable; `Home` is now the likeliest next broad parity target if another slice opens
- The March 22, 2026 Stage 487/488 Home drag-drop organizer workbench reset is complete:
  - wide desktop `Home` now lets top-level organizer groups and active-branch source rows reorder by drag-and-drop in `Manual`, while the organizer selection bar behaves more like a true batch-action rail
  - focused and narrower `Home` regressions stayed aligned with that direct-manipulation organizer direction instead of falling back to button-only reordering
  - the Stage 488 audit confirmed that `Home` is materially closer to Recall's current organizer-workbench direction, while `Graph` and original-only `Reader` stayed stable; `Graph` is now the likeliest next broad parity target if another slice opens
- The March 22, 2026 Stage 489/490 Graph saved-view presets workflow reset is complete:
  - wide desktop `Graph` now supports local save, reapply, update, rename, delete, and reset flows for saved views instead of limiting presets to fixed starter states
  - focused and narrower `Graph` regressions stayed aligned with that saved-view customization direction instead of pulling selected-node work back into the settings drawer
  - the Stage 490 audit confirmed that `Graph` is materially closer to Recall's current saved-view customization direction, while `Home` and original-only `Reader` stayed stable; `Home` remained the likeliest next broad parity target before the next slice opened
- The March 22, 2026 Stage 491/492 Home resizable organizer rail reset is complete:
  - wide desktop `Home` now lets the organizer rail widen into a more believable working organizer without dropping the board-first library composition
  - focused and narrower `Home` regressions stayed aligned with that organizer-ergonomics direction instead of forcing long labels and denser branch work through a fixed narrow strip
  - the Stage 492 audit confirmed that `Home` is materially closer to Recall's current organizer ergonomics direction, while `Graph` and original-only `Reader` stayed stable; `Graph` is now the likeliest next broad parity target if another slice opens
- The March 22, 2026 Stage 493/494 Graph card drawer and connection-follow reset is complete:
  - wide desktop `Graph` now uses a truer card-first right drawer, with selected-card context centered in `Card`, original-only source continuity separated into `Reader`, and linked-card exploration separated into `Connections`
  - focused and narrower `Graph` regressions stayed aligned with that selected-card drawer direction instead of reviving an overview/mentions/relations evidence stack
  - the Stage 494 audit confirmed that `Graph` is materially closer to Recall's current selected-card drawer direction, while `Home` and original-only `Reader` stayed stable; `Home` is now the likeliest next broad parity target if another slice opens
- The March 22, 2026 Stage 495/496 Home custom collection management reset is complete:
  - wide desktop `Home` now gives the organizer real custom collection ownership, with in-place create, rename, delete, bulk assignment, and an explicit `Untagged` branch instead of limiting collections to static browse buckets
  - focused and narrower `Home` regressions stayed aligned with that organizer-owned collection-management direction instead of dropping the right-side board when a custom collection becomes active
  - the Stage 496 audit confirmed that `Home` is materially closer to Recall's current organizer-owned collection-management direction, while `Graph` and original-only `Reader` stayed stable; `Graph` is now the likeliest next broad parity target if another slice opens
- The current Recall-parity track is now in a guarded continuation state:
  - no new redesign slice opens automatically, but `Graph` is now the likeliest next broad parity target if the user keeps pushing the same benchmark direction
  - `Graph`, `Home`, and original-only `Reader` are refreshed parity baselines
  - `Notes` and `Study` remain refreshed regression baselines
- Wide desktop, not narrow-only focused mode, is now the primary visual truth for the remaining milestones.

- The accessible-reader app already provides local import for TXT, Markdown, HTML, DOCX, and text-based PDF, deterministic `Original` and `Reflowed` views, opt-in AI `Simplify` and `Summary`, local library/search, saved progress/settings, and Edge-first browser speech.
- A bounded Stage 1A detour is now implemented on the reader branch: public article-style webpage import fetches once on the backend, stores a local HTML snapshot, extracts readable article content locally, and reuses the normal reader pipeline. It remains snapshot-only; live URL sync and "import current tab" behavior are still out of scope.
- Stage 1B shared-core groundwork is now implemented in the backend:
  - `workspace.db` is the primary database target
  - legacy `reader.db` migrates automatically when present
  - shared tables now exist for source documents, document variants, reading sessions, app settings, change events, and future Recall-oriented entities
  - current reader API responses remain stable through the repository layer
  - shared storage now includes a generic source locator so future URL import can fit without another schema redesign
- Stage 1 closeout is complete:
  - the interrupted validation rerun was resumed and verified green on 2026-03-13
  - frontend `npm test -- --run`, `npm run lint`, and `npm run build` pass
  - backend `pytest` and app import checks pass
- Stage 2 closeout is complete:
  - `Recall` is now the default product shell
  - the current accessible-reader experience stays as an integrated Reader section inside that shell
  - deterministic chunking, keyword retrieval, and Markdown export now run over the shared document core
- The user-directed combined Stage 3 and Stage 4 pass is now complete:
  - deterministic graph extraction, confidence-ranked graph suggestions, and manual confirm/reject loops are live
  - hybrid retrieval now blends chunk, graph, and study-card evidence
  - source-grounded study cards and FSRS-backed review logs are live in Recall
  - the slice remains local-first and deterministic by default
  - AI scope is still unchanged and opt-in only for `Simplify` and `Summary`
- Stage 5 closeout is complete:
  - a bounded MV3 browser companion now runs against the existing localhost backend
  - low-noise contextual resurfacing is live through an in-page chip, popup, and options page
  - the extension stays context-only; current-tab import and live capture remain out of scope
  - backend browser-context retrieval, extension tests/build, and an Edge unpacked-extension smoke run are green
- Stage 6 closeout is complete:
  - Markdown round-trip fidelity now preserves ordered lists, nested lists, quotes, and heading levels through import, reflow, and export
  - shared document views now carry block metadata and deterministic variant metadata across local and AI-backed variants
  - shared reading sessions now persist summary detail and accessibility snapshots alongside sentence progress
  - Reader now falls back to backend last-session state when browser-local session storage is absent
  - backend/frontend validation and an Edge structured-Markdown/session-restore smoke run are green
- Stage 7 closeout is complete:
  - incremental workspace change-log APIs are now live over the shared change-event stream
  - portable attachment refs and workspace export manifests are now live
  - workspace export zip bundles now include `manifest.json` plus stored source attachments
  - deterministic merge-preview rules are now live without enabling full sync or background replay
  - backend/frontend validation and a localhost manifest/export/merge smoke run are green
- Stage 8 closeout is complete:
  - workspace integrity and repair APIs are now live
  - startup self-healing now repairs drifted FTS indexes and refreshes derived Recall state when versions or indexes are stale
  - workspace export manifests now surface non-fatal missing-attachment warnings while zip export remains available
  - a deterministic benchmark harness now measures ingest, retrieval, browser-context, export, merge preview, and study scheduling flows
  - backend/frontend/extension validation, benchmark runs, and a localhost integrity/repair smoke run are green
- A bounded pre-Stage-9 stabilization detour is now complete:
  - fetch-level network failures now show actionable local-service reconnect guidance instead of raw `Failed to fetch`
  - Recall now reports explicit unavailable states for library, graph, study, and document-detail loading, each with retry actions
  - Reader now distinguishes an empty library from a temporary local-service outage while keeping import controls usable
  - backend/frontend/extension validation plus live Playwright outage-and-recovery smoke coverage are green
- Stage 9 closeout is complete:
  - shared note records, note FTS, note routes, and note change events are now live in the shared backend
  - Reader now captures local source-linked sentence-range notes in deterministic `reflowed/default` views only
  - Reader now renders persisted note highlights, route-anchor highlights, and jump-back ranges without auto-starting speech
  - Recall now includes a dedicated `Notes` section with document-scoped notes, note search, edit/delete flows, and `Open in Reader`
  - stale saved-session view/note fetches now wait until the active document is actually resolved, preventing noisy 404s during startup recovery
  - backend/frontend/extension validation plus a live Playwright note capture/search/jump-back smoke run on a clean temp workspace are green
- Stage 10 closeout is complete:
  - the MV3 companion now supports bounded browser note capture for exact saved public-page matches
  - note hits now participate in Recall retrieval and browser-context resurfacing
  - a debug-only extension inspection build plus a repo-owned real Edge unpacked harness now cover popup refresh, note capture, Recall note surfacing, and anchored Reader reopen
- The approved Reader shell convergence correction is complete:
  - Reader now renders inside Recall-native hero, sidebar, view-tab, and card structure instead of preserving a competing standalone app identity
  - Reader wording now follows the Recall-first product frame, including `Add source`, `Source library`, and Recall-centered hero copy
  - the browser tab title, backend API title, and related runtime labels now use `Recall Workspace`
  - frontend/backend/extension validation plus the real Edge harness and visual artifact review are green after the convergence
- The Reader-as-section parity follow-up is complete:
  - the top-level `Recall | Reader` split is gone; one workspace section row now owns `Library`, `Graph`, `Study`, `Notes`, and `Reader`
  - returning from Reader now preserves the prior Recall section across handoff and browser-back flows instead of dropping users back to `Library`
  - compact no-document Reader onboarding keeps `Settings` reachable without restoring the old standalone Reader shell chrome
- A post-Stage-8 roadmap extension is now approved:
  - Stage 9 will add source-linked highlights and notes inside Reader and Recall
  - Stage 10 will extend note capture through the browser companion and fold notes into retrieval
  - Stage 11 will carry notes through portable apply flows and support manual promotion into graph/study workflows
- Stage 11 is complete:
  - workspace export manifests and merge-preview decisions now include portable `recall_note` entities
  - Recall Notes detail now supports explicit promotion into confirmed graph nodes and manual study cards
  - promoted manual graph/study artifacts now survive derived graph refreshes and deterministic study-card regeneration
  - backend/frontend/extension validation plus a live localhost browser smoke are green
  - the live smoke uncovered and fixed one Study handoff issue where promoted manual cards could fall outside the visible-card window
- Stage 12 roadmap refresh is complete:
  - a live localhost UX audit across Library, Study, Notes, and Reader confirmed the largest remaining gap is workflow polish rather than another backend feature tier
  - the next slice is now focused on global add/search flow, focused Reader layout, and adjacent reading context instead of new storage or AI scope
- Stage 13 workflow polish is complete:
  - shell-level `New` and `Search` actions are now live across Recall and Reader, with the workspace search dialog reopening fresh on each use
  - global search now blends sources, notes, and Recall retrieval hits, and hands off correctly into `Notes` and anchored `Reader` reopen flows
  - Reader now uses a focused split-view layout with adjacent source/note context instead of stacking import and support chrome above the document
  - frontend tests/lint/build, a live Edge import smoke, a live Edge global-search reopen smoke, and the repo-owned real Edge extension harness are green
- A user-directed product correction is now fully implemented:
  - Reader adapts to the Recall-first shell structure instead of pulling Recall toward a separate app identity
  - the shared Recall shell now treats Reader as a section while keeping `/reader` deep links and anchor restore stable
- Stage 14 density and contextual Reader polish is complete:
  - shared shell header, hero, and section tabs now compact further during active working states
  - Reader context now exposes a richer current-source glance with note state, capture readiness, direct actions, and a sticky desktop presentation
  - narrower-width Reader fallbacks now keep context reachable with denser two-column and stacked arrangements instead of dropping back to loose card spacing
  - frontend validation plus a repo-owned real Edge density smoke harness are green
- Stage 15 recall collection density and detail handoffs is complete:
  - `Library` now uses a denser collection rail with local filtering, compact source rows, and a selected-document brief that keeps reopen/export/note handoffs closer to the list
  - `Notes` now use a tighter filter row, compact note rows with anchor/body/document context, and a selected-note detail layout that groups note-promotion actions without crowding the primary edit/open controls
  - frontend validation plus a repo-owned real Edge collection-density smoke covering Library filter, Notes handoff, and anchored Reader reopen are green
- Stage 16 recall graph and study density plus evidence handoffs is complete:
  - `Graph` now uses a denser node review rail plus evidence-first node detail with nearby Reader reopen actions for mentions and relations
  - `Study` now uses a denser queue, source-evidence-first active-card detail, and anchored Reader reopen from note-promoted card evidence
  - the Stage 16 live Edge smoke exposed and fixed a real Study handoff bug where targeted cards could fall out of the loaded queue window, and the final frontend validation plus repo-owned real Edge graph/study smoke are green
- Stage 17 post-Stage-16 Recall UX refresh is complete:
  - the refreshed audit confirmed the next bottleneck is workspace continuity, not another generic density pass
  - the highest-friction break is that section filters, selected items, and detail context remain too ephemeral across Reader handoff, search landings, and route changes
  - the next slice is now a bounded continuity and navigation-memory correction rather than a new backend or AI tier
- Stage 18 Recall workspace continuity and navigation memory is complete:
  - Library, Notes, Graph, and Study now preserve their working filters, selections, and detail focus across Reader handoff, browser back, and search-backed landings
  - the continuity model now lives above `RecallWorkspace`, so Reader route changes no longer wipe the user's working set
  - targeted frontend validation plus a repo-owned real Edge continuity smoke are green
  - the next slice is now a current-context and quick-switching correction so the remembered working set becomes more visible and easier to revisit
- Stage 19 current context dock and quick switching is complete:
  - the shared Recall shell now surfaces the active source, note, node, card, or Reader focus below the section row
  - recent work now supports bounded quick returns into the correct section/detail target without wiping continuity
  - targeted frontend validation plus a repo-owned real Edge current-context smoke are green
  - the next slice is now adaptive context compression so the shell keeps the Stage 19 visibility gains without repeating too much local detail
- Stage 20 adaptive context compression and detail consolidation is complete:
  - the shared dock now compresses by section, Reader no longer repeats a dedicated current-source block, and Notes detail keeps lighter metadata without losing the note/edit/promotion flow
  - targeted frontend validation plus a repo-owned real Edge context-compression smoke are green
- Stage 21 post-Stage-20 Recall UX refresh is complete:
  - the audit confirmed the next bottleneck is duplicated and sessionless search rather than another generic shell pass
  - the next slice is now unified workspace-search continuity and result handoffs
- Stage 22 unified workspace search continuity and result handoffs is complete:
  - the shell Search dialog and the Library search panel now share one remembered workspace-search session
  - query, grouped results, and focused-result context now survive dialog close/reopen, Notes handoff, anchored Reader reopen, and return to Library during the same session
  - Library no longer keeps a disconnected retrieval-only search path; search is now selection-first with explicit focused-result actions
  - frontend validation plus a repo-owned real Edge search-continuity smoke harness are green
- Stage 23 post-Stage-22 Recall UX refresh is complete:
  - the audit confirmed search continuity is no longer the primary workflow break
  - the highest-friction remaining gap is that saved-note editing and promotion still sit too far away from active reading
  - the next slice is now a Reader notebook-adjacency correction instead of another generic shell or search pass
- Stage 24 Reader notebook adjacency and in-place note workflows is complete:
  - Reader now keeps selected saved-note editing, deletion, Graph promotion, and Study promotion beside the source
  - saved notes stay focused in Reader after capture and when reopened from `Notes` or shared search
  - targeted frontend validation plus a repo-owned real Edge notebook-adjacency smoke are green
  - the next slice is now a fresh UX audit so the following milestone is chosen from the live post-Stage-24 workspace instead of from older note-distance assumptions
- Stage 25 post-Stage-24 Recall UX refresh is complete:
  - the audit confirmed Reader notebook adjacency fixed the previous note-distance bottleneck
  - the next highest-friction break is that one source still gets split across Library, Reader, Notes, Graph, and Study instead of feeling like one source-centered Recall workspace
  - the next slice is now a source-centered detail and tabbed-handoff correction rather than another section-local polish pass
- Stage 26 source-centered workspace detail and tabbed handoffs is complete:
  - one selected source now keeps a shared source-workspace frame with nearby `Overview`, `Reader`, `Notes`, `Graph`, and `Study` handoffs across Recall and Reader
  - `/reader` deep links stay stable while acting as a compatibility entry into the shared source-focused workflow
  - the live Edge smoke exposed and fixed a real continuity bug where stale Graph or Study detail could override the active source during source-tab handoff
  - targeted frontend validation plus a repo-owned real Edge source-workspace smoke are green
- Stage 27 post-Stage-26 Recall UX refresh is complete:
  - the audit confirmed source identity is no longer the main problem
  - the largest remaining friction is that source tabs still land inside section-first layouts with duplicated detail panels and always-visible collection rails
  - the next slice is now a true shared source-pane and contextual collection-drawer correction instead of more handoff-only polish
- Stage 28 shared source panes and contextual collection drawers is complete:
  - `Overview` now acts as a real source summary surface with nearby saved-note, graph, and study context plus direct next actions
  - source-focused landings now collapse Library, Notes, Graph, and Study browsing into lighter contextual drawers while manual section clicks still reopen full browse mode
  - targeted frontend validation plus a repo-owned real Edge shared-source-pane smoke are green
- Stage 29 post-Stage-28 Recall UX refresh is complete:
  - the audit confirmed Stage 28 solved repeated source-local detail scaffolding, but not the remaining dashboard-first shell problem
  - the highest-friction remaining break is that active source work still begins below the hero, context dock, and supporting browse scaffolding instead of taking over the workspace the way Recall cards increasingly do
  - the next slice is now focused source mode plus collapsible workspace chrome rather than another new feature tier
- Stage 30 focused source mode and collapsible workspace chrome is complete:
  - active source work now renders above generic shell chrome in both Recall and Reader source-focused sessions
  - hero, current-context, and recent-work support now collapse behind an explicit `Show workspace support` affordance instead of permanently sitting above the active source canvas
  - manual section clicks still reopen browse-first Library/Notes/Graph/Study surfaces while source workspace tabs preserve source-focused return flows
  - targeted frontend validation plus a repo-owned real Edge Stage 30 smoke are green
  - the broad `frontend/src/App.test.tsx` integration file still needs a later runner-stability cleanup when executed as one whole file
- Stage 31 post-Stage-30 Recall UX refresh is complete:
  - the audit confirmed shell-level stacking is no longer the primary workflow break after Stage 30
  - the next highest-leverage UX gap is that active source work still requires too many hard tab switches between Reader, Notes, Graph, and Study
  - the next slice is now flexible source split work plus adaptable side panes so related tools stay adjacent to one visible source instead of replacing the full surface
- Stage 32 flexible source split work and adaptable side panes is complete:
  - focused `Notes`, `Graph`, and `Study` now keep one active source visible in a split workspace instead of replacing the full source surface
  - manual section clicks still reopen browse-first surfaces while source-local tools stay nearby during focused work
  - `frontend npm run lint`, `frontend npm run build`, and the repo-owned real Edge Stage 32 smoke are green
  - the broad `frontend/src/App.test.tsx` runner-stability issue still exists, but it no longer blocks closing the UX slice
- Stage 33 post-Stage-32 Recall UX refresh is complete:
  - the audit confirmed Stage 32 solved the full-surface swap problem, but the split workspace is still too overview-led
  - the highest-friction remaining gap is that note, graph, and study work still anchor around `Source overview` more often than the live source itself
  - the next slice is now a reader-led split-work correction with contextual evidence panes instead of another generic shell pass
- Stage 34 reader-led source split and contextual evidence panes is complete:
  - focused `Notes`, `Graph`, and `Study` now keep embedded Reader content as the steady primary pane instead of keeping `Source overview` steady during source-local work
  - note anchors, graph evidence, and study source spans now retarget the embedded Reader in place while explicit `Open in Reader` deep links stay intact
  - targeted frontend coverage, `frontend npm run lint`, `frontend npm run build`, and the repo-owned real Edge Stage 34 smoke are green
- Stage 35 collection-first Recall shell reset is complete:
  - default `/recall` now uses a collection-first shell with a left rail, slim top bar, primary canvas, and lighter utility dock
  - focused source work now uses a compact source strip and no longer depends on the old support-strip reopen model
  - targeted shell/frontend coverage, `frontend npm run lint`, `frontend npm run build`, and the refreshed repo-owned real Edge Stage 34 smoke are green
- Stage 36 post-Stage-35 Recall UX refresh is complete:
  - the audit confirmed the reader-led focused split work and responsive shell are no longer the main bottlenecks
  - the highest-friction remaining break is that populated `/recall` still boots into source-focused Library instead of a true collection-first landing
  - the next slice is now a collection-first landing and intentional source-entry correction
- Stage 37 true collection-first landing and intentional source entry is complete:
  - populated `/recall` now stays browse-first by default and no longer auto-enters focused source mode on load
  - the default Library landing now uses a calmer source grid plus inline resume card instead of keeping `Source overview` and `Search workspace` steady on the landing
  - targeted frontend coverage, `frontend npm run lint`, `frontend npm run build`, and the repo-owned real Edge Stage 37 smoke are green
- Stage 38 post-Stage-37 Recall UX refresh is complete:
  - the audit confirmed the remaining bottleneck is no longer navigation entry logic, but visual hierarchy and density
  - landing cards are readable again after the user-reported contrast and overflow regressions were corrected
  - the next slice is now a bounded hierarchy/density cleanup for the landing, focused Library, and tablet-width layout
- Stage 39 Recall hierarchy cleanup and responsive card density is complete:
  - the default landing now uses calmer, wider source cards with clearer hierarchy, less repeated labeling, and cleaner tablet-width density
  - focused Library no longer renders the inline `Search workspace` panel, and the focused source strip now carries less chip overload
  - targeted frontend coverage, `frontend npm run lint`, `frontend npm run build`, the repo-owned real Edge Stage 37 smoke, and the repo-owned Stage 39 screenshot harness are green
- Stage 40 benchmark-driven Recall surface audit is complete:
  - the audit is now anchored to the user-provided Recall screenshots plus official Recall docs/blog/changelog references instead of a generic post-implementation UX pass
  - a benchmark matrix plus fresh localhost captures now lock the biggest remaining gaps: heavy shared shell chrome, Library card-wall structure, Add Content hierarchy, Graph over-framing, and Study dashboard density
  - the next slice is now a shared-shell-first convergence pass across Library, Add Content, Graph, and Study rather than another open-ended audit
- Stage 41 recall shared shell and surface convergence is complete:
  - the shell rail and top bar are calmer, browse-mode `Graph` and `Study` no longer carry the extra utility dock, and focused mode no longer repeats as much chrome
  - Library now uses a two-zone sidebar + collection canvas, the add-source flow now uses grouped import modes, and Graph/Study now frame their main task more intentionally
  - targeted frontend coverage, `frontend npm run build`, file-scoped ESLint on the touched frontend files, and the repo-owned real Edge Stage 41 screenshot harness are green
  - the next slice is now a fresh benchmark audit to decide whether the highest-value follow-up is Library density reduction, Graph canvas emphasis, Study chrome reduction, or add-modal simplification
- Stage 42 post-Stage-41 benchmark audit is complete:
  - the audit confirmed the shared shell direction is now correct, but populated Library/home remains the highest-leverage benchmark mismatch
  - Add Content is close enough to ride with the next Library slice, while Graph and Study remain queued medium mismatches rather than the immediate next target
  - the next slice is now a bounded Library selectivity and add-source hierarchy cleanup rather than another shared-shell or multi-surface rewrite
- Stage 43 Recall Library selectivity and add-source hierarchy cleanup is complete:
  - Library now groups recent sources into clearer sections, older material reopens from lighter rows, and the landing reads more like a selective collection surface than an archive wall
  - the global add-content dialog now uses one clear heading with grouped import modes instead of repeating `Add source` and `Add content`
  - targeted frontend coverage, `frontend npm run build`, file-scoped ESLint on the touched files, and the repo-owned real Edge Stage 43 screenshot harness are green
- Stage 44 post-Stage-43 benchmark audit is complete:
  - the audit confirmed that Library/home is no longer the highest-leverage mismatch and that Graph browse framing is now the stronger benchmark gap
  - the audit also locked the user-facing terminology cleanup from `Library` to `Home` as part of the next bounded implementation slice
  - the next slice is now a graph-canvas-first pass plus Home terminology cleanup instead of a premature Study rewrite
- Stage 45 Recall Graph canvas first pass and Home terminology cleanup is complete:
  - the shared shell and landing now use `Home` terminology while keeping the internal `library` section key stable
  - browse-mode Graph now leads with a dominant graph canvas, lighter support rail, and a floating detail overlay with explicit `Focus source` and Reader handoffs
  - targeted frontend coverage, `frontend npm run lint`, `frontend npm run build`, and the repo-owned real Edge Stage 45 screenshot harness are green
- Stage 46 post-Stage-45 benchmark audit is complete:
  - fresh localhost captures plus the Recall benchmark sources confirmed that `Study` is now the clearest remaining top-level mismatch
  - `Home` still carries some populated-density weight, but it is no longer the highest-friction benchmark gap, and Graph is materially closer after Stage 45
  - the next slice is now a centered, calmer Study review/start surface pass rather than another immediate Home or Graph rewrite
- Stage 47 Recall Study centered review surface first pass is complete:
  - browse-mode `Study` now leads with a centered review/start surface, calmer step hierarchy, lighter supporting queue chrome, and focused evidence beside the main review card
  - focused Study still preserves the reader-led split and explicit Reader reopen actions
  - targeted Study/frontend coverage, `frontend npm run lint`, `frontend npm run build`, and the repo-owned real Edge Stage 47 screenshot harness are green
  - the next slice is now a benchmark audit to decide whether Home or Study is the higher-value remaining surface correction
- Stage 48 post-Stage-47 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 47 materially improved Study and that Study is no longer the top benchmark blocker
  - Home once again reads like the clearest remaining top-level mismatch on populated datasets, while Graph stays stable and focused Study preserves the reader-led split
  - the next slice is now a bounded Home selective-landing second pass rather than another immediate Study rewrite
- Stage 49 Recall Home selective landing second pass is complete:
  - Home now uses a lighter collection snapshot rail, a shorter landing, and explicit `Show all …` controls for larger recency groups instead of loading the full reopen backlog at once
  - the fresh Stage 49 captures show a materially calmer populated landing while Graph, Study, and focused Study remain stable
  - the next slice is now a benchmark audit to decide whether Home still leads the mismatch list or whether another surface has become the stronger target
- Stage 50 post-Stage-49 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Home is materially calmer and no longer the clearest roadmap blocker
  - Study is once again the strongest remaining benchmark mismatch, while Graph stays stable and focused Study preserves the reader-led split
  - the next slice is now a bounded Study sidebar and queue compression second pass instead of another immediate Home rewrite
- Stage 51 Recall Study sidebar and queue compression second pass is complete:
  - browse-mode Study now uses a lighter queue-control rail, a persistent active-card summary, and explicit full-queue reveal controls instead of leaning on a full-height backlog wall
  - the `Recall review` support panel is shorter, so the main review card becomes the first strong focal point on desktop
  - targeted Study coverage, `frontend npm run lint`, `frontend npm run build`, and the repo-owned real Edge Stage 51 screenshot harness are green
  - the next slice is now a benchmark audit rather than another immediate implementation pass
- Stage 52 post-Stage-51 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 51 materially improved Study without regressing the preserved surfaces
  - Study is still the clearest remaining mismatch because the queue rail still opens too heavy by default and the stage shell still competes with the main review card
  - the next slice is now one more bounded Study simplification pass instead of reopening Home or Graph
- Stage 53 Recall Study default queue collapse and stage shell minimization is complete:
  - browse-mode Study now lands with queue support collapsed by default, including manual entry through the top-level Study tab, so the review card owns the opening canvas
  - the standalone `Recall review` support shell is gone; the review journey now lives as lighter inline guidance attached to the main card
  - fresh Stage 53 captures show Home and Graph stable while focused Study preserves the reader-led split
  - targeted Study/frontend coverage, `frontend npm run lint`, `frontend npm run build`, and the repo-owned real Edge Stage 53 screenshot harness are green
  - the next slice is now a benchmark audit rather than another immediate Study rewrite
- Stage 54 post-Stage-53 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 53 materially improved Study without regressing the preserved surfaces
  - Study is still the clearest remaining mismatch because the collapsed queue summary still reads too tall and boxed, and the review-card header still carries too much support chrome
  - the next slice is now a bounded Study support-rail and review-header compression pass instead of reopening Home or Graph
- Stage 55 Recall Study support rail flattening and review header compression is complete:
  - browse-mode Study now uses a flatter collapsed support rail with lighter active-card summary treatment instead of a second stacked summary card
  - the browse-mode review header now uses shorter guidance and compressed metadata so the prompt and answer interaction start higher
  - fresh Stage 55 captures show Study materially calmer while Home, Graph, and focused Study stay stable
  - targeted Study/frontend coverage, `frontend npm run lint`, `frontend npm run build`, and the repo-owned real Edge Stage 55 screenshot harness are green
  - the next slice is now a benchmark audit rather than another immediate Study rewrite
- Stage 56 post-Stage-55 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 55 materially improved Study without regressing the preserved surfaces
  - Study is still the clearest remaining mismatch because the support rail still reads too boxed and the top-right Reader/journey utility cluster still over-frames the review card
  - the next slice is now a bounded Study support-rail unboxing and review-utility demotion pass instead of reopening Home or Graph
- Stage 57 Recall Study support rail unboxing and review utility demotion is complete:
  - browse-mode Study now uses a lighter, more utility-first collapsed rail and a calmer review header without the heavier top-right Reader utility cluster
  - the fresh Stage 57 captures keep Home and Graph stable while focused Study preserves the reader-led split
  - the next slice is now Stage 58 post-Stage-57 benchmark audit
- Stage 58 post-Stage-57 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 57 materially improved Study without regressing the preserved surfaces
  - Study is still the clearest remaining mismatch, but the remaining weight has shifted lower into the `Source evidence` block and the large rating footer rather than the queue rail or top header
  - the next slice is now a bounded Study evidence-stack-compression and rating-row-tightening pass
- Stage 59 Recall Study evidence stack compression and rating row tightening is complete:
  - browse-mode Study now uses a lighter lower support stack with a smaller evidence reopen treatment and a quiet pre-reveal rating placeholder
  - the fresh Stage 59 captures keep Home and Graph stable while focused Study preserves the reader-led split
  - the next slice is now Stage 60 post-Stage-59 benchmark audit
- Stage 60 post-Stage-59 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 59 materially improved Study without regressing the preserved surfaces
  - Study is still the clearest remaining mismatch because the queue rail still reads too boxed and the pre-reveal `Source evidence` section still occupies more space than the benchmark direction wants
  - the next slice is now a bounded Study pre-reveal-evidence minimization and queue-rail-softening pass
- Stage 61 Recall Study pre-reveal evidence minimization and queue rail softening is complete:
  - browse-mode Study now uses a compact `Grounding ready` pre-reveal summary and a visibly softer queue rail without disturbing the calmer review flow
  - the fresh Stage 61 captures keep Home and Graph stable while focused Study preserves the reader-led split
  - the next slice is now Stage 62 post-Stage-61 benchmark audit
- Stage 62 post-Stage-61 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 61 preserved the intended direction without introducing regressions
  - Study is still the clearest remaining mismatch, but the main remaining gap is no longer the boxed queue rail or oversized pre-reveal evidence block
  - the remaining Study delta is that browse mode still reads as a dashboard page with a persistent queue-summary sidebar and extra review-card support chrome, rather than as a more singular quiz/review session
  - Home remains a medium-mismatch polish surface, while Graph and focused Study stay stable enough to defer
  - the next slice is now a bounded Study session-singularization and queue-summary-demotion pass
- App test runner stability detour is complete:
  - the broad `frontend/src/App.test.tsx` suite now completes as a whole-file WSL Vitest pass instead of stalling
  - the fix stabilized App-level callback identity for shell handoff props and refreshed stale shell assertions to match the current browse-first and source-focused flows
  - targeted Vitest plus the repo-owned real Edge harness remain the preferred UI-validation ladder, but the broad App integration file is trustworthy again when shell or route continuity changes
- Stage 63 Recall Study session singularization and queue summary demotion is complete:
  - browse-mode Study now uses a lighter, narrower session dock instead of a taller queue-summary sidebar, and the review card now opens with one compact session summary instead of stacked pre-answer support chrome
  - the fresh Stage 63 captures keep Home, Graph, and focused Study stable while making browse-mode Study materially less dashboard-like
  - the next slice is now Stage 64 post-Stage-63 benchmark audit so the next follow-up is chosen from fresh evidence instead of from momentum
- Stage 64 post-Stage-63 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 63 materially improved Study without regressing the preserved surfaces
  - Study is now materially closer to the benchmark and no longer the clearest blocker; the remaining Study delta is smaller utility chrome rather than a still-dashboard-like core layout
  - Home is once again the clearest remaining mismatch because the left support rail still reads too tall and boxed, and the `This week` reopen list still feels more archive-like than the benchmark direction wants
  - the next slice is now a bounded Home utility-rail-softening and recent-list-compression pass
- Stage 65 Recall Home utility rail softening and recent list compression is complete:
  - Home now uses one quieter utility dock with shorter rail copy, softer snapshot metrics, and a flatter grouped recent-source list so the landing reads less like an archive view
  - the fresh Stage 65 captures keep Graph, Study, and focused Study stable while materially calming the Home landing
  - the next slice is now Stage 66 post-Stage-65 benchmark audit
- Stage 66 post-Stage-65 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 65 materially improved Home without regressing the preserved surfaces
  - Home is no longer the clearest blocker; Study now leads the remaining mismatch list again because the browse-mode session dock and pre-answer review header still frame the page too heavily
  - the next slice is now a bounded Study session-dock-narrowing and review-header-demotion pass
- Stage 67 Recall Study session dock narrowing and review header demotion is complete:
  - browse-mode Study now uses a narrower session dock, less prominent refresh utility, shorter pre-answer summary copy, and quieter flow chrome so the prompt owns the page sooner
  - the fresh Stage 67 captures keep Home, Graph, and focused Study stable while materially calming the Study browse surface
  - the next slice is now Stage 68 post-Stage-67 benchmark audit
- Stage 68 post-Stage-67 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 67 materially improved Study without regressing the preserved surfaces
  - Study is still the clearest remaining mismatch, but the remaining gap is now narrower and sits mainly in the collapsed dock summary and the still-broad pre-reveal `Grounding ready` strip
  - the next slice is now a bounded Study dock-summary reduction and grounding-ready compression pass
- Stage 69 Recall Study session dock summary reduction and grounding ready compression is complete:
  - browse-mode Study now drops the extra total/review chrome from the collapsed dock summary and uses a slimmer, more utility-like pre-reveal grounding strip
  - the fresh Stage 69 captures keep Home, Graph, and focused Study stable while materially calming the last obvious Study support-chrome hotspots
  - the next slice is now Stage 70 post-Stage-69 benchmark audit
- Stage 70 post-Stage-69 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 69 materially improved Study and that Study is no longer the clearest blocker
  - Home is now the clearest remaining mismatch again because the populated landing still reads too much like a large archive wall with more empty canvas/header space than the benchmark direction wants
  - Graph and focused Study stayed stable, and the next slice is now a bounded Home landing-tightening pass
- Stage 71 Recall Home landing canvas tightening and card-wall flattening is complete:
  - Home now uses a tighter header/canvas transition, flatter featured reopen cards, and an inline featured-section reveal so the landing starts sooner and reads less like an archive wall
  - the fresh Stage 71 captures keep Graph, Study, and focused Study stable while materially calming Home
  - the next slice is now Stage 72 post-Stage-71 benchmark audit
- Stage 72 post-Stage-71 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 71 materially improved Home and that Home is no longer the clearest blocker
  - Study now leads the remaining mismatch list again because the browse-mode session rail still reads too much like a persistent dashboard rail and the pre-answer review header still over-frames the task
  - the next slice is now a bounded Study session-rail-compaction and review-header-flattening pass
- Stage 73 Recall Study session rail compaction and review header flattening is complete:
  - browse-mode Study now uses a shorter utility-like session rail, a flatter `Review` context row, and a quieter in-flow `Grounded` support row so the prompt owns the page sooner
  - the fresh Stage 73 captures keep Home, Graph, and focused Study stable while materially calming Study
  - the next slice is now Stage 74 post-Stage-73 benchmark audit
- Stage 74 post-Stage-73 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 73 materially improved Study and that Study is no longer the clearest blocker
  - Home now leads the remaining mismatch list again because the utility rail still reads too much like a full-height sidebar and the featured reopen row still reads too evenly weighted
  - the next slice is now a bounded Home utility-rail-demotion and featured-reopen-prioritization pass
- Stage 75 Recall Home utility rail demotion and featured reopen prioritization is complete:
  - Home now uses a lighter utility rail plus one deliberate featured-reopen spotlight with quieter nearby rows instead of a broad equal-weight reopen wall
  - the fresh Stage 75 captures keep Graph, Study, and focused Study stable while materially calming the Home landing
  - the next slice is now Stage 76 post-Stage-75 benchmark audit
- Stage 76 post-Stage-75 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 75 materially improved Home and that the utility rail is no longer the main blocker
  - Home still leads the remaining mismatch list because the `Start here` spotlight remains too tall and the `Keep nearby` stack still reads too column-like and boxed
  - the next slice is now a bounded Home spotlight-footprint and secondary-reopen-compression pass
- Stage 77 Recall Home spotlight footprint reduction and secondary reopen compression is complete:
  - Home now uses a shorter `Start here` spotlight and a denser `Keep nearby` support stack so the landing feels more like a selective reopen surface than like a staged showcase
  - the fresh Stage 77 captures keep Graph, Study, and focused Study stable while materially calming the Home landing
  - the next slice is now Stage 78 post-Stage-77 benchmark audit
- Stage 78 post-Stage-77 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 77 materially improved Home and that Home is no longer the clearest blocker
  - Study now leads the remaining mismatch list again because the browse-mode `Session` dock still reads too much like a dashboard sidebar and the pre-answer review meta still over-frames the task
  - the next slice is now a bounded Study session-dock-utility-flattening and review-meta-demotion pass
- Stage 79 Recall Study session dock utility flattening and review meta demotion is complete:
  - Study now uses a lighter collapsed `Session` dock plus a quieter pre-answer review strip so the prompt owns the page sooner
  - the fresh Stage 79 captures keep Home, Graph, and focused Study stable while materially calming the Study browse surface
  - the next slice is now Stage 80 post-Stage-79 benchmark audit
- Stage 80 post-Stage-79 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 79 materially improved Study and that Study is no longer the clearest blocker
  - Home now leads the remaining mismatch list again because the featured band still feels too staged and the landing still carries too much empty canvas before it feels brisk and selective
  - the next slice is now a bounded Home featured-band-compaction and empty-canvas-reduction pass
- Stage 81 Recall Home featured band compaction and empty-canvas reduction is complete:
  - Home now uses a flatter featured reopen band, fewer default nearby reopen rows, and a tighter landing rhythm so the top canvas feels brisker and less staged
  - the fresh Stage 81 captures keep Study, Graph, and focused Study stable while materially calming the Home landing
  - the next slice is now Stage 82 post-Stage-81 benchmark audit
- Stage 82 post-Stage-81 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 81 materially improved Home and that Home is no longer the clearest blocker
  - Study now leads the remaining mismatch list again because the browse-mode `Session` rail still reads too much like a sidebar and the pre-answer `Grounded` row still frames the review task too heavily
  - the next slice is now a bounded Study session-rail-utility-compression and grounding-row-demotion pass
- Stage 83 Recall Study session rail utility compression and grounding row demotion is complete:
  - Study now uses a narrower, quieter collapsed `Session` rail and a lighter pre-answer grounding row so the review task reads more singularly
  - the fresh Stage 83 captures keep Home, Graph, and focused Study stable while materially calming the Study browse surface
  - the next slice is now Stage 84 post-Stage-83 benchmark audit
- Stage 84 post-Stage-83 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 83 materially improved Study and that Study is no longer the clearest blocker
  - Home now leads the remaining mismatch list again because the landing still ends too early on desktop and still feels too much like one isolated featured band
  - the next slice is now a bounded Home follow-on-reopen-flow and lower-canvas-fill pass
- Stage 85 through Stage 101 continued the benchmark-led Home and Study convergence loop:
  - alternating bounded passes materially calmed both surfaces while keeping Graph and focused Study stable in fresh Edge captures
  - the largest remaining Home gains came from removing the old side dock and the saved-sources preamble above the first featured reopen flow
- Stage 102 post-Stage-101 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 101 materially improved Home, but that Home still remains the clearest blocker
  - the remaining weight is the split upper landing setup, where the left-side Home meta and the right-side search/add utilities still create too much staged empty canvas before `Start here`
  - the next slice is now a bounded Home landing-header-collapse and inline-search-demotion pass
- Stage 103 Recall Home landing header collapse and inline search demotion is complete:
  - Home now uses a compact heading-and-snapshot row instead of a mini hero plus a separate utility block
  - the inline search/add treatment now reads like quiet support utility, and `Start here` begins sooner on desktop
  - the fresh Stage 103 captures keep Study, Graph, and focused Study stable while materially tightening the Home landing
  - the next slice is now Stage 104 post-Stage-103 benchmark audit
- Stage 104 post-Stage-103 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 103 materially improved Home enough that Home is no longer the clearest blocker
  - Study now leads the remaining mismatch list again because the browse-mode `Session` rail still reads too sidebar-like and the review flow still sits inside too much empty dashboard canvas
  - the next slice is now a bounded Study session-rail-demotion and review-canvas-recentering pass
- Stage 105 Recall Study session rail demotion and review canvas recentering is complete:
  - browse-mode Study now uses a lightweight top support strip instead of a standing left sidebar when the queue is collapsed
  - the review card now owns more of the page because the condensed browse layout no longer reserves a persistent left column
  - the fresh Stage 105 captures keep Home, Graph, and focused Study stable while materially calming the remaining Study browse chrome
  - the next slice is now Stage 106 post-Stage-105 benchmark audit
- Stage 106 post-Stage-105 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 105 materially improved Study enough that Study is no longer the clearest blocker
  - Home now leads the remaining mismatch list again because the landing still reads too much like one staged featured band handing off into a quieter archive-style lower stack
  - the next slice is now a bounded Home featured-flow-unification and lower-canvas-compaction pass
- Stage 107 Recall Home featured flow unification and lower canvas compaction is complete:
  - the lower `Keep going` continuation now reads like a lighter extension of the featured reopen flow instead of a separate archive-style list block
  - the no-resume Home landing now feels more continuous from `Start here` through the next reopen choices
  - the fresh Stage 107 captures keep Study, Graph, and focused Study stable while materially calming the remaining Home lower-canvas separation
- Stage 108 post-Stage-107 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 107 materially improved Home, but that Home still remains the clearest blocker
  - the lower continuation flow is no longer the main issue; the remaining weight now sits in the oversized `Start here` spotlight and the upper-right utility/search row
  - the next slice is now a bounded Home spotlight-footprint-reduction and utility-header-softening pass
- Stage 109 Recall Home spotlight footprint reduction and utility header softening is complete:
  - Home now uses a tighter featured spotlight, a quieter inline utility/search row, and a calmer spotlight-plus-support opening stage so the landing starts more selectively
  - the fresh Stage 109 captures keep Study, Graph, and focused Study stable while materially calming the Home opening
  - the next slice is now Stage 110 post-Stage-109 benchmark audit
- Stage 110 post-Stage-109 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 109 materially improved Home, but that Home still remains the clearest blocker
  - the remaining Home weight is now the split opening-stage composition, where the featured spotlight still feels too separated from nearby/support reopen utility
  - the next slice is now a bounded Home opening-stage-unification and nearby-flow-lift pass
- Stage 111 Recall Home opening stage unification and nearby flow lift is complete:
  - Home now reads as one calmer opening stage with the featured spotlight followed immediately by nearby reopen support instead of splitting those choices into separate left/right zones
  - the collection snapshot now stays beside the Home heading instead of competing as a separate setup block
  - the fresh Stage 111 captures keep Study, Graph, and focused Study stable while materially calming the Home opening
- Stage 112 post-Stage-111 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 111 improved Home enough that Home is no longer the clearest blocker
  - Study now leads the remaining mismatch list because the browse-mode review still sits inside too much empty dashboard canvas with a support strip that over-frames the task
  - the next slice is now a bounded Study support-strip-demotion and review-card-lift pass
- Stage 113 Recall Study support strip demotion and review card lift is complete:
  - browse-mode Study now uses a lighter in-flow support strip instead of a standing framing header and lifts the review card higher into the canvas
  - the fresh Stage 113 captures keep Home, Graph, and focused Study stable while materially calming the Study browse surface
- Stage 114 post-Stage-113 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 113 improved Study enough that Study is no longer the clearest blocker
  - Home now leads the remaining mismatch list because the lower continuation rows still feel too boxed and disconnected from the calmer opening flow
  - the next slice is now a bounded Home continuation-handoff-tightening and lower-reopen-row-compaction pass
- Stage 115 Recall Home continuation handoff tightening and lower reopen row compaction is complete:
  - Home now uses a lighter `Keep going` handoff and flatter lower reopen rows so the landing reads more like one continuous reopen sequence
  - the fresh Stage 115 captures keep Study, Graph, and focused Study stable while materially calming the lower Home canvas
- Stage 116 post-Stage-115 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 115 materially improved Home, but that Home still remains the clearest blocker
  - the remaining Home weight is now the isolated reveal control and the extra empty lower canvas at the end of the landing
  - the next slice is now a bounded Home lower-canvas-fill and reveal-control-integration pass
- Stage 117 Recall Home lower canvas fill and reveal control integration is complete:
  - Home now integrates the reveal control directly into the continuation flow instead of ending with an isolated footer action
  - the lower landing reads more intentionally finished and less abruptly cut off in the fresh Stage 117 captures
  - Study, Graph, and focused Study stayed stable after the pass
- Stage 118 post-Stage-117 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 117 improved Home enough that Home is no longer the clearest blocker
  - Study now leads the remaining mismatch list because the browse-mode support strip and review canvas still frame the task too much
  - the next slice is now a bounded Study support-strip-minimization and review-canvas-tightening pass
- Stage 119 Recall Study support strip minimization and review canvas tightening is complete:
  - browse-mode Study now keeps the collapsed `Session` support inside the review card as lightweight utility instead of a separate framing band
  - the review card lands higher and the browse-mode Study canvas feels more task-first in the fresh Stage 119 captures
  - Home, Graph, and focused Study stayed stable after the pass
- Stage 120 post-Stage-119 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 119 improved Study enough that Study is no longer the clearest blocker
  - Home now leads the remaining mismatch list because the opening spotlight and nearby handoff still read slightly too staged
  - the next slice is now a bounded Home opening-spotlight compaction and nearby-flow-flattening pass
- Stage 121 Recall Home opening spotlight compaction and nearby flow flattening is complete:
  - Home now uses a lighter `Start here` spotlight and flatter inline nearby reopen rows so the opening reads more like one selective flow
  - the top of the landing feels less staged in the fresh Stage 121 captures
  - Study, Graph, and focused Study stayed stable after the pass
- Stage 122 Post-Stage-121 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 121 improved Home enough that Home is no longer the clearest blocker
  - Study now leads the remaining mismatch list because the browse-mode support strip and extra review-canvas space still frame the task too much
  - the next slice is now a bounded Study support-strip collapse and review-card expansion pass
- Stage 123 Recall Study support strip collapse and review card expansion is complete:
  - browse-mode Study now uses toolbar-level utility instead of a separate support strip, so the task lands sooner and with less leftover dashboard framing
  - the review card occupies more of the page in the fresh Stage 123 captures
  - Home, Graph, and focused Study stayed stable after the pass
- Stage 124 Post-Stage-123 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 123 improved Study enough that Study no longer leads the mismatch list
  - Home now leads again because the lower continuation band and final reveal control still read too much like an abrupt footer ending
  - the next slice is now a bounded Home continuation-band elevation and reveal-card demotion pass
- Stage 125 Recall Home continuation band elevation and reveal card demotion is complete:
  - the lower Home continuation band now reads more like part of the same reopen flow instead of a separate footer strip
  - the final reveal control now sits as quieter supporting utility beneath the continuation rows instead of as a terminal card
  - Study, Graph, and focused Study stayed stable after the pass
- Stage 126 Post-Stage-125 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Stage 125 improved Home enough that Home no longer leads the mismatch list
  - Study now leads again because the browse-mode review card still sits beneath a mostly empty top support strip and too much unused top canvas
  - the next slice is now a bounded Study support-strip removal and review-canvas lift pass
- Stage 127 Recall Study support strip removal and review canvas lift is complete:
  - browse-mode Study no longer renders the ghost top support strip above the review card
  - the review task now starts higher and feels more immediate in the fresh Study capture
  - Home, Graph, and focused Study stayed stable after the pass
- Stage 128 Post-Stage-127 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Study no longer leads after the ghost-strip removal
  - Home now leads again because the landing still reads as one boxed archive panel with repeated row labels and timestamp/meta weight
  - the next slice is now a bounded Home collection-frame-flattening and row-meta-demotion pass
- Stage 129 Recall Home collection frame flattening and row meta demotion is complete:
  - the Home landing shell now uses a flatter collection frame instead of reading like one heavy archive panel
  - Home reopen rows now demote repeated row labels, shorten timestamp treatment, and let titles and previews lead
  - Study, Graph, and focused Study stayed stable after the pass
- Stage 130 Post-Stage-129 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Home still leads after the flattening pass
  - the remaining mismatch is now more specific: the landing still reads like one broad boxed ledger with a strong right-side date gutter
  - the next slice is now a bounded Home collection-unboxing and date-gutter-collapse pass
- Stage 131 Recall Home collection unboxing and date gutter collapse is complete:
  - the Home landing now reads as an unboxed collection zone instead of one broad ledger shell
  - Home spotlight, reopen, and follow-on rows now place dates inside inline meta instead of a right-side gutter
  - Study, Graph, and focused Study stayed stable after the pass
- Stage 132 Post-Stage-131 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Home no longer leads after the Stage 131 pass
  - Graph now leads because the support rail and selected-node overlay still over-frame the page relative to the graph canvas
  - the next slice is now a bounded Graph support-rail-collapse and detail-overlay-compaction pass
- Stage 133 Recall Graph support rail collapse and detail overlay compaction is complete:
  - Graph now uses a slimmer utility rail and denser quick-pick stack instead of a tall boxed support column
  - the selected-node overlay now uses a more compact chip-led summary and lighter framing so the canvas stays dominant
  - Home, Study, and focused Study stayed stable after the pass
- Stage 134 Post-Stage-133 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Graph is materially closer after Stage 133 but still leads
  - the remaining Graph mismatch is now narrower: the quick-pick rail still reads too much like a second card column, and the overlay still occupies too much of the stage
  - the next slice is now a bounded Graph quick-pick-rail-slimming and overlay-footprint-reduction pass
- Stage 135 Recall Graph quick-pick rail slimming and overlay footprint reduction is complete:
  - Graph quick picks now read as a slimmer selector rail with denser node meta instead of excerpt-heavy preview cards
  - the selected-node overlay now defaults to a smaller summary with one grounded mention visible and relations only when present
  - Home, Study, and focused Study stayed stable after the pass
- Stage 136 Post-Stage-135 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Graph is materially closer after Stage 135 but still leads
  - the remaining Graph mismatch is now narrower: the left rail still opens with stacked metrics, a focused-source block, and a longer-than-needed quick-pick list, while the overlay is no longer the main blocker
  - the next slice is now a bounded Graph utility-metrics-collapse and quick-pick-truncation pass
- Stage 137 Recall Graph utility metrics collapse and quick-pick truncation is complete:
  - Graph now collapses the left rail metrics and focused-source framing into one compact glance summary
  - the default quick-pick stack is shorter and calmer, so the rail reads more like a thin selector strip beside the canvas
  - Home, Study, and focused Study stayed stable after the pass
- Stage 138 Post-Stage-137 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Graph still leads after Stage 137, but more narrowly than before
  - the remaining Graph mismatch is now concentrated in the left selector strip, where the search field, glance summary, and quick-pick stack still read like a dedicated support column beside the canvas
  - the next slice is now a bounded Graph selector-strip-flattening and glance-stack-compaction pass
- Stage 139 Recall Graph selector strip flattening and glance-stack compaction is complete:
  - Graph now uses a flatter selector strip with an inline glance summary and a compact quick-picks kicker row instead of a stacked search/glance/header block
  - the quick-pick list is slimmer and the rail is slightly narrower, so the graph canvas keeps more of the page
  - Home, Study, and focused Study stayed stable after the pass
- Stage 140 Post-Stage-139 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Graph still leads after Stage 139
  - the remaining Graph mismatch now sits mostly in duplicated intro framing above the canvas and a still-tall selected-node overlay on the right
  - the next slice is now a bounded Graph intro-shell-demotion and detail-overlay-compaction pass
- Stage 141 Recall Graph intro shell demotion and detail overlay compaction is complete:
  - Graph now reaches the canvas more directly with the duplicated intro framing collapsed into a lighter inline surface note
  - the selected-node overlay is materially smaller and calmer, so grounded evidence reads as support instead of a second major panel
  - Home, Study, and focused Study stayed stable after the pass
- Stage 142 Post-Stage-141 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Graph still leads after Stage 141, but more narrowly than before
  - the remaining Graph mismatch is now concentrated in the combined support framing around the canvas: the left quick-pick strip still reads too card-like, and the selected-node detail still defaults to a fully open right-side panel
  - the next slice is now a bounded Graph support-framing-collapse and detail-peek-default pass
- Stage 143 Recall Graph support framing collapse and detail peek default is complete:
  - Graph quick picks now read as a flatter utility list instead of a stack of bordered mini-cards
  - the selected-node detail now opens in a smaller peek state, with the full mention and relation stack revealed only when the user asks for it
  - Home, Study, and focused Study stayed stable after the pass
- Stage 144 Post-Stage-143 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Graph is materially closer after Stage 143 and no longer leads the mismatch list
  - Home now leads because the landing still reads as one oversized lead band followed by a sparse lower continuation and too much empty lower canvas
  - the next slice is now a bounded Home lead-card-deflation and lower-canvas-continuation-fill pass
- Stage 145 Recall Home lead card deflation and lower canvas continuation fill is complete:
  - Home now opens with a split lead-plus-nearby frame instead of one oversized full-width feature band
  - the grouped reveal action now sits inside the lower continuation grid, so the landing carries downward more deliberately instead of ending with a detached footer action
  - Graph, Study, and focused Study stayed stable after the pass
- Stage 146 Post-Stage-145 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures confirmed that Home is materially closer after Stage 145 and no longer leads the mismatch list
  - Graph now leads because the left selector strip and right selected-node dock still bracket the canvas like standing support framing
  - the next slice is now a bounded Graph selector-rail-narrowing and detail-dock-slimming pass
- Stage 147 Recall Graph selector rail narrowing and detail dock slimming is complete:
  - Graph now uses a narrower selector rail with a shorter default quick-pick stack and less stacked support copy
  - the selected-node detail opens in a slimmer dock so the canvas keeps more of the page while grounded actions stay available
  - Home, Study, and focused Study stayed stable after the pass
- Stage 148 post-Stage-147 benchmark audit is complete:
  - the audit confirmed that Graph is materially calmer after the selector-rail/detail-dock pass and no longer leads the mismatch list
  - Home now leads because the landing still reads as a staged split opening cluster and leaves too much empty lower canvas
  - the next slice is now a bounded Home opening-cluster compaction and lower-canvas-fill pass
- Stage 149 Recall Home opening cluster compaction and lower canvas fill is complete:
  - Home now uses one nearby support row instead of a broader split opening stack on the no-resume landing
  - the lower continuation now carries farther down the page before the reveal control, so the opening reads less staged and the lower canvas fills more deliberately
  - Graph, Study, and focused Study stayed stable after the pass
- Stage 150 post-Stage-149 benchmark audit is complete:
  - the audit confirmed that Home is materially calmer after Stage 149, but still leads more narrowly because the lower continuation still ends too quickly and the reveal card still reads like a separate boxed endpoint
  - Graph, Study, and focused Study stayed lower-priority in the fresh artifacts
  - the next slice is now a bounded Home continuation-grid-fill and reveal-card-demotion pass
- Stage 151 Recall Home continuation grid fill and reveal card demotion is complete:
  - Home now shows more continuation rows before expansion and no longer ends the grid with a boxed reveal card
  - the reveal now sits in a lighter footer affordance, so the lower canvas reads more like in-flow continuation than a separate endpoint
  - Graph, Study, and focused Study stayed stable after the pass
- Stage 152 post-Stage-151 benchmark audit is complete:
  - the audit confirmed that Home is materially calmer after Stage 151, but still leads more narrowly because the boxed `Start here` spotlight and the separate `Keep going` restart still stage the landing
  - Graph, Study, and focused Study stayed lower-priority in the fresh artifacts
  - the next slice is now a bounded Home spotlight-deflation and follow-on-header-demotion pass
- Stage 153 Recall Home spotlight deflation and follow-on header demotion is complete:
  - Home now uses a flatter overline-led spotlight instead of a chip-led boxed lead card
  - the `Keep going` restart is now a quieter in-flow continuation line, so the lower rows read more like the same collection surface
  - Graph, Study, and focused Study stayed stable after the pass
- Stage 154 post-Stage-153 benchmark audit is complete:
  - the audit confirmed that Home is materially calmer after Stage 153, but still leads more narrowly because the opening still reads as a split lead-plus-support stage
  - Graph, Study, and focused Study stayed lower-priority in the fresh artifacts
  - the next slice is now a bounded Home opening-column-collapse and support-row-inline-merge pass
- Stage 155 Recall Home opening column collapse and support row inline merge is complete:
  - Home now uses one calmer stacked opening flow instead of a split lead-plus-support stage
  - the nearby support row now reads more like the next reopen step inside the same opening sequence
  - Graph, Study, and focused Study stayed stable after the pass
- Stage 156 post-Stage-155 benchmark audit is complete:
  - the audit confirmed that Home is materially calmer after Stage 155, but still leads more narrowly because the opening still reads like a spotlight row and the continuation still ends with a separate reveal endpoint
  - the rerun matched the validated Stage 155 captures without drift, and Graph, Study, and focused Study stayed lower-priority
  - the next slice is now a bounded Home lead-row-flattening and footer-reveal-inline-merge pass
- Stage 157 Recall Home lead row flattening and footer reveal inline merge is complete:
  - Home now opens with a flatter lead row instead of a boxed spotlight-style first item
  - the grouped `Show all ...` action now lives as the last continuation row instead of a separate footer endpoint
  - Graph, Study, and focused Study stayed stable after the pass
- Stage 158 post-Stage-157 benchmark audit is complete:
  - the audit confirmed that Home is materially calmer after Stage 157, but still leads more narrowly because the top of the landing still reads like a deliberate opening pair and the lower continuation still stays too sparse
  - the rerun matched the validated Stage 157 captures without drift, and Graph, Study, and focused Study stayed lower-priority
  - the next slice is now a bounded Home opening-pair-equalization and continuation-density-lift pass
- Stage 159 Recall Home opening pair equalization and continuation density lift is complete:
  - Home now opens with one lead `Start here` row instead of a deliberate opening pair
  - one former nearby support item now carries into the visible continuation flow before the inline reveal row
  - Graph, Study, and focused Study stayed stable after the pass
- Stage 160 post-Stage-159 benchmark audit is complete:
  - the audit confirmed that Home is materially calmer after Stage 159, but still leads more narrowly because the top still reads like a singled-out lead row and the visible continuation still ends too soon
  - the rerun matched the validated Stage 159 captures without drift, and Graph, Study, and focused Study stayed lower-priority
  - the next slice is now a bounded Home lead-row-demotion and visible-continuation-extension pass
- Stage 161 Recall Home lead row demotion and visible continuation extension is complete:
  - Home now starts the merged landing inside the same continuation grid instead of staging the first item in a separate spotlight block
  - the shared reopen flow carries farther down the page before the inline reveal row
  - Graph, Study, and focused Study stayed stable after the pass
- Stage 162 post-Stage-161 benchmark audit is complete:
  - the audit confirmed that Home is materially calmer after Stage 161, but still leads more narrowly because the `Start here` kicker and the `Show all ...` reveal row still bracket the grid too strongly
  - the rerun matched the validated Stage 161 captures without drift, and Graph, Study, and focused Study stayed lower-priority
  - the next slice is now a bounded Home start-here-kicker-demotion and reveal-row-deflation pass
- Stage 163 Recall Home start here kicker demotion and reveal row deflation is complete:
  - Home now demotes the remaining `Start here` emphasis into quieter inline meta across the lead row variants
  - the reveal control now spans the continuation footer as a flatter full-width row instead of a separate endpoint tile
  - Graph, Study, and focused Study stayed stable after the pass
- Stage 164 post-Stage-163 benchmark audit is complete:
  - the audit confirmed that Home is materially calmer after Stage 163, but still leads more narrowly because the first cell still carries an extra lead cue and the footer reveal still splits attention across the lower edge
  - the rerun matched the validated Stage 163 captures without drift, and Graph, Study, and focused Study stayed lower-priority
  - the next slice is now a bounded Home lead-row-meta-equalization and reveal-footer-utility-merge pass
- Stage 165 Recall Home lead row meta equalization and reveal footer utility merge is complete:
  - Home no longer shows an extra visible first-row cue, so the opening reads more like one even reopen flow
  - the reveal footer utility now reads as one calmer continuation line instead of splitting attention across the lower edge
  - Graph, Study, and focused Study stayed byte-stable after the pass
- Stage 166 post-Stage-165 benchmark audit is complete:
  - the audit confirmed that Home is materially calmer after Stage 165, but still leads more narrowly because the landing still ends too soon after the first visible rows and leaves too much empty lower canvas
  - the rerun matched the validated Stage 165 captures without drift, and Graph, Study, and focused Study stayed lower-priority
  - the next slice is now a bounded Home visible-continuation-extension and lower-canvas-fill pass
- Stage 167 Recall Home visible continuation extension and lower canvas fill is complete:
  - Home now carries farther before the reveal row and fills more of the lower canvas without reviving the old archive wall
  - the merged landing keeps the calmer Stage 165 opening treatment while showing more visible continuation rows
  - Graph, Study, and focused Study stayed byte-stable after the pass
- Stage 168 post-Stage-167 benchmark audit is complete:
  - the audit confirmed that Home is materially calmer after Stage 167, but still leads more narrowly because the reveal row still arrives too early and the landing still leaves too much empty lower canvas after the visible continuation
  - the rerun matched the validated Stage 167 captures without drift, and Graph, Study, and focused Study stayed lower-priority
  - the next slice is now a bounded Home continuation-density-lift and reveal-row-pushdown pass
- Stage 169 Recall Home continuation density lift and reveal row pushdown is complete:
  - Home now shows slightly more visible continuation before the reveal row so the landing carries farther before the endpoint
  - the reveal row lands lower without reviving the old archive-wall feel
  - Graph, Study, and focused Study stayed byte-stable after the pass
- Stage 170 post-Stage-169 benchmark audit is complete:
  - the audit confirmed that Home is materially calmer after Stage 169, but still leads more narrowly because the visible continuation still ends too soon and the reveal row still lands above too much empty lower canvas
  - the rerun matched the validated Stage 169 captures without drift, and Graph, Study, and focused Study stayed lower-priority
  - the next slice is now a bounded Home continuation-carry-extension and reveal-row-delay pass
- Stage 171 Recall Home continuation carry extension and reveal row delay is complete:
  - Home now carries one more visible reopen item before the reveal row so the landing ends later
  - the reveal row lands lower without reviving the old archive-wall feel
  - Graph, Study, and focused Study stayed byte-stable after the pass
- Stage 172 post-Stage-171 benchmark audit is complete:
  - the audit confirmed that Home is materially calmer after Stage 171, but still leads more narrowly because the visible continuation still ends too soon and the reveal row still lands above too much empty lower canvas
  - the rerun matched the validated Stage 171 captures without drift, and Graph, Study, and focused Study stayed lower-priority
  - the next slice is now a bounded Home continuation-tail-extension and reveal-footer-pushdown pass
- Stage 173 Recall Home continuation tail extension and reveal footer pushdown is complete:
  - Home now carries one more visible reopen item through the continuation tail before the reveal footer row
  - the reveal footer lands lower without reviving the old archive-wall feel
  - Graph, Study, and focused Study stayed byte-stable after the pass
- Stage 174 post-Stage-173 benchmark audit is complete:
  - the audit confirmed that Home is materially calmer after Stage 173, but still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas
  - the rerun matched the validated Stage 173 captures without drift, and Graph, Study, and focused Study stayed lower-priority
  - the next slice is now a bounded Home continuation-tail-density-lift and reveal-footer-delay pass
- Stage 175 Recall Home continuation tail density lift and reveal footer delay is complete:
  - Home now shows slightly more visible continuation through the landing tail before the reveal footer row
  - the reveal footer lands lower without reviving the old archive-wall feel
  - Graph, Study, and focused Study stayed byte-stable after the pass
- Stage 176 post-Stage-175 benchmark audit is complete:
  - the audit confirmed that Home is materially calmer after Stage 175, but still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas
  - the rerun matched the validated Stage 175 captures without drift, and Graph, Study, and focused Study stayed lower-priority
  - the next slice is now a bounded Home tail-carry-extension and reveal-footer-lowering pass
- Stage 177 Recall Home tail carry extension and reveal footer lowering is complete:
  - Home now carries one more visible continuation item through the landing tail before the reveal footer row
  - the reveal footer lands lower without reviving the old archive-wall feel
  - Graph, Study, and focused Study stayed byte-stable after the pass
- Stage 178 post-Stage-177 benchmark audit is complete:
  - the audit confirmed that Home is materially calmer after Stage 177, but still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas
  - the rerun matched the validated Stage 177 captures without drift, and Graph, Study, and focused Study stayed lower-priority
  - the next slice is now a bounded Home tail-density-lift and reveal-footer-pushdown pass
- Stage 179 Recall Home tail density lift and reveal footer pushdown is complete:
  - Home now shows slightly more visible continuation through the landing tail before the reveal footer row
  - the reveal footer lands lower without reviving the old archive-wall feel
  - Graph, Study, and focused Study stayed byte-stable after the pass
- Stage 180 post-Stage-179 benchmark audit is complete:
  - the audit confirmed that Home is materially calmer after Stage 179, but still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas
  - the rerun matched the validated Stage 179 captures without drift, and Graph, Study, and focused Study stayed lower-priority
  - the next slice is now a bounded Home tail-carry-extension and reveal-footer-delay pass
- Stage 181 Recall Home tail carry extension and reveal footer delay is complete:
  - Home now carries one more visible continuation item through the landing tail before the reveal footer row
  - the reveal footer lands lower without reviving the old archive-wall feel
  - Graph, Study, and focused Study stayed byte-stable after the pass
- Stage 182 post-Stage-181 benchmark audit is complete:
  - the audit confirmed that Home is materially calmer after Stage 181, but still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas
  - the rerun matched the validated Stage 181 captures without drift, and Graph, Study, and focused Study stayed lower-priority
  - the next slice is now a bounded Home continuation-tail-extension and reveal-footer-lowering pass
- Stage 183 Recall Home continuation tail extension and reveal footer lowering is complete:
  - Home now carries one more visible continuation item through the landing tail before the reveal footer row
  - the reveal footer lands lower without reviving the old archive-wall feel
  - Graph, Study, and focused Study stayed byte-stable after the pass
- Stage 184 post-Stage-183 benchmark audit is complete:
  - the audit confirmed that Home is materially calmer after Stage 183, but still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas
  - the rerun matched the validated Stage 183 captures without drift, and Graph, Study, and focused Study stayed lower-priority
  - the next slice is now a bounded Home tail-carry-extension and reveal-footer-lowering pass
- Stage 185 Recall Home tail carry extension and reveal footer lowering is complete:
  - Home now carries one more visible continuation item through the landing tail before the reveal footer row
  - the reveal footer lands lower without reviving the old archive-wall feel
  - Graph, Study, and focused Study stayed byte-stable after the pass
- Stage 186 post-Stage-185 benchmark audit is complete:
  - the audit confirmed that Home is materially calmer after Stage 185, but still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas
  - the rerun matched the validated Stage 185 captures without drift, and Graph, Study, and focused Study stayed lower-priority
  - the next slice is now a bounded Home tail-density-lift and reveal-footer-pushdown pass
- Stage 187 Recall Home tail density lift and reveal footer pushdown is complete:
  - Home now carries one more visible continuation item through the landing tail before the reveal footer row
  - the reveal footer lands lower without reviving the old archive-wall feel
  - Graph, Study, and focused Study stayed byte-stable after the pass
- Stage 188 post-Stage-187 benchmark audit is complete:
  - the audit confirmed that Home is materially calmer after Stage 187, but still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas
  - the rerun matched the validated Stage 187 captures without drift, and Graph, Study, and focused Study stayed lower-priority
  - the next slice is now a bounded Home tail-carry-extension and reveal-footer-delay pass
- Stage 189 Recall Home tail carry extension and reveal footer delay is complete:
  - Home now carries one more visible continuation item through the landing tail before the reveal footer row
  - the reveal footer lands lower without reviving the old archive-wall feel
  - Graph, Study, and focused Study stayed byte-stable after the pass
- Stage 190 post-Stage-189 benchmark audit is complete:
  - the audit confirmed that Home is materially calmer after Stage 189, but still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas
  - the rerun matched the validated Stage 189 captures without drift, and Graph, Study, and focused Study stayed lower-priority
  - the next slice is now a bounded Home tail-density-lift and reveal-footer-pushdown pass
- Stage 191 Recall Home tail density lift and reveal footer pushdown is complete:
  - Home now carries one more visible continuation item through the landing tail before the reveal footer row
  - the reveal footer lands lower without reviving the old archive-wall feel
  - Graph, Study, and focused Study stayed byte-stable after the pass
- Stage 192 post-Stage-191 benchmark audit is complete:
  - the audit confirmed that Home is materially calmer after Stage 191, but still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas
  - the rerun matched the validated Stage 191 captures without drift, and Graph, Study, and focused Study stayed lower-priority
  - the next slice is now a bounded Home tail-carry-extension and reveal-footer-delay pass
- Stage 193 Recall Home tail carry extension and reveal footer delay is complete:
  - Home now carries one more visible continuation item through the landing tail before the reveal footer row
  - the reveal footer lands lower without reviving the old archive-wall feel
  - Graph, Study, and focused Study stayed byte-stable after the pass
- Stage 194 Post-Stage-193 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures matched the validated Stage 193 artifacts without drift
  - Home still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas
  - the next slice is now a bounded Home tail-density-lift and reveal-footer-pushdown pass
- Stage 195 Recall Home tail density lift and reveal footer pushdown is complete:
  - Home now carries slightly more visible continuation through the landing tail before the reveal footer row
  - the reveal footer lands lower without reviving the old archive-wall feel
  - Graph, Study, and focused Study stayed byte-stable after the pass
- Stage 196 Post-Stage-195 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures matched the validated Stage 195 artifacts without drift
  - Home still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas
  - the next slice is now a bounded Home tail-carry-extension and reveal-footer-delay pass
- Stage 197 Recall Home tail carry extension and reveal footer delay is complete:
  - Home now carries the visible continuation farther through the landing tail before the reveal footer row
  - the reveal footer lands lower without reviving the old archive-wall feel
  - Graph, Study, and focused Study stayed byte-stable after the pass
- Stage 198 Post-Stage-197 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-Study captures matched the validated Stage 197 artifacts without drift
  - Home still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas
  - the next slice is now a bounded Home tail-density-lift and reveal-footer-pushdown pass

## Active Milestone

1. Stage 199: Recall Home tail density lift and reveal footer pushdown
   - carry slightly more visible Home continuation through the landing tail before the reveal footer row so the page ends later again
   - push the reveal footer lower without reviving the old archive wall or destabilizing the calmer Graph and Study surfaces

## Next Milestone

1. Stage 200: Post-Stage-199 benchmark audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the tail-density-lift pass
   - confirm whether Home still leads or whether the next bounded follow-up should shift after the denser visible tail and lower reveal footer

## Stage Map

1. Stage 1: Baseline Stabilization and Shared Core Extraction
   - 1A: rerun and reconcile frontend lint/test/build after the active reader UI/web-link pass lands
   - 1B: shared document-core schema, migration path, change log, and compatibility tests
2. Stage 2: Recall Foundation Vertical Slice
   - Recall-first shell and Reader integration
   - deterministic chunking over shared documents
   - keyword retrieval and first Markdown export path
3. Stage 3: Knowledge Graph V1
   - provenance-aware entity and relation groundwork
   - confidence-ranked linking
   - manual correction loop
4. Stage 4: Retrieval and Study Engine
   - hybrid search
   - source-grounded card generation
   - FSRS-backed scheduling and review logs
5. Stage 5: Augmented Browsing
   - MV3 extension
   - localhost retrieval
   - low-noise contextual resurfacing
6. Stage 6: Portability and Accessibility Integration
   - Markdown round-trip quality
   - shared reader/converter document-variant contracts
   - common reading-session and accessibility metadata
7. Stage 7: Tablet-Safe Groundwork
   - change-log APIs
   - portable attachments
   - deterministic merge rules without full sync yet
8. Stage 8: Hardening and Benchmarks
   - ingest, retrieval, extension, export, and scheduling benchmarks
   - migration hardening and recovery paths
9. Stage 9: Source-Linked Highlights and Notes
   - shared note records anchored to deterministic `reflowed/default` content
   - Reader note capture plus Recall note management and search
   - Reader jump-back from note anchors
10. Stage 10: Browser Note Capture and Note-Aware Retrieval
   - manual note capture from the MV3 companion for exact saved public-page matches
   - note-aware retrieval and browser-context surfacing
11. Stage 11: Portable Annotation Apply and Manual Knowledge Promotion
   - note entities in export/merge/apply flows
   - manual promotion from notes into graph evidence or study-card seeds
12. Stage 12: Post-Stage-11 Roadmap Refresh
   - confirm the next bounded implementation slice from the current product state through a Recall-benchmark UX audit
   - turn that choice into the next active ExecPlan
13. Stage 13: Recall Workflow Polish and Focused Reader Split View
   - global add-source and search entry points across the Recall shell
   - focused Reader layout with adjacent source/note context and lower-friction handoff loops
14. Stage 14: Recall Density and Contextual Reader Polish
   - compress persistent shell chrome and section scaffolding after the Stage 13 workflow gains
   - improve the information density and usefulness of Reader-side context plus narrower-screen fallbacks
15. Stage 15: Recall Collection Density and Detail Handoffs
   - tighten Library and Notes into denser list/detail surfaces with closer next actions
   - preserve reopen, export, edit, promotion, and anchored Reader handoffs while reducing browse friction
16. Stage 16: Recall Graph and Study Density plus Evidence Handoffs
   - tighten Graph and Study into denser review surfaces with clearer provenance and lower-friction actions
   - keep evidence, source context, and Reader handoffs adjacent while preserving current local-first behavior
17. Stage 17: Post-Stage-16 Recall UX Refresh
   - reassess the current Recall workspace after the Stage 13-16 UX passes
   - choose the next bounded milestone from a fresh workflow audit instead of from stale pre-polish assumptions
18. Stage 18: Recall Workspace Continuity and Navigation Memory
   - preserve per-section working context across Reader handoff, search landings, and section switches
   - improve "return to where I was" behavior without changing core routes or reopening deferred systems
19. Stage 19: Recall Current Context Dock and Quick Switching
   - surface active working context and recent work directly in the Recall shell
   - reduce navigation overhead by making the next useful jump obvious
20. Stage 20: Adaptive Context Compression and Detail Consolidation
   - compress repeated shell and section context now that current context and recent work are visible
   - keep orientation strong while reducing duplication and reclaiming working space
21. Stage 21: Post-Stage-20 Recall UX Refresh
   - reassess the live workspace after the Stage 20 compression pass
   - choose the next bounded milestone from current artifacts and the original Recall benchmark
22. Stage 22: Unified Workspace Search Continuity and Result Handoffs
   - unify workspace search into one continuity-aware surface
   - preserve result context while moving between Recall sections and Reader
23. Stage 23: Post-Stage-22 Recall UX Refresh
   - reassess the live workspace after the shared-search continuity correction
   - choose the next bounded milestone from the current product state and the Recall benchmark
24. Stage 24: Reader Notebook Adjacency and In-Place Note Workflows
   - make saved-note work adjacent to reading instead of forcing routine jumps into the standalone `Notes` section
   - keep note editing, promotion, and anchored reopen continuity close to the source
25. Stage 25: Post-Stage-24 Recall UX Refresh
   - reassess the live workspace after the Reader notebook-adjacency correction
   - choose the next bounded milestone from the current product state and Recall benchmark
26. Stage 26: Source-Centered Workspace Detail and Tabbed Handoffs
   - make a selected source feel like one shared Recall workspace instead of a set of disconnected section detail panes
   - keep adjacent Reader, notes, graph, and study transitions close to the active source
27. Stage 27: Post-Stage-26 Recall UX Refresh
   - reassess the live workspace after the source-centered handoff correction
   - choose the next bounded milestone from the current product state and Recall benchmark
28. Stage 28: Shared Source Panes and Contextual Collection Drawers
   - make one source feel like the primary working surface with shared panes instead of repeated section-local detail cards
   - keep collection browsing available but secondary during source-focused work
29. Stage 29: Post-Stage-28 Recall UX Refresh
   - reassess the live workspace after the shared source-pane and contextual drawer correction
   - choose the next bounded milestone from the current product state and Recall benchmark
30. Stage 30: Focused Source Mode and Collapsible Workspace Chrome
   - let an active source take over the working canvas instead of living below dashboard-level shell chrome
   - keep workspace browse, context, and recent-work affordances available on demand without pushing source work down the page
31. Stage 31: Post-Stage-30 Recall UX Refresh
   - reassess the live source-focused workspace after the shell-chrome collapse correction
   - choose the next bounded milestone from the current product state and Recall benchmark
32. Stage 32: Flexible Source Split Work and Adaptable Side Panes
   - keep one active source visible while nearby `Notes`, `Graph`, and `Study` work adapt into a secondary pane
   - preserve browse-first section entry while making source-focused work feel more like one continuous split workspace
33. Stage 33: Post-Stage-32 Recall UX Refresh
   - reassess the live split-work workspace after the Stage 32 source-local side-pane correction
   - choose the next bounded milestone from current artifacts, the product brief, and the Recall benchmark
34. Stage 34: Reader-Led Source Split and Contextual Evidence Panes
   - keep the live source itself, not just source summary metadata, as the steady primary pane during source-local note, graph, and study work
   - tighten evidence and anchor workflows around live reading without reopening deferred backend or AI scope
35. Stage 35: Collection-First Recall Shell Reset Before Further UI Work
   - replace the old dashboard-heavy default shell with a collection-first layout centered on one rail, one top bar, and one main canvas
   - keep focused source work compact and preserve Stage 34 reader-led split behavior while reducing stacked shell clutter
36. Stage 36: Post-Stage-35 Recall UX Refresh
   - reassess the new collection-first shell against the user's benchmark, current live behavior, and the product brief
   - choose the next bounded UX correction only after the refreshed shell is audited in its live state
37. Stage 37: True Collection-First Landing and Intentional Source Entry
   - stop populated `/recall` from auto-entering focused source mode on load
   - preserve reader-led focused work once the user explicitly enters one source through selection or handoff
38. Stage 38: Post-Stage-37 Recall UX Refresh
   - audit the new browse-first landing and intentional source-entry model in live use
   - choose the next bounded UI correction from the current app and benchmark evidence instead of guessing at another broad shell pass
39. Stage 39: Recall Hierarchy Cleanup and Responsive Card Density
   - reduce landing and focused-Library noise while improving card readability and mid-width responsiveness
   - preserve intentional source entry and reader-led focused work while making the app feel calmer and more benchmark-aligned
40. Stage 40: Benchmark-Driven Recall Surface Audit
   - anchor the audit to user-provided Recall screenshots plus official Recall docs/blog/changelog references
   - capture a benchmark matrix and fresh localhost surface screenshots before choosing the next implementation slice
41. Stage 41: Recall Shared Shell And Surface Convergence
   - rewrite the shared shell and top-level Recall surfaces to match the benchmark direction much more closely
   - keep local-first behavior and reader-led focused work while changing the visible structure substantially
42. Stage 42: Post-Stage-41 Benchmark Audit
   - audit the live Stage 41 captures against the benchmark matrix and choose the next bounded surface fix from evidence
   - keep screenshot review as the gate instead of guessing at another broad rewrite
43. Stage 43: Recall Library Selectivity And Add-Source Hierarchy Cleanup
   - make the populated Library/home surface more selective and benchmark-aligned while tightening the remaining add-source hierarchy
   - preserve the shared shell direction and queue Graph/Study follow-up work behind the entry-surface cleanup
44. Stage 44: Post-Stage-43 Benchmark Audit
   - compare the refreshed Library/home and Add Content surfaces against the benchmark before choosing the next bounded surface pass
   - decide whether Graph or Study is now the higher-value implementation target
45. Stage 45: Recall Graph Canvas First Pass And Home Terminology Cleanup
   - make browse-mode Graph graph-first instead of detail-first while renaming the user-facing `Library` surface to `Home`
   - preserve browse-first entry, focused reader-led work, and route continuity while reducing graph dashboard chrome
46. Stage 46: Post-Stage-45 Benchmark Audit
   - compare the refreshed Home and Graph surfaces against the benchmark and the live localhost captures
   - decide whether Study is now the next bounded implementation slice or whether Home/Graph still need one more benchmark pass
47. Stage 47: Recall Study Centered Review Surface First Pass
   - reshape browse-mode Study around a calmer, more centered review/start surface inspired by the Recall benchmark
   - keep local review state, source evidence, Reader reopen, and focused reader-led Study behavior intact
48. Stage 48: Post-Stage-47 Benchmark Audit
   - compare the refreshed Study surface, Home landing, and Graph browse canvas against the benchmark and fresh localhost captures
   - decide whether the next bounded slice should return to Home density/selectivity, continue Study chrome reduction, or address another clearly evidenced mismatch
49. Stage 49: Recall Home Selective Landing Second Pass
   - reduce populated Home density and archive-like repetition so the landing feels more selective and benchmark-aligned again
   - preserve intentional source entry, the current add-content flow, and the recent Graph/Study gains while tightening recency and reopen emphasis
50. Stage 50: Post-Stage-49 Benchmark Audit
   - compare the refreshed Home landing against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
51. Stage 51: Recall Study Sidebar And Queue Compression Second Pass
   - reduce Study browse-mode sidebar and queue weight so the review task stays visually dominant
   - preserve local review state, Reader reopen, source evidence, and focused reader-led Study behavior while simplifying support chrome
52. Stage 52: Post-Stage-51 Benchmark Audit
   - compare the refreshed Study surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
53. Stage 53: Recall Study Default Queue Collapse And Stage Shell Minimization
   - make browse-mode Study land in a lighter summary-first queue state with explicit reveal instead of opening into the full rail by default
   - further demote the remaining stage-guide chrome so the main review card clearly dominates
54. Stage 54: Post-Stage-53 Benchmark Audit
   - compare the refreshed Study surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
55. Stage 55: Recall Study Support Rail Flattening And Review Header Compression
   - flatten the collapsed browse-mode Study support rail so it reads as lighter utility context instead of a tall boxed sidebar card
   - compress the top-of-card journey and metadata chrome so the prompt and answer interaction begin earlier
56. Stage 56: Post-Stage-55 Benchmark Audit
   - compare the refreshed Study surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
57. Stage 57: Recall Study Support Rail Unboxing And Review Utility Demotion
   - remove the remaining boxed feel from the collapsed browse-mode Study support rail so it reads as light utility instead of a side card
   - demote the browse-mode Reader action and journey cluster so they stop competing with the main review card
58. Stage 58: Post-Stage-57 Benchmark Audit
   - compare the refreshed Study surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
59. Stage 59: Recall Study Evidence Stack Compression And Rating Row Tightening
   - compress the lower browse-mode Study support stack so `Source evidence` and the rating footer feel secondary to the recall-first flow
   - preserve evidence grounding, Reader reopen, and the calmer Stage 57 queue/header gains
60. Stage 60: Post-Stage-59 Benchmark Audit
   - compare the refreshed Study surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
61. Stage 61: Recall Study Pre-Reveal Evidence Minimization And Queue Rail Softening
   - minimize the browse-mode evidence footprint before reveal so the review flow keeps first ownership
   - soften the queue rail framing so it reads more like utility than like a second panel
62. Stage 62: Post-Stage-61 Benchmark Audit
   - compare the refreshed Study surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
63. Stage 63: Recall Study Session Singularization And Queue Summary Demotion
   - make browse-mode Study feel more like one deliberate review session by demoting the persistent queue summary and trimming extra pre-answer support chrome
   - preserve source grounding, Reader reopen, local FSRS state, and focused reader-led Study behavior
64. Stage 64: Post-Stage-63 Benchmark Audit
   - compare the refreshed Study surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
65. Stage 65: Recall Home Utility Rail Softening And Recent List Compression
   - soften the left Home support rail so it reads more like utility and less like a tall parallel card stack
   - compress recent-source rows and repeated metadata so the landing stays selective and less archive-like
66. Stage 66: Post-Stage-65 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
67. Stage 67: Recall Study Session Dock Narrowing And Review Header Demotion
   - narrow the browse-mode Study session dock so it behaves more like secondary utility than like a sibling panel
   - demote pre-answer review-header and action chrome so the prompt owns the page sooner without losing source grounding or Reader reopen
68. Stage 68: Post-Stage-67 Benchmark Audit
   - compare the refreshed Study surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
69. Stage 69: Recall Study Session Dock Summary Reduction And Grounding Ready Compression
   - trim the collapsed Study dock summary so it behaves more like quiet support than like a sidebar card
   - compress the pre-reveal `Grounding ready` strip so support stays close without competing with the prompt
70. Stage 70: Post-Stage-69 Benchmark Audit
   - compare the refreshed Study surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
71. Stage 71: Recall Home Landing Canvas Tightening And Card-Wall Flattening
   - tighten the Home landing header/canvas spacing so the collection begins sooner
   - flatten the oversized saved-source card wall so the landing reads more like a selective start surface than like an archive grid
72. Stage 72: Post-Stage-71 Benchmark Audit
   - compare the refreshed Home landing against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
73. Stage 73: Recall Study Session Rail Compaction And Review Header Flattening
   - compress the browse-mode Study session rail so it behaves more like quiet secondary utility than like a persistent dashboard column
   - flatten the pre-answer review header and support chrome so the prompt owns the page sooner
74. Stage 74: Post-Stage-73 Benchmark Audit
   - compare the refreshed Study surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
75. Stage 75: Recall Home Utility Rail Demotion And Featured Reopen Prioritization
   - demote the Home utility rail so it behaves more like light secondary support than like a full-height sidebar
   - make the featured reopen surface feel more selective and prioritized rather than like a broad row of equally weighted cards
76. Stage 76: Post-Stage-75 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
77. Stage 77: Recall Home Spotlight Footprint Reduction And Secondary Reopen Compression
   - shrink the oversized `Start here` spotlight so Home feels more like a selective reopen surface than like a staged showcase
   - compress the `Keep nearby` stack so it behaves more like supportive reopen utility than like a boxed companion column
78. Stage 78: Post-Stage-77 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
79. Stage 79: Recall Study Session Dock Utility Flattening And Review Meta Demotion
   - flatten the browse-mode `Session` dock so it behaves more like quiet secondary utility than like a persistent dashboard sidebar
   - demote pre-answer review meta and step framing so the prompt owns the page sooner
80. Stage 80: Post-Stage-79 Benchmark Audit
   - compare the refreshed Study surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
81. Stage 81: Recall Home Featured Band Compaction And Empty-Canvas Reduction
   - compact the featured reopen band so Home feels less like a spotlight-plus-column layout and more like one selective reopen zone
   - reduce the remaining empty-canvas feel so the landing becomes brisker without regressing the calmer Study, Graph, or focused reader-led work
82. Stage 82: Post-Stage-81 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
83. Stage 83: Recall Study Session Rail Utility Compression And Grounding Row Demotion
   - demote the browse-mode `Session` rail so it behaves more like quiet secondary review utility than like a persistent sidebar
   - compress the pre-answer `Grounded` row so the review prompt stays dominant without losing evidence trust cues
84. Stage 84: Post-Stage-83 Benchmark Audit
   - compare the refreshed Study surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
85. Stage 85: Recall Home Follow-On Reopen Flow And Lower-Canvas Fill
   - extend the saved-source flow beyond the single featured band so Home feels more continuous and selective
   - reduce the remaining lower-canvas dead space without restoring the old archive-wall feel
86. Stage 86: Post-Stage-85 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
87. Stage 87: Recall Study Session Dock Minimization And Review Canvas Recentering
   - further demote the browse-mode `Session` dock so Study reads less like a sidebar layout and more like a singular review flow
   - tighten the pre-answer review frame so the prompt and reveal interaction own the page sooner
88. Stage 88: Post-Stage-87 Benchmark Audit
   - compare the refreshed Study surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
89. Stage 89: Recall Home Utility Search Rail Demotion And Landing Header Tightening
   - demote the Home utility/search side so it behaves more like quiet secondary support than like a standing content column
   - tighten the landing header and upper-canvas handoff so the reopen flow begins sooner and feels less staged
90. Stage 90: Post-Stage-89 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
91. Stage 91: Recall Home Header Merge And First Reopen Lift
   - merge the split Home header and first reopen handoff so the saved-source flow starts sooner on desktop
   - keep the calmer Stage 89 utility/search rail while removing the remaining staged top-of-page setup feel
92. Stage 92: Post-Stage-91 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
93. Stage 93: Recall Study Session Dock Demotion And Review Header Compaction
   - demote the browse-mode `Session` dock so it behaves more like quiet secondary utility than like a persistent sidebar
   - compress the pre-answer review header and due meta so the prompt owns the page sooner
94. Stage 94: Post-Stage-93 Benchmark Audit
   - compare the refreshed Study surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
95. Stage 95: Recall Home Find Later Column Demotion And Saved Sources Intro Compaction
   - demote the left `Find later` utility/search area so it behaves more like quiet support than like a standing landing column
   - compress the `Saved sources` intro/setup area so the featured reopen flow begins sooner on desktop
96. Stage 96: Post-Stage-95 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
97. Stage 97: Recall Home Utility Column Collapse And Saved Sources Header Action Demotion
   - collapse the lingering left-side utility/search column feel so Home reads less like a split dashboard
   - demote the `Saved sources` heading, chip, and action chrome so the featured reopen flow begins sooner
98. Stage 98: Post-Stage-97 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
99. Stage 99: Recall Home Support Dock Collapse And Saved Sources Preamble Reduction
   - collapse the lingering Home support/search dock so the landing reads less like a split dashboard
   - reduce the remaining `Saved sources` preamble so the featured reopen flow begins sooner
100. Stage 100: Post-Stage-99 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
101. Stage 101: Recall Home Support Utility Inlining And Saved Sources Preamble Removal
   - inline or collapse the remaining Home support utilities so the landing reads less like a split dashboard
   - remove the remaining `Saved sources` preamble so the featured reopen flow begins almost immediately below the header
102. Stage 102: Post-Stage-101 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
103. Stage 103: Recall Home Landing Header Collapse And Inline Search Demotion
   - collapse the remaining split Home landing header and bring the first featured reopen flow closer to the heading
   - demote the inline search/add treatment so it reads like utility support instead of a second setup zone
104. Stage 104: Post-Stage-103 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
105. Stage 105: Recall Study Session Rail Demotion And Review Canvas Recentering
   - demote the browse-mode `Session` rail and reduce the surrounding dashboard feel around the review flow
   - keep focused Study reader-led and keep Home/Graph stable
106. Stage 106: Post-Stage-105 Benchmark Audit
   - compare the refreshed Study surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
107. Stage 107: Recall Home Featured Flow Unification And Lower Canvas Compaction
   - reduce the staged split between the featured reopen band and the lower Home continuation stack
   - keep Study, Graph, and focused Study stable while making Home feel more continuous and selective
108. Stage 108: Post-Stage-107 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
109. Stage 109: Recall Home Spotlight Footprint Reduction And Utility Header Softening
   - reduce the oversized feel of the `Start here` spotlight and soften the upper-right utility/search row
   - keep Study, Graph, focused Study, and the Stage 107 continuation flow stable
110. Stage 110: Post-Stage-109 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
111. Stage 111: Recall Home Opening Stage Unification And Nearby Flow Lift
   - reduce the split staged feel between the featured spotlight and nearby/support reopen utility so Home reads like one calmer first-flow surface
   - keep Study, Graph, focused Study, and the deferred responsive-shell issue stable
112. Stage 112: Post-Stage-111 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
113. Stage 113: Recall Study Support Strip Demotion And Review Card Lift
   - demote the remaining browse-mode Study support strip and reduce the empty dashboard feel around the main review task
   - keep Home, Graph, focused Study, and the deferred responsive-shell issue stable
114. Stage 114: Post-Stage-113 Benchmark Audit
   - compare the refreshed Study surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
115. Stage 115: Recall Home Continuation Handoff Tightening And Lower Reopen Row Compaction
   - tighten the handoff from the opening spotlight into the lower continuation rows and reduce the remaining boxed/archive feel there
   - keep Study, Graph, focused Study, and the deferred responsive-shell issue stable
116. Stage 116: Post-Stage-115 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
117. Stage 117: Recall Home Lower Canvas Fill And Reveal Control Integration
   - integrate the reveal control into the continuation flow and reduce the abrupt lower-canvas ending without restoring a dense archive wall
   - keep Study, Graph, focused Study, and the deferred responsive-shell issue stable
118. Stage 118: Post-Stage-117 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
119. Stage 119: Recall Study Support Strip Minimization And Review Canvas Tightening
   - reduce the remaining browse-mode Study support-strip framing and tighten the review card landing so the task owns the page sooner
   - keep Home, Graph, focused Study, and the deferred responsive-shell issue stable
120. Stage 120: Post-Stage-119 Benchmark Audit
   - compare the refreshed Study surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
121. Stage 121: Recall Home Opening Spotlight Compaction And Nearby Flow Flattening
   - reduce the remaining oversized `Start here` spotlight and flatten the nearby reopen handoff so Home reads like one calmer selective flow
   - keep Study, Graph, focused Study, and the deferred responsive-shell issue stable
122. Stage 122: Post-Stage-121 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
123. Stage 123: Recall Study Support Strip Collapse And Review Card Expansion
   - collapse the remaining browse-mode support-strip framing and let the review card occupy more of the Study canvas
   - keep Home, Graph, focused Study, and the deferred responsive-shell issue stable
124. Stage 124: Post-Stage-123 Benchmark Audit
   - compare the refreshed Study surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
125. Stage 125: Recall Home Continuation Band Elevation And Reveal Card Demotion
   - elevate the lower Home continuation flow so it feels like the next step in the same reopen sequence
   - demote the final reveal control so the landing ends more naturally without reviving the archive-wall feel
126. Stage 126: Post-Stage-125 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
127. Stage 127: Recall Study Support Strip Removal And Review Canvas Lift
   - remove or materially demote the remaining empty top support-strip framing in browse-mode Study
   - lift the review card so the task owns the page sooner while keeping Home, Graph, and focused Study stable
128. Stage 128: Post-Stage-127 Benchmark Audit
   - compare the refreshed Study surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite
129. Stage 129: Recall Home Collection Frame Flattening And Row Meta Demotion
   - flatten or materially soften the large Home collection frame so the landing reads more like a lighter collection canvas
   - demote repeated row labels, timestamps, and supporting meta while preserving the selective reopen flow
130. Stage 130: Post-Stage-129 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep the scope narrow and protect the calmer Home, Graph, Study, and focused-Study baselines
131. Stage 131: Recall Home Collection Unboxing And Date Gutter Collapse
   - reduce the remaining full-width panel feel on Home so the landing reads more like a lighter collection zone
   - collapse the strong right-side date gutter into quieter inline meta while preserving the selective reopen flow
132. Stage 132: Post-Stage-131 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep the scope narrow and protect the calmer Home, Graph, Study, and focused-Study baselines
133. Stage 133: Recall Graph Support Rail Collapse And Detail Overlay Compaction
   - collapse the left Graph support rail so the canvas reclaims more of the browse surface
   - compact the selected-node overlay so evidence stays nearby without over-framing the graph stage
134. Stage 134: Post-Stage-133 Benchmark Audit
   - compare the refreshed Graph surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep the scope narrow and protect the calmer Home, Study, Graph, and focused-Study baselines
135. Stage 135: Recall Graph Quick-Pick Rail Slimming And Overlay Footprint Reduction
   - slim the left quick-pick rail so it behaves more like a light selector than a second card column
   - reduce the selected-node overlay footprint so the canvas stays clearly dominant
136. Stage 136: Post-Stage-135 Benchmark Audit
   - compare the refreshed Graph surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep the scope narrow and protect the calmer Home, Study, Graph, and focused-Study baselines
137. Stage 137: Recall Graph Utility Metrics Collapse And Quick-Pick Truncation
   - collapse the left Graph utility metrics and focused-source framing into a smaller glance-level summary
   - shorten the default quick-pick stack so the rail reads like a thinner selector strip beside the canvas
138. Stage 138: Post-Stage-137 Benchmark Audit
   - confirm whether Graph still leads after the utility-metrics-collapse and quick-pick-truncation pass using fresh benchmark artifacts
   - identify the remaining mismatch within Graph more precisely before changing the surface again
139. Stage 139: Recall Graph Selector Strip Flattening And Glance-Stack Compaction
   - flatten the remaining search, glance, and quick-pick stack so the rail reads like one lighter selector strip
   - reduce the dedicated-column feel while preserving the calmer overlay, grounding, and handoffs
140. Stage 140: Post-Stage-139 Benchmark Audit
   - compare the refreshed Graph surface against the benchmark and fresh localhost captures after the selector-strip pass
   - keep the scope narrow and protect the calmer Home, Study, Graph, and focused-Study baselines
141. Stage 141: Recall Graph Intro Shell Demotion And Detail Overlay Compaction
   - demote duplicated intro framing around the Graph canvas so the stage starts sooner
   - compact the selected-node overlay while preserving the calmer selector strip, grounding, and handoffs
142. Stage 142: Post-Stage-141 Benchmark Audit
   - compare the refreshed Graph surface against the benchmark and fresh localhost captures after the intro/overlay pass
   - keep the scope narrow and protect the calmer Home, Study, Graph, and focused-Study baselines
143. Stage 143: Recall Graph Support Framing Collapse And Detail Peek Default
   - flatten the remaining left selector-strip card framing so the support rail reads more like light utility beside the canvas
   - reduce the selected-node detail to a smaller default peek state while preserving grounded actions and handoffs
144. Stage 144: Post-Stage-143 Benchmark Audit
   - compare the refreshed Graph surface against the benchmark and fresh localhost captures after the support-framing pass
   - keep the scope narrow and protect the calmer Home, Study, Graph, and focused-Study baselines
145. Stage 145: Recall Home Lead Card Deflation And Lower Canvas Continuation Fill
   - reduce the oversized top lead-band footprint so Home feels less dominated by one boxed feature
   - strengthen the lower continuation rhythm so the landing carries downward without reviving the old archive wall
146. Stage 146: Post-Stage-145 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the lead-card/continuation pass
   - keep the scope narrow and protect the calmer Home, Study, Graph, and focused-Study baselines
147. Stage 147: Recall Graph Selector Rail Narrowing And Detail Dock Slimming
   - narrow the remaining left selector strip so it reads more like light utility beside the canvas
   - slim the right selected-node dock so the graph canvas keeps more of the page without losing grounded actions or handoffs
148. Stage 148: Post-Stage-147 Benchmark Audit
   - compare the refreshed Graph surface against the benchmark and fresh localhost captures after the selector-rail/detail-dock pass
   - use screenshot evidence to decide whether Graph still leads or whether another surface now becomes the clearest follow-up
149. Stage 149: Recall Home Opening Cluster Compaction And Lower Canvas Fill
   - compact the staged lead-plus-nearby opening so Home reads more like one selective collection zone
   - carry the lower continuation farther into the page without reviving the dense archive wall
150. Stage 150: Post-Stage-149 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the opening-cluster/lower-canvas pass
   - keep the scope narrow and protect the calmer Graph, Study, and focused-Study baselines
151. Stage 151: Recall Home Continuation Grid Fill And Reveal Card Demotion
   - extend the lower continuation so it fills more of the landing before the reveal endpoint
   - demote the reveal control into a lighter in-flow continuation affordance without reviving the archive wall
152. Stage 152: Post-Stage-151 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the continuation-grid/reveal-control pass
   - confirm whether the remaining mismatch stays in Home or shifts after the fuller continuation and lighter footer reveal
153. Stage 153: Recall Home Spotlight Deflation And Follow-On Header Demotion
   - reduce the boxed `Start here` emphasis so the opening reads less like a staged hero cluster
   - demote the `Keep going` restart framing so the continuation feels like one calmer collection flow
154. Stage 154: Post-Stage-153 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the spotlight/header pass
   - confirm whether the remaining mismatch stays in Home or shifts after the flatter spotlight and quieter continuation intro
155. Stage 155: Recall Home Opening Column Collapse And Support Row Inline Merge
   - collapse the remaining lead-plus-support split so the opening reads more like one calmer reopen flow
   - reduce the right-column support-panel feel without reviving the archive wall
156. Stage 156: Post-Stage-155 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the opening-column pass
   - confirm whether the remaining mismatch stays in Home or shifts after the calmer stacked opening flow
157. Stage 157: Recall Home Lead Row Flattening And Footer Reveal Inline Merge
   - flatten the remaining spotlight-row feel so the first reopen point reads more like part of one calmer collection flow
   - integrate the lower reveal affordance more directly into the continuation rhythm without reviving the old archive wall
158. Stage 158: Post-Stage-157 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the lead-row/reveal pass
   - confirm whether Home still leads or whether the next bounded follow-up should shift after the flatter opening and ending rhythm
159. Stage 159: Recall Home Opening Pair Equalization And Continuation Density Lift
   - equalize the remaining opening pair so the first visible rows read less like a staged duo
   - lift the visible continuation density slightly without reviving the old archive wall
160. Stage 160: Post-Stage-159 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the opening-pair/density pass
   - confirm whether Home still leads or whether the next bounded follow-up should shift after the calmer opening and fuller visible continuation
161. Stage 161: Recall Home Lead Row Demotion And Visible Continuation Extension
   - demote the remaining singled-out lead row so the opening reads more like one continuous reopen flow
   - extend the visible continuation slightly without reviving the old archive wall
162. Stage 162: Post-Stage-161 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the lead-row/continuation pass
   - confirm whether Home still leads or whether the next bounded follow-up should shift after the calmer opening and fuller lower carry
163. Stage 163: Recall Home Start Here Kicker Demotion And Reveal Row Deflation
   - soften the remaining `Start here` cue so the first visible cell reads less like a special stage
   - reduce the reveal row's separate-endpoint feel without reviving the old archive wall
164. Stage 164: Post-Stage-163 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the kicker/reveal pass
   - confirm whether Home still leads or whether the next bounded follow-up should shift after the quieter first cell and calmer landing endpoint
165. Stage 165: Recall Home Lead Row Meta Equalization And Reveal Footer Utility Merge
   - equalize the remaining first-row meta treatment so the opening reads more like one even reopen flow
   - merge the reveal footer utility into one calmer continuation line without reviving the old archive wall
166. Stage 166: Post-Stage-165 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the lead-row/footer-merge pass
   - confirm whether Home still leads or whether the next bounded follow-up should shift after the calmer first-row meta and merged footer utility
167. Stage 167: Recall Home Visible Continuation Extension And Lower Canvas Fill
   - extend the visible Home continuation so the landing carries farther before the reveal row
   - fill more of the lower canvas without reviving the old archive wall or destabilizing the calmer Graph and Study surfaces
168. Stage 168: Post-Stage-167 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the visible-continuation-extension pass
   - confirm whether Home still leads or whether the next bounded follow-up should shift after the fuller lower-canvas carry
169. Stage 169: Recall Home Continuation Density Lift And Reveal Row Pushdown
   - show slightly more visible continuation before the reveal row so the landing ends later
   - push the reveal row lower without reviving the old archive wall or destabilizing the calmer Graph and Study surfaces
170. Stage 170: Post-Stage-169 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the continuation-density-lift pass
   - confirm whether Home still leads or whether the next bounded follow-up should shift after the later reveal row and denser visible continuation
171. Stage 171: Recall Home Continuation Carry Extension And Reveal Row Delay
   - carry the visible Home continuation farther before the reveal row so the landing ends later
   - delay the reveal row without reviving the old archive wall or destabilizing the calmer Graph and Study surfaces
172. Stage 172: Post-Stage-171 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the continuation-carry-extension pass
   - confirm whether Home still leads or whether the next bounded follow-up should shift after the later reveal row and fuller landing carry
173. Stage 173: Recall Home Continuation Tail Extension And Reveal Footer Pushdown
   - carry the visible tail of the Home continuation farther before the reveal footer row so the landing ends later
   - push the reveal footer lower without reviving the old archive wall or destabilizing the calmer Graph and Study surfaces
174. Stage 174: Post-Stage-173 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the continuation-tail-extension pass
   - confirm whether Home still leads or whether the next bounded follow-up should shift after the later reveal footer and fuller landing carry
175. Stage 175: Recall Home Continuation Tail Density Lift And Reveal Footer Delay
   - show slightly more visible continuation through the Home landing tail before the reveal footer row so the page ends later
   - delay the reveal footer without reviving the old archive wall or destabilizing the calmer Graph and Study surfaces
176. Stage 176: Post-Stage-175 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the continuation-tail-density-lift pass
   - confirm whether Home still leads or whether the next bounded follow-up should shift after the later reveal footer and fuller landing tail
177. Stage 177: Recall Home Tail Carry Extension And Reveal Footer Lowering
   - carry the visible Home continuation farther through the landing tail before the reveal footer row so the page ends later again
   - lower the reveal footer without reviving the old archive wall or destabilizing the calmer Graph and Study surfaces
178. Stage 178: Post-Stage-177 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the tail-carry-extension pass
   - confirm whether Home still leads or whether the next bounded follow-up should shift after the later reveal footer and fuller landing tail
179. Stage 179: Recall Home Tail Density Lift And Reveal Footer Pushdown
   - carry slightly more visible Home continuation through the landing tail before the reveal footer row so the page ends later again
   - push the reveal footer lower without reviving the old archive wall or destabilizing the calmer Graph and Study surfaces
180. Stage 180: Post-Stage-179 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the tail-density-lift pass
   - confirm whether Home still leads or whether the next bounded follow-up should shift after the later reveal footer and fuller landing tail
181. Stage 181: Recall Home Tail Carry Extension And Reveal Footer Delay
   - carry the visible Home continuation farther through the landing tail before the reveal footer row so the page ends later again
   - delay the reveal footer without reviving the old archive wall or destabilizing the calmer Graph and Study surfaces
182. Stage 182: Post-Stage-181 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the tail-carry-extension pass
   - confirm whether Home still leads or whether the next bounded follow-up should shift after the later reveal footer and fuller landing tail
183. Stage 183: Recall Home Continuation Tail Extension And Reveal Footer Lowering
   - carry the visible Home continuation farther through the landing tail before the reveal footer row so the page ends later again
   - lower the reveal footer without reviving the old archive wall or destabilizing the calmer Graph and Study surfaces
184. Stage 184: Post-Stage-183 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the continuation-tail-extension pass
   - confirm whether Home still leads or whether the next bounded follow-up should shift after the later reveal footer and fuller landing tail
185. Stage 185: Recall Home Tail Carry Extension And Reveal Footer Lowering
   - carry the visible Home continuation farther through the landing tail before the reveal footer row so the page ends later again
   - lower the reveal footer without reviving the old archive wall or destabilizing the calmer Graph and Study surfaces
186. Stage 186: Post-Stage-185 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the tail-carry-extension pass
   - confirm whether Home still leads or whether the next bounded follow-up should shift after the later reveal footer and fuller landing tail
187. Stage 187: Recall Home Tail Density Lift And Reveal Footer Pushdown
   - carry slightly more visible Home continuation through the landing tail before the reveal footer row so the page ends later again
   - push the reveal footer lower without reviving the old archive wall or destabilizing the calmer Graph and Study surfaces
188. Stage 188: Post-Stage-187 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the tail-density-lift pass
   - confirm whether Home still leads or whether the next bounded follow-up should shift after the later reveal footer and fuller landing tail
189. Stage 189: Recall Home Tail Carry Extension And Reveal Footer Delay
   - carry the visible Home continuation farther through the landing tail before the reveal footer row so the page ends later again
   - delay the reveal footer without reviving the old archive wall or destabilizing the calmer Graph and Study surfaces
190. Stage 190: Post-Stage-189 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the tail-carry-extension pass
   - confirm whether Home still leads or whether the next bounded follow-up should shift after the farther visible tail and later reveal footer
191. Stage 191: Recall Home Tail Density Lift And Reveal Footer Pushdown
   - carry slightly more visible Home continuation through the landing tail before the reveal footer row so the page ends later again
   - push the reveal footer lower without reviving the old archive wall or destabilizing the calmer Graph and Study surfaces
192. Stage 192: Post-Stage-191 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the tail-density-lift pass
   - confirm whether Home still leads or whether the next bounded follow-up should shift after the later reveal footer and fuller landing tail
193. Stage 193: Recall Home Tail Carry Extension And Reveal Footer Delay
   - carry the visible Home continuation farther through the landing tail before the reveal footer row so the page ends later again
   - delay the reveal footer without reviving the old archive wall or destabilizing the calmer Graph and Study surfaces
194. Stage 194: Post-Stage-193 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the tail-carry-extension pass
   - confirm whether Home still leads or whether the next bounded follow-up should shift after the farther visible tail and later reveal footer
195. Stage 195: Recall Home Tail Density Lift And Reveal Footer Pushdown
   - carry slightly more visible Home continuation through the landing tail before the reveal footer row so the page ends later again
   - push the reveal footer lower without reviving the old archive wall or destabilizing the calmer Graph and Study surfaces
196. Stage 196: Post-Stage-195 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the tail-density-lift pass
   - confirm whether Home still leads or whether the next bounded follow-up should shift after the denser visible tail and lower reveal footer
197. Stage 197: Recall Home Tail Carry Extension And Reveal Footer Delay
   - carry the visible Home continuation farther through the landing tail before the reveal footer row so the page ends later again
   - delay the reveal footer without reviving the old archive wall or destabilizing the calmer Graph and Study surfaces
198. Stage 198: Post-Stage-197 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the tail-carry-extension pass
   - confirm whether Home still leads or whether the next bounded follow-up should shift after the fuller visible tail and later reveal footer
199. Stage 199: Recall Home Tail Density Lift And Reveal Footer Pushdown
   - carry slightly more visible Home continuation through the landing tail before the reveal footer row so the page ends later again
   - push the reveal footer lower without reviving the old archive wall or destabilizing the calmer Graph and Study surfaces
200. Stage 200: Post-Stage-199 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the tail-density-lift pass
   - confirm whether Home still leads or whether the next bounded follow-up should shift after the denser visible tail and lower reveal footer
201. Stage 201: Recall Home Landing Endpoint Convergence Bundle
   - extend the visible Home continuation by more than one additional reopen item and delay the reveal footer in one bundled landing-endpoint pass
   - tighten lower-canvas spacing and meta only as needed so the fuller tail stays calm before the next full benchmark audit
202. Stage 202: Post-Stage-201 Benchmark Audit
   - compare the refreshed Home surface against the benchmark and fresh localhost captures after the bundled landing-endpoint convergence pass
   - confirm whether Home still leads or whether the next bounded follow-up should stay on Home or finally shift surfaces
203. Stage 203: Recall Graph Canvas Bracketing Reduction And Detail Dock Softening
   - slim the Graph selector rail and soften the selected-node detail dock so the canvas reads more primary
   - preserve grounded evidence, source handoffs, and decision actions while reducing browse-mode support framing
204. Stage 204: Post-Stage-203 Benchmark Audit
   - compare the refreshed Graph surface against the benchmark and fresh localhost captures after the canvas-bracketing reduction pass
   - confirm whether Graph still leads or whether the next bounded follow-up should stay on Graph or shift surfaces
205. Stage 205: Recall Graph Selector Strip Collapse And Detail Peek Deflation
   - collapse the open Graph selector strip into lighter utility and reduce the default selected-node peek so the canvas feels less bracketed
   - preserve grounded evidence, source handoffs, and explicit decision actions in expanded detail while the browse surface converges further
206. Stage 206: Post-Stage-205 Benchmark Audit
   - compare the refreshed Graph surface against the benchmark and fresh localhost captures after the selector-strip collapse and detail-peek deflation pass
   - confirm whether Graph still leads or whether the next bounded follow-up should stay on Graph or shift surfaces
207. Stage 207: Recall Graph Selector Strip Header Collapse And Detail Dock Header Demotion
   - collapse the open selector-strip header chrome and demote the default detail-dock header/meta framing so the canvas feels less bracketed
   - preserve grounded evidence, source handoffs, and explicit decision actions in expanded detail while the browse surface converges further
208. Stage 208: Post-Stage-207 Benchmark Audit
   - compare the refreshed Graph surface against the benchmark and fresh localhost captures after the selector-strip header and dock-header demotion pass
   - confirm whether Graph still leads or whether the next bounded follow-up should stay on Graph or shift surfaces
209. Stage 209: Recall Graph Selector Strip Narrowing And Detail Peek Footprint Reduction
   - narrow the open selector strip and shrink the default selected-node peek so the browse canvas feels less bracketed by side columns
   - preserve grounded evidence, source handoffs, and explicit decision actions in expanded detail while the browse surface converges further
210. Stage 210: Post-Stage-209 Benchmark Audit
   - compare the refreshed Graph surface against the benchmark and fresh localhost captures after the selector-strip narrowing and detail-peek footprint reduction pass
   - confirm whether Graph still leads or whether the next bounded follow-up should stay on Graph or shift surfaces
211. Stage 211: Recall Graph Selector Strip Utility Collapse And Detail Peek Softening
   - collapse the remaining selector-strip utility stack and soften the default detail peek so the browse canvas feels less bracketed by standing side structures
   - preserve grounded evidence, source handoffs, and explicit decision actions in expanded detail while the browse surface converges further
212. Stage 212: Post-Stage-211 Benchmark Audit
   - compare the refreshed Graph surface against the benchmark and fresh localhost captures after the selector-strip utility collapse and detail-peek softening pass
   - confirm whether Graph still leads or whether the next bounded follow-up should stay on Graph or shift surfaces
213. Stage 213: Cross-Surface UX Correction After Stage 211
   - correct the remaining broad shell/Home/Graph/Study/Notes/Reader hierarchy issues in one bounded pass while preserving current product behavior
   - avoid Reader generation-logic changes and keep generated `Reflowed`, `Simplified`, and `Summary` behavior unchanged
214. Stage 214: Post-Stage-213 Cross-Surface Benchmark Audit
   - compare refreshed top-level and focused-split surfaces against the benchmark after the bounded cross-surface correction
   - confirm whether a narrower localized mismatch now leads instead of broad top-level incoherence
215. Stage 215: Focused Split-View Rebalancing After Stage 214
   - rebalance focused `Graph`, `Notes`, and `Study` so the live Reader remains more obviously primary during source-led work
   - preserve focused-source continuity, source handoffs, and current study/note/graph behavior
216. Stage 216: Post-Stage-215 Focused Split Benchmark Audit
   - compare refreshed focused-split captures against the benchmark after the Reader-primary rebalancing pass
   - confirm whether one remaining focused support column still meaningfully leads
217. Stage 217: Focused Study Support Column Deflation After Stage 216
   - compress the focused `Study` support column so it reads like a lighter secondary rail instead of a second dashboard
   - preserve study generation, grading, FSRS behavior, and Reader-led continuity
218. Stage 218: Post-Stage-217 Focused Study Benchmark Audit
   - compare refreshed focused `Study` captures against the benchmark after the support-column deflation pass
   - confirm whether the lead blocker shifts back to `Home` or another surface
219. Stage 219: Home Collection Selectivity And Reopen Hierarchy After Stage 218
   - make the default `Home` landing more selective with one clearer primary reopen path and a calmer nearby continuation list
   - preserve search/add-content behavior, focused-source handoff, and local-first collection semantics
220. Stage 220: Post-Stage-219 Home Benchmark Audit
   - compare refreshed `Home` and focused-source captures against the benchmark after the default-landing hierarchy pass
   - confirm whether `Home` still leads and whether the expanded `Earlier` state now carries the remaining mismatch
221. Stage 221: Home Expanded Earlier State Rebalancing After Stage 220
   - rebalance the expanded `Earlier` state so the reopened tail reads like a continuation of the calmer landing instead of an archive wall beside a tall lead card
   - preserve the Stage 219 default landing hierarchy and focused-source continuity
222. Stage 222: Post-Stage-221 Home Benchmark Audit
   - compare refreshed collapsed and expanded `Home` captures against the benchmark after the expanded-state rebalance
   - confirm whether any wide-desktop top-level surface still clearly leads or whether the roadmap should shift to the narrower-width shell issue
223. Stage 223: Narrower-Width Recall Shell Reflow Correction After Stage 222
   - keep the Recall rail and top shell compact at narrower desktop widths instead of letting them expand into a bulky wrapped top-grid panel
   - preserve the calmer wide-desktop shell, focused-source continuity, and current product behavior
224. Stage 224: Post-Stage-223 Narrower-Width Shell Audit
   - compare refreshed narrower-width shell captures against the calmer baseline after the shell/rail reflow correction
   - confirm whether the shell issue is closed and whether a narrower Reader-specific mismatch now leads
225. Stage 225: Narrower-Width Reader Chrome Compression After Stage 224
   - compress the narrower-width Reader header/control stack so the active text starts higher on the page without losing source context or Reader actions
   - preserve Reader generation behavior, source continuity, note actions, and speech controls
226. Stage 226: Post-Stage-225 Narrower-Width Reader Audit
   - compare refreshed narrower-width Reader captures against the calmer benchmark direction after the chrome-compression pass
   - confirm whether the remaining narrower-width mismatch is materially reduced or whether another localized follow-up is needed
227. Stage 227: Narrower-Width Focused-Source Strip Compression After Stage 226
   - compress the shared focused-source strip at the narrower breakpoint so it occupies less vertical space before active work begins
   - preserve source continuity, shared source-tab handoffs, and the Stage 225 Reader chrome gains
228. Stage 228: Post-Stage-227 Narrower-Width Focused-Source Audit
   - compare refreshed narrower-width focused-source captures against the calmer benchmark direction after the strip-compression pass
   - confirm whether the shared strip issue is closed or whether another localized narrower-width follow-up is needed
229. Stage 229: Narrower-Width Focused Split Rebalancing After Stage 228
   - rebalance narrower-width focused `Notes`, `Graph`, and `Study` layouts so Reader remains clearly primary instead of sharing equal weight with two cramped support columns
   - preserve the Stage 223 shell correction, the Stage 225 Reader gains, source continuity, and current focused-source handoffs
230. Stage 230: Post-Stage-229 Narrower-Width Focused Split Audit
   - compare refreshed narrower-width focused split captures against the calmer benchmark direction after the rebalancing pass
   - confirm whether the remaining narrow-width focused-work mismatch is materially reduced or whether another localized follow-up is needed
231. Stage 231: Narrower-Width Focused Study Queue Rail Deflation After Stage 230
   - reduce the remaining weight and height of the focused `Study` queue rail at the narrow breakpoint so Reader stays more clearly primary while the next-card context remains nearby
   - preserve Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, and current study behavior
232. Stage 232: Post-Stage-231 Narrower-Width Focused Study Audit
   - compare refreshed narrower-width focused `Study` captures against the calmer benchmark direction after the queue-rail deflation pass
   - confirm whether the remaining narrow-width focused-work mismatch is materially reduced or whether another localized follow-up is needed
233. Stage 233: Narrower-Width Focused Graph Detail Panel Deflation After Stage 232
   - reduce the remaining weight and height of the focused `Graph` detail panel at the narrow breakpoint so Reader stays more clearly primary while node actions remain nearby
   - preserve Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 231 focused `Study` gains, and current graph behavior
234. Stage 234: Post-Stage-233 Narrower-Width Focused Graph Audit
   - compare refreshed narrower-width focused `Graph` captures against the calmer benchmark direction after the detail-panel deflation pass
   - confirm whether the remaining narrow-width focused-work mismatch is materially reduced or whether another localized follow-up is needed
235. Stage 235: Narrower-Width Focused Study Active-Card Column Deflation After Stage 234
   - reduce the remaining weight and height of the focused `Study` active-card column at the narrow breakpoint so Reader stays more clearly primary while reveal and rating controls remain nearby
   - preserve Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 231 focused `Study` rail gains, Stage 233 focused `Graph` gains, and current study behavior
236. Stage 236: Post-Stage-235 Narrower-Width Focused Study Active-Card Audit
   - compare refreshed narrower-width focused `Study` captures against the calmer benchmark direction after the active-card deflation pass
   - confirm whether the remaining narrow-width focused-work mismatch is materially reduced or whether another localized follow-up is needed
237. Stage 237: Narrower-Width Focused Notes Empty-Detail Panel Deflation After Stage 236
   - reduce the remaining weight and height of the focused `Notes` empty-detail panel at the narrow breakpoint so Reader stays more clearly primary while note browsing stays nearby
   - preserve Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 231 focused `Study` rail gains, Stage 233 focused `Graph` gains, Stage 235 focused `Study` gains, and current notes behavior
238. Stage 238: Post-Stage-237 Narrower-Width Focused Notes Audit
   - compare refreshed narrower-width focused `Notes` captures against the calmer benchmark direction after the empty-detail deflation pass
   - confirm whether the remaining narrow-width focused-work mismatch is materially reduced or whether another localized follow-up is needed
239. Stage 239: Narrower-Width Focused Graph Detail-Stack Flattening After Stage 238
   - reduce the remaining weight and height of the focused `Graph` pre-mentions detail stack at the narrow breakpoint so Reader stays more clearly primary while node actions remain nearby
   - preserve Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 233 focused `Graph` gains, Stage 235 focused `Study` gains, Stage 237 focused `Notes` gains, and current graph behavior
240. Stage 240: Post-Stage-239 Narrower-Width Focused Graph Audit
   - compare refreshed narrower-width focused `Graph` captures against the calmer benchmark direction after the detail-stack flattening pass
   - confirm whether the remaining narrow-width focused-work mismatch is materially reduced or whether another localized follow-up is needed
241. Stage 241: Narrower-Width Focused Study Active-Card Stack Flattening After Stage 240
   - reduce the remaining weight and height of the focused `Study` pre-evidence active-card stack at the narrow breakpoint so Reader stays more clearly primary while reveal and grading actions remain nearby
   - preserve Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 231 focused `Study` rail gains, Stage 233 focused `Graph` gains, Stage 235 focused `Study` gains, Stage 237 focused `Notes` gains, and current study behavior
242. Stage 242: Post-Stage-241 Narrower-Width Focused Study Audit
   - compare refreshed narrower-width focused `Study` captures against the calmer benchmark direction after the active-card stack flattening pass
   - confirm whether the remaining narrow-width focused-work mismatch is materially reduced or whether another localized follow-up is needed
243. Stage 243: Narrower-Width Focused Graph Left-Rail Deflation After Stage 242
   - reduce the remaining weight and height of the focused `Graph` left rail at the narrow breakpoint so Reader stays more clearly primary while Browse and selected-node context remain nearby
   - preserve Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 237 focused `Notes` gains, Stage 239 focused `Graph` gains, Stage 241 focused `Study` gains, and current graph behavior
244. Stage 244: Post-Stage-243 Narrower-Width Focused Graph Audit
   - compare refreshed narrower-width focused `Graph` captures against the calmer benchmark direction after the left-rail deflation pass
   - confirm whether the remaining narrow-width focused-work mismatch is materially reduced or whether another localized follow-up is needed
245. Stage 245: Narrower-Width Focused Graph Node-Detail Header Deflation After Stage 244
   - reduce the remaining weight and height of the focused `Graph` node-detail header stack at the narrow breakpoint so Reader stays more clearly primary while confirm/reject actions remain nearby
   - preserve Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 237 focused `Notes` gains, Stage 239 focused `Graph` gains, Stage 241 focused `Study` gains, Stage 243 focused `Graph` gains, and current graph behavior
246. Stage 246: Post-Stage-245 Narrower-Width Focused Graph Audit
   - compare refreshed narrower-width focused `Graph` captures against the calmer benchmark direction after the node-detail header deflation pass
   - confirm whether the remaining narrow-width focused-work mismatch is materially reduced or whether another localized follow-up is needed
247. Stage 247: Narrower-Width Focused Study Right-Lane Bundle After Stage 246
   - batch the remaining focused `Study` right-lane reductions at the narrow breakpoint so Reader stays clearly primary while prompt, reveal, supporting evidence, and grounding context remain nearby
   - preserve Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 237 focused `Notes` gains, Stage 241 focused `Study` gains, Stage 245 focused `Graph` gains, and current study behavior
248. Stage 248: Post-Stage-247 Narrower-Width Focused Study Audit
   - compare refreshed narrower-width focused `Study` captures against the calmer benchmark direction after the bundled right-lane pass
   - confirm whether the remaining narrow-width focused-work mismatch is materially reduced or whether another localized follow-up is needed
249. Stage 249: Narrower-Width Focused Notes Empty-Detail Lane Collapse After Stage 248
   - collapse the remaining focused `Notes` empty-detail lane at the narrow breakpoint so Reader no longer shares space with a mostly blank right column when no note is active
   - preserve Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 237 focused `Notes` gains, Stage 245 focused `Graph` gains, Stage 247 focused `Study` gains, and current notes behavior
250. Stage 250: Post-Stage-249 Narrower-Width Focused Notes Audit
   - compare refreshed narrower-width focused `Notes` captures against the calmer benchmark direction after the empty-detail-lane collapse
   - confirm whether the remaining narrow-width focused-work mismatch is materially reduced or whether another localized follow-up is needed
251. Stage 251: Narrower-Width Focused Source-Overview Home-Rail Deflation After Stage 250
   - reduce the remaining weight of the focused source-overview `Home` rail at the narrow breakpoint so the summary canvas feels more clearly primary
   - preserve Stage 223 shell behavior, Stage 225 Reader gains, Stage 227 strip compression, Stage 229 split balance, Stage 245 focused `Graph` gains, Stage 247 focused `Study` gains, Stage 249 focused `Notes` gains, and current focused-source behavior
252. Stage 252: Post-Stage-251 Narrower-Width Focused Overview Audit
   - compare refreshed narrower-width focused overview captures against the calmer benchmark direction after the focused overview rail deflation pass
   - confirm whether the remaining narrow-width focused-work mismatch is materially reduced or whether another localized follow-up is needed

## Deferred Follow-Ups

- keep local TTS deferred as `coming soon`
- keep OCR for scanned or image-only PDFs deferred
- keep AI opt-in and limited to `Simplify` and `Summary`
- keep cloud sync, collaboration, and chat/Q&A out of scope unless explicitly reprioritized

## Working Rules

- `roadmap`, `master plan`, and `next milestone` mean this file unless explicitly redirected
- log detours in `docs/ROADMAP_ANCHOR.md`
- prefer shared-core work plus staged UX corrections when the current shell or flow gets in the way; preserve behaviors and local-first guarantees, not mediocre layout decisions
- return to the roadmap after blockers or corrections are resolved

## Recent Detours

- 2026-03-13: added Stage 0/1 planning artifacts, decision/risk/assumption/backlog logs, repo-fit notes, and future integration logs
- 2026-03-13: completed the first shared-core backend slice with `workspace.db`, legacy `reader.db` migration, shared tables, UUIDv7-style IDs for new shared records, and migration coverage in backend tests
- 2026-03-13: implemented and validated bounded public webpage snapshot import for article-style pages, including backend fetch/extraction, local HTML snapshot storage, frontend `Web page` disclosure, and delete-path cleanup for saved snapshots
- 2026-03-13: resumed the interrupted Stage 1 validation rerun, confirmed frontend and backend checks are green, and advanced the roadmap to the Stage 2 Recall shell slice
- 2026-03-13: completed the Stage 2 Recall shell slice and, by explicit user request, combined the Stage 3 graph milestone and Stage 4 retrieval/study milestone into one implementation pass
- 2026-03-13: completed the combined Stage 3/4 pass with local graph extraction, graph feedback, hybrid retrieval, source-grounded study cards, FSRS-backed review logs, backend/frontend coverage, and a live Edge-channel smoke run
- 2026-03-13: completed Stage 5 augmented browsing with a localhost-backed MV3 extension, browser-context retrieval heuristics, popup/options surfaces, extension coverage, and a live Edge unpacked-extension smoke run
- 2026-03-13: completed Stage 6 portability and accessibility integration with richer block/variant contracts, shared reader-session metadata, backend/frontend coverage, and a live Edge structured-Markdown/session-restore smoke run
- 2026-03-13: completed Stage 7 tablet-safe groundwork with workspace change-log APIs, portable attachment/export manifests, deterministic merge preview, backend/frontend coverage, and a localhost API smoke run
- 2026-03-13: completed Stage 8 hardening and benchmarks with workspace integrity/repair APIs, startup self-healing for drifted derived indexes, benchmark coverage, extension timeout hardening, and localhost integrity/repair validation
- 2026-03-13: published the Stage 1-8 closeout to `origin/codex/stage8-closeout-doc-sync`, synced touched assistant docs, and approved a Stage 9-11 roadmap extension focused on notes, browser capture, and portable apply flows
- 2026-03-13: completed a pre-Stage-9 stabilization detour that normalized local-service network errors, added retryable unavailable states in Recall and Reader, and validated outage/recovery behavior in Playwright before resuming the Stage 9 roadmap
- 2026-03-13: completed Stage 9 source-linked highlights and notes with shared note storage/search, Reader note capture and anchored jump-back, Recall note management, stale-session startup guards, full validation reruns, and a live Playwright temp-workspace smoke pass
- 2026-03-14: approved a bounded Stage 10 closeout extension to add a debug-only extension harness path, finish manual Edge companion validation, and then converge Reader onto the Recall-first shell before resuming the roadmap
- 2026-03-14: completed the Stage 10 closeout with bounded browser note capture, note-aware retrieval, a debug-only extension harness, and a real Edge unpacked-extension validation pass, then completed the Reader shell convergence correction with Recall-first UI realignment and product-label cleanup
- 2026-03-16: fixed a Recall section-refresh persistence bug by encoding the active `/recall` subsection in the route, so hard refresh now restores `Graph`, `Study`, and `Notes` instead of dropping back to `Home`
- 2026-03-14: completed a Reader-as-section parity follow-up that removed the remaining top-level `Recall | Reader` split, unified workspace tabs under Recall, restored prior-section return behavior after Reader handoff, kept no-document Settings reachable, and reran the full validation matrix plus the real Edge debug harness
- 2026-03-14: completed Stage 11 with portable `recall_note` manifest coverage, note-to-graph and note-to-study promotion flows, preservation of promoted manual knowledge across rebuilds, and a live localhost browser smoke that exposed and fixed the promoted-card Study landing bug
- 2026-03-14: approved a UX-first guidance correction so future roadmap work preserves local-first behavior, routes, anchors, and reading continuity while explicitly allowing shell, layout, and workflow changes whenever that improves Recall-quality UX
- 2026-03-14: completed the Stage 12 roadmap refresh with a live localhost UX audit, identified workflow polish as the highest-leverage gap, and opened Stage 13 for global add/search flow plus focused Reader split-view work
- 2026-03-14: completed Stage 13 with shell-level add/search actions, a unified workspace search dialog, a focused Reader split view with adjacent source/note context, a defensive Reader keyboard-shortcut fix, frontend validation reruns, live Edge import/search smokes, and a green rerun of the repo-owned Edge extension harness
- 2026-03-14: completed Stage 14 with denser shared shell chrome, richer sticky Reader current-source context, narrower-width layout tightening, a second-banner accessibility correction in the Reader toolbar, frontend validation reruns, and a repo-owned real Edge density smoke harness plus visual artifacts
- 2026-03-14: completed the Stage 17 UX refresh audit using the existing Stage 13-16 live artifacts, current shell/state architecture, the product brief, and the original Recall workflow benchmark, then opened Stage 18 to fix continuity and navigation memory instead of widening scope prematurely
- 2026-03-14: completed Stage 18 with app-level workspace continuity for Library, Notes, Graph, and Study, a repo-owned real Edge continuity smoke harness, and preserved section context across Reader handoff, browser-back flows, and search-backed landings, then opened Stage 19 to surface current context and recent-work switching in the shared Recall shell
- 2026-03-14: completed Stage 19 with a shared current-context dock, bounded recent-work switching, targeted frontend coverage, and a repo-owned real Edge shell-context smoke harness, then opened Stage 20 to compress redundant shell/detail context now that the right working-set information is visible
- 2026-03-14: completed Stage 20 with a section-aware shell dock compression pass, lighter Reader and Notes detail context, targeted frontend coverage, and a repo-owned real Edge context-compression smoke harness, then opened Stage 21 to reassess the live workspace before picking the next bounded implementation slice
- 2026-03-14: completed the Stage 21 UX refresh audit, identified duplicated and sessionless search as the highest-friction remaining workflow break, and opened Stage 22 to unify workspace search continuity before another shell or feature pass
- 2026-03-14: completed Stage 22 with one shared workspace-search session across the shell dialog and Library panel, selection-first focused-result actions, targeted frontend validation, and a repo-owned real Edge search-continuity smoke harness, then opened Stage 23 for a fresh post-search UX audit
- 2026-03-14: completed the Stage 23 UX refresh audit using the live post-search workspace, current shell/state architecture, the product brief, and current Recall benchmark material, then opened Stage 24 to bring saved-note work closer to Reader instead of widening search or shell scope again
- 2026-03-14: completed Stage 24 with a Reader notebook-style note workbench, in-place note editing and promotion, targeted frontend validation, and a repo-owned real Edge notebook-adjacency smoke harness, then opened Stage 25 for a fresh post-Stage-24 UX audit
- 2026-03-14: completed the Stage 25 UX refresh audit using the live post-Stage-24 workspace, current shell/state architecture, official Recall benchmark material, and current artifacts, then opened Stage 26 to unify source-focused work inside a source-centered detail frame instead of continuing section-local polish
- 2026-03-14: completed Stage 26 with a shared source-workspace frame across Recall and Reader, source-tab handoffs for `Overview`/`Reader`/`Notes`/`Graph`/`Study`, a continuity fix so stale Graph or Study detail no longer overrides the active source during source-focused transitions, targeted frontend validation, and a repo-owned real Edge source-workspace smoke harness
- 2026-03-14: completed the Stage 27 UX refresh audit using the live post-Stage-26 artifacts, the product brief, and current Recall docs/changelog direction, then opened Stage 28 to consolidate source tab content into a true shared source-pane system with lighter contextual collection browsing
- 2026-03-14: completed Stage 28 with a stronger source `Overview`, lighter contextual browse drawers for Library/Notes/Graph/Study during source-focused work, targeted frontend validation, and a repo-owned real Edge shared-source-pane smoke harness, then opened Stage 29 for a fresh post-Stage-28 UX audit
- 2026-03-14: completed the Stage 29 UX refresh audit using the live Stage 28 artifacts, current shell/state architecture, the product brief, and current Recall benchmark material, then opened Stage 30 to make active source work take over the workspace before adding more feature surface
- 2026-03-14: completed Stage 30 with a shell-owned source-focused mode, collapsible workspace support chrome, a repo-owned real Edge smoke harness, and live localhost recovery on both `127.0.0.1:8000` and `127.0.0.1:5173`, then opened Stage 31 for a fresh post-Stage-30 UX audit
- 2026-03-15: completed the Stage 31 UX refresh audit using the live Stage 30 artifacts, the product brief, and current Recall benchmark material, then opened Stage 32 to keep one source visible while related note, graph, and study work move into adaptable side panes
- 2026-03-15: completed Stage 32 with focused split-work layouts for source-local Notes, Graph, and Study, validated the slice with lint/build plus a repo-owned real Edge smoke, and then completed the Stage 33 UX audit to identify reader-led split work as the next highest-leverage correction
- 2026-03-15: completed Stage 34 with reader-led focused split work plus in-place evidence retargeting, then, by explicit user direction, completed a Stage 35 collection-first shell reset immediately afterward instead of waiting for the usual audit interstitial, and opened Stage 36 to audit the new shell before choosing the next bounded slice
- 2026-03-15: completed the Stage 36 shell audit using the user-shared benchmark, the product brief, live localhost inspection, and Stage 34 artifacts, then opened Stage 37 to stop populated `/recall` from auto-entering focused source mode and make collection-first landing behavior truly intentional
- 2026-03-15: completed Stage 37 with explicit browse-vs-focused source continuity, a browse-first Library landing, and a repo-owned real Edge validation pass, then opened Stage 38 to audit the calmer landing and choose the next bounded UI correction from the live result
- 2026-03-15: completed the Stage 38 audit with fresh live screenshots, confirmed the next bottleneck is visual hierarchy and responsive density rather than navigation entry behavior, fixed the user-reported contrast/overflow regressions, and opened Stage 39 for a bounded cleanup pass
- 2026-03-15: completed Stage 39 with a quieter Library top bar, wider responsive source cards, lighter focused Library framing, a repo-owned Stage 39 screenshot harness, and a green rerun of the Stage 37 browse-first smoke, then opened Stage 40 for a fresh post-implementation UX audit
- 2026-03-15: replaced the generic Stage 40 audit with a benchmark-driven Recall surface audit anchored to user-provided screenshots plus official Recall docs/blog/changelog sources, captured a fresh localhost benchmark set and matrix, and opened Stage 41 for shared-shell and surface convergence
- 2026-03-15: completed Stage 41 with a calmer shared shell, a two-zone Library landing, grouped add-source import modes, and quieter Graph/Study browse framing, then used a Stage 42 benchmark audit to lock Library/home selectivity and add-source hierarchy cleanup as the next bounded slice
- 2026-03-15: completed Stage 43 with a grouped, more selective Library landing and a single-heading add-content dialog, validated it with targeted tests plus a real Edge screenshot harness, and opened Stage 44 to choose the next bounded surface pass between Graph and Study
- 2026-03-15: completed the Stage 44 benchmark audit against the refreshed Stage 43 captures, confirmed Graph browse mode as the stronger remaining mismatch, folded in the user-requested `Home` terminology cleanup, and opened Stage 45 for the next bounded implementation slice
- 2026-03-15: completed Stage 45 with a graph-first browse canvas, lighter graph support chrome, user-facing `Home` terminology in the shared shell, targeted frontend validation, and a repo-owned real Edge screenshot harness, then opened Stage 46 for the next benchmark audit
- 2026-03-15: completed the Stage 46 benchmark audit against the refreshed Home, Graph, and Study captures, confirmed that Study is now the clearest remaining top-level mismatch, and opened Stage 47 for a centered review/start surface pass
- 2026-03-15: completed Stage 47 with a centered Study review/start surface, lighter supporting queue chrome, preserved reader-led focused Study work, targeted frontend validation, and a repo-owned real Edge screenshot harness, then opened Stage 48 for the next benchmark audit
- 2026-03-15: completed the Stage 48 benchmark audit against fresh Home, Graph, Study, and focused-Study captures, confirmed that Home is once again the clearest remaining benchmark mismatch after the Study rewrite, and opened Stage 49 for a bounded Home selective-landing second pass
- 2026-03-15: completed Stage 49 with a lighter Home support rail, explicit recency expansion controls, targeted Home coverage, frontend lint/build, and a repo-owned real Edge screenshot harness, then opened Stage 50 for the next benchmark audit
- 2026-03-15: completed the Stage 50 benchmark audit against fresh Home, Graph, Study, and focused-Study captures, confirmed that Study is once again the clearest remaining benchmark mismatch after the Home pass, and opened Stage 51 for a bounded Study sidebar and queue compression second pass
- 2026-03-15: completed Stage 51 with a lighter Study queue-control rail, explicit full-queue reveal controls, a shorter review-stage explainer, targeted Study coverage, frontend lint/build, and a repo-owned real Edge screenshot harness, then opened Stage 52 for the benchmark audit
- 2026-03-15: completed the Stage 52 benchmark audit against fresh Home, Graph, Study, and focused-Study captures, confirmed that Study is materially closer but still the clearest remaining mismatch, and opened Stage 53 for a bounded default-queue-collapse and stage-shell-minimization pass
- 2026-03-16: completed Stage 85 with a same-section `Keep going` follow-on reopen flow that fills the lower Home canvas without reviving the old archive wall, validated it with targeted plus broad frontend coverage and fresh real Edge captures, and opened Stage 86 for the next benchmark audit
- 2026-03-16: completed the Stage 86 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is no longer the clearest blocker, and opened Stage 87 for a bounded Study dock-and-review-canvas pass
- 2026-03-16: completed Stage 87 with a slimmer Study session dock, a shorter browse-mode review frame, targeted plus broad frontend validation, and fresh real Edge captures, and opened Stage 88 for the next benchmark audit
- 2026-03-16: completed the Stage 88 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Study is no longer the clearest blocker, and opened Stage 89 for a bounded Home utility/search-rail and landing-header pass
- 2026-03-16: completed Stage 89 with a flatter Home utility/search rail, a tighter header-to-reopen handoff, targeted plus broad frontend validation, and fresh real Edge captures, and opened Stage 90 for the next benchmark audit
- 2026-03-16: completed the Stage 90 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home still remains the clearest blocker after Stage 89, and opened Stage 91 for a bounded header-merge and first-reopen lift pass
- 2026-03-16: completed Stage 91 with a merged no-resume Home header and first-reopen handoff, kept Study, Graph, and focused Study stable in fresh real Edge captures, and opened Stage 92 for the next benchmark audit
- 2026-03-16: completed the Stage 92 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is no longer the clearest blocker after Stage 91, and opened Stage 93 for a bounded Study dock-and-review-header pass
- 2026-03-16: completed Stage 93 with a quieter Study session dock, a shorter pre-answer review header, targeted plus broad frontend validation, and fresh real Edge captures, and opened Stage 94 for the next benchmark audit
- 2026-03-16: completed the Stage 94 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Study is no longer the clearest blocker after Stage 93, and opened Stage 95 for a bounded Home find-later-column and saved-sources-intro pass
- 2026-03-16: completed Stage 95 with a quieter Home utility/search column, a shorter saved-sources intro, targeted plus broad frontend validation, and fresh real Edge captures, and opened Stage 96 for the next benchmark audit
- 2026-03-16: completed the Stage 96 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home still remains the clearest blocker after Stage 95, and opened Stage 97 for a bounded Home utility-column-collapse and header-action-demotion pass
- 2026-03-16: completed Stage 97 with a quieter Home utility/search dock, a calmer merged `Saved sources` handoff, targeted plus broad frontend validation, and fresh real Edge captures, and opened Stage 98 for the next benchmark audit
- 2026-03-16: completed the Stage 98 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home still remains the clearest blocker after Stage 97, and opened Stage 99 for a bounded Home support-dock and saved-sources-preamble follow-up
- 2026-03-16: completed Stage 99 with quieter Home support/search copy, a shorter merged saved-sources preamble, targeted plus broad frontend validation, and fresh real Edge captures that materially calmed the Home landing
- 2026-03-16: completed the Stage 100 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home still remains the clearest blocker after Stage 99, and opened Stage 101 for a more structural Home support-utility-inlining and saved-sources-preamble-removal pass
- 2026-03-16: completed Stage 101 with an inline Home utility header, no saved-sources preamble above the first featured reopen flow, targeted plus broad frontend validation, and fresh real Edge captures that materially calmed the Home landing
- 2026-03-16: completed the Stage 102 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home still remains the clearest blocker after Stage 101 because the upper landing setup still reads as split staged zones, and opened Stage 103 for a bounded landing-header-collapse and inline-search-demotion pass
- 2026-03-16: completed Stage 103 with a compact Home heading-and-snapshot row, quieter inline search/add utility treatment, targeted plus broad frontend validation, and fresh real Edge captures, then opened Stage 104 for the next benchmark audit
- 2026-03-16: completed the Stage 104 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is no longer the clearest blocker after Stage 103, and opened Stage 105 for a bounded Study session-rail-demotion and review-canvas-recentering pass
- 2026-03-16: completed Stage 105 with a lighter top support strip for browse-mode Study, a more centered review canvas, targeted plus broad frontend validation, fresh real Edge captures, and the Stage 106 audit harness for the next benchmark decision
- 2026-03-16: completed the Stage 106 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Study is no longer the clearest blocker after Stage 105, and opened Stage 107 for a bounded Home featured-flow-unification and lower-canvas-compaction pass
- 2026-03-16: completed Stage 107 with a lighter Home continuation flow, targeted plus broad frontend validation, fresh real Edge captures, and the Stage 108 audit harness for the next benchmark decision
- 2026-03-16: completed the Stage 108 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home still remains the clearest blocker after Stage 107, and opened Stage 109 for a bounded spotlight-footprint-reduction and utility-header-softening pass
- 2026-03-16: completed Stage 109 with a tighter Home spotlight, quieter inline utility/search row, targeted plus broad frontend validation, fresh real Edge captures, and the Stage 110 audit harness for the next benchmark decision
- 2026-03-16: completed the Stage 110 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home still remains the clearest blocker after Stage 109 because the opening still reads as a split stage, and opened Stage 111 for a bounded Home opening-stage-unification and nearby-flow-lift pass
- 2026-03-16: completed Stage 111 with a unified Home opening flow, compact left-side snapshot counts, targeted plus broad frontend validation, fresh real Edge captures, and the Stage 112 audit harness for the next benchmark decision
- 2026-03-16: completed the Stage 112 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Study now leads the remaining mismatch list after Stage 111, and opened Stage 113 for a bounded Study support-strip-demotion and review-card-lift pass
- 2026-03-16: completed Stage 113 with an in-flow Study support strip, a higher browse-mode review card landing, targeted plus broad frontend validation, fresh real Edge captures, and the Stage 114 audit harness for the next benchmark decision
- 2026-03-16: completed the Stage 114 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home now leads the remaining mismatch list again after Stage 113, and opened Stage 115 for a bounded Home continuation-handoff-tightening and lower-reopen-row-compaction pass
- 2026-03-16: completed Stage 115 with a tighter Home continuation handoff, flatter lower reopen rows, targeted plus broad frontend validation, fresh real Edge captures, and the Stage 116 audit harness for the next benchmark decision
- 2026-03-16: completed the Stage 116 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home still leads the remaining mismatch list after Stage 115, and opened Stage 117 for a bounded lower-canvas-fill and reveal-control-integration pass
- 2026-03-16: completed Stage 117 with an integrated Home reveal control inside the continuation flow, a fuller lower landing finish, targeted plus broad frontend validation, fresh real Edge captures, and the Stage 118 audit harness for the next benchmark decision
- 2026-03-16: completed the Stage 118 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is no longer the clearest blocker after Stage 117, and opened Stage 119 for a bounded Study support-strip-minimization and review-canvas-tightening pass
- 2026-03-16: completed Stage 119 with a lighter in-card Study support strip, a tighter review-card landing, targeted plus broad frontend validation, fresh real Edge captures, and the Stage 120 audit harness for the next benchmark decision
- 2026-03-16: completed the Stage 120 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Study is no longer the clearest blocker after Stage 119, and opened Stage 121 for a bounded Home opening-spotlight-compaction and nearby-flow-flattening pass
- 2026-03-16: completed Stage 121 with a lighter Home opening spotlight, flatter nearby reopen rows, targeted plus broad frontend validation, fresh real Edge captures, and the Stage 122 audit harness for the next benchmark decision
- 2026-03-16: completed the Stage 122 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is no longer the clearest blocker after Stage 121, and opened Stage 123 for a bounded Study support-strip-collapse and review-card-expansion pass
- 2026-03-16: completed Stage 123 with a quieter toolbar-level Study utility row, a wider review-card landing, targeted plus broad frontend validation, fresh real Edge captures, and the Stage 124 audit harness for the next benchmark decision
- 2026-03-16: completed the Stage 124 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Study is no longer the clearest blocker after Stage 123, and opened Stage 125 for a bounded Home continuation-band-elevation and reveal-card-demotion pass
- 2026-03-16: completed Stage 125 with a softer lower Home continuation band, a quieter reveal footer control, targeted plus broad frontend validation, fresh real Edge captures, and the Stage 126 audit harness for the next benchmark decision
- 2026-03-16: completed the Stage 126 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is no longer the clearest blocker after Stage 125, and opened Stage 127 for a bounded Study support-strip-removal and review-canvas-lift pass
- 2026-03-16: completed Stage 127 by removing the ghost Study support strip from browse mode, lifting the review card higher into the page, validating with targeted plus broad frontend coverage and fresh real Edge captures, and then opened Stage 128 for the next benchmark audit
- 2026-03-16: completed the Stage 128 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Study no longer leads after the ghost-strip removal, identified Home as the new clearest blocker because the landing still reads as one boxed archive panel with repeated row/meta chrome, and opened Stage 129 for a bounded Home collection-frame-flattening and row-meta-demotion pass
- 2026-03-16: completed Stage 129 with a flatter Home landing shell, quieter row/meta treatment, targeted and broad frontend validation, a rerun real Edge screenshot capture after the production build, and the Stage 130 audit harness for the next benchmark decision
- 2026-03-16: completed the Stage 130 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home still leads after the flattening pass because the landing still reads as one broad boxed ledger with a strong right-side date gutter, and opened Stage 131 for a bounded Home collection-unboxing and date-gutter-collapse pass
- 2026-03-16: completed Stage 131 by unboxing the remaining Home collection shell, collapsing Home row dates into inline meta, validating with targeted plus broad frontend coverage and fresh real Edge captures, and then opened Stage 132 for the next benchmark audit
- 2026-03-16: completed the Stage 132 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home no longer leads after the Stage 131 pass, identified Graph as the clearest remaining mismatch because its support rail and detail overlay still over-frame the canvas, and opened Stage 133 for a bounded Graph support-rail-collapse and detail-overlay-compaction pass
- 2026-03-16: completed Stage 133 by collapsing the Graph support rail, tightening quick picks, compacting the selected-node overlay, validating with targeted plus broad frontend coverage and fresh real Edge captures, and then opened Stage 134 for the next benchmark audit
- 2026-03-16: completed the Stage 134 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Graph is materially closer after Stage 133 but still leads because the quick-pick rail remains too card-heavy and the overlay still occupies too much of the stage, and opened Stage 135 for a bounded Graph quick-pick-rail-slimming and overlay-footprint-reduction pass
- 2026-03-16: completed Stage 135 by slimming the Graph quick-pick rail into a lighter selector strip, shrinking the default selected-node overlay while keeping one grounded mention visible, validating with targeted plus broad frontend coverage and fresh real Edge captures, and then opened Stage 136 for the next benchmark audit
- 2026-03-16: completed the Stage 136 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Graph is materially closer after Stage 135 but still leads because the left rail still opens with stacked metrics and a longer-than-needed quick-pick list, and opened Stage 137 for a bounded Graph utility-metrics-collapse and quick-pick-truncation pass
- 2026-03-16: completed Stage 137 by collapsing the Graph rail metrics into one glance summary, shortening the default quick-pick stack, validating with targeted plus broad frontend coverage and fresh real Edge captures, and then opened Stage 138 for the next benchmark audit
- 2026-03-16: completed the Stage 138 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Graph still leads but more narrowly because the remaining mismatch is now the left selector strip's search/glance/quick-pick stack, and opened Stage 139 for a bounded Graph selector-strip-flattening and glance-stack-compaction pass
- 2026-03-16: completed Stage 139 by flattening the remaining Graph selector strip into a lighter search-plus-glance utility layer, slimming the quick-pick framing, validating with targeted plus broad frontend coverage and fresh real Edge captures, and then opened Stage 140 for the next benchmark audit
- 2026-03-16: completed the Stage 140 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Graph still leads after Stage 139 because duplicated intro framing and the right-side selected-node overlay still over-frame the canvas, and opened Stage 141 for a bounded Graph intro-shell-demotion and detail-overlay-compaction pass
- 2026-03-16: completed Stage 141 by collapsing the remaining Graph intro shell into a lighter inline surface note, compacting the selected-node overlay, validating with targeted plus broad frontend coverage and fresh real Edge captures, and then opened Stage 142 for the next benchmark audit
- 2026-03-16: completed the Stage 142 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Graph still leads after Stage 141 but now mainly because the left quick-pick strip and fully open detail overlay still frame the canvas like a support dashboard, and opened Stage 143 for a bounded Graph support-framing-collapse and detail-peek-default pass
- 2026-03-16: completed Stage 143 by flattening the remaining Graph quick-pick card treatment into a lighter utility list, reducing the selected-node detail to a smaller default peek state, validating with targeted plus broad frontend coverage and fresh real Edge captures, and then opened Stage 144 for the next benchmark audit
- 2026-03-16: completed the Stage 144 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home now leads because the landing still reads as one oversized lead band followed by sparse lower continuation and too much empty lower canvas, and opened Stage 145 for a bounded Home lead-card-deflation and lower-canvas-continuation-fill pass
- 2026-03-16: completed Stage 145 by splitting the Home lead band into a calmer lead-plus-nearby frame, moving the grouped reveal action into the lower continuation grid, validating with targeted plus broad frontend coverage and fresh real Edge captures, and then opened Stage 146 for the next benchmark audit
- 2026-03-16: completed the Stage 146 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially closer after Stage 145 and that Graph now leads because the selector strip and selected-node dock still over-frame the canvas, and opened Stage 147 for a bounded Graph selector-rail-narrowing and detail-dock-slimming pass
- 2026-03-16: completed Stage 147 by narrowing the Graph selector rail, trimming the default quick-pick stack, slimming the selected-node detail dock, validating with targeted plus broad frontend coverage and fresh real Edge captures, and then opened Stage 148 for the next benchmark audit
- 2026-03-16: completed the Stage 148 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Graph is materially calmer and no longer leads after the selector-rail/detail-dock pass, and opened Stage 149 for a bounded Home opening-cluster-compaction and lower-canvas-fill pass
- 2026-03-16: completed Stage 149 by compacting the no-resume Home opening cluster into a slimmer lead-plus-one-nearby frame, extending the lower continuation before the reveal card, validating with targeted plus broad frontend coverage, lint/build, a Stage 150 harness check, and fresh real Edge captures, and then opened Stage 150 for the next benchmark audit
- 2026-03-16: completed the Stage 150 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer but still leads more narrowly because the lower continuation still ends too quickly and the reveal card still reads too boxed, and opened Stage 151 for a bounded Home continuation-grid-fill and reveal-card-demotion pass
- 2026-03-16: completed Stage 151 by extending the Home continuation grid, demoting the reveal into a lighter footer affordance, validating with targeted plus broad frontend coverage, lint/build, a Stage 152 harness check, and fresh real Edge captures, and then opened Stage 152 for the next benchmark audit
- 2026-03-16: completed the Stage 152 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 151 but still leads more narrowly because the boxed spotlight and separate `Keep going` restart still stage the landing, and opened Stage 153 for a bounded Home spotlight-deflation and follow-on-header-demotion pass
- 2026-03-16: completed Stage 153 by flattening the Home spotlight into a quieter overline-led lead row, demoting the `Keep going` restart into a muted continuation line, validating with targeted plus broad frontend coverage, lint/build, a Stage 154 harness check, and fresh real Edge captures, and then opened Stage 154 for the next benchmark audit
- 2026-03-16: completed the Stage 154 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 153 but still leads more narrowly because the opening still reads as a split lead-plus-support stage, and opened Stage 155 for a bounded Home opening-column-collapse and support-row-inline-merge pass
- 2026-03-16: completed Stage 155 by collapsing the Home opening split into one calmer stacked flow, softening the nearby support row into the same opening sequence, validating with targeted plus broad frontend coverage, lint/build, a Stage 156 harness check, and fresh real Edge captures, and then opened Stage 156 for the next benchmark audit
- 2026-03-16: completed the Stage 156 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 155 but still leads more narrowly because the opening still reads like a spotlight row and the continuation still ends with a separate reveal endpoint, and opened Stage 157 for a bounded Home lead-row-flattening and footer-reveal-inline-merge pass
- 2026-03-16: completed Stage 157 by flattening the remaining Home lead row and moving the grouped reveal action into the continuation list, validating with targeted plus broad frontend coverage, lint/build, a Stage 158 harness check, and fresh real Edge captures, and then opened Stage 158 for the next benchmark audit
- 2026-03-16: completed the Stage 158 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 157 but still leads more narrowly because the opening still reads like a deliberate pair and the lower continuation stays too sparse, and opened Stage 159 for a bounded Home opening-pair-equalization and continuation-density-lift pass
- 2026-03-16: completed Stage 159 by equalizing the remaining Home opening pair into one lead row, lifting the visible continuation density before the inline reveal row, validating with targeted plus broad frontend coverage, lint/build, a Stage 160 harness check, and fresh real Edge captures, and then opened Stage 160 for the next benchmark audit
- 2026-03-16: completed the Stage 160 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 159 but still leads more narrowly because the top still reads like a singled-out lead row and the visible continuation still ends too soon, and opened Stage 161 for a bounded Home lead-row-demotion and visible-continuation-extension pass
- 2026-03-16: completed Stage 161 by pulling the merged Home lead row into the shared continuation grid, extending the visible reopen carry before the inline reveal row, validating with targeted plus broad frontend coverage, lint/build, a Stage 162 harness check, and fresh real Edge captures, and then opened Stage 162 for the next benchmark audit
- 2026-03-16: completed the Stage 162 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 161 but still leads more narrowly because the `Start here` kicker and `Show all ...` reveal row still bracket the grid too strongly, and opened Stage 163 for a bounded Home start-here-kicker-demotion and reveal-row-deflation pass
- 2026-03-16: completed Stage 163 by moving the remaining `Start here` cue into quieter inline meta, flattening the `Show all ...` control into a footer-style reveal row, validating with targeted plus broad frontend coverage, lint/build, a Stage 164 harness check, and fresh real Edge captures, and then opened Stage 164 for the next benchmark audit
- 2026-03-16: completed the Stage 164 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 163 but still leads more narrowly because the first cell still carries an extra lead cue and the footer reveal still splits attention across the lower edge, and opened Stage 165 for a bounded Home lead-row-meta-equalization and reveal-footer-utility-merge pass
- 2026-03-16: completed Stage 165 by removing the extra visible first-row cue, merging the reveal footer utility into one calmer continuation line, validating with targeted plus broad frontend coverage, lint/build, a Stage 166 harness check, and fresh real Edge captures, and then opened Stage 166 for the next benchmark audit
- 2026-03-16: completed the Stage 166 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 165 but still leads more narrowly because the landing still ends too soon and leaves too much empty lower canvas, and opened Stage 167 for a bounded Home visible-continuation-extension and lower-canvas-fill pass
- 2026-03-16: completed Stage 167 by extending the visible Home continuation and filling more of the lower canvas before the reveal row, validating with targeted plus broad frontend coverage, lint/build, a Stage 168 harness check, and fresh real Edge captures, and then opened Stage 168 for the next benchmark audit
- 2026-03-17: completed the Stage 168 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 167 but still leads more narrowly because the reveal row still arrives too early and the landing still leaves too much empty lower canvas after the visible continuation, and opened Stage 169 for a bounded Home continuation-density-lift and reveal-row-pushdown pass
- 2026-03-17: completed Stage 169 by lifting the visible Home continuation density and pushing the reveal row lower, validating with targeted plus broad frontend coverage, lint/build, a Stage 170 harness check, and fresh real Edge captures, and then opened Stage 170 for the next benchmark audit
- 2026-03-17: completed the Stage 170 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 169 but still leads more narrowly because the visible continuation still ends too soon and the reveal row still lands above too much empty lower canvas, and opened Stage 171 for a bounded Home continuation-carry-extension and reveal-row-delay pass
- 2026-03-17: completed Stage 171 by carrying the visible Home continuation farther and delaying the reveal row, validating with targeted plus broad frontend coverage, lint/build, a Stage 172 harness check, and fresh real Edge captures, and then opened Stage 172 for the next benchmark audit
- 2026-03-17: completed the Stage 172 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 171 but still leads more narrowly because the visible continuation still ends too soon and the reveal row still lands above too much empty lower canvas, and opened Stage 173 for a bounded Home continuation-tail-extension and reveal-footer-pushdown pass
- 2026-03-17: completed Stage 173 by carrying the visible Home continuation tail farther and pushing the reveal footer lower, validating with targeted plus broad frontend coverage, lint/build, a Stage 174 harness check, and fresh real Edge captures, and then opened Stage 174 for the next benchmark audit
- 2026-03-17: completed the Stage 174 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 173 but still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas, and opened Stage 175 for a bounded Home continuation-tail-density-lift and reveal-footer-delay pass
- 2026-03-17: completed Stage 175 by lifting the visible Home continuation tail again and delaying the reveal footer, validating with targeted plus broad frontend coverage, lint/build, Stage 175/176 harness checks, and fresh real Edge captures, and then opened Stage 176 for the next benchmark audit
- 2026-03-17: completed the Stage 176 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 175 but still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas, and opened Stage 177 for a bounded Home tail-carry-extension and reveal-footer-lowering pass
- 2026-03-17: completed Stage 177 by carrying the visible Home continuation farther and lowering the reveal footer, validating with targeted plus broad frontend coverage, lint/build, Stage 177/178 harness checks, and fresh real Edge captures, and then opened Stage 178 for the next benchmark audit
- 2026-03-17: completed the Stage 178 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 177 but still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas, and opened Stage 179 for a bounded Home tail-density-lift and reveal-footer-pushdown pass
- 2026-03-17: completed Stage 179 by carrying slightly more visible Home continuation through the landing tail and pushing the reveal footer lower, validating with targeted plus broad frontend coverage, lint/build, Stage 179/180 harness checks, and fresh real Edge captures, and then opened Stage 180 for the next benchmark audit
- 2026-03-17: completed the Stage 180 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 179 but still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas, and opened Stage 181 for a bounded Home tail-carry-extension and reveal-footer-delay pass
- 2026-03-17: completed Stage 181 by carrying the visible Home continuation farther and delaying the reveal footer, validating with targeted plus broad frontend coverage, lint/build, Stage 181/182 harness checks, and fresh real Edge captures, and then opened Stage 182 for the next benchmark audit
- 2026-03-17: completed the Stage 182 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 181 but still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas, and opened Stage 183 for a bounded Home continuation-tail-extension and reveal-footer-lowering pass
- 2026-03-17: completed Stage 183 by carrying one more visible Home continuation item through the landing tail and lowering the reveal footer, validating with focused plus broad frontend coverage, lint/build, Stage 183/184 harness checks, and fresh real Edge captures, and then opened Stage 184 for the next benchmark audit
- 2026-03-17: completed the Stage 184 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 183 but still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas, and opened Stage 185 for a bounded Home tail-carry-extension and reveal-footer-lowering pass
- 2026-03-17: completed Stage 185 by carrying one more visible Home continuation item through the landing tail and lowering the reveal footer, validating with focused plus broad frontend coverage, lint/build, Stage 185/186 harness checks, and fresh real Edge captures, and then opened Stage 186 for the next benchmark audit
- 2026-03-17: completed the Stage 186 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 185 but still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas, and opened Stage 187 for a bounded Home tail-density-lift and reveal-footer-pushdown pass
- 2026-03-17: completed Stage 187 by carrying one more visible Home continuation item through the landing tail and lowering the reveal footer, validating with focused plus broad frontend coverage, lint/build, Stage 187/188 harness checks, and fresh real Edge captures, and then opened Stage 188 for the next benchmark audit
- 2026-03-17: completed the Stage 188 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 187 but still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas, and opened Stage 189 for a bounded Home tail-carry-extension and reveal-footer-delay pass
- 2026-03-17: completed Stage 189 by carrying one more visible Home continuation item through the landing tail and delaying the reveal footer, validating with focused plus broad frontend coverage, lint/build, Stage 189/190 harness checks, and fresh real Edge captures, and then opened Stage 190 for the next benchmark audit
- 2026-03-17: completed the Stage 190 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 189 but still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas, and opened Stage 191 for a bounded Home tail-density-lift and reveal-footer-pushdown pass
- 2026-03-17: completed Stage 191 by carrying one more visible Home continuation item through the landing tail and lowering the reveal footer, validating with focused plus broad frontend coverage, lint/build, Stage 191/192 harness checks, and fresh real Edge captures, and then opened Stage 192 for the next benchmark audit
- 2026-03-17: completed the Stage 192 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 191 but still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas, and opened Stage 193 for a bounded Home tail-carry-extension and reveal-footer-delay pass
- 2026-03-17: completed Stage 193 by carrying one more visible Home continuation item through the landing tail and delaying the reveal footer, validating with focused plus broad frontend coverage, lint/build, Stage 193/194 harness checks, and fresh real Edge captures, and then opened Stage 194 for the next benchmark audit
- 2026-03-17: completed the Stage 194 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 193 but still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas, and opened Stage 195 for a bounded Home tail-density-lift and reveal-footer-pushdown pass
- 2026-03-17: completed Stage 195 by carrying slightly more visible Home continuation through the landing tail and lowering the reveal footer, validating with focused plus broad frontend coverage, lint/build, Stage 195/196 harness checks, and fresh real Edge captures, and then opened Stage 196 for the next benchmark audit
- 2026-03-17: completed the Stage 196 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 195 but still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas, and opened Stage 197 for a bounded Home tail-carry-extension and reveal-footer-delay pass
- 2026-03-17: completed Stage 197 by carrying the visible Home continuation farther through the landing tail and delaying the reveal footer, validating with focused plus broad frontend coverage, lint/build, Stage 197/198 harness checks, and fresh real Edge captures, and then opened Stage 198 for the next benchmark audit
- 2026-03-17: completed the Stage 198 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home is materially calmer after Stage 197 but still leads more narrowly because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas, and opened Stage 199 for a bounded Home tail-density-lift and reveal-footer-pushdown pass
- 2026-03-17: completed Stage 199 by carrying slightly more visible Home continuation through the landing tail and pushing the reveal footer lower again, validating with focused plus broad frontend coverage, lint/build, Stage 199/200 harness checks, and a fresh real Edge capture where Study and focused Study stayed byte-stable while Graph rerendered without material visual drift, and then opened Stage 200 for the next benchmark audit
- 2026-03-17: completed the Stage 200 benchmark audit against fresh Home, Study, Graph, and focused-Study captures, confirmed that Home still leads more narrowly after Stage 199 because the visible continuation tail still ends too soon and the reveal footer still lands above too much empty lower canvas, verified that the Stage 199 Graph and Stage 200 Study rerenders did not introduce material visual drift, and initially opened a narrow Stage 201 Home follow-up before the later same-day cadence readjustment widened it into the bundled landing-endpoint convergence pass
- 2026-03-17: readjusted the roadmap cadence into moderate bundled dominant-surface mode for the current `Home` work: keep early cross-surface audits while the lead blocker moves, but once one surface remains dominant across repeated audits, batch 2-3 related fixes before the next full audit; Stage 201 is now the bundled Home landing-endpoint convergence pass and Stage 202 is the pre-staged next benchmark audit
- 2026-03-17: completed Stage 201 by extending the visible Home landing tail in one bundled pass, delaying the reveal footer, lightly calming lower-tail spacing and meta, validating with focused plus broad frontend coverage, lint/build, Stage 201/202 harness checks, and a fresh real Edge capture where Graph and focused Study stayed byte-stable while Study rerendered without material visual drift, and then promoted Stage 202 as the current benchmark audit
- 2026-03-17: completed the Stage 202 benchmark audit against fresh Home, Graph, Study, and focused-Study captures, confirmed that Home no longer leads after the bundled Stage 201 landing-endpoint convergence pass, verified that Graph and Study rerenders did not introduce material visual drift, and opened Stage 203 plus pre-staged Stage 204 for the next bounded Graph browse-mode correction
- 2026-03-17: completed Stage 203 by slimming the Graph selector rail, reducing default quick-pick framing, softening the selected-node detail dock, validating with focused plus broad frontend coverage, lint/build, Stage 203/204 harness checks, and a fresh real Edge capture where Home and focused Study matched Stage 202 exactly while Study rerendered without material visual drift, and then promoted Stage 204 as the current benchmark audit
- 2026-03-17: completed the Stage 204 benchmark audit against fresh Home, Graph, Study, and focused-Study captures, confirmed that the rerun matched Stage 203 exactly without drift, and kept Graph as the leading mismatch because the selector strip and selected-node dock still bracket the canvas like standing support columns
- 2026-03-17: completed Stage 205 by merging the Graph glance into the selector-strip picker bar, shortening the default quick-pick stack, and deflating the default selected-node peek, validating with focused plus broad frontend coverage, lint/build, Stage 205/206 harness checks, and a fresh real Edge capture where Home, Study, and focused Study matched Stage 204 exactly, and then promoted Stage 206 as the current benchmark audit
- 2026-03-17: completed the Stage 206 benchmark audit against fresh Home, Graph, Study, and focused-Study captures, confirmed that Home, Study, and focused Study matched Stage 205 exactly, verified that the Graph rerender did not introduce material visual drift, and opened Stage 207 plus pre-staged Stage 208 for the next bounded Graph browse-mode correction
- 2026-03-17: completed Stage 207 by collapsing the open Graph selector strip into one lighter search-plus-toggle utility row and demoting default selected-node confidence/status into the summary, validating with focused plus broad frontend coverage, lint/build, Stage 207/208 harness checks, and a fresh real Edge capture where Home, Study, and focused Study stayed stable, and then promoted Stage 208 as the current benchmark audit
- 2026-03-17: completed the Stage 208 benchmark audit against fresh Home, Graph, Study, and focused-Study captures, confirmed that the full capture set matched Stage 207 without drift, verified that Graph still leads because the browse canvas remains bracketed by a standing selector strip and a persistent right detail peek, and opened Stage 209 plus pre-staged Stage 210 for the next bounded Graph browse-mode correction
- 2026-03-17: completed Stage 209 by narrowing the open Graph selector strip and reducing the default selected-node peek footprint, validating with focused plus broad frontend coverage, lint/build, Stage 209/210 harness checks, and a fresh real Edge capture where Home, Study, and focused Study stayed byte-stable, and then promoted Stage 210 as the current benchmark audit
- 2026-03-17: completed the Stage 210 benchmark audit against fresh Home, Graph, Study, and focused-Study captures, confirmed that Home and focused Study matched Stage 209 exactly, verified that the Study rerender did not introduce material visual drift, and kept Graph as the leading mismatch because the selector strip still reads like a standing utility column while the default detail peek still brackets the canvas
- 2026-03-17: completed Stage 211 by collapsing the remaining Graph utility stack and softening the default detail peek inside the broader cross-surface correction handoff, validating with focused plus broad frontend coverage and preserving current Graph behavior
- 2026-03-17: completed the Stage 212 benchmark audit through the approved cross-surface readjustment, confirmed that the project would benefit more from one bounded shell/Home/Graph/Study/Notes/Reader correction than another Graph-only micro-pass, and opened Stage 213 plus pre-staged Stage 214 for that broader UX correction
- 2026-03-17: completed Stage 213 with the bounded cross-surface UX correction across shell/Home/Graph/Study/Notes/Reader, preserving current product behavior and Reader generation rules, validating with targeted tests, lint/build, and fresh real Edge captures, and then promoted Stage 214 as the current benchmark audit
- 2026-03-17: completed the Stage 214 benchmark audit against refreshed Home, Graph browse, Study browse, Notes browse/detail, Reader, and focused split-view captures, confirmed that the broad coherence pass succeeded overall, and opened Stage 215 plus pre-staged Stage 216 for a focused split-view rebalancing pass
- 2026-03-17: completed Stage 215 by compacting the focused source strip and rebalancing focused `Graph`, `Notes`, and `Study` support panes so the Reader stays more obviously primary, validating with targeted plus broad frontend coverage, lint/build, Stage 215/216 harness checks, and fresh real Edge captures, and then promoted Stage 216 as the current benchmark audit
- 2026-03-17: completed the Stage 216 benchmark audit against refreshed focused split-view captures, confirmed that the Stage 215 rebalancing succeeded overall without disturbing the Stage 213 shell/Home/Reader gains, and opened Stage 217 plus pre-staged Stage 218 for a focused `Study` support-column deflation pass
- 2026-03-17: completed Stage 217 by deflating focused `Study` into a lighter secondary rail with one selected evidence panel, validating with targeted plus broad frontend coverage, lint/build, Stage 217/218 harness checks, and fresh real Edge captures, and then promoted Stage 218 as the current benchmark audit
- 2026-03-17: completed the Stage 218 benchmark audit against refreshed focused `Study` captures, confirmed that the support-column deflation succeeded overall, and opened Stage 219 plus pre-staged Stage 220 for a return to `Home` collection selectivity and reopen hierarchy
- 2026-03-17: completed Stage 219 by making the default `Home` landing more selective with one clearer primary reopen path and a calmer nearby continuation list, validating with targeted plus broad frontend coverage, lint/build, Stage 219/220 harness checks, and fresh real Edge captures, and then promoted Stage 220 as the current benchmark audit
- 2026-03-17: completed the Stage 220 benchmark audit against refreshed `Home`, focused-source, and focused split captures, confirmed that the default `Home` correction succeeded overall, and opened Stage 221 plus pre-staged Stage 222 for the expanded `Earlier` state rebalance
- 2026-03-17: completed Stage 221 by stacking the expanded `Earlier` lead reopen card above the full revealed tail instead of stretching it beside a narrow archive ledger, validating with targeted plus broad frontend coverage, lint/build, Stage 221/222 harness checks, and fresh real Edge captures, and then promoted Stage 222 as the current benchmark audit
- 2026-03-17: completed the Stage 222 benchmark audit against refreshed collapsed and expanded `Home` plus focused-source and Reader-led captures, confirmed that `Home` now stays calm in both states, and opened Stage 223 plus pre-staged Stage 224 for the narrower-width shell reflow correction
- 2026-03-17: completed Stage 223 by correcting the narrower-width Recall shell reflow through breakpoint-only shell/rail/topbar adjustments, validating with `App.test.tsx`, lint/build, Stage 223/224 harness checks, and fresh real Edge captures at `820x980`, and then promoted Stage 224 as the current benchmark audit
- 2026-03-17: completed the Stage 224 narrower-width audit against refreshed Home, Graph, focused source-overview, and Reader captures, confirmed that the shell reflow correction succeeded overall, and opened Stage 225 plus pre-staged Stage 226 for a narrower-width Reader chrome compression follow-up
- 2026-03-17: completed Stage 225 by compressing the narrower-width Reader chrome stack with tighter Reader-only source-strip density, a flatter transport row, and a slimmer reading header, validating with `ReaderSurface.test.tsx` plus `App.test.tsx`, lint/build, Stage 225/226 harness checks, and fresh real Edge captures at `820x980`, and then promoted Stage 226 as the current benchmark audit
- 2026-03-17: completed the Stage 226 narrower-width Reader audit against refreshed top-state, overflow-open, and full-page Reader captures, confirmed that the Reader chrome compression succeeded overall, and opened Stage 227 plus pre-staged Stage 228 for the shared focused-source strip follow-up
- 2026-03-17: completed Stage 227 by compressing the shared narrower-width focused-source strip with tighter spacing, denser meta/tab treatment, a restored two-column narrow grouping, and a sub-680 fallback, validating with `RecallShellFrame.test.tsx` plus `App.test.tsx`, lint/build, Stage 227/228 harness checks, an extra sub-680 screenshot sanity pass, and fresh real Edge captures at `820x980`, and then promoted Stage 228 as the current benchmark audit
- 2026-03-17: completed the Stage 228 narrower-width focused-source audit against refreshed focused overview, Notes, Graph, Study, and Reader top-state captures, confirmed that the strip compression succeeded overall, and opened Stage 229 plus pre-staged Stage 230 for the narrower-width focused split rebalancing follow-up
- 2026-03-17: completed Stage 229 by rebalancing the narrower-width focused split with a slimmer focused rail, a wider Reader column, and a tighter secondary panel at `820x980`, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 229/230 harness checks, and fresh real Edge captures, and then promoted Stage 230 as the current benchmark audit
- 2026-03-17: completed the Stage 230 narrower-width focused split audit against refreshed focused overview, Notes, Graph, Study, and Reader top-state captures, confirmed that the split rebalancing succeeded overall, and opened Stage 231 plus pre-staged Stage 232 for the remaining focused `Study` queue-rail deflation follow-up
- 2026-03-17: completed Stage 231 by deflating the narrower-width focused `Study` queue rail with tighter closed-rail spacing, shorter utility labels, and calmer summary chrome, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 231/232 harness checks, and fresh real Edge captures, and then promoted Stage 232 as the current benchmark audit
- 2026-03-17: completed the Stage 232 narrower-width focused `Study` audit against refreshed focused overview, Notes, Graph, Study, queue-open Study, and Reader top-state captures, confirmed that the focused `Study` rail correction succeeded overall, and opened Stage 233 plus pre-staged Stage 234 for the remaining focused `Graph` detail-panel deflation follow-up
- 2026-03-17: completed Stage 233 by deflating the narrower-width focused `Graph` detail panel with tighter toolbar spacing, shorter node-action labels, and calmer selected-node summary chrome, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 233/234 harness checks, and fresh real Edge captures, and then promoted Stage 234 as the current benchmark audit
- 2026-03-17: completed the Stage 234 narrower-width focused `Graph` audit against refreshed focused overview, Notes, Graph, Study, and Reader top-state captures, confirmed that the focused `Graph` detail correction succeeded overall, and opened Stage 235 plus pre-staged Stage 236 for the remaining focused `Study` active-card-column deflation follow-up
- 2026-03-17: completed Stage 235 by deflating the narrower-width focused `Study` active-card column with tighter panel spacing, calmer metadata glance chrome, smaller reveal/rating controls, and earlier supporting-evidence entry, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 235/236 harness checks, and fresh real Edge captures, and then promoted Stage 236 as the current benchmark audit
- 2026-03-17: completed the Stage 236 narrower-width focused `Study` audit against refreshed focused overview, Notes, Graph, Study, full Study, queue-open Study, and Reader captures, confirmed that the focused `Study` active-card correction succeeded overall, and opened Stage 237 plus pre-staged Stage 238 for the remaining focused `Notes` empty-detail-panel deflation follow-up
- 2026-03-17: completed Stage 237 by deflating the narrower-width focused `Notes` empty-detail panel with a lighter empty-state shell, tighter blank-state messaging, and less duplicate helper framing, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 237/238 harness checks, and fresh real Edge captures, and then promoted Stage 238 as the current benchmark audit
- 2026-03-17: completed the Stage 238 narrower-width focused `Notes` audit against refreshed focused overview, Notes, full Notes, Graph, Study, and Reader captures, confirmed that the focused `Notes` correction succeeded overall, and opened Stage 239 plus pre-staged Stage 240 for the remaining focused `Graph` detail-stack flattening follow-up
- 2026-03-17: completed Stage 239 by flattening the narrower-width focused `Graph` detail stack with tighter selected-node summary chrome, earlier mentions entry, and lighter pre-evidence framing, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 239/240 harness checks, and fresh real Edge captures, and then promoted Stage 240 as the current benchmark audit
- 2026-03-17: completed the Stage 240 narrower-width focused `Graph` audit against refreshed focused overview, Notes, Graph, Study, and Reader captures, confirmed that the focused `Graph` detail-stack correction succeeded overall, and opened Stage 241 plus pre-staged Stage 242 for the remaining focused `Study` active-card stack flattening follow-up
- 2026-03-17: completed Stage 241 by flattening the narrower-width focused `Study` active-card stack with a tighter reveal card, delayed rating-row entry, and earlier supporting-evidence entry, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 241/242 harness checks, and fresh real Edge captures, and then promoted Stage 242 as the current benchmark audit
- 2026-03-17: completed the Stage 242 narrower-width focused `Study` audit against refreshed focused overview, Notes, Graph, Study, revealed Study, queue-open Study, and Reader captures, confirmed that the focused `Study` active-card-stack correction succeeded overall, and opened Stage 243 plus pre-staged Stage 244 for the remaining focused `Graph` left-rail deflation follow-up
- 2026-03-17: completed Stage 243 by deflating the narrower-width focused `Graph` left rail with a tighter utility row, hidden intro copy, and a shorter selected-node summary card, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 243/244 harness checks, and fresh real Edge captures, and then promoted Stage 244 as the current benchmark audit
- 2026-03-17: completed the Stage 244 narrower-width focused `Graph` audit against refreshed focused overview, Notes, Graph, Study, and Reader captures, confirmed that the focused `Graph` left-rail correction succeeded overall, and opened Stage 245 plus pre-staged Stage 246 for the remaining focused `Graph` node-detail header deflation follow-up
- 2026-03-17: completed Stage 245 by deflating the narrower-width focused `Graph` node-detail header with a tighter header stack, compact meta treatment, and earlier `Mentions` entry, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 245/246 harness checks, and fresh real Edge captures, and then promoted Stage 246 as the current benchmark audit
- 2026-03-17: completed the Stage 246 narrower-width focused audit against refreshed focused overview, Notes, Graph, Study, and Reader captures, confirmed that the focused `Graph` node-detail-header correction succeeded overall, and reopened bundled dominant-surface mode by opening Stage 247 plus pre-staged Stage 248 for the recurring focused `Study` right-lane follow-up
- 2026-03-17: completed Stage 247 by bundling the narrower-width focused `Study` right-lane reductions with a grouped review panel, a grouped supporting-evidence panel, and calmer header/meta framing, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 247/248 harness checks, and fresh real Edge captures, and then promoted Stage 248 as the current benchmark audit
- 2026-03-17: completed the Stage 248 narrower-width focused audit against refreshed focused overview, Notes, Graph, Study, revealed Study, queue-open Study, and Reader captures, confirmed that the bundled focused `Study` right-lane correction succeeded overall, and switched the next bounded follow-up to focused `Notes` by opening Stage 249 plus pre-staged Stage 250 for the remaining empty-detail-lane collapse
- 2026-03-17: completed Stage 249 by collapsing the narrower-width focused `Notes` empty-detail lane into the left rail with a focused-empty layout hook, rail guidance, and no behavioral change to real note detail, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 249/250 harness checks, and fresh real Edge captures, and then promoted Stage 250 as the current benchmark audit
- 2026-03-17: completed the Stage 250 narrower-width focused audit against refreshed focused overview, Notes empty, Notes drawer-open, Graph, Study, and Reader captures, confirmed that the focused `Notes` empty-detail correction succeeded overall, and switched the next bounded follow-up to focused overview by opening Stage 251 plus pre-staged Stage 252 for the remaining `Home`-rail deflation
- 2026-03-17: completed Stage 251 by deflating the narrower-width focused overview `Home` rail with a localized layout hook, a narrower condensed rail, and calmer summary-card chrome, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 251/252 harness checks, and fresh real Edge captures, and then promoted Stage 252 as the current benchmark audit
- 2026-03-17: completed the Stage 252 narrower-width focused overview audit against refreshed focused overview, drawer-open overview, Notes, Graph, Study, and Reader captures, confirmed that the focused overview correction succeeded overall, and switched the next bounded follow-up back to focused `Study` by opening Stage 253 plus pre-staged Stage 254 for the remaining left queue-utility-row mismatch
- 2026-03-17: completed Stage 253 by flattening the narrower-width focused `Study` left queue utility row with a calmer decision-row treatment, smaller heading scale, lighter summary chrome, and preserved queue access, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 253/254 harness checks, and fresh real Edge captures, and then promoted Stage 254 as the current benchmark audit
- 2026-03-17: completed the Stage 254 narrower-width focused `Study` audit against refreshed focused overview, Notes, Graph, Study, queue-open Study, and Reader captures, confirmed that the focused `Study` left-rail correction succeeded overall, and switched the next bounded follow-up back to focused `Graph` by opening Stage 255 plus pre-staged Stage 256 for the remaining `Node detail` decision-row mismatch
- 2026-03-17: completed Stage 255 by deflating the narrower-width focused `Graph` `Node detail` decision row with calmer action-group chrome, softer confirm/reject emphasis, and lighter selected-node meta chips, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 255/256 harness checks, and fresh real Edge captures, and then promoted Stage 256 as the current benchmark audit
- 2026-03-17: completed the Stage 256 narrower-width focused `Graph` audit against refreshed focused overview, Notes, Graph, Study, and Reader captures, confirmed that the focused `Graph` decision-row correction succeeded overall, and switched the next bounded follow-up back to focused `Study` by opening Stage 257 plus pre-staged Stage 258 for the remaining `Active card` header/prompt-shell mismatch
- 2026-03-17: completed Stage 257 by deflating the narrower-width focused `Study` `Active card` header and prompt shell with calmer top-shell chrome, softer metadata chips, and a tighter reveal row, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 257/258 harness checks, and fresh real Edge captures, and then promoted Stage 258 as the current benchmark audit
- 2026-03-17: completed the Stage 258 narrower-width focused `Study` audit against refreshed focused overview, Notes, Graph, Study, revealed Study, queue-open Study, and Reader captures, confirmed that the focused `Study` active-card-header correction succeeded overall, and switched the next bounded follow-up to focused `Notes` by opening Stage 259 plus pre-staged Stage 260 for the remaining empty-rail helper-copy/action-stack mismatch
- 2026-03-17: completed Stage 259 by deflating the narrower-width focused `Notes` empty rail with a dedicated empty-rail hook, shorter helper copy, one browse affordance instead of a duplicated action stack, and calmer summary-card chrome, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 259/260 harness checks, and fresh real Edge captures, and then promoted Stage 260 as the current benchmark audit
- 2026-03-17: completed the Stage 260 narrower-width focused `Notes` audit against refreshed focused overview, Notes empty, Notes drawer-open, Graph, Study, and Reader captures, confirmed that the focused `Notes` empty-rail correction succeeded overall, and kept the next bounded follow-up on focused `Notes` by opening Stage 261 plus pre-staged Stage 262 for the remaining drawer-open empty browse-state mismatch
- 2026-03-17: completed Stage 261 by deflating the narrower-width focused `Notes` drawer-open empty browse state with a compact drawer-empty rail hook, tighter filters, and a smaller no-notes card, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 261/262 harness checks, and fresh real Edge captures, and then promoted Stage 262 as the current benchmark audit
- 2026-03-17: completed the Stage 262 narrower-width focused `Notes` audit against refreshed focused overview, Notes empty, Notes drawer-open empty, Graph, Study, and Reader captures, confirmed that the drawer-open focused `Notes` browse-state correction succeeded overall, and kept the next bounded follow-up on focused `Notes` by opening Stage 263 plus pre-staged Stage 264 for the remaining empty `Note detail` panel mismatch in that same narrow flow
- 2026-03-17: completed Stage 263 by deflating the narrower-width focused `Notes` drawer-open empty `Note detail` panel with a compact detail-panel hook, shorter helper copy, and lighter narrow-only blank-state framing, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 263/264 harness checks, and fresh real Edge captures, and then promoted Stage 264 as the current benchmark audit
- 2026-03-17: completed the Stage 264 narrower-width focused `Notes` audit against refreshed focused overview, Notes empty, Notes drawer-open empty, Graph, Study, and Reader captures, confirmed that the focused `Notes` drawer-open empty-detail correction succeeded overall, and switched the next bounded follow-up back to focused `Graph` by opening Stage 265 plus pre-staged Stage 266 for the remaining `Node detail` pre-`Mentions` shell mismatch
- 2026-03-17: completed Stage 265 by deflating the narrower-width focused `Graph` `Node detail` pre-`Mentions` shell with tighter detail-toolbar spacing, calmer decision-row chrome, a compact selected-node summary hook, and earlier `Mentions` entry, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 265/266 harness checks, and fresh real Edge captures, and then promoted Stage 266 as the current benchmark audit
- 2026-03-17: completed the Stage 266 narrower-width focused `Graph` audit against refreshed focused overview, Notes drawer-open empty, Graph, Study, and Reader captures, confirmed that the focused `Graph` pre-`Mentions` shell correction succeeded overall, and kept the next bounded follow-up on focused `Graph` in bundled dominant-surface mode by opening Stage 267 plus pre-staged Stage 268 for the remaining `Node detail` lane mismatch
- 2026-03-17: completed Stage 267 by bundling the narrower-width focused `Graph` `Node detail` lane reduction into one calmer support flow with a flatter header/action seam, a demoted selected-node glance, and more compact grounded evidence cards, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 267/268 harness checks, and fresh real Edge captures, and then promoted Stage 268 as the current benchmark audit
- 2026-03-17: completed the Stage 268 narrower-width focused `Graph` audit against refreshed focused overview, Notes drawer-open empty, Graph, Study, and Reader captures, confirmed that the bundled focused `Graph` correction succeeded overall, and switched the next bounded follow-up back to focused `Study` in bundled dominant-surface mode by opening Stage 269 plus pre-staged Stage 270 for the remaining right-lane panel-fusion mismatch
- 2026-03-17: completed Stage 269 by fusing the narrower-width focused `Study` right lane into a calmer support flow with a demoted metadata strip, a tighter review panel, and an evidence section that reads more like continuation than a second destination, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 269/270 harness checks, and fresh real Edge captures, and then promoted Stage 270 as the current benchmark audit
- 2026-03-17: completed the Stage 270 narrower-width focused `Study` audit against refreshed focused overview, Notes drawer-open empty, Graph, Study, answer-shown Study, queue-open Study, and Reader captures, confirmed that the bundled focused `Study` right-lane correction succeeded overall, and kept the next bounded follow-up on focused `Study` by opening Stage 271 plus pre-staged Stage 272 for the remaining answer-shown stack-height mismatch
- 2026-03-18: completed Stage 271 by compressing the narrower-width focused `Study` answer-shown stack with a dedicated answer-shown hook, a tighter rating seam, and a slimmer supporting-evidence continuation, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 271/272 harness checks, and fresh real Edge captures, and then promoted Stage 272 as the current benchmark audit
- 2026-03-18: completed the Stage 272 narrower-width focused `Study` audit against refreshed focused overview, Notes drawer-open empty, Graph, Study, answer-shown Study, and Reader captures, confirmed that Stage 271 succeeded overall, and kept the next bounded follow-up on focused `Study` in bundled dominant-surface mode by opening Stage 273 plus pre-staged Stage 274 for the remaining answer-shown right-lane mismatch
- 2026-03-18: completed Stage 273 by bundling the narrower-width focused `Study` answer-shown right-lane reductions into a tighter prompt/answer shell, a single-line rating row, and a calmer supporting-evidence continuation, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 273/274 harness checks, and fresh real Edge captures, and then promoted Stage 274 as the current benchmark audit
- 2026-03-18: completed the Stage 274 narrower-width focused audit against refreshed focused overview, Notes drawer-open empty, Graph, Study, answer-shown Study, and Reader captures, confirmed that Stage 273 succeeded overall, and shifted the next bounded follow-up back to focused `Graph` in bundled dominant-surface mode by opening Stage 275 plus pre-staged Stage 276 for the remaining `Node detail` support-stack mismatch
- 2026-03-18: completed Stage 275 by bundling the narrower-width focused `Graph` `Node detail` support-stack deflation into a calmer decision-row seam, lighter leading mention card, and smaller Reader handoff controls, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 275/276 harness checks, and fresh real Edge captures, and then promoted Stage 276 as the current benchmark audit
- 2026-03-18: completed the Stage 276 narrower-width focused `Graph` audit against refreshed focused overview, Notes drawer-open empty, Graph, Study, answer-shown Study, and Reader captures, confirmed that Stage 275 succeeded overall, and shifted the next bounded follow-up back to focused `Study` in bundled dominant-surface mode by opening Stage 277 plus pre-staged Stage 278 for the remaining answer-shown support-continuation mismatch
- 2026-03-18: completed Stage 277 by bundling the narrower-width focused `Study` answer-shown support-continuation deflation into a tighter rating seam, lighter evidence header/actions, and a flatter grounding continuation, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 277/278 harness checks, and fresh real Edge captures, and then promoted Stage 278 as the current benchmark audit
- 2026-03-18: completed the Stage 278 narrower-width focused `Study` audit against refreshed focused overview, Notes drawer-open empty, Graph, Study, answer-shown Study, and Reader captures, confirmed that Stage 277 succeeded overall, and shifted the next bounded follow-up back to focused `Graph` in bundled dominant-surface mode by opening Stage 279 plus pre-staged Stage 280 for the remaining `Node detail` mentions-stack continuation mismatch
- 2026-03-18: completed Stage 279 by bundling the narrower-width focused `Graph` mentions-stack continuation deflation into lighter trailing mention cards, shorter repeated excerpt rhythm, and smaller repeated Reader handoff rows, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 279/280 harness checks, and fresh real Edge captures, and then promoted Stage 280 as the current benchmark audit
- 2026-03-18: completed the Stage 280 narrower-width focused `Graph` audit against refreshed focused overview, Notes drawer-open empty, Graph, Study, answer-shown Study, and Reader captures, confirmed that Stage 279 succeeded overall, and kept the next bounded follow-up on focused `Graph` in bundled dominant-surface mode by opening Stage 281 plus pre-staged Stage 282 for the remaining trailing mention-row density mismatch
- 2026-03-18: completed Stage 281 by bundling the narrower-width focused `Graph` trailing-mentions density deflation into repeated-source label demotion, quieter trailing meta treatment, and a more compact trailing action seam, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 281/282 harness checks, and fresh real Edge captures, and then promoted Stage 282 as the current benchmark audit
- 2026-03-18: completed the Stage 282 narrower-width focused `Graph` audit against refreshed focused overview, Notes drawer-open empty, Graph, Study, answer-shown Study, and Reader captures, confirmed that Stage 281 succeeded overall, and shifted the next bounded follow-up back to focused `Study` in bundled dominant-surface mode by opening Stage 283 plus pre-staged Stage 284 for the remaining answer-shown support-controls mismatch
- 2026-03-18: completed Stage 283 by bundling the narrower-width focused `Study` answer-shown support-controls deflation into a tighter answer-shown glance strip, smaller rating pills, and a lighter supporting-evidence action seam, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 283/284 harness checks, and fresh real Edge captures, and then promoted Stage 284 as the current benchmark audit
- 2026-03-18: completed the Stage 284 narrower-width focused `Study` audit against refreshed focused overview, Notes drawer-open empty, Graph, Study, answer-shown Study, and Reader captures, confirmed that Stage 283 succeeded overall, and shifted the next bounded follow-up back to focused `Graph` in bundled dominant-surface mode by opening Stage 285 plus pre-staged Stage 286 for the remaining trailing mention-row action-column mismatch
- 2026-03-18: completed Stage 285 by bundling the narrower-width focused `Graph` trailing-mentions action-column deflation into a flatter trailing-row continuation, a smaller confidence readout, and a calmer inline action seam, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 285/286 harness checks, and fresh real Edge captures, and then promoted Stage 286 as the current benchmark audit
- 2026-03-18: completed the Stage 286 narrower-width focused `Graph` audit against refreshed focused overview, Notes drawer-open empty, Graph, Study, answer-shown Study, and Reader captures, confirmed that Stage 285 succeeded overall, and shifted the next bounded follow-up back to answer-shown focused `Study` in bundled dominant-surface mode by opening Stage 287 plus pre-staged Stage 288 for the remaining rating/support seam mismatch
- 2026-03-18: completed Stage 287 by bundling the narrower-width answer-shown focused `Study` rating/support seam deflation into a lighter rating seam, tighter support-header actions, and a calmer evidence continuation, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 287/288 harness checks, and fresh real Edge captures, and then promoted Stage 288 as the current benchmark audit
- 2026-03-18: completed the Stage 288 narrower-width focused `Study` audit against refreshed focused overview, Notes drawer-open empty, Graph, Study, answer-shown Study, and Reader captures, confirmed that Stage 287 succeeded overall, and shifted the next bounded follow-up back to focused `Graph` in bundled dominant-surface mode by opening Stage 289 plus pre-staged Stage 290 for the remaining trailing same-source row density mismatch
- 2026-03-18: completed Stage 295 by bundling the narrower-width focused `Graph` deepest same-source tail-seam deflation into a softer deepest-tail continuation seam, smaller repeated confidence cues, and calmer lowest-row action chrome, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 295/296 harness checks, and fresh real Edge captures, and then promoted Stage 296 as the current benchmark audit
- 2026-03-18: completed the Stage 296 narrower-width focused `Graph` audit against refreshed focused overview, Notes drawer-open empty, Graph, deepest same-source Graph tail, Study, answer-shown Study, and Reader captures, confirmed that Stage 295 succeeded overall, and kept the next bounded follow-up on focused `Graph` in bundled dominant-surface mode by opening Stage 297 plus pre-staged Stage 298 for the remaining deepest same-source tail row-rhythm mismatch
- 2026-03-18: completed Stage 297 by bundling the narrower-width focused `Graph` deepest same-source tail row-rhythm deflation into a dedicated deep-tail hook, a quieter one-line continuation preview, a hidden deepest-tail confidence seam, and lighter deepest-row actions, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 297/298 harness checks, and fresh real Edge captures through the restored `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 298 as the current benchmark audit
- 2026-03-18: completed the Stage 298 narrower-width focused `Graph` audit against refreshed focused overview, Notes drawer-open empty, Graph, deepest same-source Graph tail, Study, answer-shown Study, and Reader captures, confirmed that Stage 297 succeeded overall, and kept the next bounded follow-up on focused `Graph` in bundled dominant-surface mode by opening Stage 299 plus pre-staged Stage 300 for the remaining `Node detail` continuation-stack fusion mismatch
- 2026-03-18: completed Stage 299 by bundling the narrower-width focused `Graph` `Node detail` continuation-stack fusion into source-run grouping, a localized leading-source cluster wrapper, and a calmer leading-card-to-continuation seam, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 299/300 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 300 as the current benchmark audit
- 2026-03-18: completed the Stage 300 narrower-width focused `Graph` audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Graph` continuation-stack detail, Study, answer-shown Study, and Reader captures, confirmed that Stage 299 succeeded overall, and kept the next bounded follow-up on focused `Graph` in bundled dominant-surface mode by opening Stage 301 plus pre-staged Stage 302 for the remaining `Mentions` entry and leading-card seam mismatch
- 2026-03-18: completed Stage 301 by softening the narrower-width focused `Graph` `Mentions` entry and leading-card seam with a compact entry hook, a quieter grounded-mention summary, and a lighter leading-source cluster seam, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 301/302 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 302 as the current benchmark audit
- 2026-03-18: completed the Stage 302 narrower-width focused `Graph` audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Graph` `Mentions` entry seam detail, Study, answer-shown Study, and Reader captures, confirmed that Stage 301 succeeded overall, and kept the next bounded follow-up on focused `Graph` in bundled dominant-surface mode by opening Stage 303 plus pre-staged Stage 304 for the remaining leading grounded evidence card and same-source bridge mismatch
- 2026-03-18: completed Stage 303 by softening the narrower-width focused `Graph` leading grounded evidence card and immediate same-source bridge with a lighter cluster shell, a softer bridge seam, and calmer bridge utility chrome, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 303/304 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 304 as the current benchmark audit
- 2026-03-18: completed the Stage 304 narrower-width focused `Graph` audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Graph` leading grounded evidence card detail, Study, answer-shown Study, and Reader captures, confirmed that Stage 303 succeeded overall, and kept the next bounded follow-up on focused `Graph` in bundled dominant-surface mode by opening Stage 305 plus pre-staged Stage 306 for the remaining same-source continuation-tail mismatch
- 2026-03-18: completed Stage 305 by softening the narrower-width focused `Graph` same-source continuation tail with calmer row borders, a tighter preview rhythm, and quieter repeated utility treatment, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 305/306 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 306 as the current benchmark audit
- 2026-03-18: completed the Stage 306 narrower-width focused `Graph` audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Graph` same-source continuation-tail detail, Study, answer-shown Study, and Reader captures, confirmed that Stage 305 succeeded overall, and kept the next bounded follow-up on focused `Graph` in bundled dominant-surface mode by opening Stage 307 plus pre-staged Stage 308 for the remaining repeated same-source continuation utility-seam mismatch
- 2026-03-18: completed Stage 307 by softening the narrower-width focused `Graph` same-source continuation utility seam with calmer continuation action typography, quieter inline confidence treatment, and a less pill-like repeated `Show` / `Open` seam, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 307/308 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 308 as the current benchmark audit
- 2026-03-18: completed the Stage 308 narrower-width focused `Graph` audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Graph` same-source continuation utility-seam detail, Study, answer-shown Study, and Reader captures, confirmed that Stage 307 succeeded overall, and kept the next bounded follow-up on focused `Graph` in bundled dominant-surface mode by opening Stage 309 plus pre-staged Stage 310 for the remaining tiny right-edge same-source continuation utility-column mismatch
- 2026-03-18: completed Stage 309 by flattening the narrower-width focused `Graph` same-source continuation utility column with a collapsed empty head slot, a left-aligned follow-on action row, and a less column-like continuation layout, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 309/310 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 310 as the current benchmark audit
- 2026-03-18: completed the Stage 310 narrower-width focused `Graph` audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Graph` same-source continuation utility-column detail, Study, answer-shown Study, and Reader captures, confirmed that Stage 309 succeeded overall, and kept the next bounded follow-up on focused `Graph` in bundled dominant-surface mode by opening Stage 311 plus pre-staged Stage 312 for the remaining same-source continuation follow-on stack mismatch
- 2026-03-18: completed Stage 311 by softening the narrower-width focused `Graph` same-source continuation follow-on stack with a calmer bridge seam, hidden bridge header/meta chrome, and a less restart-like transition into the continuation rows, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 311/312 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 312 as the current benchmark audit
- 2026-03-18: completed the Stage 312 narrower-width focused `Graph` audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Graph` same-source continuation follow-on stack detail, Study, answer-shown Study, and Reader captures, confirmed that Stage 311 succeeded overall, and kept the next bounded follow-up on focused `Graph` in bundled dominant-surface mode by opening Stage 313 plus pre-staged Stage 314 for the remaining same-source continuation ladder mismatch
- 2026-03-18: completed Stage 313 by softening the narrower-width focused `Graph` same-source continuation ladder with tighter in-cluster row rhythm, softer continuation seams, and less repeated confidence/action emphasis, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 313/314 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 314 as the current benchmark audit
- 2026-03-18: completed the Stage 314 narrower-width focused `Graph` audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Graph` same-source continuation ladder detail, Study, answer-shown Study, and Reader captures, confirmed that Stage 313 succeeded overall, and kept the next bounded follow-up on focused `Graph` in bundled dominant-surface mode by opening Stage 315 plus pre-staged Stage 316 for the remaining deepest same-source continuation-tail mismatch
- 2026-03-18: completed Stage 315 by compacting the narrower-width focused `Graph` deepest same-source continuation tail with softer one-line preview text, flatter tiny action seams, and tighter consecutive-tail rhythm, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 315/316 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 316 as the current benchmark audit
- 2026-03-18: completed the Stage 316 narrower-width focused `Graph` audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Graph` deepest same-source continuation-tail detail, Study, answer-shown Study, and Reader captures, confirmed that Stage 315 succeeded overall, and kept the next bounded follow-up on focused `Graph` in bundled dominant-surface mode by opening Stage 317 plus pre-staged Stage 318 for the remaining deepest same-source tail inline-list mismatch
- 2026-03-18: completed Stage 317 by settling the narrower-width focused `Graph` deepest same-source continuation tail into a flatter inline seam with a softer deepest-tail preview/action rhythm, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 317/318 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 318 as the current benchmark audit
- 2026-03-18: completed the Stage 318 narrower-width focused `Graph` audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Graph` deepest same-source tail detail, Study, answer-shown Study, and Reader captures, confirmed that Stage 317 succeeded overall, and kept the next bounded follow-up on focused `Graph` in bundled dominant-surface mode by opening Stage 319 plus pre-staged Stage 320 for the remaining deepest same-source tail micro-list mismatch
- 2026-03-18: completed Stage 319 by deflating the narrower-width focused `Graph` deepest same-source tail into a more text-like micro-seam with inline preview/action treatment and softer trailing utility rhythm, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 319/320 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 320 as the current benchmark audit
- 2026-03-18: completed the Stage 320 narrower-width focused audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Graph` deepest same-source tail detail, Study, answer-shown Study, and Reader captures, confirmed that Stage 319 succeeded overall, and moved the next bounded follow-up off focused `Graph` by opening Stage 321 plus pre-staged Stage 322 for the remaining focused `Study` right-lane prompt/support-shell mismatch
- 2026-03-18: completed Stage 321 by deflating the narrower-width focused `Study` right-lane prompt/support shell with flatter bundled-panel framing, tighter review/reveal seams, calmer supporting-evidence continuation chrome, and a lighter focused evidence card, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 321/322 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 322 as the current benchmark audit
- 2026-03-18: completed the Stage 322 narrower-width focused audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Study`, answer-shown focused `Study`, and Reader captures, confirmed that Stage 321 succeeded overall, and kept the next bounded follow-up on focused `Study` in bundled dominant-surface mode by opening Stage 323 plus pre-staged Stage 324 for the remaining prompt/reveal/support-stack fusion mismatch
- 2026-03-18: completed Stage 323 by fusing the narrower-width focused `Study` prompt, reveal, and support stack with tighter review-panel seams, calmer reveal chrome, and flatter evidence/grounding continuation treatment, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 323/324 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 324 as the current benchmark audit
- 2026-03-18: completed the Stage 324 narrower-width focused audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Study`, answer-shown focused `Study`, and Reader captures, confirmed that Stage 323 succeeded overall, and kept the next bounded follow-up on focused `Study` in bundled dominant-surface mode by opening Stage 325 plus pre-staged Stage 326 for the remaining supporting-evidence and grounding continuation mismatch
- 2026-03-18: completed Stage 325 by softening the narrower-width focused `Study` supporting-evidence and grounding continuation with a lighter evidence excerpt seam, hidden repeated evidence metadata, and a calmer grounding follow-on treatment, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 325/326 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 326 as the current benchmark audit
- 2026-03-18: completed the Stage 326 narrower-width focused audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Study`, answer-shown focused `Study`, and Reader captures, confirmed that Stage 325 succeeded overall, and shifted the next bounded follow-up back to focused `Graph` in bundled dominant-surface mode by opening Stage 327 plus pre-staged Stage 328 for the remaining `Node detail` leading mention-card and action-seam mismatch
- 2026-03-18: completed Stage 327 by deflating the narrower-width focused `Graph` `Mentions` entry and leading grounded evidence/action seam with a lighter leading-entry header, softer leading source-run framing, and calmer leading handoff actions, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, Stage 327/328 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 328 as the current benchmark audit
- 2026-03-18: completed the Stage 328 narrower-width focused audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Study`, answer-shown focused `Study`, and Reader captures, confirmed that Stage 327 succeeded overall, and kept the next bounded follow-up on focused `Graph` in bundled dominant-surface mode by opening Stage 329 plus pre-staged Stage 330 for the remaining `Node detail` leading grounded-evidence preview/meta mismatch
- 2026-03-18: reviewed the narrower-width benchmark cadence before starting Stage 329, concluded that the recent focused `Graph`/focused `Study` tail had become too fine-grained relative to the remaining CSS-only work and repeated audit cost, and widened Stage 329 so it absorbs the remaining tightly coupled focused `Graph` leading-card seams before the next full Stage 330 audit
- 2026-03-18: completed Stage 329 by widening the narrower-width focused `Graph` Reader/detail split, flattening the selected-node glance, and regrouping the leading grounded-evidence run into a calmer evidence-first flow, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, `git diff --check`, Stage 329/330 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 330 as the current benchmark audit
- 2026-03-18: completed the Stage 330 narrower-width focused audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Study`, answer-shown focused `Study`, and Reader captures, confirmed that Stage 329 succeeded overall and delivered a visibly broader focused `Graph` correction, but kept focused `Graph` as the lead blocker because the `Node detail` rail hierarchy still reads too much like a separate destination column beside Reader, and opened Stage 331 plus pre-staged Stage 332 for a broader hierarchy-reset follow-up instead of another seam-only micro-stage
- 2026-03-18: completed Stage 331 by resetting the narrower-width focused `Graph` `Node detail` hierarchy into a visibly flatter rail with a calmer shell, a source-run-first `Mentions` flow, and a more subordinate `Relations` continuation, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, `git diff --check`, Stage 331/332 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 332 as the current benchmark audit
- 2026-03-18: completed the Stage 332 narrower-width focused audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Study`, answer-shown focused `Study`, and Reader captures, confirmed that Stage 331 succeeded overall and finally made the focused `Graph` rail visibly less boxed than the Stage 330 version, but kept focused `Graph` as the lead blocker because the right lane now feels slightly too compressed and micro-dense in the leading evidence/readout flow beside Reader, and opened Stage 333 plus pre-staged Stage 334 for a broader readability-rebalance follow-up
- 2026-03-18: completed Stage 333 by rebalancing the narrower-width focused `Graph` `Node detail` readability with a slightly wider rail, a full-width leading evidence preview, calmer continuation rows, and a more legible `Relations` continuation entry, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, `git diff --check`, Stage 333/334 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 334 as the current benchmark audit
- 2026-03-18: completed the Stage 334 narrower-width focused audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Study`, answer-shown focused `Study`, and Reader captures, confirmed that Stage 333 succeeded overall and materially improved focused `Graph` readability, but kept focused `Graph` as the lead blocker because the lower continuation rows plus the `Relations` footer still accumulate as a cramped tail beneath the improved top half, and opened Stage 335 plus pre-staged Stage 336 for a broader lower-half balance follow-up
- 2026-03-18: completed Stage 335 by rebalancing the narrower-width focused `Graph` lower continuation and `Relations` footer with a grouped leading-source continuation block, calmer follow-on row rhythm, and a more readable footer continuation entry, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, `git diff --check`, Stage 335/336 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 336 as the current benchmark audit
- 2026-03-18: completed the Stage 336 narrower-width focused audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Study`, answer-shown focused `Study`, and Reader captures, confirmed that Stage 335 succeeded overall and materially calmed the focused `Graph` lower half, and shifted the lead blocker back to focused `Study` because the boxed right `Active card` lane still reads too much like a destination panel beside Reader, then opened Stage 337 plus pre-staged Stage 338 for a broader focused `Study` right-lane hierarchy reset
- 2026-03-18: completed Stage 337 by resetting the narrower-width focused `Study` right-lane hierarchy into a visibly flatter support flow with a transparent outer shell, one softer review panel, a calmer answer-shown seam, and a more continuation-like supporting-evidence section, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, `git diff --check`, Stage 337/338 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 338 as the current benchmark audit
- 2026-03-18: completed the Stage 338 narrower-width focused audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Study`, answer-shown focused `Study`, focused Study right-lane crops, and Reader captures, confirmed that Stage 337 succeeded overall and materially calmed the focused `Study` right lane, shifted the lead blocker back to focused `Graph` because the `Node detail` lane still reads too dense and ledger-like beside Reader, and opened Stage 339 plus pre-staged Stage 340 for a broader focused `Graph` density-reset follow-up
- 2026-03-18: completed Stage 339 by widening and calming the narrower-width focused `Graph` `Node detail` lane with a broader Reader/detail split, a stronger leading evidence preview, lighter top utility chrome, and a calmer same-source bridge/continuation seam, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, `git diff --check`, Stage 339/340 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 340 as the current benchmark audit
- 2026-03-18: completed the Stage 340 narrower-width focused audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Graph` node-detail density crops, focused `Study`, answer-shown focused `Study`, and Reader captures, confirmed that Stage 339 succeeded overall and materially improved the focused `Graph` top-half readability and rail width, but kept focused `Graph` as the lead blocker because the lower continuation flow still reads like a long text wall beneath the improved leading preview, and opened Stage 341 plus pre-staged Stage 342 for a broader focused `Graph` continuation-flow consolidation follow-up
- 2026-03-18: completed Stage 341 by resetting the narrower-width focused `Graph` lower rail into one bundled follow-on flow with a separated leading clue, a grouped continuation panel, and a nested `Relations` continuation footer, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, `git diff --check`, Stage 341/342 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 342 as the current benchmark audit
- 2026-03-18: completed the Stage 342 narrower-width focused audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Graph` lower-flow crops, focused `Study`, answer-shown focused `Study`, and Reader captures, confirmed that Stage 341 succeeded overall and materially calmed the focused `Graph` lower continuation/relations stack, then shifted the lead blocker back to focused `Study` because its right active-card flow still reads more boxed and destination-like beside Reader, and opened Stage 343 plus pre-staged Stage 344 for a broader focused `Study` active-card-flow reset
- 2026-03-18: completed Stage 343 by resetting the narrower-width focused `Study` right lane into one shared active-card flow shell with a broader split, calmer prompt/reveal/readout framing, and continuation-style supporting evidence/grounding, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, `git diff --check`, Stage 343/344 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 344 as the current benchmark audit
- 2026-03-18: completed the Stage 344 narrower-width focused audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Study`, answer-shown focused `Study`, focused Study right-lane/body-flow crops, and Reader captures, confirmed that Stage 343 succeeded overall and materially calmed the focused `Study` active-card flow, then shifted the lead blocker back to focused `Graph` because its lower `Node detail` follow-on bundle still reads denser and more text-wall-like beside Reader, and opened Stage 345 plus pre-staged Stage 346 for a broader focused `Graph` follow-on readability reset
- 2026-03-18: completed Stage 345 by resetting the narrower-width focused `Graph` lower bundle into clearer follow-on run cards with a calmer lead excerpt, quieter continuation rows, and a softer lower footer treatment, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, `git diff --check`, Stage 345/346 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 346 as the current benchmark audit
- 2026-03-18: completed the Stage 346 narrower-width focused audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Graph` follow-on bundle crops, focused `Study`, answer-shown focused `Study`, and Reader captures, confirmed that Stage 345 succeeded overall and materially calmed the focused `Graph` lower continuation, but kept focused `Graph` as the lead blocker because the leading grounded-evidence card still reads too separate from the calmer lower bundle, and opened Stage 347 plus pre-staged Stage 348 for a broader focused `Graph` evidence-flow fusion follow-up
- 2026-03-18: completed Stage 347 by fusing the narrower-width focused `Graph` evidence flow into one calmer rail with a shared outer shell, a softer `Mentions` entry, a flatter leading evidence preview, and an integrated lower continuation bundle, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, `git diff --check`, Stage 347/348 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 348 as the current benchmark audit
- 2026-03-18: completed the Stage 348 narrower-width focused audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Graph` evidence-flow crops, focused `Study`, answer-shown focused `Study`, and Reader captures, confirmed that Stage 347 succeeded overall and materially unified the focused `Graph` right-lane evidence flow, then shifted the lead blocker back to focused `Study` because the right `Active card` lane still reads too boxed and destination-like beside Reader, and opened Stage 349 plus pre-staged Stage 350 for a broader focused `Study` body-flow fusion follow-up
- 2026-03-18: completed Stage 349 by fusing the narrower-width focused `Study` right lane into a calmer body-flow shell with a flatter active-card panel, a lighter pre-answer reveal row, a tighter answer-shown rating strip, and a softer supporting-evidence/grounding continuation beside Reader, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, `git diff --check`, Stage 349/350 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 350 as the current benchmark audit
- 2026-03-18: completed the Stage 350 narrower-width focused audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Study`, answer-shown focused `Study`, focused Study right-lane/body-flow crops, and Reader captures, confirmed that Stage 349 succeeded overall and materially calmed the focused `Study` right lane, then shifted the lead blocker back to focused `Graph` because the `Node detail` rail still reads too cramped and text-heavy beside Reader, and opened Stage 351 plus pre-staged Stage 352 for a broader focused `Graph` rail-readability rebalance
- 2026-03-18: completed Stage 351 by widening the narrower-width focused `Graph` split, shrinking the neighboring Graph rail, stacking the `Node detail` utility seam more clearly, and resetting the right lane into a calmer readable support rail, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, `git diff --check`, Stage 351/352 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 352 as the current benchmark audit
- 2026-03-18: completed the Stage 352 narrower-width focused audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Graph` rail/readability crops, focused `Study`, answer-shown focused `Study`, and Reader captures, confirmed that Stage 351 succeeded overall and materially improved the focused `Graph` right-rail hierarchy and width, but kept focused `Graph` as the lead blocker because the lower `More evidence` continuation still reads like a same-source text wall beneath the improved leading clue, and opened Stage 353 plus pre-staged Stage 354 for a broader lower-continuation reset
- 2026-03-18: completed Stage 353 by resetting the narrower-width focused `Graph` lower `More evidence` continuation into clearer follow-on run cards with a bounded continuation trail, calmer same-source grouping, and a softer lower `Relations` footer, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, `git diff --check`, Stage 353/354 harness checks, and fresh real Edge captures through the live `127.0.0.1:8000` Windows localhost bridge, and then promoted Stage 354 as the current benchmark audit
- 2026-03-18: completed the Stage 354 narrower-width focused audit against refreshed focused overview, Notes drawer-open empty, Graph, focused `Graph` lower-bundle crops, focused `Study`, answer-shown focused `Study`, and Reader captures, confirmed that Stage 353 succeeded overall and materially calmed the lower same-source continuation, but kept focused `Graph` as the lead blocker because the `Node detail` rail still stacks too many boxed/labeled layers (`about`, `Mentions`, the leading clue, then the calmer lower bundle) beside Reader, and opened Stage 355 plus pre-staged Stage 356 for a broader node-detail stack simplification
- 2026-03-18: rewrote Stage 355 and Stage 356 into a desktop-first Graph milestone instead of another narrow micro-tail, then completed Stage 355 by redesigning wide desktop `Graph` into a canvas-first workspace with a lighter utility strip, a docked `Node detail` evidence flow, and a matching focused/narrow hierarchy adaptation, validating with `RecallWorkspace.stage34.test.tsx` plus `App.test.tsx`, lint/build, `git diff --check`, `node --check`, a dedicated wide desktop Graph harness, and a focused/narrow Graph regression harness against the live app at `http://127.0.0.1:8000`
- 2026-03-18: completed the Stage 356 desktop-first Graph milestone audit against wide desktop `Home`, `Graph`, `Study`, `Notes`, and `Reader` captures plus focused overview, focused `Graph`, focused `Study`, focused `Notes`, and focused `Reader` regression captures, confirmed that the Graph milestone succeeded overall and materially changed the wide desktop `Graph` surface, shifted the next honest blocker to wide desktop `Study`, and opened Stage 357 plus pre-staged Stage 358 for the next section-by-section desktop-led redesign milestone
- 2026-03-19: completed Stage 357 by redesigning wide desktop `Home` into one active collection workspace with shell-led utility, a dominant lead reopen path, nearby resumptions, and a denser saved-source library that starts earlier above the fold, while adapting focused overview and narrower desktop `Home` to the same hierarchy, validating with `RecallWorkspace.stage34.test.tsx`, `RecallWorkspace.stage37.test.tsx`, `App.test.tsx`, lint/build, `git diff --check`, `node --check`, and a dedicated Windows Edge desktop-first Home harness against the live app at `http://127.0.0.1:8000`
- 2026-03-19: completed the Stage 358 desktop-first Home milestone audit against wide desktop `Home`, `Graph`, `Study`, `Notes`, and `Reader` captures plus focused overview, focused `Graph`, focused `Study`, focused `Notes`, and focused `Reader` regression captures, confirmed that the Home milestone succeeded overall and materially changed the wide desktop `Home` surface, then promoted Stage 359 plus pre-staged Stage 360 as the next Reader-first milestone while keeping `Graph` and `Home` locked as regression baselines and `Study` frozen
