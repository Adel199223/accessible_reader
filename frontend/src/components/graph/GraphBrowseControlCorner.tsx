import type { KeyboardEvent as ReactKeyboardEvent } from 'react'

interface GraphBrowseControlCornerProps {
  layoutLocked: boolean
  onFitToView: () => void
  onSearchChange: (value: string) => void
  onSearchKeyDown: (event: ReactKeyboardEvent<HTMLInputElement>) => void
  onStepSearchMatch: (direction: 1 | -1) => void
  onToggleLayoutLock: () => void
  searchNavigationVisible: boolean
  searchQuery: string
  searchStatusLabel: string
  statusNote: string | null
}

function GraphFitViewIcon() {
  return (
    <svg aria-hidden="true" className="recall-graph-view-controls-icon" viewBox="0 0 16 16">
      <path
        d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.35"
      />
    </svg>
  )
}

function GraphLockIcon({ locked }: { locked: boolean }) {
  if (!locked) {
    return (
      <svg aria-hidden="true" className="recall-graph-view-controls-icon" viewBox="0 0 16 16">
        <path
          d="M5.5 7V5.9a2.5 2.5 0 0 1 5 0V7"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.35"
        />
        <rect
          fill="none"
          height="5.75"
          rx="1.45"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.35"
          width="7.5"
          x="4.25"
          y="7"
        />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" className="recall-graph-view-controls-icon" viewBox="0 0 16 16">
      <path
        d="M5.5 7V5.9a2.5 2.5 0 0 1 4.3-1.75"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.35"
      />
      <rect
        fill="none"
        height="5.75"
        rx="1.45"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.35"
        width="7.5"
        x="4.25"
        y="7"
      />
      <path
        d="M10.9 4.5 13 2.35"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.35"
      />
    </svg>
  )
}

export function GraphBrowseControlCorner({
  layoutLocked,
  onFitToView,
  onSearchChange,
  onSearchKeyDown,
  onStepSearchMatch,
  onToggleLayoutLock,
  searchNavigationVisible,
  searchQuery,
  searchStatusLabel,
  statusNote,
}: GraphBrowseControlCornerProps) {
  return (
    <div
      className="recall-graph-browser-control-actions recall-graph-browser-control-actions-overlay recall-graph-browser-control-actions-workbench-reset recall-graph-browser-control-actions-corner-reset recall-graph-browser-control-actions-navigation-reset recall-graph-browser-control-actions-graph-v20"
    >
      <div className="recall-graph-browser-control-clusters">
        <div className="recall-graph-browser-control-search-cluster">
          <label className="field recall-inline-field recall-graph-workbench-search recall-graph-workbench-search-v20">
            <span className="visually-hidden">Search by title</span>
            <input
              aria-label="Search by title"
              placeholder="Search by title"
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              onKeyDown={onSearchKeyDown}
            />
          </label>
          {searchNavigationVisible ? (
            <div className="recall-graph-search-navigation" role="group" aria-label="Graph search navigation">
              <button
                aria-label="Previous graph match"
                className="ghost-button recall-graph-search-navigation-button"
                type="button"
                onClick={() => onStepSearchMatch(-1)}
              >
                ‹
              </button>
              <span className="status-chip status-muted recall-graph-search-navigation-status">{searchStatusLabel}</span>
              <button
                aria-label="Next graph match"
                className="ghost-button recall-graph-search-navigation-button"
                type="button"
                onClick={() => onStepSearchMatch(1)}
              >
                ›
              </button>
            </div>
          ) : null}
        </div>
        <div className="recall-graph-browser-control-view-cluster">
          <div className="recall-graph-view-controls" role="group" aria-label="Graph view controls">
            <button
              aria-label="Fit to view"
              className="ghost-button recall-graph-view-controls-button"
              title="Fit visible nodes to the current canvas"
              type="button"
              onClick={onFitToView}
            >
              <GraphFitViewIcon />
            </button>
            <button
              aria-label={layoutLocked ? 'Unlock graph' : 'Lock graph'}
              className="ghost-button recall-graph-view-controls-button"
              title={layoutLocked ? 'Unlock graph layout' : 'Lock graph layout'}
              type="button"
              onClick={onToggleLayoutLock}
            >
              <GraphLockIcon locked={layoutLocked} />
            </button>
          </div>
        </div>
      </div>
      {statusNote ? (
        <div className="recall-graph-browser-control-status-note" role="status" aria-live="polite">
          {statusNote}
        </div>
      ) : null}
    </div>
  )
}
