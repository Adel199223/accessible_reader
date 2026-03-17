# AGENTS

Read these docs in order before doing major work:

1. `BUILD_BRIEF.md`
2. `docs/ROADMAP.md`
3. `docs/ROADMAP_ANCHOR.md`
4. the current active ExecPlan named in `docs/ROADMAP_ANCHOR.md`

If bundled dominant-surface mode pre-stages the next benchmark audit plan in `docs/exec_plans/active/`, do not assume the highest stage number is the current plan. Follow the plan path named in `docs/ROADMAP_ANCHOR.md`, `agent.md`, and `docs/assistant/INDEX.md`.

Read `docs/assistant/templates/*` only on demand:
- use it when the user explicitly asks for harness/bootstrap prompt creation, cross-project Codex documentation scaffolding, or a follow-up delta/refinement prompt

Harness quick links:
- `agent.md` is the short repo runbook for future Codex chats
- `docs/assistant/INDEX.md` is the lightweight assistant routing map

## Non-Negotiables

- `roadmap`, `master plan`, and `next milestone` mean the active project roadmap unless the user redirects
- stay roadmap-driven; if work detours for a blocker or correction, log it and return to the roadmap
- major or multi-file work must start by creating or updating an ExecPlan in `docs/exec_plans/active/`
- when one surface remains the clear benchmark blocker across repeated audits and the remaining defect is localized, switch from one-delta-per-stage work to bundled dominant-surface mode: batch 2-3 related fixes before the next full benchmark audit, and only switch surfaces sooner if a fresh audit or direct regression justifies it
- keep parsing, storage, search, settings, progress, and deterministic reflow local-first
- browser-native speech is the shipped read-aloud path for v1
- local TTS is deferred and should be treated as `coming soon` unless the user explicitly reprioritizes it
- AI is opt-in only and currently limited to `Simplify` and `Summary`
- optimize for Microsoft Edge on Windows 11 while using WSL for the repo/toolchain
- optimize for the best overall UX and Recall-quality workflow, not for preserving the current UI structure when a staged redesign would materially improve the experience
- treat the original Recall app as a directional UX benchmark for flow and hierarchy, not as a pixel-perfect copy target
- run targeted validation before broad changes
- keep push explicit; do not push unless the user asks
