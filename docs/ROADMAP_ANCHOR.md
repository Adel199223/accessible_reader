# Roadmap Anchor

Persistent continuity anchor for future chats and handoffs.

## Default Meaning Of "Roadmap"

- Unless explicitly redirected, `roadmap`, `master plan`, and `next milestone` mean the active plan for this workspace.
- If a task deviates for a blocker or correction, record it and return to the roadmap afterward.

## Resume Snapshot

- Canonical repo path: `\\wsl.localhost\Ubuntu\home\fa507\dev\accessible_reader`
- Active branch: `codex/stage8-closeout-doc-sync`
- Last pushed clean commit: `57ff0a0d30c550353d87d3feeb68b149331a85cf`
- Local/remote status at anchor update: clean and in sync
- Last completed product slice: Stage 47 `Recall Study Centered Review Surface First Pass`
- Last completed audit: Stage 46 `Post-Stage-45 Benchmark Audit`
- Active next slice: Stage 48 `Post-Stage-47 Benchmark Audit`
- Last green checks:
  - `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/components/RecallWorkspace.stage37.test.tsx src/components/RecallWorkspace.stage34.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
  - targeted `src/App.test.tsx` passes for the Stage 47 Study browse/handoff checks
  - `frontend npm run lint`
  - `frontend npm run build`
  - repo-owned real Edge screenshot capture via `node scripts/playwright/stage47_study_centered_review_edge.mjs`
- Known caveat:
  - run git, npm, and browser-validation commands through `wsl.exe bash -lc ...` or inside WSL directly; UNC-native Windows `npm`/`node` invocations remain less reliable than the WSL wrapper path
  - the large `frontend/src/App.test.tsx` suite still stalls when run as one whole-file pass, so targeted coverage plus real Edge smoke remain the trustworthy validation path for this area
- First files to read in a new chat:
  - `AGENTS.md`
  - `BUILD_BRIEF.md`
  - `docs/ROADMAP.md`
  - `docs/ROADMAP_ANCHOR.md`
  - `docs/ux/recall_benchmark_matrix.md`
  - `docs/exec_plans/active/2026-03-15_stage48_post_stage47_benchmark_audit.md`

## New Chat Resume Shortcut

- Say `resume from Stage 48` to continue from the next recommended step.
- The intended next action is:
  - run the Stage 48 benchmark audit against the current Home, Graph, Study, and focused-Study surfaces
  - use the benchmark matrix plus fresh screenshots to decide whether the next bounded implementation slice should target Home density/selectivity or a lighter second Study pass
- Do not reopen backend/storage work, Reader route contracts, or Stage 34 reader-led split behavior during that audit unless a direct regression is discovered.

## Current State

As of 2026-03-15, this workspace includes:

- the existing accessible-reader frontend and backend
- local import and parsing for TXT, Markdown, HTML, DOCX, and text-based PDF
- public article-style webpage import that fetches once, stores a local HTML snapshot, and reopens from that snapshot
- deterministic `Original` and `Reflowed` views
- Edge-first browser speech with sentence highlighting
- opt-in OpenAI `Simplify` and `Summary`
- local library/search, reopen support, and persisted reader settings/progress
- a calmer shared Recall shell with a slimmer left workspace rail, slimmer top bar, and lighter browse chrome
- a browse-first Home landing with a two-zone sidebar + collection canvas, grouped recency sections, lighter older-source rows, inline resume affordance, search, and a top-level add-source entry
- an add-source flow that now uses one clear `Add content` heading plus grouped `Paste text`, `Web page`, and `Choose file` modes inside the global dialog
- a browse-mode `Graph` surface that now leads with a graph-first canvas, a lighter support rail, and a floating node-detail overlay with explicit `Focus source` and Reader handoffs
- a browse-mode `Study` surface that now uses a centered review/start frame, lighter supporting queue chrome, and a stronger main review card hierarchy while preserving local evidence and Reader reopen
- a compact focused-source strip plus reader-led focused `Notes`, `Graph`, and `Study` work beside live source content once source entry is intentional
- user-reported contrast and overflow regressions on the landing were corrected during the Stage 38 audit, Stage 39 further reduced repeated chrome, and Stage 41 materially converged the shared shell and top-level surfaces toward the benchmark
- a benchmark matrix in `docs/ux/recall_benchmark_matrix.md` now anchors future UI work to the user-provided Recall screenshots plus official Recall docs/blog/changelog references
- Stage 47 materially improved Study, so the next decision is now whether Home density/selectivity or a lighter second Study pass is the higher-value remaining correction
- a bounded assistant harness in `agent.md` and `docs/assistant/`
- Stage 0/1 planning logs, research notes, repo-fit notes, and future integration logs
- completed Stage 1 through Stage 8 ExecPlans plus a post-Stage 8 placeholder for the next user-directed milestone
- backend shared-core groundwork:
  - `workspace.db` as the primary database target
  - automatic migration from legacy `reader.db`
  - shared tables for source documents, document variants, reading sessions, app settings, change events, chunks, entity mentions, knowledge nodes/edges, review cards/events, and embeddings
  - a generic source locator in storage so pasted text, files, and future URL imports can share one document model
  - UUIDv7-style IDs for new shared records
  - migration tests that preserve reader listing, view loading, progress restore, and settings
- Stage 1 validation closeout is complete:
  - frontend `npm test -- --run`, `npm run lint`, and `npm run build` pass
  - backend `pytest` and app import checks pass
- Stage 2 Recall shell closeout is complete:
  - `Recall` is the default app shell
  - Reader remains a dedicated integrated section
  - deterministic chunking, keyword retrieval, and Markdown export are live
- Stage 3 and Stage 4 closeout is complete:
  - graph extraction and correction are live
  - hybrid retrieval is live
  - source-grounded study cards and FSRS-backed review logging are live
- Stage 5 closeout is complete:
  - a bounded MV3 browser companion is live
  - localhost browser-context retrieval is live
  - low-noise in-page resurfacing, popup lookup, and extension options are live
- Stage 6 closeout is complete:
  - Markdown round-trip fidelity now preserves headings, ordered lists, nested lists, and quotes through import/export
  - shared document views now carry block metadata plus deterministic variant metadata
  - shared reader sessions now store summary detail and accessibility snapshots alongside sentence progress
  - Reader restores from backend last-session state when browser-local session storage is empty
- Stage 7 closeout is complete:
  - workspace change-log APIs are live
  - portable attachment refs and workspace export manifests are live
  - workspace export zip bundles now include manifest plus stored source attachments
  - deterministic merge-preview rules are live without enabling full sync
- Stage 8 closeout is complete:
  - workspace integrity and repair APIs are live
  - startup self-healing now repairs drifted FTS indexes and refreshes derived Recall state when needed
  - export manifests now carry non-fatal missing-attachment warnings while zip export remains available
  - a deterministic benchmark harness now measures ingest, retrieval, browser-context, export, merge preview, and study scheduling flows
- a bounded pre-Stage-9 stabilization detour is complete:
  - fetch-level network failures now show actionable local-service reconnect guidance instead of raw `Failed to fetch`
  - Recall now exposes explicit unavailable states for library, graph, study, and document-detail loading plus retry actions
  - Reader now distinguishes `empty library` from `service unavailable` while keeping import controls usable
  - live Playwright smoke coverage now includes outage and retry recovery checks for both Recall and Reader
- the Stage 1-8 closeout is published on branch `codex/stage8-closeout-doc-sync`
  - product/state closeout commit: `bf3be7f77e56f4e0a00896dcf0a0df4c999db57a`
  - assistant-docs sync commit: `27b7b42d785374236d11f0c335032e9dfab575bf`
  - remote parity was confirmed immediately after push
- Stage 9 closeout is complete:
  - shared note storage, note FTS, note change events, and note CRUD/search routes are live in the backend
  - Reader now supports sentence-range note capture, persisted note highlighting, and route-anchor jump-back inside deterministic `reflowed/default`
  - Recall now includes a dedicated `Notes` section with document-scoped note lists, note search, edit/delete flows, and `Open in Reader`
  - stale saved-session view/note fetches now wait until the active document resolves, preventing noisy startup 404s after document removal
  - backend/frontend/extension validation and a live Playwright note smoke run on a clean temp workspace are green
- Stage 10 closeout is complete:
  - the MV3 companion now supports bounded browser note capture for exact saved public-page matches
  - note hits now surface in Recall retrieval and browser-context summaries
  - a debug-only extension inspection build plus a real Edge unpacked-extension harness close the prior live-validation gap
- the Reader shell convergence correction is complete:
  - Reader now renders inside Recall-native hero, sidebar, tab, and card patterns instead of a standalone sibling app shell
  - product-facing runtime labels now use `Recall Workspace` and `Recall Workspace API`
- the Reader-as-section parity follow-up is complete:
  - the shared workspace section row now owns `Library`, `Graph`, `Study`, `Notes`, and `Reader`
  - returning from Reader preserves the prior Recall section instead of defaulting back to `Library`
  - compact no-document Reader onboarding still exposes `Settings` without reviving the old standalone Reader shell
- Stage 11 is complete:
  - portable `recall_note` entities now participate in workspace export manifests and merge-preview decisions
  - Notes detail now promotes notes into confirmed graph nodes and manual study cards
  - promoted manual graph/study artifacts survive derived graph refreshes and deterministic study-card regeneration
  - a live localhost browser smoke is green after catching and fixing the promoted-card Study landing edge case
- Stage 12 roadmap refresh is complete:
  - a live localhost UX audit confirmed the largest remaining gap is workflow polish in the add/search/read/note loop, not another backend feature tier
  - the next milestone is now a frontend-first shell and Reader workflow polish slice
- Stage 13 workflow polish is complete:
  - Recall now exposes global `New` and `Search` actions with a reusable add-source dialog and a fresh-session workspace search surface
  - global search now hands source and note results back into Recall sections and anchored Reader reopen flows
  - Reader now keeps source and note context adjacent in a focused split-view layout instead of stacking support chrome above the document
  - frontend validation, live Edge import/search smokes, and the repo-owned Edge extension harness are green after the shell change
- Stage 14 density and contextual Reader polish is complete:
  - shared shell chrome now compacts further during active working states, so the working surface begins higher on the page
  - Reader context now includes a richer current-source glance with note state, capture readiness, direct actions, and stickier desktop behavior
  - narrower-width Reader layouts now keep context reachable with denser two-column and stacked fallbacks
  - frontend validation plus a repo-owned real Edge density smoke harness are green
- Stage 15 collection density and detail handoffs are complete:
  - `Library` now uses a denser collection rail with local filtering, compact source rows, and selected-document briefs that keep reopen/export/note handoffs close to the list
  - `Notes` now use a tighter filter row, compact note rows with anchor/body/document context, and a selected-note detail layout that separates note-promotion actions from the main edit/open controls
  - frontend validation plus a repo-owned real Edge collection-density smoke covering Library filter, Notes handoff, and anchored Reader reopen are green
- Stage 16 graph and study density plus evidence handoffs are complete:
  - `Graph` now uses a denser node review rail plus evidence-first node detail with nearby Reader reopen actions
  - `Study` now uses a denser queue, source-evidence-first active-card detail, and anchored Reader reopen from note-promoted evidence
  - the live Edge smoke exposed and fixed a real Study handoff bug where targeted cards could fall out of the loaded queue window; final frontend validation and the repo-owned real Edge graph/study smoke are green
- Stage 17 post-Stage-16 Recall UX refresh is complete:
  - the audit confirmed the next bottleneck is workspace continuity rather than another generic density pass
  - the highest-friction remaining break is that section filters, selected items, and detail context are still too ephemeral across Reader handoff, search landings, and route changes
  - the next slice is now a bounded continuity and navigation-memory correction
- A product-direction correction is now fully implemented:
  - Recall remains the product shell
  - Reader keeps its reading behaviors while now presenting as a Recall section instead of a separate app identity
- A UX-priority correction is now the active guidance baseline:
  - preserve local-first behavior, routes, anchors, browser-companion handoff, and reading continuity
  - change layout, shell hierarchy, and interaction patterns whenever that materially improves Recall-quality UX
  - treat the original Recall app as a directional benchmark for workflow and hierarchy rather than a pixel-perfect copy target

## Current Limits

- local TTS is intentionally deferred and must remain a future milestone
- scanned or image-only PDFs are detected and rejected instead of OCR'd
- OpenAI transforms require a configured `OPENAI_API_KEY`
- future providers and future chat/Q&A are intentionally deferred
- webpage import is intentionally limited to public article-style HTML pages; live URL sync, browser-tab capture, login-gated pages, and JS-heavy app pages remain out of scope
- the browser companion is intentionally context-only; it does not import the current tab or capture private page data into storage
- `msedgedriver` is still absent on this machine, so live Edge interaction checks currently rely on the temporary Windows-side Playwright harness under `C:\Users\FA507\AppData\Local\Temp\accessible-reader-playwright`
- repo/package renaming beyond current runtime labels is still deferred until a later cleanup slice

## Current Roadmap Status

- The active roadmap is no longer Stage 1 stabilization.
- Stage 1 is complete after the resumed validation rerun came back green.
- Stage 2 is complete after the Recall shell, chunking, keyword retrieval, and Markdown export slice landed.
- Stage 3 and Stage 4 are complete after the combined graph/retrieval/study pass landed.
- Stage 5 is complete after the localhost browser companion, backend browser-context API, extension build/tests, and Edge smoke run landed.
- Stage 6 is complete after portability/accessibility contracts, reader-session metadata, backend/frontend validation, and the Edge structured-Markdown/session-restore smoke run landed.
- Stage 7 is complete after the change-log/export/merge groundwork, backend/frontend validation, and the localhost API smoke run landed.
- Stage 8 is complete after the integrity/repair APIs, benchmark harness, extension timeout hardening, validation matrix, and localhost integrity/repair smoke run landed.
- The bounded pre-Stage-9 stabilization detour is complete after the frontend resilience pass, validation reruns, and live outage/recovery smoke checks landed.
- Stage 9 is complete after the shared note-storage slice, Reader note capture/jump-back, Recall note management, validation reruns, and the live Playwright temp-workspace smoke run landed.
- Stage 10 is complete after the browser note-capture, note-aware retrieval, debug harness, and real Edge unpacked-extension validation pass landed.
- The Reader shell convergence correction is complete after the Recall-first UI realignment and product-label cleanup landed.
- Stage 11 is complete.
- Stage 12 is complete after the UX audit and next-slice decision landed.
- Stage 13 is complete.
- Stage 14 is complete.
- Stage 15 is complete.
- Stage 16 is complete.
- Stage 17 is complete after the UX audit and next-slice decision landed.
- Stage 18 is complete after the workspace continuity correction landed.
- Stage 19 is complete after the shared shell dock and recent-work correction landed.
- Stage 20 is complete after the adaptive shell compression and detail-consolidation correction landed.
- Stage 21 is complete after the post-Stage-20 UX audit landed.
- Stage 22 is complete after the unified workspace-search continuity correction landed.
- Stage 23 is complete after the post-search UX audit identified note adjacency as the next workflow bottleneck.
- Stage 24 is complete after the Reader notebook-adjacency correction landed.
- Stage 25 is complete after the post-Stage-24 UX audit identified source fragmentation as the next workflow bottleneck.
- Stage 26 source-centered workspace detail and tabbed handoffs is complete:
  - Recall and Reader now share a source-workspace frame with nearby `Overview`, `Reader`, `Notes`, `Graph`, and `Study` handoffs
  - source-focused transitions now preserve the active source instead of letting stale Graph or Study detail override it
  - targeted frontend validation plus a repo-owned real Edge source-workspace smoke are green
- Stage 27 post-Stage-26 Recall UX refresh is complete:
  - the audit confirmed the remaining bottleneck is not source identity, but that source tabs still land inside section-first layouts with duplicated detail panels and always-visible collection rails
  - the next slice is now shared source-pane consolidation with lighter contextual browsing
- Stage 28 shared source panes and contextual collection drawers is complete:
  - `Overview` now acts as a real source summary surface with nearby saved-note, graph, and study context plus direct next actions
  - source-focused landings now collapse Library, Notes, Graph, and Study browsing into lighter contextual drawers while manual section clicks still reopen full browse mode
  - targeted frontend validation plus a repo-owned real Edge shared-source-pane smoke are green
- Stage 29 post-Stage-28 Recall UX refresh is complete:
  - the audit confirmed Stage 28 solved repeated section-local source detail, but active source work still starts too low in the page under dashboard shell chrome
  - the Recall benchmark now points more toward source/card-first focus with expanded reading space and flexible split work than toward keeping the current shell stacked above the source canvas
- Stage 30 focused source mode and collapsible workspace chrome is complete:
  - source-focused sessions now promote the active source workspace above generic shell support chrome in both Recall and Reader
  - hero, current-context, and recent-work panels now collapse behind an explicit `Show workspace support` affordance during source-focused work
  - manual section clicks still reopen browse-first surfaces while source-workspace tabs preserve source-focused return flows
  - targeted frontend validation plus a repo-owned real Edge Stage 30 smoke are green
- Stage 31 post-Stage-30 Recall UX refresh is complete:
  - the audit confirmed the shell-chrome collapse solved the prior stacking problem
  - the next highest-friction break is that source-local work still requires hard switches between full-surface `Reader`, `Notes`, `Graph`, and `Study` tabs
  - the next slice is now flexible source split work plus adaptable side panes
- Stage 32 flexible source split work and adaptable side panes is complete:
  - focused `Notes`, `Graph`, and `Study` now keep the active source visible in a split workspace instead of replacing the full source surface
  - manual section clicks still reopen browse-first surfaces while source-local work stays adjacent
  - `frontend npm run lint`, `frontend npm run build`, and the repo-owned real Edge Stage 32 smoke are green
- Stage 33 post-Stage-32 Recall UX refresh is complete:
  - the audit confirmed the remaining bottleneck is no longer split-work adjacency itself
  - the next highest-friction break is that split work still anchors too often around `Source overview` instead of the live source in `Reader`
  - the next slice is now a reader-led source split and contextual evidence-pane correction
- Stage 34 reader-led source split and contextual evidence panes is complete:
  - focused `Notes`, `Graph`, and `Study` now keep the embedded Reader steady beside the active tool instead of keeping `Source overview` steady
  - note anchors, graph evidence, and study source spans now retarget the embedded Reader in place while explicit Reader deep links stay intact
  - targeted frontend validation plus the repo-owned real Edge Stage 34 smoke are green
- Stage 35 collection-first Recall shell reset is complete:
  - default Recall now opens in a collection-first shell with a rail, top bar, primary canvas, and lighter utility dock
  - focused source work now uses a compact source strip and no longer depends on the old support-strip reopen model
  - targeted shell/frontend validation plus the refreshed repo-owned real Edge Stage 34 smoke are green
- Stage 36 post-Stage-35 Recall UX refresh is complete:
  - the audit confirmed the reader-led focused split work and responsive shell are no longer the main bottlenecks
  - the highest-friction remaining break is that populated `/recall` still auto-resumes into source-focused Library instead of a true collection-first landing
  - the next slice is now a collection-first landing and intentional source-entry correction
- Stage 37 true collection-first landing and intentional source entry is complete:
  - populated `/recall` now stays browse-first by default instead of auto-entering focused source mode
  - the default Library landing now uses a source-card canvas and inline resume affordance instead of keeping `Source overview` steady on load
  - targeted frontend validation plus the repo-owned real Edge Stage 37 smoke are green
- Stage 38 post-Stage-37 Recall UX refresh is complete:
  - the audit confirmed the next bottleneck is visual hierarchy and density, not entry behavior
  - fresh live screenshots now show a calmer landing, but the app still remains denser and more label-heavy than the benchmark
  - the next slice is now a bounded hierarchy/density cleanup rather than another shell or navigation rewrite
- Stage 39 Recall hierarchy cleanup and responsive card density is complete:
  - the default landing now uses calmer, wider source cards with clearer hierarchy and less repeated chrome
  - focused Library no longer renders inline `Search workspace`, and the focused source strip now carries less chip overload
  - targeted frontend validation, the repo-owned real Edge Stage 37 smoke, and the repo-owned Stage 39 screenshot harness are green
- Stage 40 benchmark-driven Recall surface audit is complete:
  - the audit is now anchored to user-provided Recall screenshots plus official Recall docs/blog/changelog references
  - a benchmark matrix and fresh localhost screenshots now lock the biggest remaining gaps across Library, Add Content, Graph, Study, and the shared shell
  - the next slice is now Stage 41 shared-shell and surface convergence
- Stage 41 Recall shared shell and surface convergence is complete:
  - the shared shell is calmer, Library now uses a two-zone sidebar + collection canvas, and the add-source flow now groups explicit import modes
  - browse-mode Graph and Study no longer keep the extra utility dock and now frame their main task more intentionally
  - targeted frontend coverage, `frontend npm run build`, file-scoped ESLint on the touched frontend files, and the repo-owned real Edge Stage 41 screenshot harness are green
  - the next slice is now a benchmark audit of the live Stage 41 captures before reopening more implementation
- Stage 42 post-Stage-41 benchmark audit is complete:
  - the audit confirmed the shared shell direction is now correct, but the highest-leverage remaining mismatch is the populated Library/home surface
  - Add Content is close enough to ride with the next Library slice, while Graph and Study remain queued medium mismatches rather than the immediate next target
  - the next slice is now Stage 43 Library selectivity and add-source hierarchy cleanup
- Stage 43 Recall Library selectivity and add-source hierarchy cleanup is complete:
  - Library now groups recent sources into clearer sections, while older material reopens from lighter rows instead of one archive wall
  - the add-content dialog now uses one clear heading with grouped import modes instead of a duplicated title stack
  - targeted frontend coverage, `frontend npm run build`, file-scoped ESLint on the touched files, and the repo-owned real Edge Stage 43 screenshot harness are green
  - the next slice is now a benchmark audit to choose between Graph and Study as the next bounded surface pass
- Stage 44 post-Stage-43 benchmark audit is complete:
  - the audit confirmed Graph browse mode as the stronger remaining benchmark gap, while Library/home no longer needed the next full implementation slice
  - the user-requested terminology cleanup from `Library` to `Home` is now locked into the next bounded product pass
  - the next slice is now Stage 45 Graph canvas first pass and Home terminology cleanup
- Stage 45 Recall Graph canvas first pass and Home terminology cleanup is complete:
  - the shared shell and landing now use `Home` terminology while internal section keys stay stable
  - browse-mode Graph now uses a dominant graph canvas, lighter support chrome, and a floating node detail overlay instead of a detail-first dashboard frame
  - targeted frontend coverage, `frontend npm run lint`, `frontend npm run build`, and the repo-owned real Edge Stage 45 screenshot harness are green
  - the next slice is now a benchmark audit to choose whether Study is finally the higher-value next surface pass
- Stage 46 post-Stage-45 benchmark audit is complete:
  - fresh Home, Graph, Study, and focused-graph captures confirmed that Study is now the clearest remaining top-level benchmark mismatch
  - Home still reads denser than the Recall reference on populated datasets, but it is now secondary to Study rather than the roadmap bottleneck
  - Graph is materially closer after Stage 45 and no longer needs the next full implementation slice
  - the next slice is now Stage 47 Study centered review surface first pass
- Stage 47 Recall Study centered review surface first pass is complete:
  - browse-mode Study now leads with a centered review/start frame, calmer step hierarchy, and lighter queue chrome instead of a dashboard-first stack
  - focused Study still preserves the reader-led split and explicit Reader reopen actions
  - targeted frontend validation, `frontend npm run lint`, `frontend npm run build`, and the repo-owned real Edge Stage 47 screenshot harness are green
  - the next slice is now Stage 48 post-Stage-47 benchmark audit

## Recent Detours

- 2026-03-13: created the Stage 0/1 planning set and shifted the roadmap from UI-only polish to shared-core work
- 2026-03-13: implemented backend shared-core storage, legacy `reader.db` migration, and migration coverage while keeping reader routes stable
- 2026-03-13: implemented and validated bounded public webpage snapshot import for article-style pages with local HTML snapshot storage, deterministic article extraction, frontend `Web page` import UI, and snapshot cleanup through the existing delete path
- 2026-03-13: resumed the interrupted Stage 1 validation rerun, confirmed frontend and backend checks are green, and moved the active ExecPlan to Stage 2
- 2026-03-13: completed Stage 2 Recall shell integration and then, at the user's direction, opened one combined Stage 3/4 implementation pass instead of sequencing them separately
- 2026-03-13: completed the combined Stage 3/4 pass with graph extraction, graph feedback, hybrid retrieval, source-grounded study cards, FSRS-backed review logs, and a live Edge-channel validation run
- 2026-03-13: completed Stage 5 augmented browsing with a localhost browser-context API, MV3 extension popup/options/content surfaces, extension tests/build, and an unpacked Edge validation run
- 2026-03-13: completed Stage 6 portability and accessibility integration with shared variant contracts, shared reader-session metadata, backend/frontend coverage, and an Edge structured-Markdown/session-restore validation run
- 2026-03-13: completed Stage 7 tablet-safe groundwork with workspace change-log APIs, portable export bundles, deterministic merge preview, backend/frontend coverage, and a localhost API smoke run
- 2026-03-13: completed Stage 8 hardening and benchmarks with workspace integrity/repair APIs, startup FTS self-healing, benchmark coverage, extension timeout hardening, and localhost integrity/repair validation
- 2026-03-13: published the Stage 1-8 closeout branch, synced touched assistant docs, and approved the Stage 9-11 roadmap extension centered on notes, browser capture, and portable apply flows
- 2026-03-13: completed a pre-Stage-9 stabilization detour that replaced raw `Failed to fetch` copy with actionable local-service guidance, added retryable unavailable states in Recall and Reader, and verified outage/recovery behavior in Playwright before resuming Stage 9
- 2026-03-13: completed Stage 9 source-linked highlights and notes with shared note storage/search, Reader note capture and anchored jump-back, Recall note management, stale-session startup guards, full validation reruns, and a live Playwright temp-workspace smoke pass
- 2026-03-14: approved a bounded Stage 10 closeout extension for a debug-only extension validation harness plus a manual Edge unpacked-extension smoke, followed immediately by Reader shell convergence into the Recall-first workspace
- 2026-03-14: completed the Stage 10 closeout with browser note capture, note-aware retrieval, a debug-only extension inspection build, and a real Edge unpacked-extension harness pass, then completed the Reader shell convergence correction with Recall-first UI alignment and runtime label cleanup
- 2026-03-14: completed a Reader-as-section parity follow-up that removed the remaining top-level `Recall | Reader` split, unified the workspace section row, restored prior-section return behavior after Reader navigation, kept no-document Settings reachable, and reran the full validation matrix plus the real Edge debug harness
- 2026-03-14: completed Stage 11 with portable `recall_note` manifest coverage, note-to-graph and note-to-study promotion flows, preservation of promoted manual knowledge across rebuilds, and a live localhost browser smoke that exposed and fixed the promoted-card Study landing bug
- 2026-03-14: approved a UX-first guidance correction so future roadmap work preserves behaviors and local-first guarantees while explicitly allowing shell, layout, and workflow changes whenever that improves Recall-quality UX
- 2026-03-14: completed the Stage 12 roadmap refresh with a live localhost UX audit, identified workflow polish as the highest-leverage gap, and opened Stage 13 for global add/search flow plus focused Reader split-view work
- 2026-03-14: completed Stage 13 with shell-level add/search actions, a fresh-session workspace search dialog, focused Reader split view, a defensive keyboard-shortcut guard fix, frontend validation reruns, live Edge import/search smokes, and a green rerun of the repo-owned Edge extension harness
- 2026-03-14: completed Stage 14 with denser shared shell chrome, richer sticky Reader current-source context, narrower-width layout tightening, a Reader-toolbar accessibility landmark correction, frontend validation reruns, and a repo-owned real Edge density smoke harness plus visual artifacts
- 2026-03-14: completed Stage 15 with denser Library and Notes collection rails, tighter selected-item detail panels, a `View notes` Library handoff, grouped note-promotion controls, frontend validation reruns, and a green repo-owned real Edge collection-density smoke covering Library filter and anchored Reader reopen
- 2026-03-14: completed Stage 16 with denser Graph and Study review surfaces, evidence-adjacent Reader reopen actions, a repo-owned real Edge graph/study smoke harness, and a frontend fix so targeted Study card handoffs no longer fall back to some unrelated visible card when the queue window is truncated
- 2026-03-14: completed the Stage 17 UX refresh audit using the existing Stage 13-16 live artifacts, current shell/state architecture, the product brief, and the original Recall workflow benchmark, then opened Stage 18 to repair workspace continuity and navigation memory before adding more surface area
- 2026-03-14: completed Stage 18 with app-level workspace continuity for Library, Notes, Graph, and Study plus a repo-owned real Edge continuity smoke harness, then opened Stage 19 to make the remembered working set visible and faster to revisit through a shared current-context dock and recent-work switching
- 2026-03-14: completed Stage 19 with a shared shell current-context dock, bounded recent-work switching, targeted frontend coverage, and a repo-owned real Edge current-context smoke harness, then opened Stage 20 to compress duplicated shell and section context now that visibility is in place
- 2026-03-14: completed Stage 20 with a section-aware shell dock compression pass, lighter Reader sidecar and Notes detail context, targeted frontend coverage, and a repo-owned real Edge context-compression smoke harness, then opened Stage 21 to reassess the live workspace before choosing the next bounded slice
- 2026-03-14: completed the Stage 21 UX refresh audit using the current shell/state architecture, the live Stage 13-20 artifacts, the product brief, and the Recall benchmark, then opened Stage 22 to unify workspace search continuity and result/detail handoffs before another shell or feature pass
- 2026-03-14: completed Stage 22 with one shared workspace-search session across the shell dialog and Library panel, selection-first focused-result actions, targeted frontend validation, and a repo-owned real Edge search-continuity smoke harness, then opened Stage 23 for a fresh post-search UX audit
- 2026-03-14: completed the Stage 23 UX refresh audit using the live post-search workspace, current shell/state architecture, the product brief, and current Recall benchmark material, then opened Stage 24 to pull saved-note work closer to Reader through notebook-style adjacency instead of widening search or shell scope again
- 2026-03-14: completed Stage 24 with a Reader notebook-style note workbench, in-place note editing and promotion, targeted frontend validation, and a repo-owned real Edge notebook-adjacency smoke harness, then opened Stage 25 for a fresh post-Stage-24 UX audit
- 2026-03-14: completed the Stage 25 UX refresh audit using the live post-Stage-24 workspace, current shell/state architecture, the product brief, and official Recall benchmark material, then opened Stage 26 to consolidate source-focused work into a source-centered detail frame with nearby tabbed handoffs
- 2026-03-14: completed Stage 26 with a shared source-workspace frame across Recall and Reader, source-tab handoffs for `Overview`/`Reader`/`Notes`/`Graph`/`Study`, a continuity fix so stale Graph or Study detail no longer overrides the active source, targeted frontend validation, and a repo-owned real Edge source-workspace smoke harness, then opened Stage 27 for a fresh post-Stage-26 UX audit
- 2026-03-14: completed the Stage 27 UX refresh audit using the live post-Stage-26 artifacts, the product brief, and current Recall docs/changelog direction, then opened Stage 28 to turn source tabs into a true shared source-pane system with lighter contextual collection browsing
- 2026-03-14: completed Stage 28 with a stronger source `Overview`, lighter contextual browse drawers for Library/Notes/Graph/Study during source-focused work, targeted frontend validation, and a repo-owned real Edge shared-source-pane smoke harness, then opened Stage 29 for a fresh post-Stage-28 UX audit
- 2026-03-14: completed the Stage 29 UX refresh audit using the live Stage 28 artifacts, current shell/state architecture, the product brief, and current Recall benchmark material, then opened Stage 30 to make active source work take over the workspace before adding more feature surface
- 2026-03-14: completed Stage 30 with a shell-owned source-focused mode, collapsible workspace support chrome, a repo-owned real Edge smoke harness, and live localhost recovery on both `127.0.0.1:8000` and `127.0.0.1:5173`, then opened Stage 31 for a fresh post-Stage-30 UX audit
- 2026-03-15: completed the Stage 31 UX refresh audit using the live Stage 30 artifacts, the product brief, and current Recall benchmark material, then opened Stage 32 to keep one source visible while related note, graph, and study work move into adaptable side panes
- 2026-03-15: completed Stage 32 with source-local split work for Notes/Graph/Study plus a repo-owned real Edge smoke, then completed the Stage 33 UX refresh audit and opened a reader-led split-work correction so live source content becomes the steady pane instead of `Source overview`
- 2026-03-15: completed Stage 34 with reader-led focused split work and in-place evidence retargeting, then, by explicit user direction, completed a Stage 35 collection-first shell reset immediately afterward instead of waiting for the usual audit interstitial, and opened Stage 36 to audit the new shell before choosing the next bounded slice
- 2026-03-15: completed the Stage 36 shell audit using the user-shared benchmark, the product brief, live localhost inspection, and Stage 34 artifacts, then opened Stage 37 to make `/recall` truly collection-first on populated workspaces instead of auto-entering focused source mode
- 2026-03-15: completed Stage 37 with explicit browse-vs-focused source continuity, a browse-first source-card landing, and a repo-owned real Edge validation run, then opened Stage 38 to audit the calmer landing and decide the next bounded UI correction
- 2026-03-15: completed the Stage 38 audit using fresh live screenshots at desktop and tablet widths, fixed the user-reported contrast/overflow regressions, and opened Stage 39 to clean up hierarchy and density without reopening navigation logic
- 2026-03-15: completed Stage 39 with a quieter Library top bar, wider responsive source cards, lighter focused Library framing, a repo-owned Stage 39 screenshot harness, and a green rerun of the Stage 37 browse-first smoke, then opened Stage 40 for a fresh post-implementation UX audit
- 2026-03-15: replaced the generic Stage 40 audit with a benchmark-driven Recall surface audit anchored to the user-provided screenshots plus official Recall docs/blog/changelog sources, captured a fresh localhost benchmark set and matrix, and opened Stage 41 for shared-shell and surface convergence
- 2026-03-15: completed Stage 41 with a calmer shared shell, a two-zone Library landing, grouped add-source import modes, quieter Graph and Study browse framing, targeted frontend coverage, and a repo-owned real Edge screenshot harness, then opened Stage 42 to benchmark the live result before choosing the next bounded slice
- 2026-03-15: completed the Stage 42 benchmark audit against the Stage 41 captures and the Recall benchmark matrix, confirmed Library/home selectivity as the highest-leverage next fix, and opened Stage 43 to tighten the populated landing plus the remaining add-source hierarchy
- 2026-03-15: completed Stage 43 with grouped Library recency sections, lighter reopen rows, and a single-heading add-content dialog, validated it with targeted tests plus a real Edge screenshot harness, and opened Stage 44 to choose whether Graph or Study is now the higher-value benchmark follow-up
- 2026-03-15: completed the Stage 44 benchmark audit against the refreshed Stage 43 artifacts, confirmed Graph as the stronger remaining mismatch, folded in the user-requested `Home` terminology cleanup, and opened Stage 45 for the next bounded implementation slice
- 2026-03-15: completed Stage 45 with a graph-first browse canvas, lighter graph support chrome, and user-facing `Home` terminology in the shared shell, then opened Stage 46 for the next benchmark audit
- 2026-03-15: completed the Stage 46 benchmark audit against fresh Home, Graph, Study, and focused-graph captures, confirmed Study as the clearest remaining top-level mismatch, and opened Stage 47 for the next bounded implementation slice
- 2026-03-15: completed Stage 47 with a centered Study review/start surface, lighter supporting queue chrome, preserved reader-led focused Study work, targeted frontend validation, and a repo-owned real Edge screenshot harness, then opened Stage 48 for the next benchmark audit

## Resume Checklist

1. Read `docs/ROADMAP.md`.
2. Read this anchor.
3. Read `docs/ux/recall_benchmark_matrix.md`, then open the active Stage 48 ExecPlan in `docs/exec_plans/active/`.
4. Start from branch `codex/stage8-closeout-doc-sync`.
5. Keep backend `workspace.db` compatibility intact, including the Stage 8 integrity/repair and benchmark paths.
6. Preserve the current local-first behaviors, routes, anchors, browser-companion handoff, and Reader capabilities while auditing the post-Stage-47 Home, Graph, Study, and focused-study surfaces against the benchmark.
7. Use Stage 48 to choose the next bounded benchmark fix before reopening local TTS, OCR, cloud sync, collaboration, chat/Q&A, or other deferred systems.
8. Use `docs/assistant/INDEX.md` only if assistant routing help is needed.
