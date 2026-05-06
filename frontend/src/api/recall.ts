import type {
  KnowledgeNodeDetail,
  RecallDocumentPreview,
  RecallDocumentRecord,
  RecallNoteCreateRequest,
  RecallNoteGraphPromotionRequest,
  RecallNoteRecord,
  RecallNoteSearchHit,
  RecallNoteStudyPromotionRequest,
  RecallNoteUpdateRequest,
  RecallRetrievalHit,
  RecallSearchHit,
  ReadingCompleteResult,
  StudyCardRecord,
  ViewMode,
} from '../types'
import { buildApiUrl, request } from './core'

export function fetchRecallDocuments() {
  return request<RecallDocumentRecord[]>('/api/recall/documents')
}

export function fetchRecallDocument(documentId: string) {
  return request<RecallDocumentRecord>(`/api/recall/documents/${documentId}`)
}

export async function fetchRecallDocumentPreview(documentId: string) {
  const preview = await request<RecallDocumentPreview>(`/api/recall/documents/${documentId}/preview`)
  return {
    ...preview,
    asset_url: preview.asset_url ? buildApiUrl(preview.asset_url) : preview.asset_url,
  }
}

export function fetchRecallNotes(documentId: string) {
  return request<RecallNoteRecord[]>(`/api/recall/documents/${documentId}/notes`)
}

export function createRecallNote(documentId: string, payload: RecallNoteCreateRequest) {
  return request<RecallNoteRecord>(`/api/recall/documents/${documentId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function updateRecallNote(noteId: string, payload: RecallNoteUpdateRequest) {
  return request<RecallNoteRecord>(`/api/recall/notes/${noteId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function deleteRecallNote(noteId: string) {
  return request<void>(`/api/recall/notes/${noteId}`, {
    method: 'DELETE',
  })
}

export function promoteRecallNoteToGraphNode(noteId: string, payload: RecallNoteGraphPromotionRequest) {
  return request<KnowledgeNodeDetail>(`/api/recall/notes/${noteId}/promote/graph-node`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function promoteRecallNoteToStudyCard(noteId: string, payload: RecallNoteStudyPromotionRequest) {
  return request<StudyCardRecord>(`/api/recall/notes/${noteId}/promote/study-card`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function searchRecallNotes(query: string, limit = 20, documentId?: string | null) {
  const search = new URLSearchParams({
    limit: String(limit),
    query,
  })
  if (documentId) {
    search.set('document_id', documentId)
  }
  return request<RecallNoteSearchHit[]>(`/api/recall/notes/search?${search.toString()}`)
}

export function searchRecall(query: string, limit = 20) {
  const search = new URLSearchParams({
    limit: String(limit),
    query,
  })
  return request<RecallSearchHit[]>(`/api/recall/search?${search.toString()}`)
}

export function retrieveRecall(query: string, limit = 20) {
  const search = new URLSearchParams({
    limit: String(limit),
    query,
  })
  return request<RecallRetrievalHit[]>(`/api/recall/retrieve?${search.toString()}`)
}

export function buildRecallExportUrl(documentId: string) {
  return buildApiUrl(`/api/recall/documents/${documentId}/export.md`)
}

export function buildRecallLearningPackExportUrl(documentId: string) {
  return buildApiUrl(`/api/recall/documents/${documentId}/learning-export.md`)
}

export function completeRecallDocumentReading(documentId: string, mode?: ViewMode | null) {
  return request<ReadingCompleteResult>(`/api/recall/documents/${documentId}/reading/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mode ? { mode } : {}),
  })
}
