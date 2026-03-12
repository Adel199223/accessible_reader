from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
import os


@dataclass(frozen=True)
class AppSettings:
    backend_root: Path
    project_root: Path
    data_dir: Path
    files_dir: Path
    database_path: Path
    frontend_origin: str
    openai_api_key: str | None
    openai_model: str


@lru_cache(maxsize=1)
def get_settings() -> AppSettings:
    backend_root = Path(__file__).resolve().parents[1]
    project_root = backend_root.parent
    data_dir = Path(os.getenv("ACCESSIBLE_READER_DATA_DIR", backend_root / ".data"))
    files_dir = data_dir / "files"
    database_path = data_dir / "reader.db"
    return AppSettings(
        backend_root=backend_root,
        project_root=project_root,
        data_dir=data_dir,
        files_dir=files_dir,
        database_path=database_path,
        frontend_origin=os.getenv("FRONTEND_ORIGIN", "http://127.0.0.1:5173"),
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        openai_model=os.getenv("OPENAI_MODEL", "gpt-5"),
    )
