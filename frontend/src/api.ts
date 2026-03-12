import type {
  DocumentRecord,
  DocumentView,
  HealthResponse,
  ReaderSettings,
  SummaryDetail,
  ViewMode,
} from './types'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init)
  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as
      | { detail?: string }
      | null
    throw new Error(errorPayload?.detail ?? `Request failed with status ${response.status}.`)
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

export function saveProgress(documentId: string, mode: ViewMode, sentenceIndex: number) {
  return request<{ ok: boolean }>(`/api/documents/${documentId}/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, sentence_index: sentenceIndex }),
  })
}
