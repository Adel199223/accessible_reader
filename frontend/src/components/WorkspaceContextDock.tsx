import type {
  WorkspaceDockContext,
  WorkspaceDockTarget,
  WorkspaceRecentItem,
  WorkspaceSection,
} from '../lib/appRoute'


interface WorkspaceContextDockProps {
  activeSection: WorkspaceSection
  compact?: boolean
  currentContext: WorkspaceDockContext | null
  onActivateTarget: (target: WorkspaceDockTarget) => void
  recentItems: WorkspaceRecentItem[]
}

export function WorkspaceContextDock({
  activeSection,
  compact = false,
  currentContext,
  onActivateTarget,
  recentItems,
}: WorkspaceContextDockProps) {
  const denseSection = activeSection === 'reader' || activeSection === 'notes'
  const visibleRecentItems = currentContext?.recentItem
    ? recentItems.filter((item) => item.key !== currentContext.recentItem?.key)
    : recentItems
  const showOnboardingCard = !currentContext && visibleRecentItems.length === 0

  return (
    <section
      aria-label="Workspace context"
      className={[
        'workspace-context-dock',
        compact ? 'workspace-context-dock-compact' : '',
        denseSection ? 'workspace-context-dock-dense' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {showOnboardingCard ? (
        <div className="workspace-context-panel workspace-context-panel-onboarding">
          <div className="section-header section-header-compact">
            <h2>Start here</h2>
            <p>Add a source, then use search, notes, graph, and study without losing your place.</p>
          </div>
        </div>
      ) : null}

      <div className="workspace-context-panel workspace-context-panel-condensed">
        <div className="section-header section-header-compact">
          <h2>Current context</h2>
          {!denseSection || !currentContext ? <p>Keep the next useful jump nearby without crowding the main canvas.</p> : null}
        </div>

        {currentContext ? (
          <div className="workspace-context-body workspace-context-body-condensed">
            <div className="workspace-context-copy">
              <div className="workspace-context-heading-row">
                <span className="status-chip reader-meta-chip">{currentContext.badge}</span>
                <strong className="workspace-context-title">{currentContext.title}</strong>
              </div>
              <p className="workspace-context-subtitle">{currentContext.subtitle}</p>
              {currentContext.meta ? <span className="workspace-context-meta">{currentContext.meta}</span> : null}
            </div>

            {currentContext.actions.length > 0 ? (
              <div className={compact ? 'workspace-context-actions workspace-context-actions-condensed' : 'workspace-context-actions'}>
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
            Open a source, note, graph node, study card, or Reader target to pin it here.
          </p>
        )}
      </div>

      <div className="workspace-context-panel workspace-context-panel-condensed">
        <div className="section-header section-header-compact">
          <h2>Recent work</h2>
          {!denseSection || visibleRecentItems.length === 0 ? (
            <p>Return to the items you just touched without restarting the search flow.</p>
          ) : null}
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
