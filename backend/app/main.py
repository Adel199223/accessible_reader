from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import get_settings
from .ids import new_uuid7_str
from .models import (
    DocumentRecord,
    DocumentView,
    HealthResponse,
    ImportTextRequest,
    ImportUrlRequest,
    ProgressUpdate,
    ReaderSettings,
    TransformRequest,
)
from .parsers import (
    ParsedDocument,
    UnsupportedDocumentError,
    parse_text_input,
    parse_uploaded_file,
    parse_web_page,
)
from .reflow import reflow_blocks
from .storage import Repository
from .text_utils import now_iso, sha256_text
from .transforms import TransformUnavailableError, provider_for_key
from .web_import import WebImportError, fetch_webpage_snapshot


settings = get_settings()
repository = Repository(settings.database_path, legacy_database_path=settings.legacy_database_path)
transform_provider = provider_for_key(settings.openai_api_key, settings.openai_model)


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    settings.files_dir.mkdir(parents=True, exist_ok=True)
    repository.init_db()
    yield


app = FastAPI(title="Accessible Reader API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(openai_configured=bool(settings.openai_api_key))


@app.get("/api/settings", response_model=ReaderSettings)
def get_reader_settings() -> ReaderSettings:
    return repository.get_reader_settings()


@app.put("/api/settings", response_model=ReaderSettings)
def save_reader_settings(payload: ReaderSettings) -> ReaderSettings:
    return repository.save_reader_settings(payload)


@app.get("/api/documents", response_model=list[DocumentRecord])
def list_documents(query: str = "") -> list[DocumentRecord]:
    return repository.list_documents(query)


@app.post("/api/documents/import-text", response_model=DocumentRecord)
def import_text(payload: ImportTextRequest) -> DocumentRecord:
    try:
        parsed = parse_text_input(payload.text, payload.title)
    except UnsupportedDocumentError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    return _save_or_reuse_document(parsed, raw_bytes=payload.text.encode("utf-8"), extension=".txt")


@app.post("/api/documents/import-file", response_model=DocumentRecord)
async def import_file(file: UploadFile = File(...)) -> DocumentRecord:
    content = await file.read()
    try:
        parsed = parse_uploaded_file(file.filename or "uploaded-file", content)
    except UnsupportedDocumentError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    extension = Path(file.filename or "").suffix or ".txt"
    return _save_or_reuse_document(parsed, raw_bytes=content, extension=extension)


@app.post("/api/documents/import-url", response_model=DocumentRecord)
def import_url(payload: ImportUrlRequest) -> DocumentRecord:
    try:
        fetched_page = fetch_webpage_snapshot(payload.url)
        parsed = parse_web_page(fetched_page.resolved_url, fetched_page.html)
    except WebImportError as error:
        raise HTTPException(status_code=error.status_code, detail=error.detail) from error
    except UnsupportedDocumentError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    return _save_or_reuse_document(
        parsed,
        raw_bytes=fetched_page.html.encode("utf-8"),
        extension=".html",
    )


@app.get("/api/documents/{document_id}", response_model=DocumentRecord)
def get_document(document_id: str) -> DocumentRecord:
    document = repository.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")
    return document


@app.delete("/api/documents/{document_id}", status_code=204)
def delete_document(document_id: str) -> None:
    document = repository.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")

    stored_path = repository.delete_document(document_id)
    if stored_path:
        try:
            Path(stored_path).unlink(missing_ok=True)
        except OSError:
            pass


@app.get("/api/documents/{document_id}/view", response_model=DocumentView)
def get_view(document_id: str, mode: str, detail_level: str = "default") -> DocumentView:
    view = repository.get_view(document_id, mode=mode, detail_level=detail_level)
    if not view:
        raise HTTPException(status_code=404, detail=f"`{mode}` is not available yet for this document.")
    return view


@app.post("/api/documents/{document_id}/transform", response_model=DocumentView)
def transform_document(document_id: str, payload: TransformRequest) -> DocumentView:
    detail_level = payload.detail_level if payload.mode == "summary" else "default"
    cached = repository.get_view(document_id, mode=payload.mode, detail_level=detail_level)
    if cached:
        cached.cached = True
        return cached

    document = repository.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")

    source_view = repository.get_view(document_id, mode="reflowed", detail_level="default")
    if not source_view:
        raise HTTPException(status_code=404, detail="Reflowed source view is missing.")

    try:
        generated_view = transform_provider.create_view(
            mode=payload.mode,
            detail_level=payload.detail_level,
            title=document.title,
            source_blocks=source_view.blocks,
            source_hash=source_view.source_hash,
        )
    except TransformUnavailableError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error

    repository.save_view(document_id, generated_view)
    return generated_view


@app.put("/api/documents/{document_id}/progress")
def save_progress(document_id: str, payload: ProgressUpdate) -> dict[str, bool]:
    document = repository.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")
    repository.save_progress(document_id, mode=payload.mode, sentence_index=payload.sentence_index)
    return {"ok": True}


def _save_or_reuse_document(parsed: ParsedDocument, *, raw_bytes: bytes, extension: str) -> DocumentRecord:
    content_hash = sha256_text(parsed.plain_text)
    existing = repository.find_document_by_hash(content_hash)
    if existing:
        return existing

    document_id = new_uuid7_str()
    stored_path = _store_source_file(document_id=document_id, raw_bytes=raw_bytes, extension=extension)
    timestamp = now_iso()
    original_view = DocumentView(
        mode="original",
        title=parsed.title,
        blocks=parsed.blocks,
        generated_by="local",
        source_hash=content_hash,
        updated_at=timestamp,
    )
    reflowed_view = DocumentView(
        mode="reflowed",
        title=parsed.title,
        blocks=reflow_blocks(parsed.blocks),
        generated_by="local",
        source_hash=content_hash,
        updated_at=timestamp,
    )
    return repository.save_document(
        document_id=document_id,
        title=parsed.title,
        source_type=parsed.source_type,
        file_name=parsed.file_name,
        source_locator=parsed.source_locator,
        stored_path=str(stored_path),
        content_hash=content_hash,
        original_view=original_view,
        reflowed_view=reflowed_view,
        searchable_text=parsed.plain_text,
    )


def _store_source_file(document_id: str, *, raw_bytes: bytes, extension: str) -> Path:
    stored_path = settings.files_dir / f"{document_id}{extension}"
    stored_path.write_bytes(raw_bytes)
    return stored_path


frontend_dist = settings.project_root / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="accessible-reader-web")
