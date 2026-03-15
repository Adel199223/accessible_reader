import type { ReactNode } from 'react'

import type { SourceWorkspaceTab } from '../lib/appRoute'


export interface SourceWorkspaceDocumentSummary {
  availableModes?: string[]
  chunkCount?: number | null
  fileName?: string | null
  id: string
  sourceLocator?: string | null
  sourceType: string
  title: string
  updatedAt?: string | null
}

export interface SourceWorkspaceFrameState {
  activeTab: SourceWorkspaceTab
  counts?: Array<{
    label: string
    tone?: 'default' | 'muted'
  }>
  description: string
  document: SourceWorkspaceDocumentSummary
  onSelectTab: (tab: SourceWorkspaceTab) => void
}

interface SourceWorkspaceFrameProps extends SourceWorkspaceFrameState {
  actions?: ReactNode
}

const sourceWorkspaceTabs: Array<{
  label: string
  value: SourceWorkspaceTab
}> = [
  { label: 'Overview', value: 'overview' },
  { label: 'Reader', value: 'reader' },
  { label: 'Notes', value: 'notes' },
  { label: 'Graph', value: 'graph' },
  { label: 'Study', value: 'study' },
]

function buildSourcePreview(document: SourceWorkspaceDocumentSummary) {
  return document.sourceLocator || document.fileName || 'Local source'
}

function buildCountLabel(document: SourceWorkspaceDocumentSummary) {
  if (typeof document.chunkCount === 'number') {
    return `${document.chunkCount} ${document.chunkCount === 1 ? 'chunk' : 'chunks'}`
  }
  return `${document.availableModes?.length ?? 0} ${(document.availableModes?.length ?? 0) === 1 ? 'view' : 'views'}`
}

export function SourceWorkspaceFrame({
  activeTab,
  actions,
  counts = [],
  description,
  document,
  onSelectTab,
}: SourceWorkspaceFrameProps) {
  return (
    <section className="source-workspace-frame" aria-label={`${document.title} workspace`}>
      <div className="source-workspace-strip-main">
        <div className="source-workspace-strip-heading">
          <span className="status-chip source-workspace-strip-badge">Focused source</span>
          <strong className="source-workspace-title">{document.title}</strong>
        </div>
        <p className="source-workspace-source">{buildSourcePreview(document)}</p>
        <p className="source-workspace-description">{description}</p>
        <div className="source-workspace-meta" role="list" aria-label="Active source summary">
          <span className="status-chip" role="listitem">{document.sourceType.toUpperCase()}</span>
          <span className="status-chip reader-meta-chip" role="listitem">{buildCountLabel(document)}</span>
          {counts.map((item) => (
            <span
              key={item.label}
              className={item.tone === 'muted' ? 'status-chip status-muted' : 'status-chip reader-meta-chip'}
              role="listitem"
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="source-workspace-strip-actions">
        <div className="recall-stage-tabs source-workspace-tabs" aria-label="Source workspace tabs" role="tablist">
          {sourceWorkspaceTabs.map((tab) => (
            <button
              key={tab.value}
              aria-label={`Source workspace ${tab.label}`}
              aria-selected={activeTab === tab.value}
              className={activeTab === tab.value ? 'recall-stage-tab recall-stage-tab-active' : 'recall-stage-tab'}
              role="tab"
              type="button"
              onClick={() => onSelectTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {actions ? <div className="source-workspace-actions">{actions}</div> : null}
      </div>
    </section>
  )
}
