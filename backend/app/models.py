from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator


DocumentMode = Literal["original", "reflowed", "simplified", "summary"]
DetailLevel = Literal["default", "short", "balanced", "detailed"]
BlockKind = Literal["heading", "paragraph", "list_item", "quote"]


class ViewBlock(BaseModel):
    id: str
    kind: BlockKind
    text: str = Field(min_length=1)
    level: int | None = Field(default=None, ge=1, le=6)
    metadata: dict[str, Any] = Field(default_factory=dict)


class DocumentView(BaseModel):
    mode: DocumentMode
    detail_level: DetailLevel = "default"
    title: str
    blocks: list[ViewBlock]
    variant_metadata: dict[str, Any] = Field(default_factory=dict)
    generated_by: Literal["local", "openai"]
    cached: bool = False
    source_hash: str
    model: str | None = None
    updated_at: str


class SourceDocument(BaseModel):
    id: str
    title: str
    source_type: str
    file_name: str | None = None
    source_locator: str | None = None
    stored_path: str | None = None
    content_hash: str
    created_at: str
    updated_at: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class DocumentVariant(BaseModel):
    id: str
    source_document_id: str
    mode: DocumentMode
    detail_level: DetailLevel = "default"
    generated_by: Literal["local", "openai"]
    source_hash: str
    title: str
    blocks: list[ViewBlock]
    created_at: str
    updated_at: str
    model: str | None = None


class ContentChunk(BaseModel):
    id: str
    source_document_id: str
    variant_id: str | None = None
    block_id: str | None = None
    ordinal: int = Field(default=0, ge=0)
    text: str = Field(min_length=1)
    metadata: dict[str, Any] = Field(default_factory=dict)


class EntityMention(BaseModel):
    id: str
    source_document_id: str
    variant_id: str | None = None
    block_id: str | None = None
    text: str = Field(min_length=1)
    normalized_text: str | None = None
    entity_type: str = Field(min_length=1)
    start_offset: int | None = Field(default=None, ge=0)
    end_offset: int | None = Field(default=None, ge=0)
    confidence: float | None = Field(default=None, ge=0, le=1)
    metadata: dict[str, Any] = Field(default_factory=dict)


class KnowledgeNode(BaseModel):
    id: str
    label: str = Field(min_length=1)
    node_type: str = Field(min_length=1)
    description: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)
    metadata: dict[str, Any] = Field(default_factory=dict)


class RelationEvidence(BaseModel):
    id: str
    source_document_id: str
    variant_id: str | None = None
    block_id: str | None = None
    excerpt: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)
    metadata: dict[str, Any] = Field(default_factory=dict)


class KnowledgeEdge(BaseModel):
    id: str
    source_id: str
    target_id: str
    relation_type: str = Field(min_length=1)
    provenance: Literal["manual", "inferred"] = "inferred"
    confidence: float | None = Field(default=None, ge=0, le=1)
    evidence: list[RelationEvidence] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


GraphReviewStatus = Literal["suggested", "confirmed", "rejected"]
StudyCardStatus = Literal["new", "due", "scheduled", "unscheduled"]
StudyManualCardType = Literal[
    "short_answer",
    "flashcard",
    "multiple_choice",
    "true_false",
    "fill_in_blank",
    "matching",
    "ordering",
]
BrowserTriggerMode = Literal["selection", "page", "none"]


class ReviewCard(BaseModel):
    id: str
    source_document_id: str
    prompt: str = Field(min_length=1)
    answer: str = Field(min_length=1)
    card_type: str = "short_answer"
    source_spans: list[dict[str, Any]] = Field(default_factory=list)
    scheduling_state: dict[str, Any] = Field(default_factory=dict)
    created_at: str
    updated_at: str


class ReviewEvent(BaseModel):
    id: str
    review_card_id: str
    rating: int = Field(ge=0, le=4)
    reviewed_at: str
    scheduling_state: dict[str, Any] = Field(default_factory=dict)


class RetrievalHit(BaseModel):
    id: str
    source_document_id: str
    score: float
    reason: str | None = None
    excerpt: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class AttachmentRef(BaseModel):
    id: str
    source_document_id: str
    file_name: str
    media_type: str | None = None
    relative_path: str
    logical_key: str | None = None
    content_digest: str | None = None
    byte_size: int | None = Field(default=None, ge=0)
    updated_at: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class RecallDocumentPreview(BaseModel):
    document_id: str
    kind: Literal["image", "fallback"]
    source: Literal[
        "attachment-image",
        "content-rendered-preview",
        "html-meta-image",
        "html-inline-image",
        "html-preload-image",
        "html-rendered-snapshot",
        "fallback",
    ]
    asset_url: str | None = None
    updated_at: str


