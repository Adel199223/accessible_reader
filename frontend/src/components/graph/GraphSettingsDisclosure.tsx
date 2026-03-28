import type { ReactNode } from 'react'

interface GraphSettingsDisclosureProps {
  children: ReactNode
  className?: string
  open: boolean
  onToggle: () => void
  summary: string
  title: string
}

export function GraphSettingsDisclosure({
  children,
  className,
  open,
  onToggle,
  summary,
  title,
}: GraphSettingsDisclosureProps) {
  return (
    <div
      className={[
        'recall-graph-settings-disclosure',
        open ? 'recall-graph-settings-disclosure-open' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        aria-expanded={open}
        className="ghost-button recall-graph-settings-disclosure-toggle"
        type="button"
        onClick={onToggle}
      >
        <span className="recall-graph-settings-disclosure-copy">
          <strong>{title}</strong>
          <span>{summary}</span>
        </span>
        <span className="recall-graph-settings-disclosure-icon" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>
      {open ? <div className="recall-graph-settings-disclosure-body">{children}</div> : null}
    </div>
  )
}
