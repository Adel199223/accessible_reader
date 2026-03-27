from __future__ import annotations

from pathlib import Path
from collections import Counter
from hashlib import sha256
from io import BytesIO
import json
import mimetypes
import sqlite3
from typing import Any
from urllib.parse import urlsplit
from zipfile import ZIP_DEFLATED, ZipFile

from .browser_context import (
    build_browser_query_plan,
    canonicalize_page_url,
    is_internal_workspace_page,
    is_supported_page_url,
    path_prefix,
    summarize_context_result,
)
from .ids import new_uuid7_str
from .knowledge import (
    GRAPH_SCHEMA_VERSION,
    KnowledgeSourceDocument,
    build_knowledge_records,
    build_node_id,
    normalize_entity_label,
)
from .models import (
    AccessibilitySnapshot,
    AttachmentRef,
    BrowserContextRequest,
    BrowserContextResponse,
    BrowserRecallNoteCreateRequest,
    BrowserSavedPageMatch,
    ChangeEvent,
    ContentChunk,
    DocumentRecord,
    DocumentView,
    KnowledgeEdge,
    KnowledgeEdgeRecord,
    KnowledgeGraphSnapshot,
    KnowledgeMentionRecord,
    KnowledgeNode,
    KnowledgeNodeDetail,
    KnowledgeNodeRecord,
    ReaderSessionState,
    ReaderSettings,
    SourceDocument,
    RecallNoteAnchor,
    RecallNoteCreateRequest,
    RecallNoteGraphPromotionRequest,
    RecallNoteRecord,
    RecallNoteSearchHit,
    RecallNoteStudyPromotionRequest,
    RecallNoteUpdateRequest,
    RecallRetrievalHit,
    RecallDocumentRecord,
    RecallSearchHit,
    StudyCardGenerationResult,
    StudyCardRecord,
    StudyOverview,
    PortableEntityDigest,
    WorkspaceChangeLogPage,
    WorkspaceExportManifest,
    WorkspaceIntegrityIssue,
    WorkspaceIntegrityReport,
    WorkspaceMergeOperation,
    WorkspaceMergePreview,
    WorkspaceRepairResult,
)
from .portability import (
    WORKSPACE_EXPORT_FORMAT_VERSION,
    build_payload_digest,
    build_workspace_export_filename,
    decide_merge_outcome,
)
from .recall import (
    CHUNK_SCHEMA_VERSION,
    build_note_excerpt,
    build_chunk_excerpt,
    build_match_context,
    build_export_filename,
    build_reflow_chunks,
    enrich_view_with_sentence_metadata,
    render_markdown_export,
    sentence_texts_for_block,
)
from .text_utils import normalize_whitespace, now_iso, safe_query_terms, sha256_text
from .study import (
    LEXICAL_EMBEDDING_MODEL,
    build_embedding_id,
    build_initial_scheduling_state,
    build_review_card_candidates,
    build_review_card_id,
    build_sparse_vector,
    cosine_similarity,
    review_scheduling_state,
    study_card_status,
)


DEFAULT_DEVICE_ID = "desktop-local"
DEFAULT_SESSION_KIND = "reader"
SCHEMA_VERSION = "5"
STUDY_SCHEMA_VERSION = "1"
AUTO_SELECTION_PROMPT_THRESHOLD = 0.56
AUTO_PAGE_PROMPT_THRESHOLD = 0.9
AUTO_SELECTION_RESULT_FLOOR = 0.34
AUTO_PAGE_RESULT_FLOOR = 0.42
MANUAL_RESULT_FLOOR = 0.18
STRONG_SITE_PROMPT_THRESHOLD = 0.58
INTEGRITY_STATUS_OK = "ok"
INTEGRITY_QUICK_CHECK_SKIPPED = "skipped"


