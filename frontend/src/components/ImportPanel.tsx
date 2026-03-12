import { useState, type ChangeEvent, type FormEvent } from 'react'

interface ImportPanelProps {
  busy: boolean
  onImportText: (title: string, text: string) => Promise<void>
  onImportFile: (file: File) => Promise<void>
}

export function ImportPanel({ busy, onImportText, onImportFile }: ImportPanelProps) {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')

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

  return (
    <section className="card stack-gap">
      <div className="section-header">
        <h2>Import</h2>
        <p>Paste text or open a local file. AI is optional and never runs automatically.</p>
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
            rows={8}
            placeholder="Paste text here"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </label>
        <div className="inline-actions">
          <button disabled={busy || !text.trim()} type="submit">
            {busy ? 'Importing…' : 'Import pasted text'}
          </button>
          <label className="secondary-button">
            <input
              className="visually-hidden"
              type="file"
              accept=".txt,.md,.html,.htm,.docx,.pdf"
              onChange={handleFileChange}
            />
            Import file
          </label>
        </div>
      </form>
      <p className="small-note">
        Supported in v1: TXT, Markdown, HTML, DOCX, and text-based PDF. Local TTS is coming later;
        Edge voices are the main read-aloud path now.
      </p>
    </section>
  )
}
