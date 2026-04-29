from __future__ import annotations

from pathlib import Path
from collections import Counter
from datetime import UTC, date, datetime, timedelta
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
    LibraryCollection,
    LibraryCollectionMemoryCounts,
    LibraryCollectionHighlightReviewItem,
    LibraryCollectionOverview,
    LibraryCollectionPathItem,
    LibraryCollectionRecentActivity,
    LibraryCollectionRecentSource,
    LibraryCollectionReadingSummary,
    LibraryCollectionResumeSource,
    LibraryReadingQueueResponse,
    LibraryReadingQueueRow,
    LibraryReadingQueueScope,
    LibraryReadingQueueState,
    LibraryReadingQueueStudyCounts,
    LibraryReadingQueueSummary,
    LibrarySettings,
    LibraryCollectionStudyCounts,
    BatchImportCollectionResult,
    BatchResolvedImportFormat,
    ReaderSessionState,
    ReaderSettings,
    ReadingCompleteResult,
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
    StudyCardGenerationRequest,
    StudyCardBulkDeleteResult,
    StudyCardCreateRequest,
    StudyCardDeleteResult,
    StudyCardRecord,
    StudyCardUpdateRequest,
    StudyAnswerAttemptRecord,
    StudyAnswerAttemptRequest,
    StudyOverview,
    StudyReviewProgressDifficulty,
    StudyReviewProgress,
    StudyReviewProgressDay,
    StudyReviewGoalHistoryRow,
    StudyReviewGoalStatus,
    StudyReviewProgressRatingCount,
    StudyReviewProgressRecentReview,
    StudyReviewSessionCompleteRequest,
    StudyReviewSessionRecord,
    StudyReviewSessionStartRequest,
    StudyReviewProgressStageCount,
    StudyReviewProgressStageSnapshot,
    StudyReviewProgressSource,
    StudySettings,
    PortableEntityDigest,
    RelationEvidence,
    WorkspaceChangeLogPage,
    WorkspaceDataPayload,
    WorkspaceExportManifest,
    WorkspaceImportApplyResult,
    WorkspaceIntegrityIssue,
    WorkspaceIntegrityReport,
    WorkspaceMergeOperation,
    WorkspaceMergePreview,
    WorkspaceRepairResult,
)
from .portability import (
    WORKSPACE_DATA_ARCHIVE_PATH,
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
    GENERATED_STUDY_CARD_TYPES,
    LEXICAL_EMBEDDING_MODEL,
    build_embedding_id,
    build_initial_scheduling_state,
    build_review_card_candidates,
    build_review_card_id,
    build_sparse_vector,
    cosine_similarity,
    review_scheduling_state,
    study_card_status,
    study_knowledge_stage,
    update_study_schedule_state,
)


DEFAULT_DEVICE_ID = "desktop-local"
DEFAULT_SESSION_KIND = "reader"
SCHEMA_VERSION = "6"
STUDY_SCHEMA_VERSION = "1"
STUDY_KNOWLEDGE_STAGE_ORDER = ("new", "learning", "practiced", "confident", "mastered")
STUDY_MANUAL_CARD_TYPES = {
    "short_answer",
    "flashcard",
    "multiple_choice",
    "true_false",
    "fill_in_blank",
    "matching",
    "ordering",
}
STUDY_QUESTION_PAYLOAD_CARD_TYPES = {"multiple_choice", "true_false", "fill_in_blank", "matching", "ordering"}
STUDY_QUESTION_DIFFICULTIES = {"easy", "medium", "hard"}
STUDY_FALLBACK_DIFFICULTY_BY_TYPE = {
    "flashcard": "easy",
    "true_false": "easy",
    "multiple_choice": "medium",
    "fill_in_blank": "medium",
    "short_answer": "hard",
    "matching": "hard",
    "ordering": "hard",
}
STUDY_FILL_IN_BLANK_MARKER = "{{blank}}"
STUDY_TRUE_FALSE_CHOICES = (
    {"id": "true", "text": "True"},
    {"id": "false", "text": "False"},
)
AUTO_SELECTION_PROMPT_THRESHOLD = 0.56
AUTO_PAGE_PROMPT_THRESHOLD = 0.9
AUTO_SELECTION_RESULT_FLOOR = 0.34
AUTO_PAGE_RESULT_FLOOR = 0.42
MANUAL_RESULT_FLOOR = 0.18
STRONG_SITE_PROMPT_THRESHOLD = 0.58
INTEGRITY_STATUS_OK = "ok"
INTEGRITY_QUICK_CHECK_SKIPPED = "skipped"


def _study_scheduling_state_from_json(value: str | None) -> dict[str, Any]:
    try:
        state = json.loads(value or "{}")
    except json.JSONDecodeError:
        state = {}
    return state if isinstance(state, dict) else {}


def _study_card_is_deleted_state(scheduling_state: dict[str, Any]) -> bool:
    return bool(scheduling_state.get("deleted_at"))


def _study_card_is_manual_state(card_type: str | None, scheduling_state: dict[str, Any]) -> bool:
    return card_type in {"manual", "manual_note"} or bool(scheduling_state.get("manual_content_created_at"))


def _normalize_study_question_difficulty(value: Any) -> str | None:
    normalized = normalize_whitespace(str(value or "")).casefold()
    return normalized if normalized in STUDY_QUESTION_DIFFICULTIES else None


def _study_question_difficulty(card_type: str | None, scheduling_state: dict[str, Any]) -> str:
    manual_difficulty = _normalize_study_question_difficulty(scheduling_state.get("manual_question_difficulty"))
    if manual_difficulty:
        return manual_difficulty
    generated_difficulty = _normalize_study_question_difficulty(scheduling_state.get("generated_question_difficulty"))
    if generated_difficulty:
        return generated_difficulty
    return STUDY_FALLBACK_DIFFICULTY_BY_TYPE.get(str(card_type or ""), "medium")


def _study_question_payload_to_dict(payload: Any) -> dict[str, Any] | None:
    if payload is None:
        return None
    if hasattr(payload, "model_dump"):
        dumped = payload.model_dump(mode="json")
        return dumped if isinstance(dumped, dict) else None
    return payload if isinstance(payload, dict) else None


def _normalize_study_support_payload(payload: Any) -> dict[str, str] | None:
    if payload is None:
        return None
    if hasattr(payload, "model_dump"):
        dumped = payload.model_dump(mode="json")
        payload_dict = dumped if isinstance(dumped, dict) else {}
    else:
        payload_dict = payload if isinstance(payload, dict) else {}
    normalized: dict[str, str] = {}
    for key in ("hint", "explanation", "source_excerpt"):
        value = normalize_whitespace(str(payload_dict.get(key) or ""))
        if value:
            normalized[key] = value
    return normalized or None


def _filter_study_support_payload(
    payload: Any,
    *,
    include_hints: bool,
    include_explanations: bool,
) -> dict[str, str] | None:
    normalized = _normalize_study_support_payload(payload)
    if not normalized:
        return None
    filtered: dict[str, str] = {}
    if include_hints and normalized.get("hint"):
        filtered["hint"] = normalized["hint"]
    if include_explanations and normalized.get("explanation"):
        filtered["explanation"] = normalized["explanation"]
    if filtered and normalized.get("source_excerpt"):
        filtered["source_excerpt"] = normalized["source_excerpt"]
    return filtered or None


def _study_attempt_response_to_dict(response: Any) -> dict[str, Any]:
    if response is None:
        return {}
    if hasattr(response, "model_dump"):
        dumped = response.model_dump(mode="json")
        return dumped if isinstance(dumped, dict) else {}
    return response if isinstance(response, dict) else {}


def _study_attempt_selected_value(response: dict[str, Any], *keys: str) -> str:
    for key in keys:
        value = response.get(key)
        if value is not None:
            return normalize_whitespace(str(value))
    return ""


def _study_normalized_answer_text(value: Any) -> str:
    return normalize_whitespace(str(value or "")).casefold()


def _study_attempt_correctness(
    *,
    card_type: str,
    answer: str,
    question_payload: dict[str, Any] | None,
    response: dict[str, Any],
) -> bool | None:
    if card_type == "flashcard":
        return None

    if response.get("timed_out") is True:
        return False

    if card_type == "short_answer":
        response_text = _study_attempt_selected_value(response, "answer_text", "answer", "text", "value")
        if not response_text:
            return False
        return _study_normalized_answer_text(response_text) == _study_normalized_answer_text(answer)

    payload = question_payload if isinstance(question_payload, dict) else {}

    if card_type in {"multiple_choice", "fill_in_blank"}:
        selected_choice_id = _study_attempt_selected_value(
            response,
            "selected_choice_id",
            "choice_id",
            "answer",
            "value",
        )
        return bool(selected_choice_id) and selected_choice_id == normalize_whitespace(
            str(payload.get("correct_choice_id") or "")
        )

    if card_type == "true_false":
        selected_choice_id = _study_attempt_selected_value(
            response,
            "selected_choice_id",
            "choice_id",
            "answer",
            "value",
        ).casefold()
        if selected_choice_id in {"1", "yes"}:
            selected_choice_id = "true"
        if selected_choice_id in {"0", "no"}:
            selected_choice_id = "false"
        expected_choice_id = normalize_whitespace(str(payload.get("correct_choice_id") or answer)).casefold()
        return selected_choice_id in {"true", "false"} and selected_choice_id == expected_choice_id

    if card_type == "matching":
        raw_selections = response.get("selections")
        selections = raw_selections if isinstance(raw_selections, dict) else {}
        pairs = payload.get("pairs")
        if not isinstance(pairs, list) or not pairs:
            return False
        expected_pair_ids = [
            normalize_whitespace(str(pair.get("id") or ""))
            for pair in pairs
            if isinstance(pair, dict) and normalize_whitespace(str(pair.get("id") or ""))
        ]
        normalized_selections = {
            normalize_whitespace(str(left_id)): normalize_whitespace(str(right_id))
            for left_id, right_id in selections.items()
        }
        return bool(expected_pair_ids) and all(
            normalized_selections.get(pair_id) == pair_id for pair_id in expected_pair_ids
        )

    if card_type == "ordering":
        raw_item_ids = response.get("item_ids")
        if raw_item_ids is None:
            raw_item_ids = response.get("ordered_item_ids")
        item_ids = raw_item_ids if isinstance(raw_item_ids, list) else []
        response_ids = [normalize_whitespace(str(item_id)) for item_id in item_ids if normalize_whitespace(str(item_id))]
        items = payload.get("items")
        expected_ids: list[str] = []
        if isinstance(items, list):
            expected_ids = [
                normalize_whitespace(str(item.get("id") or ""))
                for item in items
                if isinstance(item, dict) and normalize_whitespace(str(item.get("id") or ""))
            ]
        return bool(expected_ids) and response_ids == expected_ids

    return None


def _normalize_study_choice_options(
    raw_choices: Any,
    *,
    question_label: str,
) -> list[dict[str, str]]:
    if not isinstance(raw_choices, list):
        raise ValueError(f"{question_label} cards require choices.")
    choices: list[dict[str, str]] = []
    seen_ids: set[str] = set()
    seen_texts: set[str] = set()
    for raw_choice in raw_choices:
        if not isinstance(raw_choice, dict):
            raise ValueError(f"{question_label} choices must be text options.")
        choice_id = normalize_whitespace(str(raw_choice.get("id") or ""))
        text = normalize_whitespace(str(raw_choice.get("text") or ""))
        if not choice_id or not text:
            raise ValueError(f"{question_label} choices cannot be blank.")
        normalized_text_key = text.casefold()
        if choice_id in seen_ids or normalized_text_key in seen_texts:
            raise ValueError(f"{question_label} choices must be unique.")
        seen_ids.add(choice_id)
        seen_texts.add(normalized_text_key)
        choices.append({"id": choice_id, "text": text})
    if len(choices) < 2 or len(choices) > 6:
        raise ValueError(f"{question_label} cards need 2 to 6 choices.")
    return choices


def _normalize_correct_study_choice(
    choices: list[dict[str, str]],
    correct_choice_id: Any,
    *,
    question_label: str,
) -> tuple[str, dict[str, str]]:
    normalized_choice_id = normalize_whitespace(str(correct_choice_id or ""))
    correct_choice = next((choice for choice in choices if choice["id"] == normalized_choice_id), None)
    if not correct_choice:
        raise ValueError(f"Choose one of the {question_label} options as the correct answer.")
    return normalized_choice_id, correct_choice


def _normalize_study_matching_pairs(raw_pairs: Any) -> list[dict[str, str]]:
    if not isinstance(raw_pairs, list):
        raise ValueError("Matching cards require pairs.")
    pairs: list[dict[str, str]] = []
    seen_ids: set[str] = set()
    seen_left: set[str] = set()
    seen_right: set[str] = set()
    for raw_pair in raw_pairs:
        if not isinstance(raw_pair, dict):
            raise ValueError("Matching pairs must use left and right text.")
        pair_id = normalize_whitespace(str(raw_pair.get("id") or ""))
        left = normalize_whitespace(str(raw_pair.get("left") or ""))
        right = normalize_whitespace(str(raw_pair.get("right") or ""))
        if not pair_id or not left or not right:
            raise ValueError("Matching pairs cannot be blank.")
        left_key = left.casefold()
        right_key = right.casefold()
        if pair_id in seen_ids or left_key in seen_left or right_key in seen_right:
            raise ValueError("Matching pairs must be unique.")
        seen_ids.add(pair_id)
        seen_left.add(left_key)
        seen_right.add(right_key)
        pairs.append({"id": pair_id, "left": left, "right": right})
    if len(pairs) < 2 or len(pairs) > 8:
        raise ValueError("Matching cards need 2 to 8 pairs.")
    return pairs


def _normalize_study_ordering_items(raw_items: Any) -> list[dict[str, str]]:
    if not isinstance(raw_items, list):
        raise ValueError("Ordering cards require items.")
    items: list[dict[str, str]] = []
    seen_ids: set[str] = set()
    seen_texts: set[str] = set()
    for raw_item in raw_items:
        if not isinstance(raw_item, dict):
            raise ValueError("Ordering items must be text items.")
        item_id = normalize_whitespace(str(raw_item.get("id") or ""))
        text = normalize_whitespace(str(raw_item.get("text") or ""))
        if not item_id or not text:
            raise ValueError("Ordering items cannot be blank.")
        text_key = text.casefold()
        if item_id in seen_ids or text_key in seen_texts:
            raise ValueError("Ordering items must be unique.")
        seen_ids.add(item_id)
        seen_texts.add(text_key)
        items.append({"id": item_id, "text": text})
    if len(items) < 2 or len(items) > 8:
        raise ValueError("Ordering cards need 2 to 8 items.")
    return items


def _normalize_study_question_payload(
    card_type: str,
    answer: str,
    question_payload: Any,
) -> tuple[str, dict[str, Any] | None]:
    payload = _study_question_payload_to_dict(question_payload)
    if card_type not in STUDY_QUESTION_PAYLOAD_CARD_TYPES:
        if payload is not None:
            raise ValueError("Question payloads are only supported for typed question cards.")
        return answer, None

    if card_type == "multiple_choice":
        if not payload or payload.get("kind") != "multiple_choice":
            raise ValueError("Multiple-choice cards require a multiple-choice payload.")
        choices = _normalize_study_choice_options(payload.get("choices"), question_label="Multiple-choice")
        correct_choice_id, correct_choice = _normalize_correct_study_choice(
            choices,
            payload.get("correct_choice_id"),
            question_label="multiple-choice",
        )
        return (
            correct_choice["text"],
            {
                "kind": "multiple_choice",
                "choices": choices,
                "correct_choice_id": correct_choice_id,
            },
        )

    if card_type == "fill_in_blank":
        if not payload or payload.get("kind") != "fill_in_blank":
            raise ValueError("Fill-in-the-blank cards require a fill-in-the-blank payload.")
        template = normalize_whitespace(str(payload.get("template") or ""))
        if template.count(STUDY_FILL_IN_BLANK_MARKER) != 1:
            raise ValueError("Fill-in-the-blank templates need exactly one {{blank}} marker.")
        choices = _normalize_study_choice_options(payload.get("choices"), question_label="Fill-in-the-blank")
        correct_choice_id, correct_choice = _normalize_correct_study_choice(
            choices,
            payload.get("correct_choice_id"),
            question_label="fill-in-the-blank",
        )
        return (
            correct_choice["text"],
            {
                "kind": "fill_in_blank",
                "template": template,
                "choices": choices,
                "correct_choice_id": correct_choice_id,
            },
        )

    if card_type == "matching":
        if not payload or payload.get("kind") != "matching":
            raise ValueError("Matching cards require a matching payload.")
        pairs = _normalize_study_matching_pairs(payload.get("pairs"))
        return (
            "; ".join(f"{pair['left']} -> {pair['right']}" for pair in pairs),
            {
                "kind": "matching",
                "pairs": pairs,
            },
        )

    if card_type == "ordering":
        if not payload or payload.get("kind") != "ordering":
            raise ValueError("Ordering cards require an ordering payload.")
        items = _normalize_study_ordering_items(payload.get("items"))
        return (
            "; ".join(item["text"] for item in items),
            {
                "kind": "ordering",
                "items": items,
            },
        )

    if payload is not None and payload.get("kind") != "true_false":
        raise ValueError("True/false cards require a true/false payload.")
    correct_choice_id = normalize_whitespace(
        str((payload or {}).get("correct_choice_id") or answer)
    ).casefold()
    if correct_choice_id not in {"true", "false"}:
        raise ValueError("True/false cards require True or False as the correct answer.")
    return (
        "True" if correct_choice_id == "true" else "False",
        {
            "kind": "true_false",
            "choices": list(STUDY_TRUE_FALSE_CHOICES),
            "correct_choice_id": correct_choice_id,
        },
    )


