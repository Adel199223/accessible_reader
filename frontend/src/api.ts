import type {
  AccessibilitySnapshot,
  BatchImportFormat,
  BatchImportPreview,
  BatchImportResult,
  DocumentRecord,
  DocumentView,
  HealthResponse,
  KnowledgeEdgeRecord,
  KnowledgeGraphSnapshot,
  KnowledgeNodeDetail,
  KnowledgeNodeRecord,
  LibrarySettings,
  LibraryCollectionOverview,
  LibraryReadingQueueResponse,
  LibraryReadingQueueScope,
  LibraryReadingQueueState,
  RecallNoteCreateRequest,
  RecallNoteGraphPromotionRequest,
  RecallNoteRecord,
  RecallNoteSearchHit,
  RecallNoteStudyPromotionRequest,
  RecallNoteUpdateRequest,
  RecallDocumentPreview,
  RecallRetrievalHit,
  ReaderSettings,
  RecallDocumentRecord,
  ReadingCompleteResult,
  RecallSearchHit,
  StudyCardBulkDeleteResult,
  StudyCardCreateRequest,
  StudyCardDeleteResult,
  StudyCardGenerationRequest,
  StudyCardGenerationResult,
  StudyCardRecord,
  StudyCardStatus,
  StudyCardUpdateRequest,
  StudyAnswerAttemptRecord,
  StudyAnswerAttemptRequest,
  StudyOverview,
  StudyReviewProgress,
  StudyReviewSessionCompleteRequest,
  StudyReviewSessionRecord,
  StudyReviewSessionStartRequest,
  StudyReviewRating,
  StudySettings,
  SummaryDetail,
  ViewMode,
  WorkspaceExportManifest,
  WorkspaceImportApplyResult,
  WorkspaceImportPreview,
} from './types'

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
  const apiBase = getApiBase()
  if (!apiBase) {
    return DEFAULT_LOCAL_SERVICE_HOST
  }

  if (typeof window === 'undefined') {
    return DEFAULT_LOCAL_SERVICE_HOST
  }

  try {
    return new URL(apiBase, window.location.origin).host || DEFAULT_LOCAL_SERVICE_HOST
  } catch {
    return DEFAULT_LOCAL_SERVICE_HOST
  }
}

function getApiBase() {
  return (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/u, '')
}

function isAbsoluteHttpUrl(path: string) {
  return /^https?:\/\//iu.test(path)
}

function buildApiUrl(path: string) {
  if (isAbsoluteHttpUrl(path)) {
    return path
  }

  const apiBase = getApiBase()
  if (!apiBase) {
    return path
  }

  return path.startsWith('/') ? `${apiBase}${path}` : `${apiBase}/${path}`
}

