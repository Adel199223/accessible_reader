export type GraphReviewStatus = 'suggested' | 'confirmed' | 'rejected'

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
