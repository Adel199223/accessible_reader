import type { ReactNode } from 'react'

interface InfoDisclosureProps {
  children: ReactNode
  className?: string
  label: string
  summary?: string
}

function InfoIcon() {
  return (
    <svg
      aria-hidden="true"
      className="info-disclosure-icon"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6" />
      <path d="M12 7h.01" />
    </svg>
  )
}

export function InfoDisclosure({
  children,
  className,
  label,
  summary = 'Info',
}: InfoDisclosureProps) {
  return (
    <details className={className ? `info-disclosure ${className}` : 'info-disclosure'}>
      <summary aria-label={label} className="info-disclosure-summary">
        <InfoIcon />
        <span>{summary}</span>
      </summary>
      <div className="info-disclosure-panel" role="note">
        {children}
      </div>
    </details>
  )
}
