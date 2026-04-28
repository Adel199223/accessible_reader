from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles

from .config import get_settings
from .ids import new_uuid7_str
from .models import (
    AttachmentRef,
    BrowserContextRequest,
    BrowserContextResponse,
    BrowserRecallNoteCreateRequest,
    DocumentRecord,
    DocumentView,
    GraphDecisionRequest,
    HealthResponse,
    ImportTextRequest,
    ImportUrlRequest,
    KnowledgeEdgeRecord,
    KnowledgeGraphSnapshot,
    KnowledgeNodeDetail,
    KnowledgeNodeRecord,
    ProgressUpdate,
    RecallDocumentPreview,
    RecallNoteCreateRequest,
    RecallNoteGraphPromotionRequest,
    RecallNoteRecord,
    RecallNoteSearchHit,
    RecallNoteStudyPromotionRequest,
    RecallNoteUpdateRequest,
    RecallRetrievalHit,
    ReaderSettings,
    RecallDocumentRecord,
    RecallSearchHit,
    StudyCardGenerationResult,
    StudyCardBulkDeleteRequest,
    StudyCardBulkDeleteResult,
    StudyCardCreateRequest,
    StudyCardDeleteResult,
    StudyCardRecord,
    StudyCardUpdateRequest,
    StudyOverview,
    StudyReviewProgress,
    StudyReviewRequest,
    StudyScheduleStateRequest,
    TransformRequest,
    WorkspaceChangeLogPage,
    WorkspaceExportManifest,
    WorkspaceIntegrityReport,
    WorkspaceMergePreview,
    WorkspaceMergePreviewRequest,
    WorkspaceRepairResult,
)
from .parsers import (
    ParsedDocument,
    UnsupportedDocumentError,
    parse_text_input,
    parse_uploaded_file,
    parse_web_page,
)
from .previews import RecallPreviewService
from .reflow import reflow_blocks
from .storage import Repository
from .text_utils import now_iso, sha256_text
from .transforms import TransformUnavailableError, provider_for_key
from .variant_contract import build_variant_metadata
from .web_import import WebImportError, fetch_webpage_snapshot


settings = get_settings()
repository = Repository(settings.database_path, legacy_database_path=settings.legacy_database_path)
preview_service = RecallPreviewService(repository, settings.files_dir)
transform_provider = provider_for_key(settings.openai_api_key, settings.openai_model)


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    settings.files_dir.mkdir(parents=True, exist_ok=True)
    repository.init_db()
    yield


