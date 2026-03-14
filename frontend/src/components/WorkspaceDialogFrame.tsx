import { useEffect, useId, type ReactNode } from 'react'

interface WorkspaceDialogFrameProps {
  children: ReactNode
  description?: string
  onClose: () => void
  open: boolean
  title: string
  wide?: boolean
}

export function WorkspaceDialogFrame({
  children,
  description,
  onClose,
  open,
  title,
  wide = false,
}: WorkspaceDialogFrameProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open])

  if (!open) {
    return null
  }

  return (
    <div className="workspace-dialog-layer" role="presentation">
      <button
        aria-label={`Close ${title}`}
        className="workspace-dialog-backdrop"
        type="button"
        onClick={onClose}
      />
      <aside
        aria-labelledby={titleId}
        aria-modal="true"
        className={wide ? 'workspace-dialog workspace-dialog-wide' : 'workspace-dialog'}
        role="dialog"
      >
        <div className="workspace-dialog-header">
          <div className="section-header section-header-compact">
            <h2 id={titleId}>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="workspace-dialog-body stack-gap">{children}</div>
      </aside>
    </div>
  )
}