class Repository:
    def __init__(
        self,
        database_path: Path,
        *,
        legacy_database_path: Path | None = None,
        device_id: str = DEFAULT_DEVICE_ID,
    ):
        self.database_path = database_path
        self.legacy_database_path = legacy_database_path
        self.device_id = device_id

    def connect(self) -> sqlite3.Connection:
        return self._connect_to_path(self.database_path)

    def init_db(self) -> None:
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as connection:
            self._init_workspace_schema(connection)
        self._migrate_legacy_reader_db_if_needed()
        self._repair_workspace(trigger="startup", include_quick_check=False)

    def find_document_by_hash(self, content_hash: str) -> DocumentRecord | None:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT id FROM source_documents WHERE content_hash = ?",
                (content_hash,),
            ).fetchone()
        if not row:
            return None
        return self.get_document(row["id"])

    def save_document(
        self,
        *,
        document_id: str,
        title: str,
        source_type: str,
        file_name: str | None,
        source_locator: str | None,
        stored_path: str | None,
        content_hash: str,
        original_view: DocumentView,
        reflowed_view: DocumentView,
        searchable_text: str,
    ) -> DocumentRecord:
        timestamp = now_iso()
        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO source_documents (
                    id,
                    title,
                    source_type,
                    file_name,
                    source_locator,
                    stored_path,
                    content_hash,
                    metadata_json,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    document_id,
                    title,
                    source_type,
                    file_name,
                    source_locator,
                    stored_path,
                    content_hash,
                    "{}",
                    timestamp,
                    timestamp,
                ),
            )
            self._save_view_with_connection(connection, document_id, original_view)
            self._save_view_with_connection(connection, document_id, reflowed_view)
            connection.execute(
                "INSERT INTO source_documents_fts (source_document_id, title, body) VALUES (?, ?, ?)",
                (document_id, title, searchable_text),
            )
            self._sync_reflow_chunks_with_connection(connection, document_id)
            self._append_change_event_with_connection(
                connection,
                entity_type="source_document",
                entity_id=document_id,
                event_type="created",
                payload={
                    "title": title,
                    "source_type": source_type,
                    "content_hash": content_hash,
                    "source_locator": source_locator,
                },
            )
        self.refresh_recall_knowledge()
        return self.get_document(document_id)

    def list_documents(self, query: str = "") -> list[DocumentRecord]:
        with self.connect() as connection:
            if query.strip():
                terms = safe_query_terms(query)
                if terms:
                    fts_query = " AND ".join(f"{term}*" for term in terms)
                    rows = connection.execute(
                        """
                        SELECT sd.*
                        FROM source_documents sd
                        INNER JOIN source_documents_fts ON source_documents_fts.source_document_id = sd.id
                        WHERE source_documents_fts MATCH ?
                        ORDER BY sd.updated_at DESC
                        """,
                        (fts_query,),
                    ).fetchall()
                else:
                    rows = connection.execute(
                        "SELECT * FROM source_documents WHERE title LIKE ? ORDER BY updated_at DESC",
                        (f"%{query.strip()}%",),
                    ).fetchall()
            else:
                rows = connection.execute(
                    "SELECT * FROM source_documents ORDER BY updated_at DESC"
                ).fetchall()
            return [self._row_to_record(connection, row) for row in rows]

    def get_document(self, document_id: str) -> DocumentRecord | None:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT * FROM source_documents WHERE id = ?",
                (document_id,),
            ).fetchone()
            if not row:
                return None
            return self._row_to_record(connection, row)

    def get_source_document(self, document_id: str) -> SourceDocument | None:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT * FROM source_documents WHERE id = ?",
                (document_id,),
            ).fetchone()
            if not row:
                return None
            return self._row_to_source_document(row)

    def get_view(self, document_id: str, mode: str, detail_level: str = "default") -> DocumentView | None:
        with self.connect() as connection:
            row = connection.execute(
                """
                SELECT id, view_json
                FROM document_variants
                WHERE source_document_id = ? AND mode = ? AND detail_level = ?
                """,
                (document_id, mode, detail_level),
            ).fetchone()
        if not row:
            return None
        return self._view_from_variant_row(row)

    def save_source_document_metadata(
        self,
        document_id: str,
        metadata: dict[str, Any],
        *,
        touch_updated_at: bool = False,
    ) -> bool:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT id FROM source_documents WHERE id = ?",
                (document_id,),
            ).fetchone()
            if not row:
                return False

            if touch_updated_at:
                connection.execute(
                    """
                    UPDATE source_documents
                    SET metadata_json = ?, updated_at = ?
                    WHERE id = ?
                    """,
                    (json.dumps(metadata, sort_keys=True), now_iso(), document_id),
                )
            else:
                connection.execute(
                    """
                    UPDATE source_documents
                    SET metadata_json = ?
                    WHERE id = ?
                    """,
                    (json.dumps(metadata, sort_keys=True), document_id),
                )
        return True

    def save_view(self, document_id: str, view: DocumentView) -> DocumentView:
        should_refresh_recall = view.mode == "reflowed" and view.detail_level == "default"
        with self.connect() as connection:
            self._save_view_with_connection(connection, document_id, view)
            if should_refresh_recall:
                self._sync_reflow_chunks_with_connection(connection, document_id)
        if should_refresh_recall:
            self.refresh_recall_knowledge()
        return view

    def backfill_recall_chunks(self) -> int:
        with self.connect() as connection:
            return self._backfill_recall_chunks_with_connection(connection)

    def refresh_recall_knowledge(self) -> StudyCardGenerationResult:
        with self.connect() as connection:
            self._backfill_recall_chunks_with_connection(connection)
            self._rebuild_knowledge_graph_with_connection(connection)
            generation_result = self._sync_review_cards_with_connection(connection)
            self._rebuild_lexical_embeddings_with_connection(connection)
            return generation_result

    def list_recall_documents(self) -> list[RecallDocumentRecord]:
        with self.connect() as connection:
            rows = connection.execute(
                """
                SELECT sd.*, COUNT(cc.id) AS chunk_count
                FROM source_documents sd
                LEFT JOIN content_chunks cc ON cc.source_document_id = sd.id
                GROUP BY sd.id
                ORDER BY sd.updated_at DESC
                """
            ).fetchall()
            return [self._row_to_recall_record(connection, row) for row in rows]

    def get_recall_document(self, document_id: str) -> RecallDocumentRecord | None:
        with self.connect() as connection:
            row = connection.execute(
                """
                SELECT sd.*, COUNT(cc.id) AS chunk_count
                FROM source_documents sd
                LEFT JOIN content_chunks cc ON cc.source_document_id = sd.id
                WHERE sd.id = ?
                GROUP BY sd.id
                """,
                (document_id,),
            ).fetchone()
            if not row:
                return None
            return self._row_to_recall_record(connection, row)

    def list_recall_notes(self, document_id: str) -> list[RecallNoteRecord]:
        with self.connect() as connection:
            rows = connection.execute(
                """
                SELECT rn.*
                FROM recall_notes rn
                WHERE rn.source_document_id = ?
                ORDER BY rn.updated_at DESC, rn.id DESC
                """,
                (document_id,),
            ).fetchall()
            return [self._row_to_recall_note_record(row) for row in rows]

    def create_recall_note(
        self,
        document_id: str,
        payload: RecallNoteCreateRequest,
    ) -> RecallNoteRecord:
        with self.connect() as connection:
            anchor = self._validated_recall_note_anchor_with_connection(
                connection,
                document_id=document_id,
                anchor=payload.anchor,
            )
            note_id = new_uuid7_str()
            timestamp = now_iso()
            body_text = self._normalize_note_body(payload.body_text)
            connection.execute(
                """
                INSERT INTO recall_notes (
                    id,
                    source_document_id,
                    variant_id,
                    block_id,
                    sentence_start,
                    sentence_end,
                    global_sentence_start,
                    global_sentence_end,
                    anchor_text,
                    excerpt_text,
                    body_text,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    note_id,
                    anchor.source_document_id,
                    anchor.variant_id,
                    anchor.block_id,
                    anchor.sentence_start,
                    anchor.sentence_end,
                    anchor.global_sentence_start,
                    anchor.global_sentence_end,
                    anchor.anchor_text,
                    anchor.excerpt_text,
                    body_text,
                    timestamp,
                    timestamp,
                ),
            )
            self._upsert_recall_note_fts_with_connection(
                connection,
                note_id=note_id,
                source_document_id=document_id,
                anchor_text=anchor.anchor_text,
                excerpt_text=anchor.excerpt_text,
                body_text=body_text,
            )
            self._append_change_event_with_connection(
                connection,
                entity_type="recall_note",
                entity_id=note_id,
                event_type="created",
                payload={
                    "source_document_id": document_id,
                    "variant_id": anchor.variant_id,
                    "block_id": anchor.block_id,
                    "sentence_start": anchor.sentence_start,
                    "sentence_end": anchor.sentence_end,
                },
                created_at=timestamp,
            )
            row = connection.execute(
                "SELECT * FROM recall_notes WHERE id = ?",
                (note_id,),
            ).fetchone()
            assert row is not None
            return self._row_to_recall_note_record(row)

    def create_browser_recall_note(self, payload: BrowserRecallNoteCreateRequest) -> RecallNoteRecord:
        normalized_selection = normalize_whitespace(payload.selection_text)
        if not normalized_selection:
            raise ValueError("Select text on the saved page before adding a note.")
        if not is_supported_page_url(payload.page_url) or is_internal_workspace_page(payload.page_url):
            raise ValueError("Browser note capture only works on saved public webpages.")

        with self.connect() as connection:
            matched_row = self._find_exact_saved_page_row_with_connection(connection, payload.page_url)
            if not matched_row:
                raise ValueError("This public page is not saved in Recall yet. Import it before adding browser notes.")
            anchor = self._resolve_browser_note_anchor_with_connection(
                connection,
                document_id=str(matched_row["id"]),
                selection_text=normalized_selection,
            )

        return self.create_recall_note(
            str(matched_row["id"]),
            RecallNoteCreateRequest(anchor=anchor, body_text=payload.body_text),
        )

    def update_recall_note(
        self,
        note_id: str,
        payload: RecallNoteUpdateRequest,
    ) -> RecallNoteRecord | None:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT * FROM recall_notes WHERE id = ?",
                (note_id,),
            ).fetchone()
            if not row:
                return None

            timestamp = now_iso()
            body_text = self._normalize_note_body(payload.body_text)
            connection.execute(
                """
                UPDATE recall_notes
                SET body_text = ?, updated_at = ?
                WHERE id = ?
                """,
                (body_text, timestamp, note_id),
            )
            self._upsert_recall_note_fts_with_connection(
                connection,
                note_id=note_id,
                source_document_id=row["source_document_id"],
                anchor_text=row["anchor_text"],
                excerpt_text=row["excerpt_text"],
                body_text=body_text,
            )
            self._append_change_event_with_connection(
                connection,
                entity_type="recall_note",
                entity_id=note_id,
                event_type="updated",
                payload={
                    "source_document_id": row["source_document_id"],
                    "body_text": body_text,
                },
                created_at=timestamp,
            )
            updated_row = connection.execute(
                "SELECT * FROM recall_notes WHERE id = ?",
                (note_id,),
            ).fetchone()
            assert updated_row is not None
            return self._row_to_recall_note_record(updated_row)

    def delete_recall_note(self, note_id: str) -> bool:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT id, source_document_id FROM recall_notes WHERE id = ?",
                (note_id,),
            ).fetchone()
            if not row:
                return False

            timestamp = now_iso()
            self._append_change_event_with_connection(
                connection,
                entity_type="recall_note",
                entity_id=note_id,
                event_type="deleted",
                payload={"source_document_id": row["source_document_id"]},
                created_at=timestamp,
            )
            connection.execute("DELETE FROM recall_notes_fts WHERE note_id = ?", (note_id,))
            connection.execute("DELETE FROM recall_notes WHERE id = ?", (note_id,))
            return True

    def promote_recall_note_to_graph_node(
        self,
        note_id: str,
        payload: RecallNoteGraphPromotionRequest,
    ) -> KnowledgeNodeDetail | None:
        label = normalize_whitespace(payload.label)
        if not label:
            raise ValueError("Enter a graph label before promoting this note.")
        canonical_key = normalize_entity_label(label)
        if not canonical_key:
            raise ValueError("Graph labels need at least one letter or number.")
        description = normalize_whitespace(payload.description or "") or None

        with self.connect() as connection:
            note_row = connection.execute(
                """
                SELECT rn.*, sd.title AS document_title
                FROM recall_notes rn
                INNER JOIN source_documents sd ON sd.id = rn.source_document_id
                WHERE rn.id = ?
                """,
                (note_id,),
            ).fetchone()
            if not note_row:
                return None

            timestamp = now_iso()
            node_id = build_node_id(canonical_key)
            self._upsert_manual_note_knowledge_node_with_connection(
                connection,
                note_row=note_row,
                note_id=note_id,
                node_id=node_id,
                label=label,
                canonical_key=canonical_key,
                description=description,
                updated_at=timestamp,
            )
            self._refresh_knowledge_node_aggregates_with_connection(connection, updated_at=timestamp)
            self._append_change_event_with_connection(
                connection,
                entity_type="knowledge_node",
                entity_id=node_id,
                event_type="promoted_from_note",
                payload={
                    "note_id": note_id,
                    "source_document_id": note_row["source_document_id"],
                    "canonical_key": canonical_key,
                },
                created_at=timestamp,
            )
            self._rebuild_lexical_embeddings_with_connection(connection)

        return self.get_knowledge_node_detail(node_id)

    def promote_recall_note_to_study_card(
        self,
        note_id: str,
        payload: RecallNoteStudyPromotionRequest,
    ) -> StudyCardRecord | None:
        prompt = normalize_whitespace(payload.prompt)
        answer = normalize_whitespace(payload.answer)
        if not prompt:
            raise ValueError("Enter a study prompt before creating a card.")
        if not answer:
            raise ValueError("Enter a study answer before creating a card.")

        with self.connect() as connection:
            note_row = connection.execute(
                """
                SELECT rn.*, sd.title AS document_title
                FROM recall_notes rn
                INNER JOIN source_documents sd ON sd.id = rn.source_document_id
                WHERE rn.id = ?
                """,
                (note_id,),
            ).fetchone()
            if not note_row:
                return None

            card_id = build_review_card_id("manual_note", note_row["source_document_id"], note_id)
            existing_row = connection.execute(
                """
                SELECT rc.*, sd.title AS document_title
                FROM review_cards rc
                INNER JOIN source_documents sd ON sd.id = rc.source_document_id
                WHERE rc.id = ?
                """,
                (card_id,),
            ).fetchone()
            timestamp = now_iso()
            scheduling_state = (
                json.loads(existing_row["scheduling_state_json"] or "{}")
                if existing_row
                else build_initial_scheduling_state(card_id, created_at=timestamp)
            )
            scheduling_state["status"] = study_card_status(scheduling_state)
            source_spans = [
                {
                    "note_id": note_id,
                    "block_id": note_row["block_id"],
                    "sentence_start": note_row["sentence_start"],
                    "sentence_end": note_row["sentence_end"],
                    "global_sentence_start": note_row["global_sentence_start"],
                    "global_sentence_end": note_row["global_sentence_end"],
                    "anchor_text": note_row["anchor_text"],
                    "excerpt": note_row["excerpt_text"],
                }
            ]
            connection.execute(
                """
                INSERT INTO review_cards (
                    id,
                    source_document_id,
                    prompt,
                    answer,
                    card_type,
                    source_spans_json,
                    scheduling_state_json,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    source_document_id = excluded.source_document_id,
                    prompt = excluded.prompt,
                    answer = excluded.answer,
                    card_type = excluded.card_type,
                    source_spans_json = excluded.source_spans_json,
                    scheduling_state_json = excluded.scheduling_state_json,
                    updated_at = excluded.updated_at
                """,
                (
                    card_id,
                    note_row["source_document_id"],
                    prompt,
                    answer,
                    "manual_note",
                    json.dumps(source_spans, sort_keys=True),
                    json.dumps(scheduling_state, sort_keys=True),
                    existing_row["created_at"] if existing_row else timestamp,
                    timestamp,
                ),
            )
            self._append_change_event_with_connection(
                connection,
                entity_type="review_card",
                entity_id=card_id,
                event_type="promoted_from_note",
                payload={
                    "note_id": note_id,
                    "source_document_id": note_row["source_document_id"],
                    "card_type": "manual_note",
                },
                created_at=timestamp,
            )
            self._rebuild_lexical_embeddings_with_connection(connection)
            updated_row = connection.execute(
                """
                SELECT rc.*, sd.title AS document_title
                FROM review_cards rc
                INNER JOIN source_documents sd ON sd.id = rc.source_document_id
                WHERE rc.id = ?
                """,
                (card_id,),
            ).fetchone()
        if not updated_row:
            return None
        return self._row_to_study_card_record(updated_row)

    def search_recall_notes(
        self,
        query: str,
        *,
        limit: int = 20,
        document_id: str | None = None,
    ) -> list[RecallNoteSearchHit]:
        terms = safe_query_terms(query)
        if not terms:
            return []

        fts_query = " AND ".join(f"{term}*" for term in terms)
        with self.connect() as connection:
            if document_id:
                rows = connection.execute(
                    """
                    SELECT
                        rn.*,
                        sd.title AS document_title,
                        bm25(recall_notes_fts, 2.5, 1.5, 1.0) AS rank
                    FROM recall_notes_fts
                    INNER JOIN recall_notes rn ON rn.id = recall_notes_fts.note_id
                    INNER JOIN source_documents sd ON sd.id = rn.source_document_id
                    WHERE recall_notes_fts MATCH ?
                      AND rn.source_document_id = ?
                    ORDER BY rank ASC, rn.updated_at DESC, rn.id DESC
                    LIMIT ?
                    """,
                    (fts_query, document_id, limit),
                ).fetchall()
            else:
                rows = connection.execute(
                    """
                    SELECT
                        rn.*,
                        sd.title AS document_title,
                        bm25(recall_notes_fts, 2.5, 1.5, 1.0) AS rank
                    FROM recall_notes_fts
                    INNER JOIN recall_notes rn ON rn.id = recall_notes_fts.note_id
                    INNER JOIN source_documents sd ON sd.id = rn.source_document_id
                    WHERE recall_notes_fts MATCH ?
                    ORDER BY rank ASC, rn.updated_at DESC, rn.id DESC
                    LIMIT ?
                    """,
                    (fts_query, limit),
                ).fetchall()
            return [self._row_to_recall_note_search_hit(row) for row in rows]

    def search_recall(self, query: str, *, limit: int = 20) -> list[RecallSearchHit]:
        terms = safe_query_terms(query)
        if not terms:
            return []

        fts_query = " AND ".join(f"{term}*" for term in terms)
        with self.connect() as connection:
            rows = connection.execute(
                """
                SELECT
                    cc.id AS chunk_id,
                    cc.source_document_id,
                    cc.block_id,
                    cc.ordinal,
                    cc.text,
                    cc.metadata_json,
                    sd.title AS document_title,
                    bm25(content_chunks_fts, 3.0, 1.0) AS rank
                FROM content_chunks_fts
                INNER JOIN content_chunks cc ON cc.id = content_chunks_fts.chunk_id
                INNER JOIN source_documents sd ON sd.id = cc.source_document_id
                WHERE content_chunks_fts MATCH ?
                ORDER BY rank ASC, cc.ordinal ASC
                LIMIT ?
                """,
                (fts_query, limit),
            ).fetchall()

        hits: list[RecallSearchHit] = []
        for row in rows:
            chunk = ContentChunk(
                id=row["chunk_id"],
                source_document_id=row["source_document_id"],
                variant_id=None,
                block_id=row["block_id"],
                ordinal=row["ordinal"],
                text=row["text"],
                metadata=json.loads(row["metadata_json"] or "{}"),
            )
            rank = float(row["rank"] if row["rank"] is not None else 0.0)
            hits.append(
                RecallSearchHit(
                    id=row["chunk_id"],
                    source_document_id=row["source_document_id"],
                    document_title=row["document_title"],
                    score=1.0 / (1.0 + abs(rank)),
                    excerpt=build_chunk_excerpt(row["text"], terms),
                    chunk_id=row["chunk_id"],
                    block_id=row["block_id"],
                    match_context=build_match_context(chunk),
                )
            )
        return hits

    def build_recall_markdown_export(self, document_id: str) -> tuple[RecallDocumentRecord, str, str] | None:
        document = self.get_recall_document(document_id)
        if not document:
            return None

        view = self.get_view(document_id, mode="reflowed", detail_level="default")
        if not view:
            return None

        with self.connect() as connection:
            rows = connection.execute(
                """
                SELECT id, source_document_id, variant_id, block_id, ordinal, text, metadata_json
                FROM content_chunks
                WHERE source_document_id = ?
                ORDER BY ordinal ASC
                """,
                (document_id,),
            ).fetchall()
        chunks = [
            ContentChunk(
                id=row["id"],
                source_document_id=row["source_document_id"],
                variant_id=row["variant_id"],
                block_id=row["block_id"],
                ordinal=row["ordinal"],
                text=row["text"],
                metadata=json.loads(row["metadata_json"] or "{}"),
            )
            for row in rows
        ]
        exported_at = now_iso()
        markdown = render_markdown_export(
            document=document,
            view=view,
            chunks=chunks,
            exported_at=exported_at,
        )
        return document, build_export_filename(document.title), markdown

    def get_workspace_integrity(self) -> WorkspaceIntegrityReport:
        with self.connect() as connection:
            report = self._build_workspace_integrity_report_with_connection(
                connection,
                checked_at=now_iso(),
                include_quick_check=True,
            )
            self._record_integrity_report_with_connection(connection, report)
            return report

    def repair_workspace(self) -> WorkspaceRepairResult:
        return self._repair_workspace(trigger="manual", include_quick_check=True)

    def list_change_events(
        self,
        *,
        after: str | None = None,
        entity_type: str | None = None,
        limit: int = 100,
    ) -> WorkspaceChangeLogPage:
        capped_limit = min(max(limit, 1), 200)
        with self.connect() as connection:
            latest_cursor = self._latest_change_event_cursor(connection, entity_type=entity_type)
            conditions: list[str] = []
            params: list[Any] = []
            latest_params: list[Any] = []
            if entity_type:
                conditions.append("entity_type = ?")
                params.append(entity_type)
                latest_params.append(entity_type)

            if after:
                pivot_row = connection.execute(
                    "SELECT created_at, id FROM change_events WHERE id = ?",
                    (after,),
                ).fetchone()
                if not pivot_row:
                    raise ValueError("Change-event cursor not found.")
                conditions.append("(created_at > ? OR (created_at = ? AND id > ?))")
                params.extend([pivot_row["created_at"], pivot_row["created_at"], after])

            where_sql = f"WHERE {' AND '.join(conditions)}" if conditions else ""
            rows = connection.execute(
                f"""
                SELECT *
                FROM change_events
                {where_sql}
                ORDER BY created_at ASC, id ASC
                LIMIT ?
                """,
                (*params, capped_limit + 1),
            ).fetchall()

        has_more = len(rows) > capped_limit
        visible_rows = rows[:capped_limit]
        next_cursor = visible_rows[-1]["id"] if has_more and visible_rows else None
        return WorkspaceChangeLogPage(
            events=[self._row_to_change_event(row) for row in visible_rows],
            next_cursor=next_cursor,
            has_more=has_more,
            latest_cursor=latest_cursor,
        )

    def list_attachment_refs(self) -> list[AttachmentRef]:
        with self.connect() as connection:
            rows = connection.execute(
                """
                SELECT id, file_name, source_type, source_locator, stored_path, content_hash, updated_at
                FROM source_documents
                WHERE stored_path IS NOT NULL
                ORDER BY updated_at DESC, id DESC
                """
            ).fetchall()
            return self._attachment_refs_from_rows(rows)

    def get_attachment_file(self, attachment_id: str) -> tuple[AttachmentRef, Path] | None:
        if not attachment_id.startswith("attachment:"):
            return None
        document_id = attachment_id.removeprefix("attachment:")
        with self.connect() as connection:
            row = connection.execute(
                """
                SELECT id, file_name, source_type, source_locator, stored_path, content_hash, updated_at
                FROM source_documents
                WHERE id = ? AND stored_path IS NOT NULL
                """,
                (document_id,),
            ).fetchone()
        if not row:
            return None
        attachment = self._row_to_attachment_ref(row)
        if not attachment:
            return None
        attachment_path = self._attachment_path_from_row(row)
        if not attachment_path.exists():
            return None
        return attachment, attachment_path

    def build_workspace_export_manifest(self) -> WorkspaceExportManifest:
        exported_at = now_iso()
        with self.connect() as connection:
            latest_change_id = self._latest_change_event_cursor(connection)
            change_event_count = int(
                connection.execute("SELECT COUNT(*) FROM change_events").fetchone()[0]
            )
            schema_version = self._meta_value_with_connection(connection, "schema_version") or SCHEMA_VERSION
            entities = self._list_portable_entities_with_connection(connection)
            attachment_rows = connection.execute(
                """
                SELECT id, file_name, source_type, source_locator, stored_path, content_hash, updated_at
                FROM source_documents
                WHERE stored_path IS NOT NULL
                ORDER BY updated_at DESC, id DESC
                """
            ).fetchall()
            attachments = self._attachment_refs_from_rows(attachment_rows)
            warnings = self._missing_attachment_warnings_from_rows(attachment_rows)

        entity_counts = dict(sorted(Counter(entity.entity_type for entity in entities).items()))
        return WorkspaceExportManifest(
            format_version=WORKSPACE_EXPORT_FORMAT_VERSION,
            schema_version=str(schema_version),
            device_id=self.device_id,
            exported_at=exported_at,
            latest_change_id=latest_change_id,
            change_event_count=change_event_count,
            entity_counts=entity_counts,
            entities=entities,
            attachments=attachments,
            warnings=warnings,
        )

    def build_workspace_export_bundle(self) -> tuple[str, bytes]:
        manifest = self.build_workspace_export_manifest()
        bundle = BytesIO()
        with ZipFile(bundle, "w", compression=ZIP_DEFLATED) as archive:
            archive.writestr("manifest.json", manifest.model_dump_json(indent=2))
            for attachment in manifest.attachments:
                attachment_file = self.get_attachment_file(attachment.id)
                if not attachment_file:
                    continue
                _, attachment_path = attachment_file
                archive.write(attachment_path, attachment.relative_path)
        return build_workspace_export_filename(manifest.exported_at), bundle.getvalue()

    def _repair_workspace(
        self,
        *,
        trigger: str,
        include_quick_check: bool,
    ) -> WorkspaceRepairResult:
        with self.connect() as connection:
            repaired_at = now_iso()
            actions: list[str] = []

            source_fts_issue = self._source_documents_fts_issue_with_connection(connection)
            if source_fts_issue:
                rebuilt_count = self._rebuild_source_documents_fts_with_connection(connection)
                actions.append(f"rebuild_source_documents_fts:{rebuilt_count}")

            synced_chunk_count = self._backfill_recall_chunks_with_connection(connection)
            if synced_chunk_count:
                actions.append(f"sync_content_chunks:{synced_chunk_count}")

            content_fts_issue = self._content_chunks_fts_issue_with_connection(connection)
            if content_fts_issue or synced_chunk_count:
                rebuilt_count = self._rebuild_content_chunks_fts_with_connection(connection)
                actions.append(f"rebuild_content_chunks_fts:{rebuilt_count}")

            note_fts_issue = self._recall_notes_fts_issue_with_connection(connection)
            if note_fts_issue:
                rebuilt_count = self._rebuild_recall_notes_fts_with_connection(connection)
                actions.append(f"rebuild_recall_notes_fts:{rebuilt_count}")

            if self._derived_recall_state_requires_refresh_with_connection(connection, chunk_sync_count=synced_chunk_count):
                self._rebuild_knowledge_graph_with_connection(connection)
                actions.append("rebuild_knowledge_graph")
                card_result = self._sync_review_cards_with_connection(connection)
                actions.append(f"sync_review_cards:{card_result.total_count}")
                self._rebuild_lexical_embeddings_with_connection(connection)
                actions.append("rebuild_lexical_embeddings")

            report = self._build_workspace_integrity_report_with_connection(
                connection,
                checked_at=repaired_at,
                include_quick_check=include_quick_check,
            )
            self._record_integrity_report_with_connection(connection, report)
            if actions:
                self._set_meta_value_with_connection(
                    connection,
                    "last_integrity_repair_at",
                    repaired_at,
                    updated_at=repaired_at,
                )
                self._append_change_event_with_connection(
                    connection,
                    entity_type="workspace",
                    entity_id="integrity",
                    event_type="integrity_repaired",
                    payload={
                        "actions": actions,
                        "issue_count": len(report.issues),
                        "trigger": trigger,
                    },
                    created_at=repaired_at,
                )
                report = report.model_copy(update={"last_repair_at": repaired_at})
            return WorkspaceRepairResult(
                ok=report.ok,
                repaired_at=repaired_at,
                actions=actions,
                report=report,
            )

    def preview_workspace_merge(self, manifest: WorkspaceExportManifest) -> WorkspaceMergePreview:
        local_manifest = self.build_workspace_export_manifest()
        local_entities = {
            (entity.entity_type, entity.entity_key): entity
            for entity in local_manifest.entities
        }
        local_attachments = {
            attachment.logical_key or attachment.id: attachment
            for attachment in local_manifest.attachments
        }

        operations: list[WorkspaceMergeOperation] = []
        for remote_entity in manifest.entities:
            local_entity = local_entities.get((remote_entity.entity_type, remote_entity.entity_key))
            decision, reason = decide_merge_outcome(
                local_digest=local_entity.payload_digest if local_entity else None,
                local_updated_at=local_entity.updated_at if local_entity else None,
                remote_digest=remote_entity.payload_digest,
                remote_updated_at=remote_entity.updated_at,
            )
            operations.append(
                WorkspaceMergeOperation(
                    entity_type=remote_entity.entity_type,
                    entity_key=remote_entity.entity_key,
                    entity_id=local_entity.entity_id if local_entity else None,
                    remote_entity_id=remote_entity.entity_id,
                    decision=decision,
                    reason=reason,
                    local_updated_at=local_entity.updated_at if local_entity else None,
                    remote_updated_at=remote_entity.updated_at,
                    local_digest=local_entity.payload_digest if local_entity else None,
                    remote_digest=remote_entity.payload_digest,
                )
            )

        for remote_attachment in manifest.attachments:
            attachment_key = remote_attachment.logical_key or remote_attachment.id
            local_attachment = local_attachments.get(attachment_key)
            decision, reason = decide_merge_outcome(
                local_digest=local_attachment.content_digest if local_attachment else None,
                local_updated_at=local_attachment.updated_at if local_attachment else None,
                remote_digest=remote_attachment.content_digest or "",
                remote_updated_at=remote_attachment.updated_at,
            )
            operations.append(
                WorkspaceMergeOperation(
                    entity_type="attachment",
                    entity_key=attachment_key,
                    entity_id=local_attachment.id if local_attachment else None,
                    remote_entity_id=remote_attachment.id,
                    decision=decision,
                    reason=reason,
                    local_updated_at=local_attachment.updated_at if local_attachment else None,
                    remote_updated_at=remote_attachment.updated_at,
                    local_digest=local_attachment.content_digest if local_attachment else None,
                    remote_digest=remote_attachment.content_digest,
                )
            )

        operations.sort(key=lambda operation: (operation.entity_type, operation.entity_key, operation.decision))
        summary = dict(sorted(Counter(operation.decision for operation in operations).items()))
        return WorkspaceMergePreview(operations=operations, summary=summary)

    def _build_workspace_integrity_report_with_connection(
        self,
        connection: sqlite3.Connection,
        *,
        checked_at: str,
        include_quick_check: bool,
    ) -> WorkspaceIntegrityReport:
        counts = self._workspace_counts_with_connection(connection)
        issues: list[WorkspaceIntegrityIssue] = []

        quick_check = INTEGRITY_QUICK_CHECK_SKIPPED
        if include_quick_check:
            quick_check_rows = connection.execute("PRAGMA quick_check(1)").fetchall()
            quick_check = "; ".join(str(row[0]) for row in quick_check_rows if row[0]) or INTEGRITY_STATUS_OK
            if quick_check != INTEGRITY_STATUS_OK:
                issues.append(
                    WorkspaceIntegrityIssue(
                        code="sqlite_quick_check_failed",
                        severity="critical",
                        message="SQLite quick_check reported a database integrity problem.",
                        repairable=False,
                        metadata={"quick_check": quick_check},
                    )
                )

        source_fts_issue = self._source_documents_fts_issue_with_connection(connection)
        if source_fts_issue:
            issues.append(source_fts_issue)

        content_fts_issue = self._content_chunks_fts_issue_with_connection(connection)
        if content_fts_issue:
            issues.append(content_fts_issue)

        note_fts_issue = self._recall_notes_fts_issue_with_connection(connection)
        if note_fts_issue:
            issues.append(note_fts_issue)

        missing_attachment_warnings = self._missing_attachment_warnings_with_connection(connection)
        if missing_attachment_warnings:
            issues.append(
                WorkspaceIntegrityIssue(
                    code="missing_attachment_payloads",
                    severity="warning",
                    message="One or more stored source attachments are missing from disk.",
                    repairable=False,
                    metadata={
                        "missing_attachment_count": len(missing_attachment_warnings),
                        "warnings": missing_attachment_warnings,
                    },
                )
            )

        return WorkspaceIntegrityReport(
            ok=not issues,
            checked_at=checked_at,
            schema_version=self._meta_value_with_connection(connection, "schema_version") or SCHEMA_VERSION,
            quick_check=quick_check,
            counts=counts,
            issues=issues,
            last_repair_at=self._meta_value_with_connection(connection, "last_integrity_repair_at"),
        )

    def _record_integrity_report_with_connection(
        self,
        connection: sqlite3.Connection,
        report: WorkspaceIntegrityReport,
    ) -> None:
        self._set_meta_value_with_connection(
            connection,
            "last_integrity_check_at",
            report.checked_at,
            updated_at=report.checked_at,
        )
        self._set_meta_value_with_connection(
            connection,
            "last_integrity_status",
            INTEGRITY_STATUS_OK if report.ok else "issues",
            updated_at=report.checked_at,
        )

    def _workspace_counts_with_connection(self, connection: sqlite3.Connection) -> dict[str, int]:
        count_queries = {
            "attachment_count": (
                "SELECT COUNT(*) FROM source_documents WHERE stored_path IS NOT NULL",
                (),
            ),
            "content_chunk_count": ("SELECT COUNT(*) FROM content_chunks", ()),
            "content_chunk_fts_count": ("SELECT COUNT(*) FROM content_chunks_fts", ()),
            "document_variant_count": ("SELECT COUNT(*) FROM document_variants", ()),
            "embedding_count": ("SELECT COUNT(*) FROM embeddings", ()),
            "knowledge_edge_count": ("SELECT COUNT(*) FROM knowledge_edges", ()),
            "knowledge_node_count": ("SELECT COUNT(*) FROM knowledge_nodes", ()),
            "missing_attachment_count": (
                """
                SELECT COUNT(*)
                FROM source_documents
                WHERE stored_path IS NOT NULL
                  AND stored_path != ''
                """,
                (),
            ),
            "note_count": ("SELECT COUNT(*) FROM recall_notes", ()),
            "note_fts_count": ("SELECT COUNT(*) FROM recall_notes_fts", ()),
            "reading_session_count": ("SELECT COUNT(*) FROM reading_sessions", ()),
            "review_card_count": ("SELECT COUNT(*) FROM review_cards", ()),
            "review_event_count": ("SELECT COUNT(*) FROM review_events", ()),
            "source_document_count": ("SELECT COUNT(*) FROM source_documents", ()),
            "source_document_fts_count": ("SELECT COUNT(*) FROM source_documents_fts", ()),
        }
        counts: dict[str, int] = {}
        for key, (query, params) in count_queries.items():
            counts[key] = int(connection.execute(query, params).fetchone()[0])
        counts["missing_attachment_count"] = len(self._missing_attachment_warnings_with_connection(connection))
        return counts

    def _source_documents_fts_issue_with_connection(
        self,
        connection: sqlite3.Connection,
    ) -> WorkspaceIntegrityIssue | None:
        details = self._fts_index_details_with_connection(
            connection,
            base_table="source_documents",
            base_id_column="id",
            fts_table="source_documents_fts",
            fts_id_column="source_document_id",
        )
        if details["missing_count"] == 0 and details["orphaned_count"] == 0 and details["duplicate_count"] == 0:
            return None
        return WorkspaceIntegrityIssue(
            code="source_documents_fts_drift",
            severity="warning",
            message="The source-documents FTS index drifted out of sync with the shared document table.",
            metadata=details,
        )

    def _content_chunks_fts_issue_with_connection(
        self,
        connection: sqlite3.Connection,
    ) -> WorkspaceIntegrityIssue | None:
        details = self._fts_index_details_with_connection(
            connection,
            base_table="content_chunks",
            base_id_column="id",
            fts_table="content_chunks_fts",
            fts_id_column="chunk_id",
        )
        if details["missing_count"] == 0 and details["orphaned_count"] == 0 and details["duplicate_count"] == 0:
            return None
        return WorkspaceIntegrityIssue(
            code="content_chunks_fts_drift",
            severity="warning",
            message="The content-chunk FTS index drifted out of sync with the canonical chunk rows.",
            metadata=details,
        )

    def _recall_notes_fts_issue_with_connection(
        self,
        connection: sqlite3.Connection,
    ) -> WorkspaceIntegrityIssue | None:
        details = self._fts_index_details_with_connection(
            connection,
            base_table="recall_notes",
            base_id_column="id",
            fts_table="recall_notes_fts",
            fts_id_column="note_id",
        )
        if details["missing_count"] == 0 and details["orphaned_count"] == 0 and details["duplicate_count"] == 0:
            return None
        return WorkspaceIntegrityIssue(
            code="recall_notes_fts_drift",
            severity="warning",
            message="The Recall-note FTS index drifted out of sync with saved note rows.",
            metadata=details,
        )

    def _fts_index_details_with_connection(
        self,
        connection: sqlite3.Connection,
        *,
        base_table: str,
        base_id_column: str,
        fts_table: str,
        fts_id_column: str,
    ) -> dict[str, int]:
        missing_count = int(
            connection.execute(
                f"""
                SELECT COUNT(*)
                FROM {base_table} base
                LEFT JOIN {fts_table} fts ON fts.{fts_id_column} = base.{base_id_column}
                WHERE fts.{fts_id_column} IS NULL
                """
            ).fetchone()[0]
        )
        orphaned_count = int(
            connection.execute(
                f"""
                SELECT COUNT(*)
                FROM {fts_table} fts
                LEFT JOIN {base_table} base ON base.{base_id_column} = fts.{fts_id_column}
                WHERE base.{base_id_column} IS NULL
                """
            ).fetchone()[0]
        )
        duplicate_count = int(
            connection.execute(
                f"""
                SELECT COUNT(*)
                FROM (
                    SELECT {fts_id_column}
                    FROM {fts_table}
                    GROUP BY {fts_id_column}
                    HAVING COUNT(*) > 1
                )
                """
            ).fetchone()[0]
        )
        base_count = int(connection.execute(f"SELECT COUNT(*) FROM {base_table}").fetchone()[0])
        fts_count = int(connection.execute(f"SELECT COUNT(*) FROM {fts_table}").fetchone()[0])
        return {
            "base_count": base_count,
            "duplicate_count": duplicate_count,
            "fts_count": fts_count,
            "missing_count": missing_count,
            "orphaned_count": orphaned_count,
        }

    def _rebuild_source_documents_fts_with_connection(self, connection: sqlite3.Connection) -> int:
        rows = connection.execute(
            """
            SELECT id, title
            FROM source_documents
            ORDER BY created_at ASC, id ASC
            """
        ).fetchall()
        connection.execute("DELETE FROM source_documents_fts")
        for row in rows:
            connection.execute(
                "INSERT INTO source_documents_fts (source_document_id, title, body) VALUES (?, ?, ?)",
                (
                    row["id"],
                    row["title"],
                    self._searchable_text_for_document_with_connection(connection, row["id"]),
                ),
            )
        timestamp = now_iso()
        self._set_meta_value_with_connection(
            connection,
            "source_documents_fts_rebuilt_at",
            timestamp,
            updated_at=timestamp,
        )
        return len(rows)

    def _searchable_text_for_document_with_connection(
        self,
        connection: sqlite3.Connection,
        document_id: str,
    ) -> str:
        view_rows = connection.execute(
            """
            SELECT view_json
            FROM document_variants
            WHERE source_document_id = ?
              AND detail_level = 'default'
              AND mode IN ('reflowed', 'original')
            ORDER BY CASE mode WHEN 'reflowed' THEN 0 ELSE 1 END, updated_at DESC
            """,
            (document_id,),
        ).fetchall()
        for row in view_rows:
            view = DocumentView.model_validate_json(row["view_json"])
            text = "\n\n".join(
                normalize_whitespace(block.text)
                for block in view.blocks
                if normalize_whitespace(block.text)
            ).strip()
            if text:
                return text
        title_row = connection.execute(
            "SELECT title FROM source_documents WHERE id = ?",
            (document_id,),
        ).fetchone()
        return str(title_row["title"]) if title_row else ""

    def _rebuild_content_chunks_fts_with_connection(self, connection: sqlite3.Connection) -> int:
        rows = connection.execute(
            """
            SELECT cc.id, cc.source_document_id, cc.text, sd.title AS document_title
            FROM content_chunks cc
            INNER JOIN source_documents sd ON sd.id = cc.source_document_id
            ORDER BY cc.source_document_id ASC, cc.ordinal ASC
            """
        ).fetchall()
        connection.execute("DELETE FROM content_chunks_fts")
        for row in rows:
            connection.execute(
                """
                INSERT INTO content_chunks_fts (chunk_id, source_document_id, title, body)
                VALUES (?, ?, ?, ?)
                """,
                (
                    row["id"],
                    row["source_document_id"],
                    row["document_title"],
                    row["text"],
                ),
            )
        timestamp = now_iso()
        self._set_meta_value_with_connection(
            connection,
            "content_chunks_fts_rebuilt_at",
            timestamp,
            updated_at=timestamp,
        )
        return len(rows)

    def _rebuild_recall_notes_fts_with_connection(self, connection: sqlite3.Connection) -> int:
        rows = connection.execute(
            """
            SELECT id, source_document_id, anchor_text, excerpt_text, body_text
            FROM recall_notes
            ORDER BY created_at ASC, id ASC
            """
        ).fetchall()
        connection.execute("DELETE FROM recall_notes_fts")
        for row in rows:
            connection.execute(
                """
                INSERT INTO recall_notes_fts (note_id, source_document_id, anchor_text, excerpt_text, body_text)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    row["id"],
                    row["source_document_id"],
                    row["anchor_text"],
                    row["excerpt_text"],
                    row["body_text"] or "",
                ),
            )
        timestamp = now_iso()
        self._set_meta_value_with_connection(
            connection,
            "recall_notes_fts_rebuilt_at",
            timestamp,
            updated_at=timestamp,
        )
        return len(rows)

    def _derived_recall_state_requires_refresh_with_connection(
        self,
        connection: sqlite3.Connection,
        *,
        chunk_sync_count: int,
    ) -> bool:
        source_document_count = int(connection.execute("SELECT COUNT(*) FROM source_documents").fetchone()[0])
        if source_document_count == 0:
            return False
        if chunk_sync_count:
            return True
        if (self._meta_value_with_connection(connection, "knowledge_graph_schema_version") or "") != GRAPH_SCHEMA_VERSION:
            return True
        if (self._meta_value_with_connection(connection, "study_schema_version") or "") != STUDY_SCHEMA_VERSION:
            return True
        if (self._meta_value_with_connection(connection, "lexical_embedding_model") or "") != LEXICAL_EMBEDDING_MODEL:
            return True
        return False

    def get_knowledge_graph(
        self,
        *,
        limit_nodes: int = 40,
        limit_edges: int = 60,
    ) -> KnowledgeGraphSnapshot:
        with self.connect() as connection:
            node_rows = connection.execute(
                """
                SELECT *
                FROM knowledge_nodes
                ORDER BY confidence DESC, label COLLATE NOCASE ASC
                """
            ).fetchall()
            edge_rows = connection.execute(
                """
                SELECT
                    ke.*,
                    source_node.label AS source_label,
                    target_node.label AS target_label
                FROM knowledge_edges ke
                INNER JOIN knowledge_nodes source_node ON source_node.id = ke.source_id
                INNER JOIN knowledge_nodes target_node ON target_node.id = ke.target_id
                ORDER BY ke.confidence DESC, ke.relation_type COLLATE NOCASE ASC
                """
            ).fetchall()
            document_count = int(
                connection.execute("SELECT COUNT(*) FROM source_documents").fetchone()[0]
            )

        all_nodes = [self._row_to_knowledge_node_record(row) for row in node_rows]
        all_edges = [self._row_to_knowledge_edge_record(row) for row in edge_rows]
        visible_nodes = [node for node in all_nodes if node.status != "rejected"][:limit_nodes]
        visible_edges = [edge for edge in all_edges if edge.status != "rejected"][:limit_edges]
        return KnowledgeGraphSnapshot(
            nodes=visible_nodes,
            edges=visible_edges,
            document_count=document_count,
            pending_nodes=sum(1 for node in all_nodes if node.status == "suggested"),
            pending_edges=sum(1 for edge in all_edges if edge.status == "suggested"),
            confirmed_nodes=sum(1 for node in all_nodes if node.status == "confirmed"),
            confirmed_edges=sum(1 for edge in all_edges if edge.status == "confirmed"),
        )

    def get_knowledge_node_detail(self, node_id: str) -> KnowledgeNodeDetail | None:
        with self.connect() as connection:
            node_row = connection.execute(
                "SELECT * FROM knowledge_nodes WHERE id = ?",
                (node_id,),
            ).fetchone()
            if not node_row:
                return None
            node_record = self._row_to_knowledge_node_record(node_row)
            canonical_key = self._metadata_from_row(node_row).get("canonical_key")
            if not canonical_key:
                return None

            mention_rows = connection.execute(
                """
                SELECT *
                FROM entity_mentions
                WHERE normalized_text = ?
                ORDER BY confidence DESC, text COLLATE NOCASE ASC
                """,
                (canonical_key,),
            ).fetchall()
            edge_rows = connection.execute(
                """
                SELECT
                    ke.*,
                    source_node.label AS source_label,
                    target_node.label AS target_label
                FROM knowledge_edges ke
                INNER JOIN knowledge_nodes source_node ON source_node.id = ke.source_id
                INNER JOIN knowledge_nodes target_node ON target_node.id = ke.target_id
                WHERE ke.source_id = ? OR ke.target_id = ?
                ORDER BY ke.confidence DESC, ke.relation_type COLLATE NOCASE ASC
                """,
                (node_id, node_id),
            ).fetchall()

        mentions = [self._row_to_knowledge_mention_record(row) for row in mention_rows]
        outgoing_edges: list[KnowledgeEdgeRecord] = []
        incoming_edges: list[KnowledgeEdgeRecord] = []
        for row in edge_rows:
            edge_record = self._row_to_knowledge_edge_record(row)
            if edge_record.source_id == node_id:
                outgoing_edges.append(edge_record)
            if edge_record.target_id == node_id:
                incoming_edges.append(edge_record)
        return KnowledgeNodeDetail(
            node=node_record,
            mentions=mentions,
            outgoing_edges=outgoing_edges,
            incoming_edges=incoming_edges,
        )

    def set_knowledge_node_decision(self, node_id: str, decision: str) -> KnowledgeNodeRecord | None:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT * FROM knowledge_nodes WHERE id = ?",
                (node_id,),
            ).fetchone()
            if not row:
                return None
            metadata = self._metadata_from_row(row)
            metadata["status"] = decision
            timestamp = now_iso()
            next_confidence = max(float(row["confidence"] or 0.0), 0.99) if decision == "confirmed" else row["confidence"]
            connection.execute(
                """
                UPDATE knowledge_nodes
                SET confidence = ?, metadata_json = ?, updated_at = ?
                WHERE id = ?
                """,
                (
                    next_confidence,
                    json.dumps(metadata, sort_keys=True),
                    timestamp,
                    node_id,
                ),
            )
            self._append_change_event_with_connection(
                connection,
                entity_type="knowledge_node",
                entity_id=node_id,
                event_type=f"decision_{decision}",
                payload={"decision": decision},
                created_at=timestamp,
            )
            updated_row = connection.execute(
                "SELECT * FROM knowledge_nodes WHERE id = ?",
                (node_id,),
            ).fetchone()
        if not updated_row:
            return None
        return self._row_to_knowledge_node_record(updated_row)

    def set_knowledge_edge_decision(self, edge_id: str, decision: str) -> KnowledgeEdgeRecord | None:
        with self.connect() as connection:
            row = connection.execute(
                """
                SELECT
                    ke.*,
                    source_node.label AS source_label,
                    target_node.label AS target_label
                FROM knowledge_edges ke
                INNER JOIN knowledge_nodes source_node ON source_node.id = ke.source_id
                INNER JOIN knowledge_nodes target_node ON target_node.id = ke.target_id
                WHERE ke.id = ?
                """,
                (edge_id,),
            ).fetchone()
            if not row:
                return None
            metadata = self._metadata_from_row(row)
            metadata["status"] = decision
            timestamp = now_iso()
            next_confidence = max(float(row["confidence"] or 0.0), 0.99) if decision == "confirmed" else row["confidence"]
            provenance = "manual" if decision == "confirmed" else row["provenance"]
            connection.execute(
                """
                UPDATE knowledge_edges
                SET provenance = ?, confidence = ?, metadata_json = ?, updated_at = ?
                WHERE id = ?
                """,
                (
                    provenance,
                    next_confidence,
                    json.dumps(metadata, sort_keys=True),
                    timestamp,
                    edge_id,
                ),
            )
            self._append_change_event_with_connection(
                connection,
                entity_type="knowledge_edge",
                entity_id=edge_id,
                event_type=f"decision_{decision}",
                payload={"decision": decision},
                created_at=timestamp,
            )
            updated_row = connection.execute(
                """
                SELECT
                    ke.*,
                    source_node.label AS source_label,
                    target_node.label AS target_label
                FROM knowledge_edges ke
                INNER JOIN knowledge_nodes source_node ON source_node.id = ke.source_id
                INNER JOIN knowledge_nodes target_node ON target_node.id = ke.target_id
                WHERE ke.id = ?
                """,
                (edge_id,),
            ).fetchone()
        if not updated_row:
            return None
        return self._row_to_knowledge_edge_record(updated_row)

    def retrieve_recall(self, query: str, *, limit: int = 20) -> list[RecallRetrievalHit]:
        terms = safe_query_terms(query)
        if not terms:
            return []

        query_vector = build_sparse_vector(query)
        candidate_hits: dict[tuple[str, str], dict[str, Any]] = {}
        for keyword_hit in self.search_recall(query, limit=max(limit * 3, 10)):
            key = ("chunk", keyword_hit.chunk_id)
            candidate = candidate_hits.setdefault(
                key,
                {
                    "id": f"chunk:{keyword_hit.chunk_id}",
                    "hit_type": "chunk",
                    "source_document_id": keyword_hit.source_document_id,
                    "document_title": keyword_hit.document_title,
                    "title": keyword_hit.document_title,
                    "score": 0.0,
                    "excerpt": keyword_hit.excerpt,
                    "reasons": [],
                    "chunk_id": keyword_hit.chunk_id,
                    "node_id": None,
                    "card_id": None,
                    "note_id": None,
                    "note_anchor": None,
                },
            )
            candidate["score"] += 0.62 * keyword_hit.score
            candidate["reasons"] = self._append_reason(candidate["reasons"], "keyword chunk match")

        for note_hit in self.search_recall_notes(query, limit=max(limit * 3, 10)):
            title = note_hit.anchor.anchor_text or note_hit.document_title
            excerpt = note_hit.body_text or note_hit.anchor.excerpt_text or note_hit.anchor.anchor_text
            key = ("note", note_hit.id)
            candidate = candidate_hits.setdefault(
                key,
                {
                    "id": f"note:{note_hit.id}",
                    "hit_type": "note",
                    "source_document_id": note_hit.anchor.source_document_id,
                    "document_title": note_hit.document_title,
                    "title": title,
                    "score": 0.0,
                    "excerpt": excerpt,
                    "reasons": [],
                    "chunk_id": None,
                    "node_id": None,
                    "card_id": None,
                    "note_id": note_hit.id,
                    "note_anchor": note_hit.anchor,
                },
            )
            candidate["score"] += 0.74 * note_hit.score
            candidate["reasons"] = self._append_reason(candidate["reasons"], "saved note match")

        with self.connect() as connection:
            embedding_rows = connection.execute(
                """
                SELECT id, source_document_id, variant_id, block_id, vector_json, metadata_json
                FROM embeddings
                WHERE embedding_model = ?
                """,
                (LEXICAL_EMBEDDING_MODEL,),
            ).fetchall()

        for row in embedding_rows:
            metadata = json.loads(row["metadata_json"] or "{}")
            item_type = str(metadata.get("item_type", ""))
            item_id = str(metadata.get("item_id", ""))
            if item_type not in {"chunk", "node", "card"} or not item_id:
                continue
            if item_type == "node" and str(metadata.get("status", "suggested")) == "rejected":
                continue

            vector = json.loads(row["vector_json"] or "{}")
            similarity = cosine_similarity(query_vector, vector)
            if similarity < (0.12 if item_type == "chunk" else 0.16):
                continue

            key = (item_type, item_id)
            candidate = candidate_hits.setdefault(
                key,
                {
                    "id": f"{item_type}:{item_id}",
                    "hit_type": item_type,
                    "source_document_id": row["source_document_id"],
                    "document_title": metadata.get("document_title") or metadata.get("title") or "Untitled",
                    "title": metadata.get("title") or metadata.get("document_title") or "Untitled",
                    "score": 0.0,
                    "excerpt": metadata.get("excerpt") or metadata.get("title") or "",
                    "reasons": [],
                    "chunk_id": metadata.get("chunk_id"),
                    "node_id": metadata.get("node_id"),
                    "card_id": metadata.get("card_id"),
                    "note_id": None,
                    "note_anchor": None,
                },
            )
            candidate["score"] += similarity * (0.38 if item_type == "chunk" else 0.44)
            candidate["reasons"] = self._append_reason(candidate["reasons"], "lexical overlap")

            title_lower = str(candidate["title"]).lower()
            excerpt_lower = str(candidate["excerpt"]).lower()
            if item_type == "node" and any(term in title_lower for term in terms):
                candidate["score"] += 0.24
                candidate["reasons"] = self._append_reason(candidate["reasons"], "graph label match")
            if item_type == "card" and any(term in title_lower or term in excerpt_lower for term in terms):
                candidate["score"] += 0.16
                candidate["reasons"] = self._append_reason(candidate["reasons"], "study card overlap")

        for candidate in candidate_hits.values():
            if candidate["hit_type"] != "note":
                continue
            title_lower = str(candidate["title"]).lower()
            excerpt_lower = str(candidate["excerpt"]).lower()
            if any(term in title_lower or term in excerpt_lower for term in terms):
                candidate["score"] += 0.18
                candidate["reasons"] = self._append_reason(candidate["reasons"], "note text overlap")

        ranked_hits = sorted(
            candidate_hits.values(),
            key=lambda candidate: (
                -candidate["score"],
                candidate["hit_type"],
                candidate["title"].lower(),
            ),
        )[:limit]
        return [
            RecallRetrievalHit(
                id=str(hit["id"]),
                hit_type=hit["hit_type"],
                source_document_id=hit["source_document_id"],
                document_title=hit["document_title"],
                title=hit["title"],
                score=round(float(hit["score"]), 4),
                excerpt=str(hit["excerpt"]),
                reasons=list(hit["reasons"]),
                chunk_id=hit.get("chunk_id"),
                node_id=hit.get("node_id"),
                card_id=hit.get("card_id"),
                note_id=hit.get("note_id"),
                note_anchor=hit.get("note_anchor"),
            )
            for hit in ranked_hits
        ]

    def get_browser_context(self, payload: BrowserContextRequest) -> BrowserContextResponse:
        normalized_url = canonicalize_page_url(payload.page_url)
        suppression_reasons: list[str] = []
        matched_document: BrowserSavedPageMatch | None = None
        if normalized_url and is_supported_page_url(payload.page_url) and not is_internal_workspace_page(payload.page_url):
            with self.connect() as connection:
                matched_row = self._find_exact_saved_page_row_with_connection(connection, payload.page_url)
            if matched_row:
                matched_document = BrowserSavedPageMatch(
                    source_document_id=str(matched_row["id"]),
                    document_title=str(matched_row["title"]),
                    source_locator=str(matched_row["source_locator"]),
                )
        if not is_supported_page_url(payload.page_url):
            suppression_reasons.append("unsupported page URL")
        elif is_internal_workspace_page(payload.page_url):
            suppression_reasons.append("internal workspace page")

        query_plan = build_browser_query_plan(
            page_title=payload.page_title,
            selection_text=payload.selection_text,
            page_excerpt=payload.page_excerpt,
            meta_description=payload.meta_description,
        )
        suppression_reasons.extend(query_plan.suppression_reasons)
        page_fingerprint = sha256_text(
            "|".join(
                [
                    normalized_url or normalize_whitespace(payload.page_url),
                    query_plan.query,
                    query_plan.trigger_mode,
                    "manual" if payload.manual else "auto",
                ]
            )
        )
        if suppression_reasons or not query_plan.query:
            return BrowserContextResponse(
                query=query_plan.query,
                trigger_mode=query_plan.trigger_mode,
                should_prompt=False,
                summary=summarize_context_result(
                    hit_count=0,
                    trigger_mode=query_plan.trigger_mode,
                    exact_match=matched_document is not None,
                    same_site=False,
                    prompted=False,
                ),
                suppression_reasons=suppression_reasons or ["not enough page context"],
                page_fingerprint=page_fingerprint,
                matched_document=matched_document,
                hits=[],
            )

        candidate_hits = self.retrieve_recall(query_plan.query, limit=max(payload.limit * 3, 8))
        if not candidate_hits:
            return BrowserContextResponse(
                query=query_plan.query,
                trigger_mode=query_plan.trigger_mode,
                should_prompt=False,
                summary=summarize_context_result(
                    hit_count=0,
                    trigger_mode=query_plan.trigger_mode,
                    exact_match=matched_document is not None,
                    same_site=False,
                    prompted=False,
                ),
                suppression_reasons=["no grounded local matches"],
                page_fingerprint=page_fingerprint,
                matched_document=matched_document,
                hits=[],
            )

        document_ids = list({hit.source_document_id for hit in candidate_hits})
        source_rows_by_document_id: dict[str, sqlite3.Row] = {}
        if document_ids:
            placeholders = ", ".join("?" for _ in document_ids)
            with self.connect() as connection:
                rows = connection.execute(
                    f"""
                    SELECT id, title, source_type, source_locator
                    FROM source_documents
                    WHERE id IN ({placeholders})
                    """,
                    tuple(document_ids),
                ).fetchall()
                source_rows_by_document_id = {row["id"]: row for row in rows}

        canonical_page_host = urlsplit(normalized_url).netloc.lower()
        canonical_page_prefix = path_prefix(normalized_url)
        page_title_terms = set(safe_query_terms(payload.page_title or ""))
        selection_terms = set(safe_query_terms(payload.selection_text or ""))
        reranked_hits: list[RecallRetrievalHit] = []
        exact_match = matched_document is not None
        same_site = False

        for hit in candidate_hits:
            source_row = source_rows_by_document_id.get(hit.source_document_id)
            source_locator = str(source_row["source_locator"]) if source_row and source_row["source_locator"] else ""
            canonical_source_url = canonicalize_page_url(source_locator)
            source_host = urlsplit(canonical_source_url).netloc.lower()
            source_prefix = path_prefix(canonical_source_url)
            next_score = hit.score
            next_reasons = list(hit.reasons)

            if normalized_url and canonical_source_url:
                if canonical_source_url == normalized_url:
                    next_score += 0.42
                    next_reasons = self._append_reason(next_reasons, "exact saved page")
                    exact_match = True
                elif source_host and source_host == canonical_page_host:
                    next_score += 0.18
                    next_reasons = self._append_reason(next_reasons, "same site")
                    same_site = True
                    if source_prefix and canonical_page_prefix and source_prefix == canonical_page_prefix:
                        next_score += 0.08
                        next_reasons = self._append_reason(next_reasons, "related path")

            combined_title_terms = set(
                safe_query_terms(f"{hit.title} {hit.document_title} {source_row['title'] if source_row else ''}")
            )
            if page_title_terms and combined_title_terms.intersection(page_title_terms):
                next_score += 0.08
                next_reasons = self._append_reason(next_reasons, "page title overlap")
            if selection_terms and set(safe_query_terms(f"{hit.title} {hit.excerpt}")).intersection(selection_terms):
                next_score += 0.06
                next_reasons = self._append_reason(next_reasons, "selection overlap")

            reranked_hits.append(
                hit.model_copy(
                    update={
                        "score": round(next_score, 4),
                        "reasons": next_reasons,
                    }
                )
            )

        reranked_hits.sort(
            key=lambda hit: (
                -hit.score,
                hit.hit_type,
                hit.title.lower(),
            )
        )

        top_hit = reranked_hits[0] if reranked_hits else None
        top_score = top_hit.score if top_hit else 0.0
        top_reason_count = len(top_hit.reasons) if top_hit else 0
        filtered_hits = [
            hit
            for hit in reranked_hits
            if hit.score >= (
                MANUAL_RESULT_FLOOR
                if payload.manual
                else AUTO_SELECTION_RESULT_FLOOR
                if query_plan.trigger_mode == "selection"
                else AUTO_PAGE_RESULT_FLOOR
            )
        ]
        visible_hits = filtered_hits[: payload.limit]
        should_prompt = False
        if not payload.manual and top_hit:
            strong_site_prompt = (
                any(reason in {"exact saved page", "same site"} for reason in top_hit.reasons)
                and top_score >= STRONG_SITE_PROMPT_THRESHOLD
            )
            selection_prompt = (
                query_plan.trigger_mode == "selection"
                and top_score >= AUTO_SELECTION_PROMPT_THRESHOLD
                and top_reason_count >= 2
            )
            page_prompt = (
                query_plan.trigger_mode == "page"
                and top_score >= AUTO_PAGE_PROMPT_THRESHOLD
                and top_reason_count >= 2
            )
            should_prompt = bool(visible_hits) and (strong_site_prompt or selection_prompt or page_prompt)

        if payload.manual:
            response_hits = visible_hits or reranked_hits[: payload.limit]
            response_suppression_reasons: list[str] = []
        elif should_prompt:
            response_hits = visible_hits
            response_suppression_reasons = []
        else:
            response_hits = []
            response_suppression_reasons = ["automatic prompt stayed below confidence threshold"]

        summary = summarize_context_result(
            hit_count=len(response_hits),
            trigger_mode=query_plan.trigger_mode,
            exact_match=exact_match,
            same_site=same_site,
            prompted=should_prompt,
        )
        return BrowserContextResponse(
            query=query_plan.query,
            trigger_mode=query_plan.trigger_mode,
            should_prompt=should_prompt,
            summary=summary,
            suppression_reasons=response_suppression_reasons,
            page_fingerprint=page_fingerprint,
            matched_document=matched_document,
            hits=response_hits,
        )

    def get_study_overview(self) -> StudyOverview:
        cards = self.list_study_cards(status="all", limit=500)
        with self.connect() as connection:
            review_event_count = int(
                connection.execute("SELECT COUNT(*) FROM review_events").fetchone()[0]
            )
        next_due_at = min((card.due_at for card in cards), default=None)
        return StudyOverview(
            due_count=sum(1 for card in cards if card.status == "due"),
            new_count=sum(1 for card in cards if card.status == "new"),
            scheduled_count=sum(1 for card in cards if card.status == "scheduled"),
            review_event_count=review_event_count,
            next_due_at=next_due_at,
        )

    def list_study_cards(self, *, status: str = "due", limit: int = 20) -> list[StudyCardRecord]:
        capped_limit = min(max(limit, 1), 100)
        with self.connect() as connection:
            rows = connection.execute(
                """
                SELECT rc.*, sd.title AS document_title
                FROM review_cards rc
                INNER JOIN source_documents sd ON sd.id = rc.source_document_id
                ORDER BY rc.updated_at DESC, rc.id ASC
                """
            ).fetchall()

        cards = [self._row_to_study_card_record(row) for row in rows]
        if status != "all":
            cards = [card for card in cards if card.status == status]
        cards.sort(
            key=lambda card: (
                card.status != "due",
                card.status != "new",
                card.due_at,
                card.prompt.lower(),
            )
        )
        return cards[:capped_limit]

    def regenerate_study_cards(self) -> StudyCardGenerationResult:
        with self.connect() as connection:
            result = self._sync_review_cards_with_connection(connection)
            self._rebuild_lexical_embeddings_with_connection(connection)
            return result

    def review_study_card(self, review_card_id: str, rating_label: str) -> StudyCardRecord | None:
        with self.connect() as connection:
            row = connection.execute(
                """
                SELECT rc.*, sd.title AS document_title
                FROM review_cards rc
                INNER JOIN source_documents sd ON sd.id = rc.source_document_id
                WHERE rc.id = ?
                """,
                (review_card_id,),
            ).fetchone()
            if not row:
                return None

            scheduling_state = json.loads(row["scheduling_state_json"] or "{}")
            timestamp = now_iso()
            next_state, numeric_rating = review_scheduling_state(
                review_card_id,
                scheduling_state,
                rating_label,
                reviewed_at=timestamp,
            )
            connection.execute(
                """
                UPDATE review_cards
                SET scheduling_state_json = ?, updated_at = ?
                WHERE id = ?
                """,
                (
                    json.dumps(next_state, sort_keys=True),
                    timestamp,
                    review_card_id,
                ),
            )
            connection.execute(
                """
                INSERT INTO review_events (
                    id,
                    review_card_id,
                    rating,
                    scheduling_state_json,
                    reviewed_at,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    new_uuid7_str(),
                    review_card_id,
                    numeric_rating,
                    json.dumps(next_state, sort_keys=True),
                    timestamp,
                    timestamp,
                ),
            )
            self._append_change_event_with_connection(
                connection,
                entity_type="review_card",
                entity_id=review_card_id,
                event_type="reviewed",
                payload={"rating": rating_label},
                created_at=timestamp,
            )
            updated_row = connection.execute(
                """
                SELECT rc.*, sd.title AS document_title
                FROM review_cards rc
                INNER JOIN source_documents sd ON sd.id = rc.source_document_id
                WHERE rc.id = ?
                """,
                (review_card_id,),
            ).fetchone()
        if not updated_row:
            return None
        return self._row_to_study_card_record(updated_row)

    def get_reader_settings(self) -> ReaderSettings:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT value_json FROM app_settings WHERE namespace = 'reader'",
            ).fetchone()
        if not row:
            return ReaderSettings()
        return ReaderSettings.model_validate_json(row["value_json"])

    def save_reader_settings(self, settings: ReaderSettings) -> ReaderSettings:
        timestamp = now_iso()
        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO app_settings (namespace, value_json, updated_at)
                VALUES ('reader', ?, ?)
                ON CONFLICT(namespace) DO UPDATE SET
                    value_json = excluded.value_json,
                    updated_at = excluded.updated_at
                """,
                (settings.model_dump_json(), timestamp),
            )
            self._append_change_event_with_connection(
                connection,
                entity_type="app_settings",
                entity_id="reader",
                event_type="updated",
                payload=settings.model_dump(mode="json"),
            )
        return settings

    def save_progress(
        self,
        document_id: str,
        mode: str,
        sentence_index: int,
        *,
        summary_detail: str | None = None,
        accessibility_snapshot: AccessibilitySnapshot | None = None,
    ) -> None:
        timestamp = now_iso()
        metadata = {
            "accessibility_snapshot": accessibility_snapshot.model_dump(mode="json", exclude_none=True)
            if accessibility_snapshot
            else None,
            "summary_detail": summary_detail,
        }
        with self.connect() as connection:
            row = connection.execute(
                """
                SELECT id
                FROM reading_sessions
                WHERE source_document_id = ? AND session_kind = ? AND mode = ? AND device_id = ?
                """,
                (document_id, DEFAULT_SESSION_KIND, mode, self.device_id),
            ).fetchone()
            session_id = row["id"] if row else new_uuid7_str()
            connection.execute(
                """
                INSERT INTO reading_sessions (
                    id,
                    source_document_id,
                    session_kind,
                    mode,
                    sentence_index,
                    metadata_json,
                    device_id,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(source_document_id, session_kind, mode, device_id) DO UPDATE SET
                    sentence_index = excluded.sentence_index,
                    metadata_json = excluded.metadata_json,
                    updated_at = excluded.updated_at
                """,
                (
                    session_id,
                    document_id,
                    DEFAULT_SESSION_KIND,
                    mode,
                    sentence_index,
                    json.dumps({key: value for key, value in metadata.items() if value is not None}, sort_keys=True),
                    self.device_id,
                    timestamp,
                    timestamp,
                ),
            )
            self._append_change_event_with_connection(
                connection,
                entity_type="reading_session",
                entity_id=session_id,
                event_type="progress_saved",
                payload={
                    "accessibility_snapshot": metadata["accessibility_snapshot"],
                    "source_document_id": document_id,
                    "mode": mode,
                    "sentence_index": sentence_index,
                    "summary_detail": summary_detail,
                    "device_id": self.device_id,
                },
            )

    def delete_document(self, document_id: str) -> str | None:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT stored_path, title, source_type FROM source_documents WHERE id = ?",
                (document_id,),
            ).fetchone()
            if not row:
                return None

            self._append_change_event_with_connection(
                connection,
                entity_type="source_document",
                entity_id=document_id,
                event_type="deleted",
                payload={
                    "title": row["title"],
                    "source_type": row["source_type"],
                    "stored_path": row["stored_path"],
                },
            )
            connection.execute(
                "DELETE FROM source_documents_fts WHERE source_document_id = ?",
                (document_id,),
            )
            connection.execute(
                "DELETE FROM content_chunks_fts WHERE source_document_id = ?",
                (document_id,),
            )
            connection.execute(
                "DELETE FROM recall_notes_fts WHERE source_document_id = ?",
                (document_id,),
            )
            connection.execute(
                "DELETE FROM source_documents WHERE id = ?",
                (document_id,),
            )
            stored_path = row["stored_path"]
        self.refresh_recall_knowledge()
        return stored_path

    def _connect_to_path(self, database_path: Path) -> sqlite3.Connection:
        database_path.parent.mkdir(parents=True, exist_ok=True)
        connection = sqlite3.connect(database_path)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON;")
        return connection

    def _init_workspace_schema(self, connection: sqlite3.Connection) -> None:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS workspace_meta (
                key TEXT PRIMARY KEY,
                value_text TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS source_documents (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                source_type TEXT NOT NULL,
                file_name TEXT,
                source_locator TEXT,
                stored_path TEXT,
                content_hash TEXT NOT NULL UNIQUE,
                metadata_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS document_variants (
                id TEXT PRIMARY KEY,
                source_document_id TEXT NOT NULL,
                mode TEXT NOT NULL,
                detail_level TEXT NOT NULL DEFAULT 'default',
                generated_by TEXT NOT NULL,
                model TEXT,
                source_hash TEXT NOT NULL,
                view_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE(source_document_id, mode, detail_level),
                FOREIGN KEY (source_document_id) REFERENCES source_documents(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS reading_sessions (
                id TEXT PRIMARY KEY,
                source_document_id TEXT NOT NULL,
                session_kind TEXT NOT NULL,
                mode TEXT NOT NULL,
                sentence_index INTEGER NOT NULL DEFAULT 0,
                metadata_json TEXT NOT NULL DEFAULT '{}',
                device_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE(source_document_id, session_kind, mode, device_id),
                FOREIGN KEY (source_document_id) REFERENCES source_documents(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS app_settings (
                namespace TEXT PRIMARY KEY,
                value_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS change_events (
                id TEXT PRIMARY KEY,
                entity_type TEXT NOT NULL,
                entity_id TEXT NOT NULL,
                event_type TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                device_id TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS content_chunks (
                id TEXT PRIMARY KEY,
                source_document_id TEXT NOT NULL,
                variant_id TEXT,
                block_id TEXT,
                ordinal INTEGER NOT NULL DEFAULT 0,
                text TEXT NOT NULL,
                metadata_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (source_document_id) REFERENCES source_documents(id) ON DELETE CASCADE,
                FOREIGN KEY (variant_id) REFERENCES document_variants(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS entity_mentions (
                id TEXT PRIMARY KEY,
                source_document_id TEXT NOT NULL,
                variant_id TEXT,
                block_id TEXT,
                text TEXT NOT NULL,
                normalized_text TEXT,
                entity_type TEXT NOT NULL,
                start_offset INTEGER,
                end_offset INTEGER,
                confidence REAL,
                metadata_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (source_document_id) REFERENCES source_documents(id) ON DELETE CASCADE,
                FOREIGN KEY (variant_id) REFERENCES document_variants(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS knowledge_nodes (
                id TEXT PRIMARY KEY,
                label TEXT NOT NULL,
                node_type TEXT NOT NULL,
                description TEXT,
                confidence REAL,
                metadata_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS knowledge_edges (
                id TEXT PRIMARY KEY,
                source_id TEXT NOT NULL,
                target_id TEXT NOT NULL,
                relation_type TEXT NOT NULL,
                provenance TEXT NOT NULL,
                confidence REAL,
                metadata_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (source_id) REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
                FOREIGN KEY (target_id) REFERENCES knowledge_nodes(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS review_cards (
                id TEXT PRIMARY KEY,
                source_document_id TEXT NOT NULL,
                prompt TEXT NOT NULL,
                answer TEXT NOT NULL,
                card_type TEXT NOT NULL,
                source_spans_json TEXT NOT NULL DEFAULT '[]',
                scheduling_state_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (source_document_id) REFERENCES source_documents(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS review_events (
                id TEXT PRIMARY KEY,
                review_card_id TEXT NOT NULL,
                rating INTEGER NOT NULL,
                scheduling_state_json TEXT NOT NULL DEFAULT '{}',
                reviewed_at TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (review_card_id) REFERENCES review_cards(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS recall_notes (
                id TEXT PRIMARY KEY,
                source_document_id TEXT NOT NULL,
                variant_id TEXT NOT NULL,
                block_id TEXT NOT NULL,
                sentence_start INTEGER NOT NULL,
                sentence_end INTEGER NOT NULL,
                global_sentence_start INTEGER NOT NULL,
                global_sentence_end INTEGER NOT NULL,
                anchor_text TEXT NOT NULL,
                excerpt_text TEXT NOT NULL,
                body_text TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (source_document_id) REFERENCES source_documents(id) ON DELETE CASCADE,
                FOREIGN KEY (variant_id) REFERENCES document_variants(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS embeddings (
                id TEXT PRIMARY KEY,
                source_document_id TEXT NOT NULL,
                variant_id TEXT,
                block_id TEXT,
                embedding_model TEXT NOT NULL,
                vector_json TEXT NOT NULL,
                metadata_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (source_document_id) REFERENCES source_documents(id) ON DELETE CASCADE,
                FOREIGN KEY (variant_id) REFERENCES document_variants(id) ON DELETE SET NULL
            );

            CREATE VIRTUAL TABLE IF NOT EXISTS source_documents_fts USING fts5(
                source_document_id UNINDEXED,
                title,
                body
            );

            CREATE VIRTUAL TABLE IF NOT EXISTS content_chunks_fts USING fts5(
                chunk_id UNINDEXED,
                source_document_id UNINDEXED,
                title,
                body
            );

            CREATE VIRTUAL TABLE IF NOT EXISTS recall_notes_fts USING fts5(
                note_id UNINDEXED,
                source_document_id UNINDEXED,
                anchor_text,
                excerpt_text,
                body_text
            );

            CREATE INDEX IF NOT EXISTS recall_notes_source_document_idx
            ON recall_notes (source_document_id, updated_at DESC);
            """
        )
        self._ensure_column_with_connection(
            connection,
            table_name="reading_sessions",
            column_name="metadata_json",
            column_sql="TEXT NOT NULL DEFAULT '{}'",
        )
        self._set_meta_value_with_connection(connection, "schema_version", SCHEMA_VERSION)

    def _migrate_legacy_reader_db_if_needed(self) -> None:
        if not self.legacy_database_path or not self.legacy_database_path.exists():
            return
        if self.legacy_database_path.resolve() == self.database_path.resolve():
            return

        with self.connect() as connection:
            already_migrated = connection.execute(
                "SELECT 1 FROM workspace_meta WHERE key = 'legacy_reader_migration_completed_at'",
            ).fetchone()
            has_workspace_documents = connection.execute(
                "SELECT 1 FROM source_documents LIMIT 1",
            ).fetchone()
        if already_migrated or has_workspace_documents:
            return

        with self._connect_to_path(self.legacy_database_path) as legacy_connection:
            if not self._legacy_schema_exists(legacy_connection):
                return

            document_rows = legacy_connection.execute(
                "SELECT * FROM documents ORDER BY created_at ASC"
            ).fetchall()
            variant_rows = legacy_connection.execute(
                "SELECT * FROM document_views ORDER BY created_at ASC"
            ).fetchall()
            progress_rows = legacy_connection.execute(
                "SELECT * FROM reading_progress ORDER BY updated_at ASC"
            ).fetchall()
            settings_rows = legacy_connection.execute(
                "SELECT * FROM settings ORDER BY updated_at ASC"
            ).fetchall()
            fts_rows = legacy_connection.execute(
                "SELECT document_id, title, body FROM documents_fts"
            ).fetchall()

        migration_timestamp = now_iso()
        with self.connect() as connection:
            for row in document_rows:
                connection.execute(
                    """
                    INSERT INTO source_documents (
                        id,
                        title,
                        source_type,
                        file_name,
                        source_locator,
                        stored_path,
                        content_hash,
                        metadata_json,
                        created_at,
                        updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        row["id"],
                        row["title"],
                        row["source_type"],
                        row["file_name"],
                        None,
                        row["stored_path"],
                        row["content_hash"],
                        "{}",
                        row["created_at"],
                        row["updated_at"],
                    ),
                )

            for row in variant_rows:
                connection.execute(
                    """
                    INSERT INTO document_variants (
                        id,
                        source_document_id,
                        mode,
                        detail_level,
                        generated_by,
                        model,
                        source_hash,
                        view_json,
                        created_at,
                        updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        new_uuid7_str(),
                        row["document_id"],
                        row["mode"],
                        row["detail_level"],
                        row["generated_by"],
                        row["model"],
                        row["source_hash"],
                        row["view_json"],
                        row["created_at"],
                        row["updated_at"],
                    ),
                )

            for row in progress_rows:
                connection.execute(
                    """
                    INSERT INTO reading_sessions (
                        id,
                        source_document_id,
                        session_kind,
                        mode,
                        sentence_index,
                        metadata_json,
                        device_id,
                        created_at,
                        updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(source_document_id, session_kind, mode, device_id) DO UPDATE SET
                        sentence_index = excluded.sentence_index,
                        metadata_json = excluded.metadata_json,
                        updated_at = excluded.updated_at
                    """,
                    (
                        new_uuid7_str(),
                        row["document_id"],
                        DEFAULT_SESSION_KIND,
                        row["mode"],
                        row["sentence_index"],
                        "{}",
                        self.device_id,
                        row["updated_at"],
                        row["updated_at"],
                    ),
                )

            for row in settings_rows:
                connection.execute(
                    """
                    INSERT INTO app_settings (namespace, value_json, updated_at)
                    VALUES (?, ?, ?)
                    ON CONFLICT(namespace) DO UPDATE SET
                        value_json = excluded.value_json,
                        updated_at = excluded.updated_at
                    """,
                    (row["key"], row["value_json"], row["updated_at"]),
                )

            for row in fts_rows:
                connection.execute(
                    "INSERT INTO source_documents_fts (source_document_id, title, body) VALUES (?, ?, ?)",
                    (row["document_id"], row["title"], row["body"]),
                )

            self._append_change_event_with_connection(
                connection,
                entity_type="workspace",
                entity_id="legacy-reader-migration",
                event_type="legacy_reader_db_migrated",
                payload={
                    "legacy_database_path": str(self.legacy_database_path),
                    "document_count": len(document_rows),
                },
                created_at=migration_timestamp,
            )
            self._set_meta_value_with_connection(
                connection,
                "legacy_reader_migrated_from",
                str(self.legacy_database_path),
                updated_at=migration_timestamp,
            )
            self._set_meta_value_with_connection(
                connection,
                "legacy_reader_migration_completed_at",
                migration_timestamp,
                updated_at=migration_timestamp,
            )

    def _legacy_schema_exists(self, connection: sqlite3.Connection) -> bool:
        rows = connection.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table'"
        ).fetchall()
        table_names = {row["name"] for row in rows}
        return {"documents", "document_views", "reading_progress", "settings"}.issubset(table_names)

    def _save_view_with_connection(self, connection: sqlite3.Connection, document_id: str, view: DocumentView) -> None:
        timestamp = now_iso()
        row = connection.execute(
            """
            SELECT id
            FROM document_variants
            WHERE source_document_id = ? AND mode = ? AND detail_level = ?
            """,
            (document_id, view.mode, view.detail_level),
        ).fetchone()
        variant_id = row["id"] if row else new_uuid7_str()
        event_type = "updated" if row else "created"
        connection.execute(
            """
            INSERT INTO document_variants (
                id,
                source_document_id,
                mode,
                detail_level,
                generated_by,
                model,
                source_hash,
                view_json,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(source_document_id, mode, detail_level) DO UPDATE SET
                generated_by = excluded.generated_by,
                model = excluded.model,
                source_hash = excluded.source_hash,
                view_json = excluded.view_json,
                updated_at = excluded.updated_at
            """,
            (
                variant_id,
                document_id,
                view.mode,
                view.detail_level,
                view.generated_by,
                view.model,
                view.source_hash,
                view.model_dump_json(),
                timestamp,
                timestamp,
            ),
        )
        connection.execute("UPDATE source_documents SET updated_at = ? WHERE id = ?", (timestamp, document_id))
        self._append_change_event_with_connection(
            connection,
            entity_type="document_variant",
            entity_id=variant_id,
            event_type=event_type,
            payload={
                "source_document_id": document_id,
                "mode": view.mode,
                "detail_level": view.detail_level,
            },
            created_at=timestamp,
        )

    def _sync_reflow_chunks_with_connection(self, connection: sqlite3.Connection, document_id: str) -> int:
        variant_row = connection.execute(
            """
            SELECT id, view_json
            FROM document_variants
            WHERE source_document_id = ? AND mode = 'reflowed' AND detail_level = 'default'
            """,
            (document_id,),
        ).fetchone()
        if not variant_row:
            return 0

        view = DocumentView.model_validate_json(variant_row["view_json"])
        expected_chunks = build_reflow_chunks(
            document_id=document_id,
            variant_id=variant_row["id"],
            view=view,
        )
        current_rows = connection.execute(
            """
            SELECT id, variant_id, block_id, ordinal, text, metadata_json
            FROM content_chunks
            WHERE source_document_id = ?
            ORDER BY ordinal ASC
            """,
            (document_id,),
        ).fetchall()
        if self._content_chunks_match(current_rows, expected_chunks):
            return 0

        timestamp = now_iso()
        connection.execute("DELETE FROM content_chunks_fts WHERE source_document_id = ?", (document_id,))
        connection.execute("DELETE FROM content_chunks WHERE source_document_id = ?", (document_id,))
        document_title_row = connection.execute(
            "SELECT title FROM source_documents WHERE id = ?",
            (document_id,),
        ).fetchone()
        document_title = document_title_row["title"] if document_title_row else view.title
        for chunk in expected_chunks:
            connection.execute(
                """
                INSERT INTO content_chunks (
                    id,
                    source_document_id,
                    variant_id,
                    block_id,
                    ordinal,
                    text,
                    metadata_json,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    chunk.id,
                    chunk.source_document_id,
                    chunk.variant_id,
                    chunk.block_id,
                    chunk.ordinal,
                    chunk.text,
                    json.dumps(chunk.metadata, sort_keys=True),
                    timestamp,
                    timestamp,
                ),
            )
            connection.execute(
                """
                INSERT INTO content_chunks_fts (chunk_id, source_document_id, title, body)
                VALUES (?, ?, ?, ?)
                """,
                (chunk.id, document_id, document_title, chunk.text),
            )
        self._append_change_event_with_connection(
            connection,
            entity_type="content_chunk",
            entity_id=document_id,
            event_type="synced",
            payload={
                "chunk_count": len(expected_chunks),
                "chunk_schema_version": CHUNK_SCHEMA_VERSION,
                "source_document_id": document_id,
                "variant_id": variant_row["id"],
            },
            created_at=timestamp,
        )
        self._set_meta_value_with_connection(
            connection,
            "content_chunk_schema_version",
            CHUNK_SCHEMA_VERSION,
            updated_at=timestamp,
        )
        return len(expected_chunks)

    def _backfill_recall_chunks_with_connection(self, connection: sqlite3.Connection) -> int:
        rows = connection.execute(
            "SELECT id FROM source_documents ORDER BY created_at ASC"
        ).fetchall()
        synced_count = 0
        for row in rows:
            synced_count += self._sync_reflow_chunks_with_connection(connection, row["id"])
        return synced_count

    def _rebuild_knowledge_graph_with_connection(self, connection: sqlite3.Connection) -> None:
        existing_nodes = {
            row["id"]: {
                "created_at": row["created_at"],
                "metadata": self._metadata_from_row(row),
            }
            for row in connection.execute(
                "SELECT id, metadata_json, created_at FROM knowledge_nodes"
            ).fetchall()
        }
        existing_edges = {
            row["id"]: {
                "created_at": row["created_at"],
                "metadata": self._metadata_from_row(row),
                "provenance": row["provenance"],
            }
            for row in connection.execute(
                "SELECT id, provenance, metadata_json, created_at FROM knowledge_edges"
            ).fetchall()
        }
        preserved_manual_note_nodes = self._preserved_manual_note_nodes_with_connection(connection)
        preserved_manual_note_mentions = self._preserved_manual_note_mentions_with_connection(connection)

        documents = self._load_recall_sources_with_connection(connection)
        mentions, nodes, edges = build_knowledge_records(documents)
        generated_node_ids = {node.id for node in nodes}
        timestamp = now_iso()

        connection.execute("DELETE FROM entity_mentions")
        connection.execute("DELETE FROM knowledge_edges")
        connection.execute("DELETE FROM knowledge_nodes")

        for node in nodes:
            existing = existing_nodes.get(node.id, {})
            existing_metadata = dict(existing.get("metadata", {}))
            merged_metadata = {
                **node.metadata,
                "aliases": sorted(
                    {
                        *node.metadata.get("aliases", []),
                        *existing_metadata.get("aliases", []),
                    }
                )[:6],
                "status": existing_metadata.get("status", node.metadata.get("status", "suggested")),
            }
            node_confidence = max(
                float(node.confidence or 0.0),
                0.99 if merged_metadata.get("status") == "confirmed" else float(node.confidence or 0.0),
            )
            connection.execute(
                """
                INSERT INTO knowledge_nodes (
                    id,
                    label,
                    node_type,
                    description,
                    confidence,
                    metadata_json,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    node.id,
                    node.label,
                    node.node_type,
                    node.description,
                    node_confidence,
                    json.dumps(merged_metadata, sort_keys=True),
                    existing.get("created_at", timestamp),
                    timestamp,
                ),
            )

        for preserved_node in preserved_manual_note_nodes:
            if preserved_node["id"] in generated_node_ids:
                continue
            connection.execute(
                """
                INSERT INTO knowledge_nodes (
                    id,
                    label,
                    node_type,
                    description,
                    confidence,
                    metadata_json,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    preserved_node["id"],
                    preserved_node["label"],
                    preserved_node["node_type"],
                    preserved_node["description"],
                    preserved_node["confidence"],
                    json.dumps(preserved_node["metadata"], sort_keys=True),
                    preserved_node["created_at"],
                    timestamp,
                ),
            )

        for mention in mentions:
            connection.execute(
                """
                INSERT INTO entity_mentions (
                    id,
                    source_document_id,
                    variant_id,
                    block_id,
                    text,
                    normalized_text,
                    entity_type,
                    start_offset,
                    end_offset,
                    confidence,
                    metadata_json,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    mention.id,
                    mention.source_document_id,
                    mention.variant_id,
                    mention.block_id,
                    mention.text,
                    mention.normalized_text,
                    mention.entity_type,
                    mention.start_offset,
                    mention.end_offset,
                    mention.confidence,
                    json.dumps(mention.metadata, sort_keys=True),
                    timestamp,
                    timestamp,
                ),
            )

        for preserved_mention in preserved_manual_note_mentions:
            if preserved_mention["normalized_text"] and not connection.execute(
                "SELECT 1 FROM knowledge_nodes WHERE id = ?",
                (build_node_id(preserved_mention["normalized_text"]),),
            ).fetchone():
                continue
            connection.execute(
                """
                INSERT INTO entity_mentions (
                    id,
                    source_document_id,
                    variant_id,
                    block_id,
                    text,
                    normalized_text,
                    entity_type,
                    start_offset,
                    end_offset,
                    confidence,
                    metadata_json,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    preserved_mention["id"],
                    preserved_mention["source_document_id"],
                    preserved_mention["variant_id"],
                    preserved_mention["block_id"],
                    preserved_mention["text"],
                    preserved_mention["normalized_text"],
                    preserved_mention["entity_type"],
                    preserved_mention["start_offset"],
                    preserved_mention["end_offset"],
                    preserved_mention["confidence"],
                    json.dumps(preserved_mention["metadata"], sort_keys=True),
                    preserved_mention["created_at"],
                    timestamp,
                ),
            )

        for edge in edges:
            existing = existing_edges.get(edge.id, {})
            existing_metadata = dict(existing.get("metadata", {}))
            merged_metadata = {
                **edge.metadata,
                "status": existing_metadata.get("status", edge.metadata.get("status", "suggested")),
            }
            provenance = "manual" if merged_metadata.get("status") == "confirmed" else edge.provenance
            edge_confidence = max(
                float(edge.confidence or 0.0),
                0.99 if merged_metadata.get("status") == "confirmed" else float(edge.confidence or 0.0),
            )
            connection.execute(
                """
                INSERT INTO knowledge_edges (
                    id,
                    source_id,
                    target_id,
                    relation_type,
                    provenance,
                    confidence,
                    metadata_json,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    edge.id,
                    edge.source_id,
                    edge.target_id,
                    edge.relation_type,
                    provenance,
                    edge_confidence,
                    json.dumps(
                        {
                            **merged_metadata,
                            "evidence": [
                                {
                                    "source_document_id": evidence.source_document_id,
                                    "block_id": evidence.block_id,
                                    "excerpt": evidence.excerpt,
                                    "confidence": evidence.confidence,
                                    "metadata": evidence.metadata,
                                }
                                for evidence in edge.evidence
                            ],
                        },
                        sort_keys=True,
                    ),
                    existing.get("created_at", timestamp),
                    timestamp,
                ),
            )

        self._refresh_knowledge_node_aggregates_with_connection(connection, updated_at=timestamp)
        self._append_change_event_with_connection(
            connection,
            entity_type="knowledge_graph",
            entity_id="workspace",
            event_type="rebuilt",
            payload={
                "edge_count": len(edges),
                "graph_schema_version": GRAPH_SCHEMA_VERSION,
                "mention_count": len(mentions),
                "node_count": len(nodes),
            },
            created_at=timestamp,
        )
        self._set_meta_value_with_connection(
            connection,
            "knowledge_graph_schema_version",
            GRAPH_SCHEMA_VERSION,
            updated_at=timestamp,
        )

    def _sync_review_cards_with_connection(self, connection: sqlite3.Connection) -> StudyCardGenerationResult:
        chunk_rows = connection.execute(
            """
            SELECT id, source_document_id, variant_id, block_id, ordinal, text, metadata_json
            FROM content_chunks
            ORDER BY source_document_id ASC, ordinal ASC
            """
        ).fetchall()
        chunks = [
            ContentChunk(
                id=row["id"],
                source_document_id=row["source_document_id"],
                variant_id=row["variant_id"],
                block_id=row["block_id"],
                ordinal=row["ordinal"],
                text=row["text"],
                metadata=json.loads(row["metadata_json"] or "{}"),
            )
            for row in chunk_rows
        ]
        node_rows = connection.execute("SELECT * FROM knowledge_nodes").fetchall()
        nodes = [
            KnowledgeNode(
                id=row["id"],
                label=row["label"],
                node_type=row["node_type"],
                description=row["description"],
                confidence=row["confidence"],
                metadata=self._metadata_from_row(row),
            )
            for row in node_rows
        ]
        edge_rows = connection.execute("SELECT * FROM knowledge_edges").fetchall()
        edges = [
            KnowledgeEdge(
                id=row["id"],
                source_id=row["source_id"],
                target_id=row["target_id"],
                relation_type=row["relation_type"],
                provenance=row["provenance"],
                confidence=row["confidence"],
                evidence=[],
                metadata=self._metadata_from_row(row),
            )
            for row in edge_rows
        ]
        document_titles = {
            row["id"]: row["title"]
            for row in connection.execute(
                "SELECT id, title FROM source_documents"
            ).fetchall()
        }
        card_candidates = build_review_card_candidates(
            chunks=chunks,
            nodes=nodes,
            edges=edges,
            document_titles=document_titles,
        )
        existing_rows = {
            row["id"]: row
            for row in connection.execute(
                """
                SELECT
                    id,
                    source_document_id,
                    prompt,
                    answer,
                    card_type,
                    source_spans_json,
                    scheduling_state_json,
                    created_at
                FROM review_cards
                """
            ).fetchall()
        }
        expected_ids = {candidate["id"] for candidate in card_candidates}
        obsolete_ids = [
            card_id
            for card_id, row in existing_rows.items()
            if card_id not in expected_ids and row["card_type"] != "manual_note"
        ]
        for card_id in obsolete_ids:
            connection.execute(
                "DELETE FROM review_cards WHERE id = ?",
                (card_id,),
            )

        timestamp = now_iso()
        generated_count = 0
        for candidate in card_candidates:
            existing = existing_rows.get(candidate["id"])
            scheduling_state = (
                json.loads(existing["scheduling_state_json"] or "{}")
                if existing
                else build_initial_scheduling_state(candidate["id"], created_at=timestamp)
            )
            scheduling_state["status"] = study_card_status(scheduling_state)
            source_spans_json = json.dumps(candidate["source_spans"], sort_keys=True)
            scheduling_state_json = json.dumps(scheduling_state, sort_keys=True)
            needs_update = (
                existing is None
                or existing["source_document_id"] != candidate["source_document_id"]
                or existing["prompt"] != candidate["prompt"]
                or existing["answer"] != candidate["answer"]
                or existing["card_type"] != candidate["card_type"]
                or existing["source_spans_json"] != source_spans_json
                or existing["scheduling_state_json"] != scheduling_state_json
            )
            if needs_update:
                generated_count += 1
            connection.execute(
                """
                INSERT INTO review_cards (
                    id,
                    source_document_id,
                    prompt,
                    answer,
                    card_type,
                    source_spans_json,
                    scheduling_state_json,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    source_document_id = excluded.source_document_id,
                    prompt = excluded.prompt,
                    answer = excluded.answer,
                    card_type = excluded.card_type,
                    source_spans_json = excluded.source_spans_json,
                    scheduling_state_json = excluded.scheduling_state_json,
                    updated_at = excluded.updated_at
                """,
                (
                    candidate["id"],
                    candidate["source_document_id"],
                    candidate["prompt"],
                    candidate["answer"],
                    candidate["card_type"],
                    source_spans_json,
                    scheduling_state_json,
                    existing["created_at"] if existing else timestamp,
                    timestamp,
                ),
            )

        self._append_change_event_with_connection(
            connection,
            entity_type="review_card",
            entity_id="workspace",
            event_type="synced",
            payload={
                "generated_count": generated_count,
                "study_schema_version": STUDY_SCHEMA_VERSION,
                "total_count": len(card_candidates),
            },
            created_at=timestamp,
        )
        self._set_meta_value_with_connection(
            connection,
            "study_schema_version",
            STUDY_SCHEMA_VERSION,
            updated_at=timestamp,
        )
        return StudyCardGenerationResult(
            generated_count=generated_count,
            total_count=len(card_candidates),
        )

    def _rebuild_lexical_embeddings_with_connection(self, connection: sqlite3.Connection) -> None:
        timestamp = now_iso()
        connection.execute("DELETE FROM embeddings")

        chunk_rows = connection.execute(
            """
            SELECT
                cc.id,
                cc.source_document_id,
                cc.variant_id,
                cc.block_id,
                cc.text,
                sd.title AS document_title
            FROM content_chunks cc
            INNER JOIN source_documents sd ON sd.id = cc.source_document_id
            ORDER BY cc.source_document_id ASC, cc.ordinal ASC
            """
        ).fetchall()
        for row in chunk_rows:
            vector = build_sparse_vector(row["text"], extra_terms=[row["document_title"]])
            if not vector:
                continue
            metadata = {
                "block_id": row["block_id"],
                "chunk_id": row["id"],
                "document_title": row["document_title"],
                "excerpt": self._truncate_text(row["text"], 160),
                "item_id": row["id"],
                "item_type": "chunk",
                "title": row["document_title"],
            }
            connection.execute(
                """
                INSERT INTO embeddings (
                    id,
                    source_document_id,
                    variant_id,
                    block_id,
                    embedding_model,
                    vector_json,
                    metadata_json,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    build_embedding_id("chunk", row["id"]),
                    row["source_document_id"],
                    row["variant_id"],
                    row["block_id"],
                    LEXICAL_EMBEDDING_MODEL,
                    json.dumps(vector, sort_keys=True),
                    json.dumps(metadata, sort_keys=True),
                    timestamp,
                    timestamp,
                ),
            )
        self._set_meta_value_with_connection(
            connection,
            "lexical_embedding_model",
            LEXICAL_EMBEDDING_MODEL,
            updated_at=timestamp,
        )

        node_rows = connection.execute("SELECT * FROM knowledge_nodes").fetchall()
        for row in node_rows:
            metadata = self._metadata_from_row(row)
            if metadata.get("status") == "rejected":
                continue
            source_document_ids = list(metadata.get("source_document_ids", []))
            if not source_document_ids:
                continue
            aliases = list(metadata.get("aliases", []))
            vector = build_sparse_vector(
                f"{row['label']} {row['description'] or ''}",
                extra_terms=[row["label"], *aliases],
            )
            if not vector:
                continue
            connection.execute(
                """
                INSERT INTO embeddings (
                    id,
                    source_document_id,
                    variant_id,
                    block_id,
                    embedding_model,
                    vector_json,
                    metadata_json,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    build_embedding_id("node", row["id"]),
                    source_document_ids[0],
                    None,
                    None,
                    LEXICAL_EMBEDDING_MODEL,
                    json.dumps(vector, sort_keys=True),
                    json.dumps(
                        {
                            "aliases": aliases,
                            "document_title": self._first_document_title(connection, source_document_ids),
                            "excerpt": row["description"] or row["label"],
                            "item_id": row["id"],
                            "item_type": "node",
                            "node_id": row["id"],
                            "status": metadata.get("status", "suggested"),
                            "title": row["label"],
                        },
                        sort_keys=True,
                    ),
                    timestamp,
                    timestamp,
                ),
            )

        card_rows = connection.execute(
            """
            SELECT rc.*, sd.title AS document_title
            FROM review_cards rc
            INNER JOIN source_documents sd ON sd.id = rc.source_document_id
            """
        ).fetchall()
        for row in card_rows:
            vector = build_sparse_vector(
                f"{row['prompt']} {row['answer']}",
                extra_terms=[row["document_title"]],
            )
            if not vector:
                continue
            connection.execute(
                """
                INSERT INTO embeddings (
                    id,
                    source_document_id,
                    variant_id,
                    block_id,
                    embedding_model,
                    vector_json,
                    metadata_json,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    build_embedding_id("card", row["id"]),
                    row["source_document_id"],
                    None,
                    None,
                    LEXICAL_EMBEDDING_MODEL,
                    json.dumps(vector, sort_keys=True),
                    json.dumps(
                        {
                            "card_id": row["id"],
                            "document_title": row["document_title"],
                            "excerpt": row["answer"],
                            "item_id": row["id"],
                            "item_type": "card",
                            "title": row["prompt"],
                        },
                        sort_keys=True,
                    ),
                    timestamp,
                    timestamp,
                ),
            )

    def _load_recall_sources_with_connection(
        self,
        connection: sqlite3.Connection,
    ) -> list[KnowledgeSourceDocument]:
        variant_rows = connection.execute(
            """
            SELECT
                sd.id AS source_document_id,
                sd.title AS document_title,
                dv.id AS variant_id,
                dv.view_json
            FROM source_documents sd
            INNER JOIN document_variants dv
                ON dv.source_document_id = sd.id
               AND dv.mode = 'reflowed'
               AND dv.detail_level = 'default'
            ORDER BY sd.created_at ASC
            """
        ).fetchall()
        documents: list[KnowledgeSourceDocument] = []
        for row in variant_rows:
            chunk_rows = connection.execute(
                """
                SELECT id, source_document_id, variant_id, block_id, ordinal, text, metadata_json
                FROM content_chunks
                WHERE source_document_id = ?
                ORDER BY ordinal ASC
                """,
                (row["source_document_id"],),
            ).fetchall()
            chunks = [
                ContentChunk(
                    id=chunk_row["id"],
                    source_document_id=chunk_row["source_document_id"],
                    variant_id=chunk_row["variant_id"],
                    block_id=chunk_row["block_id"],
                    ordinal=chunk_row["ordinal"],
                    text=chunk_row["text"],
                    metadata=json.loads(chunk_row["metadata_json"] or "{}"),
                )
                for chunk_row in chunk_rows
            ]
            documents.append(
                KnowledgeSourceDocument(
                    source_document_id=row["source_document_id"],
                    title=row["document_title"],
                    variant_id=row["variant_id"],
                    view=DocumentView.model_validate_json(row["view_json"]),
                    chunks=chunks,
                )
            )
        return documents

    def _content_chunks_match(
        self,
        current_rows: list[sqlite3.Row],
        expected_chunks: list[ContentChunk],
    ) -> bool:
        if len(current_rows) != len(expected_chunks):
            return False
        for row, chunk in zip(current_rows, expected_chunks, strict=True):
            if row["id"] != chunk.id:
                return False
            if row["variant_id"] != chunk.variant_id:
                return False
            if row["block_id"] != chunk.block_id:
                return False
            if row["ordinal"] != chunk.ordinal:
                return False
            if row["text"] != chunk.text:
                return False
            if json.loads(row["metadata_json"] or "{}") != chunk.metadata:
                return False
        return True

    def _row_to_record(self, connection: sqlite3.Connection, row: sqlite3.Row) -> DocumentRecord:
        mode_rows = self._mode_rows_for_document(connection, row["id"])
        progress_rows = connection.execute(
            """
            SELECT mode, sentence_index
            FROM reading_sessions
            WHERE source_document_id = ? AND session_kind = ? AND device_id = ?
            """,
            (row["id"], DEFAULT_SESSION_KIND, self.device_id),
        ).fetchall()
        last_session_row = connection.execute(
            """
            SELECT mode, sentence_index, metadata_json, updated_at
            FROM reading_sessions
            WHERE source_document_id = ? AND session_kind = ? AND device_id = ?
            ORDER BY updated_at DESC
            LIMIT 1
            """,
            (row["id"], DEFAULT_SESSION_KIND, self.device_id),
        ).fetchone()
        return DocumentRecord(
            id=row["id"],
            title=row["title"],
            source_type=row["source_type"],
            file_name=row["file_name"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
            available_modes=[mode_row["mode"] for mode_row in mode_rows],
            progress_by_mode={progress_row["mode"]: progress_row["sentence_index"] for progress_row in progress_rows},
            last_reader_session=self._row_to_reader_session_state(last_session_row),
        )

    def _row_to_recall_record(self, connection: sqlite3.Connection, row: sqlite3.Row) -> RecallDocumentRecord:
        mode_rows = self._mode_rows_for_document(connection, row["id"])
        return RecallDocumentRecord(
            id=row["id"],
            title=row["title"],
            source_type=row["source_type"],
            file_name=row["file_name"],
            source_locator=row["source_locator"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
            available_modes=[mode_row["mode"] for mode_row in mode_rows],
            chunk_count=row["chunk_count"],
        )

    def _view_from_variant_row(self, row: sqlite3.Row) -> DocumentView:
        view = DocumentView.model_validate_json(row["view_json"])
        return enrich_view_with_sentence_metadata(view, variant_id=row["id"])

    def _normalize_note_body(self, body_text: str | None) -> str | None:
        normalized = normalize_whitespace(body_text or "")
        return normalized or None

    def _validated_recall_note_anchor_with_connection(
        self,
        connection: sqlite3.Connection,
        *,
        document_id: str,
        anchor: RecallNoteAnchor,
    ) -> RecallNoteAnchor:
        if anchor.source_document_id != document_id:
            raise ValueError("Note anchor must match the requested document.")

        variant_row = connection.execute(
            """
            SELECT id, view_json
            FROM document_variants
            WHERE source_document_id = ? AND mode = 'reflowed' AND detail_level = 'default'
            """,
            (document_id,),
        ).fetchone()
        if not variant_row:
            raise ValueError("Notes require the reflowed/default view for this document.")
        if anchor.variant_id != variant_row["id"]:
            raise ValueError("Notes can only target the reflowed/default variant for this document.")
        if anchor.sentence_start > anchor.sentence_end:
            raise ValueError("Note anchors must use a contiguous sentence range.")

        view = self._view_from_variant_row(variant_row)
        block = next((candidate for candidate in view.blocks if candidate.id == anchor.block_id), None)
        if not block:
            raise ValueError("Note anchor block was not found in the reflowed/default view.")

        sentence_texts = sentence_texts_for_block(block)
        if not sentence_texts:
            raise ValueError("Note anchor could not be matched to readable sentences.")
        if anchor.sentence_start < 0 or anchor.sentence_end >= len(sentence_texts):
            raise ValueError("Note anchors must stay within a single block.")

        global_sentence_start, global_sentence_end = self._global_sentence_range_for_block(
            view.blocks,
            block_id=anchor.block_id,
            sentence_start=anchor.sentence_start,
            sentence_end=anchor.sentence_end,
        )
        anchor_text = " ".join(sentence_texts[anchor.sentence_start : anchor.sentence_end + 1]).strip()
        excerpt_text = build_note_excerpt(sentence_texts, anchor.sentence_start, anchor.sentence_end) or anchor_text
        return RecallNoteAnchor(
            source_document_id=document_id,
            variant_id=variant_row["id"],
            block_id=anchor.block_id,
            sentence_start=anchor.sentence_start,
            sentence_end=anchor.sentence_end,
            global_sentence_start=global_sentence_start,
            global_sentence_end=global_sentence_end,
            anchor_text=anchor_text,
            excerpt_text=excerpt_text,
        )

    def _global_sentence_range_for_block(
        self,
        blocks: list[Any],
        *,
        block_id: str,
        sentence_start: int,
        sentence_end: int,
    ) -> tuple[int, int]:
        global_index = 0
        for block in blocks:
            sentence_count = len(sentence_texts_for_block(block))
            if block.id == block_id:
                return global_index + sentence_start, global_index + sentence_end
            global_index += sentence_count
        raise ValueError("Note anchor block was not found in the reflowed/default view.")

    def _find_exact_saved_page_row_with_connection(
        self,
        connection: sqlite3.Connection,
        page_url: str,
    ) -> sqlite3.Row | None:
        normalized_url = canonicalize_page_url(page_url)
        if not normalized_url:
            return None
        rows = connection.execute(
            """
            SELECT id, title, source_locator, updated_at
            FROM source_documents
            WHERE source_type = 'web' AND source_locator IS NOT NULL
            ORDER BY updated_at DESC, id DESC
            """
        ).fetchall()
        for row in rows:
            if canonicalize_page_url(str(row["source_locator"])) == normalized_url:
                return row
        return None

    def _resolve_browser_note_anchor_with_connection(
        self,
        connection: sqlite3.Connection,
        *,
        document_id: str,
        selection_text: str,
    ) -> RecallNoteAnchor:
        normalized_selection = normalize_whitespace(selection_text)
        if not normalized_selection:
            raise ValueError("Select text on the saved page before adding a note.")

        variant_row = connection.execute(
            """
            SELECT id, view_json
            FROM document_variants
            WHERE source_document_id = ? AND mode = 'reflowed' AND detail_level = 'default'
            """,
            (document_id,),
        ).fetchone()
        if not variant_row:
            raise ValueError("That saved page is missing the reflowed/default view needed for note capture.")

        selection_lower = normalized_selection.lower()
        view = self._view_from_variant_row(variant_row)
        candidates: list[tuple[int, int, int, str, int, int]] = []

        for block in view.blocks:
            sentence_texts = sentence_texts_for_block(block)
            if not sentence_texts:
                continue
            for sentence_start in range(len(sentence_texts)):
                combined_sentences: list[str] = []
                for sentence_end in range(sentence_start, len(sentence_texts)):
                    combined_sentences.append(sentence_texts[sentence_end])
                    candidate_text = normalize_whitespace(" ".join(combined_sentences))
                    candidate_lower = candidate_text.lower()
                    if selection_lower not in candidate_lower:
                        continue
                    exactness_rank = 0 if candidate_lower == selection_lower else 1
                    candidates.append(
                        (
                            exactness_rank,
                            sentence_end - sentence_start,
                            len(candidate_lower) - len(selection_lower),
                            str(block.id),
                            sentence_start,
                            sentence_end,
                        )
                    )
                    if exactness_rank == 0:
                        break

        if not candidates:
            raise ValueError(
                "Select one or more sentences from the saved page so Recall can anchor the note safely."
            )

        candidates.sort()
        best_candidate = candidates[0]
        ambiguous_best = [
            candidate
            for candidate in candidates
            if candidate[:3] == best_candidate[:3] and candidate[3:] != best_candidate[3:]
        ]
        if ambiguous_best:
            raise ValueError("That selection matches multiple saved passages. Select a more specific sentence range.")

        _, _, _, block_id, sentence_start, sentence_end = best_candidate
        return self._validated_recall_note_anchor_with_connection(
            connection,
            document_id=document_id,
            anchor=RecallNoteAnchor(
                source_document_id=document_id,
                variant_id=str(variant_row["id"]),
                block_id=block_id,
                sentence_start=sentence_start,
                sentence_end=sentence_end,
                anchor_text=normalized_selection,
                excerpt_text=normalized_selection,
            ),
        )

    def _chunk_id_for_note_row_with_connection(
        self,
        connection: sqlite3.Connection,
        note_row: sqlite3.Row,
    ) -> str | None:
        chunk_rows = connection.execute(
            """
            SELECT id, metadata_json
            FROM content_chunks
            WHERE source_document_id = ? AND block_id = ?
            ORDER BY ordinal ASC
            """,
            (note_row["source_document_id"], note_row["block_id"]),
        ).fetchall()
        for chunk_row in chunk_rows:
            metadata = json.loads(chunk_row["metadata_json"] or "{}")
            sentence_start = int(metadata.get("sentence_start_in_block", -1))
            sentence_end = int(metadata.get("sentence_end_in_block", -1))
            if sentence_start <= int(note_row["sentence_start"]) <= int(note_row["sentence_end"]) <= sentence_end:
                return str(chunk_row["id"])
        return None

    def _upsert_manual_note_knowledge_node_with_connection(
        self,
        connection: sqlite3.Connection,
        *,
        note_row: sqlite3.Row,
        note_id: str,
        node_id: str,
        label: str,
        canonical_key: str,
        description: str | None,
        updated_at: str,
    ) -> None:
        existing_node_row = connection.execute(
            "SELECT * FROM knowledge_nodes WHERE id = ?",
            (node_id,),
        ).fetchone()
        existing_metadata = self._metadata_from_row(existing_node_row) if existing_node_row else {}
        aliases = {
            label,
            *(str(alias) for alias in existing_metadata.get("aliases", [])),
        }
        if existing_node_row and existing_node_row["label"] and existing_node_row["label"] != label:
            aliases.add(str(existing_node_row["label"]))
        source_document_ids = sorted(
            {
                *(str(document_id) for document_id in existing_metadata.get("source_document_ids", [])),
                str(note_row["source_document_id"]),
            }
        )
        promoted_note_ids = sorted(
            {
                *(str(candidate_note_id) for candidate_note_id in existing_metadata.get("promoted_note_ids", [])),
                note_id,
            }
        )
        node_description = (
            description
            or (str(existing_node_row["description"]) if existing_node_row and existing_node_row["description"] else None)
            or (normalize_whitespace(note_row["body_text"]) if note_row["body_text"] else None)
            or str(note_row["anchor_text"])
        )
        connection.execute(
            """
            INSERT INTO knowledge_nodes (
                id,
                label,
                node_type,
                description,
                confidence,
                metadata_json,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                label = excluded.label,
                node_type = excluded.node_type,
                description = excluded.description,
                confidence = excluded.confidence,
                metadata_json = excluded.metadata_json,
                updated_at = excluded.updated_at
            """,
            (
                node_id,
                label,
                existing_node_row["node_type"] if existing_node_row else "concept",
                node_description,
                max(float(existing_node_row["confidence"] or 0.0), 0.99) if existing_node_row else 0.99,
                json.dumps(
                    {
                        **existing_metadata,
                        "aliases": sorted(alias for alias in aliases if alias)[:6],
                        "canonical_key": canonical_key,
                        "graph_schema_version": GRAPH_SCHEMA_VERSION,
                        "mention_count": int(existing_metadata.get("mention_count", 0)),
                        "promoted_note_ids": promoted_note_ids,
                        "source_document_ids": source_document_ids,
                        "status": "confirmed",
                    },
                    sort_keys=True,
                ),
                existing_node_row["created_at"] if existing_node_row else updated_at,
                updated_at,
            ),
        )

        mention_metadata = {
            "chunk_id": self._chunk_id_for_note_row_with_connection(connection, note_row),
            "document_title": note_row["document_title"],
            "excerpt": note_row["excerpt_text"],
            "graph_schema_version": GRAPH_SCHEMA_VERSION,
            "manual_source": "note",
            "note_anchor_text": note_row["anchor_text"],
            "note_id": note_id,
        }
        mention_id = f"mention:{sha256_text(f'manual_note|{note_id}|{canonical_key}')[:16]}"
        connection.execute(
            """
            INSERT INTO entity_mentions (
                id,
                source_document_id,
                variant_id,
                block_id,
                text,
                normalized_text,
                entity_type,
                start_offset,
                end_offset,
                confidence,
                metadata_json,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                source_document_id = excluded.source_document_id,
                variant_id = excluded.variant_id,
                block_id = excluded.block_id,
                text = excluded.text,
                normalized_text = excluded.normalized_text,
                entity_type = excluded.entity_type,
                start_offset = excluded.start_offset,
                end_offset = excluded.end_offset,
                confidence = excluded.confidence,
                metadata_json = excluded.metadata_json,
                updated_at = excluded.updated_at
            """,
            (
                mention_id,
                note_row["source_document_id"],
                note_row["variant_id"],
                note_row["block_id"],
                label,
                canonical_key,
                "concept",
                None,
                None,
                0.99,
                json.dumps(mention_metadata, sort_keys=True),
                updated_at,
                updated_at,
            ),
        )

    def _preserved_manual_note_nodes_with_connection(
        self,
        connection: sqlite3.Connection,
    ) -> list[dict[str, Any]]:
        current_document_ids = {
            str(row["id"])
            for row in connection.execute("SELECT id FROM source_documents").fetchall()
        }
        preserved_nodes: list[dict[str, Any]] = []
        for row in connection.execute("SELECT * FROM knowledge_nodes").fetchall():
            metadata = self._metadata_from_row(row)
            promoted_note_ids = [str(note_id) for note_id in metadata.get("promoted_note_ids", []) if str(note_id)]
            source_document_ids = [
                str(document_id)
                for document_id in metadata.get("source_document_ids", [])
                if str(document_id) in current_document_ids
            ]
            if not promoted_note_ids or not source_document_ids:
                continue
            preserved_nodes.append(
                {
                    "id": row["id"],
                    "label": row["label"],
                    "node_type": row["node_type"],
                    "description": row["description"],
                    "confidence": max(float(row["confidence"] or 0.0), 0.99),
                    "metadata": {
                        **metadata,
                        "graph_schema_version": GRAPH_SCHEMA_VERSION,
                        "promoted_note_ids": promoted_note_ids,
                        "source_document_ids": source_document_ids,
                        "status": metadata.get("status", "confirmed"),
                    },
                    "created_at": row["created_at"],
                }
            )
        return preserved_nodes

    def _preserved_manual_note_mentions_with_connection(
        self,
        connection: sqlite3.Connection,
    ) -> list[dict[str, Any]]:
        current_document_ids = {
            str(row["id"])
            for row in connection.execute("SELECT id FROM source_documents").fetchall()
        }
        preserved_mentions: list[dict[str, Any]] = []
        for row in connection.execute("SELECT * FROM entity_mentions").fetchall():
            metadata = self._metadata_from_row(row)
            if metadata.get("manual_source") != "note":
                continue
            if str(row["source_document_id"]) not in current_document_ids:
                continue
            preserved_mentions.append(
                {
                    "id": row["id"],
                    "source_document_id": row["source_document_id"],
                    "variant_id": row["variant_id"],
                    "block_id": row["block_id"],
                    "text": row["text"],
                    "normalized_text": row["normalized_text"],
                    "entity_type": row["entity_type"],
                    "start_offset": row["start_offset"],
                    "end_offset": row["end_offset"],
                    "confidence": max(float(row["confidence"] or 0.0), 0.99),
                    "metadata": metadata,
                    "created_at": row["created_at"],
                }
            )
        return preserved_mentions

    def _refresh_knowledge_node_aggregates_with_connection(
        self,
        connection: sqlite3.Connection,
        *,
        updated_at: str,
    ) -> None:
        mention_rows = connection.execute(
            "SELECT normalized_text, source_document_id FROM entity_mentions WHERE normalized_text IS NOT NULL"
        ).fetchall()
        mention_counts: dict[str, int] = {}
        source_document_ids_by_key: dict[str, set[str]] = {}
        for row in mention_rows:
            canonical_key = str(row["normalized_text"] or "")
            if not canonical_key:
                continue
            mention_counts[canonical_key] = mention_counts.get(canonical_key, 0) + 1
            source_document_ids_by_key.setdefault(canonical_key, set()).add(str(row["source_document_id"]))

        node_rows = connection.execute("SELECT id, confidence, metadata_json FROM knowledge_nodes").fetchall()
        for row in node_rows:
            metadata = self._metadata_from_row(row)
            canonical_key = str(metadata.get("canonical_key", ""))
            if not canonical_key:
                continue
            source_document_ids = sorted(source_document_ids_by_key.get(canonical_key, set()))
            metadata["graph_schema_version"] = GRAPH_SCHEMA_VERSION
            metadata["mention_count"] = mention_counts.get(canonical_key, 0)
            metadata["source_document_ids"] = source_document_ids
            confidence = float(row["confidence"] or 0.0)
            if metadata.get("status") == "confirmed":
                confidence = max(confidence, 0.99)
            connection.execute(
                """
                UPDATE knowledge_nodes
                SET confidence = ?, metadata_json = ?, updated_at = ?
                WHERE id = ?
                """,
                (
                    confidence,
                    json.dumps(metadata, sort_keys=True),
                    updated_at,
                    row["id"],
                ),
            )

    def _upsert_recall_note_fts_with_connection(
        self,
        connection: sqlite3.Connection,
        *,
        note_id: str,
        source_document_id: str,
        anchor_text: str,
        excerpt_text: str,
        body_text: str | None,
    ) -> None:
        connection.execute("DELETE FROM recall_notes_fts WHERE note_id = ?", (note_id,))
        connection.execute(
            """
            INSERT INTO recall_notes_fts (note_id, source_document_id, anchor_text, excerpt_text, body_text)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                note_id,
                source_document_id,
                anchor_text,
                excerpt_text,
                body_text or "",
            ),
        )

    def _row_to_recall_note_anchor(self, row: sqlite3.Row) -> RecallNoteAnchor:
        return RecallNoteAnchor(
            source_document_id=row["source_document_id"],
            variant_id=row["variant_id"],
            block_id=row["block_id"],
            sentence_start=row["sentence_start"],
            sentence_end=row["sentence_end"],
            global_sentence_start=row["global_sentence_start"],
            global_sentence_end=row["global_sentence_end"],
            anchor_text=row["anchor_text"],
            excerpt_text=row["excerpt_text"],
        )

    def _row_to_recall_note_record(self, row: sqlite3.Row) -> RecallNoteRecord:
        return RecallNoteRecord(
            id=row["id"],
            anchor=self._row_to_recall_note_anchor(row),
            body_text=row["body_text"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )

    def _row_to_recall_note_search_hit(self, row: sqlite3.Row) -> RecallNoteSearchHit:
        rank = float(row["rank"] if row["rank"] is not None else 0.0)
        return RecallNoteSearchHit(
            id=row["id"],
            anchor=self._row_to_recall_note_anchor(row),
            document_title=row["document_title"],
            score=1.0 / (1.0 + abs(rank)),
            body_text=row["body_text"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )

    def _row_to_knowledge_node_record(self, row: sqlite3.Row) -> KnowledgeNodeRecord:
        metadata = self._metadata_from_row(row)
        return KnowledgeNodeRecord(
            id=row["id"],
            label=row["label"],
            node_type=row["node_type"],
            description=row["description"],
            confidence=float(row["confidence"] or 0.0),
            mention_count=int(metadata.get("mention_count", 0)),
            document_count=len(metadata.get("source_document_ids", [])),
            status=metadata.get("status", "suggested"),
            aliases=list(metadata.get("aliases", [])),
            source_document_ids=list(metadata.get("source_document_ids", [])),
        )

    def _row_to_knowledge_edge_record(self, row: sqlite3.Row) -> KnowledgeEdgeRecord:
        metadata = self._metadata_from_row(row)
        evidence = list(metadata.get("evidence", []))
        first_excerpt = evidence[0].get("excerpt") if evidence else None
        return KnowledgeEdgeRecord(
            id=row["id"],
            source_id=row["source_id"],
            source_label=row["source_label"],
            target_id=row["target_id"],
            target_label=row["target_label"],
            relation_type=row["relation_type"],
            provenance=row["provenance"],
            confidence=float(row["confidence"] or 0.0),
            status=metadata.get("status", "suggested"),
            evidence_count=int(metadata.get("evidence_count", len(evidence))),
            source_document_ids=list(metadata.get("source_document_ids", [])),
            excerpt=first_excerpt,
        )

    def _row_to_knowledge_mention_record(self, row: sqlite3.Row) -> KnowledgeMentionRecord:
        metadata = self._metadata_from_row(row)
        return KnowledgeMentionRecord(
            id=row["id"],
            source_document_id=row["source_document_id"],
            document_title=str(metadata.get("document_title", "Untitled")),
            text=row["text"],
            entity_type=row["entity_type"],
            confidence=float(row["confidence"] or 0.0),
            block_id=row["block_id"],
            chunk_id=metadata.get("chunk_id"),
            excerpt=str(metadata.get("excerpt", row["text"])),
        )

    def _row_to_study_card_record(self, row: sqlite3.Row) -> StudyCardRecord:
        scheduling_state = json.loads(row["scheduling_state_json"] or "{}")
        status = study_card_status(scheduling_state)
        return StudyCardRecord(
            id=row["id"],
            source_document_id=row["source_document_id"],
            document_title=row["document_title"],
            prompt=row["prompt"],
            answer=row["answer"],
            card_type=row["card_type"],
            source_spans=json.loads(row["source_spans_json"] or "[]"),
            scheduling_state=scheduling_state,
            due_at=str(scheduling_state.get("due_at", row["updated_at"])),
            review_count=int(scheduling_state.get("review_count", 0)),
            status=status,
            last_rating=scheduling_state.get("last_rating"),
        )

    def _row_to_reader_session_state(self, row: sqlite3.Row | None) -> ReaderSessionState | None:
        if row is None:
            return None
        metadata = json.loads(row["metadata_json"] or "{}")
        snapshot = metadata.get("accessibility_snapshot")
        return ReaderSessionState(
            mode=row["mode"],
            sentence_index=row["sentence_index"],
            summary_detail=metadata.get("summary_detail"),
            accessibility_snapshot=AccessibilitySnapshot.model_validate(snapshot) if snapshot else None,
            updated_at=row["updated_at"],
        )

    def _latest_change_event_cursor(
        self,
        connection: sqlite3.Connection,
        *,
        entity_type: str | None = None,
    ) -> str | None:
        if entity_type:
            row = connection.execute(
                """
                SELECT id
                FROM change_events
                WHERE entity_type = ?
                ORDER BY created_at DESC, id DESC
                LIMIT 1
                """,
                (entity_type,),
            ).fetchone()
        else:
            row = connection.execute(
                """
                SELECT id
                FROM change_events
                ORDER BY created_at DESC, id DESC
                LIMIT 1
                """
            ).fetchone()
        return row["id"] if row else None

    def _row_to_change_event(self, row: sqlite3.Row) -> ChangeEvent:
        return ChangeEvent(
            id=row["id"],
            entity_type=row["entity_type"],
            entity_id=row["entity_id"],
            event_type=row["event_type"],
            payload=json.loads(row["payload_json"] or "{}"),
            device_id=row["device_id"],
            created_at=row["created_at"],
        )

    def _attachment_refs_from_rows(self, rows: list[sqlite3.Row]) -> list[AttachmentRef]:
        attachments: list[AttachmentRef] = []
        for row in rows:
            attachment = self._row_to_attachment_ref(row)
            if attachment:
                attachments.append(attachment)
        return attachments

    def _row_to_source_document(self, row: sqlite3.Row) -> SourceDocument:
        return SourceDocument(
            id=row["id"],
            title=row["title"],
            source_type=row["source_type"],
            file_name=row["file_name"],
            source_locator=row["source_locator"],
            stored_path=row["stored_path"],
            content_hash=row["content_hash"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
            metadata=json.loads(row["metadata_json"] or "{}"),
        )

    def _missing_attachment_warnings_with_connection(self, connection: sqlite3.Connection) -> list[str]:
        rows = connection.execute(
            """
            SELECT id, file_name, source_type, source_locator, stored_path, content_hash, updated_at
            FROM source_documents
            WHERE stored_path IS NOT NULL
            ORDER BY updated_at DESC, id DESC
            """
        ).fetchall()
        return self._missing_attachment_warnings_from_rows(rows)

    def _missing_attachment_warnings_from_rows(self, rows: list[sqlite3.Row]) -> list[str]:
        warnings: list[str] = []
        for row in rows:
            attachment_path = self._attachment_path_from_row(row)
            if attachment_path.exists():
                continue
            document_label = row["file_name"] or row["id"]
            warnings.append(
                f"Missing attachment payload for {document_label} at {attachment_path.as_posix()}"
            )
        return warnings

    def _row_to_attachment_ref(self, row: sqlite3.Row) -> AttachmentRef | None:
        attachment_path = self._attachment_path_from_row(row)
        if not attachment_path.exists():
            return None
        relative_path = self._relative_attachment_path(attachment_path)
        file_name = row["file_name"] or attachment_path.name
        media_type = mimetypes.guess_type(file_name)[0]
        content_digest = sha256(attachment_path.read_bytes()).hexdigest()
        suffix = attachment_path.suffix.lower() or ".bin"
        return AttachmentRef(
            id=f"attachment:{row['id']}",
            source_document_id=row["id"],
            file_name=file_name,
            media_type=media_type,
            relative_path=relative_path,
            logical_key=f"attachment:{row['content_hash']}:{suffix}",
            content_digest=content_digest,
            byte_size=attachment_path.stat().st_size,
            updated_at=row["updated_at"],
            metadata={
                "source_content_hash": row["content_hash"],
                "source_locator": row["source_locator"],
                "source_type": row["source_type"],
                "stored_name": attachment_path.name,
            },
        )

    def _attachment_path_from_row(self, row: sqlite3.Row) -> Path:
        stored_path = Path(str(row["stored_path"]))
        if stored_path.is_absolute():
            return stored_path
        return self.database_path.parent / stored_path

    def _relative_attachment_path(self, attachment_path: Path) -> str:
        try:
            return attachment_path.relative_to(self.database_path.parent).as_posix()
        except ValueError:
            return f"files/{attachment_path.name}"

    def _list_portable_entities_with_connection(
        self,
        connection: sqlite3.Connection,
    ) -> list[PortableEntityDigest]:
        entities: list[PortableEntityDigest] = []

        source_rows = connection.execute(
            """
            SELECT id, title, source_type, file_name, source_locator, stored_path, content_hash, metadata_json, updated_at
            FROM source_documents
            ORDER BY updated_at ASC, id ASC
            """
        ).fetchall()
        for row in source_rows:
            attachment_relative_path = None
            if row["stored_path"]:
                attachment_path = self._attachment_path_from_row(row)
                if attachment_path.exists():
                    attachment_relative_path = self._relative_attachment_path(attachment_path)
            payload = {
                "attachment_relative_path": attachment_relative_path,
                "content_hash": row["content_hash"],
                "file_name": row["file_name"],
                "metadata": json.loads(row["metadata_json"] or "{}"),
                "source_locator": row["source_locator"],
                "source_type": row["source_type"],
                "title": row["title"],
            }
            entities.append(
                PortableEntityDigest(
                    entity_type="source_document",
                    entity_key=f"source_document:{row['content_hash']}",
                    entity_id=row["id"],
                    updated_at=row["updated_at"],
                    payload_digest=build_payload_digest(payload),
                    source_document_id=row["id"],
                    metadata={
                        "attachment_relative_path": attachment_relative_path,
                        "source_type": row["source_type"],
                        "title": row["title"],
                    },
                )
            )

        variant_rows = connection.execute(
            """
            SELECT id, source_document_id, mode, detail_level, generated_by, model, source_hash, view_json, updated_at
            FROM document_variants
            ORDER BY updated_at ASC, id ASC
            """
        ).fetchall()
        for row in variant_rows:
            payload = {
                "detail_level": row["detail_level"],
                "generated_by": row["generated_by"],
                "mode": row["mode"],
                "model": row["model"],
                "source_hash": row["source_hash"],
                "view": json.loads(row["view_json"]),
            }
            entities.append(
                PortableEntityDigest(
                    entity_type="document_variant",
                    entity_key=f"document_variant:{row['source_hash']}:{row['mode']}:{row['detail_level']}",
                    entity_id=row["id"],
                    updated_at=row["updated_at"],
                    payload_digest=build_payload_digest(payload),
                    source_document_id=row["source_document_id"],
                    metadata={
                        "detail_level": row["detail_level"],
                        "mode": row["mode"],
                    },
                )
            )

        session_rows = connection.execute(
            """
            SELECT
                rs.id,
                rs.source_document_id,
                sd.content_hash,
                rs.session_kind,
                rs.mode,
                rs.sentence_index,
                rs.metadata_json,
                rs.device_id,
                rs.updated_at
            FROM reading_sessions rs
            INNER JOIN source_documents sd ON sd.id = rs.source_document_id
            ORDER BY rs.updated_at ASC, rs.id ASC
            """
        ).fetchall()
        for row in session_rows:
            payload = {
                "device_id": row["device_id"],
                "metadata": json.loads(row["metadata_json"] or "{}"),
                "mode": row["mode"],
                "sentence_index": row["sentence_index"],
                "session_kind": row["session_kind"],
            }
            entities.append(
                PortableEntityDigest(
                    entity_type="reading_session",
                    entity_key=(
                        f"reading_session:{row['content_hash']}:{row['session_kind']}:{row['mode']}:{row['device_id']}"
                    ),
                    entity_id=row["id"],
                    updated_at=row["updated_at"],
                    payload_digest=build_payload_digest(payload),
                    source_document_id=row["source_document_id"],
                    metadata={
                        "device_id": row["device_id"],
                        "mode": row["mode"],
                        "session_kind": row["session_kind"],
                    },
                )
            )

        setting_rows = connection.execute(
            """
            SELECT namespace, value_json, updated_at
            FROM app_settings
            ORDER BY namespace ASC
            """
        ).fetchall()
        for row in setting_rows:
            payload = {
                "namespace": row["namespace"],
                "value": json.loads(row["value_json"] or "{}"),
            }
            entities.append(
                PortableEntityDigest(
                    entity_type="app_setting",
                    entity_key=f"app_setting:{row['namespace']}",
                    entity_id=row["namespace"],
                    updated_at=row["updated_at"],
                    payload_digest=build_payload_digest(payload),
                    metadata={"namespace": row["namespace"]},
                )
            )

        note_rows = connection.execute(
            """
            SELECT
                rn.id,
                rn.source_document_id,
                sd.content_hash,
                rn.block_id,
                rn.sentence_start,
                rn.sentence_end,
                rn.global_sentence_start,
                rn.global_sentence_end,
                rn.anchor_text,
                rn.excerpt_text,
                rn.body_text,
                rn.created_at,
                rn.updated_at
            FROM recall_notes rn
            INNER JOIN source_documents sd ON sd.id = rn.source_document_id
            ORDER BY rn.updated_at ASC, rn.id ASC
            """
        ).fetchall()
        for row in note_rows:
            identity_payload = {
                "block_id": row["block_id"],
                "created_at": row["created_at"],
                "sentence_end": row["sentence_end"],
                "sentence_start": row["sentence_start"],
                "source_document_content_hash": row["content_hash"],
            }
            payload = {
                **identity_payload,
                "anchor_text": row["anchor_text"],
                "body_text": row["body_text"],
                "excerpt_text": row["excerpt_text"],
                "global_sentence_end": row["global_sentence_end"],
                "global_sentence_start": row["global_sentence_start"],
            }
            entities.append(
                PortableEntityDigest(
                    entity_type="recall_note",
                    entity_key=f"recall_note:{build_payload_digest(identity_payload)}",
                    entity_id=row["id"],
                    updated_at=row["updated_at"],
                    payload_digest=build_payload_digest(payload),
                    source_document_id=row["source_document_id"],
                    metadata={
                        "block_id": row["block_id"],
                        "created_at": row["created_at"],
                        "excerpt_text": row["excerpt_text"],
                    },
                )
            )

        node_rows = connection.execute(
            """
            SELECT id, label, node_type, description, confidence, metadata_json, updated_at
            FROM knowledge_nodes
            ORDER BY updated_at ASC, id ASC
            """
        ).fetchall()
        for row in node_rows:
            payload = {
                "confidence": row["confidence"],
                "description": row["description"],
                "label": row["label"],
                "metadata": json.loads(row["metadata_json"] or "{}"),
                "node_type": row["node_type"],
            }
            entities.append(
                PortableEntityDigest(
                    entity_type="knowledge_node",
                    entity_key=f"knowledge_node:{row['id']}",
                    entity_id=row["id"],
                    updated_at=row["updated_at"],
                    payload_digest=build_payload_digest(payload),
                    metadata={"label": row["label"], "node_type": row["node_type"]},
                )
            )

        edge_rows = connection.execute(
            """
            SELECT id, source_id, target_id, relation_type, provenance, confidence, metadata_json, updated_at
            FROM knowledge_edges
            ORDER BY updated_at ASC, id ASC
            """
        ).fetchall()
        for row in edge_rows:
            payload = {
                "confidence": row["confidence"],
                "metadata": json.loads(row["metadata_json"] or "{}"),
                "provenance": row["provenance"],
                "relation_type": row["relation_type"],
                "source_id": row["source_id"],
                "target_id": row["target_id"],
            }
            entities.append(
                PortableEntityDigest(
                    entity_type="knowledge_edge",
                    entity_key=f"knowledge_edge:{row['id']}",
                    entity_id=row["id"],
                    updated_at=row["updated_at"],
                    payload_digest=build_payload_digest(payload),
                    metadata={"relation_type": row["relation_type"]},
                )
            )

        review_card_rows = connection.execute(
            """
            SELECT
                rc.id,
                rc.source_document_id,
                sd.content_hash,
                rc.prompt,
                rc.answer,
                rc.card_type,
                rc.source_spans_json,
                rc.scheduling_state_json,
                rc.updated_at
            FROM review_cards rc
            INNER JOIN source_documents sd ON sd.id = rc.source_document_id
            ORDER BY rc.updated_at ASC, rc.id ASC
            """
        ).fetchall()
        for row in review_card_rows:
            source_spans = json.loads(row["source_spans_json"] or "[]")
            identity_payload = {
                "answer": row["answer"],
                "card_type": row["card_type"],
                "prompt": row["prompt"],
                "source_document_content_hash": row["content_hash"],
                "source_spans": source_spans,
            }
            payload = {
                **identity_payload,
                "scheduling_state": json.loads(row["scheduling_state_json"] or "{}"),
            }
            entities.append(
                PortableEntityDigest(
                    entity_type="review_card",
                    entity_key=f"review_card:{build_payload_digest(identity_payload)}",
                    entity_id=row["id"],
                    updated_at=row["updated_at"],
                    payload_digest=build_payload_digest(payload),
                    source_document_id=row["source_document_id"],
                    metadata={"card_type": row["card_type"], "prompt": row["prompt"]},
                )
            )

        review_event_rows = connection.execute(
            """
            SELECT
                re.id,
                rc.source_document_id,
                sd.content_hash,
                rc.prompt,
                rc.answer,
                rc.card_type,
                rc.source_spans_json,
                re.rating,
                re.scheduling_state_json,
                re.reviewed_at
            FROM review_events re
            INNER JOIN review_cards rc ON rc.id = re.review_card_id
            INNER JOIN source_documents sd ON sd.id = rc.source_document_id
            ORDER BY re.reviewed_at ASC, re.id ASC
            """
        ).fetchall()
        for row in review_event_rows:
            source_spans = json.loads(row["source_spans_json"] or "[]")
            card_identity_payload = {
                "answer": row["answer"],
                "card_type": row["card_type"],
                "prompt": row["prompt"],
                "source_document_content_hash": row["content_hash"],
                "source_spans": source_spans,
            }
            card_key = f"review_card:{build_payload_digest(card_identity_payload)}"
            payload = {
                "rating": row["rating"],
                "reviewed_at": row["reviewed_at"],
                "scheduling_state": json.loads(row["scheduling_state_json"] or "{}"),
            }
            entities.append(
                PortableEntityDigest(
                    entity_type="review_event",
                    entity_key=f"review_event:{card_key}:{row['reviewed_at']}:{row['rating']}",
                    entity_id=row["id"],
                    updated_at=row["reviewed_at"],
                    payload_digest=build_payload_digest(payload),
                    source_document_id=row["source_document_id"],
                    metadata={"review_card_key": card_key, "rating": row["rating"]},
                )
            )

        entities.sort(key=lambda entity: (entity.entity_type, entity.entity_key, entity.updated_at, entity.entity_id))
        return entities

    def _mode_rows_for_document(self, connection: sqlite3.Connection, document_id: str) -> list[sqlite3.Row]:
        return connection.execute(
            """
            SELECT DISTINCT mode
            FROM document_variants
            WHERE source_document_id = ?
            ORDER BY mode
            """,
            (document_id,),
        ).fetchall()

    def _append_change_event_with_connection(
        self,
        connection: sqlite3.Connection,
        *,
        entity_type: str,
        entity_id: str,
        event_type: str,
        payload: dict[str, Any],
        created_at: str | None = None,
    ) -> ChangeEvent:
        event = ChangeEvent(
            id=new_uuid7_str(),
            entity_type=entity_type,
            entity_id=entity_id,
            event_type=event_type,
            payload=payload,
            device_id=self.device_id,
            created_at=created_at or now_iso(),
        )
        connection.execute(
            """
            INSERT INTO change_events (id, entity_type, entity_id, event_type, payload_json, device_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                event.id,
                event.entity_type,
                event.entity_id,
                event.event_type,
                json.dumps(event.payload, sort_keys=True),
                event.device_id,
                event.created_at,
            ),
        )
        return event

    def _set_meta_value_with_connection(
        self,
        connection: sqlite3.Connection,
        key: str,
        value_text: str,
        *,
        updated_at: str | None = None,
    ) -> None:
        connection.execute(
            """
            INSERT INTO workspace_meta (key, value_text, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET
                value_text = excluded.value_text,
                updated_at = excluded.updated_at
            """,
            (key, value_text, updated_at or now_iso()),
        )

    def _meta_value_with_connection(self, connection: sqlite3.Connection, key: str) -> str | None:
        row = connection.execute(
            "SELECT value_text FROM workspace_meta WHERE key = ?",
            (key,),
        ).fetchone()
        if not row:
            return None
        return str(row["value_text"])

    def _ensure_column_with_connection(
        self,
        connection: sqlite3.Connection,
        *,
        table_name: str,
        column_name: str,
        column_sql: str,
    ) -> None:
        columns = connection.execute(f"PRAGMA table_info({table_name})").fetchall()
        if any(column["name"] == column_name for column in columns):
            return
        connection.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_sql}")

    def _metadata_from_row(self, row: sqlite3.Row) -> dict[str, Any]:
        return json.loads(row["metadata_json"] or "{}")

    def _append_reason(self, existing: list[str], reason: str) -> list[str]:
        if reason in existing:
            return existing
        return [*existing, reason]

    def _first_document_title(
        self,
        connection: sqlite3.Connection,
        source_document_ids: list[str],
    ) -> str:
        if not source_document_ids:
            return "Untitled"
        placeholders = ", ".join("?" for _ in source_document_ids)
        row = connection.execute(
            f"SELECT title FROM source_documents WHERE id IN ({placeholders}) ORDER BY updated_at DESC LIMIT 1",
            tuple(source_document_ids),
        ).fetchone()
        return row["title"] if row else "Untitled"

    def _truncate_text(self, text: str, max_length: int) -> str:
        if len(text) <= max_length:
            return text
        return text[: max_length - 3].rstrip() + "..."
