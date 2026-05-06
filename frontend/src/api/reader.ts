import type {
  AccessibilitySnapshot,
  BatchImportFormat,
  BatchImportPreview,
  BatchImportResult,
  DocumentRecord,
  DocumentView,
  HealthResponse,
  ReaderSettings,
  SummaryDetail,
  ViewMode,
} from '../types'
import { request } from './core'

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