app = FastAPI(title="Recall Workspace API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"^(chrome-extension://.*|moz-extension://.*)$",
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


@app.get("/api/workspace/change-events", response_model=WorkspaceChangeLogPage)
def list_workspace_change_events(
    after: str | None = None,
    entity_type: str | None = None,
    limit: int = 100,
) -> WorkspaceChangeLogPage:
    try:
        return repository.list_change_events(after=after, entity_type=entity_type, limit=limit)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.get("/api/workspace/attachments", response_model=list[AttachmentRef])
def list_workspace_attachments() -> list[AttachmentRef]:
    return repository.list_attachment_refs()


@app.get("/api/workspace/attachments/{attachment_id}")
def download_workspace_attachment(attachment_id: str) -> FileResponse:
    attachment_file = repository.get_attachment_file(attachment_id)
    if not attachment_file:
        raise HTTPException(status_code=404, detail="Attachment not found.")
    attachment, attachment_path = attachment_file
    return FileResponse(
        attachment_path,
        media_type=attachment.media_type or "application/octet-stream",
        filename=attachment.file_name,
    )


@app.get("/api/workspace/export.manifest.json", response_model=WorkspaceExportManifest)
def export_workspace_manifest() -> WorkspaceExportManifest:
    return repository.build_workspace_export_manifest()


@app.get("/api/workspace/integrity", response_model=WorkspaceIntegrityReport)
def get_workspace_integrity() -> WorkspaceIntegrityReport:
    return repository.get_workspace_integrity()


@app.post("/api/workspace/repair", response_model=WorkspaceRepairResult)
def repair_workspace() -> WorkspaceRepairResult:
    return repository.repair_workspace()


@app.get("/api/workspace/export.zip")
def export_workspace_bundle() -> StreamingResponse:
    file_name, bundle = repository.build_workspace_export_bundle()
    response = StreamingResponse(iter([bundle]), media_type="application/zip")
    response.headers["Content-Disposition"] = f'attachment; filename="{file_name}"'
    return response


@app.post("/api/workspace/merge-preview", response_model=WorkspaceMergePreview)
def preview_workspace_merge(payload: WorkspaceMergePreviewRequest) -> WorkspaceMergePreview:
    return repository.preview_workspace_merge(payload.manifest)


@app.get("/api/documents", response_model=list[DocumentRecord])
def list_documents(query: str = "") -> list[DocumentRecord]:
    return repository.list_documents(query)


@app.get("/api/recall/documents", response_model=list[RecallDocumentRecord])
def list_recall_documents() -> list[RecallDocumentRecord]:
    return repository.list_recall_documents()


@app.get("/api/recall/documents/{document_id}", response_model=RecallDocumentRecord)
def get_recall_document(document_id: str) -> RecallDocumentRecord:
    document = repository.get_recall_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")
    return document


@app.get("/api/recall/documents/{document_id}/preview", response_model=RecallDocumentPreview)
def get_recall_document_preview(document_id: str) -> RecallDocumentPreview:
    preview_resolution = preview_service.resolve_document_preview(document_id)
    if not preview_resolution:
        raise HTTPException(status_code=404, detail="Document not found.")
    preview, _ = preview_resolution
    return preview


@app.get("/api/recall/documents/{document_id}/preview/asset")
def get_recall_document_preview_asset(document_id: str) -> FileResponse:
    preview_resolution = preview_service.resolve_document_preview(document_id)
    if not preview_resolution:
        raise HTTPException(status_code=404, detail="Document not found.")
    preview, asset_path = preview_resolution
    if preview.kind != "image" or not asset_path or not asset_path.exists():
        raise HTTPException(status_code=404, detail="Preview asset not found.")
    return FileResponse(asset_path, media_type="image/jpeg", filename=asset_path.name)


@app.get("/api/recall/documents/{document_id}/notes", response_model=list[RecallNoteRecord])
def list_recall_document_notes(document_id: str) -> list[RecallNoteRecord]:
    document = repository.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")
    return repository.list_recall_notes(document_id)


@app.post("/api/recall/documents/{document_id}/notes", response_model=RecallNoteRecord)
def create_recall_document_note(
    document_id: str,
    payload: RecallNoteCreateRequest,
) -> RecallNoteRecord:
    document = repository.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")
    try:
        return repository.create_recall_note(document_id, payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.get("/api/recall/notes/search", response_model=list[RecallNoteSearchHit])
def search_recall_notes(
    query: str = "",
    limit: int = 20,
    document_id: str | None = None,
) -> list[RecallNoteSearchHit]:
    capped_limit = min(max(limit, 1), 50)
    return repository.search_recall_notes(query, limit=capped_limit, document_id=document_id)


@app.patch("/api/recall/notes/{note_id}", response_model=RecallNoteRecord)
def update_recall_note(note_id: str, payload: RecallNoteUpdateRequest) -> RecallNoteRecord:
    note = repository.update_recall_note(note_id, payload)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found.")
    return note


@app.delete("/api/recall/notes/{note_id}", status_code=204)
def delete_recall_note(note_id: str) -> None:
    deleted = repository.delete_recall_note(note_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Note not found.")


@app.post("/api/recall/notes/{note_id}/promote/graph-node", response_model=KnowledgeNodeDetail)
def promote_recall_note_to_graph_node(
    note_id: str,
    payload: RecallNoteGraphPromotionRequest,
) -> KnowledgeNodeDetail:
    try:
        node_detail = repository.promote_recall_note_to_graph_node(note_id, payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    if not node_detail:
        raise HTTPException(status_code=404, detail="Note not found.")
    return node_detail


@app.post("/api/recall/notes/{note_id}/promote/study-card", response_model=StudyCardRecord)
def promote_recall_note_to_study_card(
    note_id: str,
    payload: RecallNoteStudyPromotionRequest,
) -> StudyCardRecord:
    try:
        card = repository.promote_recall_note_to_study_card(note_id, payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    if not card:
        raise HTTPException(status_code=404, detail="Note not found.")
    return card


@app.get("/api/recall/search", response_model=list[RecallSearchHit])
def search_recall(query: str = "", limit: int = 20) -> list[RecallSearchHit]:
    capped_limit = min(max(limit, 1), 50)
    return repository.search_recall(query, limit=capped_limit)


@app.get("/api/recall/retrieve", response_model=list[RecallRetrievalHit])
def retrieve_recall(query: str = "", limit: int = 20) -> list[RecallRetrievalHit]:
    capped_limit = min(max(limit, 1), 50)
    return repository.retrieve_recall(query, limit=capped_limit)


@app.post("/api/recall/browser/context", response_model=BrowserContextResponse)
def get_browser_context(payload: BrowserContextRequest) -> BrowserContextResponse:
    return repository.get_browser_context(payload)


@app.post("/api/recall/browser/notes", response_model=RecallNoteRecord)
def create_browser_recall_note(payload: BrowserRecallNoteCreateRequest) -> RecallNoteRecord:
    try:
        return repository.create_browser_recall_note(payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.get("/api/recall/graph", response_model=KnowledgeGraphSnapshot)
def get_recall_graph(limit_nodes: int = 40, limit_edges: int = 60) -> KnowledgeGraphSnapshot:
    return repository.get_knowledge_graph(limit_nodes=limit_nodes, limit_edges=limit_edges)


@app.get("/api/recall/graph/nodes/{node_id}", response_model=KnowledgeNodeDetail)
def get_recall_graph_node(node_id: str) -> KnowledgeNodeDetail:
    node = repository.get_knowledge_node_detail(node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Knowledge node not found.")
    return node


@app.post("/api/recall/graph/nodes/{node_id}/decision", response_model=KnowledgeNodeRecord)
def decide_recall_graph_node(node_id: str, payload: GraphDecisionRequest) -> KnowledgeNodeRecord:
    node = repository.set_knowledge_node_decision(node_id, payload.decision)
    if not node:
        raise HTTPException(status_code=404, detail="Knowledge node not found.")
    return node


@app.post("/api/recall/graph/edges/{edge_id}/decision", response_model=KnowledgeEdgeRecord)
def decide_recall_graph_edge(edge_id: str, payload: GraphDecisionRequest) -> KnowledgeEdgeRecord:
    edge = repository.set_knowledge_edge_decision(edge_id, payload.decision)
    if not edge:
        raise HTTPException(status_code=404, detail="Knowledge edge not found.")
    return edge


@app.get("/api/recall/study/overview", response_model=StudyOverview)
def get_recall_study_overview() -> StudyOverview:
    return repository.get_study_overview()


@app.get("/api/recall/study/progress", response_model=StudyReviewProgress)
def get_recall_study_progress(
    source_document_id: str | None = None,
    period_days: int = Query(default=14, ge=1, le=365),
) -> StudyReviewProgress:
    return repository.get_study_review_progress(
        source_document_id=source_document_id,
        period_days=period_days,
    )


@app.get("/api/recall/study/cards", response_model=list[StudyCardRecord])
def list_recall_study_cards(status: str = "all", limit: int = 20) -> list[StudyCardRecord]:
    capped_limit = min(max(limit, 1), 100)
    return repository.list_study_cards(status=status, limit=capped_limit)


@app.post("/api/recall/study/cards", response_model=StudyCardRecord)
def create_recall_study_card(payload: StudyCardCreateRequest) -> StudyCardRecord:
    try:
        card = repository.create_study_card(payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    if not card:
        raise HTTPException(status_code=404, detail="Source document not found.")
    return card


@app.post("/api/recall/study/cards/generate", response_model=StudyCardGenerationResult)
def generate_recall_study_cards() -> StudyCardGenerationResult:
    return repository.regenerate_study_cards()


@app.post("/api/recall/study/cards/bulk-delete", response_model=StudyCardBulkDeleteResult)
def bulk_delete_recall_study_cards(payload: StudyCardBulkDeleteRequest) -> StudyCardBulkDeleteResult:
    return repository.bulk_delete_study_cards(payload.card_ids)


@app.patch("/api/recall/study/cards/{card_id}", response_model=StudyCardRecord)
def update_recall_study_card(card_id: str, payload: StudyCardUpdateRequest) -> StudyCardRecord:
    try:
        card = repository.update_study_card(card_id, payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    if not card:
        raise HTTPException(status_code=404, detail="Study card not found.")
    return card


@app.delete("/api/recall/study/cards/{card_id}", response_model=StudyCardDeleteResult)
def delete_recall_study_card(card_id: str) -> StudyCardDeleteResult:
    result = repository.delete_study_card(card_id)
    if not result:
        raise HTTPException(status_code=404, detail="Study card not found.")
    return result


@app.post("/api/recall/study/cards/{card_id}/review", response_model=StudyCardRecord)
def review_recall_study_card(card_id: str, payload: StudyReviewRequest) -> StudyCardRecord:
    card = repository.review_study_card(card_id, payload.rating)
    if not card:
        raise HTTPException(status_code=404, detail="Study card not found.")
    return card


@app.post("/api/recall/study/cards/{card_id}/schedule-state", response_model=StudyCardRecord)
def set_recall_study_card_schedule_state(
    card_id: str,
    payload: StudyScheduleStateRequest,
) -> StudyCardRecord:
    card = repository.set_study_card_schedule_state(card_id, payload.action)
    if not card:
        raise HTTPException(status_code=404, detail="Study card not found.")
    return card


@app.get("/api/recall/documents/{document_id}/export.md")
def export_recall_document_markdown(document_id: str) -> StreamingResponse:
    export_payload = repository.build_recall_markdown_export(document_id)
    if not export_payload:
        raise HTTPException(status_code=404, detail="Document not found.")

    _, file_name, markdown = export_payload
    response = StreamingResponse(iter([markdown.encode("utf-8")]), media_type="text/markdown; charset=utf-8")
    response.headers["Content-Disposition"] = f'attachment; filename="{file_name}"'
    return response


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

    source_document = repository.get_source_document(document_id)
    stored_path = repository.delete_document(document_id)
    if stored_path:
        try:
            Path(stored_path).unlink(missing_ok=True)
        except OSError:
            pass
    preview_service.delete_cached_preview_for_document(source_document)


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
    repository.save_progress(
        document_id,
        mode=payload.mode,
        sentence_index=payload.sentence_index,
        summary_detail=payload.summary_detail,
        accessibility_snapshot=payload.accessibility_snapshot,
    )
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
        variant_metadata=build_variant_metadata(parsed.blocks),
        generated_by="local",
        source_hash=content_hash,
        updated_at=timestamp,
    )
    reflowed_blocks = reflow_blocks(parsed.blocks)
    reflowed_view = DocumentView(
        mode="reflowed",
        title=parsed.title,
        blocks=reflowed_blocks,
        variant_metadata=build_variant_metadata(reflowed_blocks),
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
    @app.get("/recall", include_in_schema=False)
    def serve_recall_shell() -> FileResponse:
        return FileResponse(frontend_dist / "index.html")


    @app.get("/reader", include_in_schema=False)
    def serve_reader_shell() -> FileResponse:
        return FileResponse(frontend_dist / "index.html")

    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="accessible-reader-web")
