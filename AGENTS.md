# AGENTS

Read these docs in order before doing major work:

1. `BUILD_BRIEF.md`
2. `docs/ROADMAP.md`
3. `docs/ROADMAP_ANCHOR.md`
4. the current active ExecPlan named in `docs/ROADMAP_ANCHOR.md`

If the active section milestone pre-stages the next benchmark audit plan in `docs/exec_plans/active/`, do not assume the highest stage number is the current plan. Follow the plan path named in `docs/ROADMAP_ANCHOR.md`, `agent.md`, and `docs/assistant/INDEX.md`.

Read `docs/assistant/templates/*` only on demand:
- use it when the user explicitly asks for harness/bootstrap prompt creation, cross-project Codex documentation scaffolding, or a follow-up delta/refinement prompt

Harness quick links:
- `agent.md` is the short repo runbook for future Codex chats
- `docs/assistant/INDEX.md` is the lightweight assistant routing map

## Non-Negotiables

- `roadmap`, `master plan`, and `next milestone` mean the active project roadmap unless the user redirects
- stay roadmap-driven; if work detours for a blocker or correction, log it and return to the roadmap
- major or multi-file work must start by creating or updating an ExecPlan in `docs/exec_plans/active/`
- once a desktop-first section milestone is active, finish that section end-to-end before switching surfaces; use audits as regression gates and evidence snapshots, not as permission to hop to a new section after every pass
- inside the active section milestone, batch related fixes into a few internal checkpoints instead of reopening one-delta-per-stage micro work
- the March 19 Stage 375 audit superseded the earlier Home-first checkpoint: `Graph`, `Home`, and `Reader` are now refreshed regression baselines, `Notes` is the active finish target, and `Study` is parked again until the user explicitly reprioritizes it
- later `Reader` generated-content work is a separate locked phase; do not start it automatically unless the user explicitly reprioritizes it
- keep parsing, storage, search, settings, progress, and deterministic reflow local-first
- browser-native speech is the shipped read-aloud path for v1
- local TTS is deferred and should be treated as `coming soon` unless the user explicitly reprioritizes it
- AI is opt-in only and currently limited to `Simplify` and `Summary`
- optimize for Microsoft Edge on Windows 11 while using WSL for the repo/toolchain
- optimize for the best overall UX and Recall-quality workflow, not for preserving the current UI structure when a staged redesign would materially improve the experience
- treat the original Recall app as a directional UX benchmark for flow and hierarchy, not as a pixel-perfect copy target
- run targeted validation before broad changes
- keep push explicit; do not push unless the user asks
