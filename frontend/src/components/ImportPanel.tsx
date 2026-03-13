import { useState, type ChangeEvent, type FormEvent } from 'react'

interface ImportPanelProps {
  busy: boolean
  collapsed?: boolean
  onToggleCollapsed?: () => void
  onImportText: (title: string, text: string) => Promise<void>
  onImportUrl: (url: string) => Promise<void>
  onImportFile: (file: File) => Promise<void>
}

export function ImportPanel({
  busy,
  collapsed = false,
  onToggleCollapsed,
  onImportText,
  onImportUrl,
  onImportFile,
}: ImportPanelProps) {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [webPageOpen, setWebPageOpen] = useState(false)
  const [url, setUrl] = useState('')

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
    setWebPageOpen(false)
  }

  if (collapsed) {
    return (
      <section className="card card-compact import-panel import-panel-collapsed">
        <div className="toolbar import-panel-toolbar">
          <div className="section-header section-header-compact">
            <h2>Add document</h2>
          </div>
          <button className="ghost-button" type="button" onClick={onToggleCollapsed}>
            Import
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="card card-compact stack-gap import-panel">
      <div className="toolbar import-panel-toolbar">
        <div className="section-header section-header-compact">
          <h2>Import</h2>
          <p>Paste text, choose a file, or import a link.</p>
        </div>
        {onToggleCollapsed ? (
          <button className="ghost-button" type="button" onClick={onToggleCollapsed}>
            Hide
          </button>
        ) : null}
      </div>
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
        <div className="inline-actions">
          <button disabled={busy || !text.trim()} type="submit">
            {busy ? 'Importing…' : 'Import text'}
          </button>
          <label className="secondary-button">
            <input
              className="visually-hidden"
              type="file"
              accept=".txt,.md,.html,.htm,.docx,.pdf"
              onChange={handleFileChange}
            />
            Choose file
          </label>
        </div>
      </form>

      <section className="import-web stack-gap" aria-label="Web page import">
        <button
          aria-expanded={webPageOpen}
          className="ghost-button import-web-toggle"
          type="button"
          onClick={() => setWebPageOpen((current) => !current)}
        >
          {webPageOpen ? 'Hide web page' : 'Web page'}
        </button>

        {webPageOpen ? (
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
      </section>

      <p className="small-note">TXT, Markdown, HTML, DOCX, text-based PDF, and public article links.</p>
    </section>
  )
}
