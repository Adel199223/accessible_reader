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
  showHeader = true,
  title: panelTitle = 'Import',
}: ImportPanelProps) {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [mode, setMode] = useState<ImportMode>('text')
  const activeMode = importModes.find((item) => item.value === mode) ?? importModes[0]

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
        </div>
      </div>
    </section>
  )
}
