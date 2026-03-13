export type AppSection = 'recall' | 'reader'

export interface AppRoute {
  documentId: string | null
  path: AppSection
}


export function parseAppRoute(locationLike: Pick<Location, 'pathname' | 'search'>): AppRoute {
  const pathname = locationLike.pathname.replace(/\/+$/, '') || '/'
  const searchParams = new URLSearchParams(locationLike.search)
  const documentId = searchParams.get('document')
  if (pathname === '/reader') {
    return { path: 'reader', documentId }
  }
  return { path: 'recall', documentId: null }
}


export function buildAppHref(path: AppSection, documentId?: string | null) {
  if (path === 'reader' && documentId) {
    return `/reader?document=${encodeURIComponent(documentId)}`
  }
  return `/${path}`
}
