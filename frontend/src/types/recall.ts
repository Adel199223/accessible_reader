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

export type RetrievalHitType = 'chunk' | 'node' | 'card' | 'note'

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
