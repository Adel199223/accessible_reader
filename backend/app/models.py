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
StudyGeneratedCardType = StudyManualCardType
StudyQuestionDifficulty = Literal["easy", "medium", "hard"]
StudyQuestionDifficultyFilter = Literal["all", "easy", "medium", "hard"]
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


class WorkspaceDataPayload(BaseModel):
    format_version: str = "1"
    schema_version: str
    device_id: str
    exported_at: str
    source_documents: list[dict[str, Any]] = Field(default_factory=list)
    document_variants: list[dict[str, Any]] = Field(default_factory=list)
    content_chunks: list[dict[str, Any]] = Field(default_factory=list)
    reading_sessions: list[dict[str, Any]] = Field(default_factory=list)
    app_settings: list[dict[str, Any]] = Field(default_factory=list)
    recall_notes: list[dict[str, Any]] = Field(default_factory=list)
    knowledge_nodes: list[dict[str, Any]] = Field(default_factory=list)
    knowledge_edges: list[dict[str, Any]] = Field(default_factory=list)
    review_cards: list[dict[str, Any]] = Field(default_factory=list)
    review_events: list[dict[str, Any]] = Field(default_factory=list)
    study_answer_attempts: list[dict[str, Any]] = Field(default_factory=list)
    study_review_sessions: list[dict[str, Any]] = Field(default_factory=list)


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


class WorkspaceImportPreviewSummary(BaseModel):
    source_kind: Literal["zip", "manifest"]
    format_version: str
    schema_version: str
    device_id: str
    exported_at: str
    latest_change_id: str | None = None
    change_event_count: int = Field(default=0, ge=0)
    entity_counts: dict[str, int] = Field(default_factory=dict)
    attachment_count: int = Field(default=0, ge=0)
    bundled_attachment_count: int = Field(default=0, ge=0)
    missing_attachment_paths: list[str] = Field(default_factory=list)
    learning_pack_count: int = Field(default=0, ge=0)
    missing_learning_pack_paths: list[str] = Field(default_factory=list)
    bundle_coverage_available: bool = False
    warnings: list[str] = Field(default_factory=list)


class WorkspaceImportPreview(BaseModel):
    dry_run: bool = True
    applied: bool = False
    can_apply: bool = False
    apply_blockers: list[str] = Field(default_factory=list)
    restorable_entity_counts: dict[str, int] = Field(default_factory=dict)
    backup: WorkspaceImportPreviewSummary
    merge_preview: WorkspaceMergePreview


class WorkspaceImportApplyResult(BaseModel):
    dry_run: bool = False
    applied: bool = True
    imported_counts: dict[str, int] = Field(default_factory=dict)
    skipped_counts: dict[str, int] = Field(default_factory=dict)
    conflict_counts: dict[str, int] = Field(default_factory=dict)
    operations: list[WorkspaceMergeOperation] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    blockers: list[str] = Field(default_factory=list)
    integrity: WorkspaceIntegrityReport | None = None


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


class StudyCardSupportPayload(BaseModel):
    hint: str | None = None
    explanation: str | None = None
    source_excerpt: str | None = None

    @field_validator("hint", "explanation", "source_excerpt")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = " ".join(value.split())
        return normalized or None


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
    question_difficulty: StudyQuestionDifficulty = "medium"
    question_payload: StudyCardQuestionPayload | None = None
    question_support_payload: StudyCardSupportPayload | None = None


class StudyOverview(BaseModel):
    due_count: int = Field(default=0, ge=0)
    new_count: int = Field(default=0, ge=0)
    scheduled_count: int = Field(default=0, ge=0)
    review_event_count: int = Field(default=0, ge=0)
    next_due_at: str | None = None


StudyReviewRatingLabel = Literal["forgot", "hard", "good", "easy"]
StudyStreakGoalMode = Literal["daily", "weekly"]


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
    attempt_id: str | None = None
    attempt_is_correct: bool | None = None
    attempted_at: str | None = None
    question_type: StudyManualCardType | None = None


