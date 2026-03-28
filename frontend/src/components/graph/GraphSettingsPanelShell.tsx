import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react'

interface GraphSettingsPanelShellProps {
  children: ReactNode
  onClose: () => void
  onOpen: () => void
  onResetWidth: () => void
  onResizeKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void
  onStartResize: (event: ReactPointerEvent<HTMLDivElement>) => void
  open: boolean
  resizing: boolean
  width: number
}

export function GraphSettingsPanelShell({
  children,
  onClose,
  onOpen,
  onResetWidth,
  onResizeKeyDown,
  onStartResize,
  open,
  resizing,
  width,
}: GraphSettingsPanelShellProps) {
  if (!open) {
    return (
      <button
        aria-label="Show graph settings"
        className="ghost-button workspace-section-panel-launcher recall-graph-settings-launcher"
        title="Show graph settings"
        type="button"
        onClick={onOpen}
      >
        <span aria-hidden="true">›</span>
      </button>
    )
  }

  return (
    <aside
      aria-label="Graph settings sidebar"
      className={[
        'recall-graph-browser-utility-strip',
        'recall-graph-browser-utility-strip-attached',
        'recall-graph-browser-utility-strip-drawer-reset',
        'recall-graph-browser-utility-strip-resizable',
        'recall-graph-settings-panel-shell',
        resizing ? 'recall-graph-browser-utility-strip-resizing' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width: `${width}px` }}
    >
      <div className="recall-graph-browser-utility-shell recall-graph-browser-utility-shell-parity-reset recall-graph-browser-utility-shell-attached recall-graph-browser-utility-shell-workbench-reset recall-graph-browser-utility-shell-drawer-reset recall-graph-browser-utility-shell-settings-reset recall-graph-settings-panel-surface priority-surface-support-rail">
        <div className="recall-graph-settings-panel-header" aria-label="Graph settings panel">
          <div className="recall-graph-settings-panel-heading">
            <strong>Graph Settings</strong>
            <span>Tune presets, filters, and groups while the canvas stays in view.</span>
          </div>
          <button
            aria-label="Hide graph settings"
            className="ghost-button workspace-section-panel-close recall-graph-settings-panel-close"
            title="Hide graph settings"
            type="button"
            onClick={onClose}
          >
            «
          </button>
        </div>
        <div className="recall-graph-settings-panel-scroll">{children}</div>
      </div>
      <div
        aria-label="Resize graph settings sidebar"
        className="recall-graph-sidebar-resize-handle"
        role="separator"
        tabIndex={0}
        onDoubleClick={onResetWidth}
        onKeyDown={onResizeKeyDown}
        onPointerDown={onStartResize}
      >
        <span aria-hidden="true" className="recall-graph-sidebar-resize-grip" />
      </div>
    </aside>
  )
}
