# Assistant App Knowledge

Bridge summary only. Canonical project status and policy live in `BUILD_BRIEF.md`, `docs/ROADMAP.md`, `docs/ROADMAP_ANCHOR.md`, and the active ExecPlan.

## Snapshot

- Browser-first, local-first Recall workspace for Windows 11, with the repo and toolchain living in WSL.
- Frontend: React + Vite + TypeScript.
- Backend: FastAPI + Python 3.11.
- Storage: SQLite with FTS5.
- Primary live surface: the browser app at `/recall`, with a supported Microsoft Edge browser companion.

## Current Product Shape

- Recall shell sections are `Home`, `Graph`, `Study`, and `Reader`, with `Notebook` embedded inside `Home` and saved-source workspaces rather than exposed as its own top-level rail entry.
- `Home` and `Reader` share the same route-stable `Add content` modal with `Paste text`, `Web page`, and `Choose file` entry modes.
- Imports cover pasted text, public article webpage snapshots, and local text/markdown/html/docx/pdf-style files.
- Saved webpages reopen from local HTML snapshots instead of live refetch.
- Browser-native speech is the shipped read-aloud path.
- AI remains opt-in and limited to `Simplify` and `Summary`.
- Reader supports `Original`, `Reflowed`, `Simplified`, and `Summary`, but generated-output behavior stays frozen unless the user explicitly reprioritizes it.

## Current Continuity

- Stage 790 is the latest implementation checkpoint: `Reader Document-Open Topbar Compaction After Stage 789`.
- Stage 791 is the latest completed audit: `Post-Stage-790 Reader Document-Open Topbar Compaction Audit`.
- The Stage 706/707 cross-surface closeout baseline still sits underneath the later intentional Add Content plus Reader reopen ladder, and the Stage 790/791 Reader topbar compaction checkpoint is the current resume surface.
- There is no automatic next slice now; future product work should reopen a surface intentionally.
- `Graph`, `Home`, embedded `Notebook`, `Reader`, and `Study` are the current regression baselines.

## Operating Constraints

- Use WSL for git, npm, Python, and validation commands.
- Validate live browser behavior and browser-companion flows in Windows Edge.
- Use `powershell -ExecutionPolicy Bypass -File .\scripts\open_recall_app.ps1` to open the app on this machine.
- Keep parsing, storage, search, settings, progress, and deterministic reflow local-first.
- Keep the Edge extension context-only unless the user explicitly reopens broader capture/import work.
- Keep generated Reader outputs, transform logic, and generated-view routing unchanged unless the user explicitly reprioritizes generated-content work.