class StudyReviewProgressSource(BaseModel):
    source_document_id: str
    document_title: str
    review_count: int = Field(default=0, ge=0)
    card_count: int = Field(default=0, ge=0)
    today_count: int = Field(default=0, ge=0)
    last_reviewed_at: str | None = None
    dominant_knowledge_stage: StudyKnowledgeStage = "new"
    knowledge_stage_counts: list[StudyReviewProgressStageCount] = Field(default_factory=list)
    attempt_count: int = Field(default=0, ge=0)
    correct_attempt_count: int = Field(default=0, ge=0)
    accuracy: float | None = None


class StudyReviewProgressDifficulty(BaseModel):
    difficulty: StudyQuestionDifficulty
    attempt_count: int = Field(default=0, ge=0)
    correct_attempt_count: int = Field(default=0, ge=0)
    accuracy: float | None = None


class StudyReviewGoalHistoryRow(BaseModel):
    period_start: str
    period_end: str
    count: int = Field(default=0, ge=0)
    target_count: int = Field(default=0, ge=0)
    is_met: bool = False


class StudyReviewGoalStatus(BaseModel):
    mode: StudyStreakGoalMode = "daily"
    target_count: int = Field(default=1, ge=0)
    current_count: int = Field(default=0, ge=0)
    remaining_count: int = Field(default=0, ge=0)
    is_met: bool = False
    period_start: str
    period_end: str
    next_reset_date: str
    recent_history: list[StudyReviewGoalHistoryRow] = Field(default_factory=list)


class StudyReviewSessionRecord(BaseModel):
    id: str
    source_document_id: str | None = None
    filter_snapshot: dict[str, Any] = Field(default_factory=dict)
    settings_snapshot: dict[str, Any] = Field(default_factory=dict)
    card_ids: list[str] = Field(default_factory=list)
    started_at: str
    completed_at: str | None = None
    summary: dict[str, Any] = Field(default_factory=dict)


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
    total_attempts: int = Field(default=0, ge=0)
    correct_attempts: int = Field(default=0, ge=0)
    accuracy: float | None = None
    recent_attempts: list["StudyAnswerAttemptRecord"] = Field(default_factory=list)
    recent_sessions: list[StudyReviewSessionRecord] = Field(default_factory=list)
    difficulty_accuracy: list[StudyReviewProgressDifficulty] = Field(default_factory=list)
    habit_goal: StudyReviewGoalStatus | None = None