class ChangeEvent(BaseModel):
    id: str
    entity_type: str
    entity_id: str
    event_type: str
    payload: dict[str, Any] = Field(default_factory=dict)
    device_id: str = "desktop-local"
    created_at: str


class WorkspaceChangeLogPage(BaseModel):
    events: list[ChangeEvent] = Field(default_factory=list)
    next_cursor: str | None = None
    has_more: bool = False
    latest_cursor: str | None = None


class WorkspaceIntegrityIssue(BaseModel):
    code: str
    severity: Literal["warning", "critical"] = "warning"
    message: str
    repairable: bool = True
    metadata: dict[str, Any] = Field(default_factory=dict)


class WorkspaceIntegrityReport(BaseModel):
    ok: bool = True
    checked_at: str
    schema_version: str
    quick_check: str = "ok"
    counts: dict[str, int] = Field(default_factory=dict)
    issues: list[WorkspaceIntegrityIssue] = Field(default_factory=list)
    last_repair_at: str | None = None


class WorkspaceRepairResult(BaseModel):
    ok: bool = True
    repaired_at: str
    actions: list[str] = Field(default_factory=list)
    report: WorkspaceIntegrityReport


class PortableEntityDigest(BaseModel):
    entity_type: str
    entity_key: str
    entity_id: str
    updated_at: str
    payload_digest: str
    source_document_id: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class WorkspaceExportManifest(BaseModel):
    format_version: str = "1"
    schema_version: str
    device_id: str
    exported_at: str
    latest_change_id: str | None = None
    change_event_count: int = Field(default=0, ge=0)
    entity_counts: dict[str, int] = Field(default_factory=dict)
    entities: list[PortableEntityDigest] = Field(default_factory=list)
    attachments: list[AttachmentRef] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class WorkspaceMergePreviewRequest(BaseModel):
    manifest: WorkspaceExportManifest


class WorkspaceMergeOperation(BaseModel):
    entity_type: str
    entity_key: str
    entity_id: str | None = None
    remote_entity_id: str | None = None
    decision: Literal["import_remote", "skip_equal", "keep_local", "prefer_remote"]
    reason: str
    local_updated_at: str | None = None
    remote_updated_at: str | None = None
    local_digest: str | None = None
    remote_digest: str | None = None


class WorkspaceMergePreview(BaseModel):
    operations: list[WorkspaceMergeOperation] = Field(default_factory=list)
    summary: dict[str, int] = Field(default_factory=dict)


class ReadingSession(BaseModel):
    id: str
    source_document_id: str
    mode: DocumentMode
    sentence_index: int = Field(default=0, ge=0)
    session_kind: str = "reader"
    device_id: str = "desktop-local"
    created_at: str
    updated_at: str


class DocumentRecord(BaseModel):
    id: str
    title: str
    source_type: str
    file_name: str | None = None
    created_at: str
    updated_at: str
    available_modes: list[DocumentMode] = Field(default_factory=list)
    progress_by_mode: dict[str, int] = Field(default_factory=dict)
    last_reader_session: ReaderSessionState | None = None


class RecallDocumentRecord(BaseModel):
    id: str
    title: str
    source_type: str
    file_name: str | None = None
    source_locator: str | None = None
    created_at: str
    updated_at: str
    available_modes: list[DocumentMode] = Field(default_factory=list)
    chunk_count: int = Field(default=0, ge=0)


class RecallNoteAnchor(BaseModel):
    kind: Literal["sentence", "source"] = "sentence"
    source_document_id: str
    variant_id: str
    block_id: str
    sentence_start: int = Field(default=0, ge=0)
    sentence_end: int = Field(default=0, ge=0)
    global_sentence_start: int | None = Field(default=None, ge=0)
    global_sentence_end: int | None = Field(default=None, ge=0)
    anchor_text: str = Field(min_length=1)
    excerpt_text: str = Field(min_length=1)


class RecallNoteRecord(BaseModel):
    id: str
    anchor: RecallNoteAnchor
    body_text: str | None = None
    created_at: str
    updated_at: str


class RecallNoteCreateRequest(BaseModel):
    anchor: RecallNoteAnchor
    body_text: str | None = None


