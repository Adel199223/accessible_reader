import { useState, type ChangeEvent, type FormEvent } from 'react'

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
  showHeader?: boolean
  title?: string
}

type ImportMode = 'text' | 'url' | 'file'

const importModes: Array<{
  description: string
  label: string
  value: ImportMode
}> = [
  {
    value: 'text',
    label: 'Paste text',
    description: 'Save copied text or notes directly into Recall.',
  },
  {
    value: 'url',
    label: 'Web page',
    description: 'Import one supported public article link.',
  },
  {
    value: 'file',
    label: 'Choose file',
    description: 'Bring in a local document from disk.',
  },
]

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
  showHeader = true,
  title: panelTitle = 'Import',
}: ImportPanelProps) {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [mode, setMode] = useState<ImportMode>('text')

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
      <div className="import-panel-mode-tabs" aria-label="Import modes" role="tablist">
        {importModes.map((item) => (
          <button
            key={item.value}
            aria-selected={mode === item.value}
            className={mode === item.value ? 'import-panel-mode import-panel-mode-active' : 'import-panel-mode'}
            role="tab"
            type="button"
            onClick={() => setMode(item.value)}
          >
            <strong>{item.label}</strong>
            <span>{item.description}</span>
          </button>
        ))}
      </div>

      <div className="import-panel-primary stack-gap">
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
                rows={8}
                placeholder="Paste text here"
                value={text}
                onChange={(event) => setText(event.target.value)}
              />
            </label>
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
            <div className="inline-actions">
              <button disabled={busy || !url.trim()} type="submit">
                {busy ? 'Importing…' : 'Import link'}
              </button>
            </div>
          </form>
        ) : null}

        {mode === 'file' ? (
          <section className="import-panel-file-drop" aria-label="File import">
            <div className="stack-gap">
              <strong>Import a local file</strong>
              <p>TXT, Markdown, HTML, DOCX, and text-based PDF are supported.</p>
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

        <div className="import-panel-support-inline stack-gap" aria-label="Import support">
          <div className="section-header section-header-compact">
            <h3>Supported here</h3>
            <p>Keep the flow local-first while using one clearer entry surface.</p>
          </div>
          <ul className="import-panel-support-list">
            <li>Local text and pasted notes</li>
            <li>Public article links</li>
            <li>TXT, Markdown, HTML, DOCX, and text-based PDF</li>
          </ul>
          <p className="small-note">{helperText}</p>
        </div>
      </div>
    </section>
  )
}
