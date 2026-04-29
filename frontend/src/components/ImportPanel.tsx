import { useState, type ChangeEvent, type FormEvent } from 'react'

import type { BatchImportFormat, BatchImportPreview, BatchImportResult } from '../types'

interface ImportPanelProps {
  busy: boolean
  collapsed?: boolean
  collapsedActionLabel?: string
  collapsedTitle?: string
  description?: string
  helperText?: string
  onToggleCollapsed?: () => void
  onImportText: (title: string, text: string) => Promise<void>
  onImportUrl: (url: string) => Promise<void>
  onImportFile: (file: File) => Promise<void>
  onPreviewBatchImport: (file: File, sourceFormat: BatchImportFormat, maxItems: number) => Promise<BatchImportPreview>
  onImportBatch: (
    file: File,
    sourceFormat: BatchImportFormat,
    maxItems: number,
    selectedItemIds: string[],
    createCollections: boolean,
  ) => Promise<BatchImportResult>
  showHeader?: boolean
  title?: string
}

type ImportMode = 'text' | 'url' | 'file' | 'batch'

const importModes: Array<{
  helperLabel: string
  helperText: string
  heroDescription: string
  heroTitle: string
  description: string
  label: string
  panelTitle: string
  supportPoints: string[]
  supportTitle: string
  value: ImportMode
}> = [
  {
    value: 'text',
    label: 'Paste text',
    panelTitle: 'Text capture',
    description: 'Turn copied text or rough notes into a saved source.',
    heroTitle: 'Paste something you already have',
    heroDescription: 'Best for copied notes, excerpts, drafts, or quick captures that already live on your clipboard.',
    helperLabel: 'Local capture',
    helperText: 'Recall saves the text locally so it can reopen in Reader, Notebook, Graph, and Study like any other source.',
    supportTitle: 'Works well for',
    supportPoints: [
      'Quick notes or copied passages you want to reopen later.',
      'Text-first captures when you do not need a local file.',
      'Fast imports that should stay local-first from the start.',
    ],
  },
  {
    value: 'url',
    label: 'Web page',
    panelTitle: 'Article link',
    description: 'Save one supported public article from the web.',
    heroTitle: 'Bring in one public article',
    heroDescription: 'Recall snapshots the page once, then reopens the saved local copy instead of depending on the live site.',
    helperLabel: 'Article snapshot',
    helperText: 'Use this for readable public articles, essays, or reference pages that should stay available offline later.',
    supportTitle: 'Best for',
    supportPoints: [
      'One article page at a time, rather than a whole website.',
      'Sources you want to read again without live syncing.',
      'Web captures that should keep a local reopen path.',
    ],
  },
  {
    value: 'file',
    label: 'Choose file',
    panelTitle: 'File import',
    description: 'Import one local document from this device.',
    heroTitle: 'Choose a file from this device',
    heroDescription: 'Bring in a document you already have on disk and keep it in the same local-first reading flow as everything else.',
    helperLabel: 'Local document',
    helperText: 'TXT, Markdown, HTML, DOCX, and text-based PDF stay supported here without changing the existing import pipeline.',
    supportTitle: 'Supported here',
    supportPoints: [
      'TXT, Markdown, HTML, DOCX, and text-based PDF.',
      'Local documents that should reopen from Home later.',
      'One file at a time through the same Reader-first workflow.',
    ],
  },
  {
    value: 'batch',
    label: 'Bulk import',
    panelTitle: 'Archive preview',
    description: 'Preview bookmark, Pocket, or URL-list exports before importing.',
    heroTitle: 'Preview an archive before saving',
    heroDescription: 'Bring in a local reading list, review what Recall found, then import only the ready links.',
    helperLabel: 'Preview first',
    helperText: 'Bookmarks, Pocket-style exports, and URL lists stay local until you choose which ready rows to import.',
    supportTitle: 'Supported archives',
    supportPoints: [
      'Browser bookmark HTML files.',
      'Pocket-style CSV, HTML, or ZIP exports.',
      'Plain TXT, Markdown, or CSV URL lists.',
    ],
  },
]

function ImportModeIcon({ mode }: { mode: ImportMode }) {
  if (mode === 'text') {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <path d="M4.5 5.25h11M4.5 9.25h11M4.5 13.25h7.5" />
      </svg>
    )
  }
  if (mode === 'url') {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <path d="M8.35 5.5H6.8A3.3 3.3 0 0 0 3.5 8.8v0A3.3 3.3 0 0 0 6.8 12.1h1.55M11.65 5.5h1.55a3.3 3.3 0 0 1 3.3 3.3v0a3.3 3.3 0 0 1-3.3 3.3h-1.55M7.35 10h5.3" />
      </svg>
    )
  }
  if (mode === 'batch') {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <path d="M4.25 5.25h11.5v2.5H4.25zM4.25 10h11.5v2.5H4.25zM4.25 14.75h7.5" />
      </svg>
    )
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M5.25 4.5h6.3l3.2 3.2v7.8h-9.5z" />
      <path d="M11.55 4.5v3.2h3.2M7.3 11h5.4" />
    </svg>
  )
}

