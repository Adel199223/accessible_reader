export type ViewMode = 'original' | 'reflowed' | 'simplified' | 'summary'
export type SummaryDetail = 'short' | 'balanced' | 'detailed'

export interface ViewBlock {
  id: string
  kind: 'heading' | 'paragraph' | 'list_item' | 'quote'
  text: string
  level?: number | null
  metadata?: Record<string, unknown>
}

export interface DocumentView {
  mode: ViewMode
  detail_level: 'default' | SummaryDetail
  title: string
  blocks: ViewBlock[]
  variant_metadata?: Record<string, unknown>
  generated_by: 'local' | 'openai'
  cached: boolean
  source_hash: string
  model?: string | null
  updated_at: string
}

export interface DocumentRecord {
  id: string
  title: string
  source_type: string
  file_name?: string | null
  created_at: string
  updated_at: string
  available_modes: ViewMode[]
  progress_by_mode: Partial<Record<ViewMode, number>>
  last_reader_session?: ReaderSessionState | null
}

export interface RecallDocumentRecord {
  id: string
  title: string
  source_type: string
  file_name?: string | null
  source_locator?: string | null
  created_at: string
  updated_at: string
  available_modes: ViewMode[]
  chunk_count: number
}

export interface RecallDocumentPreview {
  document_id: string
  kind: 'image' | 'fallback'
  source:
    | 'attachment-image'
    | 'content-rendered-preview'
    | 'html-meta-image'
    | 'html-inline-image'
    | 'html-preload-image'
    | 'html-rendered-snapshot'
    | 'fallback'
  asset_url?: string | null
  updated_at: string
}

export interface PortableEntityDigest {
  entity_type: string
  entity_key: string
  entity_id: string | null
  updated_at: string
  payload_digest: string
  source_document_id?: string | null
  metadata: Record<string, unknown>
}

export interface AttachmentRef {
  id: string
  source_document_id: string
  file_name: string
  media_type?: string | null
  relative_path: string
  logical_key?: string | null
  content_digest?: string | null
  byte_size?: number | null
  updated_at?: string | null
  metadata?: Record<string, unknown>
}

export interface WorkspaceExportManifest {
  format_version: string
  schema_version: string
  device_id: string
  exported_at: string
  latest_change_id?: string | null
  change_event_count: number
  entity_counts: Record<string, number>
  entities: PortableEntityDigest[]
  attachments: AttachmentRef[]
  warnings: string[]
}

export interface WorkspaceMergeOperation {
  entity_type: string
  entity_key: string
  entity_id?: string | null
  remote_entity_id?: string | null
  decision: 'import_remote' | 'skip_equal' | 'keep_local' | 'prefer_remote'
  reason: string
  local_updated_at?: string | null
  remote_updated_at?: string | null
  local_digest?: string | null
  remote_digest?: string | null
}

export interface WorkspaceMergePreview {
  operations: WorkspaceMergeOperation[]
  summary: Record<string, number>
}

export interface WorkspaceImportPreviewSummary {
  source_kind: 'zip' | 'manifest'
  format_version: string
  schema_version: string
  device_id: string
  exported_at: string
  latest_change_id?: string | null
  change_event_count: number
  entity_counts: Record<string, number>
  attachment_count: number
  bundled_attachment_count: number
  missing_attachment_paths: string[]
  learning_pack_count: number
  missing_learning_pack_paths: string[]
  bundle_coverage_available: boolean
  warnings: string[]
}

export interface WorkspaceImportPreview {
  dry_run: boolean
  applied: boolean
  can_apply: boolean
  apply_blockers: string[]
  restorable_entity_counts: Record<string, number>
  backup: WorkspaceImportPreviewSummary
  merge_preview: WorkspaceMergePreview
}

export interface WorkspaceIntegrityReport {
  ok: boolean
  checked_at: string
  schema_version: string
  quick_check: string
  counts: Record<string, number>
  issues: Array<Record<string, unknown>>
  last_repair_at?: string | null
}

export interface WorkspaceImportApplyResult {
  dry_run: boolean
  applied: boolean
  imported_counts: Record<string, number>
  skipped_counts: Record<string, number>
  conflict_counts: Record<string, number>
  operations: WorkspaceMergeOperation[]
  warnings: string[]
  blockers: string[]
  integrity?: WorkspaceIntegrityReport | null
}

export type BatchResolvedImportFormat = 'bookmarks_html' | 'pocket_csv' | 'pocket_zip' | 'url_list'
export type BatchImportFormat = 'auto' | BatchResolvedImportFormat

