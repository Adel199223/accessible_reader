# ExecPlan: Post-v1 Waiting Reprioritization

## Purpose
- Preserve continuity after the current scoped v1 roadmap is complete.
- Ensure future sessions start from the validated boundary instead of reopening completed milestones.

## Scope
- In scope:
  - roadmap continuity
  - deferred-work reminders
  - handoff guidance for future reprioritization
- Out of scope:
  - any new implementation work until the user explicitly reprioritizes it

## Current State
- Foundation, reading experience, AI transforms, stabilization, hardening, and release-readiness documentation are complete for the current scoped v1.
- Windows Edge remains the browser validation target, with WSL hosting the repo and toolchain.
- Browser-native speech is the shipped path.
- Local TTS remains `coming soon`.

## Deferred Options
- local TTS implementation
- OCR for scanned or image-only PDFs
- AI scope expansion beyond `Simplify` and `Summary`
- future providers or future chat/Q&A
- repository extraction if a concrete release, distribution, or multi-contributor need appears

## Trigger To Replace This Plan
- The user explicitly reprioritizes one of the deferred options.
- A newly confirmed defect requires a fresh milestone.

## Validation
- None until a new milestone is explicitly started.

## Progress
- [x] Post-v1 continuity anchor created

## Handoff
- Replace this plan with a new active ExecPlan before starting any major new work.
