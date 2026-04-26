import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react'

interface HomeOrganizerPanelShellProps {
  children: ReactNode
  onOpen: () => void
  onResetWidth: () => void
  onResizeKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void
  onStartResize: (event: ReactPointerEvent<HTMLDivElement>) => void
  open: boolean
  resizing: boolean
  width: number
}

function HomeOrganizerLauncherIcon() {
  return (
    <svg aria-hidden="true" className="workspace-section-panel-launcher-icon" viewBox="0 0 16 16">
      <path
        d="M2.75 3.25h3.5M2.75 6.85h3.5M2.75 10.45h3.5M2.75 14.05h3.5M9.2 2.4h4.05v11.2H9.2z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
      />
    </svg>
  )
}

export function HomeOrganizerPanelShell({
  children,
  onOpen,
  onResetWidth,
  onResizeKeyDown,
  onStartResize,
  open,
  resizing,
  width,
}: HomeOrganizerPanelShellProps) {
  if (!open) {
    return (
      <aside
        aria-label="Home organizer launcher"
        className="recall-home-organizer-launcher-shell recall-home-organizer-launcher-shell-stage696"
      >
        <button
          aria-label="Show home organizer"
          className="ghost-button workspace-section-panel-launcher recall-home-organizer-launcher recall-home-organizer-launcher-stage696"
          title="Show home organizer"
          type="button"
          onClick={onOpen}
        >
          <HomeOrganizerLauncherIcon />
        </button>
      </aside>
    )
  }

  return (
    <aside
      aria-label="Home collection rail"
      className={[
        'recall-home-parity-rail-stage563',
        'priority-surface-support-rail',
        'priority-surface-support-rail-quiet',
        'recall-home-organizer-panel-shell',
        'recall-home-organizer-panel-shell-stage696',
        resizing ? 'recall-home-organizer-panel-shell-resizing' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width: `${width}px` }}
    >
      <div className="recall-home-organizer-panel-surface recall-home-organizer-panel-surface-stage696">{children}</div>
      <div
        aria-label="Resize Home organizer"
        aria-orientation="vertical"
        className="recall-home-browse-strip-resize-handle-stage491-reset recall-home-browse-strip-resize-handle-stage696-reset"
        role="separator"
        tabIndex={0}
        onDoubleClick={onResetWidth}
        onKeyDown={onResizeKeyDown}
        onPointerDown={onStartResize}
      >
        <span
          className="recall-home-browse-strip-resize-grip-stage491-reset recall-home-browse-strip-resize-grip-stage696-reset"
          aria-hidden="true"
        />
      </div>
    </aside>
  )
}