export interface LibraryCollection {
  id: string
  name: string
  document_ids: string[]
  origin: 'manual' | 'import'
  parent_id?: string | null
  source_format?: BatchResolvedImportFormat | null
  sort_index?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export interface LibrarySettings {
  custom_collections: LibraryCollection[]
}

export interface LibraryCollectionPathItem {
  id: string
  name: string
}

export interface LibraryCollectionMemoryCounts {
  notes: number
  graph_nodes: number
  study_cards: number
}

export interface LibraryCollectionStudyCounts {
  new: number
  due: number
  scheduled: number
  unscheduled: number
  reviewed: number
  total: number
}

export interface LibraryCollectionRecentSource {
  id: string
  title: string
  source_type: string
  updated_at: string
  membership: 'direct' | 'descendant'
}

export interface LibraryCollectionRecentActivity {
  kind: 'source' | 'note' | 'graph_node' | 'study_card' | 'study_session'
  label: string
  source_document_id?: string | null
  occurred_at: string
}

export interface LibraryCollectionReadingSummary {
  total_sources: number
  unread_sources: number
  in_progress_sources: number
  completed_sources: number
  last_read_at?: string | null
}

export interface LibraryCollectionResumeSource {
  id: string
  title: string
  source_type: string
  mode: ViewMode
  sentence_index: number
  sentence_count: number
  progress_percent: number
  membership: 'direct' | 'descendant'
  updated_at: string
}

export interface LibraryCollectionHighlightReviewItem {
  note_id: string
  note_kind: 'sentence' | 'source'
  source_document_id: string
  source_title: string
  anchor_text: string
  excerpt_preview: string
  body_preview?: string | null
  membership: 'direct' | 'descendant'
  global_sentence_start?: number | null
  global_sentence_end?: number | null
  updated_at: string
}

export interface LibraryCollectionOverview {
  id: string
  name: string
  parent_id?: string | null
  path: LibraryCollectionPathItem[]
  direct_document_ids: string[]
  descendant_document_ids: string[]
  direct_document_count: number
  descendant_document_count: number
  child_collection_count: number
  memory_counts: LibraryCollectionMemoryCounts
  study_counts: LibraryCollectionStudyCounts
  recent_sources: LibraryCollectionRecentSource[]
  recent_activity: LibraryCollectionRecentActivity[]
  reading_summary: LibraryCollectionReadingSummary
  resume_sources: LibraryCollectionResumeSource[]
  highlight_review_items: LibraryCollectionHighlightReviewItem[]
}

export type LibraryReadingQueueScope = 'all' | 'web' | 'documents' | 'captures' | 'untagged'
export type LibraryReadingQueueState = 'all' | 'unread' | 'in_progress' | 'completed'

export interface LibraryReadingQueueSummary {
  total_sources: number
  unread_sources: number
  in_progress_sources: number
  completed_sources: number
}

export interface LibraryReadingQueueStudyCounts {
  new: number
  due: number
  total: number
}

export interface LibraryReadingQueueRow {
  id: string
  title: string
  source_type: string
  state: Exclude<LibraryReadingQueueState, 'all'>
  mode: ViewMode
  sentence_index: number
  sentence_count: number
  progress_percent: number
  last_read_at?: string | null
  updated_at: string
  membership?: 'direct' | 'descendant' | null
  collection_paths: LibraryCollectionPathItem[][]
  note_count: number
  highlight_count: number
  study_counts: LibraryReadingQueueStudyCounts
}

export interface LibraryReadingQueueResponse {
  dry_run: boolean
  scope: LibraryReadingQueueScope
  state: LibraryReadingQueueState
  collection_id?: string | null
  summary: LibraryReadingQueueSummary
  rows: LibraryReadingQueueRow[]
}

export interface ReadingCompleteResult {
  document_id: string
  mode: ViewMode
  sentence_index: number
  sentence_count: number
  completed_at: string
}

export interface BatchImportCollectionSuggestion {
  id: string
  name: string
  source_format: BatchResolvedImportFormat
  parent_id?: string | null
  path?: string[]
  sort_index?: number | null
  item_ids: string[]
  ready_count: number
}

export interface BatchImportPreviewRow {
  id: string
  title?: string | null
  url: string
  source_format: BatchResolvedImportFormat
  folder?: string | null
  tags: string[]
  status: 'ready' | 'duplicate' | 'unsupported' | 'invalid'
  reason?: string | null
}

export interface BatchImportPreviewSummary {
  total_count: number
  ready_count: number
  duplicate_count: number
  invalid_count: number
  unsupported_count: number
  skipped_count: number
}

export interface BatchImportPreview {
  dry_run: boolean
  applied: boolean
  source_format: BatchResolvedImportFormat
  max_items: number
  rows: BatchImportPreviewRow[]
  collection_suggestions: BatchImportCollectionSuggestion[]
  summary: BatchImportPreviewSummary
}

export interface BatchImportCollectionResult {
  id: string
  name: string
  document_ids: string[]
  parent_id?: string | null
  path?: string[]
  source_format?: BatchResolvedImportFormat | null
  status: 'created' | 'updated'
}

export interface BatchImportResultRow {
  id: string
  title?: string | null
  url: string
  source_format: BatchResolvedImportFormat
  folder?: string | null
  tags: string[]
  status: 'imported' | 'reused' | 'skipped' | 'failed'
  reason?: string | null
  document?: DocumentRecord | null
}

export interface BatchImportResultSummary {
  total_count: number
  imported_count: number
  reused_count: number
  skipped_count: number
  failed_count: number
  collection_created_count: number
  collection_updated_count: number
}

export interface BatchImportResult {
  dry_run: boolean
  applied: boolean
  source_format: BatchResolvedImportFormat
  max_items: number
  rows: BatchImportResultRow[]
  collections: BatchImportCollectionResult[]
  summary: BatchImportResultSummary
}

export interface RecallNoteAnchor {
  kind?: 'sentence' | 'source'
  source_document_id: string
  variant_id: string
  block_id: string
  sentence_start: number
  sentence_end: number
  global_sentence_start?: number | null
  global_sentence_end?: number | null
  anchor_text: string
  excerpt_text: string
}

export interface RecallNoteRecord {
  id: string
  anchor: RecallNoteAnchor
  body_text?: string | null
  created_at: string
  updated_at: string
}

export interface RecallNoteCreateRequest {
  anchor: RecallNoteAnchor
  body_text?: string | null
}

export interface RecallNoteUpdateRequest {
  body_text?: string | null
}

export interface RecallNoteGraphPromotionRequest {
  label: string
  description?: string | null
}

export interface RecallNoteStudyPromotionRequest {
  prompt: string
  answer: string
}

export interface StudyCardUpdateRequest {
  prompt: string
  answer: string
  question_difficulty?: StudyQuestionDifficulty | null
  question_payload?: StudyCardQuestionPayload | null
  support_payload?: StudyCardSupportPayload | null
}

export interface RecallNoteSearchHit {
  id: string
  anchor: RecallNoteAnchor
  document_title: string
  score: number
  body_text?: string | null
  created_at: string
  updated_at: string
}

export interface RecallSearchHit {
  id: string
  source_document_id: string
  document_title: string
  score: number
  excerpt: string
  chunk_id: string
  block_id?: string | null
  match_context: string
}

export type GraphReviewStatus = 'suggested' | 'confirmed' | 'rejected'
export type RetrievalHitType = 'chunk' | 'node' | 'card' | 'note'
export type StudyCardStatus = 'new' | 'due' | 'scheduled' | 'unscheduled'
export type StudyKnowledgeStage = 'new' | 'learning' | 'practiced' | 'confident' | 'mastered'
export type StudyReviewRating = 'forgot' | 'hard' | 'good' | 'easy'

export interface KnowledgeNodeRecord {
  id: string
  label: string
  node_type: string
  description?: string | null
  confidence: number
  mention_count: number
  document_count: number
  status: GraphReviewStatus
  aliases: string[]
  source_document_ids: string[]
}

export interface KnowledgeEdgeRecord {
  id: string
  source_id: string
  source_label: string
  target_id: string
  target_label: string
  relation_type: string
  provenance: 'manual' | 'inferred'
  confidence: number
  status: GraphReviewStatus
  evidence_count: number
  source_document_ids: string[]
  excerpt?: string | null
}

export interface KnowledgeMentionRecord {
  id: string
  source_document_id: string
  document_title: string
  text: string
  entity_type: string
  confidence: number
  block_id?: string | null
  chunk_id?: string | null
  excerpt: string
  anchor_kind?: 'sentence' | 'source' | null
  manual_source?: string | null
  note_anchor_text?: string | null
  note_body?: string | null
  note_id?: string | null
}

export interface KnowledgeNodeDetail {
  node: KnowledgeNodeRecord
  mentions: KnowledgeMentionRecord[]
  outgoing_edges: KnowledgeEdgeRecord[]
  incoming_edges: KnowledgeEdgeRecord[]
}

export interface KnowledgeGraphSnapshot {
  nodes: KnowledgeNodeRecord[]
  edges: KnowledgeEdgeRecord[]
  document_count: number
  pending_nodes: number
  pending_edges: number
  confirmed_nodes: number
  confirmed_edges: number
}

export interface RecallRetrievalHit {
  id: string
  hit_type: RetrievalHitType
  source_document_id: string
  document_title: string
  title: string
  score: number
  excerpt: string
  reasons: string[]
  chunk_id?: string | null
  node_id?: string | null
  card_id?: string | null
  note_id?: string | null
  note_anchor?: RecallNoteAnchor | null
}

export interface StudyCardRecord {
  id: string
  source_document_id: string
  document_title: string
  prompt: string
  answer: string
  card_type: string
  source_spans: Array<Record<string, unknown>>
  scheduling_state: Record<string, unknown>
  due_at: string
  review_count: number
  status: StudyCardStatus
  last_rating?: StudyReviewRating | null
  knowledge_stage: StudyKnowledgeStage
  question_difficulty?: StudyQuestionDifficulty
  question_payload?: StudyCardQuestionPayload | null
  question_support_payload?: StudyCardSupportPayload | null
}

export type StudyManualCardType =
  | 'short_answer'
  | 'flashcard'
  | 'multiple_choice'
  | 'true_false'
  | 'fill_in_blank'
  | 'matching'
  | 'ordering'

export type StudyGeneratedCardType = StudyManualCardType
export type StudyQuestionDifficulty = 'easy' | 'medium' | 'hard'
export type StudyQuestionDifficultyFilter = 'all' | StudyQuestionDifficulty

export interface StudyCardChoiceOption {
  id: string
  text: string
}

export interface StudyCardMatchingPair {
  id: string
  left: string
  right: string
}

export interface StudyCardOrderingItem {
  id: string
  text: string
}

export type StudyCardQuestionPayload =
  | {
      kind: 'multiple_choice'
      choices: StudyCardChoiceOption[]
      correct_choice_id: string
    }
  | {
      kind: 'matching'
      pairs: StudyCardMatchingPair[]
    }
  | {
      kind: 'ordering'
      items: StudyCardOrderingItem[]
    }
  | {
      kind: 'true_false'
      choices: StudyCardChoiceOption[]
      correct_choice_id: 'true' | 'false'
    }
  | {
      kind: 'fill_in_blank'
      template: string
      choices: StudyCardChoiceOption[]
      correct_choice_id: string
    }

export interface StudyCardSupportPayload {
  hint?: string | null
  explanation?: string | null
  source_excerpt?: string | null
}

export interface StudyCardCreateRequest {
  source_document_id: string
  prompt: string
  answer: string
  card_type?: StudyManualCardType
  question_difficulty?: StudyQuestionDifficulty | null
  question_payload?: StudyCardQuestionPayload | null
  support_payload?: StudyCardSupportPayload | null
}

export interface StudyCardDeleteResult {
  id: string
  deleted: boolean
}

export interface StudyCardBulkDeleteResult {
  deleted_ids: string[]
  missing_ids: string[]
}

export interface StudyOverview {
  due_count: number
  new_count: number
  scheduled_count: number
  review_event_count: number
  next_due_at?: string | null
}

export interface StudyReviewProgressDay {
  date: string
  review_count: number
}

export interface StudyReviewProgressRatingCount {
  rating: StudyReviewRating
  count: number
}

export interface StudyReviewProgressStageCount {
  stage: StudyKnowledgeStage
  count: number
}

export interface StudyReviewProgressStageSnapshot {
  date: string
  total_count: number
  stage_counts: StudyReviewProgressStageCount[]
}

export interface StudyReviewProgressRecentReview {
  id: string
  review_card_id: string
  source_document_id: string
  document_title: string
  prompt: string
  rating: StudyReviewRating
  reviewed_at: string
  next_due_at?: string | null
  attempt_id?: string | null
  attempt_is_correct?: boolean | null
  attempted_at?: string | null
  question_type?: StudyManualCardType | null
}

export interface StudyReviewProgressSource {
  source_document_id: string
  document_title: string
  review_count: number
  card_count: number
  today_count: number
  last_reviewed_at?: string | null
  dominant_knowledge_stage: StudyKnowledgeStage
  knowledge_stage_counts: StudyReviewProgressStageCount[]
  attempt_count?: number
  correct_attempt_count?: number
  accuracy?: number | null
}

export interface StudyReviewProgressDifficulty {
  difficulty: StudyQuestionDifficulty
  attempt_count: number
  correct_attempt_count: number
  accuracy?: number | null
}

export interface StudyReviewGoalHistoryRow {
  period_start: string
  period_end: string
  count: number
  target_count: number
  is_met: boolean
}

export interface StudyReviewGoalStatus {
  mode: 'daily' | 'weekly'
  target_count: number
  current_count: number
  remaining_count: number
  is_met: boolean
  period_start: string
  period_end: string
  next_reset_date: string
  recent_history: StudyReviewGoalHistoryRow[]
}

export interface StudyReviewSessionRecord {
  id: string
  source_document_id?: string | null
  filter_snapshot: Record<string, unknown>
  settings_snapshot: Record<string, unknown>
  card_ids: string[]
  started_at: string
  completed_at?: string | null
  summary: Record<string, unknown>
}

export interface StudySettings {
  default_timer_seconds: 0 | 30 | 60 | 120
  default_session_limit: 5 | 10 | 20 | null
  default_difficulty_filter: StudyQuestionDifficultyFilter
  streak_goal_mode: 'daily' | 'weekly'
  daily_goal_reviews: 1 | 3 | 5 | 10
  weekly_goal_days: 3 | 5 | 7
}

export interface StudyReviewSessionStartRequest {
  source_document_id?: string | null
  filter_snapshot?: Record<string, unknown>
  settings_snapshot?: Record<string, unknown>
  card_ids: string[]
}

export interface StudyReviewSessionCompleteRequest {
  summary: Record<string, unknown>
}

export interface StudyAnswerAttemptRequest {
  session_id?: string | null
  response: Record<string, unknown>
}

export interface StudyAnswerAttemptRecord {
  id: string
  review_card_id: string
  source_document_id: string
  document_title: string
  session_id?: string | null
  question_type: StudyManualCardType
  response: Record<string, unknown>
  is_correct?: boolean | null
  attempted_at: string
  review_event_id?: string | null
  prompt: string
  correct_answer?: string | null
}

export interface StudyReviewProgress {
  scope_source_document_id?: string | null
  total_reviews: number
  today_count: number
  active_days: number
  current_daily_streak: number
  period_days: number
  last_reviewed_at?: string | null
  daily_activity: StudyReviewProgressDay[]
  rating_counts: StudyReviewProgressRatingCount[]
  knowledge_stage_counts: StudyReviewProgressStageCount[]
  memory_progress: StudyReviewProgressStageSnapshot[]
  recent_reviews: StudyReviewProgressRecentReview[]
  source_breakdown: StudyReviewProgressSource[]
  total_attempts?: number
  correct_attempts?: number
  accuracy?: number | null
  recent_attempts?: StudyAnswerAttemptRecord[]
  recent_sessions?: StudyReviewSessionRecord[]
  difficulty_accuracy?: StudyReviewProgressDifficulty[]
  habit_goal?: StudyReviewGoalStatus | null
}

export interface StudyCardGenerationResult {
  generated_count: number
  total_count: number
  source_document_id?: string | null
  question_types: StudyGeneratedCardType[]
  generated_by_type: Record<string, number>
  total_by_type: Record<string, number>
  include_hints?: boolean
  include_explanations?: boolean
  difficulty?: StudyQuestionDifficultyFilter
}

export interface StudyCardGenerationRequest {
  source_document_id?: string | null
  question_types?: StudyGeneratedCardType[]
  max_per_source?: number
  include_hints?: boolean
  include_explanations?: boolean
  difficulty?: StudyQuestionDifficultyFilter
}

export interface ReaderSettings {
  font_preset: 'system' | 'atkinson' | 'comic'
  text_size: number
  line_spacing: number
  line_width: number
  contrast_theme: 'soft' | 'high'
  focus_mode: boolean
  preferred_voice: string
  speech_rate: number
}

export interface AccessibilitySnapshot {
  font_preset?: ReaderSettings['font_preset'] | null
  text_size?: number | null
  line_spacing?: number | null
  line_width?: number | null
  contrast_theme?: ReaderSettings['contrast_theme'] | null
  focus_mode?: boolean | null
  preferred_voice?: string | null
  speech_rate?: number | null
}

export interface ReaderSessionState {
  mode: ViewMode
  sentence_index: number
  summary_detail?: SummaryDetail | null
  accessibility_snapshot?: AccessibilitySnapshot | null
  updated_at: string
}

export interface HealthResponse {
  ok: boolean
  openai_configured: boolean
}
