const DEFAULT_TIMEOUT_MS = 3500


export async function fetchWithTimeout(
  input: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
  fetchImpl: typeof fetch = fetch,
) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetchImpl(input, { ...init, signal: controller.signal })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      const roundedSeconds = Math.max(1, Math.round(timeoutMs / 1000))
      throw new Error(`The local Recall backend did not respond within ${roundedSeconds}s.`)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}
