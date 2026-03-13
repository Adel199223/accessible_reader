import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchWithTimeout } from './network'


describe('fetchWithTimeout', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the fetch response when the backend responds in time', async () => {
    const response = new Response(JSON.stringify({ ok: true }), { status: 200 })
    const fetchMock = vi.fn(async () => response)

    const result = await fetchWithTimeout('http://127.0.0.1:8000/api/health', {}, 25, fetchMock)

    expect(result).toBe(response)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('raises a stable timeout error when the backend hangs', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn((_input: string, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted.', 'AbortError'))
        })
      })
    })

    const pending = expect(
      fetchWithTimeout('http://127.0.0.1:8000/api/health', {}, 25, fetchMock),
    ).rejects.toThrow('The local Recall backend did not respond within 1s.')
    await vi.advanceTimersByTimeAsync(30)

    await pending
  })
})
