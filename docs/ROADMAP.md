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

## Active Milestone

1. Stage 128: Post-Stage-127 benchmark audit
   - compare the refreshed Study surface against the benchmark and fresh localhost captures before choosing the next bounded surface pass
   - keep screenshot review as the gate instead of guessing at another broad rewrite

## Next Milestone

1. Stage 129: Next bounded implementation slice selected by the Stage 128 audit
   - apply the next screenshot-led surface correction only after the fresh Stage 127 audit identifies the clearest blocker
   - keep the redesign bounded and benchmark-led

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
129. Stage 129: Next bounded implementation slice
   - implement the next benchmark-led surface correction selected by the Stage 128 audit
   - keep the scope narrow and protect the calmer Home, Graph, Study, and focused-Study baselines

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
