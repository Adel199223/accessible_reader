import type { ReactNode } from 'react'

import type { WorkspaceDockContext, WorkspaceDockTarget, WorkspaceRecentItem, WorkspaceSection } from '../lib/appRoute'
import { SourceWorkspaceFrame, type SourceWorkspaceFrameState } from './SourceWorkspaceFrame'
import { WorkspaceContextDock } from './WorkspaceContextDock'
import { WorkspaceHero, type WorkspaceHeroProps } from './WorkspaceHero'


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

export function RecallShellFrame({
  activeSection,
  children,
  currentContext,
  headerActions,
  hero,
  layoutMode = 'default',
  onActivateTarget,
  onSelectSection,
  onToggleSupportChrome,
  recentItems,
  sourceWorkspace = null,
  supportChromeOpen = false,
}: RecallShellFrameProps) {
  const sourceFocused = Boolean(sourceWorkspace)
  const compactShell = sourceFocused || layoutMode === 'reader' || hero.compact
  const showSupportChrome = !sourceFocused || supportChromeOpen

  return (
    <>
      <header className={compactShell ? 'shell-header shell-header-compact' : 'shell-header'}>
        <div className="shell-brand">
          <p className="eyebrow">Local knowledge workspace</p>
          <h1>Recall</h1>
          <p>Search what you saved, reopen it in Reader, and keep the flow local-first.</p>
        </div>
        {headerActions ? <div className="shell-nav">{headerActions}</div> : null}
      </header>

      <main className="shell-main">
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
          {!sourceFocused ? <WorkspaceHero {...hero} /> : null}

          <div
            className={compactShell ? 'recall-stage-tabs recall-stage-tabs-compact' : 'recall-stage-tabs'}
            aria-label="Workspace sections"
            role="tablist"
          >
            {workspaceSections.map((section) => (
              <button
                key={section.value}
                aria-selected={activeSection === section.value}
                className={
                  activeSection === section.value
                    ? 'recall-stage-tab recall-stage-tab-active'
                    : 'recall-stage-tab'
                }
                role="tab"
                type="button"
                onClick={() => onSelectSection(section.value)}
              >
                {section.label}
              </button>
            ))}
          </div>

          {sourceFocused && sourceWorkspace ? (
            <SourceWorkspaceFrame
              activeTab={sourceWorkspace.activeTab}
              counts={sourceWorkspace.counts}
              description={sourceWorkspace.description}
              document={sourceWorkspace.document}
              onSelectTab={sourceWorkspace.onSelectTab}
            />
          ) : null}

          {sourceFocused ? (
            <section className="card workspace-support-strip" aria-label="Workspace support">
              <div className="workspace-support-strip-copy">
                <strong>Source-focused mode</strong>
                <span>Keep workspace guidance nearby without letting it crowd the active source.</span>
              </div>
              <button
                className="ghost-button"
                type="button"
                onClick={onToggleSupportChrome}
              >
                {supportChromeOpen ? 'Hide workspace support' : 'Show workspace support'}
              </button>
            </section>
          ) : null}

          {showSupportChrome ? (
            <div className={sourceFocused ? 'workspace-support-stack stack-gap' : ''}>
              {sourceFocused ? <WorkspaceHero {...hero} /> : null}
              <WorkspaceContextDock
                activeSection={activeSection}
                compact={compactShell}
                currentContext={currentContext}
                onActivateTarget={onActivateTarget}
                recentItems={recentItems}
              />
            </div>
          ) : null}

          {children}
        </div>
      </main>
    </>
  )
}