class RecallNoteUpdateRequest(BaseModel):
    body_text: str | None = None


class RecallNoteSearchHit(BaseModel):
    id: str
    anchor: RecallNoteAnchor
    document_title: str
    score: float
    body_text: str | None = None
    created_at: str
    updated_at: str


class RecallNoteGraphPromotionRequest(BaseModel):
    label: str = Field(min_length=1)
    description: str | None = None


class RecallNoteStudyPromotionRequest(BaseModel):
    prompt: str = Field(min_length=1)
    answer: str = Field(min_length=1)


class RecallSearchHit(BaseModel):
    id: str
    source_document_id: str
    document_title: str
    score: float
    excerpt: str
    chunk_id: str
    block_id: str | None = None
    match_context: str


class KnowledgeNodeRecord(BaseModel):
    id: str
    label: str
    node_type: str
    description: str | None = None
    confidence: float = Field(default=0.0, ge=0, le=1)
    mention_count: int = Field(default=0, ge=0)
    document_count: int = Field(default=0, ge=0)
    status: GraphReviewStatus = "suggested"
    aliases: list[str] = Field(default_factory=list)
    source_document_ids: list[str] = Field(default_factory=list)


class KnowledgeEdgeRecord(BaseModel):
    id: str
    source_id: str
    source_label: str
    target_id: str
    target_label: str
    relation_type: str
    provenance: Literal["manual", "inferred"] = "inferred"
    confidence: float = Field(default=0.0, ge=0, le=1)
    status: GraphReviewStatus = "suggested"
    evidence_count: int = Field(default=0, ge=0)
    source_document_ids: list[str] = Field(default_factory=list)
    excerpt: str | None = None


class KnowledgeMentionRecord(BaseModel):
    id: str
    source_document_id: str
    document_title: str
    text: str
    entity_type: str
    confidence: float = Field(default=0.0, ge=0, le=1)
    block_id: str | None = None
    chunk_id: str | None = None
    excerpt: str
    anchor_kind: Literal["sentence", "source"] | None = None
    manual_source: str | None = None
    note_anchor_text: str | None = None
    note_body: str | None = None
    note_id: str | None = None


class KnowledgeNodeDetail(BaseModel):
    node: KnowledgeNodeRecord
    mentions: list[KnowledgeMentionRecord] = Field(default_factory=list)
    outgoing_edges: list[KnowledgeEdgeRecord] = Field(default_factory=list)
    incoming_edges: list[KnowledgeEdgeRecord] = Field(default_factory=list)


class KnowledgeGraphSnapshot(BaseModel):
    nodes: list[KnowledgeNodeRecord] = Field(default_factory=list)
    edges: list[KnowledgeEdgeRecord] = Field(default_factory=list)
    document_count: int = Field(default=0, ge=0)
    pending_nodes: int = Field(default=0, ge=0)
    pending_edges: int = Field(default=0, ge=0)
    confirmed_nodes: int = Field(default=0, ge=0)
    confirmed_edges: int = Field(default=0, ge=0)


class GraphDecisionRequest(BaseModel):
    decision: Literal["confirmed", "rejected"]


class RecallRetrievalHit(BaseModel):
    id: str
    hit_type: Literal["chunk", "node", "card", "note"]
    source_document_id: str
    document_title: str
    title: str
    score: float
    excerpt: str
    reasons: list[str] = Field(default_factory=list)
    chunk_id: str | None = None
    node_id: str | None = None
    card_id: str | None = None
    note_id: str | None = None
    note_anchor: RecallNoteAnchor | None = None


class BrowserSavedPageMatch(BaseModel):
    source_document_id: str
    document_title: str
    source_locator: str


class BrowserContextRequest(BaseModel):
    page_url: str = Field(min_length=1)
    page_title: str | None = None
    selection_text: str | None = None
    page_excerpt: str | None = None
    meta_description: str | None = None
    manual: bool = False
    limit: int = Field(default=5, ge=1, le=10)


class BrowserContextResponse(BaseModel):
    query: str = ""
    trigger_mode: BrowserTriggerMode = "none"
    should_prompt: bool = False
    summary: str
    suppression_reasons: list[str] = Field(default_factory=list)
    page_fingerprint: str
    matched_document: BrowserSavedPageMatch | None = None
    hits: list[RecallRetrievalHit] = Field(default_factory=list)


class BrowserRecallNoteCreateRequest(BaseModel):
    page_url: str = Field(min_length=1)
    selection_text: str = Field(min_length=1)
    body_text: str | None = None


