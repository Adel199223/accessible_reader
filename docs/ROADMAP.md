# Roadmap

## Product Direction

Keep this repository as one local-first workspace.

- `Recall` is the product shell and workspace identity.
- `Reader` remains an integrated section inside that shell, but the current layout is not frozen; preserve reading behavior, deep links, and data contracts while changing UI structure whenever that materially improves Recall-quality UX.
- `backend/` remains the single local service host for Reader, Recall, and future shared workspace surfaces.
- Shared storage and domain contracts must support current reading behavior first, then expand toward Recall graph/study/export features without a rewrite.
- The original Recall app is the workflow benchmark for navigation clarity, reading focus, note adjacency, split-view usefulness, and obvious next actions; use it directionally without requiring pixel-perfect visual parity.

## Status As Of 2026-03-14

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

## Active Milestone

1. Stage 20: Adaptive Context Compression and Detail Consolidation
   - keep the new current-context and recent-work shell visible while reducing redundant metadata and repeated context
   - reclaim space and improve scan speed, especially in Reader and Notes, without losing Stage 18 and 19 continuity behavior

## Next Milestone

1. Post-Stage-20 follow-up to be defined after the adaptive-compression correction lands
   - use Stage 20 outcomes to choose the next bounded slice without reopening deferred systems by default

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
- 2026-03-14: completed a Reader-as-section parity follow-up that removed the remaining top-level `Recall | Reader` split, unified workspace tabs under Recall, restored prior-section return behavior after Reader handoff, kept no-document Settings reachable, and reran the full validation matrix plus the real Edge debug harness
- 2026-03-14: completed Stage 11 with portable `recall_note` manifest coverage, note-to-graph and note-to-study promotion flows, preservation of promoted manual knowledge across rebuilds, and a live localhost browser smoke that exposed and fixed the promoted-card Study landing bug
- 2026-03-14: approved a UX-first guidance correction so future roadmap work preserves local-first behavior, routes, anchors, and reading continuity while explicitly allowing shell, layout, and workflow changes whenever that improves Recall-quality UX
- 2026-03-14: completed the Stage 12 roadmap refresh with a live localhost UX audit, identified workflow polish as the highest-leverage gap, and opened Stage 13 for global add/search flow plus focused Reader split-view work
- 2026-03-14: completed Stage 13 with shell-level add/search actions, a unified workspace search dialog, a focused Reader split view with adjacent source/note context, a defensive Reader keyboard-shortcut fix, frontend validation reruns, live Edge import/search smokes, and a green rerun of the repo-owned Edge extension harness
- 2026-03-14: completed Stage 14 with denser shared shell chrome, richer sticky Reader current-source context, narrower-width layout tightening, a second-banner accessibility correction in the Reader toolbar, frontend validation reruns, and a repo-owned real Edge density smoke harness plus visual artifacts
- 2026-03-14: completed the Stage 17 UX refresh audit using the existing Stage 13-16 live artifacts, current shell/state architecture, the product brief, and the original Recall workflow benchmark, then opened Stage 18 to fix continuity and navigation memory instead of widening scope prematurely
- 2026-03-14: completed Stage 18 with app-level workspace continuity for Library, Notes, Graph, and Study, a repo-owned real Edge continuity smoke harness, and preserved section context across Reader handoff, browser-back flows, and search-backed landings, then opened Stage 19 to surface current context and recent-work switching in the shared Recall shell
- 2026-03-14: completed Stage 19 with a shared current-context dock, bounded recent-work switching, targeted frontend coverage, and a repo-owned real Edge shell-context smoke harness, then opened Stage 20 to compress redundant shell/detail context now that the right working-set information is visible
