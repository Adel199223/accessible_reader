import type { ReactNode } from 'react'

import type { WorkspaceSection } from '../lib/appRoute'
import { WorkspaceHero, type WorkspaceHeroProps } from './WorkspaceHero'


interface RecallShellFrameProps {
  activeSection: WorkspaceSection
  children: ReactNode
  hero: WorkspaceHeroProps
  onSelectSection: (section: WorkspaceSection) => void
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
  hero,
  onSelectSection,
}: RecallShellFrameProps) {
  return (
    <>
      <header className="shell-header">
        <div className="shell-brand">
          <p className="eyebrow">Local knowledge workspace</p>
          <h1>Recall</h1>
          <p>Search what you saved, reopen it in Reader, and keep the flow local-first.</p>
        </div>
      </header>

      <main className="shell-main">
        <div className="recall-workspace stack-gap">
          <WorkspaceHero {...hero} />

          <div className="recall-stage-tabs" aria-label="Workspace sections" role="tablist">
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

          {children}
        </div>
      </main>
    </>
  )
}
