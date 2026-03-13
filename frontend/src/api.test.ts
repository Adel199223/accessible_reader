import { afterEach, expect, test, vi } from 'vitest'

import { fetchDocuments } from './api'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

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
