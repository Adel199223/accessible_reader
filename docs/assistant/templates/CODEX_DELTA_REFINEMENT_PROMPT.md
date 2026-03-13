# Codex Delta Refinement Prompt

Use this template only when the user explicitly asks for a follow-up prompt or handoff that folds later prototype learnings back into the product roadmap without rebuilding the app from scratch.

## Intent

- Treat later prototype work as UX guidance, not as a literal UI to clone.
- Make Codex inspect repo truth first.
- Keep what is already good.
- Correct what is clunky or incomplete.
- Add only the meaningful, applicable delta.

## Ready-To-Paste Prompt

```text
Read these first, in order:
1. AGENTS.md
2. BUILD_BRIEF.md
3. docs/ROADMAP.md
4. docs/ROADMAP_ANCHOR.md
5. the active ExecPlan
6. docs/assistant/INDEX.md only if routing help is needed

This is a bounded roadmap refinement pass based on later accessibility learnings from a local prototype and live user review.

Important instruction:
Do not blindly re-implement everything below.
First inspect the current implementation and determine what already exists, what is already correct, what is partially present but clunky, and what is still missing.
Then:
- keep anything already implemented well
- correct anything partially implemented or awkward
- add only the missing parts that are actually applicable
- if a more correct or more product-appropriate solution exists after research, use that instead of copying the prototype literally

Treat the prototype learnings as UX guidance, not as a requirement to duplicate the prototype structure 1:1.

Goal:
Refine the accessible reader so the read-aloud experience feels calmer, lighter, and smoother for dyslexia- and ADHD-leaning use, while preserving the local-first architecture and the existing product boundaries.

Current likely state to verify before changing:
- grouped controls for view choice, read aloud, and voice pacing may already exist
- compact settings summary may already exist
- curated voice ordering may already exist
- sentence click behavior may already partially match the desired behavior
- speech reset-loop fixes may already exist
Do not duplicate or regress any of that.

Bounded delta to implement if missing or if the current version is still clunky:

1. Reader transport should feel like a lightweight player, not a form
- Replace separate text actions like Start / Pause / Resume / Previous sentence with a compact icon-first transport bar.
- Use:
  - play/pause toggle
  - previous sentence
  - next sentence
  - stop
- Keep voice selection and speech-rate controls as text controls, not icons.
- Use inline SVG icons, not emoji.
- Every icon button must have:
  - aria-label
  - title tooltip
  - visible keyboard focus
  - disabled state styling

2. Sentence-click playback handoff
- Clicking a sentence should behave like this:
  - if currently playing: jump immediately to that sentence and continue reading
  - if currently paused: continue from that sentence
  - if idle, stopped, or naturally ended: select/highlight only and do not auto-play
- Keyboard activation on a focused sentence should mirror click behavior.
- If the current implementation already behaves this way, keep it. If it only approximates this, tighten it.

3. Playback state handling
- If needed for correctness and smoothness, replace implicit speech-state assumptions with an explicit local state machine:
  - idle
  - playing
  - paused
  - stopped
  - ended
- Do not rely only on browser `speechSynthesis.speaking` / `paused` flags as the sole source of truth if that causes edge-case drift.
- Preserve the existing “no reset on equivalent rerender / parent progress sync” behavior.

4. Smooth Edge speech switching
- When switching sentences during active playback, use a robust handoff path if needed:
  - cancel current speech
  - update the active queue/index
  - schedule the replacement utterance on the next animation frame plus a minimal deferred tick if that materially improves Edge stability
- Keep this bounded and practical. Do not add heavy complexity if the current implementation is already smooth enough.

5. Keep and preserve these existing product constraints
- Browser-native speech remains the shipped path.
- Curated voice order stays:
  - Ava Multilingual Natural
  - Andrew Multilingual Natural
  - Default voice
- Local TTS stays deferred as coming soon.
- AI remains opt-in only for Simplify and Summary.
- Do not expand product scope into OCR, chat, Q&A, or cloud sync.

6. Typography and calmer defaults
- Re-evaluate the default font preset in light of the later accessibility prototype and live user feedback.
- If there is no stronger contrary reason in the current implementation, prefer a more obviously dyslexia-friendly default or a more prominent quick-switch path to it.
- Keep the available presets aligned with the brief:
  - Comic Sans / dyslexia-friendly fallback
  - Atkinson Hyperlegible if available
  - System readable
- Do not introduce a noisy visual redesign. Favor calmer defaults, lower scan friction, and fewer simultaneous choices.

7. Prototype ideas that are conditional, not mandatory
- If the real app already has meaningful structural sections or headings where inline section play affordances would help, add small play affordances there.
- If the app does not have a meaningful section model, do not force fake section controls into it.
- Do not create a separate “reading edition” surface unless there is a strong product reason. That split was a prototype tactic, not a mandatory app requirement.

8. Docs and roadmap handling
- Update the active ExecPlan, roadmap, and roadmap anchor only as needed to record what was actually missing, what was already present, and what was corrected.
- Be explicit in docs that this pass is a refinement pass, not a reopening of unrelated deferred scope.
- If you discover that one of the requested deltas is already implemented correctly, record that rather than redoing it.

9. Validation
- Add or update focused frontend tests for:
  - sentence click behavior in playing / paused / stopped / ended situations
  - icon transport controls
  - preserved voice curation order
  - no regression in current sentence highlight/progress behavior
- Re-run:
  - npm test
  - npm run lint
  - npm run build
- Do a real Edge validation pass for:
  - icon controls
  - tooltip/accessibility labeling
  - sentence click handoff
  - no obvious playback lag or restart jitter
  - preserved scroll/highlight behavior

Implementation rule:
This is an “add if missing, correct if weak, keep if already good” refinement pass.
Do not duplicate existing work just because it appears in this prompt.
Inspect first, decide based on repo truth, and implement only the meaningful delta.
```
