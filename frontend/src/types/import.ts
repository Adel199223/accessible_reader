import type { DocumentRecord } from './documents'

export type BatchResolvedImportFormat = 'bookmarks_html' | 'pocket_csv' | 'pocket_zip' | 'url_list'
export type BatchImportFormat = 'auto' | BatchResolvedImportFormat

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
