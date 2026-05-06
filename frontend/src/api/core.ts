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

export { buildApiUrl, request }