function localServiceUnavailableMessage() {
  return `Could not reach the local service at ${resolveLocalServiceHost()}. Retry after the backend is running again.`
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(buildApiUrl(path), init)
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

export function fetchRecallStudySettings() {
  return request<StudySettings>('/api/recall/study/settings')
}

export function saveRecallStudySettings(settings: StudySettings) {
  return request<StudySettings>('/api/recall/study/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  })
}

export function fetchRecallStudyProgress(sourceDocumentId?: string | null, periodDays = 14) {
  const search = new URLSearchParams()
  if (sourceDocumentId) {
    search.set('source_document_id', sourceDocumentId)
  }
  search.set('period_days', String(periodDays))
  const query = search.toString()
  return request<StudyReviewProgress>(`/api/recall/study/progress${query ? `?${query}` : ''}`)
}

export function fetchRecallStudyCards(status: 'all' | StudyCardStatus = 'all', limit = 20, sourceDocumentId?: string | null) {
  const search = new URLSearchParams({
    limit: String(limit),
    status,
  })
  if (sourceDocumentId) {
    search.set('source_document_id', sourceDocumentId)
  }
  return request<StudyCardRecord[]>(`/api/recall/study/cards?${search.toString()}`)
}

export function startRecallStudyReviewSession(payload: StudyReviewSessionStartRequest) {
  return request<StudyReviewSessionRecord>('/api/recall/study/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function completeRecallStudyReviewSession(sessionId: string, payload: StudyReviewSessionCompleteRequest) {
  return request<StudyReviewSessionRecord>(`/api/recall/study/sessions/${sessionId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function createRecallStudyCard(payload: StudyCardCreateRequest) {
  return request<StudyCardRecord>('/api/recall/study/cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function generateRecallStudyCards(payload?: StudyCardGenerationRequest) {
  return request<StudyCardGenerationResult>('/api/recall/study/cards/generate', {
    method: 'POST',
    ...(payload
      ? {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      : {}),
  })
}

export function createRecallStudyAnswerAttempt(cardId: string, payload: StudyAnswerAttemptRequest) {
  return request<StudyAnswerAttemptRecord>(`/api/recall/study/cards/${cardId}/attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function reviewRecallStudyCard(cardId: string, rating: StudyReviewRating, attemptId?: string | null) {
  return request<StudyCardRecord>(`/api/recall/study/cards/${cardId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, ...(attemptId ? { attempt_id: attemptId } : {}) }),
  })
}

export function updateRecallStudyCard(cardId: string, payload: StudyCardUpdateRequest) {
  return request<StudyCardRecord>(`/api/recall/study/cards/${cardId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function deleteRecallStudyCard(cardId: string) {
  return request<StudyCardDeleteResult>(`/api/recall/study/cards/${cardId}`, {
    method: 'DELETE',
  })
}

export function bulkDeleteRecallStudyCards(cardIds: string[]) {
  return request<StudyCardBulkDeleteResult>('/api/recall/study/cards/bulk-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ card_ids: cardIds }),
  })
}

export function setRecallStudyCardScheduleState(cardId: string, action: 'schedule' | 'unschedule') {
  return request<StudyCardRecord>(`/api/recall/study/cards/${cardId}/schedule-state`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  })
}

export function buildRecallExportUrl(documentId: string) {
  return buildApiUrl(`/api/recall/documents/${documentId}/export.md`)
}

export function buildRecallLearningPackExportUrl(documentId: string) {
  return buildApiUrl(`/api/recall/documents/${documentId}/learning-export.md`)
}

export function buildLibraryCollectionLearningPackExportUrl(collectionId: string) {
  return buildApiUrl(`/api/recall/library/collections/${encodeURIComponent(collectionId)}/learning-export.zip`)
}

export function fetchLibraryCollectionOverview(collectionId: string) {
  return request<LibraryCollectionOverview>(
    `/api/recall/library/collections/${encodeURIComponent(collectionId)}/overview`,
  )
}

export function fetchLibraryReadingQueue(options?: {
  collectionId?: string | null
  limit?: number | null
  scope?: LibraryReadingQueueScope | null
  state?: LibraryReadingQueueState | null
}) {
  const search = new URLSearchParams()
  if (options?.collectionId) {
    search.set('collection_id', options.collectionId)
  }
  if (options?.scope && options.scope !== 'all') {
    search.set('scope', options.scope)
  }
  if (options?.state && options.state !== 'all') {
    search.set('state', options.state)
  }
  if (options?.limit !== undefined && options.limit !== null) {
    search.set('limit', String(options.limit))
  }
  const query = search.toString()
  return request<LibraryReadingQueueResponse>(`/api/recall/library/reading-queue${query ? `?${query}` : ''}`)
}

export function completeRecallDocumentReading(documentId: string, mode?: ViewMode | null) {
  return request<ReadingCompleteResult>(`/api/recall/documents/${documentId}/reading/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mode ? { mode } : {}),
  })
}

export function buildWorkspaceExportUrl() {
  return buildApiUrl('/api/workspace/export.zip')
}

export function fetchWorkspaceExportManifest() {
  return request<WorkspaceExportManifest>('/api/workspace/export.manifest.json')
}

export function previewWorkspaceImport(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request<WorkspaceImportPreview>('/api/workspace/import-preview', {
    method: 'POST',
    body: formData,
  })
}

export function applyWorkspaceImport(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('restore_confirmation', 'restore-missing-items')
  return request<WorkspaceImportApplyResult>('/api/workspace/import-apply', {
    method: 'POST',
    body: formData,
  })
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

export function previewBatchImport(file: File, sourceFormat: BatchImportFormat = 'auto', maxItems = 25) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('source_format', sourceFormat)
  formData.append('max_items', String(maxItems))
  return request<BatchImportPreview>('/api/documents/import-batch-preview', {
    method: 'POST',
    body: formData,
  })
}

export function importBatchDocuments(
  file: File,
  sourceFormat: BatchImportFormat = 'auto',
  maxItems = 25,
  selectedItemIds: string[] = [],
  createCollections = false,
) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('source_format', sourceFormat)
  formData.append('max_items', String(maxItems))
  formData.append('selected_item_ids_json', JSON.stringify(selectedItemIds))
  formData.append('create_collections', String(createCollections))
  formData.append('import_confirmation', 'import-selected-sources')
  return request<BatchImportResult>('/api/documents/import-batch', {
    method: 'POST',
    body: formData,
  })
}

export function fetchLibrarySettings() {
  return request<LibrarySettings>('/api/recall/library/settings')
}

export function saveLibrarySettings(settings: LibrarySettings) {
  return request<LibrarySettings>('/api/recall/library/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
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
