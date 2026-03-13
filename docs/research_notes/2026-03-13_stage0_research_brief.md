# Stage 0 Research Brief - 2026-03-13

## Repo Reality
- The current repository is a working accessible-reader app with a React frontend and FastAPI backend.
- The backend import, parsing, reflow, and AI-transform pipeline already exists and is the strongest foundation for the broader system.
- The current frontend branch is not green in WSL:
  - `npm test` fails because several tests no longer match the current UI/accessibility model.
  - `npm run lint` fails on a redundant boolean cast and a `setState`-in-effect pattern.
  - `npm run build` fails on a typed mock mismatch in `App.test.tsx`.
- The backend is green in WSL with `pytest`.

## External References That Matter
- GLiNER: strong candidate for backend-local entity extraction; Python-first rather than browser-first.
- GLiREL: relation-extraction companion worth benchmarking only after heuristic relations land.
- py-fsrs: matches the existing Python backend better than a frontend-first scheduler.
- Promnesia and WorldBrain Memex: validate a local service plus browser extension split.
- Chrome MV3 offscreen documents and service-worker lifecycle docs: good constraints for later extension work, but not needed in the first slice.
- ONNX Runtime Web and Transformers.js: promising later for browser-side acceleration, but not required for the first Recall slice.

## Chosen Direction
- Preserve the accessible-reader app as the sibling reader/converter product area.
- Extract a shared document core inside the current backend before adding a Recall frontend.
- Stabilize the existing reader branch before any net-new Recall features.

## Near-Term Risks
- The repo has active uncommitted UI work, so stabilization changes must avoid trampling user intent.
- A direct storage-path switch from `reader.db` to `workspace.db` needs an explicit migration path.
- Shared-core extraction must not break reader reopen, progress, or deterministic view generation.
