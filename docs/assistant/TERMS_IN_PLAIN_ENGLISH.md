# Terms In Plain English

- `Recall workspace`: the main local browser app in this repo.
- `Reader`: the integrated reading surface inside Recall, not a separate app.
- `browser companion`: the Microsoft Edge extension in `extension/`.
- `local-first`: parsing, storage, search, reading state, and reopen behavior stay local by default.
- `WSL-hosted toolchain`: run repo commands in Linux under WSL even though the live browser validation target is Windows Edge.
- `Simplify` and `Summary`: the only user actions that should call AI right now.
- `context-only extension`: the extension can surface context and hand off to Recall, but it should not become a full web clipper unless the user explicitly reprioritizes that work.
