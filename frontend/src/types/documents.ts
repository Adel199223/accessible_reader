import type { ViewMode } from './base'
import type { ReaderSessionState } from './reader'

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
