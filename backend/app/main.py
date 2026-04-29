from __future__ import annotations

from collections import Counter
from contextlib import asynccontextmanager
from io import BytesIO
import json
import posixpath
from pathlib import Path
from zipfile import BadZipFile, ZipFile

from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError

from .config import get_settings
from .bulk_import import ParsedBatchItem, build_batch_import_preview, collection_paths_for_item
from .ids import new_uuid7_str
from .models import (
    AttachmentRef,
    BatchImportFormat,
    BatchImportPreview,
    BatchResolvedImportFormat,
    BatchImportResult,
    BatchImportResultRow,
    BatchImportResultSummary,
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
    LibraryCollectionOverview,
    LibraryReadingQueueResponse,
    LibraryReadingQueueScope,
    LibraryReadingQueueState,
    LibrarySettings,
    ProgressUpdate,
    ReadingCompleteRequest,
    ReadingCompleteResult,
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
    StudyCardGenerationRequest,
    StudyCardGenerationResult,
    StudyAnswerAttemptRecord,
    StudyAnswerAttemptRequest,
    StudyCardBulkDeleteRequest,
    StudyCardBulkDeleteResult,
    StudyCardCreateRequest,
    StudyCardDeleteResult,
    StudyCardRecord,
    StudyCardUpdateRequest,
    StudyOverview,
    StudyReviewProgress,
    StudyReviewSessionCompleteRequest,
    StudyReviewSessionRecord,
    StudyReviewSessionStartRequest,
    StudyReviewRequest,
    StudyScheduleStateRequest,
    StudySettings,
    TransformRequest,
    WorkspaceChangeLogPage,
    WorkspaceDataPayload,
    WorkspaceExportManifest,
    WorkspaceImportApplyResult,
    WorkspaceImportPreview,
    WorkspaceImportPreviewSummary,
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
from .portability import WORKSPACE_DATA_ARCHIVE_PATH
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


def _is_safe_archive_path(path: str | None) -> bool:
    if not path:
        return False
    normalized = path.replace("\\", "/")
    if normalized.startswith("/") or normalized.startswith("../") or normalized == "..":
        return False
    if any(part in {"", ".", ".."} for part in normalized.split("/")):
        return False
    return posixpath.normpath(normalized) == normalized


def _parse_workspace_export_manifest(raw_manifest: bytes) -> WorkspaceExportManifest:
    try:
        return WorkspaceExportManifest.model_validate_json(raw_manifest)
    except (ValidationError, ValueError) as exc:
        raise ValueError("Uploaded backup manifest is not a valid workspace export manifest.") from exc


def _parse_workspace_data_payload(raw_payload: bytes) -> WorkspaceDataPayload:
    try:
        return WorkspaceDataPayload.model_validate_json(raw_payload)
    except (ValidationError, ValueError) as exc:
        raise ValueError("Uploaded backup data payload is not valid workspace restore data.") from exc


def _source_learning_pack_is_present(source_document_id: str, learning_pack_paths: list[str]) -> bool:
    suffix = f"-{source_document_id}/learning-pack.md"
    fallback_suffix = f"/{source_document_id}/learning-pack.md"
    return any(path.endswith(suffix) or path.endswith(fallback_suffix) for path in learning_pack_paths)


def _build_workspace_import_preview(
    manifest: WorkspaceExportManifest,
    *,
    source_kind: str,
    archive_member_names: set[str] | None = None,
    has_data_payload: bool = False,
) -> WorkspaceImportPreview:
    safe_archive_member_names = archive_member_names or set()
    bundle_coverage_available = archive_member_names is not None
    learning_pack_paths = sorted(
        name
        for name in safe_archive_member_names
        if name.startswith("sources/") and name.endswith("/learning-pack.md")
    )
    attachment_paths = [
        attachment.relative_path
        for attachment in manifest.attachments
        if attachment.relative_path
    ]
    missing_attachment_paths = (
        [
            path
            for path in attachment_paths
            if not _is_safe_archive_path(path) or path not in safe_archive_member_names
        ]
        if bundle_coverage_available
        else []
    )
    bundled_attachment_count = len(attachment_paths) - len(missing_attachment_paths) if bundle_coverage_available else 0
    missing_learning_pack_paths = []
    if bundle_coverage_available:
        for entity in manifest.entities:
            if entity.entity_type != "source_document":
                continue
            if not _source_learning_pack_is_present(entity.entity_id, learning_pack_paths):
                missing_learning_pack_paths.append(f"sources/*-{entity.entity_id}/learning-pack.md")

    merge_preview = repository.preview_workspace_merge(manifest)
    apply_blockers: list[str] = []
    if source_kind != "zip":
        apply_blockers.append("Restore requires a workspace ZIP backup; raw manifest files are preview-only.")
    elif not has_data_payload:
        apply_blockers.append(f"Restore requires {WORKSPACE_DATA_ARCHIVE_PATH}; this backup can only be previewed.")
    restorable_entity_counts = dict(
        sorted(
            Counter(
                operation.entity_type
                for operation in merge_preview.operations
                if operation.decision == "import_remote"
            ).items()
        )
    )

    return WorkspaceImportPreview(
        dry_run=True,
        applied=False,
        can_apply=not apply_blockers,
        apply_blockers=apply_blockers,
        restorable_entity_counts=restorable_entity_counts,
        backup=WorkspaceImportPreviewSummary(
            source_kind=source_kind,
            format_version=manifest.format_version,
            schema_version=manifest.schema_version,
            device_id=manifest.device_id,
            exported_at=manifest.exported_at,
            latest_change_id=manifest.latest_change_id,
            change_event_count=manifest.change_event_count,
            entity_counts=manifest.entity_counts,
            attachment_count=len(manifest.attachments),
            bundled_attachment_count=max(0, bundled_attachment_count),
            missing_attachment_paths=missing_attachment_paths,
            learning_pack_count=len(learning_pack_paths),
            missing_learning_pack_paths=missing_learning_pack_paths,
            bundle_coverage_available=bundle_coverage_available,
            warnings=manifest.warnings,
        ),
        merge_preview=merge_preview,
    )


def _preview_workspace_import_bundle(raw_bundle: bytes) -> WorkspaceImportPreview:
    try:
        with ZipFile(BytesIO(raw_bundle)) as archive:
            safe_member_names = {
                member_name
                for member_name in archive.namelist()
                if _is_safe_archive_path(member_name)
            }
            if "manifest.json" not in safe_member_names:
                raise ValueError("Workspace backup ZIP is missing manifest.json.")
            manifest = _parse_workspace_export_manifest(archive.read("manifest.json"))
            has_data_payload = WORKSPACE_DATA_ARCHIVE_PATH in safe_member_names
            if has_data_payload:
                _parse_workspace_data_payload(archive.read(WORKSPACE_DATA_ARCHIVE_PATH))
    except BadZipFile as exc:
        raise ValueError("Uploaded backup is not a readable workspace ZIP.") from exc
    return _build_workspace_import_preview(
        manifest,
        source_kind="zip",
        archive_member_names=safe_member_names,
        has_data_payload=has_data_payload,
    )


def _preview_workspace_import_manifest(raw_manifest: bytes) -> WorkspaceImportPreview:
    manifest = _parse_workspace_export_manifest(raw_manifest)
    return _build_workspace_import_preview(manifest, source_kind="manifest")


@app.post("/api/workspace/import-preview", response_model=WorkspaceImportPreview)
async def preview_workspace_import(file: UploadFile = File(...)) -> WorkspaceImportPreview:
    raw_upload = await file.read()
    if not raw_upload:
        raise HTTPException(status_code=400, detail="Upload a workspace export ZIP or manifest JSON file.")
    file_name = (file.filename or "").lower()
    try:
        if file_name.endswith(".zip") or raw_upload.startswith(b"PK"):
            return _preview_workspace_import_bundle(raw_upload)
        return _preview_workspace_import_manifest(raw_upload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


def _parse_workspace_import_apply_bundle(
    raw_bundle: bytes,
) -> tuple[WorkspaceExportManifest, WorkspaceDataPayload, dict[str, bytes]]:
    try:
        with ZipFile(BytesIO(raw_bundle)) as archive:
            safe_member_names = {
                member_name
                for member_name in archive.namelist()
                if _is_safe_archive_path(member_name)
            }
            if "manifest.json" not in safe_member_names:
                raise ValueError("Workspace backup ZIP is missing manifest.json.")
            if WORKSPACE_DATA_ARCHIVE_PATH not in safe_member_names:
                raise ValueError(f"Restore requires {WORKSPACE_DATA_ARCHIVE_PATH}; preview this backup instead.")
            manifest = _parse_workspace_export_manifest(archive.read("manifest.json"))
            data_payload = _parse_workspace_data_payload(archive.read(WORKSPACE_DATA_ARCHIVE_PATH))
            attachment_payloads: dict[str, bytes] = {}
            for attachment in manifest.attachments:
                if attachment.relative_path and attachment.relative_path in safe_member_names:
                    attachment_payloads[attachment.relative_path] = archive.read(attachment.relative_path)
            return manifest, data_payload, attachment_payloads
    except BadZipFile as exc:
        raise ValueError("Uploaded backup is not a readable workspace ZIP.") from exc


@app.post("/api/workspace/import-apply", response_model=WorkspaceImportApplyResult)
async def apply_workspace_import(
    file: UploadFile = File(...),
    restore_confirmation: str = Form(...),
) -> WorkspaceImportApplyResult:
    if restore_confirmation != "restore-missing-items":
        raise HTTPException(status_code=400, detail="Confirm restore-missing-items before applying a backup.")
    raw_upload = await file.read()
    if not raw_upload:
        raise HTTPException(status_code=400, detail="Upload a workspace export ZIP before restoring.")
    file_name = (file.filename or "").lower()
    if not (file_name.endswith(".zip") or raw_upload.startswith(b"PK")):
        raise HTTPException(status_code=400, detail="Restore requires a workspace ZIP backup.")
    try:
        manifest, data_payload, attachment_payloads = _parse_workspace_import_apply_bundle(raw_upload)
        return repository.apply_workspace_import(
            manifest=manifest,
            data_payload=data_payload,
            attachment_payloads=attachment_payloads,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


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


@app.get("/api/recall/study/settings", response_model=StudySettings)
def get_recall_study_settings() -> StudySettings:
    return repository.get_study_settings()


@app.put("/api/recall/study/settings", response_model=StudySettings)
def save_recall_study_settings(payload: StudySettings) -> StudySettings:
    return repository.save_study_settings(payload)


@app.get("/api/recall/library/settings", response_model=LibrarySettings)
def get_recall_library_settings() -> LibrarySettings:
    return repository.get_library_settings()


@app.put("/api/recall/library/settings", response_model=LibrarySettings)
def save_recall_library_settings(payload: LibrarySettings) -> LibrarySettings:
    try:
        return repository.save_library_settings(payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.get("/api/recall/library/reading-queue", response_model=LibraryReadingQueueResponse)
def get_recall_library_reading_queue(
    scope: LibraryReadingQueueScope = Query("all"),
    collection_id: str | None = None,
    state: LibraryReadingQueueState = Query("all"),
    limit: int = Query(default=20, ge=1, le=50),
) -> LibraryReadingQueueResponse:
    try:
        queue = repository.get_library_reading_queue(
            scope=scope,
            collection_id=collection_id,
            state=state,
            limit=limit,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    if not queue:
        raise HTTPException(status_code=404, detail="Library collection not found.")
    return queue


@app.get("/api/recall/library/collections/{collection_id}/overview", response_model=LibraryCollectionOverview)
def get_recall_library_collection_overview(collection_id: str) -> LibraryCollectionOverview:
    overview = repository.get_library_collection_overview(collection_id)
    if not overview:
        raise HTTPException(status_code=404, detail="Library collection not found.")
    return overview


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
def list_recall_study_cards(
    status: str = "all",
    limit: int = 20,
    source_document_id: str | None = None,
) -> list[StudyCardRecord]:
    capped_limit = min(max(limit, 1), 100)
    return repository.list_study_cards(status=status, limit=capped_limit, source_document_id=source_document_id)


@app.post("/api/recall/study/sessions", response_model=StudyReviewSessionRecord)
def start_recall_study_review_session(payload: StudyReviewSessionStartRequest) -> StudyReviewSessionRecord:
    try:
        session = repository.start_study_review_session(payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    if not session:
        raise HTTPException(status_code=404, detail="Source document not found.")
    return session


@app.post("/api/recall/study/sessions/{session_id}/complete", response_model=StudyReviewSessionRecord)
def complete_recall_study_review_session(
    session_id: str,
    payload: StudyReviewSessionCompleteRequest,
) -> StudyReviewSessionRecord:
    session = repository.complete_study_review_session(session_id, payload)
    if not session:
        raise HTTPException(status_code=404, detail="Study review session not found.")
    return session


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
def generate_recall_study_cards(
    payload: StudyCardGenerationRequest | None = None,
) -> StudyCardGenerationResult:
    try:
        return repository.regenerate_study_cards(payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


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


@app.post("/api/recall/study/cards/{card_id}/attempts", response_model=StudyAnswerAttemptRecord)
def create_recall_study_answer_attempt(
    card_id: str,
    payload: StudyAnswerAttemptRequest,
) -> StudyAnswerAttemptRecord:
    try:
        attempt = repository.create_study_answer_attempt(card_id, payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    if not attempt:
        raise HTTPException(status_code=404, detail="Study card not found.")
    return attempt


@app.post("/api/recall/study/cards/{card_id}/review", response_model=StudyCardRecord)
def review_recall_study_card(card_id: str, payload: StudyReviewRequest) -> StudyCardRecord:
    try:
        card = repository.review_study_card(card_id, payload.rating, attempt_id=payload.attempt_id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
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


@app.get("/api/recall/documents/{document_id}/learning-export.md")
def export_recall_document_learning_pack_markdown(document_id: str) -> StreamingResponse:
    export_payload = repository.build_recall_learning_pack_export(document_id)
    if not export_payload:
        raise HTTPException(status_code=404, detail="Document not found.")

    _, file_name, markdown = export_payload
    response = StreamingResponse(iter([markdown.encode("utf-8")]), media_type="text/markdown; charset=utf-8")
    response.headers["Content-Disposition"] = f'attachment; filename="{file_name}"'
    return response


@app.get("/api/recall/library/collections/{collection_id}/learning-export.zip")
def export_recall_library_collection_learning_pack_zip(collection_id: str) -> StreamingResponse:
    export_payload = repository.build_library_collection_learning_export(collection_id)
    if not export_payload:
        raise HTTPException(status_code=404, detail="Library collection not found.")

    file_name, content = export_payload
    response = StreamingResponse(iter([content]), media_type="application/zip")
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


@app.post("/api/documents/import-batch-preview", response_model=BatchImportPreview)
async def preview_document_batch_import(
    file: UploadFile = File(...),
    source_format: BatchImportFormat = Form("auto"),
    max_items: int = Form(25),
) -> BatchImportPreview:
    raw_upload = await file.read()
    try:
        return build_batch_import_preview(
            raw_upload,
            file_name=file.filename or "import-list",
            requested_format=source_format,
            max_items=max_items,
            existing_url_checker=lambda url: repository.find_web_document_by_url(url) is not None,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


def _parse_selected_batch_import_ids(selected_item_ids_json: str) -> set[str] | None:
    if not selected_item_ids_json.strip():
        return None
    try:
        parsed = json.loads(selected_item_ids_json)
    except json.JSONDecodeError as exc:
        raise ValueError("selected_item_ids_json must be a JSON array of preview row ids.") from exc
    if parsed is None:
        return None
    if not isinstance(parsed, list) or any(not isinstance(item, str) or not item for item in parsed):
        raise ValueError("selected_item_ids_json must be a JSON array of preview row ids.")
    return set(parsed)


@app.post("/api/documents/import-batch", response_model=BatchImportResult)
async def import_document_batch(
    file: UploadFile = File(...),
    source_format: BatchImportFormat = Form("auto"),
    max_items: int = Form(25),
    selected_item_ids_json: str = Form(""),
    create_collections: bool = Form(False),
    import_confirmation: str = Form(...),
) -> BatchImportResult:
    if import_confirmation != "import-selected-sources":
        raise HTTPException(status_code=400, detail="Confirm import-selected-sources before importing a batch.")
    raw_upload = await file.read()
    try:
        selected_ids = _parse_selected_batch_import_ids(selected_item_ids_json)
        preview = build_batch_import_preview(
            raw_upload,
            file_name=file.filename or "import-list",
            requested_format=source_format,
            max_items=max_items,
            existing_url_checker=lambda url: repository.find_web_document_by_url(url) is not None,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    preview_ids = {row.id for row in preview.rows}
    if selected_ids is not None:
        unknown_ids = sorted(selected_ids - preview_ids)
        if unknown_ids:
            raise HTTPException(status_code=400, detail="Selected import rows no longer match this file.")
    else:
        selected_ids = {row.id for row in preview.rows if row.status == "ready"}

    result_rows: list[BatchImportResultRow] = []
    collection_documents: dict[tuple[tuple[str, ...], BatchResolvedImportFormat], list[str]] = {}
    for preview_row in preview.rows:
        if preview_row.id not in selected_ids:
            result_rows.append(
                BatchImportResultRow(
                    id=preview_row.id,
                    title=preview_row.title,
                    url=preview_row.url,
                    source_format=preview_row.source_format,
                    folder=preview_row.folder,
                    tags=preview_row.tags,
                    status="skipped",
                    reason="Not selected for import.",
                )
            )
            continue
        if preview_row.status != "ready":
            result_rows.append(
                BatchImportResultRow(
                    id=preview_row.id,
                    title=preview_row.title,
                    url=preview_row.url,
                    source_format=preview_row.source_format,
                    folder=preview_row.folder,
                    tags=preview_row.tags,
                    status="skipped",
                    reason=preview_row.reason or "This row is not ready to import.",
                )
            )
            continue
        try:
            fetched_page = fetch_webpage_snapshot(preview_row.url)
            parsed = parse_web_page(fetched_page.resolved_url, fetched_page.html)
            document, reused = _save_or_reuse_document_with_status(
                parsed,
                raw_bytes=fetched_page.html.encode("utf-8"),
                extension=".html",
            )
            result_rows.append(
                BatchImportResultRow(
                    id=preview_row.id,
                    title=preview_row.title or document.title,
                    url=preview_row.url,
                    source_format=preview_row.source_format,
                    folder=preview_row.folder,
                    tags=preview_row.tags,
                    status="reused" if reused else "imported",
                    reason="Matched an existing saved source by content." if reused else None,
                    document=document,
                )
            )
            imported_at = now_iso()
            repository.record_batch_import_metadata(
                document.id,
                source_format=preview_row.source_format,
                url=preview_row.url,
                folder=preview_row.folder,
                tags=preview_row.tags,
                imported_at=imported_at,
            )
            if create_collections:
                pseudo_item = ParsedBatchItem(
                    raw_url=preview_row.url,
                    title=preview_row.title,
                    folder=preview_row.folder,
                    tags=preview_row.tags,
                )
                for collection_path in collection_paths_for_item(pseudo_item, preview_row.source_format):
                    collection_documents.setdefault((tuple(collection_path), preview_row.source_format), []).append(document.id)
        except WebImportError as exc:
            result_rows.append(
                BatchImportResultRow(
                    id=preview_row.id,
                    title=preview_row.title,
                    url=preview_row.url,
                    source_format=preview_row.source_format,
                    folder=preview_row.folder,
                    tags=preview_row.tags,
                    status="failed",
                    reason=exc.detail,
                )
            )
        except UnsupportedDocumentError as exc:
            result_rows.append(
                BatchImportResultRow(
                    id=preview_row.id,
                    title=preview_row.title,
                    url=preview_row.url,
                    source_format=preview_row.source_format,
                    folder=preview_row.folder,
                    tags=preview_row.tags,
                    status="failed",
                    reason=str(exc),
                )
            )

    status_counts = Counter(row.status for row in result_rows)
    collection_results = repository.merge_import_collections(collection_documents) if create_collections else []
    collection_status_counts = Counter(collection.status for collection in collection_results)
    return BatchImportResult(
        dry_run=False,
        applied=True,
        source_format=preview.source_format,
        max_items=preview.max_items,
        rows=result_rows,
        collections=collection_results,
        summary=BatchImportResultSummary(
            total_count=len(result_rows),
            imported_count=status_counts.get("imported", 0),
            reused_count=status_counts.get("reused", 0),
            skipped_count=status_counts.get("skipped", 0),
            failed_count=status_counts.get("failed", 0),
            collection_created_count=collection_status_counts.get("created", 0),
            collection_updated_count=collection_status_counts.get("updated", 0),
        ),
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


@app.post("/api/recall/documents/{document_id}/reading/complete", response_model=ReadingCompleteResult)
def complete_recall_document_reading(
    document_id: str,
    payload: ReadingCompleteRequest | None = None,
) -> ReadingCompleteResult:
    try:
        result = repository.complete_document_reading(document_id, mode=(payload.mode if payload else None))
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    if not result:
        raise HTTPException(status_code=404, detail="Document not found.")
    return result


def _save_or_reuse_document_with_status(
    parsed: ParsedDocument,
    *,
    raw_bytes: bytes,
    extension: str,
) -> tuple[DocumentRecord, bool]:
    content_hash = sha256_text(parsed.plain_text)
    existing = repository.find_document_by_hash(content_hash)
    if existing:
        return existing, True

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
    ), False


def _save_or_reuse_document(parsed: ParsedDocument, *, raw_bytes: bytes, extension: str) -> DocumentRecord:
    document, _ = _save_or_reuse_document_with_status(parsed, raw_bytes=raw_bytes, extension=extension)
    return document


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
