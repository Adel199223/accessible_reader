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
  question_payload?: StudyCardQuestionPayload | null
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
  question_payload?: StudyCardQuestionPayload | null
}

export type StudyManualCardType =
  | 'short_answer'
  | 'flashcard'
  | 'multiple_choice'
  | 'true_false'
  | 'fill_in_blank'
  | 'matching'
  | 'ordering'

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

export interface StudyCardCreateRequest {
  source_document_id: string
  prompt: string
  answer: string
  card_type?: StudyManualCardType
  question_payload?: StudyCardQuestionPayload | null
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
}

export interface StudyCardGenerationResult {
  generated_count: number
  total_count: number
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
