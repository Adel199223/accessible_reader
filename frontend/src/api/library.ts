import type {
  HighlightReviewInboxResponse,
  HighlightReviewInboxState,
  LibraryCollectionOverview,
  LibraryReadingQueueLearningFilter,
  LibraryReadingQueueResponse,
  LibraryReadingQueueScope,
  LibraryReadingQueueState,
  LibrarySettings,
} from '../types'
import { buildApiUrl, request } from './core'

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
  learningFilter?: LibraryReadingQueueLearningFilter | null
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
  if (options?.learningFilter && options.learningFilter !== 'all') {
    search.set('learning_filter', options.learningFilter)
  }
  if (options?.limit !== undefined && options.limit !== null) {
    search.set('limit', String(options.limit))
  }
  const query = search.toString()
  return request<LibraryReadingQueueResponse>(`/api/recall/library/reading-queue${query ? `?${query}` : ''}`)
}

export function fetchHighlightReviewInbox(options?: {
  collectionId?: string | null
  learningFilter?: LibraryReadingQueueLearningFilter | null
  limit?: number | null
  readingState?: LibraryReadingQueueState | null
  scope?: LibraryReadingQueueScope | null
  sourceDocumentId?: string | null
  state?: HighlightReviewInboxState | null
}) {
  const search = new URLSearchParams()
  if (options?.collectionId) {
    search.set('collection_id', options.collectionId)
  }
  if (options?.sourceDocumentId) {
    search.set('source_document_id', options.sourceDocumentId)
  }
  if (options?.scope && options.scope !== 'all') {
    search.set('scope', options.scope)
  }
  if (options?.state && options.state !== 'needs_review') {
    search.set('state', options.state)
  }
  if (options?.readingState && options.readingState !== 'all') {
    search.set('reading_state', options.readingState)
  }
  if (options?.learningFilter && options.learningFilter !== 'all') {
    search.set('learning_filter', options.learningFilter)
  }
  if (options?.limit !== undefined && options.limit !== null) {
    search.set('limit', String(options.limit))
  }
  const query = search.toString()
  return request<HighlightReviewInboxResponse>(`/api/recall/library/highlight-review-inbox${query ? `?${query}` : ''}`)
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