StudyKnowledgeStage = Literal["new", "learning", "practiced", "confident", "mastered"]


class StudyCardChoiceOption(BaseModel):
    id: str = Field(min_length=1)
    text: str = Field(min_length=1)

    @field_validator("id", "text")
    @classmethod
    def normalize_required_text(cls, value: str) -> str:
        normalized = " ".join(value.split())
        if not normalized:
            raise ValueError("Text cannot be blank.")
        return normalized


class StudyCardMatchingPair(BaseModel):
    id: str = Field(min_length=1)
    left: str = Field(min_length=1)
    right: str = Field(min_length=1)

    @field_validator("id", "left", "right")
    @classmethod
    def normalize_required_text(cls, value: str) -> str:
        normalized = " ".join(value.split())
        if not normalized:
            raise ValueError("Text cannot be blank.")
        return normalized


class StudyCardOrderingItem(BaseModel):
    id: str = Field(min_length=1)
    text: str = Field(min_length=1)

    @field_validator("id", "text")
    @classmethod
    def normalize_required_text(cls, value: str) -> str:
        normalized = " ".join(value.split())
        if not normalized:
            raise ValueError("Text cannot be blank.")
        return normalized


class StudyCardQuestionPayload(BaseModel):
    kind: Literal["multiple_choice", "true_false", "fill_in_blank", "matching", "ordering"]
    choices: list[StudyCardChoiceOption] = Field(default_factory=list)
    correct_choice_id: str | None = None
    template: str | None = None
    pairs: list[StudyCardMatchingPair] = Field(default_factory=list)
    items: list[StudyCardOrderingItem] = Field(default_factory=list)

    @field_validator("correct_choice_id", "template")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = " ".join(value.split())
        if not normalized:
            raise ValueError("Text cannot be blank.")
        return normalized


class StudyCardRecord(BaseModel):
    id: str
    source_document_id: str
    document_title: str
    prompt: str
    answer: str
    card_type: str
    source_spans: list[dict[str, Any]] = Field(default_factory=list)
    scheduling_state: dict[str, Any] = Field(default_factory=dict)
    due_at: str
    review_count: int = Field(default=0, ge=0)
    status: StudyCardStatus = "new"
    last_rating: Literal["forgot", "hard", "good", "easy"] | None = None
    knowledge_stage: StudyKnowledgeStage = "new"
    question_payload: StudyCardQuestionPayload | None = None


class StudyOverview(BaseModel):
    due_count: int = Field(default=0, ge=0)
    new_count: int = Field(default=0, ge=0)
    scheduled_count: int = Field(default=0, ge=0)
    review_event_count: int = Field(default=0, ge=0)
    next_due_at: str | None = None


StudyReviewRatingLabel = Literal["forgot", "hard", "good", "easy"]


class StudyReviewProgressDay(BaseModel):
    date: str
    review_count: int = Field(default=0, ge=0)


class StudyReviewProgressRatingCount(BaseModel):
    rating: StudyReviewRatingLabel
    count: int = Field(default=0, ge=0)


class StudyReviewProgressStageCount(BaseModel):
    stage: StudyKnowledgeStage
    count: int = Field(default=0, ge=0)


class StudyReviewProgressStageSnapshot(BaseModel):
    date: str
    total_count: int = Field(default=0, ge=0)
    stage_counts: list[StudyReviewProgressStageCount] = Field(default_factory=list)


class StudyReviewProgressRecentReview(BaseModel):
    id: str
    review_card_id: str
    source_document_id: str
    document_title: str
    prompt: str
    rating: StudyReviewRatingLabel
    reviewed_at: str
    next_due_at: str | None = None


class StudyReviewProgressSource(BaseModel):
    source_document_id: str
    document_title: str
    review_count: int = Field(default=0, ge=0)
    card_count: int = Field(default=0, ge=0)
    today_count: int = Field(default=0, ge=0)
    last_reviewed_at: str | None = None
    dominant_knowledge_stage: StudyKnowledgeStage = "new"
    knowledge_stage_counts: list[StudyReviewProgressStageCount] = Field(default_factory=list)


