import type {
  StudyAnswerAttemptRecord,
  StudyAnswerAttemptRequest,
  StudyCardBulkDeleteResult,
  StudyCardCreateRequest,
  StudyCardDeleteResult,
  StudyCardGenerationRequest,
  StudyCardGenerationResult,
  StudyCardRecord,
  StudyCardStatus,
  StudyCardUpdateRequest,
  StudyOverview,
  StudyReviewProgress,
  StudyReviewRating,
  StudyReviewSessionCompleteRequest,
  StudyReviewSessionRecord,
  StudyReviewSessionStartRequest,
  StudySettings,
} from '../types'
import { request } from './core'

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
