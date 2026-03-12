# Accessible Reader Backend

FastAPI backend for the localhost-first accessible reading assistant.

## Start

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e .[dev]
python -m uvicorn app.main:app --reload
```

Set `OPENAI_API_KEY` before using `Simplify` or `Summary`.
