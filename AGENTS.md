# AGENTS

Read these docs in order before doing major work:

1. `BUILD_BRIEF.md`
2. `docs/ROADMAP.md`
3. `docs/ROADMAP_ANCHOR.md`
4. the latest active ExecPlan in `docs/exec_plans/active/`

Read `docs/assistant/templates/*` only on demand:
- use it when the user explicitly asks for harness/bootstrap prompt creation or cross-project Codex documentation scaffolding

## Non-Negotiables

- `roadmap`, `master plan`, and `next milestone` mean the active project roadmap unless the user redirects
- stay roadmap-driven; if work detours for a blocker or correction, log it and return to the roadmap
- major or multi-file work must start by creating or updating an ExecPlan in `docs/exec_plans/active/`
- keep parsing, storage, search, settings, progress, and deterministic reflow local-first
- browser-native speech is the shipped read-aloud path for v1
- local TTS is deferred and should be treated as `coming soon` unless the user explicitly reprioritizes it
- AI is opt-in only and currently limited to `Simplify` and `Summary`
- optimize for Microsoft Edge on Windows 11 while using WSL for the repo/toolchain
- run targeted validation before broad changes
- keep push explicit; do not push unless the user asks
