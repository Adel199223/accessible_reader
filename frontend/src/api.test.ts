import { afterEach, expect, test, vi } from 'vitest'

import { buildRecallExportUrl, fetchDocuments, fetchRecallDocumentPreview } from './api'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

function buildJsonResponse(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
}

test('request normalizes local-service network failures into actionable copy', async () => {
  const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
  vi.stubGlobal('fetch', fetchMock)

  await expect(fetchDocuments()).rejects.toEqual(
    expect.objectContaining({
      kind: 'network',
      message:
        'Could not reach the local service at 127.0.0.1:8000. Retry after the backend is running again.',
      name: 'ApiRequestError',
      status: null,
    }),
  )
})

test('fetchRecallDocumentPreview prefixes relative asset URLs with the configured API base', async () => {
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test/base/')
  const fetchMock = vi.fn().mockResolvedValue(
    buildJsonResponse({
      asset_url: '/api/recall/documents/doc-preview/preview/asset?updated_at=2026-03-27T08%3A00%3A00Z',
      document_id: 'doc-preview',
      kind: 'image',
      source: 'html-inline-image',
      updated_at: '2026-03-27T08:00:00Z',
    }),
  )
  vi.stubGlobal('fetch', fetchMock)

  await expect(fetchRecallDocumentPreview('doc-preview')).resolves.toMatchObject({
    asset_url: 'https://api.example.test/base/api/recall/documents/doc-preview/preview/asset?updated_at=2026-03-27T08%3A00%3A00Z',
    document_id: 'doc-preview',
  })
  expect(fetchMock).toHaveBeenCalledWith(
    'https://api.example.test/base/api/recall/documents/doc-preview/preview',
    undefined,
  )
  expect(buildRecallExportUrl('doc-preview')).toBe(
    'https://api.example.test/base/api/recall/documents/doc-preview/export.md',
  )
})

test('fetchRecallDocumentPreview leaves relative asset URLs unchanged without an API base', async () => {
  vi.stubEnv('VITE_API_BASE_URL', '')
  const fetchMock = vi.fn().mockResolvedValue(
    buildJsonResponse({
      asset_url: '/api/recall/documents/doc-preview/preview/asset?updated_at=2026-03-27T08%3A00%3A00Z',
      document_id: 'doc-preview',
      kind: 'image',
      source: 'html-inline-image',
      updated_at: '2026-03-27T08:00:00Z',
    }),
  )
  vi.stubGlobal('fetch', fetchMock)

  await expect(fetchRecallDocumentPreview('doc-preview')).resolves.toMatchObject({
    asset_url: '/api/recall/documents/doc-preview/preview/asset?updated_at=2026-03-27T08%3A00%3A00Z',
    document_id: 'doc-preview',
  })
  expect(fetchMock).toHaveBeenCalledWith('/api/recall/documents/doc-preview/preview', undefined)
  expect(buildRecallExportUrl('doc-preview')).toBe('/api/recall/documents/doc-preview/export.md')
})

test('fetchRecallDocumentPreview preserves absolute asset URLs', async () => {
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test/base/')
  const fetchMock = vi.fn().mockResolvedValue(
    buildJsonResponse({
      asset_url: 'https://cdn.example.test/previews/doc-preview.jpg',
      document_id: 'doc-preview',
      kind: 'image',
      source: 'html-inline-image',
      updated_at: '2026-03-27T08:00:00Z',
    }),
  )
  vi.stubGlobal('fetch', fetchMock)

  await expect(fetchRecallDocumentPreview('doc-preview')).resolves.toMatchObject({
    asset_url: 'https://cdn.example.test/previews/doc-preview.jpg',
    document_id: 'doc-preview',
  })
  expect(fetchMock).toHaveBeenCalledWith(
    'https://api.example.test/base/api/recall/documents/doc-preview/preview',
    undefined,
  )
})
