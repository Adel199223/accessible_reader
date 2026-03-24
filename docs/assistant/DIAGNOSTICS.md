# Diagnostics

## If The Browser App Does Not Open

1. Run `powershell -ExecutionPolicy Bypass -File .\\scripts\\open_recall_app.ps1`.
2. If it fails, inspect `http://127.0.0.1:8000/api/health`.
3. Confirm `frontend/dist/index.html` exists or rebuild the frontend from WSL.

## If The Extension Cannot Reach Recall

1. Confirm the backend is healthy on `http://127.0.0.1:8000/api/health`.
2. Confirm the extension options page still points to `http://127.0.0.1:8000`.
3. Rebuild the extension with `npm run build` in `extension/`.

## If Validation Is Ambiguous

- treat Windows Edge as the live truth for browser behavior
- treat WSL as the command/toolchain home
- do not treat a WSL-only browser check as enough for the live Edge companion
