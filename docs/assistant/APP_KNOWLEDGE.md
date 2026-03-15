# Assistant App Knowledge

Bridge summary only. Canonical project status and policy live in `BUILD_BRIEF.md`, `docs/ROADMAP.md`, `docs/ROADMAP_ANCHOR.md`, and the active ExecPlan.

## Snapshot
- Local-first Recall workspace for Windows 11, with the repo and toolchain living in WSL.
- Frontend: React + Vite + TypeScript.
- Backend: FastAPI + Python 3.11.
- Storage: SQLite with FTS5.

## Current Product Shape
- Imports pasted text, public article webpage URLs, and local TXT, Markdown, HTML, DOCX, and text-based PDF files.
- Stores a small local saved-source collection with search, reopen support, settings, and reading-progress memory.
- Stores webpage imports as local HTML snapshots and reopens them from the saved snapshot rather than refetching live.
- Uses `Recall` as the product shell with `Reader` presented as a shared workspace section rather than a sibling app.
- Uses a collection-first Recall shell with a slimmer left rail, slimmer top bar, primary canvas, and lighter browse chrome by default.
- Uses a browse-first Home landing with a lighter collection snapshot rail, grouped recency sections, capped reopen groups with explicit `Show all …` reveals, search, and a lightweight selective-landing flow instead of auto-opening focused source mode on populated workspaces.
- Keeps global workspace navigation centered on `Home`, `Graph`, `Study`, `Notes`, and `Reader`.
- Uses a compact focused-source strip during active source work, and focused `Notes`, `Graph`, and `Study` now keep embedded Reader content as the steady primary pane.
- Uses one clear `Add content` dialog with grouped `Paste text`, `Web page`, and `Choose file` modes.
- Uses a graph-first browse-mode `Graph` surface with a dominant canvas, lighter support rail, and a floating detail overlay, and a browse-mode `Study` surface with a centered review/start frame plus lighter supporting queue chrome.
- Uses one shared workspace-search session across the shell `Search` dialog and the Home search panel.
- Reopens the last document and reading mode from browser-local storage, with backend last-session fallback when local state is missing.
- Supports `Original`, `Reflowed`, `Simplified`, and `Summary` document modes.
- Keeps `Original` and `Reflowed` local and deterministic.
- Uses browser-native speech with sentence highlighting as the shipped read-aloud path.
- Uses the shared `workspace.db` backend storage with reader-compatible routes kept stable.
- Includes Recall keyword search, hybrid retrieval, graph review, study cards, Markdown export, source-linked notes, MV3 browser-context resurfacing, browser note capture, portability/export groundwork, and integrity/benchmark tooling.

