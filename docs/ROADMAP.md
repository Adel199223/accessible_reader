# Roadmap

## Product Direction

Build a localhost-first accessible reading assistant that keeps parsing, storage, search, reading controls, and reflow local, while reserving AI for explicit `Simplify` and `Summary` transforms.

## Milestones

1. Foundation
   - scaffold frontend, backend, docs, storage, and import pipeline
   - support TXT, Markdown, HTML, DOCX, and text-based PDF
   - ship a local library and `Original` view
2. Reading Experience
   - add deterministic `Reflowed` view
   - add sentence segmentation, highlight sync, and Edge-first speech controls
   - persist settings and reading progress
3. AI Transforms
   - add OpenAI-backed `Simplify` and `Summary`
   - cache transform outputs by content hash and settings
   - keep AI opt-in only
4. Hardening
   - improve search, reopen flow, responsiveness, and accessibility polish
   - document deferred local TTS as `coming soon`

## Working Rules

- `roadmap`, `master plan`, and `next milestone` mean this project plan unless explicitly redirected
- log detours in the roadmap anchor
- return to the roadmap after blockers or corrections are resolved
