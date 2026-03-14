import type {
  AccessibilitySnapshot,
  DocumentRecord,
  DocumentView,
  HealthResponse,
  KnowledgeEdgeRecord,
  KnowledgeGraphSnapshot,
  KnowledgeNodeDetail,
  KnowledgeNodeRecord,
  RecallNoteCreateRequest,
  RecallNoteRecord,
  RecallNoteSearchHit,
  RecallNoteUpdateRequest,
  RecallRetrievalHit,
  ReaderSettings,
  RecallDocumentRecord,
  RecallSearchHit,
  StudyCardGenerationResult,
  StudyCardRecord,
  StudyOverview,
  StudyReviewRating,
  SummaryDetail,
  ViewMode,
} from './types'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const DEFAULT_LOCAL_SERVICE_HOST = '127.0.0.1:8000'

export type ApiRequestErrorKind = 'http' | 'network'

export class ApiRequestError extends Error {
  kind: ApiRequestErrorKind
  status: number | null

  constructor(message: string, options: { kind: ApiRequestErrorKind; status?: number | null }) {
    super(message)
    this.name = 'ApiRequestError'
    this.kind = options.kind
    this.status = options.status ?? null
  }
}

function resolveLocalServiceHost() {
  if (!API_BASE) {
    return DEFAULT_LOCAL_SERVICE_HOST
  }

  if (typeof window === 'undefined') {
    return DEFAULT_LOCAL_SERVICE_HOST
  }

  try {
    return new URL(API_BASE, window.location.origin).host || DEFAULT_LOCAL_SERVICE_HOST
  } catch {
    return DEFAULT_LOCAL_SERVICE_HOST
  }
}

function localServiceUnavailableMessage() {
  return `Could not reach the local service at ${resolveLocalServiceHost()}. Retry after the backend is running again.`
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, init)
  } catch {
    throw new ApiRequestError(localServiceUnavailableMessage(), { kind: 'network' })
  }

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as
      | { detail?: string }
      | null
    throw new ApiRequestError(
      errorPayload?.detail ?? `Request failed with status ${response.status}.`,
      {
        kind: 'http',
        status: response.status,
      },
    )
  }
  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

export function fetchHealth() {
  return request<HealthResponse>('/api/health')
}

export function fetchSettings() {
  return request<ReaderSettings>('/api/settings')
}

export function saveSettings(settings: ReaderSettings) {
  return request<ReaderSettings>('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  })
}

export function fetchDocuments(query = '') {
  const search = query ? `?query=${encodeURIComponent(query)}` : ''
  return request<DocumentRecord[]>(`/api/documents${search}`)
}

export function fetchRecallDocuments() {
  return request<RecallDocumentRecord[]>('/api/recall/documents')
}

export function fetchRecallDocument(documentId: string) {
  return request<RecallDocumentRecord>(`/api/recall/documents/${documentId}`)
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

export function fetchRecallGraph(limitNodes = 40, limitEdges = 60) {
  const search = new URLSearchParams({
    limit_edges: String(limitEdges),
    limit_nodes: String(limitNodes),
  })
  return request<KnowledgeGraphSnapshot>(`/api/recall/graph?${search.toString()}`)
}

export function fetchRecallGraphNode(nodeId: string) {
  return request<KnowledgeNodeDetail>(`/api/recall/graph/nodes/${nodeId}`)
}

export function decideRecallGraphNode(nodeId: string, decision: 'confirmed' | 'rejected') {
  return request<KnowledgeNodeRecord>(`/api/recall/graph/nodes/${nodeId}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision }),
  })
}

export function decideRecallGraphEdge(edgeId: string, decision: 'confirmed' | 'rejected') {
  return request<KnowledgeEdgeRecord>(`/api/recall/graph/edges/${edgeId}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision }),
  })
}

export function fetchRecallStudyOverview() {
  return request<StudyOverview>('/api/recall/study/overview')
}

export function fetchRecallStudyCards(status: 'all' | 'new' | 'due' | 'scheduled' = 'all', limit = 20) {
  const search = new URLSearchParams({
    limit: String(limit),
    status,
  })
  return request<StudyCardRecord[]>(`/api/recall/study/cards?${search.toString()}`)
}

export function generateRecallStudyCards() {
  return request<StudyCardGenerationResult>('/api/recall/study/cards/generate', {
    method: 'POST',
  })
}

export function reviewRecallStudyCard(cardId: string, rating: StudyReviewRating) {
  return request<StudyCardRecord>(`/api/recall/study/cards/${cardId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating }),
  })
}

export function buildRecallExportUrl(documentId: string) {
  return `${API_BASE}/api/recall/documents/${documentId}/export.md`
}

export function importTextDocument(text: string, title?: string) {
  return request<DocumentRecord>('/api/documents/import-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, title }),
  })
}

export function importFileDocument(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request<DocumentRecord>('/api/documents/import-file', {
    method: 'POST',
    body: formData,
  })
}

export function importUrlDocument(url: string) {
  return request<DocumentRecord>('/api/documents/import-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
}

export function fetchDocumentView(
  documentId: string,
  mode: ViewMode,
  detailLevel: SummaryDetail = 'balanced',
) {
  const detail = mode === 'summary' ? detailLevel : 'default'
  return request<DocumentView>(
    `/api/documents/${documentId}/view?mode=${mode}&detail_level=${detail}`,
  )
}

export function generateDocumentView(
  documentId: string,
  mode: 'simplified' | 'summary',
  detailLevel: SummaryDetail = 'balanced',
) {
  return request<DocumentView>(`/api/documents/${documentId}/transform`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, detail_level: detailLevel }),
  })
}

export function saveProgress(
  documentId: string,
  mode: ViewMode,
  sentenceIndex: number,
  options?: {
    summaryDetail?: SummaryDetail
    accessibilitySnapshot?: AccessibilitySnapshot
  },
) {
  return request<{ ok: boolean }>(`/api/documents/${documentId}/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode,
      sentence_index: sentenceIndex,
      summary_detail: options?.summaryDetail,
      accessibility_snapshot: options?.accessibilitySnapshot,
    }),
  })
}

export function deleteDocumentRecord(documentId: string) {
  return request<void>(`/api/documents/${documentId}`, {
    method: 'DELETE',
  })
}