def _study_payload_texts_from_state(scheduling_state: dict[str, Any]) -> list[str]:
    payload = scheduling_state.get("manual_question_payload")
    if not isinstance(payload, dict):
        payload = scheduling_state.get("generated_question_payload")
    texts: list[str] = []
    if isinstance(payload, dict):
        template = normalize_whitespace(str(payload.get("template") or ""))
        if template:
            texts.append(template)
        raw_choices = payload.get("choices")
        if isinstance(raw_choices, list):
            for raw_choice in raw_choices:
                if not isinstance(raw_choice, dict):
                    continue
                text = normalize_whitespace(str(raw_choice.get("text") or ""))
                if text:
                    texts.append(text)
        raw_pairs = payload.get("pairs")
        if isinstance(raw_pairs, list):
            for raw_pair in raw_pairs:
                if not isinstance(raw_pair, dict):
                    continue
                left = normalize_whitespace(str(raw_pair.get("left") or ""))
                right = normalize_whitespace(str(raw_pair.get("right") or ""))
                if left:
                    texts.append(left)
                if right:
                    texts.append(right)
        raw_items = payload.get("items")
        if isinstance(raw_items, list):
            for raw_item in raw_items:
                if not isinstance(raw_item, dict):
                    continue
                text = normalize_whitespace(str(raw_item.get("text") or ""))
                if text:
                    texts.append(text)
    support_payload = scheduling_state.get("manual_question_support_payload")
    if not isinstance(support_payload, dict):
        support_payload = scheduling_state.get("generated_question_support_payload")
    if isinstance(support_payload, dict):
        for key in ("hint", "explanation", "source_excerpt"):
            text = normalize_whitespace(str(support_payload.get(key) or ""))
            if text:
                texts.append(text)
    difficulty = _study_question_difficulty(None, scheduling_state)
    if difficulty:
        texts.append(difficulty)
    return texts


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

    def find_web_document_by_url(self, page_url: str) -> DocumentRecord | None:
        with self.connect() as connection:
            row = self._find_exact_saved_page_row_with_connection(connection, page_url)
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
                    anchor_kind,
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
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    note_id,
                    anchor.kind,
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
                    "anchor_kind": anchor.kind,
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
            evidence_values = self._manual_note_evidence_values(note_row)
            source_note_span = str(note_row["anchor_kind"] or "sentence") == "source"
            source_spans = [
                {
                    "note_id": note_id,
                    "anchor_kind": note_row["anchor_kind"],
                    "block_id": note_row["block_id"],
                    "chunk_id": None if source_note_span else self._chunk_id_for_note_row_with_connection(connection, note_row),
                    "sentence_start": None if source_note_span else note_row["sentence_start"],
                    "sentence_end": None if source_note_span else note_row["sentence_end"],
                    "global_sentence_start": None if source_note_span else note_row["global_sentence_start"],
                    "global_sentence_end": None if source_note_span else note_row["global_sentence_end"],
                    "anchor_text": evidence_values["anchor_text"],
                    "excerpt": evidence_values["excerpt"],
                    "note_body": evidence_values["note_body"],
                    "source_title": evidence_values["source_title"],
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

    def build_recall_learning_pack_export(self, document_id: str) -> tuple[RecallDocumentRecord, str, str] | None:
        plain_export = self.build_recall_markdown_export(document_id)
        if not plain_export:
            return None

        document, _, source_markdown = plain_export
        with self.connect() as connection:
            source_row = connection.execute(
                "SELECT metadata_json FROM source_documents WHERE id = ?",
                (document_id,),
            ).fetchone()
            source_metadata = json.loads(source_row["metadata_json"] or "{}") if source_row else {}
            library_row = connection.execute(
                "SELECT value_json FROM app_settings WHERE namespace = 'library'",
            ).fetchone()
            library_settings = (
                self._normalize_library_settings_with_connection(
                    connection,
                    LibrarySettings.model_validate_json(library_row["value_json"]),
                )
                if library_row
                else LibrarySettings()
            )
            collection_names = self._library_collection_names_for_document_with_connection(
                library_settings,
                document_id,
            )
            note_rows = connection.execute(
                """
                SELECT *
                FROM recall_notes
                WHERE source_document_id = ?
                ORDER BY updated_at DESC, id DESC
                """,
                (document_id,),
            ).fetchall()
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
            mention_rows = connection.execute(
                """
                SELECT *
                FROM entity_mentions
                WHERE source_document_id = ?
                ORDER BY confidence DESC, text COLLATE NOCASE ASC
                """,
                (document_id,),
            ).fetchall()
            card_rows = connection.execute(
                """
                SELECT rc.*, sd.title AS document_title
                FROM review_cards rc
                INNER JOIN source_documents sd ON sd.id = rc.source_document_id
                WHERE rc.source_document_id = ?
                ORDER BY rc.updated_at DESC, rc.id ASC
                """,
                (document_id,),
            ).fetchall()

        notes = [self._row_to_recall_note_record(row) for row in note_rows]
        graph_nodes = [
            self._row_to_knowledge_node_record(row)
            for row in node_rows
            if document_id in list(self._metadata_from_row(row).get("source_document_ids", []))
        ]
        graph_nodes = [node for node in graph_nodes if node.status != "rejected"]
        graph_edges = [
            self._row_to_knowledge_edge_record(row)
            for row in edge_rows
            if document_id in list(self._metadata_from_row(row).get("source_document_ids", []))
        ]
        graph_edges = [edge for edge in graph_edges if edge.status != "rejected"]
        graph_mentions = [self._row_to_knowledge_mention_record(row) for row in mention_rows]
        study_cards = [
            self._row_to_study_card_record(row)
            for row in card_rows
            if not _study_card_is_deleted_state(_study_scheduling_state_from_json(row["scheduling_state_json"]))
        ]
        study_progress = self.get_study_review_progress(source_document_id=document_id, period_days=30, recent_limit=8)
        markdown = self._render_recall_learning_pack_markdown(
            document=document,
            source_markdown=source_markdown,
            notes=notes,
            graph_nodes=graph_nodes,
            graph_edges=graph_edges,
            graph_mentions=graph_mentions,
            study_cards=study_cards,
            study_progress=study_progress,
            source_metadata=source_metadata,
            collection_names=collection_names,
        )
        return document, self._learning_pack_filename(document), markdown

    def get_library_collection_overview(self, collection_id: str) -> LibraryCollectionOverview | None:
        with self.connect() as connection:
            settings = self.get_library_settings()
            collection_by_id = {collection.id: collection for collection in settings.custom_collections}
            collection = collection_by_id.get(collection_id)
            if not collection:
                return None

            direct_document_ids = self._valid_library_document_ids_with_connection(connection, collection.document_ids)
            aggregate_document_ids = self._library_collection_document_ids_with_connection(
                connection,
                settings,
                collection_id,
            )
            child_collection_count = sum(
                1 for candidate in settings.custom_collections if candidate.parent_id == collection_id
            )
            path_items = [
                LibraryCollectionPathItem(id=path_collection.id, name=path_collection.name)
                for path_collection in self._library_collection_path(settings, collection_id)
            ]

            source_rows: list[sqlite3.Row] = []
            note_rows: list[sqlite3.Row] = []
            card_rows: list[sqlite3.Row] = []
            session_rows: list[sqlite3.Row] = []
            reader_session_rows: list[sqlite3.Row] = []
            variant_rows: list[sqlite3.Row] = []
            if aggregate_document_ids:
                placeholders = ", ".join("?" for _ in aggregate_document_ids)
                parameters = tuple(aggregate_document_ids)
                source_rows = connection.execute(
                    f"""
                    SELECT id, title, source_type, updated_at
                    FROM source_documents
                    WHERE id IN ({placeholders})
                    ORDER BY updated_at DESC, title COLLATE NOCASE ASC
                    LIMIT 8
                    """,
                    parameters,
                ).fetchall()
                note_rows = connection.execute(
                    f"""
                    SELECT
                        rn.id,
                        rn.source_document_id,
                        rn.anchor_kind,
                        rn.anchor_text,
                        rn.excerpt_text,
                        rn.body_text,
                        rn.global_sentence_start,
                        rn.global_sentence_end,
                        rn.updated_at,
                        sd.title AS document_title
                    FROM recall_notes rn
                    INNER JOIN source_documents sd ON sd.id = rn.source_document_id
                    WHERE rn.source_document_id IN ({placeholders})
                    ORDER BY rn.updated_at DESC, rn.id DESC
                    """,
                    parameters,
                ).fetchall()
                card_rows = connection.execute(
                    f"""
                    SELECT rc.*, sd.title AS document_title
                    FROM review_cards rc
                    INNER JOIN source_documents sd ON sd.id = rc.source_document_id
                    WHERE rc.source_document_id IN ({placeholders})
                    ORDER BY rc.updated_at DESC, rc.id ASC
                    """,
                    parameters,
                ).fetchall()
                session_rows = connection.execute(
                    f"""
                    SELECT id, source_document_id, started_at, completed_at
                    FROM study_review_sessions
                    WHERE source_document_id IN ({placeholders})
                    ORDER BY started_at DESC, id DESC
                    LIMIT 8
                    """,
                    parameters,
                ).fetchall()
                reader_session_rows = connection.execute(
                    f"""
                    SELECT
                        rs.source_document_id,
                        rs.mode,
                        rs.sentence_index,
                        rs.updated_at,
                        sd.title AS document_title,
                        sd.source_type
                    FROM reading_sessions rs
                    INNER JOIN source_documents sd ON sd.id = rs.source_document_id
                    WHERE rs.source_document_id IN ({placeholders})
                        AND rs.session_kind = ?
                        AND rs.device_id = ?
                    ORDER BY rs.updated_at DESC, rs.source_document_id ASC
                    """,
                    (*parameters, DEFAULT_SESSION_KIND, self.device_id),
                ).fetchall()
                variant_rows = connection.execute(
                    f"""
                    SELECT source_document_id, mode, view_json
                    FROM document_variants
                    WHERE source_document_id IN ({placeholders})
                        AND detail_level = 'default'
                    """,
                    parameters,
                ).fetchall()

            aggregate_document_id_set = set(aggregate_document_ids)
            graph_node_count = 0
            graph_activity: list[LibraryCollectionRecentActivity] = []
            node_rows = connection.execute(
                """
                SELECT id, label, metadata_json, updated_at
                FROM knowledge_nodes
                ORDER BY updated_at DESC, label COLLATE NOCASE ASC
                """
            ).fetchall()
            for row in node_rows:
                metadata = self._metadata_from_row(row)
                if metadata.get("status") == "rejected":
                    continue
                source_ids = set(metadata.get("source_document_ids", []))
                if not source_ids.intersection(aggregate_document_id_set):
                    continue
                graph_node_count += 1
                if len(graph_activity) < 8:
                    graph_activity.append(
                        LibraryCollectionRecentActivity(
                            kind="graph_node",
                            label=row["label"],
                            source_document_id=next(iter(source_ids.intersection(aggregate_document_id_set)), None),
                            occurred_at=row["updated_at"],
                        )
                    )

            visible_cards = [
                self._row_to_study_card_record(row)
                for row in card_rows
                if not _study_card_is_deleted_state(_study_scheduling_state_from_json(row["scheduling_state_json"]))
            ]
            status_counts = Counter(card.status for card in visible_cards)
            reviewed_count = sum(1 for card in visible_cards if card.review_count > 0)

            direct_document_id_set = set(direct_document_ids)
            sentence_count_by_document_mode = {
                (row["source_document_id"], row["mode"]): self._sentence_count_from_view_json(row["view_json"])
                for row in variant_rows
            }
            latest_reader_session_by_document: dict[str, sqlite3.Row] = {}
            for row in reader_session_rows:
                document_id = row["source_document_id"]
                if document_id not in latest_reader_session_by_document:
                    latest_reader_session_by_document[document_id] = row

            resume_sources: list[LibraryCollectionResumeSource] = []
            completed_sources = 0
            in_progress_sources = 0
            last_read_at: str | None = None
            for row in latest_reader_session_by_document.values():
                document_id = row["source_document_id"]
                mode = row["mode"]
                sentence_count = sentence_count_by_document_mode.get((document_id, mode), 0)
                if sentence_count <= 0:
                    sentence_count = max(int(row["sentence_index"]) + 1, 1)
                progress_percent = min(100, max(0, round(((int(row["sentence_index"]) + 1) / sentence_count) * 100)))
                if progress_percent >= 95 or int(row["sentence_index"]) >= sentence_count - 1:
                    completed_sources += 1
                else:
                    in_progress_sources += 1
                last_read_at = max(last_read_at or row["updated_at"], row["updated_at"])
                resume_sources.append(
                    LibraryCollectionResumeSource(
                        id=document_id,
                        title=row["document_title"],
                        source_type=row["source_type"],
                        mode=mode,
                        sentence_index=row["sentence_index"],
                        sentence_count=sentence_count,
                        progress_percent=progress_percent,
                        membership="direct" if document_id in direct_document_id_set else "descendant",
                        updated_at=row["updated_at"],
                    )
                )
            resume_sources.sort(key=lambda source: source.updated_at, reverse=True)
            reading_summary = LibraryCollectionReadingSummary(
                total_sources=len(aggregate_document_ids),
                unread_sources=max(0, len(aggregate_document_ids) - len(latest_reader_session_by_document)),
                in_progress_sources=in_progress_sources,
                completed_sources=completed_sources,
                last_read_at=last_read_at,
            )
            highlight_review_items = [
                LibraryCollectionHighlightReviewItem(
                    note_id=row["id"],
                    note_kind="source" if str(row["anchor_kind"] or "sentence") == "source" else "sentence",
                    source_document_id=row["source_document_id"],
                    source_title=row["document_title"],
                    anchor_text=row["anchor_text"],
                    excerpt_preview=self._truncate_text(row["excerpt_text"], 180) or row["anchor_text"],
                    body_preview=self._truncate_text(row["body_text"], 180) if row["body_text"] else None,
                    global_sentence_start=None
                    if str(row["anchor_kind"] or "sentence") == "source"
                    else row["global_sentence_start"],
                    global_sentence_end=None
                    if str(row["anchor_kind"] or "sentence") == "source"
                    else row["global_sentence_end"],
                    membership="direct" if row["source_document_id"] in direct_document_id_set else "descendant",
                    updated_at=row["updated_at"],
                )
                for row in note_rows[:12]
            ]
            recent_sources = [
                LibraryCollectionRecentSource(
                    id=row["id"],
                    title=row["title"],
                    source_type=row["source_type"],
                    updated_at=row["updated_at"],
                    membership="direct" if row["id"] in direct_document_id_set else "descendant",
                )
                for row in source_rows
            ]
            recent_activity: list[LibraryCollectionRecentActivity] = [
                LibraryCollectionRecentActivity(
                    kind="source",
                    label=row["title"],
                    source_document_id=row["id"],
                    occurred_at=row["updated_at"],
                )
                for row in source_rows[:4]
            ]
            recent_activity.extend(
                LibraryCollectionRecentActivity(
                    kind="note",
                    label=self._truncate_text(row["body_text"], 120) or "Source note",
                    source_document_id=row["source_document_id"],
                    occurred_at=row["updated_at"],
                )
                for row in note_rows
            )
            recent_activity.extend(graph_activity)
            recent_activity.extend(
                LibraryCollectionRecentActivity(
                    kind="study_card",
                    label=card.prompt,
                    source_document_id=card.source_document_id,
                    occurred_at=str(card.scheduling_state.get("updated_at") or card.due_at),
                )
                for card in visible_cards[:8]
            )
            recent_activity.extend(
                LibraryCollectionRecentActivity(
                    kind="study_session",
                    label="Study review session",
                    source_document_id=row["source_document_id"],
                    occurred_at=row["completed_at"] or row["started_at"],
                )
                for row in session_rows
            )
            recent_activity.sort(key=lambda item: item.occurred_at, reverse=True)

        return LibraryCollectionOverview(
            id=collection.id,
            name=collection.name,
            parent_id=collection.parent_id,
            path=path_items,
            direct_document_ids=direct_document_ids,
            descendant_document_ids=aggregate_document_ids,
            direct_document_count=len(direct_document_ids),
            descendant_document_count=len(aggregate_document_ids),
            child_collection_count=child_collection_count,
            memory_counts=LibraryCollectionMemoryCounts(
                notes=len(note_rows),
                graph_nodes=graph_node_count,
                study_cards=len(visible_cards),
            ),
            study_counts=LibraryCollectionStudyCounts(
                new=status_counts.get("new", 0),
                due=status_counts.get("due", 0),
                scheduled=status_counts.get("scheduled", 0),
                unscheduled=status_counts.get("unscheduled", 0),
                reviewed=reviewed_count,
                total=len(visible_cards),
            ),
            reading_summary=reading_summary,
            resume_sources=resume_sources[:8],
            highlight_review_items=highlight_review_items,
            recent_sources=recent_sources,
            recent_activity=recent_activity[:12],
        )

    def get_library_reading_queue(
        self,
        *,
        scope: LibraryReadingQueueScope = "all",
        collection_id: str | None = None,
        state: LibraryReadingQueueState = "all",
        limit: int = 20,
    ) -> LibraryReadingQueueResponse | None:
        if scope not in {"all", "web", "documents", "captures", "untagged"}:
            raise ValueError("Unsupported reading queue scope.")
        if state not in {"all", "unread", "in_progress", "completed"}:
            raise ValueError("Unsupported reading queue state.")

        capped_limit = min(max(limit, 1), 50)
        with self.connect() as connection:
            settings = self.get_library_settings()
            collection_by_id = {collection.id: collection for collection in settings.custom_collections}
            collection_direct_document_ids: set[str] = set()
            collection_document_ids: set[str] | None = None
            if collection_id:
                collection = collection_by_id.get(collection_id)
                if not collection:
                    return None
                collection_direct_document_ids = set(
                    self._valid_library_document_ids_with_connection(connection, collection.document_ids)
                )
                collection_document_ids = set(
                    self._library_collection_document_ids_with_connection(connection, settings, collection_id)
                )

            source_rows = connection.execute(
                """
                SELECT id, title, source_type, updated_at
                FROM source_documents
                ORDER BY updated_at DESC, title COLLATE NOCASE ASC
                """
            ).fetchall()
            all_document_ids = [row["id"] for row in source_rows]
            tagged_document_ids = {
                document_id
                for collection in settings.custom_collections
                for document_id in self._valid_library_document_ids_with_connection(connection, collection.document_ids)
            }

            def row_matches_scope(row: sqlite3.Row) -> bool:
                if collection_document_ids is not None:
                    return row["id"] in collection_document_ids
                source_type = str(row["source_type"] or "").lower()
                if scope == "web":
                    return source_type == "web"
                if scope == "captures":
                    return source_type == "paste"
                if scope == "documents":
                    return source_type not in {"web", "paste"}
                if scope == "untagged":
                    return row["id"] not in tagged_document_ids
                return True

            scoped_source_rows = [row for row in source_rows if row_matches_scope(row)]
            scoped_document_ids = [row["id"] for row in scoped_source_rows]
            if not scoped_document_ids:
                return LibraryReadingQueueResponse(
                    scope=scope,
                    state=state,
                    collection_id=collection_id,
                    summary=LibraryReadingQueueSummary(),
                    rows=[],
                )

            placeholders = ", ".join("?" for _ in scoped_document_ids)
            parameters = tuple(scoped_document_ids)
            variant_rows = connection.execute(
                f"""
                SELECT source_document_id, mode, view_json
                FROM document_variants
                WHERE source_document_id IN ({placeholders})
                    AND detail_level = 'default'
                """,
                parameters,
            ).fetchall()
            session_rows = connection.execute(
                f"""
                SELECT source_document_id, mode, sentence_index, updated_at
                FROM reading_sessions
                WHERE source_document_id IN ({placeholders})
                    AND session_kind = ?
                    AND device_id = ?
                ORDER BY updated_at DESC, source_document_id ASC
                """,
                (*parameters, DEFAULT_SESSION_KIND, self.device_id),
            ).fetchall()
            note_rows = connection.execute(
                f"""
                SELECT
                    source_document_id,
                    COUNT(*) AS note_count,
                    SUM(CASE WHEN COALESCE(anchor_kind, 'sentence') = 'source' THEN 0 ELSE 1 END) AS highlight_count
                FROM recall_notes
                WHERE source_document_id IN ({placeholders})
                GROUP BY source_document_id
                """,
                parameters,
            ).fetchall()
            card_rows = connection.execute(
                f"""
                SELECT rc.*, sd.title AS document_title
                FROM review_cards rc
                INNER JOIN source_documents sd ON sd.id = rc.source_document_id
                WHERE rc.source_document_id IN ({placeholders})
                ORDER BY rc.updated_at DESC, rc.id ASC
                """,
                parameters,
            ).fetchall()

            sentence_count_by_document_mode = {
                (row["source_document_id"], row["mode"]): self._sentence_count_from_view_json(row["view_json"])
                for row in variant_rows
            }
            modes_by_document: dict[str, list[str]] = {}
            for row in variant_rows:
                modes_by_document.setdefault(row["source_document_id"], []).append(row["mode"])
            latest_session_by_document: dict[str, sqlite3.Row] = {}
            for row in session_rows:
                latest_session_by_document.setdefault(row["source_document_id"], row)
            note_counts = {
                row["source_document_id"]: {
                    "note_count": int(row["note_count"] or 0),
                    "highlight_count": int(row["highlight_count"] or 0),
                }
                for row in note_rows
            }
            study_counts_by_document: dict[str, Counter[str]] = {}
            for row in card_rows:
                card = self._row_to_study_card_record(row)
                if _study_card_is_deleted_state(card.scheduling_state):
                    continue
                study_counts_by_document.setdefault(card.source_document_id, Counter())[card.status] += 1

            collection_paths_by_document: dict[str, list[list[LibraryCollectionPathItem]]] = {document_id: [] for document_id in all_document_ids}
            for collection in settings.custom_collections:
                path = [
                    LibraryCollectionPathItem(id=path_collection.id, name=path_collection.name)
                    for path_collection in self._library_collection_path(settings, collection.id)
                ]
                for document_id in self._valid_library_document_ids_with_connection(connection, collection.document_ids):
                    collection_paths_by_document.setdefault(document_id, []).append(path)

            rows: list[LibraryReadingQueueRow] = []
            for row in scoped_source_rows:
                document_id = row["id"]
                latest_session = latest_session_by_document.get(document_id)
                available_modes = modes_by_document.get(document_id, [])
                mode = (
                    latest_session["mode"]
                    if latest_session is not None and latest_session["mode"] in available_modes
                    else "reflowed"
                    if "reflowed" in available_modes
                    else "original"
                    if "original" in available_modes
                    else available_modes[0]
                    if available_modes
                    else "original"
                )
                sentence_count = sentence_count_by_document_mode.get((document_id, mode), 0)
                if sentence_count <= 0:
                    sentence_count = max(int(latest_session["sentence_index"]) + 1, 1) if latest_session else 1
                sentence_index = int(latest_session["sentence_index"]) if latest_session else 0
                progress_percent = (
                    min(100, max(0, round(((sentence_index + 1) / sentence_count) * 100)))
                    if latest_session
                    else 0
                )
                if latest_session is None:
                    row_state: LibraryReadingQueueState = "unread"
                elif progress_percent >= 95 or sentence_index >= sentence_count - 1:
                    row_state = "completed"
                else:
                    row_state = "in_progress"
                note_count = note_counts.get(document_id, {}).get("note_count", 0)
                highlight_count = note_counts.get(document_id, {}).get("highlight_count", 0)
                study_counter = study_counts_by_document.get(document_id, Counter())
                rows.append(
                    LibraryReadingQueueRow(
                        id=document_id,
                        title=row["title"],
                        source_type=row["source_type"],
                        state=row_state,  # type: ignore[arg-type]
                        mode=mode,  # type: ignore[arg-type]
                        sentence_index=sentence_index,
                        sentence_count=sentence_count,
                        progress_percent=progress_percent,
                        last_read_at=latest_session["updated_at"] if latest_session else None,
                        updated_at=row["updated_at"],
                        membership=(
                            "direct"
                            if collection_id and document_id in collection_direct_document_ids
                            else "descendant"
                            if collection_id
                            else None
                        ),
                        collection_paths=collection_paths_by_document.get(document_id, []),
                        note_count=note_count,
                        highlight_count=highlight_count,
                        study_counts=LibraryReadingQueueStudyCounts(
                            new=study_counter.get("new", 0),
                            due=study_counter.get("due", 0),
                            total=sum(study_counter.values()),
                        ),
                    )
                )

        summary_counts = Counter(row.state for row in rows)
        summary = LibraryReadingQueueSummary(
            total_sources=len(rows),
            unread_sources=summary_counts.get("unread", 0),
            in_progress_sources=summary_counts.get("in_progress", 0),
            completed_sources=summary_counts.get("completed", 0),
        )
        filtered_rows = [row for row in rows if state == "all" or row.state == state]
        state_priority = {"in_progress": 0, "unread": 1, "completed": 2}
        filtered_rows.sort(
            key=lambda row: (
                state_priority[row.state],
                row.last_read_at or row.updated_at,
                row.title.lower(),
            ),
            reverse=False,
        )
        return LibraryReadingQueueResponse(
            scope=scope,
            state=state,
            collection_id=collection_id,
            summary=summary,
            rows=filtered_rows[:capped_limit],
        )

    def complete_document_reading(self, document_id: str, mode: str | None = None) -> ReadingCompleteResult | None:
        document = self.get_document(document_id)
        if not document:
            return None

        with self.connect() as connection:
            variant_rows = connection.execute(
                """
                SELECT mode, view_json
                FROM document_variants
                WHERE source_document_id = ?
                    AND detail_level = 'default'
                """,
                (document_id,),
            ).fetchall()
            if not variant_rows:
                raise ValueError("Document has no readable view to complete.")
            view_by_mode = {row["mode"]: row["view_json"] for row in variant_rows}
            selected_mode = mode
            if selected_mode is None:
                latest_session = connection.execute(
                    """
                    SELECT mode
                    FROM reading_sessions
                    WHERE source_document_id = ?
                        AND session_kind = ?
                        AND device_id = ?
                    ORDER BY updated_at DESC
                    LIMIT 1
                    """,
                    (document_id, DEFAULT_SESSION_KIND, self.device_id),
                ).fetchone()
                if latest_session and latest_session["mode"] in view_by_mode:
                    selected_mode = latest_session["mode"]
                elif "reflowed" in view_by_mode:
                    selected_mode = "reflowed"
                elif "original" in view_by_mode:
                    selected_mode = "original"
                else:
                    selected_mode = next(iter(view_by_mode))
            if selected_mode not in view_by_mode:
                raise ValueError("Requested reading mode is unavailable for this source.")
            sentence_count = self._sentence_count_from_view_json(view_by_mode[selected_mode])
            sentence_count = max(sentence_count, 1)
            sentence_index = max(sentence_count - 1, 0)

        self.save_progress(document_id, selected_mode, sentence_index)
        return ReadingCompleteResult(
            document_id=document_id,
            mode=selected_mode,  # type: ignore[arg-type]
            sentence_index=sentence_index,
            sentence_count=sentence_count,
            completed_at=now_iso(),
        )

    def build_library_collection_learning_export(self, collection_id: str) -> tuple[str, bytes] | None:
        overview = self.get_library_collection_overview(collection_id)
        if not overview:
            return None

        warnings: list[str] = []
        exported_at = now_iso()
        archive_buffer = BytesIO()
        with ZipFile(archive_buffer, "w", ZIP_DEFLATED) as archive:
            exported_sources: list[dict[str, Any]] = []
            for document_id in overview.descendant_document_ids:
                export_payload = self.build_recall_learning_pack_export(document_id)
                if not export_payload:
                    warnings.append(f"Source {document_id} could not be exported.")
                    continue
                document, _, markdown = export_payload
                archive_path = self._learning_pack_archive_path(document)
                archive.writestr(archive_path, markdown)
                exported_sources.append(
                    {
                        "id": document.id,
                        "title": document.title,
                        "source_type": document.source_type,
                        "path": archive_path,
                    }
                )
            if not exported_sources:
                warnings.append("Collection has no sources to export.")
            manifest = {
                "exported_at": exported_at,
                "collection": {
                    "id": overview.id,
                    "name": overview.name,
                    "parent_id": overview.parent_id,
                    "path": [item.name for item in overview.path],
                    "direct_document_count": overview.direct_document_count,
                    "descendant_document_count": overview.descendant_document_count,
                },
                "source_count": len(exported_sources),
                "sources": exported_sources,
                "warnings": warnings,
            }
            archive.writestr("collection-manifest.json", json.dumps(manifest, indent=2, sort_keys=True))

        filename = build_export_filename(f"{overview.name} collection learning pack")
        stem = filename[:-3] if filename.endswith(".md") else filename
        return f"{stem}.zip", archive_buffer.getvalue()

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
            warnings = [
                *self._missing_attachment_warnings_from_rows(attachment_rows),
                *self._missing_learning_pack_view_warnings_with_connection(connection),
            ]

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

    def build_workspace_data_payload(self, exported_at: str | None = None) -> WorkspaceDataPayload:
        payload_exported_at = exported_at or now_iso()
        with self.connect() as connection:
            schema_version = self._meta_value_with_connection(connection, "schema_version") or SCHEMA_VERSION
            entity_key_lookup = {
                (entity.entity_type, entity.entity_id): entity.entity_key
                for entity in self._list_portable_entities_with_connection(connection)
            }

            def rows_for_table(table_name: str, order_by: str) -> list[dict[str, Any]]:
                return [
                    dict(row)
                    for row in connection.execute(
                        f"SELECT * FROM {table_name} ORDER BY {order_by}"
                    ).fetchall()
                ]

            source_documents = rows_for_table("source_documents", "updated_at ASC, id ASC")
            for row in source_documents:
                row["_entity_key"] = entity_key_lookup.get(("source_document", str(row["id"])))
                row["attachment_relative_path"] = None
                if row.get("stored_path"):
                    attachment_path = self._attachment_path_from_row_mapping(row)
                    if attachment_path.exists():
                        row["attachment_relative_path"] = self._relative_attachment_path(attachment_path)

            document_variants = rows_for_table("document_variants", "updated_at ASC, id ASC")
            for row in document_variants:
                row["_entity_key"] = entity_key_lookup.get(("document_variant", str(row["id"])))

            reading_sessions = rows_for_table("reading_sessions", "updated_at ASC, id ASC")
            for row in reading_sessions:
                row["_entity_key"] = entity_key_lookup.get(("reading_session", str(row["id"])))

            app_settings = rows_for_table("app_settings", "namespace ASC")
            for row in app_settings:
                row["_entity_key"] = entity_key_lookup.get(("app_setting", str(row["namespace"])))

            recall_notes = rows_for_table("recall_notes", "updated_at ASC, id ASC")
            for row in recall_notes:
                row["_entity_key"] = entity_key_lookup.get(("recall_note", str(row["id"])))

            knowledge_nodes = rows_for_table("knowledge_nodes", "updated_at ASC, id ASC")
            for row in knowledge_nodes:
                row["_entity_key"] = entity_key_lookup.get(("knowledge_node", str(row["id"])))

            knowledge_edges = rows_for_table("knowledge_edges", "updated_at ASC, id ASC")
            for row in knowledge_edges:
                row["_entity_key"] = entity_key_lookup.get(("knowledge_edge", str(row["id"])))

            review_cards = rows_for_table("review_cards", "updated_at ASC, id ASC")
            for row in review_cards:
                row["_entity_key"] = entity_key_lookup.get(("review_card", str(row["id"])))

            review_events = rows_for_table("review_events", "reviewed_at ASC, id ASC")
            for row in review_events:
                row["_entity_key"] = entity_key_lookup.get(("review_event", str(row["id"])))

            study_answer_attempts = rows_for_table("study_answer_attempts", "attempted_at ASC, id ASC")
            for row in study_answer_attempts:
                row["_entity_key"] = entity_key_lookup.get(("study_answer_attempt", str(row["id"])))

            study_review_sessions = rows_for_table("study_review_sessions", "started_at ASC, id ASC")
            for row in study_review_sessions:
                row["_entity_key"] = entity_key_lookup.get(("study_review_session", str(row["id"])))

            content_chunks = rows_for_table("content_chunks", "source_document_id ASC, ordinal ASC, id ASC")

        return WorkspaceDataPayload(
            format_version=WORKSPACE_EXPORT_FORMAT_VERSION,
            schema_version=str(schema_version),
            device_id=self.device_id,
            exported_at=payload_exported_at,
            source_documents=source_documents,
            document_variants=document_variants,
            content_chunks=content_chunks,
            reading_sessions=reading_sessions,
            app_settings=app_settings,
            recall_notes=recall_notes,
            knowledge_nodes=knowledge_nodes,
            knowledge_edges=knowledge_edges,
            review_cards=review_cards,
            review_events=review_events,
            study_answer_attempts=study_answer_attempts,
            study_review_sessions=study_review_sessions,
        )

    def build_workspace_export_bundle(self) -> tuple[str, bytes]:
        manifest = self.build_workspace_export_manifest()
        data_payload = self.build_workspace_data_payload(exported_at=manifest.exported_at)
        bundle = BytesIO()
        with ZipFile(bundle, "w", compression=ZIP_DEFLATED) as archive:
            archive.writestr("manifest.json", manifest.model_dump_json(indent=2))
            archive.writestr(WORKSPACE_DATA_ARCHIVE_PATH, data_payload.model_dump_json(indent=2))
            for document in self.list_recall_documents():
                learning_export = self.build_recall_learning_pack_export(document.id)
                if not learning_export:
                    continue
                learning_document, _, markdown = learning_export
                archive.writestr(self._learning_pack_archive_path(learning_document), markdown)
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

    def apply_workspace_import(
        self,
        *,
        manifest: WorkspaceExportManifest,
        data_payload: WorkspaceDataPayload,
        attachment_payloads: dict[str, bytes],
    ) -> WorkspaceImportApplyResult:
        preview = self.preview_workspace_merge(manifest)
        importable_keys = {
            (operation.entity_type, operation.entity_key)
            for operation in preview.operations
            if operation.decision == "import_remote"
        }
        imported_counts: Counter[str] = Counter()
        skipped_counts: Counter[str] = Counter()
        conflict_counts: Counter[str] = Counter()
        warnings: list[str] = list(manifest.warnings)
        source_id_map: dict[str, str] = {}
        variant_id_map: dict[str, str | None] = {}
        review_card_id_map: dict[str, str] = {}
        review_event_id_map: dict[str, str] = {}
        study_session_id_map: dict[str, str] = {}

        def entity_key(row: dict[str, Any]) -> str | None:
            value = row.get("_entity_key")
            return str(value) if value else None

        def is_importable(entity_type: str, row: dict[str, Any]) -> bool:
            key = entity_key(row)
            return bool(key and (entity_type, key) in importable_keys)

        def row_id(row: dict[str, Any]) -> str:
            return str(row.get("id") or "")

        def row_text(row: dict[str, Any], key: str, default: str = "") -> str:
            value = row.get(key)
            return str(value) if value is not None else default

        def row_optional_text(row: dict[str, Any], key: str) -> str | None:
            value = row.get(key)
            return str(value) if value is not None else None

        def row_int(row: dict[str, Any], key: str, default: int = 0) -> int:
            try:
                return int(row.get(key, default))
            except (TypeError, ValueError):
                return default

        def row_float(row: dict[str, Any], key: str) -> float | None:
            value = row.get(key)
            if value is None:
                return None
            try:
                return float(value)
            except (TypeError, ValueError):
                return None

        with self.connect() as connection:
            for row in data_payload.source_documents:
                remote_id = row_id(row)
                content_hash = row_text(row, "content_hash")
                if not remote_id or not content_hash:
                    conflict_counts["source_document"] += 1
                    continue
                existing_by_hash = connection.execute(
                    "SELECT id FROM source_documents WHERE content_hash = ?",
                    (content_hash,),
                ).fetchone()
                if existing_by_hash:
                    source_id_map[remote_id] = existing_by_hash["id"]
                    skipped_counts["source_document"] += 1
                    continue
                if not is_importable("source_document", row):
                    skipped_counts["source_document"] += 1
                    continue
                local_id = remote_id
                if connection.execute("SELECT 1 FROM source_documents WHERE id = ?", (local_id,)).fetchone():
                    local_id = new_uuid7_str()
                attachment_relative_path = row_optional_text(row, "attachment_relative_path")
                stored_path = None
                if attachment_relative_path:
                    stored_path = self._restore_workspace_attachment_file(
                        attachment_relative_path,
                        attachment_payloads.get(attachment_relative_path),
                        warnings,
                    )
                connection.execute(
                    """
                    INSERT INTO source_documents (
                        id, title, source_type, file_name, source_locator, stored_path,
                        content_hash, metadata_json, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        local_id,
                        row_text(row, "title", "Untitled"),
                        row_text(row, "source_type", "imported"),
                        row_optional_text(row, "file_name"),
                        row_optional_text(row, "source_locator"),
                        stored_path,
                        content_hash,
                        row_text(row, "metadata_json", "{}"),
                        row_text(row, "created_at", now_iso()),
                        row_text(row, "updated_at", now_iso()),
                    ),
                )
                source_id_map[remote_id] = local_id
                imported_counts["source_document"] += 1

            attachment_operations = {
                operation.remote_entity_id: operation
                for operation in preview.operations
                if operation.entity_type == "attachment" and operation.decision == "import_remote"
            }
            for attachment in manifest.attachments:
                if attachment.id not in attachment_operations:
                    skipped_counts["attachment"] += 1
                    continue
                local_source_id = source_id_map.get(attachment.source_document_id)
                if not local_source_id or not attachment.relative_path:
                    conflict_counts["attachment"] += 1
                    continue
                restored_path = self._restore_workspace_attachment_file(
                    attachment.relative_path,
                    attachment_payloads.get(attachment.relative_path),
                    warnings,
                )
                if not restored_path:
                    conflict_counts["attachment"] += 1
                    continue
                connection.execute(
                    """
                    UPDATE source_documents
                    SET stored_path = COALESCE(stored_path, ?)
                    WHERE id = ?
                    """,
                    (restored_path, local_source_id),
                )
                imported_counts["attachment"] += 1

            for row in data_payload.document_variants:
                remote_id = row_id(row)
                local_source_id = source_id_map.get(row_text(row, "source_document_id"))
                if not remote_id or not local_source_id:
                    conflict_counts["document_variant"] += 1
                    continue
                mode = row_text(row, "mode")
                detail_level = row_text(row, "detail_level", "default")
                existing = connection.execute(
                    """
                    SELECT id
                    FROM document_variants
                    WHERE source_document_id = ? AND mode = ? AND detail_level = ?
                    """,
                    (local_source_id, mode, detail_level),
                ).fetchone()
                if existing:
                    variant_id_map[remote_id] = existing["id"]
                    skipped_counts["document_variant"] += 1
                    continue
                if not is_importable("document_variant", row):
                    skipped_counts["document_variant"] += 1
                    continue
                local_id = remote_id
                if connection.execute("SELECT 1 FROM document_variants WHERE id = ?", (local_id,)).fetchone():
                    local_id = new_uuid7_str()
                connection.execute(
                    """
                    INSERT INTO document_variants (
                        id, source_document_id, mode, detail_level, generated_by, model,
                        source_hash, view_json, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        local_id,
                        local_source_id,
                        mode,
                        detail_level,
                        row_text(row, "generated_by", "local"),
                        row_optional_text(row, "model"),
                        row_text(row, "source_hash"),
                        row_text(row, "view_json", "{}"),
                        row_text(row, "created_at", now_iso()),
                        row_text(row, "updated_at", now_iso()),
                    ),
                )
                variant_id_map[remote_id] = local_id
                imported_counts["document_variant"] += 1

            for row in data_payload.content_chunks:
                remote_id = row_id(row)
                if not remote_id:
                    conflict_counts["content_chunk"] += 1
                    continue
                if connection.execute("SELECT 1 FROM content_chunks WHERE id = ?", (remote_id,)).fetchone():
                    skipped_counts["content_chunk"] += 1
                    continue
                local_source_id = source_id_map.get(row_text(row, "source_document_id"))
                remote_variant_id = row_optional_text(row, "variant_id")
                local_variant_id = variant_id_map.get(remote_variant_id or "", None) if remote_variant_id else None
                if not local_source_id or (remote_variant_id and not local_variant_id):
                    conflict_counts["content_chunk"] += 1
                    continue
                connection.execute(
                    """
                    INSERT INTO content_chunks (
                        id, source_document_id, variant_id, block_id, ordinal, text,
                        metadata_json, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        remote_id,
                        local_source_id,
                        local_variant_id,
                        row_optional_text(row, "block_id"),
                        row_int(row, "ordinal"),
                        row_text(row, "text"),
                        row_text(row, "metadata_json", "{}"),
                        row_text(row, "created_at", now_iso()),
                        row_text(row, "updated_at", now_iso()),
                    ),
                )
                imported_counts["content_chunk"] += 1

            for row in data_payload.reading_sessions:
                remote_id = row_id(row)
                local_source_id = source_id_map.get(row_text(row, "source_document_id"))
                if not remote_id or not local_source_id:
                    conflict_counts["reading_session"] += 1
                    continue
                if connection.execute(
                    """
                    SELECT 1
                    FROM reading_sessions
                    WHERE source_document_id = ? AND session_kind = ? AND mode = ? AND device_id = ?
                    """,
                    (
                        local_source_id,
                        row_text(row, "session_kind", DEFAULT_SESSION_KIND),
                        row_text(row, "mode", "reflowed"),
                        row_text(row, "device_id", self.device_id),
                    ),
                ).fetchone():
                    skipped_counts["reading_session"] += 1
                    continue
                if not is_importable("reading_session", row):
                    skipped_counts["reading_session"] += 1
                    continue
                local_id = remote_id
                if connection.execute("SELECT 1 FROM reading_sessions WHERE id = ?", (local_id,)).fetchone():
                    local_id = new_uuid7_str()
                connection.execute(
                    """
                    INSERT INTO reading_sessions (
                        id, source_document_id, session_kind, mode, sentence_index,
                        metadata_json, device_id, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        local_id,
                        local_source_id,
                        row_text(row, "session_kind", DEFAULT_SESSION_KIND),
                        row_text(row, "mode", "reflowed"),
                        row_int(row, "sentence_index"),
                        row_text(row, "metadata_json", "{}"),
                        row_text(row, "device_id", self.device_id),
                        row_text(row, "created_at", now_iso()),
                        row_text(row, "updated_at", now_iso()),
                    ),
                )
                imported_counts["reading_session"] += 1

            for row in data_payload.app_settings:
                namespace = row_text(row, "namespace")
                if not namespace:
                    conflict_counts["app_setting"] += 1
                    continue
                if connection.execute("SELECT 1 FROM app_settings WHERE namespace = ?", (namespace,)).fetchone():
                    skipped_counts["app_setting"] += 1
                    continue
                if not is_importable("app_setting", row):
                    skipped_counts["app_setting"] += 1
                    continue
                connection.execute(
                    "INSERT INTO app_settings (namespace, value_json, updated_at) VALUES (?, ?, ?)",
                    (namespace, row_text(row, "value_json", "{}"), row_text(row, "updated_at", now_iso())),
                )
                imported_counts["app_setting"] += 1

            for row in data_payload.recall_notes:
                remote_id = row_id(row)
                local_source_id = source_id_map.get(row_text(row, "source_document_id"))
                local_variant_id = variant_id_map.get(row_text(row, "variant_id"))
                if not remote_id or not local_source_id or not local_variant_id:
                    conflict_counts["recall_note"] += 1
                    continue
                if not is_importable("recall_note", row):
                    skipped_counts["recall_note"] += 1
                    continue
                local_id = remote_id
                if connection.execute("SELECT 1 FROM recall_notes WHERE id = ?", (local_id,)).fetchone():
                    local_id = new_uuid7_str()
                connection.execute(
                    """
                    INSERT INTO recall_notes (
                        id, anchor_kind, source_document_id, variant_id, block_id,
                        sentence_start, sentence_end, global_sentence_start, global_sentence_end,
                        anchor_text, excerpt_text, body_text, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        local_id,
                        row_text(row, "anchor_kind", "sentence"),
                        local_source_id,
                        local_variant_id,
                        row_text(row, "block_id"),
                        row_int(row, "sentence_start"),
                        row_int(row, "sentence_end"),
                        row_int(row, "global_sentence_start"),
                        row_int(row, "global_sentence_end"),
                        row_text(row, "anchor_text"),
                        row_text(row, "excerpt_text"),
                        row_optional_text(row, "body_text"),
                        row_text(row, "created_at", now_iso()),
                        row_text(row, "updated_at", now_iso()),
                    ),
                )
                imported_counts["recall_note"] += 1

            for row in data_payload.knowledge_nodes:
                remote_id = row_id(row)
                if not remote_id:
                    conflict_counts["knowledge_node"] += 1
                    continue
                if connection.execute("SELECT 1 FROM knowledge_nodes WHERE id = ?", (remote_id,)).fetchone():
                    skipped_counts["knowledge_node"] += 1
                    continue
                if not is_importable("knowledge_node", row):
                    skipped_counts["knowledge_node"] += 1
                    continue
                connection.execute(
                    """
                    INSERT INTO knowledge_nodes (
                        id, label, node_type, description, confidence, metadata_json, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        remote_id,
                        row_text(row, "label"),
                        row_text(row, "node_type", "concept"),
                        row_optional_text(row, "description"),
                        row_float(row, "confidence"),
                        row_text(row, "metadata_json", "{}"),
                        row_text(row, "created_at", now_iso()),
                        row_text(row, "updated_at", now_iso()),
                    ),
                )
                imported_counts["knowledge_node"] += 1

            for row in data_payload.knowledge_edges:
                remote_id = row_id(row)
                if not remote_id:
                    conflict_counts["knowledge_edge"] += 1
                    continue
                if connection.execute("SELECT 1 FROM knowledge_edges WHERE id = ?", (remote_id,)).fetchone():
                    skipped_counts["knowledge_edge"] += 1
                    continue
                if not is_importable("knowledge_edge", row):
                    skipped_counts["knowledge_edge"] += 1
                    continue
                source_node_exists = connection.execute(
                    "SELECT 1 FROM knowledge_nodes WHERE id = ?",
                    (row_text(row, "source_id"),),
                ).fetchone()
                target_node_exists = connection.execute(
                    "SELECT 1 FROM knowledge_nodes WHERE id = ?",
                    (row_text(row, "target_id"),),
                ).fetchone()
                if not source_node_exists or not target_node_exists:
                    conflict_counts["knowledge_edge"] += 1
                    continue
                connection.execute(
                    """
                    INSERT INTO knowledge_edges (
                        id, source_id, target_id, relation_type, provenance, confidence,
                        metadata_json, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        remote_id,
                        row_text(row, "source_id"),
                        row_text(row, "target_id"),
                        row_text(row, "relation_type", "related"),
                        row_text(row, "provenance", "inferred"),
                        row_float(row, "confidence"),
                        row_text(row, "metadata_json", "{}"),
                        row_text(row, "created_at", now_iso()),
                        row_text(row, "updated_at", now_iso()),
                    ),
                )
                imported_counts["knowledge_edge"] += 1

            for row in data_payload.review_cards:
                remote_id = row_id(row)
                local_source_id = source_id_map.get(row_text(row, "source_document_id"))
                if not remote_id or not local_source_id:
                    conflict_counts["review_card"] += 1
                    continue
                if not is_importable("review_card", row):
                    skipped_counts["review_card"] += 1
                    continue
                local_id = remote_id
                if connection.execute("SELECT 1 FROM review_cards WHERE id = ?", (local_id,)).fetchone():
                    local_id = new_uuid7_str()
                connection.execute(
                    """
                    INSERT INTO review_cards (
                        id, source_document_id, prompt, answer, card_type, source_spans_json,
                        scheduling_state_json, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        local_id,
                        local_source_id,
                        row_text(row, "prompt"),
                        row_text(row, "answer"),
                        row_text(row, "card_type", "short_answer"),
                        row_text(row, "source_spans_json", "[]"),
                        row_text(row, "scheduling_state_json", "{}"),
                        row_text(row, "created_at", now_iso()),
                        row_text(row, "updated_at", now_iso()),
                    ),
                )
                review_card_id_map[remote_id] = local_id
                imported_counts["review_card"] += 1

            for row in data_payload.review_events:
                remote_id = row_id(row)
                local_card_id = review_card_id_map.get(row_text(row, "review_card_id"))
                if not local_card_id:
                    existing_card_id = row_text(row, "review_card_id")
                    if connection.execute("SELECT 1 FROM review_cards WHERE id = ?", (existing_card_id,)).fetchone():
                        local_card_id = existing_card_id
                if not remote_id or not local_card_id:
                    conflict_counts["review_event"] += 1
                    continue
                if not is_importable("review_event", row):
                    skipped_counts["review_event"] += 1
                    continue
                local_id = remote_id
                if connection.execute("SELECT 1 FROM review_events WHERE id = ?", (local_id,)).fetchone():
                    local_id = new_uuid7_str()
                connection.execute(
                    """
                    INSERT INTO review_events (
                        id, review_card_id, rating, scheduling_state_json, reviewed_at, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        local_id,
                        local_card_id,
                        row_int(row, "rating"),
                        row_text(row, "scheduling_state_json", "{}"),
                        row_text(row, "reviewed_at", now_iso()),
                        row_text(row, "created_at", now_iso()),
                    ),
                )
                review_event_id_map[remote_id] = local_id
                imported_counts["review_event"] += 1

            for row in data_payload.study_review_sessions:
                remote_id = row_id(row)
                if not remote_id:
                    conflict_counts["study_review_session"] += 1
                    continue
                if not is_importable("study_review_session", row):
                    skipped_counts["study_review_session"] += 1
                    continue
                local_source_id = None
                remote_source_id = row_optional_text(row, "source_document_id")
                if remote_source_id:
                    local_source_id = source_id_map.get(remote_source_id)
                    if not local_source_id:
                        conflict_counts["study_review_session"] += 1
                        continue
                local_id = remote_id
                if connection.execute("SELECT 1 FROM study_review_sessions WHERE id = ?", (local_id,)).fetchone():
                    local_id = new_uuid7_str()
                card_ids = self._restore_json_id_list(row_text(row, "card_ids_json", "[]"), review_card_id_map)
                connection.execute(
                    """
                    INSERT INTO study_review_sessions (
                        id, source_document_id, filter_snapshot_json, settings_snapshot_json,
                        card_ids_json, started_at, completed_at, summary_json, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        local_id,
                        local_source_id,
                        row_text(row, "filter_snapshot_json", "{}"),
                        row_text(row, "settings_snapshot_json", "{}"),
                        json.dumps(card_ids),
                        row_text(row, "started_at", now_iso()),
                        row_optional_text(row, "completed_at"),
                        row_text(row, "summary_json", "{}"),
                        row_text(row, "created_at", now_iso()),
                        row_text(row, "updated_at", now_iso()),
                    ),
                )
                study_session_id_map[remote_id] = local_id
                imported_counts["study_review_session"] += 1

            for row in data_payload.study_answer_attempts:
                remote_id = row_id(row)
                local_card_id = review_card_id_map.get(row_text(row, "review_card_id"))
                local_source_id = source_id_map.get(row_text(row, "source_document_id"))
                if not local_card_id:
                    existing_card_id = row_text(row, "review_card_id")
                    if connection.execute("SELECT 1 FROM review_cards WHERE id = ?", (existing_card_id,)).fetchone():
                        local_card_id = existing_card_id
                if not local_source_id:
                    existing_source_id = row_text(row, "source_document_id")
                    if connection.execute("SELECT 1 FROM source_documents WHERE id = ?", (existing_source_id,)).fetchone():
                        local_source_id = existing_source_id
                if not remote_id or not local_card_id or not local_source_id:
                    conflict_counts["study_answer_attempt"] += 1
                    continue
                if not is_importable("study_answer_attempt", row):
                    skipped_counts["study_answer_attempt"] += 1
                    continue
                local_id = remote_id
                if connection.execute("SELECT 1 FROM study_answer_attempts WHERE id = ?", (local_id,)).fetchone():
                    local_id = new_uuid7_str()
                remote_review_event_id = row_optional_text(row, "review_event_id")
                local_review_event_id = review_event_id_map.get(remote_review_event_id or "", remote_review_event_id)
                if local_review_event_id and not connection.execute(
                    "SELECT 1 FROM review_events WHERE id = ?",
                    (local_review_event_id,),
                ).fetchone():
                    local_review_event_id = None
                remote_session_id = row_optional_text(row, "session_id")
                local_session_id = study_session_id_map.get(remote_session_id or "", remote_session_id)
                connection.execute(
                    """
                    INSERT INTO study_answer_attempts (
                        id, review_card_id, source_document_id, session_id, question_type,
                        response_json, is_correct, attempted_at, review_event_id, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        local_id,
                        local_card_id,
                        local_source_id,
                        local_session_id,
                        row_text(row, "question_type", "short_answer"),
                        row_text(row, "response_json", "{}"),
                        row.get("is_correct"),
                        row_text(row, "attempted_at", now_iso()),
                        local_review_event_id,
                        row_text(row, "created_at", now_iso()),
                    ),
                )
                imported_counts["study_answer_attempt"] += 1

            imported_total = sum(imported_counts.values())
            integrity = None
            if imported_total:
                self._rebuild_source_documents_fts_with_connection(connection)
                self._rebuild_content_chunks_fts_with_connection(connection)
                self._rebuild_recall_notes_fts_with_connection(connection)
                self._rebuild_lexical_embeddings_with_connection(connection)
                self._append_change_event_with_connection(
                    connection,
                    entity_type="workspace",
                    entity_id="import",
                    event_type="backup_restored",
                    payload={
                        "device_id": data_payload.device_id,
                        "exported_at": data_payload.exported_at,
                        "imported_counts": dict(sorted(imported_counts.items())),
                    },
                    created_at=now_iso(),
                )
                integrity = self._build_workspace_integrity_report_with_connection(
                    connection,
                    checked_at=now_iso(),
                    include_quick_check=True,
                )
                self._record_integrity_report_with_connection(connection, integrity)

        return WorkspaceImportApplyResult(
            dry_run=False,
            applied=True,
            imported_counts=dict(sorted(imported_counts.items())),
            skipped_counts=dict(sorted(skipped_counts.items())),
            conflict_counts=dict(sorted(conflict_counts.items())),
            operations=preview.operations,
            warnings=warnings,
            blockers=[],
            integrity=integrity,
        )

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

        manual_note_node_ids = {
            str(row["id"])
            for row in node_rows
            if self._metadata_from_row(row).get("promoted_note_ids")
        }
        all_nodes = [self._row_to_knowledge_node_record(row) for row in node_rows]
        all_edges = [self._row_to_knowledge_edge_record(row) for row in edge_rows]
        unrejected_nodes = [node for node in all_nodes if node.status != "rejected"]
        manual_note_nodes = [node for node in unrejected_nodes if node.id in manual_note_node_ids]
        non_manual_nodes = [node for node in unrejected_nodes if node.id not in manual_note_node_ids]
        remaining_node_limit = max(0, limit_nodes - len(manual_note_nodes))
        visible_nodes = [
            *manual_note_nodes,
            *non_manual_nodes[:remaining_node_limit],
        ]
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
            visible_card_ids = {card.id for card in cards}
            review_event_count = sum(
                1
                for row in connection.execute("SELECT review_card_id FROM review_events").fetchall()
                if row["review_card_id"] in visible_card_ids
            )
        next_due_at = min((card.due_at for card in cards if card.status != "unscheduled"), default=None)
        return StudyOverview(
            due_count=sum(1 for card in cards if card.status == "due"),
            new_count=sum(1 for card in cards if card.status == "new"),
            scheduled_count=sum(1 for card in cards if card.status == "scheduled"),
            review_event_count=review_event_count,
            next_due_at=next_due_at,
        )

    def get_study_review_progress(
        self,
        *,
        source_document_id: str | None = None,
        period_days: int = 14,
        recent_limit: int = 8,
    ) -> StudyReviewProgress:
        safe_period_days = min(max(period_days, 1), 365)
        safe_recent_limit = min(max(recent_limit, 1), 25)
        with self.connect() as connection:
            rows = connection.execute(
                """
                SELECT
                    re.id,
                    re.review_card_id,
                    re.rating,
                    re.scheduling_state_json AS event_scheduling_state_json,
                    re.reviewed_at,
                    rc.source_document_id,
                    rc.prompt,
                    rc.scheduling_state_json AS card_scheduling_state_json,
                    sd.title AS document_title
                FROM review_events re
                INNER JOIN review_cards rc ON rc.id = re.review_card_id
                INNER JOIN source_documents sd ON sd.id = rc.source_document_id
                WHERE (? IS NULL OR rc.source_document_id = ?)
                ORDER BY re.reviewed_at DESC, re.id DESC
                """,
                (source_document_id, source_document_id),
            ).fetchall()
            card_rows = connection.execute(
                """
                SELECT
                    rc.id,
                    rc.source_document_id,
                    rc.scheduling_state_json,
                    rc.created_at,
                    rc.updated_at,
                    sd.title AS document_title
                FROM review_cards rc
                INNER JOIN source_documents sd ON sd.id = rc.source_document_id
                WHERE (? IS NULL OR rc.source_document_id = ?)
                ORDER BY sd.title ASC, rc.id ASC
                """,
                (source_document_id, source_document_id),
            ).fetchall()
            attempt_rows = connection.execute(
                """
                SELECT
                    saa.*,
                    rc.prompt,
                    rc.answer,
                    rc.scheduling_state_json AS card_scheduling_state_json,
                    sd.title AS document_title
                FROM study_answer_attempts saa
                INNER JOIN review_cards rc ON rc.id = saa.review_card_id
                INNER JOIN source_documents sd ON sd.id = saa.source_document_id
                WHERE (? IS NULL OR saa.source_document_id = ?)
                ORDER BY saa.attempted_at DESC, saa.id DESC
                """,
                (source_document_id, source_document_id),
            ).fetchall()
            session_rows = connection.execute(
                """
                SELECT *
                FROM study_review_sessions
                WHERE (? IS NULL OR source_document_id = ?)
                ORDER BY started_at DESC, id DESC
                LIMIT ?
                """,
                (source_document_id, source_document_id, safe_recent_limit),
            ).fetchall()
            rows = [
                row
                for row in rows
                if not _study_card_is_deleted_state(
                    _study_scheduling_state_from_json(row["card_scheduling_state_json"])
                )
            ]
            card_rows = [
                row
                for row in card_rows
                if not _study_card_is_deleted_state(_study_scheduling_state_from_json(row["scheduling_state_json"]))
            ]
            attempt_rows = [
                row
                for row in attempt_rows
                if not _study_card_is_deleted_state(
                    _study_scheduling_state_from_json(row["card_scheduling_state_json"])
                )
            ]

        today = datetime.now(UTC).date()
        study_settings = self.get_study_settings()
        activity_start = today - timedelta(days=safe_period_days - 1)
        daily_counts: dict[str, int] = {
            (activity_start + timedelta(days=offset)).isoformat(): 0
            for offset in range(safe_period_days)
        }
        active_dates: set[str] = set()
        period_active_dates: set[str] = set()
        rating_counts = {"forgot": 0, "hard": 0, "good": 0, "easy": 0}
        knowledge_stage_counts = {stage: 0 for stage in STUDY_KNOWLEDGE_STAGE_ORDER}
        source_totals: dict[str, dict[str, Any]] = {}
        recent_reviews: list[StudyReviewProgressRecentReview] = []
        recent_attempts: list[StudyAnswerAttemptRecord] = []
        recent_sessions = [
            self._row_to_study_review_session_record(row)
            for row in session_rows
        ]
        difficulty_totals = {
            difficulty: {"attempt_count": 0, "correct_attempt_count": 0, "graded_attempt_count": 0}
            for difficulty in ("easy", "medium", "hard")
        }
        last_reviewed_at: str | None = None
        attempt_rows_by_review_event = {
            row["review_event_id"]: row for row in attempt_rows if row["review_event_id"]
        }
        memory_progress = self._build_study_memory_progress_snapshots(
            card_rows=card_rows,
            review_rows=rows,
            activity_start=activity_start,
            today=today,
        )
        habit_goal = self._build_study_habit_goal_status(
            review_rows=rows,
            settings=study_settings,
            today=today,
        )

        for card_row in card_rows:
            card_state = json.loads(card_row["scheduling_state_json"] or "{}")
            knowledge_stage = study_knowledge_stage(card_state)
            knowledge_stage_counts[knowledge_stage] += 1
            source_id = card_row["source_document_id"]
            source_summary = source_totals.setdefault(
                source_id,
                {
                    "source_document_id": source_id,
                    "document_title": card_row["document_title"],
                    "review_count": 0,
                    "card_ids": set(),
                    "today_count": 0,
                    "last_reviewed_at": None,
                    "knowledge_stage_counts": {stage: 0 for stage in STUDY_KNOWLEDGE_STAGE_ORDER},
                    "attempt_count": 0,
                    "correct_attempt_count": 0,
                    "graded_attempt_count": 0,
                },
            )
            source_summary["card_ids"].add(card_row["id"])
            source_summary["knowledge_stage_counts"][knowledge_stage] += 1

        for row in rows:
            reviewed_at = str(row["reviewed_at"])
            reviewed_date = self._review_event_date(reviewed_at)
            if reviewed_date:
                date_key = reviewed_date.isoformat()
                active_dates.add(date_key)
                if date_key in daily_counts:
                    daily_counts[date_key] += 1
                    period_active_dates.add(date_key)

            rating_label = self._review_rating_label(row["rating"], row["event_scheduling_state_json"])
            rating_counts[rating_label] += 1
            if last_reviewed_at is None:
                last_reviewed_at = reviewed_at

            source_id = row["source_document_id"]
            source_summary = source_totals.setdefault(
                source_id,
                {
                    "source_document_id": source_id,
                    "document_title": row["document_title"],
                    "review_count": 0,
                    "card_ids": set(),
                    "today_count": 0,
                    "last_reviewed_at": None,
                    "knowledge_stage_counts": {stage: 0 for stage in STUDY_KNOWLEDGE_STAGE_ORDER},
                    "attempt_count": 0,
                    "correct_attempt_count": 0,
                    "graded_attempt_count": 0,
                },
            )
            source_summary["review_count"] += 1
            source_summary["card_ids"].add(row["review_card_id"])
            if reviewed_date == today:
                source_summary["today_count"] += 1
            if source_summary["last_reviewed_at"] is None or reviewed_at > source_summary["last_reviewed_at"]:
                source_summary["last_reviewed_at"] = reviewed_at

            if len(recent_reviews) < safe_recent_limit:
                card_state = json.loads(row["card_scheduling_state_json"] or "{}")
                linked_attempt = attempt_rows_by_review_event.get(row["id"])
                attempt_is_correct = linked_attempt["is_correct"] if linked_attempt else None
                recent_reviews.append(
                    StudyReviewProgressRecentReview(
                        id=row["id"],
                        review_card_id=row["review_card_id"],
                        source_document_id=source_id,
                        document_title=row["document_title"],
                        prompt=row["prompt"],
                        rating=rating_label,
                        reviewed_at=reviewed_at,
                        next_due_at=card_state.get("due_at"),
                        attempt_id=linked_attempt["id"] if linked_attempt else None,
                        attempt_is_correct=None if attempt_is_correct is None else bool(attempt_is_correct),
                        attempted_at=linked_attempt["attempted_at"] if linked_attempt else None,
                        question_type=linked_attempt["question_type"] if linked_attempt else None,
                    )
                )

        total_attempts = len(attempt_rows)
        correct_attempts = 0
        graded_attempts = 0
        for row in attempt_rows:
            source_id = row["source_document_id"]
            card_state = _study_scheduling_state_from_json(row["card_scheduling_state_json"])
            difficulty = _study_question_difficulty(row["question_type"], card_state)
            difficulty_summary = difficulty_totals[difficulty]
            difficulty_summary["attempt_count"] += 1
            source_summary = source_totals.setdefault(
                source_id,
                {
                    "source_document_id": source_id,
                    "document_title": row["document_title"],
                    "review_count": 0,
                    "card_ids": set(),
                    "today_count": 0,
                    "last_reviewed_at": None,
                    "knowledge_stage_counts": {stage: 0 for stage in STUDY_KNOWLEDGE_STAGE_ORDER},
                    "attempt_count": 0,
                    "correct_attempt_count": 0,
                    "graded_attempt_count": 0,
                },
            )
            source_summary["card_ids"].add(row["review_card_id"])
            source_summary["attempt_count"] += 1
            if row["is_correct"] is not None:
                graded_attempts += 1
                source_summary["graded_attempt_count"] += 1
                difficulty_summary["graded_attempt_count"] += 1
                if bool(row["is_correct"]):
                    correct_attempts += 1
                    source_summary["correct_attempt_count"] += 1
                    difficulty_summary["correct_attempt_count"] += 1
            if len(recent_attempts) < safe_recent_limit:
                recent_attempts.append(self._row_to_study_answer_attempt_record(row))

        current_daily_streak = 0
        streak_cursor = today
        while streak_cursor.isoformat() in active_dates:
            current_daily_streak += 1
            streak_cursor -= timedelta(days=1)

        source_breakdown = [
            StudyReviewProgressSource(
                source_document_id=summary["source_document_id"],
                document_title=summary["document_title"],
                review_count=summary["review_count"],
                card_count=len(summary["card_ids"]),
                today_count=summary["today_count"],
                last_reviewed_at=summary["last_reviewed_at"],
                dominant_knowledge_stage=self._dominant_knowledge_stage(summary["knowledge_stage_counts"]),
                knowledge_stage_counts=self._knowledge_stage_count_models(summary["knowledge_stage_counts"]),
                attempt_count=summary["attempt_count"],
                correct_attempt_count=summary["correct_attempt_count"],
                accuracy=(
                    round(summary["correct_attempt_count"] / summary["graded_attempt_count"], 4)
                    if summary["graded_attempt_count"]
                    else None
                ),
            )
            for summary in source_totals.values()
        ]
        source_breakdown.sort(
            key=lambda source: (
                -source.review_count,
                source.last_reviewed_at or "",
                source.document_title.lower(),
            )
        )

        return StudyReviewProgress(
            scope_source_document_id=source_document_id,
            total_reviews=len(rows),
            today_count=daily_counts.get(today.isoformat(), 0),
            active_days=len(period_active_dates),
            current_daily_streak=current_daily_streak,
            period_days=safe_period_days,
            last_reviewed_at=last_reviewed_at,
            daily_activity=[
                StudyReviewProgressDay(date=date_key, review_count=count)
                for date_key, count in daily_counts.items()
            ],
            rating_counts=[
                StudyReviewProgressRatingCount(rating=rating, count=count)
                for rating, count in rating_counts.items()
            ],
            knowledge_stage_counts=self._knowledge_stage_count_models(knowledge_stage_counts),
            memory_progress=memory_progress,
            recent_reviews=recent_reviews,
            source_breakdown=source_breakdown,
            total_attempts=total_attempts,
            correct_attempts=correct_attempts,
            accuracy=round(correct_attempts / graded_attempts, 4) if graded_attempts else None,
            recent_attempts=recent_attempts,
            recent_sessions=recent_sessions,
            difficulty_accuracy=[
                StudyReviewProgressDifficulty(
                    difficulty=difficulty,
                    attempt_count=summary["attempt_count"],
                    correct_attempt_count=summary["correct_attempt_count"],
                    accuracy=(
                        round(summary["correct_attempt_count"] / summary["graded_attempt_count"], 4)
                        if summary["graded_attempt_count"]
                        else None
                    ),
                )
                for difficulty, summary in difficulty_totals.items()
            ],
            habit_goal=habit_goal,
        )

    def start_study_review_session(
        self,
        payload: StudyReviewSessionStartRequest,
    ) -> StudyReviewSessionRecord | None:
        timestamp = now_iso()
        session_id = new_uuid7_str()
        source_document_id = normalize_whitespace(payload.source_document_id or "") or None
        card_ids = list(dict.fromkeys(payload.card_ids))
        with self.connect() as connection:
            if source_document_id:
                source_row = connection.execute(
                    "SELECT id FROM source_documents WHERE id = ?",
                    (source_document_id,),
                ).fetchone()
                if not source_row:
                    return None
            card_rows = connection.execute(
                f"""
                SELECT id, source_document_id, scheduling_state_json
                FROM review_cards
                WHERE id IN ({",".join("?" for _ in card_ids)})
                """,
                tuple(card_ids),
            ).fetchall()
            cards_by_id = {row["id"]: row for row in card_rows}
            missing_ids = [card_id for card_id in card_ids if card_id not in cards_by_id]
            if missing_ids:
                raise ValueError("Review sessions can only include existing Study cards.")
            for row in card_rows:
                if _study_card_is_deleted_state(_study_scheduling_state_from_json(row["scheduling_state_json"])):
                    raise ValueError("Review sessions cannot include deleted Study cards.")
                if source_document_id and row["source_document_id"] != source_document_id:
                    raise ValueError("Review session cards must belong to the selected source.")
            connection.execute(
                """
                INSERT INTO study_review_sessions (
                    id,
                    source_document_id,
                    filter_snapshot_json,
                    settings_snapshot_json,
                    card_ids_json,
                    started_at,
                    completed_at,
                    summary_json,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, NULL, '{}', ?, ?)
                """,
                (
                    session_id,
                    source_document_id,
                    json.dumps(payload.filter_snapshot, sort_keys=True),
                    json.dumps(payload.settings_snapshot, sort_keys=True),
                    json.dumps(card_ids),
                    timestamp,
                    timestamp,
                    timestamp,
                ),
            )
            self._append_change_event_with_connection(
                connection,
                entity_type="study_review_session",
                entity_id=session_id,
                event_type="started",
                payload={
                    "card_count": len(card_ids),
                    "source_document_id": source_document_id,
                },
                created_at=timestamp,
            )
            row = connection.execute(
                "SELECT * FROM study_review_sessions WHERE id = ?",
                (session_id,),
            ).fetchone()
        return self._row_to_study_review_session_record(row) if row else None

    def complete_study_review_session(
        self,
        session_id: str,
        payload: StudyReviewSessionCompleteRequest,
    ) -> StudyReviewSessionRecord | None:
        timestamp = now_iso()
        normalized_session_id = normalize_whitespace(session_id)
        with self.connect() as connection:
            existing = connection.execute(
                "SELECT id FROM study_review_sessions WHERE id = ?",
                (normalized_session_id,),
            ).fetchone()
            if not existing:
                return None
            connection.execute(
                """
                UPDATE study_review_sessions
                SET completed_at = ?, summary_json = ?, updated_at = ?
                WHERE id = ?
                """,
                (
                    timestamp,
                    json.dumps(payload.summary if isinstance(payload.summary, dict) else {}, sort_keys=True),
                    timestamp,
                    normalized_session_id,
                ),
            )
            self._append_change_event_with_connection(
                connection,
                entity_type="study_review_session",
                entity_id=normalized_session_id,
                event_type="completed",
                payload=payload.summary if isinstance(payload.summary, dict) else {},
                created_at=timestamp,
            )
            row = connection.execute(
                "SELECT * FROM study_review_sessions WHERE id = ?",
                (normalized_session_id,),
            ).fetchone()
        return self._row_to_study_review_session_record(row) if row else None

    def list_study_cards(
        self,
        *,
        status: str = "due",
        limit: int = 20,
        source_document_id: str | None = None,
    ) -> list[StudyCardRecord]:
        capped_limit = min(max(limit, 1), 100)
        normalized_source_document_id = normalize_whitespace(source_document_id or "")
        source_clause = "WHERE rc.source_document_id = ?" if normalized_source_document_id else ""
        parameters = (normalized_source_document_id,) if normalized_source_document_id else ()
        with self.connect() as connection:
            rows = connection.execute(
                f"""
                SELECT rc.*, sd.title AS document_title
                FROM review_cards rc
                INNER JOIN source_documents sd ON sd.id = rc.source_document_id
                {source_clause}
                ORDER BY rc.updated_at DESC, rc.id ASC
                """,
                parameters,
            ).fetchall()

        cards = [self._row_to_study_card_record(row) for row in rows]
        cards = [
            card
            for card in cards
            if not _study_card_is_deleted_state(card.scheduling_state)
        ]
        if status != "all":
            cards = [card for card in cards if card.status == status]
        cards.sort(
            key=lambda card: (
                card.status != "due",
                card.status != "new",
                card.status != "scheduled",
                card.due_at,
                card.prompt.lower(),
            )
        )
        return cards[:capped_limit]

    def create_study_card(self, payload: StudyCardCreateRequest) -> StudyCardRecord | None:
        source_document_id = normalize_whitespace(payload.source_document_id)
        prompt = normalize_whitespace(payload.prompt)
        answer = normalize_whitespace(payload.answer)
        card_type = payload.card_type or "short_answer"
        if not prompt:
            raise ValueError("Enter a study prompt before creating this card.")
        if not answer:
            raise ValueError("Enter a study answer before creating this card.")
        if card_type not in STUDY_MANUAL_CARD_TYPES:
            raise ValueError("Choose a supported study card type.")
        answer, question_payload = _normalize_study_question_payload(
            card_type,
            answer,
            payload.question_payload,
        )
        support_payload = _normalize_study_support_payload(payload.support_payload)

        timestamp = now_iso()
        card_id = f"card:manual:{new_uuid7_str()}"
        scheduling_state = build_initial_scheduling_state(card_id, created_at=timestamp)
        scheduling_state["manual_content_created_at"] = timestamp
        scheduling_state["manual_content_edited_at"] = timestamp
        scheduling_state["manual_card_type"] = card_type
        question_difficulty = _normalize_study_question_difficulty(payload.question_difficulty)
        if question_difficulty:
            scheduling_state["manual_question_difficulty"] = question_difficulty
        if question_payload is not None:
            scheduling_state["manual_question_payload"] = question_payload
        if support_payload is not None:
            scheduling_state["manual_question_support_payload"] = support_payload
        scheduling_state["status"] = study_card_status(scheduling_state)

        with self.connect() as connection:
            source_row = connection.execute(
                """
                SELECT id, title, source_type, source_locator, file_name
                FROM source_documents
                WHERE id = ?
                """,
                (source_document_id,),
            ).fetchone()
            if not source_row:
                return None

            chunk_row = connection.execute(
                """
                SELECT id, block_id, text
                FROM content_chunks
                WHERE source_document_id = ?
                ORDER BY ordinal ASC
                LIMIT 1
                """,
                (source_document_id,),
            ).fetchone()
            source_spans = [
                {
                    "anchor_kind": "source",
                    "block_id": chunk_row["block_id"] if chunk_row else None,
                    "card_type": card_type,
                    "chunk_id": chunk_row["id"] if chunk_row else None,
                    "excerpt": self._truncate_text(chunk_row["text"], 240) if chunk_row else source_row["title"],
                    "manual_source": "study_manual",
                    "source_document_id": source_row["id"],
                    "source_title": source_row["title"],
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
                """,
                (
                    card_id,
                    source_document_id,
                    prompt,
                    answer,
                    card_type,
                    json.dumps(source_spans, sort_keys=True),
                    json.dumps(scheduling_state, sort_keys=True),
                    timestamp,
                    timestamp,
                ),
            )
            self._append_change_event_with_connection(
                connection,
                entity_type="review_card",
                entity_id=card_id,
                event_type="created",
                payload={
                    "card_type": card_type,
                    "question_difficulty": _study_question_difficulty(card_type, scheduling_state),
                    "manual": True,
                    "support_payload": bool(support_payload),
                    "source_document_id": source_document_id,
                },
                created_at=timestamp,
            )
            self._rebuild_lexical_embeddings_with_connection(connection)
            created_row = connection.execute(
                """
                SELECT rc.*, sd.title AS document_title
                FROM review_cards rc
                INNER JOIN source_documents sd ON sd.id = rc.source_document_id
                WHERE rc.id = ?
                """,
                (card_id,),
            ).fetchone()
        if not created_row:
            return None
        return self._row_to_study_card_record(created_row)

    def regenerate_study_cards(
        self,
        payload: StudyCardGenerationRequest | None = None,
    ) -> StudyCardGenerationResult:
        with self.connect() as connection:
            result = self._sync_review_cards_with_connection(connection, payload)
            self._rebuild_lexical_embeddings_with_connection(connection)
            return result

    def create_study_answer_attempt(
        self,
        review_card_id: str,
        payload: StudyAnswerAttemptRequest,
    ) -> StudyAnswerAttemptRecord | None:
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

            scheduling_state = _study_scheduling_state_from_json(row["scheduling_state_json"])
            if _study_card_is_deleted_state(scheduling_state):
                return None
            card_type = str(row["card_type"])
            if card_type not in STUDY_MANUAL_CARD_TYPES:
                raise ValueError("Study attempts require a supported Study question type.")

            question_payload = scheduling_state.get("manual_question_payload")
            if not isinstance(question_payload, dict):
                question_payload = scheduling_state.get("generated_question_payload")
            response = _study_attempt_response_to_dict(payload.response)
            is_correct = _study_attempt_correctness(
                card_type=card_type,
                answer=row["answer"],
                question_payload=question_payload if isinstance(question_payload, dict) else None,
                response=response,
            )
            timestamp = now_iso()
            attempt_id = new_uuid7_str()
            connection.execute(
                """
                INSERT INTO study_answer_attempts (
                    id,
                    review_card_id,
                    source_document_id,
                    session_id,
                    question_type,
                    response_json,
                    is_correct,
                    attempted_at,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    attempt_id,
                    review_card_id,
                    row["source_document_id"],
                    payload.session_id,
                    card_type,
                    json.dumps(response, sort_keys=True),
                    None if is_correct is None else int(is_correct),
                    timestamp,
                    timestamp,
                ),
            )
            self._append_change_event_with_connection(
                connection,
                entity_type="study_answer_attempt",
                entity_id=attempt_id,
                event_type="created",
                payload={
                    "review_card_id": review_card_id,
                    "source_document_id": row["source_document_id"],
                    "question_type": card_type,
                    "is_correct": is_correct,
                },
                created_at=timestamp,
            )
            attempt_row = connection.execute(
                """
                SELECT saa.*, rc.prompt, rc.answer, sd.title AS document_title
                FROM study_answer_attempts saa
                INNER JOIN review_cards rc ON rc.id = saa.review_card_id
                INNER JOIN source_documents sd ON sd.id = saa.source_document_id
                WHERE saa.id = ?
                """,
                (attempt_id,),
            ).fetchone()
        return self._row_to_study_answer_attempt_record(attempt_row) if attempt_row else None

    def review_study_card(
        self,
        review_card_id: str,
        rating_label: str,
        *,
        attempt_id: str | None = None,
    ) -> StudyCardRecord | None:
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
            if _study_card_is_deleted_state(scheduling_state):
                return None
            if attempt_id:
                attempt_row = connection.execute(
                    """
                    SELECT id
                    FROM study_answer_attempts
                    WHERE id = ? AND review_card_id = ?
                    """,
                    (attempt_id, review_card_id),
                ).fetchone()
                if not attempt_row:
                    raise ValueError("Study answer attempt not found for this card.")
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
            review_event_id = new_uuid7_str()
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
                    review_event_id,
                    review_card_id,
                    numeric_rating,
                    json.dumps(next_state, sort_keys=True),
                    timestamp,
                    timestamp,
                ),
            )
            linked_attempt_id = attempt_id
            if linked_attempt_id is None:
                latest_attempt_row = connection.execute(
                    """
                    SELECT id
                    FROM study_answer_attempts
                    WHERE review_card_id = ? AND review_event_id IS NULL
                    ORDER BY attempted_at DESC, id DESC
                    LIMIT 1
                    """,
                    (review_card_id,),
                ).fetchone()
                linked_attempt_id = latest_attempt_row["id"] if latest_attempt_row else None
            if linked_attempt_id:
                connection.execute(
                    """
                    UPDATE study_answer_attempts
                    SET review_event_id = ?
                    WHERE id = ? AND review_card_id = ?
                    """,
                    (review_event_id, linked_attempt_id, review_card_id),
                )
            self._append_change_event_with_connection(
                connection,
                entity_type="review_card",
                entity_id=review_card_id,
                event_type="reviewed",
                payload={"rating": rating_label, "attempt_id": linked_attempt_id},
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

    def set_study_card_schedule_state(self, review_card_id: str, action: str) -> StudyCardRecord | None:
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

            timestamp = now_iso()
            scheduling_state = json.loads(row["scheduling_state_json"] or "{}")
            if _study_card_is_deleted_state(scheduling_state):
                return None
            next_state = update_study_schedule_state(
                scheduling_state,
                action,
                timestamp=timestamp,
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
            self._append_change_event_with_connection(
                connection,
                entity_type="review_card",
                entity_id=review_card_id,
                event_type="schedule_state_updated",
                payload={"action": action},
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

    def update_study_card(
        self,
        review_card_id: str,
        payload: StudyCardUpdateRequest,
    ) -> StudyCardRecord | None:
        prompt = normalize_whitespace(payload.prompt)
        answer = normalize_whitespace(payload.answer)
        if not prompt:
            raise ValueError("Enter a study prompt before saving this card.")
        if not answer:
            raise ValueError("Enter a study answer before saving this card.")

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

            scheduling_state = _study_scheduling_state_from_json(row["scheduling_state_json"])
            if _study_card_is_deleted_state(scheduling_state):
                return None

            timestamp = now_iso()
            card_type = row["card_type"]
            answer, question_payload = _normalize_study_question_payload(
                card_type,
                answer,
                payload.question_payload,
            )
            payload_field_set = getattr(payload, "model_fields_set", set())
            question_difficulty_was_supplied = "question_difficulty" in payload_field_set
            question_difficulty = _normalize_study_question_difficulty(payload.question_difficulty)
            support_payload_was_supplied = "support_payload" in payload_field_set
            support_payload = (
                _normalize_study_support_payload(payload.support_payload)
                if support_payload_was_supplied
                else None
            )
            scheduling_state["manual_content_edited_at"] = timestamp
            if question_difficulty_was_supplied:
                if question_difficulty:
                    scheduling_state["manual_question_difficulty"] = question_difficulty
                else:
                    scheduling_state.pop("manual_question_difficulty", None)
            if question_payload is not None:
                scheduling_state["manual_question_payload"] = question_payload
            else:
                scheduling_state.pop("manual_question_payload", None)
            if support_payload_was_supplied:
                if support_payload is not None:
                    scheduling_state["manual_question_support_payload"] = support_payload
                else:
                    scheduling_state.pop("manual_question_support_payload", None)
            scheduling_state["status"] = study_card_status(scheduling_state)
            connection.execute(
                """
                UPDATE review_cards
                SET prompt = ?, answer = ?, scheduling_state_json = ?, updated_at = ?
                WHERE id = ?
                """,
                (
                    prompt,
                    answer,
                    json.dumps(scheduling_state, sort_keys=True),
                    timestamp,
                    review_card_id,
                ),
            )
            self._append_change_event_with_connection(
                connection,
                entity_type="review_card",
                entity_id=review_card_id,
                event_type="updated",
                payload={
                    "prompt": prompt,
                    "answer": answer,
                    "question_difficulty": _study_question_difficulty(card_type, scheduling_state),
                    "support_payload": bool(support_payload),
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
                (review_card_id,),
            ).fetchone()
        if not updated_row:
            return None
        return self._row_to_study_card_record(updated_row)

    def delete_study_card(self, review_card_id: str) -> StudyCardDeleteResult | None:
        with self.connect() as connection:
            deleted = self._soft_delete_study_card_with_connection(
                connection,
                review_card_id,
                deleted_at=now_iso(),
            )
            if not deleted:
                return None
            self._rebuild_lexical_embeddings_with_connection(connection)
        return StudyCardDeleteResult(id=review_card_id, deleted=True)

    def bulk_delete_study_cards(self, review_card_ids: list[str]) -> StudyCardBulkDeleteResult:
        ordered_ids = list(dict.fromkeys(review_card_ids))[:100]
        timestamp = now_iso()
        deleted_ids: list[str] = []
        missing_ids: list[str] = []
        with self.connect() as connection:
            for review_card_id in ordered_ids:
                deleted = self._soft_delete_study_card_with_connection(
                    connection,
                    review_card_id,
                    deleted_at=timestamp,
                )
                if deleted:
                    deleted_ids.append(review_card_id)
                else:
                    missing_ids.append(review_card_id)
            if deleted_ids:
                self._rebuild_lexical_embeddings_with_connection(connection)
        return StudyCardBulkDeleteResult(deleted_ids=deleted_ids, missing_ids=missing_ids)

    def _soft_delete_study_card_with_connection(
        self,
        connection: sqlite3.Connection,
        review_card_id: str,
        *,
        deleted_at: str,
    ) -> bool:
        row = connection.execute(
            "SELECT id, source_document_id, scheduling_state_json FROM review_cards WHERE id = ?",
            (review_card_id,),
        ).fetchone()
        if not row:
            return False

        scheduling_state = _study_scheduling_state_from_json(row["scheduling_state_json"])
        if _study_card_is_deleted_state(scheduling_state):
            return False

        scheduling_state["deleted_at"] = deleted_at
        connection.execute(
            """
            UPDATE review_cards
            SET scheduling_state_json = ?, updated_at = ?
            WHERE id = ?
            """,
            (json.dumps(scheduling_state, sort_keys=True), deleted_at, review_card_id),
        )
        self._append_change_event_with_connection(
            connection,
            entity_type="review_card",
            entity_id=review_card_id,
            event_type="deleted",
            payload={"source_document_id": row["source_document_id"]},
            created_at=deleted_at,
        )
        return True

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

    def get_study_settings(self) -> StudySettings:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT value_json FROM app_settings WHERE namespace = 'study'",
            ).fetchone()
        if not row:
            return StudySettings()
        return StudySettings.model_validate_json(row["value_json"])

    def save_study_settings(self, settings: StudySettings) -> StudySettings:
        timestamp = now_iso()
        with self.connect() as connection:
            connection.execute(
                """
                INSERT INTO app_settings (namespace, value_json, updated_at)
                VALUES ('study', ?, ?)
                ON CONFLICT(namespace) DO UPDATE SET
                    value_json = excluded.value_json,
                    updated_at = excluded.updated_at
                """,
                (settings.model_dump_json(), timestamp),
            )
            self._append_change_event_with_connection(
                connection,
                entity_type="app_settings",
                entity_id="study",
                event_type="updated",
                payload=settings.model_dump(mode="json"),
            )
        return settings

    def get_library_settings(self) -> LibrarySettings:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT value_json FROM app_settings WHERE namespace = 'library'",
            ).fetchone()
            if not row:
                return LibrarySettings()
            settings = LibrarySettings.model_validate_json(row["value_json"])
            return self._normalize_library_settings_with_connection(connection, settings)

    def save_library_settings(self, settings: LibrarySettings) -> LibrarySettings:
        timestamp = now_iso()
        with self.connect() as connection:
            normalized = self._normalize_library_settings_with_connection(
                connection,
                settings,
                timestamp=timestamp,
                strict=True,
            )
            connection.execute(
                """
                INSERT INTO app_settings (namespace, value_json, updated_at)
                VALUES ('library', ?, ?)
                ON CONFLICT(namespace) DO UPDATE SET
                    value_json = excluded.value_json,
                    updated_at = excluded.updated_at
                """,
                (normalized.model_dump_json(), timestamp),
            )
            self._append_change_event_with_connection(
                connection,
                entity_type="app_settings",
                entity_id="library",
                event_type="updated",
                payload=normalized.model_dump(mode="json"),
            )
        return normalized

    def merge_import_collections(
        self,
        collection_documents: dict[tuple[tuple[str, ...], BatchResolvedImportFormat], list[str]],
    ) -> list[BatchImportCollectionResult]:
        if not collection_documents:
            return []

        timestamp = now_iso()
        with self.connect() as connection:
            row = connection.execute(
                "SELECT value_json FROM app_settings WHERE namespace = 'library'",
            ).fetchone()
            current = (
                LibrarySettings.model_validate_json(row["value_json"])
                if row
                else LibrarySettings()
            )
            current = self._normalize_library_settings_with_connection(connection, current, timestamp=timestamp)
            collections = list(current.custom_collections)
            results: list[BatchImportCollectionResult] = []

            for (path, source_format), document_ids in collection_documents.items():
                normalized_path = tuple(normalize_whitespace(part) for part in path if normalize_whitespace(part))
                if not normalized_path:
                    continue
                valid_document_ids = self._valid_library_document_ids_with_connection(connection, document_ids)
                parent_id: str | None = None
                for depth in range(1, len(normalized_path) + 1):
                    prefix = normalized_path[:depth]
                    normalized_name = prefix[-1]
                    collection_id = self._library_import_collection_id(prefix, source_format)
                    prefix_parent_id = parent_id
                    existing_index = self._find_library_collection_index(
                        collections,
                        collection_id=collection_id,
                        name=normalized_name,
                        parent_id=prefix_parent_id,
                    )
                    prefix_document_ids = valid_document_ids if depth == len(normalized_path) else []

                    if existing_index is None:
                        collection = LibraryCollection(
                            id=collection_id,
                            name=normalized_name,
                            document_ids=prefix_document_ids,
                            origin="import",
                            parent_id=prefix_parent_id,
                            source_format=source_format,
                            sort_index=len(collections),
                            created_at=timestamp,
                            updated_at=timestamp,
                        )
                        collections.append(collection)
                        results.append(
                            BatchImportCollectionResult(
                                id=collection.id,
                                name=collection.name,
                                document_ids=collection.document_ids,
                                parent_id=collection.parent_id,
                                path=list(prefix),
                                source_format=collection.source_format,
                                status="created",
                            )
                        )
                        parent_id = collection.id
                        continue

                    existing = collections[existing_index]
                    merged_document_ids = (
                        self._dedupe_texts([*existing.document_ids, *prefix_document_ids])
                        if prefix_document_ids
                        else existing.document_ids
                    )
                    source_format_changed = existing.source_format is None and source_format is not None
                    parent_changed = existing.parent_id != prefix_parent_id
                    document_ids_changed = merged_document_ids != existing.document_ids
                    updated = LibraryCollection(
                        id=existing.id,
                        name=existing.name,
                        document_ids=merged_document_ids,
                        origin=existing.origin,
                        parent_id=prefix_parent_id,
                        source_format=existing.source_format or source_format,
                        sort_index=existing.sort_index,
                        created_at=existing.created_at or timestamp,
                        updated_at=timestamp if (document_ids_changed or parent_changed or source_format_changed) else existing.updated_at,
                    )
                    collections[existing_index] = updated
                    if document_ids_changed or parent_changed or source_format_changed:
                        results.append(
                            BatchImportCollectionResult(
                                id=updated.id,
                                name=updated.name,
                                document_ids=updated.document_ids,
                                parent_id=updated.parent_id,
                                path=list(prefix),
                                source_format=updated.source_format,
                                status="updated",
                            )
                        )
                    parent_id = updated.id

            normalized = self._normalize_library_settings_with_connection(
                connection,
                LibrarySettings(custom_collections=collections),
                timestamp=timestamp,
            )
            connection.execute(
                """
                INSERT INTO app_settings (namespace, value_json, updated_at)
                VALUES ('library', ?, ?)
                ON CONFLICT(namespace) DO UPDATE SET
                    value_json = excluded.value_json,
                    updated_at = excluded.updated_at
                """,
                (normalized.model_dump_json(), timestamp),
            )
            self._append_change_event_with_connection(
                connection,
                entity_type="app_settings",
                entity_id="library",
                event_type="updated",
                payload=normalized.model_dump(mode="json"),
            )
        return results

    def record_batch_import_metadata(
        self,
        document_id: str,
        *,
        source_format: BatchResolvedImportFormat,
        url: str,
        folder: str | None,
        tags: list[str],
        imported_at: str,
    ) -> bool:
        source_document = self.get_source_document(document_id)
        if not source_document:
            return False
        metadata = dict(source_document.metadata)
        metadata["batch_import"] = {
            "source_format": source_format,
            "url": url,
            "folder": folder,
            "tags": self._dedupe_texts(tags),
            "imported_at": imported_at,
        }
        return self.save_source_document_metadata(document_id, metadata, touch_updated_at=True)

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

            CREATE TABLE IF NOT EXISTS study_answer_attempts (
                id TEXT PRIMARY KEY,
                review_card_id TEXT NOT NULL,
                source_document_id TEXT NOT NULL,
                session_id TEXT,
                question_type TEXT NOT NULL,
                response_json TEXT NOT NULL DEFAULT '{}',
                is_correct INTEGER,
                attempted_at TEXT NOT NULL,
                review_event_id TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (review_card_id) REFERENCES review_cards(id) ON DELETE CASCADE,
                FOREIGN KEY (source_document_id) REFERENCES source_documents(id) ON DELETE CASCADE,
                FOREIGN KEY (review_event_id) REFERENCES review_events(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS study_review_sessions (
                id TEXT PRIMARY KEY,
                source_document_id TEXT,
                filter_snapshot_json TEXT NOT NULL DEFAULT '{}',
                settings_snapshot_json TEXT NOT NULL DEFAULT '{}',
                card_ids_json TEXT NOT NULL DEFAULT '[]',
                started_at TEXT NOT NULL,
                completed_at TEXT,
                summary_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (source_document_id) REFERENCES source_documents(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS recall_notes (
                id TEXT PRIMARY KEY,
                anchor_kind TEXT NOT NULL DEFAULT 'sentence',
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

            CREATE INDEX IF NOT EXISTS study_answer_attempts_card_idx
            ON study_answer_attempts (review_card_id, attempted_at DESC);

            CREATE INDEX IF NOT EXISTS study_answer_attempts_source_idx
            ON study_answer_attempts (source_document_id, attempted_at DESC);

            CREATE INDEX IF NOT EXISTS study_answer_attempts_session_idx
            ON study_answer_attempts (session_id, attempted_at DESC);

            CREATE INDEX IF NOT EXISTS study_review_sessions_source_idx
            ON study_review_sessions (source_document_id, started_at DESC);
            """
        )
        self._ensure_column_with_connection(
            connection,
            table_name="recall_notes",
            column_name="anchor_kind",
            column_sql="TEXT NOT NULL DEFAULT 'sentence'",
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

    def _sync_review_cards_with_connection(
        self,
        connection: sqlite3.Connection,
        payload: StudyCardGenerationRequest | None = None,
    ) -> StudyCardGenerationResult:
        requested_source_document_id = payload.source_document_id if payload else None
        requested_question_types = (
            list(payload.question_types)
            if payload and payload.question_types
            else list(GENERATED_STUDY_CARD_TYPES)
        )
        max_per_source = payload.max_per_source if payload else 8
        include_hints = payload.include_hints if payload else True
        include_explanations = payload.include_explanations if payload else True
        requested_difficulty = payload.difficulty if payload else "all"
        chunk_rows = connection.execute(
            """
            SELECT id, source_document_id, variant_id, block_id, ordinal, text, metadata_json
            FROM content_chunks
            WHERE (? IS NULL OR source_document_id = ?)
            ORDER BY source_document_id ASC, ordinal ASC
            """,
            (requested_source_document_id, requested_source_document_id),
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
                evidence=[
                    RelationEvidence(
                        id=f"{row['id']}:evidence:{index}",
                        source_document_id=str(evidence.get("source_document_id") or ""),
                        block_id=evidence.get("block_id"),
                        excerpt=evidence.get("excerpt"),
                        confidence=evidence.get("confidence"),
                        metadata=evidence.get("metadata") if isinstance(evidence.get("metadata"), dict) else {},
                    )
                    for index, evidence in enumerate(
                        metadata.get("evidence", []) if isinstance(metadata.get("evidence"), list) else []
                    )
                    if isinstance(evidence, dict) and evidence.get("source_document_id")
                ],
                metadata=metadata,
            )
            for row in edge_rows
            for metadata in [self._metadata_from_row(row)]
        ]
        document_titles = {
            row["id"]: row["title"]
            for row in connection.execute(
                "SELECT id, title FROM source_documents WHERE (? IS NULL OR id = ?)",
                (requested_source_document_id, requested_source_document_id),
            ).fetchall()
        }
        if requested_source_document_id and requested_source_document_id not in document_titles:
            raise ValueError("Source document not found.")
        card_candidates = build_review_card_candidates(
            chunks=chunks,
            nodes=nodes,
            edges=edges,
            document_titles=document_titles,
            question_types=requested_question_types,
            source_document_id=requested_source_document_id,
            max_per_source=max_per_source,
            difficulty=requested_difficulty,
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
        prunable_card_types = set(requested_question_types) | {"relation", "cloze"}
        obsolete_ids = [
            card_id
            for card_id, row in existing_rows.items()
            for scheduling_state in [_study_scheduling_state_from_json(row["scheduling_state_json"])]
            if (
                card_id not in expected_ids
                and row["card_type"] in prunable_card_types
                and (
                    requested_difficulty == "all"
                    or _study_question_difficulty(row["card_type"], scheduling_state) == requested_difficulty
                )
                and (
                    requested_source_document_id is None
                    or row["source_document_id"] == requested_source_document_id
                )
                and not _study_card_is_manual_state(row["card_type"], scheduling_state)
                and not _study_card_is_deleted_state(scheduling_state)
            )
        ]
        for card_id in obsolete_ids:
            connection.execute(
                "DELETE FROM review_cards WHERE id = ?",
                (card_id,),
            )

        timestamp = now_iso()
        generated_count = 0
        generated_by_type = {question_type: 0 for question_type in requested_question_types}
        total_by_type = {question_type: 0 for question_type in requested_question_types}
        visible_candidate_count = len(card_candidates)
        for candidate in card_candidates:
            existing = existing_rows.get(candidate["id"])
            scheduling_state = (
                _study_scheduling_state_from_json(existing["scheduling_state_json"])
                if existing
                else build_initial_scheduling_state(candidate["id"], created_at=timestamp)
            )
            if _study_card_is_deleted_state(scheduling_state):
                visible_candidate_count -= 1
                continue
            scheduling_state["status"] = study_card_status(scheduling_state)
            manual_content_edited = bool(scheduling_state.get("manual_content_edited_at"))
            if not manual_content_edited:
                question_payload = candidate.get("question_payload")
                if question_payload is not None:
                    scheduling_state["generated_question_payload"] = question_payload
                    scheduling_state.pop("manual_question_payload", None)
                else:
                    scheduling_state.pop("generated_question_payload", None)
                candidate_difficulty = _normalize_study_question_difficulty(candidate.get("question_difficulty"))
                if candidate_difficulty:
                    scheduling_state["generated_question_difficulty"] = candidate_difficulty
                    scheduling_state.pop("manual_question_difficulty", None)
                support_payload = _filter_study_support_payload(
                    candidate.get("question_support_payload"),
                    include_hints=include_hints,
                    include_explanations=include_explanations,
                )
                if support_payload is not None:
                    scheduling_state["generated_question_support_payload"] = support_payload
                    scheduling_state.pop("manual_question_support_payload", None)
                else:
                    scheduling_state.pop("generated_question_support_payload", None)
            next_prompt = existing["prompt"] if existing and manual_content_edited else candidate["prompt"]
            next_answer = existing["answer"] if existing and manual_content_edited else candidate["answer"]
            source_spans_json = json.dumps(candidate["source_spans"], sort_keys=True)
            scheduling_state_json = json.dumps(scheduling_state, sort_keys=True)
            needs_update = (
                existing is None
                or existing["source_document_id"] != candidate["source_document_id"]
                or existing["prompt"] != next_prompt
                or existing["answer"] != next_answer
                or existing["card_type"] != candidate["card_type"]
                or existing["source_spans_json"] != source_spans_json
                or existing["scheduling_state_json"] != scheduling_state_json
            )
            if needs_update:
                generated_count += 1
                generated_by_type[candidate["card_type"]] = generated_by_type.get(candidate["card_type"], 0) + 1
            total_by_type[candidate["card_type"]] = total_by_type.get(candidate["card_type"], 0) + 1
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
                    next_prompt,
                    next_answer,
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
                "generated_by_type": generated_by_type,
                "question_types": requested_question_types,
                "source_document_id": requested_source_document_id,
                "study_schema_version": STUDY_SCHEMA_VERSION,
                "include_hints": include_hints,
                "include_explanations": include_explanations,
                "difficulty": requested_difficulty,
                "total_by_type": total_by_type,
                "total_count": visible_candidate_count,
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
            total_count=visible_candidate_count,
            source_document_id=requested_source_document_id,
            question_types=requested_question_types,
            generated_by_type=generated_by_type,
            total_by_type=total_by_type,
            include_hints=include_hints,
            include_explanations=include_explanations,
            difficulty=requested_difficulty,
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
            scheduling_state = _study_scheduling_state_from_json(row["scheduling_state_json"])
            if _study_card_is_deleted_state(scheduling_state):
                continue
            choice_text = " ".join(_study_payload_texts_from_state(scheduling_state))
            vector = build_sparse_vector(
                f"{row['prompt']} {row['answer']} {choice_text}",
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
        if anchor.kind == "source":
            document_row = connection.execute(
                """
                SELECT title
                FROM source_documents
                WHERE id = ?
                """,
                (document_id,),
            ).fetchone()
            if not document_row:
                raise ValueError("Note anchor source document was not found.")
            document_title = normalize_whitespace(str(document_row["title"] or "")) or "Saved source"
            anchor_text = normalize_whitespace(anchor.anchor_text) or f"Source note for {document_title}"
            excerpt_text = normalize_whitespace(anchor.excerpt_text) or f"Manual note attached to {document_title}."
            return RecallNoteAnchor(
                kind="source",
                source_document_id=document_id,
                variant_id=str(variant_row["id"]),
                block_id=f"source:{document_id}",
                sentence_start=0,
                sentence_end=0,
                global_sentence_start=0,
                global_sentence_end=0,
                anchor_text=anchor_text,
                excerpt_text=excerpt_text,
            )
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
            kind="sentence",
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
                kind="sentence",
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

    def _manual_note_evidence_values(self, note_row: sqlite3.Row) -> dict[str, str | None]:
        anchor_kind = str(note_row["anchor_kind"] or "sentence")
        body_text = normalize_whitespace(note_row["body_text"] or "")
        document_title = normalize_whitespace(note_row["document_title"] or "") or "Saved source"
        if anchor_kind == "source":
            fallback = f"{document_title} personal note"
            return {
                "anchor_text": fallback,
                "evidence_label": "Source note",
                "excerpt": body_text or fallback,
                "note_body": body_text or None,
                "source_title": document_title,
            }

        anchor_text = normalize_whitespace(note_row["anchor_text"] or "")
        excerpt_text = normalize_whitespace(note_row["excerpt_text"] or "")
        return {
            "anchor_text": anchor_text or excerpt_text or body_text or document_title,
            "evidence_label": "Saved note",
            "excerpt": excerpt_text or anchor_text or body_text or document_title,
            "note_body": body_text or None,
            "source_title": document_title,
        }

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

        evidence_values = self._manual_note_evidence_values(note_row)
        source_note_mention = str(note_row["anchor_kind"] or "sentence") == "source"
        mention_metadata = {
            "chunk_id": None if source_note_mention else self._chunk_id_for_note_row_with_connection(connection, note_row),
            "document_title": note_row["document_title"],
            "evidence_label": evidence_values["evidence_label"],
            "excerpt": evidence_values["excerpt"],
            "graph_schema_version": GRAPH_SCHEMA_VERSION,
            "anchor_kind": note_row["anchor_kind"],
            "manual_source": "note",
            "note_anchor_text": evidence_values["anchor_text"],
            "note_body": evidence_values["note_body"],
            "note_id": note_id,
            "source_title": evidence_values["source_title"],
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
            kind=row["anchor_kind"] or "sentence",
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
            anchor_kind=metadata.get("anchor_kind"),
            manual_source=metadata.get("manual_source"),
            note_anchor_text=metadata.get("note_anchor_text"),
            note_body=metadata.get("note_body"),
            note_id=metadata.get("note_id"),
        )

    def _row_to_study_card_record(self, row: sqlite3.Row) -> StudyCardRecord:
        scheduling_state = _study_scheduling_state_from_json(row["scheduling_state_json"])
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
            knowledge_stage=study_knowledge_stage(scheduling_state),
            question_difficulty=_study_question_difficulty(row["card_type"], scheduling_state),
            question_payload=scheduling_state.get("manual_question_payload")
            or scheduling_state.get("generated_question_payload"),
            question_support_payload=scheduling_state.get("manual_question_support_payload")
            or scheduling_state.get("generated_question_support_payload"),
        )

    def _row_to_study_answer_attempt_record(self, row: sqlite3.Row) -> StudyAnswerAttemptRecord:
        try:
            response = json.loads(row["response_json"] or "{}")
        except json.JSONDecodeError:
            response = {}
        if not isinstance(response, dict):
            response = {}
        is_correct = row["is_correct"]
        return StudyAnswerAttemptRecord(
            id=row["id"],
            review_card_id=row["review_card_id"],
            source_document_id=row["source_document_id"],
            document_title=row["document_title"],
            session_id=row["session_id"],
            question_type=row["question_type"],
            response=response,
            is_correct=None if is_correct is None else bool(is_correct),
            attempted_at=row["attempted_at"],
            review_event_id=row["review_event_id"],
            prompt=row["prompt"],
            correct_answer=row["answer"],
        )

    def _row_to_study_review_session_record(self, row: sqlite3.Row) -> StudyReviewSessionRecord:
        try:
            filter_snapshot = json.loads(row["filter_snapshot_json"] or "{}")
        except json.JSONDecodeError:
            filter_snapshot = {}
        try:
            settings_snapshot = json.loads(row["settings_snapshot_json"] or "{}")
        except json.JSONDecodeError:
            settings_snapshot = {}
        try:
            card_ids = json.loads(row["card_ids_json"] or "[]")
        except json.JSONDecodeError:
            card_ids = []
        try:
            summary = json.loads(row["summary_json"] or "{}")
        except json.JSONDecodeError:
            summary = {}
        return StudyReviewSessionRecord(
            id=row["id"],
            source_document_id=row["source_document_id"],
            filter_snapshot=filter_snapshot if isinstance(filter_snapshot, dict) else {},
            settings_snapshot=settings_snapshot if isinstance(settings_snapshot, dict) else {},
            card_ids=card_ids if isinstance(card_ids, list) else [],
            started_at=row["started_at"],
            completed_at=row["completed_at"],
            summary=summary if isinstance(summary, dict) else {},
        )

    @staticmethod
    def _dominant_knowledge_stage(stage_counts: dict[str, int]) -> str:
        if max((int(stage_counts.get(stage, 0)) for stage in STUDY_KNOWLEDGE_STAGE_ORDER), default=0) <= 0:
            return "new"
        return max(
            STUDY_KNOWLEDGE_STAGE_ORDER,
            key=lambda stage: (int(stage_counts.get(stage, 0)), STUDY_KNOWLEDGE_STAGE_ORDER.index(stage)),
        )

    @staticmethod
    def _knowledge_stage_count_models(stage_counts: dict[str, int]) -> list[StudyReviewProgressStageCount]:
        return [
            StudyReviewProgressStageCount(stage=stage, count=int(stage_counts.get(stage, 0)))
            for stage in STUDY_KNOWLEDGE_STAGE_ORDER
        ]

    def _build_study_habit_goal_status(
        self,
        *,
        review_rows: list[sqlite3.Row],
        settings: StudySettings,
        today: date,
    ) -> StudyReviewGoalStatus:
        review_dates: list[date] = []
        review_counts_by_date: dict[date, int] = {}
        for row in review_rows:
            reviewed_date = self._review_event_date(str(row["reviewed_at"]))
            if reviewed_date is None:
                continue
            review_dates.append(reviewed_date)
            review_counts_by_date[reviewed_date] = review_counts_by_date.get(reviewed_date, 0) + 1

        if settings.streak_goal_mode == "weekly":
            week_start = today - timedelta(days=today.weekday())
            week_end = week_start + timedelta(days=6)
            current_count = len({review_date for review_date in review_dates if week_start <= review_date <= week_end})
            target_count = int(settings.weekly_goal_days)
            history: list[StudyReviewGoalHistoryRow] = []
            for offset in range(5, -1, -1):
                period_start = week_start - timedelta(days=offset * 7)
                period_end = period_start + timedelta(days=6)
                count = len({review_date for review_date in review_dates if period_start <= review_date <= period_end})
                history.append(
                    StudyReviewGoalHistoryRow(
                        period_start=period_start.isoformat(),
                        period_end=period_end.isoformat(),
                        count=count,
                        target_count=target_count,
                        is_met=count >= target_count,
                    )
                )
            return StudyReviewGoalStatus(
                mode="weekly",
                target_count=target_count,
                current_count=current_count,
                remaining_count=max(target_count - current_count, 0),
                is_met=current_count >= target_count,
                period_start=week_start.isoformat(),
                period_end=week_end.isoformat(),
                next_reset_date=(week_end + timedelta(days=1)).isoformat(),
                recent_history=history,
            )

        target_count = int(settings.daily_goal_reviews)
        current_count = review_counts_by_date.get(today, 0)
        history = []
        for offset in range(6, -1, -1):
            period_date = today - timedelta(days=offset)
            count = review_counts_by_date.get(period_date, 0)
            history.append(
                StudyReviewGoalHistoryRow(
                    period_start=period_date.isoformat(),
                    period_end=period_date.isoformat(),
                    count=count,
                    target_count=target_count,
                    is_met=count >= target_count,
                )
            )
        return StudyReviewGoalStatus(
            mode="daily",
            target_count=target_count,
            current_count=current_count,
            remaining_count=max(target_count - current_count, 0),
            is_met=current_count >= target_count,
            period_start=today.isoformat(),
            period_end=today.isoformat(),
            next_reset_date=(today + timedelta(days=1)).isoformat(),
            recent_history=history,
        )

    def _build_study_memory_progress_snapshots(
        self,
        *,
        card_rows: list[sqlite3.Row],
        review_rows: list[sqlite3.Row],
        activity_start: date,
        today: date,
    ) -> list[StudyReviewProgressStageSnapshot]:
        date_keys = [
            activity_start + timedelta(days=offset)
            for offset in range((today - activity_start).days + 1)
        ]
        review_events_by_card: dict[str, list[tuple[date, str, str]]] = {}
        for row in review_rows:
            reviewed_date = self._review_event_date(str(row["reviewed_at"]))
            if reviewed_date is None:
                continue
            stage = self._study_knowledge_stage_from_review_event(row)
            review_events_by_card.setdefault(row["review_card_id"], []).append(
                (reviewed_date, str(row["reviewed_at"]), stage)
            )
        for events in review_events_by_card.values():
            events.sort(key=lambda event: (event[0], event[1]))

        card_entries: list[dict[str, Any]] = []
        for card_row in card_rows:
            created_date = self._iso_date_from_timestamp(
                str(card_row["created_at"] or card_row["updated_at"] or "")
            ) or today
            current_state = json.loads(card_row["scheduling_state_json"] or "{}")
            current_stage = study_knowledge_stage(current_state)
            has_reviewed_state = int(current_state.get("review_count", 0) or 0) > 0
            events = review_events_by_card.get(card_row["id"], [])
            if not events and has_reviewed_state:
                events = [(created_date, str(card_row["updated_at"] or card_row["created_at"]), current_stage)]
            card_entries.append(
                {
                    "created_date": created_date,
                    "events": events,
                }
            )

        snapshots: list[StudyReviewProgressStageSnapshot] = []
        for date_key in date_keys:
            stage_counts = {stage: 0 for stage in STUDY_KNOWLEDGE_STAGE_ORDER}
            for card_entry in card_entries:
                if card_entry["created_date"] > date_key:
                    continue
                stage = "new"
                for event_date, _reviewed_at, event_stage in card_entry["events"]:
                    if event_date > date_key:
                        break
                    stage = event_stage
                stage_counts[stage] += 1
            snapshots.append(
                StudyReviewProgressStageSnapshot(
                    date=date_key.isoformat(),
                    total_count=sum(stage_counts.values()),
                    stage_counts=self._knowledge_stage_count_models(stage_counts),
                )
            )
        return snapshots

    def _study_knowledge_stage_from_review_event(self, row: sqlite3.Row) -> str:
        try:
            scheduling_state = json.loads(row["event_scheduling_state_json"] or "{}")
        except json.JSONDecodeError:
            scheduling_state = {}
        if int(scheduling_state.get("review_count", 0) or 0) <= 0:
            scheduling_state["review_count"] = 1
        if scheduling_state.get("last_rating") not in {"forgot", "hard", "good", "easy"}:
            scheduling_state["last_rating"] = self._review_rating_label(row["rating"], row["event_scheduling_state_json"])
        return study_knowledge_stage(scheduling_state)

    @staticmethod
    def _iso_date_from_timestamp(value: str) -> date | None:
        try:
            return datetime.fromisoformat(value).date()
        except ValueError:
            return None

    @staticmethod
    def _review_event_date(reviewed_at: str) -> date | None:
        try:
            return datetime.fromisoformat(reviewed_at).date()
        except ValueError:
            return None

    @staticmethod
    def _review_rating_label(rating: int, scheduling_state_json: str | None) -> str:
        try:
            scheduling_state = json.loads(scheduling_state_json or "{}")
        except json.JSONDecodeError:
            scheduling_state = {}
        label = scheduling_state.get("last_rating")
        if label in {"forgot", "hard", "good", "easy"}:
            return label
        return {
            0: "forgot",
            1: "forgot",
            2: "hard",
            3: "good",
            4: "easy",
        }.get(int(rating), "forgot")

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

    def _sentence_count_from_view_json(self, view_json: str) -> int:
        try:
            view = DocumentView.model_validate_json(view_json)
        except ValueError:
            return 0
        return sum(len(sentence_texts_for_block(block)) for block in view.blocks)

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

    def _attachment_path_from_row_mapping(self, row: dict[str, Any]) -> Path:
        stored_path = Path(str(row["stored_path"]))
        if stored_path.is_absolute():
            return stored_path
        return self.database_path.parent / stored_path

    def _relative_attachment_path(self, attachment_path: Path) -> str:
        try:
            return attachment_path.relative_to(self.database_path.parent).as_posix()
        except ValueError:
            return f"files/{attachment_path.name}"

    def _is_safe_workspace_import_path(self, relative_path: str | None) -> bool:
        if not relative_path:
            return False
        normalized = relative_path.replace("\\", "/")
        if normalized.startswith("/") or normalized.startswith("../") or normalized == "..":
            return False
        return not any(part in {"", ".", ".."} for part in normalized.split("/"))

    def _restore_workspace_attachment_file(
        self,
        relative_path: str,
        payload: bytes | None,
        warnings: list[str],
    ) -> str | None:
        if not self._is_safe_workspace_import_path(relative_path):
            warnings.append(f"Skipped unsafe attachment path {relative_path}.")
            return None
        if payload is None:
            warnings.append(f"Backup was missing attachment payload {relative_path}.")
            return None
        normalized_path = relative_path.replace("\\", "/")
        target_path = self.database_path.parent / normalized_path
        target_path.parent.mkdir(parents=True, exist_ok=True)
        if target_path.exists() and target_path.read_bytes() != payload:
            suffix = target_path.suffix or ".bin"
            target_path = target_path.with_name(f"{target_path.stem}-{new_uuid7_str()}{suffix}")
            normalized_path = target_path.relative_to(self.database_path.parent).as_posix()
        if not target_path.exists():
            target_path.write_bytes(payload)
        return normalized_path

    def _restore_json_id_list(self, raw_value: str, id_map: dict[str, str]) -> list[str]:
        try:
            values = json.loads(raw_value or "[]")
        except json.JSONDecodeError:
            values = []
        if not isinstance(values, list):
            return []
        restored: list[str] = []
        for value in values:
            text_value = str(value)
            restored.append(id_map.get(text_value, text_value))
        return restored

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
                rn.anchor_kind,
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
                "anchor_kind": row["anchor_kind"],
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
                        "anchor_kind": row["anchor_kind"],
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
            scheduling_state = json.loads(row["scheduling_state_json"] or "{}")
            identity_payload = {
                "answer": row["answer"],
                "card_type": row["card_type"],
                "generated_question_payload": scheduling_state.get("generated_question_payload"),
                "generated_question_difficulty": scheduling_state.get("generated_question_difficulty"),
                "generated_question_support_payload": scheduling_state.get("generated_question_support_payload"),
                "manual_question_payload": scheduling_state.get("manual_question_payload"),
                "manual_question_difficulty": scheduling_state.get("manual_question_difficulty"),
                "manual_question_support_payload": scheduling_state.get("manual_question_support_payload"),
                "prompt": row["prompt"],
                "source_document_content_hash": row["content_hash"],
                "source_spans": source_spans,
            }
            payload = {
                **identity_payload,
                "scheduling_state": scheduling_state,
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
            event_scheduling_state = json.loads(row["scheduling_state_json"] or "{}")
            card_identity_payload = {
                "answer": row["answer"],
                "card_type": row["card_type"],
                "generated_question_payload": event_scheduling_state.get("generated_question_payload"),
                "generated_question_difficulty": event_scheduling_state.get("generated_question_difficulty"),
                "generated_question_support_payload": event_scheduling_state.get("generated_question_support_payload"),
                "manual_question_payload": event_scheduling_state.get("manual_question_payload"),
                "manual_question_difficulty": event_scheduling_state.get("manual_question_difficulty"),
                "manual_question_support_payload": event_scheduling_state.get("manual_question_support_payload"),
                "prompt": row["prompt"],
                "source_document_content_hash": row["content_hash"],
                "source_spans": source_spans,
            }
            card_key = f"review_card:{build_payload_digest(card_identity_payload)}"
            payload = {
                "rating": row["rating"],
                "reviewed_at": row["reviewed_at"],
                "scheduling_state": event_scheduling_state,
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

        attempt_rows = connection.execute(
            """
            SELECT
                saa.id,
                saa.review_card_id,
                saa.source_document_id,
                saa.session_id,
                saa.question_type,
                saa.response_json,
                saa.is_correct,
                saa.attempted_at,
                saa.review_event_id,
                rc.prompt,
                rc.answer,
                rc.card_type,
                rc.source_spans_json,
                rc.scheduling_state_json,
                sd.content_hash
            FROM study_answer_attempts saa
            INNER JOIN review_cards rc ON rc.id = saa.review_card_id
            INNER JOIN source_documents sd ON sd.id = saa.source_document_id
            ORDER BY saa.attempted_at ASC, saa.id ASC
            """
        ).fetchall()
        for row in attempt_rows:
            source_spans = json.loads(row["source_spans_json"] or "[]")
            scheduling_state = json.loads(row["scheduling_state_json"] or "{}")
            card_identity_payload = {
                "answer": row["answer"],
                "card_type": row["card_type"],
                "generated_question_payload": scheduling_state.get("generated_question_payload"),
                "generated_question_difficulty": scheduling_state.get("generated_question_difficulty"),
                "generated_question_support_payload": scheduling_state.get("generated_question_support_payload"),
                "manual_question_payload": scheduling_state.get("manual_question_payload"),
                "manual_question_difficulty": scheduling_state.get("manual_question_difficulty"),
                "manual_question_support_payload": scheduling_state.get("manual_question_support_payload"),
                "prompt": row["prompt"],
                "source_document_content_hash": row["content_hash"],
                "source_spans": source_spans,
            }
            card_key = f"review_card:{build_payload_digest(card_identity_payload)}"
            try:
                response = json.loads(row["response_json"] or "{}")
            except json.JSONDecodeError:
                response = {}
            if not isinstance(response, dict):
                response = {}
            payload = {
                "attempted_at": row["attempted_at"],
                "is_correct": None if row["is_correct"] is None else bool(row["is_correct"]),
                "question_type": row["question_type"],
                "response": response,
                "review_card_key": card_key,
                "review_event_id": row["review_event_id"],
                "session_id": row["session_id"],
            }
            entities.append(
                PortableEntityDigest(
                    entity_type="study_answer_attempt",
                    entity_key=f"study_answer_attempt:{row['id']}",
                    entity_id=row["id"],
                    updated_at=row["attempted_at"],
                    payload_digest=build_payload_digest(payload),
                    source_document_id=row["source_document_id"],
                    metadata={
                        "is_correct": payload["is_correct"],
                        "question_type": row["question_type"],
                        "review_card_key": card_key,
                    },
                )
            )

        session_rows = connection.execute(
            """
            SELECT
                srs.*,
                sd.content_hash
            FROM study_review_sessions srs
            LEFT JOIN source_documents sd ON sd.id = srs.source_document_id
            ORDER BY srs.started_at ASC, srs.id ASC
            """
        ).fetchall()
        for row in session_rows:
            try:
                filter_snapshot = json.loads(row["filter_snapshot_json"] or "{}")
            except json.JSONDecodeError:
                filter_snapshot = {}
            try:
                settings_snapshot = json.loads(row["settings_snapshot_json"] or "{}")
            except json.JSONDecodeError:
                settings_snapshot = {}
            try:
                card_ids = json.loads(row["card_ids_json"] or "[]")
            except json.JSONDecodeError:
                card_ids = []
            try:
                summary = json.loads(row["summary_json"] or "{}")
            except json.JSONDecodeError:
                summary = {}
            payload = {
                "card_ids": card_ids if isinstance(card_ids, list) else [],
                "completed_at": row["completed_at"],
                "filter_snapshot": filter_snapshot if isinstance(filter_snapshot, dict) else {},
                "settings_snapshot": settings_snapshot if isinstance(settings_snapshot, dict) else {},
                "source_document_content_hash": row["content_hash"],
                "started_at": row["started_at"],
                "summary": summary if isinstance(summary, dict) else {},
            }
            entities.append(
                PortableEntityDigest(
                    entity_type="study_review_session",
                    entity_key=f"study_review_session:{row['id']}",
                    entity_id=row["id"],
                    updated_at=row["updated_at"],
                    payload_digest=build_payload_digest(payload),
                    source_document_id=row["source_document_id"],
                    metadata={
                        "card_count": len(payload["card_ids"]),
                        "completed_at": row["completed_at"],
                        "started_at": row["started_at"],
                    },
                )
            )

        entities.sort(key=lambda entity: (entity.entity_type, entity.entity_key, entity.updated_at, entity.entity_id))
        return entities

    def _render_recall_learning_pack_markdown(
        self,
        *,
        document: RecallDocumentRecord,
        source_markdown: str,
        notes: list[RecallNoteRecord],
        graph_nodes: list[KnowledgeNodeRecord],
        graph_edges: list[KnowledgeEdgeRecord],
        graph_mentions: list[KnowledgeMentionRecord],
        study_cards: list[StudyCardRecord],
        study_progress: StudyReviewProgress,
        source_metadata: dict[str, Any],
        collection_names: list[str],
    ) -> str:
        lines = [
            source_markdown.rstrip(),
            "",
            "## Learning Pack",
            "",
            f"- Source: {document.title}",
            f"- Exported at: {now_iso()}",
            f"- Study reviews: {study_progress.total_reviews}",
            f"- Study attempts: {study_progress.total_attempts}",
            f"- Study accuracy: {self._format_learning_pack_accuracy(study_progress.accuracy)}",
            f"- Study cards: {len(study_cards)}",
            f"- Notebook notes: {len(notes)}",
            f"- Graph nodes: {len(graph_nodes)}",
            "",
        ]
        batch_import = source_metadata.get("batch_import") if isinstance(source_metadata, dict) else None
        if collection_names or isinstance(batch_import, dict):
            lines.extend(["### Source Provenance", ""])
            if collection_names:
                lines.append(f"- Collections: {', '.join(collection_names)}")
            else:
                lines.append("- Collections: none")
            if isinstance(batch_import, dict):
                source_format = normalize_whitespace(str(batch_import.get("source_format") or ""))
                folder = normalize_whitespace(str(batch_import.get("folder") or ""))
                tags = [
                    normalize_whitespace(str(tag))
                    for tag in batch_import.get("tags", [])
                    if normalize_whitespace(str(tag))
                ]
                imported_at = normalize_whitespace(str(batch_import.get("imported_at") or ""))
                if source_format:
                    lines.append(f"- Imported from: {source_format}")
                if folder:
                    lines.append(f"- Archive folder: {folder}")
                if tags:
                    lines.append(f"- Archive tags: {', '.join(tags)}")
                if imported_at:
                    lines.append(f"- Imported at: {imported_at}")
            lines.append("")

        lines.extend(["### Source Review Summary", ""])
        if study_progress.habit_goal:
            goal = study_progress.habit_goal
            lines.extend(
                [
                    f"- Goal mode: {goal.mode}",
                    f"- Goal progress: {goal.current_count}/{goal.target_count}",
                    f"- Goal remaining: {goal.remaining_count}",
                    f"- Goal met: {'yes' if goal.is_met else 'no'}",
                ]
            )
        else:
            lines.append("- Goal progress: not configured")
        if study_progress.last_reviewed_at:
            lines.append(f"- Last reviewed: {study_progress.last_reviewed_at}")
        lines.append("")

        lines.extend(["### Notebook Notes", ""])
        if notes:
            for note in notes:
                anchor_kind = note.anchor.kind or "sentence"
                note_body = normalize_whitespace(note.body_text or "") or "No note body."
                lines.append(f"- {anchor_kind.title()} note updated {note.updated_at}")
                lines.append(f"  - Anchor: {self._truncate_text(normalize_whitespace(note.anchor.anchor_text), 160)}")
                lines.append(f"  - Excerpt: {self._truncate_text(normalize_whitespace(note.anchor.excerpt_text), 220)}")
                lines.append(f"  - Note: {self._truncate_text(note_body, 320)}")
        else:
            lines.append("No Notebook notes are attached to this source.")
        lines.append("")

        lines.extend(["### Graph Memory", ""])
        if graph_nodes:
            lines.append("#### Nodes")
            lines.append("")
            for node in graph_nodes:
                description = normalize_whitespace(node.description or "") or "No description."
                lines.append(
                    f"- {node.label} ({node.node_type}, {node.status}, confidence {node.confidence:.2f}): "
                    f"{self._truncate_text(description, 220)}"
                )
        else:
            lines.append("No graph nodes are attached to this source.")
        if graph_edges:
            lines.extend(["", "#### Relations", ""])
            for edge in graph_edges:
                excerpt = normalize_whitespace(edge.excerpt or "") or "No excerpt."
                lines.append(
                    f"- {edge.source_label} - {edge.relation_type} - {edge.target_label} "
                    f"({edge.status}, confidence {edge.confidence:.2f}): {self._truncate_text(excerpt, 220)}"
                )
        if graph_mentions:
            lines.extend(["", "#### Mentions", ""])
            for mention in graph_mentions[:12]:
                lines.append(
                    f"- {mention.text} ({mention.entity_type}, confidence {mention.confidence:.2f}): "
                    f"{self._truncate_text(normalize_whitespace(mention.excerpt), 220)}"
                )
            if len(graph_mentions) > 12:
                lines.append(f"- {len(graph_mentions) - 12} more mentions omitted from this compact export.")
        lines.append("")

        lines.extend(["### Study Questions", ""])
        if study_cards:
            for index, card in enumerate(study_cards, start=1):
                lines.append(
                    f"{index}. {card.prompt} [{card.card_type}, {card.question_difficulty}, {card.status}, "
                    f"{card.knowledge_stage}]"
                )
                lines.append(f"   - Answer: {self._truncate_text(normalize_whitespace(card.answer), 320)}")
                payload_summary = self._study_question_payload_summary(card)
                if payload_summary:
                    lines.append(f"   - Question payload: {payload_summary}")
                if card.question_support_payload:
                    support = card.question_support_payload
                    if support.hint:
                        lines.append(f"   - Hint: {self._truncate_text(normalize_whitespace(support.hint), 220)}")
                    if support.explanation:
                        lines.append(
                            f"   - Explanation: {self._truncate_text(normalize_whitespace(support.explanation), 320)}"
                        )
                    if support.source_excerpt:
                        lines.append(
                            f"   - Source excerpt: {self._truncate_text(normalize_whitespace(support.source_excerpt), 320)}"
                        )
        else:
            lines.append("No visible Study questions are attached to this source.")
        lines.append("")

        lines.extend(["### Recent Study Attempts", ""])
        if study_progress.recent_attempts:
            for attempt in study_progress.recent_attempts:
                correctness = (
                    "self-rated"
                    if attempt.is_correct is None
                    else "correct"
                    if attempt.is_correct
                    else "incorrect"
                )
                response = json.dumps(attempt.response, ensure_ascii=True, sort_keys=True)
                lines.append(
                    f"- {attempt.attempted_at}: {correctness} {attempt.question_type} attempt on "
                    f"\"{self._truncate_text(normalize_whitespace(attempt.prompt), 120)}\""
                )
                lines.append(f"  - Response: `{self._truncate_text(response, 240)}`")
                if attempt.review_event_id:
                    lines.append(f"  - Linked review event: {attempt.review_event_id}")
        else:
            lines.append("No answer attempts are recorded for this source.")
        lines.append("")

        lines.extend(["### Recent Review Sessions", ""])
        if study_progress.recent_sessions:
            for session in study_progress.recent_sessions:
                summary = json.dumps(session.summary, ensure_ascii=True, sort_keys=True)
                completed = session.completed_at or "incomplete"
                lines.append(
                    f"- {session.started_at} to {completed}: {len(session.card_ids)} "
                    f"{'card' if len(session.card_ids) == 1 else 'cards'}"
                )
                lines.append(f"  - Session: {session.id}")
                if session.summary:
                    lines.append(f"  - Summary: `{self._truncate_text(summary, 320)}`")
        else:
            lines.append("No review sessions are recorded for this source.")

        return "\n".join(lines).strip() + "\n"

    def _study_question_payload_summary(self, card: StudyCardRecord) -> str | None:
        payload = card.question_payload
        if not payload:
            return None
        payload_data = payload.model_dump() if hasattr(payload, "model_dump") else payload
        if not isinstance(payload_data, dict):
            return None
        kind = str(payload_data.get("kind") or "")
        if kind in {"multiple_choice", "true_false", "fill_in_blank"}:
            choices = [
                normalize_whitespace(str(choice.get("text") or ""))
                for choice in payload_data.get("choices", [])
                if isinstance(choice, dict)
            ]
            choices = [choice for choice in choices if choice]
            template = normalize_whitespace(str(payload_data.get("template") or ""))
            parts = []
            if template:
                parts.append(f"template: {self._truncate_text(template, 160)}")
            if choices:
                parts.append(f"choices: {', '.join(choices[:6])}")
            return "; ".join(parts) or None
        if kind == "matching":
            pairs = [
                f"{normalize_whitespace(str(pair.get('left') or ''))} -> {normalize_whitespace(str(pair.get('right') or ''))}"
                for pair in payload_data.get("pairs", [])
                if isinstance(pair, dict)
            ]
            pairs = [pair for pair in pairs if pair != " -> "]
            return f"pairs: {'; '.join(pairs[:8])}" if pairs else None
        if kind == "ordering":
            items = [
                normalize_whitespace(str(item.get("text") or ""))
                for item in payload_data.get("items", [])
                if isinstance(item, dict)
            ]
            items = [item for item in items if item]
            return f"order: {' -> '.join(items[:8])}" if items else None
        return None

    def _normalize_library_settings_with_connection(
        self,
        connection: sqlite3.Connection,
        settings: LibrarySettings,
        *,
        timestamp: str | None = None,
        strict: bool = False,
    ) -> LibrarySettings:
        candidate_collections: list[LibraryCollection] = []
        seen_collection_ids: set[str] = set()
        effective_timestamp = timestamp or now_iso()
        for index, collection in enumerate(settings.custom_collections):
            collection_id = normalize_whitespace(collection.id)
            name = normalize_whitespace(collection.name)
            if not collection_id or not name:
                continue
            if collection_id in seen_collection_ids:
                if strict:
                    raise ValueError("Library collection ids must be unique.")
                continue
            document_ids = self._valid_library_document_ids_with_connection(connection, collection.document_ids)
            candidate_collections.append(
                LibraryCollection(
                    id=collection_id,
                    name=name,
                    document_ids=document_ids,
                    origin=collection.origin,
                    parent_id=collection.parent_id,
                    source_format=collection.source_format,
                    sort_index=collection.sort_index if collection.sort_index is not None else index,
                    created_at=collection.created_at or effective_timestamp,
                    updated_at=collection.updated_at or effective_timestamp,
                )
            )
            seen_collection_ids.add(collection_id)

        collection_ids = {collection.id for collection in candidate_collections}
        parent_by_id: dict[str, str | None] = {}
        for collection in candidate_collections:
            parent_id = collection.parent_id
            if parent_id == collection.id:
                if strict:
                    raise ValueError("Library collections cannot be their own parent.")
                parent_id = None
            elif parent_id and parent_id not in collection_ids:
                if strict:
                    raise ValueError("Library collection parent_id must reference an existing collection.")
                parent_id = None
            parent_by_id[collection.id] = parent_id

        for collection in candidate_collections:
            seen_path: set[str] = set()
            current_id: str | None = collection.id
            depth = 0
            while current_id:
                if current_id in seen_path:
                    if strict:
                        raise ValueError("Library collection parent_id values cannot form a cycle.")
                    parent_by_id[collection.id] = None
                    break
                seen_path.add(current_id)
                depth += 1
                if depth > 5:
                    if strict:
                        raise ValueError("Library collection nesting is limited to five levels.")
                    parent_by_id[collection.id] = None
                    break
                current_id = parent_by_id.get(current_id)

        normalized_collections: list[LibraryCollection] = []
        seen_sibling_names: set[tuple[str, str]] = set()
        for collection in candidate_collections:
            parent_id = parent_by_id.get(collection.id)
            sibling_key = (parent_id or "", collection.name.casefold())
            if sibling_key in seen_sibling_names:
                if strict:
                    raise ValueError("Library collection names must be unique within the same parent.")
                continue
            normalized_collections.append(
                LibraryCollection(
                    id=collection.id,
                    name=collection.name,
                    document_ids=collection.document_ids,
                    origin=collection.origin,
                    parent_id=parent_id,
                    source_format=collection.source_format,
                    sort_index=collection.sort_index,
                    created_at=collection.created_at,
                    updated_at=collection.updated_at,
                )
            )
            seen_sibling_names.add(sibling_key)
        return LibrarySettings(custom_collections=normalized_collections)

    def _valid_library_document_ids_with_connection(
        self,
        connection: sqlite3.Connection,
        document_ids: list[str],
    ) -> list[str]:
        requested_ids = self._dedupe_texts(document_ids)
        if not requested_ids:
            return []
        placeholders = ", ".join("?" for _ in requested_ids)
        rows = connection.execute(
            f"SELECT id FROM source_documents WHERE id IN ({placeholders})",
            tuple(requested_ids),
        ).fetchall()
        valid_ids = {row["id"] for row in rows}
        return [document_id for document_id in requested_ids if document_id in valid_ids]

    def _library_collection_descendant_ids(
        self,
        settings: LibrarySettings,
        collection_id: str,
    ) -> list[str]:
        descendants = [collection_id]
        queue = [collection_id]
        while queue:
            parent_id = queue.pop(0)
            child_ids = [
                collection.id
                for collection in settings.custom_collections
                if collection.parent_id == parent_id and collection.id not in descendants
            ]
            descendants.extend(child_ids)
            queue.extend(child_ids)
        return descendants

    def _library_collection_document_ids_with_connection(
        self,
        connection: sqlite3.Connection,
        settings: LibrarySettings,
        collection_id: str,
    ) -> list[str]:
        descendant_ids = set(self._library_collection_descendant_ids(settings, collection_id))
        document_ids: list[str] = []
        for collection in settings.custom_collections:
            if collection.id in descendant_ids:
                document_ids.extend(collection.document_ids)
        return self._valid_library_document_ids_with_connection(connection, document_ids)

    @staticmethod
    def _library_collection_path(
        settings: LibrarySettings,
        collection_id: str,
    ) -> list[LibraryCollection]:
        collection_by_id = {collection.id: collection for collection in settings.custom_collections}
        path: list[LibraryCollection] = []
        current = collection_by_id.get(collection_id)
        visited: set[str] = set()
        while current and current.id not in visited:
            visited.add(current.id)
            path.append(current)
            current = collection_by_id.get(current.parent_id or "")
        return list(reversed(path))

    @staticmethod
    def _library_collection_names_for_document_with_connection(
        settings: LibrarySettings,
        document_id: str,
    ) -> list[str]:
        collection_by_id = {collection.id: collection for collection in settings.custom_collections}
        names: list[str] = []
        seen_names: set[str] = set()

        def add_collection_and_ancestors(collection: LibraryCollection) -> None:
            ancestor_chain: list[LibraryCollection] = []
            current: LibraryCollection | None = collection
            visited: set[str] = set()
            while current and current.id not in visited:
                visited.add(current.id)
                ancestor_chain.append(current)
                current = collection_by_id.get(current.parent_id or "")
            for candidate in reversed(ancestor_chain):
                normalized_name = normalize_whitespace(candidate.name)
                key = normalized_name.casefold()
                if normalized_name and key not in seen_names:
                    names.append(normalized_name)
                    seen_names.add(key)

        for collection in settings.custom_collections:
            if document_id in collection.document_ids:
                add_collection_and_ancestors(collection)
        return names

    @staticmethod
    def _dedupe_texts(values: list[str]) -> list[str]:
        normalized_values: list[str] = []
        seen: set[str] = set()
        for value in values:
            normalized = normalize_whitespace(str(value))
            if not normalized:
                continue
            key = normalized.casefold()
            if key in seen:
                continue
            normalized_values.append(normalized)
            seen.add(key)
        return normalized_values

    @staticmethod
    def _library_import_collection_id(path: tuple[str, ...] | list[str] | str, source_format: BatchResolvedImportFormat) -> str:
        if isinstance(path, str):
            normalized_path = normalize_whitespace(path).casefold()
        else:
            normalized_path = "/".join(normalize_whitespace(part).casefold() for part in path if normalize_whitespace(part))
        key = f"{source_format}|{normalized_path}"
        return f"collection:{sha256(key.encode('utf-8')).hexdigest()[:16]}"

    @staticmethod
    def _find_library_collection_index(
        collections: list[LibraryCollection],
        *,
        collection_id: str,
        name: str,
        parent_id: str | None,
    ) -> int | None:
        for index, collection in enumerate(collections):
            if collection.id == collection_id:
                return index
        normalized_name = normalize_whitespace(name).casefold()
        for index, collection in enumerate(collections):
            if (collection.parent_id or None) == (parent_id or None) and collection.name.casefold() == normalized_name:
                return index
        return None

    def _learning_pack_filename(self, document: RecallDocumentRecord) -> str:
        plain_filename = build_export_filename(document.title)
        stem = plain_filename[:-3] if plain_filename.endswith(".md") else plain_filename
        return f"{stem}-learning-pack.md"

    def _learning_pack_archive_path(self, document: RecallDocumentRecord) -> str:
        plain_filename = build_export_filename(document.title)
        stem = plain_filename[:-3] if plain_filename.endswith(".md") else plain_filename
        return f"sources/{stem}-{document.id}/learning-pack.md"

    def _missing_learning_pack_view_warnings_with_connection(self, connection: sqlite3.Connection) -> list[str]:
        rows = connection.execute(
            """
            SELECT sd.id, sd.title
            FROM source_documents sd
            WHERE NOT EXISTS (
                SELECT 1
                FROM document_variants dv
                WHERE dv.source_document_id = sd.id
                  AND dv.mode = 'reflowed'
                  AND dv.detail_level = 'default'
            )
            ORDER BY sd.updated_at DESC, sd.id DESC
            """
        ).fetchall()
        return [
            f"Missing reflowed/default view for learning-pack export: {row['title']} ({row['id']})."
            for row in rows
        ]

    @staticmethod
    def _format_learning_pack_accuracy(accuracy: float | None) -> str:
        if accuracy is None:
            return "not enough graded attempts"
        return f"{round(accuracy * 100, 1)}%"

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
