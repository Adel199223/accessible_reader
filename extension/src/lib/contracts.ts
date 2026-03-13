export type RetrievalHitType = 'chunk' | 'node' | 'card'
export type BrowserTriggerMode = 'selection' | 'page' | 'none'

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
  hits: RecallRetrievalHit[]
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

