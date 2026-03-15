import type { ReactNode } from 'react'

import type { WorkspaceDockContext, WorkspaceDockTarget, WorkspaceRecentItem, WorkspaceSection } from '../lib/appRoute'
import { SourceWorkspaceFrame, type SourceWorkspaceFrameState } from './SourceWorkspaceFrame'
import { WorkspaceContextDock } from './WorkspaceContextDock'
import type { WorkspaceHeroProps } from './WorkspaceHero'


interface RecallShellFrameProps {
  activeSection: WorkspaceSection
  children: ReactNode
  currentContext: WorkspaceDockContext | null
  headerActions?: ReactNode
  hero: WorkspaceHeroProps
  layoutMode?: 'default' | 'reader'
  onActivateTarget: (target: WorkspaceDockTarget) => void
  onSelectSection: (section: WorkspaceSection) => void
  onToggleSupportChrome?: () => void
  recentItems: WorkspaceRecentItem[]
  sourceWorkspace?: SourceWorkspaceFrameState | null
  supportChromeOpen?: boolean
}

const workspaceSections: Array<{
  label: string
  value: WorkspaceSection
}> = [
  { label: 'Library', value: 'library' },
  { label: 'Graph', value: 'graph' },
  { label: 'Study', value: 'study' },
  { label: 'Notes', value: 'notes' },
  { label: 'Reader', value: 'reader' },
]

function WorkspaceSectionIcon({ section }: { section: WorkspaceSection }) {
  if (section === 'library') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v10.5A2.75 2.75 0 0 1 17.25 20H6.75A2.75 2.75 0 0 1 4 17.25Z" />
        <path d="M8 8h8M8 12h8M8 16h5.5" />
      </svg>
    )
  }
  if (section === 'graph') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="6" cy="12" r="2.25" />
        <circle cx="18" cy="6" r="2.25" />
        <circle cx="18" cy="18" r="2.25" />
        <path d="m8.2 10.95 7.55-3.9M8.2 13.05l7.55 3.9" />
      </svg>
    )
  }
  if (section === 'study') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M5.75 6.25h8.5A2.25 2.25 0 0 1 16.5 8.5v9.25l-4.5-2.2-4.5 2.2V8.5a2.25 2.25 0 0 1 2.25-2.25Z" />
        <path d="M9.25 10.5h5.5M9.25 13.25h3.5" />
      </svg>
    )
  }
  if (section === 'notes') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M7 4.75h7.5L18 8.2v11.05H7z" />
        <path d="M14.5 4.75V8.5H18M9.25 11h6.5M9.25 14h6.5M9.25 17h4.25" />
      </svg>
    )
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 5.5c-3.75 0-6.75 2.98-6.75 6.66S8.25 18.84 12 18.84s6.75-2.98 6.75-6.68S15.75 5.5 12 5.5Z" />
      <path d="M12 3v3.2M12 17.8V21M4.7 12.16H1.5M22.5 12.16h-3.2" />
    </svg>
  )
}

export function RecallShellFrame(props: RecallShellFrameProps) {
  const {
    activeSection,
    children,
    currentContext,
    headerActions,
    layoutMode = 'default',
    onActivateTarget,
    onSelectSection,
    recentItems,
    sourceWorkspace = null,
  } = props

  void props.hero
  void props.onToggleSupportChrome
  void props.supportChromeOpen

  const sourceFocused = Boolean(sourceWorkspace)
  const activeSectionLabel = workspaceSections.find((section) => section.value === activeSection)?.label ?? 'Recall'
  const showUtilityPanel = layoutMode === 'default' && !sourceFocused
  const shellTitle = layoutMode === 'reader' ? 'Reader' : 'Recall'
  const shellEyebrow = sourceFocused ? 'Focused source' : layoutMode === 'reader' ? 'Reader workspace' : 'Local knowledge workspace'

  return (
    <div
      className={[
        'recall-shell-frame',
        layoutMode === 'reader' ? 'recall-shell-frame-reader' : 'recall-shell-frame-default',
        sourceFocused ? 'recall-shell-frame-source-focused' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <aside className="workspace-rail" aria-label="Workspace navigation">
        <div className="workspace-rail-brand">
          <div className="workspace-rail-mark" aria-hidden="true">R</div>
          <div className="workspace-rail-brand-copy">
            <span>Local-first</span>
            <strong>Recall</strong>
          </div>
        </div>
        <nav className="workspace-rail-nav" aria-label="Workspace sections" role="tablist">
          {workspaceSections.map((section) => (
            <button
              key={section.value}
              aria-current={activeSection === section.value ? 'page' : undefined}
              aria-selected={activeSection === section.value}
              className={
                activeSection === section.value
                  ? 'workspace-rail-button workspace-rail-button-active'
                  : 'workspace-rail-button'
              }
              role="tab"
              tabIndex={activeSection === section.value ? 0 : -1}
              type="button"
              onClick={() => onSelectSection(section.value)}
            >
              <span className="workspace-rail-icon">
                <WorkspaceSectionIcon section={section.value} />
              </span>
              <span className="workspace-rail-label">{section.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="workspace-shell-main">
        <header className="workspace-topbar">
          <div className="workspace-topbar-copy">
            <p className="workspace-topbar-eyebrow">{shellEyebrow}</p>
            <div className="workspace-topbar-heading-row">
              <h1>{shellTitle}</h1>
              <span className="workspace-topbar-section-chip">{activeSectionLabel}</span>
            </div>
          </div>
          {headerActions ? <div className="workspace-topbar-actions">{headerActions}</div> : null}
        </header>

        <div
          className={
            [
              layoutMode === 'reader' ? 'recall-workspace recall-workspace-reader stack-gap' : 'recall-workspace stack-gap',
              sourceFocused ? 'recall-workspace-source-focused' : '',
            ]
              .filter(Boolean)
              .join(' ')
          }
        >
          {sourceFocused && sourceWorkspace ? (
            <SourceWorkspaceFrame
              activeTab={sourceWorkspace.activeTab}
              counts={sourceWorkspace.counts}
              description={sourceWorkspace.description}
              document={sourceWorkspace.document}
              onSelectTab={sourceWorkspace.onSelectTab}
            />
          ) : null}

          <div className={showUtilityPanel ? 'workspace-shell-layout workspace-shell-layout-with-utility' : 'workspace-shell-layout'}>
            <div className="workspace-shell-primary">{children}</div>
            {showUtilityPanel ? (
              <aside className="workspace-shell-secondary">
                <WorkspaceContextDock
                  activeSection={activeSection}
                  compact
                  currentContext={currentContext}
                  onActivateTarget={onActivateTarget}
                  recentItems={recentItems}
                />
              </aside>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}