class StudyAnswerAttemptRequest(BaseModel):
    session_id: str | None = None
    response: dict[str, Any] = Field(default_factory=dict)

    @field_validator("session_id")
    @classmethod
    def normalize_optional_session_id(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = " ".join(value.split())
        return normalized or None


class StudyAnswerAttemptRecord(BaseModel):
    id: str
    review_card_id: str
    source_document_id: str
    document_title: str
    session_id: str | None = None
    question_type: StudyManualCardType
    response: dict[str, Any] = Field(default_factory=dict)
    is_correct: bool | None = None
    attempted_at: str
    review_event_id: str | None = None
    prompt: str
    correct_answer: str | None = None


class StudyCardGenerationResult(BaseModel):
    generated_count: int = Field(default=0, ge=0)
    total_count: int = Field(default=0, ge=0)
    source_document_id: str | None = None
    question_types: list[StudyGeneratedCardType] = Field(default_factory=list)
    generated_by_type: dict[str, int] = Field(default_factory=dict)
    total_by_type: dict[str, int] = Field(default_factory=dict)
    include_hints: bool = True
    include_explanations: bool = True
    difficulty: StudyQuestionDifficultyFilter = "all"


class StudyCardGenerationRequest(BaseModel):
    source_document_id: str | None = None
    question_types: list[StudyGeneratedCardType] = Field(default_factory=list)
    max_per_source: int = Field(default=8, ge=1, le=20)
    include_hints: bool = True
    include_explanations: bool = True
    difficulty: StudyQuestionDifficultyFilter = "all"

    @field_validator("source_document_id")
    @classmethod
    def normalize_optional_source_id(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = " ".join(value.split())
        return normalized or None

    @field_validator("question_types")
    @classmethod
    def normalize_question_types(
        cls,
        value: list[StudyGeneratedCardType],
    ) -> list[StudyGeneratedCardType]:
        if not value:
            return []
        normalized: list[StudyGeneratedCardType] = []
        seen: set[str] = set()
        for question_type in value:
            if question_type in seen:
                continue
            seen.add(question_type)
            normalized.append(question_type)
        if not normalized:
            raise ValueError("Choose at least one generated question type.")
        return normalized


class StudyReviewRequest(BaseModel):
    rating: Literal["forgot", "hard", "good", "easy"]
    attempt_id: str | None = None

    @field_validator("attempt_id")
    @classmethod
    def normalize_optional_attempt_id(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = " ".join(value.split())
        return normalized or None


class StudyScheduleStateRequest(BaseModel):
    action: Literal["schedule", "unschedule"]


class StudySettings(BaseModel):
    default_timer_seconds: Literal[0, 30, 60, 120] = 0
    default_session_limit: Literal[5, 10, 20] | None = 10
    default_difficulty_filter: StudyQuestionDifficultyFilter = "all"
    streak_goal_mode: StudyStreakGoalMode = "daily"
    daily_goal_reviews: Literal[1, 3, 5, 10] = 1
    weekly_goal_days: Literal[3, 5, 7] = 3


class StudyReviewSessionStartRequest(BaseModel):
    source_document_id: str | None = None
    filter_snapshot: dict[str, Any] = Field(default_factory=dict)
    settings_snapshot: dict[str, Any] = Field(default_factory=dict)
    card_ids: list[str] = Field(min_length=1, max_length=100)

    @field_validator("source_document_id")
    @classmethod
    def normalize_optional_source_id(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = " ".join(value.split())
        return normalized or None

    @field_validator("card_ids")
    @classmethod
    def normalize_card_ids(cls, value: list[str]) -> list[str]:
        normalized: list[str] = []
        seen: set[str] = set()
        for card_id in value:
            normalized_id = " ".join(str(card_id).split())
            if not normalized_id or normalized_id in seen:
                continue
            seen.add(normalized_id)
            normalized.append(normalized_id)
        if not normalized:
            raise ValueError("Review sessions need at least one Study card.")
        return normalized


class StudyReviewSessionCompleteRequest(BaseModel):
    summary: dict[str, Any] = Field(default_factory=dict)


class StudyCardCreateRequest(BaseModel):
    source_document_id: str = Field(min_length=1)
    prompt: str = Field(min_length=1)
    answer: str = Field(min_length=1)
    card_type: StudyManualCardType = "short_answer"
    question_difficulty: StudyQuestionDifficulty | None = None
    question_payload: StudyCardQuestionPayload | None = None
    support_payload: StudyCardSupportPayload | None = None

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
    question_difficulty: StudyQuestionDifficulty | None = None
    question_payload: StudyCardQuestionPayload | None = None
    support_payload: StudyCardSupportPayload | None = None

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


BatchResolvedImportFormat = Literal["bookmarks_html", "pocket_csv", "pocket_zip", "url_list"]
BatchImportFormat = Literal["auto", "bookmarks_html", "pocket_csv", "pocket_zip", "url_list"]
BatchImportPreviewStatus = Literal["ready", "duplicate", "unsupported", "invalid"]
BatchImportApplyStatus = Literal["imported", "reused", "skipped", "failed"]
LibraryCollectionOrigin = Literal["manual", "import"]


class LibraryCollection(BaseModel):
    id: str = Field(min_length=1)
    name: str = Field(min_length=1, max_length=120)
    document_ids: list[str] = Field(default_factory=list)
    origin: LibraryCollectionOrigin = "manual"
    parent_id: str | None = None
    source_format: BatchResolvedImportFormat | None = None
    sort_index: int | None = Field(default=None, ge=0)
    created_at: str | None = None
    updated_at: str | None = None

    @field_validator("id", "name")
    @classmethod
    def normalize_required_text(cls, value: str) -> str:
        normalized = " ".join(value.split())
        if not normalized:
            raise ValueError("Text cannot be blank.")
        return normalized

    @field_validator("parent_id")
    @classmethod
    def normalize_parent_id(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = " ".join(str(value).split())
        return normalized or None

    @field_validator("document_ids")
    @classmethod
    def normalize_document_ids(cls, value: list[str]) -> list[str]:
        normalized: list[str] = []
        seen: set[str] = set()
        for document_id in value:
            clean_id = " ".join(str(document_id).split())
            if clean_id and clean_id not in seen:
                normalized.append(clean_id)
                seen.add(clean_id)
        return normalized


class LibrarySettings(BaseModel):
    custom_collections: list[LibraryCollection] = Field(default_factory=list)


class LibraryCollectionPathItem(BaseModel):
    id: str
    name: str


class LibraryCollectionMemoryCounts(BaseModel):
    notes: int = Field(default=0, ge=0)
    graph_nodes: int = Field(default=0, ge=0)
    study_cards: int = Field(default=0, ge=0)


class LibraryCollectionStudyCounts(BaseModel):
    new: int = Field(default=0, ge=0)
    due: int = Field(default=0, ge=0)
    scheduled: int = Field(default=0, ge=0)
    unscheduled: int = Field(default=0, ge=0)
    reviewed: int = Field(default=0, ge=0)
    total: int = Field(default=0, ge=0)


class LibraryCollectionRecentSource(BaseModel):
    id: str
    title: str
    source_type: str
    updated_at: str
    membership: Literal["direct", "descendant"]


class LibraryCollectionRecentActivity(BaseModel):
    kind: Literal["source", "note", "graph_node", "study_card", "study_session"]
    label: str
    source_document_id: str | None = None
    occurred_at: str


class LibraryCollectionReadingSummary(BaseModel):
    total_sources: int = Field(default=0, ge=0)
    unread_sources: int = Field(default=0, ge=0)
    in_progress_sources: int = Field(default=0, ge=0)
    completed_sources: int = Field(default=0, ge=0)
    last_read_at: str | None = None


class LibraryCollectionResumeSource(BaseModel):
    id: str
    title: str
    source_type: str
    mode: DocumentMode
    sentence_index: int = Field(default=0, ge=0)
    sentence_count: int = Field(default=0, ge=0)
    progress_percent: int = Field(default=0, ge=0, le=100)
    membership: Literal["direct", "descendant"]
    updated_at: str


class LibraryCollectionHighlightReviewItem(BaseModel):
    note_id: str
    note_kind: Literal["sentence", "source"]
    source_document_id: str
    source_title: str
    anchor_text: str
    excerpt_preview: str
    body_preview: str | None = None
    global_sentence_start: int | None = Field(default=None, ge=0)
    global_sentence_end: int | None = Field(default=None, ge=0)
    membership: Literal["direct", "descendant"]
    updated_at: str


class LibraryCollectionOverview(BaseModel):
    id: str
    name: str
    parent_id: str | None = None
    path: list[LibraryCollectionPathItem] = Field(default_factory=list)
    direct_document_ids: list[str] = Field(default_factory=list)
    descendant_document_ids: list[str] = Field(default_factory=list)
    direct_document_count: int = Field(default=0, ge=0)
    descendant_document_count: int = Field(default=0, ge=0)
    child_collection_count: int = Field(default=0, ge=0)
    memory_counts: LibraryCollectionMemoryCounts = Field(default_factory=LibraryCollectionMemoryCounts)
    study_counts: LibraryCollectionStudyCounts = Field(default_factory=LibraryCollectionStudyCounts)
    reading_summary: LibraryCollectionReadingSummary = Field(default_factory=LibraryCollectionReadingSummary)
    resume_sources: list[LibraryCollectionResumeSource] = Field(default_factory=list)
    highlight_review_items: list[LibraryCollectionHighlightReviewItem] = Field(default_factory=list)
    recent_sources: list[LibraryCollectionRecentSource] = Field(default_factory=list)
    recent_activity: list[LibraryCollectionRecentActivity] = Field(default_factory=list)


LibraryReadingQueueScope = Literal["all", "web", "documents", "captures", "untagged"]
LibraryReadingQueueState = Literal["all", "unread", "in_progress", "completed"]


class LibraryReadingQueueSummary(BaseModel):
    total_sources: int = Field(default=0, ge=0)
    unread_sources: int = Field(default=0, ge=0)
    in_progress_sources: int = Field(default=0, ge=0)
    completed_sources: int = Field(default=0, ge=0)


class LibraryReadingQueueStudyCounts(BaseModel):
    new: int = Field(default=0, ge=0)
    due: int = Field(default=0, ge=0)
    total: int = Field(default=0, ge=0)


class LibraryReadingQueueRow(BaseModel):
    id: str
    title: str
    source_type: str
    state: Literal["unread", "in_progress", "completed"]
    mode: DocumentMode
    sentence_index: int = Field(default=0, ge=0)
    sentence_count: int = Field(default=0, ge=0)
    progress_percent: int = Field(default=0, ge=0, le=100)
    last_read_at: str | None = None
    updated_at: str
    membership: Literal["direct", "descendant"] | None = None
    collection_paths: list[list[LibraryCollectionPathItem]] = Field(default_factory=list)
    note_count: int = Field(default=0, ge=0)
    highlight_count: int = Field(default=0, ge=0)
    study_counts: LibraryReadingQueueStudyCounts = Field(default_factory=LibraryReadingQueueStudyCounts)


class LibraryReadingQueueResponse(BaseModel):
    dry_run: bool = True
    scope: LibraryReadingQueueScope = "all"
    state: LibraryReadingQueueState = "all"
    collection_id: str | None = None
    summary: LibraryReadingQueueSummary = Field(default_factory=LibraryReadingQueueSummary)
    rows: list[LibraryReadingQueueRow] = Field(default_factory=list)


class ReadingCompleteRequest(BaseModel):
    mode: DocumentMode | None = None


class ReadingCompleteResult(BaseModel):
    document_id: str
    mode: DocumentMode
    sentence_index: int = Field(default=0, ge=0)
    sentence_count: int = Field(default=0, ge=0)
    completed_at: str


class BatchImportCollectionSuggestion(BaseModel):
    id: str
    name: str
    source_format: BatchResolvedImportFormat
    parent_id: str | None = None
    path: list[str] = Field(default_factory=list)
    sort_index: int | None = Field(default=None, ge=0)
    item_ids: list[str] = Field(default_factory=list)
    ready_count: int = Field(default=0, ge=0)


class BatchImportPreviewRow(BaseModel):
    id: str
    title: str | None = None
    url: str
    source_format: BatchResolvedImportFormat
    folder: str | None = None
    tags: list[str] = Field(default_factory=list)
    status: BatchImportPreviewStatus
    reason: str | None = None


class BatchImportPreviewSummary(BaseModel):
    total_count: int = 0
    ready_count: int = 0
    duplicate_count: int = 0
    invalid_count: int = 0
    unsupported_count: int = 0
    skipped_count: int = 0


class BatchImportPreview(BaseModel):
    dry_run: bool = True
    applied: bool = False
    source_format: BatchResolvedImportFormat
    max_items: int
    rows: list[BatchImportPreviewRow] = Field(default_factory=list)
    collection_suggestions: list[BatchImportCollectionSuggestion] = Field(default_factory=list)
    summary: BatchImportPreviewSummary


class BatchImportCollectionResult(BaseModel):
    id: str
    name: str
    document_ids: list[str] = Field(default_factory=list)
    parent_id: str | None = None
    path: list[str] = Field(default_factory=list)
    source_format: BatchResolvedImportFormat | None = None
    status: Literal["created", "updated"]


class BatchImportResultRow(BaseModel):
    id: str
    title: str | None = None
    url: str
    source_format: BatchResolvedImportFormat
    folder: str | None = None
    tags: list[str] = Field(default_factory=list)
    status: BatchImportApplyStatus
    reason: str | None = None
    document: DocumentRecord | None = None


class BatchImportResultSummary(BaseModel):
    total_count: int = 0
    imported_count: int = 0
    reused_count: int = 0
    skipped_count: int = 0
    failed_count: int = 0
    collection_created_count: int = 0
    collection_updated_count: int = 0


class BatchImportResult(BaseModel):
    dry_run: bool = False
    applied: bool = True
    source_format: BatchResolvedImportFormat
    max_items: int
    rows: list[BatchImportResultRow] = Field(default_factory=list)
    collections: list[BatchImportCollectionResult] = Field(default_factory=list)
    summary: BatchImportResultSummary


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
