# Decision Log

- 2026-03-13: Keep this repo as one workspace and preserve the current accessible-reader app as the reader/converter sibling app.
- 2026-03-13: Start with Stage 1A stabilization because the frontend branch is not green in WSL.
- 2026-03-13: Keep the backend as the single local service host and extract a shared document core behind the existing reader API.
- 2026-03-13: Use `workspace.db` as the long-term primary database, with explicit migration from legacy `reader.db`.
- 2026-03-13: Keep browser-native speech as the only shipped read-aloud path; local TTS remains deferred.
- 2026-03-13: Because the accessible-reader UI and web-link import are actively being changed in parallel, Stage 1 execution proceeds backend-first and avoids further frontend restructuring until that branch settles.
