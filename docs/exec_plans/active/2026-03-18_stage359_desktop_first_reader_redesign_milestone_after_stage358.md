# ExecPlan: Stage 359 Reader-First Desktop-Led Redesign Milestone After Stage 358

## Summary
- Follow the completed `Home` milestone by redesigning wide desktop `Reader` as the next whole-section milestone.
- Treat wide desktop `Reader` as the primary visual benchmark, then adapt the same hierarchy into narrow `Reader` and reader-led split work, then run one milestone audit.
- Keep the work frozen to `Reader` unless a shared shell adjustment is strictly required by the redesign.

## Why This Milestone Exists
- `Reader` is the next fixed priority after `Home`.
- The current wide desktop `Reader` still gives too much weight to the top control/header stack and the right-side support column relative to the document itself.
- The user explicitly deferred generated Reader output changes, so this milestone is about layout, hierarchy, controls, and adjacency rather than content generation.

## Milestone Rules
- Keep wide desktop as the primary visual truth for this milestone.
- Finish `Reader` properly before moving to `Notes`.
- Use internal checkpoints inside Stage 359 instead of new numbered micro-stages:
  1. desktop `Reader` redesign
  2. narrow `Reader` and reader-led split adaptation
  3. milestone-ready validation before the full Stage 360 audit
- Keep `Graph` as the regression baseline and `Study` as regression-only during this milestone.

## Problem Statement
- Wide desktop `Reader` still lets header, transport, source summary, note controls, and right-side context compete too strongly with reading.
- The right-side support area still behaves too much like a co-equal standing panel instead of calmer contextual support.
- The document column does not yet dominate the page strongly enough in the user-visible screenshots.

## Goals
- Make wide desktop `Reader` obviously different from the current Stage 356 baseline at a glance.
- Give the document text more dominance than the control/context chrome.
- Compress the top control/header stack into a tighter reading toolbar rhythm.
- Turn right-side source/note/context support into a calmer dock or tabbed side tray instead of a standing co-equal panel.
- Keep `Add note`, source switching, note adjacency, and source-library access intact while visually demoting them beneath reading.
- Adapt narrow `Reader` and reader-led split work to the same hierarchy after the desktop redesign settles.

## Non-Goals
- Do not change generated Reader content, `Simplify`, `Summary`, or any generation semantics.
- Do not change read-aloud behavior, sentence highlighting, stored reading state, routing, or anchor reopen semantics.
- Do not redesign `Notes` yet except for shared support primitives that `Reader` establishes.

## Implementation Targets
- `frontend/src/components/ReaderWorkspace.tsx`
  - redesign wide desktop `Reader` layout and section hierarchy around document-first reading
  - compress the header/control stack and calm the support/context treatment
- `frontend/src/components/FocusedSourceReaderPane.tsx`
  - adapt reader-led split work to the same calmer hierarchy where needed
- `frontend/src/components/SourceWorkspaceFrame.tsx`
  - update shared source-frame support only when required by the new Reader dock/tray behavior
- `frontend/src/index.css`
  - restyle desktop and narrow `Reader` for the new hierarchy
  - remove stale Reader-only hooks if they become dead weight during the redesign
- `frontend/src/App.test.tsx`
  - keep shell, route continuity, `/reader` compatibility, and section handoffs intact
- targeted Reader Vitest coverage
  - add or update focused Reader layout and control assertions close to `ReaderWorkspace`
- `scripts/playwright`
  - Stage 359 should include a dedicated desktop `Reader` redesign harness plus narrow/split regression coverage
  - Stage 360 should be one full milestone audit with wide desktop surfaces first and focused regression captures second

## Internal Checkpoints

### Checkpoint 1: Desktop Reader Redesign
- Target the wide desktop `Reader` route first.
- Required output:
  - clearly different desktop `Reader` screenshots
  - targeted Reader tests
  - lint + build + route continuity checks
- Acceptance rule:
  - the before/after must be obviously different at a glance; if the document still looks secondary to the header/support chrome, revise before moving on

### Checkpoint 2: Narrow Reader And Reader-Led Split Adaptation
- Adapt narrow `Reader` and reader-led split work to the new desktop hierarchy instead of keeping a separate micro-language.
- Required output:
  - targeted narrow/split Reader tests
  - narrow Reader and reader-led split screenshots
  - verification that read aloud, highlighting, note capture adjacency, source switching, and `/reader` deep links still work

### Checkpoint 3: Milestone-Ready Validation
- Before the full audit, confirm the `Reader` redesign is stable enough to audit once rather than through more micro-iterations.

## Validation
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npx vitest run src/App.test.tsx --maxWorkers=1 --pool=threads --reporter=verbose"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run lint"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader/frontend && npm run build"`
- `wsl.exe bash -lc "cd /home/fa507/dev/accessible_reader && git diff --check"`
- `node --check` for any new Stage 359/360 Windows Edge harness files
- run a dedicated desktop `Reader` screenshot harness before the full audit
- run a narrow/split Reader regression harness before the full audit if Stage 359 changes those structures

## Exit Criteria
- Wide desktop `Reader` looks obviously different from the Stage 356 baseline.
- Reading is clearly primary over control and context chrome.
- The right-side support area reads like calm contextual support instead of a co-equal panel.
- Narrow `Reader` and reader-led split work inherit the same hierarchy.
- The milestone is ready for one honest Stage 360 audit instead of more micro-stages.