class StudyReviewProgress(BaseModel):
    scope_source_document_id: str | None = None
    total_reviews: int = Field(default=0, ge=0)
    today_count: int = Field(default=0, ge=0)
    active_days: int = Field(default=0, ge=0)
    current_daily_streak: int = Field(default=0, ge=0)
    period_days: int = Field(default=14, ge=1, le=365)
    last_reviewed_at: str | None = None
    daily_activity: list[StudyReviewProgressDay] = Field(default_factory=list)
    rating_counts: list[StudyReviewProgressRatingCount] = Field(default_factory=list)
    knowledge_stage_counts: list[StudyReviewProgressStageCount] = Field(default_factory=list)
    memory_progress: list[StudyReviewProgressStageSnapshot] = Field(default_factory=list)
    recent_reviews: list[StudyReviewProgressRecentReview] = Field(default_factory=list)
    source_breakdown: list[StudyReviewProgressSource] = Field(default_factory=list)


class StudyCardGenerationResult(BaseModel):
    generated_count: int = Field(default=0, ge=0)
    total_count: int = Field(default=0, ge=0)


class StudyReviewRequest(BaseModel):
    rating: Literal["forgot", "hard", "good", "easy"]


class StudyScheduleStateRequest(BaseModel):
    action: Literal["schedule", "unschedule"]


class StudyCardCreateRequest(BaseModel):
    source_document_id: str = Field(min_length=1)
    prompt: str = Field(min_length=1)
    answer: str = Field(min_length=1)
    card_type: StudyManualCardType = "short_answer"
    question_payload: StudyCardQuestionPayload | None = None

    @field_validator("source_document_id", "prompt", "answer")
    @classmethod
    def normalize_required_text(cls, value: str) -> str:
        normalized = " ".join(value.split())
        if not normalized:
            raise ValueError("Text cannot be blank.")
        return normalized


class StudyCardUpdateRequest(BaseModel):
    prompt: str = Field(min_length=1)
    answer: str = Field(min_length=1)
    question_payload: StudyCardQuestionPayload | None = None

    @field_validator("prompt", "answer")
    @classmethod
    def normalize_required_text(cls, value: str) -> str:
        normalized = " ".join(value.split())
        if not normalized:
            raise ValueError("Text cannot be blank.")
        return normalized


class StudyCardDeleteResult(BaseModel):
    id: str
    deleted: bool = True


class StudyCardBulkDeleteRequest(BaseModel):
    card_ids: list[str] = Field(min_length=1, max_length=100)


class StudyCardBulkDeleteResult(BaseModel):
    deleted_ids: list[str] = Field(default_factory=list)
    missing_ids: list[str] = Field(default_factory=list)


class ImportTextRequest(BaseModel):
    title: str | None = None
    text: str = Field(min_length=1)


class ImportUrlRequest(BaseModel):
    url: str = Field(min_length=1)


class TransformRequest(BaseModel):
    mode: Literal["simplified", "summary"]
    detail_level: Literal["short", "balanced", "detailed"] = "balanced"


class AccessibilitySnapshot(BaseModel):
    font_preset: Literal["system", "atkinson", "comic"] | None = None
    text_size: int | None = Field(default=None, ge=16, le=36)
    line_spacing: float | None = Field(default=None, ge=1.2, le=2.6)
    line_width: int | None = Field(default=None, ge=50, le=100)
    contrast_theme: Literal["soft", "high"] | None = None
    focus_mode: bool | None = None
    preferred_voice: str | None = None
    speech_rate: float | None = Field(default=None, ge=0.7, le=1.4)


class ReaderSessionState(BaseModel):
    mode: DocumentMode
    sentence_index: int = Field(default=0, ge=0)
    summary_detail: Literal["short", "balanced", "detailed"] | None = None
    accessibility_snapshot: AccessibilitySnapshot | None = None
    updated_at: str


class ProgressUpdate(BaseModel):
    mode: DocumentMode
    sentence_index: int = Field(default=0, ge=0)
    summary_detail: Literal["short", "balanced", "detailed"] | None = None
    accessibility_snapshot: AccessibilitySnapshot | None = None


class ReaderSettings(BaseModel):
    font_preset: Literal["system", "atkinson", "comic"] = "system"
    text_size: int = Field(default=22, ge=16, le=36)
    line_spacing: float = Field(default=1.7, ge=1.2, le=2.6)
    line_width: int = Field(default=72, ge=50, le=100)
    contrast_theme: Literal["soft", "high"] = "soft"
    focus_mode: bool = False
    preferred_voice: str = "default"
    speech_rate: float = Field(default=1.0, ge=0.7, le=1.4)


class HealthResponse(BaseModel):
    ok: bool = True
    openai_configured: bool
