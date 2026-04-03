import { useEffect, useRef, useState } from 'react'

import type { DocumentRecord } from '../types'

interface LibraryPaneProps {
  activeDocumentId: string | null
  deletingDocumentId: string | null
  documents: DocumentRecord[]
  embedded?: boolean
  errorMessage?: string | null
  hasAnyDocuments: boolean
  loading: boolean
  open: boolean
  searchLabel?: string
  searchPlaceholder?: string
  showHeader?: boolean
  showSearchLabel?: boolean
  showToggle?: boolean
  searchValue: string
  title?: string
  onDelete: (document: DocumentRecord) => Promise<void>
  onSearchChange: (value: string) => void
  onSelect: (document: DocumentRecord) => void
  onToggleOpen: () => void
}

function MoreIcon() {
  return (
    <svg
      aria-hidden="true"
      className="transport-icon"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="6" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="18" cy="12" r="1.8" />
    </svg>
  )
}

export function LibraryPane({
  activeDocumentId,
  deletingDocumentId,
  documents,
  embedded = false,
  errorMessage = null,
  hasAnyDocuments,
  loading,
  open,
  searchLabel = 'Search',
  searchPlaceholder = 'Search Home',
  showHeader = true,
  showSearchLabel = true,
  showToggle = true,
  searchValue,
  title = 'Home',
  onDelete,
  onSearchChange,
  onSelect,
  onToggleOpen,
}: LibraryPaneProps) {
  const [openActionsId, setOpenActionsId] = useState<string | null>(null)
  const rootRef = useRef<HTMLElement | null>(null)
  const hasSearch = searchValue.trim().length > 0
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
  })
  const libraryCountLabel = documents.length === 1 ? '1 saved' : `${documents.length} saved`
  const libraryStatusLabel = loading ? 'Loading…' : errorMessage ? 'Unavailable' : hasAnyDocuments ? libraryCountLabel : null
  const paneOpen = showToggle ? open : true

  useEffect(() => {
    if (!openActionsId) {
      return
    }

    function handlePointerDown(event: MouseEvent | PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpenActionsId(null)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenActionsId(null)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [openActionsId])

  return (
    <section
      aria-label={!showHeader && title ? title : undefined}
      ref={rootRef}
      className={embedded ? 'stack-gap library-pane library-pane-embedded' : 'card card-compact stack-gap library-pane'}
    >
      {showHeader || showToggle ? (
        <div className="toolbar library-pane-toolbar">
          {showHeader ? (
            <div className="section-header section-header-compact">
              <h2>{title}</h2>
              {libraryStatusLabel ? <p>{libraryStatusLabel}</p> : null}
            </div>
          ) : (
            <div aria-hidden="true" />
          )}
          {showToggle ? (
            <button
              aria-expanded={paneOpen}
              className="ghost-button"
              type="button"
              onClick={() => {
                if (paneOpen) {
                  setOpenActionsId(null)
                }
                onToggleOpen()
              }}
            >
              {paneOpen ? 'Hide' : 'Show'}
            </button>
          ) : null}
        </div>
      ) : null}

      {paneOpen ? (
        <>
          {showSearchLabel ? (
            <label className="field">
              <span>{searchLabel}</span>
              <input
                type="search"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </label>
          ) : (
            <div className="field">
              <input
                aria-label={searchLabel}
                type="search"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </div>
          )}

          <div className="library-list" role="list">
            {loading ? <p className="small-note">Loading documents…</p> : null}
            {!loading && errorMessage ? <p className="small-note">{errorMessage}</p> : null}
            {!loading && !errorMessage && documents.length === 0 ? (
              <p className="small-note">
                {hasSearch && hasAnyDocuments
                  ? 'No documents match this search yet.'
                  : 'No documents yet. Import text, a file, or a public article link to begin.'}
              </p>
            ) : null}

            {documents.map((document) => {
              const actionsOpen = openActionsId === document.id
              const deleting = deletingDocumentId === document.id

              return (
                <div key={document.id} className="library-row" role="listitem">
                  <button
                    aria-pressed={activeDocumentId === document.id}
                    className={`library-item ${activeDocumentId === document.id ? 'library-item-active' : 'library-item-passive'}`}
                    title={document.title}
                    type="button"
                    onClick={() => onSelect(document)}
                  >
                    <span className="library-title">{document.title}</span>
                    <span className="library-meta">
                      {document.source_type.toUpperCase()} • {dateFormatter.format(new Date(document.updated_at))}
                    </span>
                  </button>

                  <div className={`library-item-actions ${actionsOpen ? 'library-item-actions-open' : ''}`}>
                    <button
                      aria-expanded={actionsOpen}
                      aria-label={`More actions for ${document.title}`}
                      className="library-item-action-button"
                      title={`More actions for ${document.title}`}
                      type="button"
                      onClick={() => setOpenActionsId((current) => (current === document.id ? null : document.id))}
                    >
                      <MoreIcon />
                    </button>

                    {actionsOpen ? (
                      <div className="library-item-action-panel" role="group" aria-label={`Actions for ${document.title}`}>
                        <button
                          className="library-item-delete-button"
                          disabled={deleting}
                          type="button"
                          onClick={async () => {
                            setOpenActionsId(null)
                            await onDelete(document)
                          }}
                        >
                          {deleting ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : null}
    </section>
  )
}