export function ImportPanel({
  busy,
  collapsed = false,
  collapsedActionLabel = 'Import',
  collapsedTitle = 'Add document',
  description = 'Paste text, choose a file, or import a link.',
  helperText = 'TXT, Markdown, HTML, DOCX, text-based PDF, and public article links.',
  onToggleCollapsed,
  onImportText,
  onImportUrl,
  onImportFile,
  onPreviewBatchImport,
  onImportBatch,
  showHeader = true,
  title: panelTitle = 'Import',
}: ImportPanelProps) {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [mode, setMode] = useState<ImportMode>('text')
  const [batchFile, setBatchFile] = useState<File | null>(null)
  const [batchFormat, setBatchFormat] = useState<BatchImportFormat>('auto')
  const [batchMaxItems, setBatchMaxItems] = useState(25)
  const [batchPreview, setBatchPreview] = useState<BatchImportPreview | null>(null)
  const [batchResult, setBatchResult] = useState<BatchImportResult | null>(null)
  const [batchSelectedIds, setBatchSelectedIds] = useState<Set<string>>(new Set())
  const [batchCreateCollections, setBatchCreateCollections] = useState(true)
  const [batchError, setBatchError] = useState<string | null>(null)
  const activeMode = importModes.find((item) => item.value === mode) ?? importModes[0]
  const readyBatchRows = batchPreview?.rows.filter((row) => row.status === 'ready') ?? []
  const selectedReadyBatchCount = readyBatchRows.filter((row) => batchSelectedIds.has(row.id)).length

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!text.trim()) {
      return
    }
    await onImportText(title, text)
    setTitle('')
    setText('')
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    await onImportFile(file)
    event.target.value = ''
  }

  async function handleUrlSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!url.trim()) {
      return
    }
    await onImportUrl(url)
    setUrl('')
  }

  async function handleBatchPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!batchFile) {
      return
    }
    setBatchError(null)
    setBatchResult(null)
    try {
      const preview = await onPreviewBatchImport(batchFile, batchFormat, batchMaxItems)
      setBatchPreview(preview)
      setBatchSelectedIds(new Set(preview.rows.filter((row) => row.status === 'ready').map((row) => row.id)))
    } catch (error) {
      setBatchPreview(null)
      setBatchSelectedIds(new Set())
      setBatchError(error instanceof Error ? error.message : 'Could not preview that import file.')
    }
  }

  async function handleBatchImport() {
    if (!batchFile || !batchPreview || selectedReadyBatchCount === 0) {
      return
    }
    setBatchError(null)
    try {
      const result = await onImportBatch(
        batchFile,
        batchFormat,
        batchMaxItems,
        Array.from(batchSelectedIds),
        batchCreateCollections,
      )
      setBatchResult(result)
    } catch (error) {
      setBatchResult(null)
      setBatchError(error instanceof Error ? error.message : 'Could not import selected links.')
    }
  }

  function handleBatchFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setBatchFile(file)
    setBatchPreview(null)
    setBatchResult(null)
    setBatchSelectedIds(new Set())
    setBatchError(null)
  }

  function toggleBatchRow(rowId: string) {
    setBatchSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(rowId)) {
        next.delete(rowId)
      } else {
        next.add(rowId)
      }
      return next
    })
  }

  if (collapsed) {
    return (
      <section className="card card-compact import-panel import-panel-collapsed">
        <div className="toolbar import-panel-toolbar">
          <div className="section-header section-header-compact">
            <h2>{collapsedTitle}</h2>
          </div>
          <button className="ghost-button" type="button" onClick={onToggleCollapsed}>
            {collapsedActionLabel}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="card card-compact stack-gap import-panel">
      {showHeader ? (
        <div className="toolbar import-panel-toolbar">
          <div className="section-header section-header-compact">
            <h2>{panelTitle}</h2>
            <p>{description}</p>
          </div>
          {onToggleCollapsed ? (
            <button className="ghost-button" type="button" onClick={onToggleCollapsed}>
              Hide
            </button>
          ) : null}
        </div>
      ) : null}
      <section
        aria-label="Add content capture gateway"
        className="import-panel-command-row import-panel-command-row-stage880"
        data-add-content-command-row-stage880="true"
      >
        <div className="import-panel-entry-copy import-panel-command-copy-stage880">
          <p className="import-panel-entry-eyebrow">One place to add things</p>
          <h3>{activeMode.heroTitle}</h3>
          <p>{activeMode.heroDescription}</p>
        </div>
        <div className="import-panel-command-status-stage880" aria-label="Active import guidance">
          <strong>{activeMode.helperLabel}</strong>
          <p>{activeMode.helperText}</p>
        </div>
      </section>
      <div className="import-panel-mode-tabs import-panel-mode-tabs-stage880" aria-label="Import modes" role="tablist">
        {importModes.map((item) => (
          <button
            key={item.value}
            aria-selected={mode === item.value}
            className={mode === item.value ? 'import-panel-mode import-panel-mode-active' : 'import-panel-mode'}
            role="tab"
            type="button"
            onClick={() => setMode(item.value)}
          >
            <span className="import-panel-mode-icon" aria-hidden="true">
              <ImportModeIcon mode={item.value} />
            </span>
            <span className="import-panel-mode-copy">
              <strong>{item.label}</strong>
              <span>{item.description}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="import-panel-layout import-panel-layout-stage880">
        <div
          aria-label="Selected import workbench"
          className="import-panel-primary import-panel-primary-stage880 stack-gap"
          data-add-content-primary-workbench-stage880="true"
        >
          <div className="import-panel-primary-header">
            <span className="import-panel-primary-kicker">{activeMode.label}</span>
            <div className="section-header section-header-compact">
              <h3>{activeMode.panelTitle}</h3>
              <p>{activeMode.helperText}</p>
            </div>
          </div>

          <div
            aria-label="Import support"
            className="import-panel-support-seam import-panel-support-seam-stage880"
            data-add-content-support-seam-stage880="true"
          >
            <strong>{activeMode.supportTitle}</strong>
            <div className="import-panel-support-seam-list">
              {activeMode.supportPoints.map((point) => (
                <span key={point}>{point}</span>
              ))}
            </div>
            <span className="import-panel-support-seam-note">{helperText}</span>
          </div>

          {mode === 'text' ? (
            <form className="stack-gap" onSubmit={handleSubmit}>
              <label className="field">
                <span>Title</span>
                <input
                  type="text"
                  placeholder="Optional title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>
              <label className="field">
                <span>Paste text</span>
                <textarea
                  rows={5}
                  placeholder="Paste text here"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                />
              </label>
              <p className="small-note">Optional titles make this source easier to spot later in Home and Notebook.</p>
              <div className="inline-actions">
                <button disabled={busy || !text.trim()} type="submit">
                  {busy ? 'Importing…' : 'Import text'}
                </button>
              </div>
            </form>
          ) : null}

          {mode === 'url' ? (
            <form className="stack-gap import-web-form" onSubmit={handleUrlSubmit}>
              <label className="field">
                <span>Article URL</span>
                <input
                  autoComplete="url"
                  inputMode="url"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                />
              </label>
              <p className="small-note">Public article pages work best here. Recall saves one local snapshot for later reopen.</p>
              <div className="inline-actions">
                <button disabled={busy || !url.trim()} type="submit">
                  {busy ? 'Importing…' : 'Import link'}
                </button>
              </div>
            </form>
          ) : null}

          {mode === 'file' ? (
            <section className="import-panel-file-drop" aria-label="File import">
              <div className="import-panel-file-drop-copy stack-gap">
                <span className="import-panel-file-drop-icon" aria-hidden="true">
                  <ImportModeIcon mode="file" />
                </span>
                <div className="section-header section-header-compact">
                  <h3>Import a local file</h3>
                  <p>Choose one document from this device and keep it in the same saved-source flow as everything else.</p>
                </div>
              </div>
              <label className="secondary-button import-panel-file-button">
                <input
                  className="visually-hidden"
                  type="file"
                  accept=".txt,.md,.html,.htm,.docx,.pdf"
                  onChange={handleFileChange}
                />
                Choose file
              </label>
            </section>
          ) : null}

          {mode === 'batch' ? (
            <form className="stack-gap import-panel-bulk-form" onSubmit={handleBatchPreview}>
              <div className="import-panel-bulk-controls">
                <label className="field">
                  <span>Archive file</span>
                  <input
                    type="file"
                    accept=".html,.htm,.csv,.txt,.md,.zip"
                    onChange={handleBatchFileChange}
                  />
                </label>
                <label className="field">
                  <span>Format</span>
                  <select
                    value={batchFormat}
                    onChange={(event) => setBatchFormat(event.target.value as BatchImportFormat)}
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="bookmarks_html">Bookmark HTML</option>
                    <option value="pocket_csv">Pocket CSV</option>
                    <option value="pocket_zip">Pocket ZIP</option>
                    <option value="url_list">URL list</option>
                  </select>
                </label>
                <label className="field">
                  <span>Max links</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={batchMaxItems}
                    onChange={(event) => {
                      const nextValue = Number(event.target.value)
                      setBatchMaxItems(Number.isFinite(nextValue) ? Math.min(100, Math.max(1, nextValue)) : 25)
                    }}
                  />
                </label>
              </div>
              <label className="import-panel-bulk-checkbox">
                <input
                  type="checkbox"
                  checked={batchCreateCollections}
                  onChange={(event) => setBatchCreateCollections(event.target.checked)}
                />
                <span>Create collections from folders/tags</span>
              </label>
              <p className="small-note">Preview is dry-run only. Recall imports selected ready links as one-time local snapshots.</p>
              <div className="inline-actions">
                <button disabled={busy || !batchFile} type="submit">
                  {busy ? 'Previewing…' : 'Preview archive'}
                </button>
              </div>

              {batchError ? (
                <div className="inline-error" role="alert">
                  <p>{batchError}</p>
                </div>
              ) : null}

              {batchPreview ? (
                <section className="import-panel-bulk-preview" aria-label="Bulk import preview">
                  <div className="toolbar import-panel-bulk-summary">
                    <div className="section-header section-header-compact">
                      <h3>Preview</h3>
                      <p>
                        {batchPreview.summary.ready_count} ready · {batchPreview.summary.duplicate_count} duplicate ·{' '}
                        {batchPreview.summary.invalid_count + batchPreview.summary.unsupported_count} skipped
                      </p>
                    </div>
                    <button
                      className="secondary-button"
                      disabled={busy || selectedReadyBatchCount === 0}
                      type="button"
                      onClick={handleBatchImport}
                    >
                      {busy ? 'Importing…' : `Import selected (${selectedReadyBatchCount})`}
                    </button>
                  </div>
                  {batchPreview.collection_suggestions.length ? (
                    <div className="import-panel-bulk-collections" aria-label="Suggested import collections">
                      {batchPreview.collection_suggestions.slice(0, 8).map((collection) => (
                        <span
                          key={collection.id}
                          className="import-panel-bulk-collection-chip"
                          data-import-collection-path-depth-stage968={String((collection.path ?? []).length)}
                        >
                          {(collection.path?.length ? collection.path.join(' / ') : collection.name)} · {collection.ready_count}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="import-panel-bulk-list">
                    {batchPreview.rows.slice(0, 8).map((row) => (
                      <label
                        key={row.id}
                        className={
                          row.status === 'ready'
                            ? 'import-panel-bulk-row import-panel-bulk-row-ready'
                            : 'import-panel-bulk-row'
                        }
                      >
                        <input
                          type="checkbox"
                          checked={batchSelectedIds.has(row.id)}
                          disabled={row.status !== 'ready'}
                          onChange={() => toggleBatchRow(row.id)}
                        />
                        <span className="import-panel-bulk-row-copy">
                          <strong>{row.title || row.url}</strong>
                          <span>{row.url}</span>
                          {row.folder || row.tags.length ? (
                            <em>
                              {[row.folder, ...row.tags].filter(Boolean).join(' · ')}
                            </em>
                          ) : null}
                        </span>
                        <span className={`import-panel-bulk-status import-panel-bulk-status-${row.status}`}>
                          {row.status}
                        </span>
                      </label>
                    ))}
                  </div>
                  {batchPreview.rows.length > 8 ? (
                    <p className="small-note">{batchPreview.rows.length - 8} more preview rows are included in the import summary.</p>
                  ) : null}
                </section>
              ) : null}

              {batchResult ? (
                <section className="import-panel-bulk-result" aria-label="Bulk import result">
                  <strong>
                    {batchResult.summary.imported_count} imported · {batchResult.summary.reused_count} reused ·{' '}
                    {batchResult.summary.skipped_count} skipped · {batchResult.summary.failed_count} failed
                  </strong>
                  {batchResult.summary.collection_created_count || batchResult.summary.collection_updated_count ? (
                    <p className="small-note">
                      {batchResult.summary.collection_created_count} collections created ·{' '}
                      {batchResult.summary.collection_updated_count} updated
                    </p>
                  ) : null}
                  {batchResult.collections.length ? (
                    <div className="import-panel-bulk-collections" aria-label="Imported collections">
                      {batchResult.collections.slice(0, 8).map((collection) => (
                        <span key={collection.id} className="import-panel-bulk-collection-chip">
                          {(collection.path?.length ? collection.path.join(' / ') : collection.name)} · {collection.document_ids.length}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {batchResult.rows.some((row) => row.status === 'failed') ? (
                    <p className="small-note">
                      Failed links stayed in the archive preview; the rest of the selected import finished normally.
                    </p>
                  ) : (
                    <p className="small-note">Imported sources are now available from Home and Reader.</p>
                  )}
                </section>
              ) : null}
            </form>
          ) : null}
        </div>
      </div>
    </section>
  )
}
