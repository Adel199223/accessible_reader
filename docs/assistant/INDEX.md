# Assistant Index

Use this folder as a lightweight routing layer. Do not treat it as the canonical source of product truth.

## Current Checkpoint
- Active checkpoint doc: `docs/exec_plans/active/2026-03-27_stage663_preview_patch_integrity_and_api_base_asset_resolution_fix.md`
- Resume shortcut: `resume after Stage 663 preview patch integrity and API-base asset resolution fix`
- Current benchmark note: the Stage 498/499 Graph pair, the completed Stage 500-522 Home checkpoint set, the completed Stage 523-532 Reader checkpoint set, the completed Stage 533 Graph implementation checkpoint, the completed Stage 534 Graph audit, the completed Stage 563 Home implementation checkpoint, the completed Stage 564 Home audit, the completed Stage 565 Home implementation checkpoint, the completed Stage 566 Home audit, the completed Stage 567 Home implementation checkpoint, the completed Stage 568 Home audit, the completed Stage 569 Home implementation checkpoint, the completed Stage 570 Home audit, the completed Stage 571 Home implementation checkpoint, the completed Stage 572 Home audit, the completed Stage 573 Home implementation checkpoint, the completed Stage 574 Home audit, the completed Stage 575 Home implementation checkpoint, the completed Stage 576 Home audit, the completed Stage 577 Home implementation checkpoint, the completed Stage 578 Home audit, the completed Stage 579 Home implementation checkpoint, the completed Stage 580 Home audit, the completed Stage 581 Home implementation checkpoint, the completed Stage 582 Home audit, the completed Stage 583 Home implementation checkpoint, the completed Stage 584 Home audit, the completed Stage 585 Home implementation checkpoint, the completed Stage 586 Home audit, the completed Stage 587 Home implementation checkpoint, the completed Stage 588 Home audit, the completed Stage 589 Home implementation checkpoint, the completed Stage 590 Home audit, the completed Stage 591 Home implementation checkpoint, the completed Stage 592 Home audit, the completed Stage 593 Home implementation checkpoint, the completed Stage 594 Home audit, the completed Stage 595 Home implementation checkpoint, the completed Stage 596 Home audit, the completed Stage 597 Home implementation checkpoint, the completed Stage 598 Home audit, the completed Stage 599 Home implementation checkpoint, the completed Stage 600 Home audit, the completed Stage 601 Home implementation checkpoint, the completed Stage 602 Home audit, the completed Stage 603 Home implementation checkpoint, the completed Stage 604 Home audit, the completed Stage 605 Home implementation checkpoint, the completed Stage 606 Home audit, the completed Stage 607 Home implementation checkpoint, the completed Stage 608 Home audit, the completed Stage 609 Home implementation checkpoint, the completed Stage 610 Home audit, the completed Stage 611 Home implementation checkpoint, the completed Stage 612 Home audit, the completed Stage 613 Home implementation checkpoint, the completed Stage 614 Home audit, the completed Stage 615 Home implementation checkpoint, the completed Stage 616 Home audit, the completed Stage 617 Home implementation checkpoint, the completed Stage 618 Home audit, the completed Stage 619 Home implementation checkpoint, the completed Stage 620 Home audit, the completed Stage 621 Home implementation checkpoint, the completed Stage 622 Home audit, the completed Stage 623 Home implementation checkpoint, the completed Stage 624 Home audit, the completed Stage 625 Home implementation checkpoint, the completed Stage 626 Home audit, the completed Stage 627 Home implementation checkpoint, the completed Stage 628 Home audit, the completed Stage 629 Home implementation checkpoint, the completed Stage 630 Home audit, the completed Stage 631 Home implementation checkpoint, the completed Stage 632 Home audit, the completed Stage 633 Home implementation checkpoint, the completed Stage 634 Home audit, the completed Stage 635 Home implementation checkpoint, the completed Stage 636 Home audit, the completed Stage 637 Home implementation checkpoint, the completed Stage 638 Home audit, the completed Stage 639 Home implementation checkpoint, the completed Stage 640 Home audit, the completed Stage 641 Home implementation checkpoint, the completed Stage 642 Home audit, the completed Stage 643 Home implementation checkpoint, the completed Stage 644 Home audit, the completed Stage 645 Home implementation checkpoint, the completed Stage 646 Home audit, the completed Stage 647 Home implementation checkpoint, the completed Stage 648 Home audit, the completed Stage 649 Home implementation checkpoint, the completed Stage 650 Home audit, the completed Stage 651 Home implementation checkpoint, the completed Stage 652 Home audit, the completed Stage 653 Home implementation checkpoint, the completed Stage 654 Home audit, the completed Stage 655 Home implementation checkpoint, the completed Stage 656 Home audit, the completed Stage 657 Home implementation checkpoint, the completed Stage 658 Home audit, the completed Stage 659 Home implementation checkpoint, the completed Stage 660 Home audit, the completed Stage 661 Home implementation checkpoint, the completed Stage 662 Home audit, the completed Stage 663 preview patch-integrity implementation checkpoint, and the Stage 506 launcher blocker correction now define the current local continuity baseline above the clean-`main` closeout.
- Workflow reset: treat Stage 662 as the latest completed audit while Stage 663 is the latest implementation checkpoint, treat the Stage 537-562 grouped-overview ladder as legacy Home baseline work rather than the active target, then keep `Home`, `Graph`, and original-only `Reader` in refreshed-baseline hold again unless the user explicitly opens another slice; if they do, `Home` remains the likeliest next bounded target, now around richer screenshot-like or otherwise higher-fidelity preview generation for the sources that still fall back, especially paste/text or sources without usable saved image assets, rather than another shell, rail, toolbar, lower-card, metadata-only poster, or HTML-backed preview-framing micro-trim.
- Regression-only rule: `Notes` and `Study` stay parked as refreshed baselines, and `Reader` stays original-only and cosmetic-only unless the user explicitly unlocks generated-content work.

