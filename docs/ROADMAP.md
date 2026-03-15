# Roadmap

## Product Direction

Keep this repository as one local-first workspace.

- `Recall` is the product shell and workspace identity.
- `Reader` remains an integrated section inside that shell, but the current layout is not frozen; preserve reading behavior, deep links, and data contracts while changing UI structure whenever that materially improves Recall-quality UX.
- `backend/` remains the single local service host for Reader, Recall, and future shared workspace surfaces.
- Shared storage and domain contracts must support current reading behavior first, then expand toward Recall graph/study/export features without a rewrite.
- The original Recall app is the workflow benchmark for navigation clarity, reading focus, note adjacency, split-view usefulness, and obvious next actions; use it directionally without requiring pixel-perfect visual parity.

## Status As Of 2026-03-15

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

## Active Milestone

1. Stage 48: Post-Stage-47 Benchmark Audit
   - compare the refreshed Study surface against the Recall benchmark and fresh localhost captures before choosing another implementation slice
   - decide whether Home density/selectivity or another bounded Study pass is now the higher-value correction

## Next Milestone

1. Stage 48: Post-Stage-47 Benchmark Audit
   - use the Stage 47 artifacts and the benchmark matrix to choose the next bounded surface pass from evidence instead of momentum

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
