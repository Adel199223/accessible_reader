import type { WorkspaceDockContext, WorkspaceDockTarget, WorkspaceRecentItem } from '../lib/appRoute'


interface WorkspaceContextDockProps {
  compact?: boolean
  currentContext: WorkspaceDockContext | null
  onActivateTarget: (target: WorkspaceDockTarget) => void
  recentItems: WorkspaceRecentItem[]
}

export function WorkspaceContextDock({
  compact = false,
  currentContext,
  onActivateTarget,
  recentItems,
}: WorkspaceContextDockProps) {
  const visibleRecentItems = currentContext?.recentItem
    ? recentItems.filter((item) => item.key !== currentContext.recentItem?.key)
    : recentItems

  return (
    <section
      aria-label="Workspace context"
      className={compact ? 'workspace-context-dock workspace-context-dock-compact' : 'workspace-context-dock'}
    >
      <div className="workspace-context-panel">
        <div className="section-header section-header-compact">
          <h2>Current context</h2>
          <p>Keep your active focus and the next useful jump visible in the shell.</p>
        </div>

        {currentContext ? (
          <div className="workspace-context-body">
            <div className="workspace-context-copy">
              <span className="status-chip reader-meta-chip">{currentContext.badge}</span>
              <strong className="workspace-context-title">{currentContext.title}</strong>
              <p className="workspace-context-subtitle">{currentContext.subtitle}</p>
              {currentContext.meta ? <span className="workspace-context-meta">{currentContext.meta}</span> : null}
            </div>

            {currentContext.actions.length > 0 ? (
              <div className="workspace-context-actions">
                {currentContext.actions.map((action) => (
                  <button key={action.key} type="button" onClick={() => onActivateTarget(action.target)}>
                    {action.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="workspace-context-placeholder">
            Active source, note, graph node, study card, or Reader focus appears here once you start working.
          </p>
        )}
      </div>

      <div className="workspace-context-panel">
        <div className="section-header section-header-compact">
          <h2>Recent work</h2>
          <p>Return to the items you just touched without restarting the search flow.</p>
        </div>

        {visibleRecentItems.length > 0 ? (
          <div className="workspace-recent-list">
            {visibleRecentItems.map((item) => (
              <button
                key={item.key}
                className="workspace-recent-item"
                type="button"
                onClick={() => onActivateTarget(item.target)}
              >
                <span className="workspace-recent-item-header">
                  <span className="status-chip reader-meta-chip">{item.badge}</span>
                  <strong>{item.title}</strong>
                </span>
                {item.subtitle ? <span className="workspace-recent-item-subtitle">{item.subtitle}</span> : null}
              </button>
            ))}
          </div>
        ) : (
          <p className="workspace-context-placeholder">
            Recent note, source, graph, and study jumps will collect here as you move through Recall.
          </p>
        )}
      </div>
    </section>
  )
}
