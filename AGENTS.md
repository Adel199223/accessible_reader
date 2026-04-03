# AGENTS

Read these docs in order before doing major work:

1. `BUILD_BRIEF.md`
2. `docs/ROADMAP.md`
3. `docs/ROADMAP_ANCHOR.md`
4. the current active ExecPlan named in `docs/ROADMAP_ANCHOR.md`

If the active section milestone pre-stages the next benchmark audit plan in `docs/exec_plans/active/`, do not assume the highest stage number is the current plan. Follow the plan path named in `docs/ROADMAP_ANCHOR.md`, `agent.md`, and `docs/assistant/INDEX.md`.

Read `docs/assistant/templates/*` only on demand:
- use it when the user explicitly asks for harness/bootstrap prompt creation, project harness sync/audit work, cross-project Codex documentation scaffolding, or a follow-up delta/refinement prompt

Harness quick links:
- `agent.md` is the short repo runbook for future Codex chats
- `docs/assistant/INDEX.md` is the lightweight assistant routing map
- `docs/assistant/workflows/SESSION_RESUME.md` is the stable resume entry for roadmap continuity
- `docs/assistant/workflows/PROJECT_HARNESS_SYNC_WORKFLOW.md` handles explicit harness sync and audit requests

## Non-Negotiables

- `roadmap`, `master plan`, and `next milestone` mean the active project roadmap unless the user redirects
- stay roadmap-driven; if work detours for a blocker or correction, log it and return to the roadmap
- major or multi-file work must start by creating or updating an ExecPlan in `docs/exec_plans/active/`
- once a desktop-first section milestone is active, finish that section end-to-end before switching surfaces; use audits as regression gates and evidence snapshots, not as permission to hop to a new section after every pass
- inside the active section milestone, batch related fixes into a few internal checkpoints instead of reopening one-delta-per-stage micro work
- the March 28 Stage 692/707 roadmap reset and closeout superseded the older surface-by-surface hold guidance: the queued shell/Home/Notebook/Reader/Study ladder is complete, and future work should reopen a surface intentionally instead of auto-starting another queued slice
- `Graph`, `Home`, embedded `Notebook`, `Reader`, and `Study` are now stable regression baselines unless the user explicitly reprioritizes a surface
- later `Reader` generated-content work is a separate locked phase; UI/UX work across Reader modes is allowed in the queued roadmap, but do not change generated outputs automatically unless the user explicitly reprioritizes that work
- the latest intentional Reader checkpoint is now Stage 790/791, which kept the compact Reader deck, real-availability mode strip, inline `Source` trigger, nearby Notebook note-chip trigger, compact overflow, short-document article-field treatment, expanded-source destination compaction, leaner Source support, and frozen generated outputs intact while retiring the redundant visible document-open `Reader` shell title so active Reader topbars now collapse to `Search` plus `Add` only, recording `defaultReaderTopbarActionLabels: SearchCtrl+K / Add`, `defaultReaderTopbarCompact: true`, `defaultReaderTopbarHeight: 50.297`, `defaultReaderTopbarTitleVisible: false`, `sourceOpenReaderSourceLibraryVisible: true`, `notebookOpenWorkbenchVisible: true`, and `simplifiedViewAvailable: false` on the current live dataset
- keep parsing, storage, search, settings, progress, and deterministic reflow local-first
- treat the browser app as the primary product surface and the Edge extension as a supported companion surface
- browser-native speech is the shipped read-aloud path for v1
- local TTS is deferred and should be treated as `coming soon` unless the user explicitly reprioritizes it
- AI is opt-in only and currently limited to `Simplify` and `Summary`
- keep the extension context-only unless the user explicitly reprioritizes import/capture work
- optimize for Microsoft Edge on Windows 11 while using WSL for the repo/toolchain
- optimize for the best overall UX and Recall-quality workflow, not for preserving the current UI structure when a staged redesign would materially improve the experience
- treat the original Recall app as a directional UX benchmark for flow and hierarchy, not as a pixel-perfect copy target
- run targeted validation before broad changes
- keep push explicit; do not push unless the user asks