## Active Constraints
- Windows Edge is the primary browser validation target.
- Run repo commands through WSL; Windows-side UNC `npm`/`node` calls are less reliable than `wsl.exe bash -lc ...`, except for the repo-owned Windows Edge screenshot harnesses.
- Local TTS is deferred and should remain `coming soon`.
- AI is opt-in only and limited to `Simplify` and `Summary`.
- Stage 15 is complete: Library and Notes now use denser collection rails, tighter detail panels, and a repo-owned real Edge collection-density smoke harness.
- Stage 16 is complete: Graph and Study now use denser review surfaces, evidence-first detail panels, and a repo-owned real Edge graph/study smoke harness.
- Stage 17 is complete: the UX audit confirmed the next bottleneck is workspace continuity rather than another generic density pass.
- Stage 18 is complete: Library, Notes, Graph, and Study continuity now survive Reader handoff, browser back, and search-backed landings, and the repo-owned real Edge continuity smoke is green.
- Stage 19 is complete: the shared shell now surfaces current context and bounded recent work, and the repo-owned real Edge shell-context smoke is green.
- Stage 20 is complete: the shared shell dock now compresses by section, Reader no longer repeats a dedicated current-source block, Notes detail is lighter, and the repo-owned real Edge context-compression smoke is green.
- Stage 21 is complete: the UX audit identified search continuity and duplicated search surfaces as the highest-friction remaining workflow break.
- Stage 22 is complete: shell Search and Library search now share one remembered search session with grouped results, focused-result actions, and a repo-owned real Edge continuity smoke.
- Stage 23 is complete: the post-search UX audit confirmed that saved-note work is still too detached from active reading.
- Stage 24 is complete: Reader now keeps selected saved-note editing, deletion, Graph promotion, and Study promotion beside the source, with a repo-owned real Edge notebook-adjacency smoke green.
- Stage 25 is complete: the audit confirmed the next workflow break is source fragmentation across Library, Reader, Notes, Graph, and Study rather than notebook adjacency.
- Stage 26 is complete: one selected source now keeps a shared source-workspace frame with nearby Overview, Reader, Notes, Graph, and Study handoffs across Recall and Reader, and the repo-owned real Edge source-workspace smoke is green.
- Stage 27 is complete: the audit confirmed the remaining bottleneck is that source tabs still land inside section-first layouts with duplicated detail panels and always-visible collection rails.
- Stage 28 is complete: the source workspace now has a stronger Overview plus lighter contextual browse drawers for Library, Notes, Graph, and Study during source-focused work, and the repo-owned real Edge shared-source-pane smoke is green.
- Stage 29 is complete: the audit confirmed the remaining bottleneck is no longer repeated source-local detail, but that active source work still sits under dashboard-level shell chrome instead of taking over the workspace.
- Stage 30 is complete: active source work first moved above generic shell chrome and established the source-focused shell mode that later slices refined.
- Stage 31 is complete: the UX audit confirmed shell stacking is no longer the main issue, and the next bottleneck is still hard switching between full-surface source tools.
- Stage 32 is complete: focused `Notes`, `Graph`, and `Study` now keep one source visible in a split workspace, and the repo-owned real Edge Stage 32 smoke is green.
- Stage 33 is complete: the UX audit confirmed the split workspace still anchors too often around `Source overview` instead of the live source itself.
- Stage 34 is complete: focused `Notes`, `Graph`, and `Study` now keep embedded Reader content as the steady pane, with evidence and anchor actions retargeting in place.
- Stage 35 is complete: default Recall now uses the collection-first shell with a rail, slim top bar, compact focused-source strip, and lighter utility dock.
- Stage 36 is complete: the audit confirmed the main remaining break is not focused split work, but that populated `/recall` still auto-enters focused source mode too eagerly.
- Stage 37 is complete: populated `/recall` now stays browse-first by default, and default Library now uses a calmer source-card landing with inline resume instead of opening focused source chrome immediately.
- Stage 38 is complete: the audit confirmed the next bottleneck is visual hierarchy and density, and it corrected the user-reported dark-on-dark landing text plus the broken high-contrast `New` button while capturing fresh live screenshots.
- Stage 39 is complete: the landing now uses calmer, wider source cards with clearer hierarchy, the Library top bar repeats less chrome, and focused Library no longer renders inline `Search workspace`.
- Stage 40 is complete: the audit is now benchmark-driven, using the user-provided Recall screenshots plus official Recall docs/blog/changelog references and fresh localhost captures recorded in `docs/ux/recall_benchmark_matrix.md`.
- Stage 41 is complete: the shared shell is calmer, Library now uses a two-zone sidebar + collection canvas, the add-source flow now groups explicit import modes, and browse-mode Graph/Study frame their main task more intentionally.
- Stage 42 is complete: the audit confirmed the shared shell direction is now right, but the largest remaining benchmark miss is the populated Library/home surface; Add Content is close enough to ride with that next slice, while Graph and Study stay queued behind it.
- Stage 43 is complete: Library now groups recent material into clearer sections, older sources reopen from lighter rows, and the add-content dialog now uses one clear heading.
- Stage 44 is complete: the audit confirmed Graph browse mode as the stronger remaining benchmark mismatch and locked the user-requested `Home` terminology cleanup into the next bounded implementation slice.
- Stage 45 is complete: the shared shell now uses `Home` instead of `Library` in the user-facing navigation, and browse-mode Graph now leads with a graph-first canvas plus lighter support chrome.
- Stage 46 is complete: the audit confirmed that Study is now the clearest remaining top-level benchmark mismatch, while Home is secondary and Graph is materially closer after Stage 45.
- Stage 47 is complete: browse-mode Study now centers the review/start flow, demotes the queue chrome, and keeps source evidence plus Reader reopen secondary to the main review task.
- Stage 48 is complete: the audit confirmed that Study is materially closer after Stage 47, that Graph remains stable, and that Home is once again the clearest remaining top-level benchmark mismatch.
- Stage 49 is complete: Home now uses a lighter sidebar snapshot, a shorter default landing, and explicit expansion controls for larger recency groups while Graph, Study, and focused Study remain stable.
- Stage 50 is complete: the audit confirmed that Home is materially calmer after Stage 49, that Graph remains stable, and that Study is once again the clearest remaining top-level benchmark mismatch.
- Stage 51 is the active milestone: run a bounded Study sidebar and queue compression second pass so browse-mode Study feels less dashboard-heavy without regressing Home, Graph, or focused reader-led Study work.
- The broad `frontend/src/App.test.tsx` file still has a long-standing stall mode, so the trusted UI-validation path is targeted tests plus real Edge screenshot artifacts rather than one giant whole-file pass.
- Future work should preserve local-first behavior, routes, note anchors, browser-companion handoff, and reading continuity, but should not preserve the current UI arrangement when a better Recall-quality workflow is available.
- Treat the original Recall app as a directional benchmark for workflow and information hierarchy, not as a pixel-perfect copy target.
- The current highest-priority task is to reduce Study browse-mode sidebar and queue chrome while preserving the calmer Home landing and the stable Graph/focused-Study surfaces that Stage 50 revalidated.

## Main Entry Points
- Frontend shell: `frontend/src/App.tsx`
- Speech behavior: `frontend/src/hooks/useSpeech.ts`
- Reader rendering: `frontend/src/components/ReaderSurface.tsx`
- API entrypoint: `backend/app/main.py`
