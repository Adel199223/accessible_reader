# Recall Workspace Backend

FastAPI backend for the local-first Recall workspace and its integrated Reader experience.

## Start

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e .[dev]
python -m uvicorn app.main:app --reload
```

Set `OPENAI_API_KEY` before using `Simplify` or `Summary`.
