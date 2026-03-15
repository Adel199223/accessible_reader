# ExecPlan: Stage 36 Post-Stage-35 Recall UX Refresh

## Summary
- Stage 34 corrected the split workspace so focused note, graph, and study work stays beside live Reader content.
- Stage 35 then reset the default Recall shell into a collection-first layout with a left rail, slim top bar, lighter utility dock, and compact focused-source mode.
- This audit evaluated the new shell against the product brief, the live app, the user-shared benchmark screenshot, and the current Stage 34 artifacts before naming the next bounded slice.

## Audit Findings
- Focused source mode is no longer the main problem:
  - focused `Notes`, `Graph`, and `Study` correctly keep live Reader content visible beside the active tool
  - the compact source strip and reader-led split behavior are directionally aligned with the benchmark and product brief
  - the shell utility dock staying hidden during focused work is appropriate
- Narrow-width behavior is acceptable for this stage:
  - the rail collapses into a wrapped row
  - the top bar stacks cleanly
  - the responsive shell is not the highest-friction remaining break
- Sparse and outage states are no longer catastrophically heavy:
  - the lighter utility dock and onboarding card now appear in the right area
  - error states still need polish later, but they are secondary
- The highest-friction remaining break is now the default landing behavior on populated workspaces:
  - `/recall` still boots directly into a source-focused Library view whenever continuity already knows an active source
  - that means the app skips the intended collection-first browse landing in the exact state where a returning user most needs it
  - the lighter utility dock, cleaner browse-first shell, and collection-oriented hierarchy disappear as soon as saved content exists
  - compared with the user benchmark, the app still feels like it is resuming one source by default rather than opening Recall as a collection workspace

## Audit Inputs
- Product brief:
  - `C:\Users\FA507\Downloads\Building a Smarter Recall App.docx`
- User benchmark:
  - the reference Recall collection screenshot shared in the 2026-03-15 Codex thread
- Local artifacts:
  - `output/playwright/stage34-reader-led-notes.png`
  - `output/playwright/stage34-reader-led-graph.png`
  - `output/playwright/stage34-reader-led-study.png`
  - `output/playwright/stage34-reader-led-notes-browse.png`
  - `output/playwright/stage34-reader-led-graph-browse.png`
  - `output/playwright/stage34-reader-led-study-browse.png`
  - `output/playwright/stage34-reader-led-validation.json`
- Live inspection:
  - localhost `/recall` shell inspection at wide and narrow widths on 2026-03-15

## Recommendation
- Open Stage 37 as a bounded collection-first landing correction:
  - keep `/recall` browse-first by default even when continuity remembers a prior active source
  - require explicit source entry before focused source mode takes over the shell
  - preserve reader-led focused work after the user explicitly enters one source through selection, search, recent work, Reader handoff, or source-workspace tabs
- Do not reopen backend, storage, route, speech, OCR, sync, collaboration, or chat scope for this correction.

## Notes
- The shell reset did improve hierarchy and calmness, but it did not fully achieve the collection-first default promised by the Stage 35 direction because focus continuity still overrides the default Recall entry state too aggressively.
- The next slice should target entry rules and browse-first shell behavior, not re-open the now-healthier focused split layout.
