import type { DocumentRecord } from '../types'

interface LibraryPaneProps {
  activeDocumentId: string | null
  documents: DocumentRecord[]
  loading: boolean
  searchValue: string
  onSearchChange: (value: string) => void
  onSelect: (documentId: string) => void
}

export function LibraryPane({
  activeDocumentId,
  documents,
  loading,
  searchValue,
  onSearchChange,
  onSelect,
}: LibraryPaneProps) {
  return (
    <section className="card stack-gap">
      <div className="section-header">
        <h2>Library</h2>
        <p>Small local library with reopen support and saved reading progress.</p>
      </div>
      <label className="field">
        <span>Search</span>
        <input
          type="search"
          placeholder="Find a document"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>
      <div className="library-list" role="list">
        {loading ? <p className="small-note">Loading documents…</p> : null}
        {!loading && documents.length === 0 ? (
          <p className="small-note">No documents yet. Import text or a file to begin.</p>
        ) : null}
        {documents.map((document) => (
          <button
            key={document.id}
            className={`library-item ${activeDocumentId === document.id ? 'library-item-active' : ''}`}
            type="button"
            onClick={() => onSelect(document.id)}
          >
            <span className="library-title">{document.title}</span>
            <span className="library-meta">
              {document.source_type.toUpperCase()} • {new Date(document.updated_at).toLocaleString()}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
