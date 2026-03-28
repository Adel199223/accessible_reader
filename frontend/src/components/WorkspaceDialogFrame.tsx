import { useEffect, useId, type ReactNode } from 'react'

interface WorkspaceDialogFrameProps {
  children: ReactNode
  closeDisabled?: boolean
  description?: string
  eyebrow?: string
  onClose: () => void
  open: boolean
  title: string
  variant?: 'default' | 'entry'
  wide?: boolean
}

export function WorkspaceDialogFrame({
  children,
  closeDisabled = false,
  description,
  eyebrow,
  onClose,
  open,
  title,
  variant = 'default',
  wide = false,
}: WorkspaceDialogFrameProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !closeDisabled) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeDisabled, onClose, open])

  if (!open) {
    return null
  }

  return (
    <div className="workspace-dialog-layer" role="presentation">
      <button
        aria-label={variant === 'entry' ? `Dismiss ${title} overlay` : 'Dismiss dialog backdrop'}
        className="workspace-dialog-backdrop"
        disabled={closeDisabled}
        type="button"
        onClick={onClose}
      />
      <aside
        aria-labelledby={titleId}
        aria-modal="true"
        className={[
          'workspace-dialog',
          wide ? 'workspace-dialog-wide' : '',
          variant === 'entry' ? 'workspace-dialog-entry' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="dialog"
      >
        <div
          className={[
            'workspace-dialog-header',
            variant === 'entry' ? 'workspace-dialog-header-entry' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className="section-header section-header-compact">
            {eyebrow ? <p className="workspace-dialog-eyebrow">{eyebrow}</p> : null}
            <h2 id={titleId}>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button
            aria-label={variant === 'entry' ? `Close ${title}` : undefined}
            className={variant === 'entry' ? 'workspace-dialog-close' : 'ghost-button'}
            disabled={closeDisabled}
            type="button"
            onClick={onClose}
          >
            {variant === 'entry' ? (
              <svg aria-hidden="true" viewBox="0 0 20 20">
                <path d="m5.5 5.5 9 9M14.5 5.5l-9 9" />
              </svg>
            ) : (
              'Close'
            )}
          </button>
        </div>
        <div className="workspace-dialog-body stack-gap">{children}</div>
      </aside>
    </div>
  )
}
