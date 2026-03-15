# Assistant App Knowledge

Bridge summary only. Canonical project status and policy live in `BUILD_BRIEF.md`, `docs/ROADMAP.md`, `docs/ROADMAP_ANCHOR.md`, and the active ExecPlan.

## Snapshot
- Local-first Recall workspace for Windows 11, with the repo and toolchain living in WSL.
- Frontend: React + Vite + TypeScript.
- Backend: FastAPI + Python 3.11.
- Storage: SQLite with FTS5.

## Current Product Shape
- Imports pasted text, public article webpage URLs, and local TXT, Markdown, HTML, DOCX, and text-based PDF files.
- Stores a small local library with search, reopen support, settings, and reading-progress memory.
- Stores webpage imports as local HTML snapshots and reopens them from the saved snapshot rather than refetching live.
- Uses `Recall` as the product shell with `Reader` presented as a shared workspace section rather than a sibling app.
- Uses a collection-first Recall shell with a left workspace rail, slim top bar, primary canvas, and lighter utility dock by default.
- Uses a browse-first Library landing with source cards plus a lightweight inline resume affordance instead of auto-opening focused source mode on populated workspaces.
- Keeps global workspace navigation centered on `Library`, `Graph`, `Study`, `Notes`, and `Reader`.
- Uses a compact focused-source strip during active source work, and focused `Notes`, `Graph`, and `Study` now keep embedded Reader content as the steady primary pane.
- Uses one shared workspace-search session across the shell `Search` dialog and the Library search panel.
- Reopens the last document and reading mode from browser-local storage, with backend last-session fallback when local state is missing.
- Supports `Original`, `Reflowed`, `Simplified`, and `Summary` document modes.
- Keeps `Original` and `Reflowed` local and deterministic.
- Uses browser-native speech with sentence highlighting as the shipped read-aloud path.
- Uses the shared `workspace.db` backend storage with reader-compatible routes kept stable.
- Includes Recall keyword search, hybrid retrieval, graph review, study cards, Markdown export, source-linked notes, MV3 browser-context resurfacing, browser note capture, portability/export groundwork, and integrity/benchmark tooling.

## Active Constraints
- Windows Edge is the primary browser validation target.
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
- Stage 41 is the active milestone: converge the shared shell, Library/home, Add Content, Graph, and Study much more closely toward the benchmark while preserving local-first behavior and reader-led focused work.
- Future work should preserve local-first behavior, routes, note anchors, browser-companion handoff, and reading continuity, but should not preserve the current UI arrangement when a better Recall-quality workflow is available.
- Treat the original Recall app as a directional benchmark for workflow and information hierarchy, not as a pixel-perfect copy target.
- The current highest-priority task is to rewrite the shared shell and top-level surface framing around the benchmark matrix, because the remaining gap is now structural and visual rather than navigational.

## Main Entry Points
- Frontend shell: `frontend/src/App.tsx`
- Speech behavior: `frontend/src/hooks/useSpeech.ts`
- Reader rendering: `frontend/src/components/ReaderSurface.tsx`
- API entrypoint: `backend/app/main.py`
