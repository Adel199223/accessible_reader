import type { ViewMode } from './base'
import type { BatchResolvedImportFormat } from './import'
import type { RecallNoteReviewState } from './recall'

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
  review_state?: RecallNoteReviewState
  reviewed_at?: string | null
  dismissed_at?: string | null
  study_covered?: boolean
  study_card_id?: string | null
  graph_covered?: boolean
  graph_node_id?: string | null
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
export type LibraryReadingQueueLearningFilter =
  | 'all'
  | 'needs_review'
  | 'uncovered'
  | 'covered'
  | 'study_prompts'
  | 'graph_gaps'
export type HighlightReviewInboxState =
  | 'needs_review'
  | 'uncovered'
  | 'covered'
  | 'connected'
  | 'unconnected'
  | 'reviewed'
  | 'dismissed'
  | 'all'

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

export interface LibraryReadingQueueHighlightReviewCounts {
  total: number
  needs_review: number
  covered: number
  reviewed: number
  dismissed: number
  graph_covered: number
  ungraphed: number
}

export interface LibraryReadingQueueLearningSummary {
  needs_review_sources: number
  uncovered_sources: number
  covered_sources: number
  study_prompt_sources: number
  graph_gap_sources: number
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
  highlight_review_counts: LibraryReadingQueueHighlightReviewCounts
  study_counts: LibraryReadingQueueStudyCounts
}

export interface LibraryReadingQueueResponse {
  dry_run: boolean
  scope: LibraryReadingQueueScope
  state: LibraryReadingQueueState
  learning_filter: LibraryReadingQueueLearningFilter
  collection_id?: string | null
  summary: LibraryReadingQueueSummary
  learning_summary: LibraryReadingQueueLearningSummary
  rows: LibraryReadingQueueRow[]
}

export interface HighlightReviewInboxSummary {
  total_items: number
  needs_review_items: number
  uncovered_items: number
  covered_items: number
  reviewable_covered_items: number
  reviewed_items: number
  dismissed_items: number
  graph_covered_items: number
  ungraphed_items: number
}

export interface HighlightReviewInboxRow {
  note_id: string
  note_kind: 'sentence' | 'source'
  source_document_id: string
  source_title: string
  anchor_text: string
  excerpt_preview: string
  body_preview?: string | null
  global_sentence_start?: number | null
  global_sentence_end?: number | null
  membership?: 'direct' | 'descendant' | null
  collection_paths: LibraryCollectionPathItem[][]
  review_state: RecallNoteReviewState
  reviewed_at?: string | null
  dismissed_at?: string | null
  study_covered: boolean
  study_card_id?: string | null
  graph_covered: boolean
  graph_node_id?: string | null
  updated_at: string
}

export interface HighlightReviewInboxResponse {
  scope: LibraryReadingQueueScope
  state: HighlightReviewInboxState
  reading_state: LibraryReadingQueueState
  learning_filter: LibraryReadingQueueLearningFilter
  collection_id?: string | null
  source_document_id?: string | null
  summary: HighlightReviewInboxSummary
  reviewable_study_card_ids: string[]
  rows: HighlightReviewInboxRow[]
}