## Start Here
1. `BUILD_BRIEF.md`
2. `docs/ROADMAP.md`
3. `docs/ROADMAP_ANCHOR.md`
4. `docs/ux/recall_benchmark_matrix.md` when the task touches Recall shell or surface UI
5. the latest checkpoint ExecPlan(s) named in `docs/ROADMAP_ANCHOR.md`
6. this index

## Operating Defaults
- Run repo commands from WSL, preferably through `wsl.exe bash -lc ...` when working from Windows-side shells.
- Validate browser behavior in Windows Edge.
- Keep the app local-first.
- Treat the browser app as primary and the Edge extension as a supported companion surface.
- Treat browser-native speech as the shipped read-aloud path.
- Treat local TTS as `coming soon`.
- Keep AI opt-in and limited to `Simplify` and `Summary`.
- Use targeted validation before broad sweeps.
- Treat the benchmark matrix plus fresh screenshots as required when changing Recall shell or top-level surface UI.
- Treat wide-desktop before/after captures for the active section as required milestone artifacts, not optional polish.
- Audits verify regressions; they do not reopen the old queue or silently start another redesign slice unless the user explicitly changes priorities or a catastrophic regression forces a detour.
- In the current parity track, `Reader` is original-only and cosmetic-only. Do not touch `Reflowed`, `Simplified`, `Summary`, generated-view UX, transform logic, generated placeholders, generated-view controls, or mode-routing unless the user explicitly reprioritizes that work.
- Stale temp files, superseded screenshot harness files, dead CSS hooks, and other non-essential generated scaffolding may be deleted when they stop helping; do not let preserving obsolete files slow roadmap work down.
- Prefer targeted component tests first, then use the broad `frontend/src/App.test.tsx` pass when shell or route continuity changes, and keep the repo-owned Edge screenshot harness as the visual truth source for Recall surface work.
- If the broad `App.test.tsx` file ever appears to stall again, check for App-level callback identity churn and `ReaderWorkspace` effect loops before downgrading the whole-file suite; that was the root cause of the last real stall.
- Keep push explicit.

## Use When
- Read `docs/assistant/APP_KNOWLEDGE.md` when you need a short project snapshot before opening source files.
- Read `docs/assistant/workflows/ROADMAP_WORKFLOW.md` when the user says `roadmap`, `master plan`, or `next milestone`.
- Read `docs/assistant/workflows/SESSION_RESUME.md` when the user asks where to resume or wants the next roadmap restart point.
- Read `docs/assistant/workflows/PROJECT_HARNESS_SYNC_WORKFLOW.md` for `implement the template files`, `sync project harness`, `audit project harness`, or `check project harness`.
- Read `docs/ux/recall_benchmark_matrix.md` when the task touches Recall shell, Library/home, Add Content, Graph, Study, or other benchmark-sensitive UI work.
- Read `docs/assistant/workflows/EDGE_SPEECH_VALIDATION_WORKFLOW.md` when the task touches Edge speech, highlighting, progress restore, or manual browser validation.
- Read `docs/assistant/templates/CODEX_DELTA_REFINEMENT_PROMPT.md` only when the user explicitly asks for a follow-up delta/refinement prompt that folds later prototype learnings back into the shipped app.
- Read `agent.md` for the short repo runbook.
- If `docs/exec_plans/active/` contains both the current implementation plan and a pre-staged next audit plan, use this index plus `docs/ROADMAP_ANCHOR.md` to identify the current one instead of following the highest stage number blindly.

## Do Not Use
- Do not use this folder to override `BUILD_BRIEF.md`, roadmap docs, or source code.
- Do not open `docs/assistant/templates/*` unless the user explicitly asks for harness/bootstrap prompt work, explicit harness sync/audit work, or a delta/refinement prompt.
