export type RetrievalHitType = 'chunk' | 'node' | 'card' | 'note'
export type BrowserTriggerMode = 'selection' | 'page' | 'none'

export interface RecallNoteAnchor {
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

export interface BrowserSavedPageMatch {
  source_document_id: string
  document_title: string
  source_locator: string
}

export interface BrowserContextRequest {
  page_url: string
  page_title?: string
  selection_text?: string
  page_excerpt?: string
  meta_description?: string
  manual: boolean
  limit: number
}

export interface BrowserContextResponse {
  query: string
  trigger_mode: BrowserTriggerMode
  should_prompt: boolean
  summary: string
  suppression_reasons: string[]
  page_fingerprint: string
  matched_document?: BrowserSavedPageMatch | null
  hits: RecallRetrievalHit[]
}

export interface BrowserRecallNoteCreateRequest {
  page_url: string
  selection_text: string
  body_text?: string | null
}

export interface BrowserTabContextState {
  context: PageContext | null
  error: string | null
  response: BrowserContextResponse | null
}

export interface BrowserInspectableTab {
  active: boolean
  id: number
  title: string
  url: string
}

export interface BrowserDebugSnapshot {
  backendBaseUrl: string
  promptVisible: boolean
  state: BrowserTabContextState
  tab: BrowserInspectableTab
}

export interface HealthResponse {
  ok: boolean
  openai_configured: boolean
}

export interface PageContext {
  metaDescription: string
  pageExcerpt: string
  pageTitle: string
  pageUrl: string
  selectionText: string
}
