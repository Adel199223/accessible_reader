import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

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
    ariaLabel?: string
    label: string
    onSelect?: () => void
    tone?: 'default' | 'muted'
  }>
  description: string
  document: SourceWorkspaceDocumentSummary
  onSelectTab: (tab: SourceWorkspaceTab) => void
  readerLayout?: 'compact' | 'expanded'
  readerLineWidthCh?: number
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
  { label: 'Notebook', value: 'notes' },
  { label: 'Graph', value: 'graph' },
  { label: 'Study', value: 'study' },
]

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      className="source-workspace-nav-trigger-icon"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M4 6.25 8 10l4-3.75"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

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
  readerLayout,
  readerLineWidthCh,
}: SourceWorkspaceFrameProps) {
  const [compactReaderNavOpen, setCompactReaderNavOpen] = useState(false)
  const compactReaderNavRef = useRef<HTMLDivElement | null>(null)
  const readerActive = activeTab === 'reader'
  const showCompactReaderNav = readerActive
  const sourcePreview = readerActive ? null : buildSourcePreview(document)
  const compactReaderNavTabs = sourceWorkspaceTabs.filter((tab) => tab.value !== activeTab)
  const frameClassName = [
    'source-workspace-frame',
    readerActive ? 'source-workspace-frame-reader-active' : '',
    readerActive && readerLayout === 'compact' ? 'source-workspace-frame-reader-compact' : '',
    readerActive && readerLayout === 'expanded' ? 'source-workspace-frame-reader-expanded' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const frameStyle =
    readerActive && typeof readerLineWidthCh === 'number'
      ? ({
          ['--reader-line-width' as string]: `${readerLineWidthCh}ch`,
        } as CSSProperties)
      : undefined
  const sourceMetaItems = [
    {
      label: document.sourceType.toUpperCase(),
      tone: 'default' as const,
    },
    ...(readerActive
      ? []
      : [
          {
            label: buildCountLabel(document),
            tone: 'default' as const,
          },
        ]),
    ...counts,
  ]
  const badgeLabel = readerActive ? 'Source' : 'Focused source'
  const compactReaderNavPanel = compactReaderNavOpen ? (
    <div className="source-workspace-nav-panel" role="group" aria-label="Source workspace destinations">
      <p className="source-workspace-nav-caption">Open this source in</p>
      <div className="source-workspace-nav-grid">
        {compactReaderNavTabs.map((tab) => (
          <button
            key={tab.value}
            aria-label={`Open source workspace ${tab.label}`}
            className="source-workspace-nav-button"
            type="button"
            onClick={() => {
              setCompactReaderNavOpen(false)
              onSelectTab(tab.value)
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  ) : null
  const sourceTitle = readerActive ? (
    <h2 className="source-workspace-title source-workspace-title-heading">{document.title}</h2>
  ) : (
    <strong className="source-workspace-title">{document.title}</strong>
  )

  useEffect(() => {
    if (!showCompactReaderNav) {
      setCompactReaderNavOpen(false)
      return
    }
    if (!compactReaderNavOpen) {
      return
    }

    function handlePointerDown(event: MouseEvent | PointerEvent) {
      if (compactReaderNavRef.current && !compactReaderNavRef.current.contains(event.target as Node)) {
        setCompactReaderNavOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setCompactReaderNavOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [compactReaderNavOpen, showCompactReaderNav])

  return (
    <section className={frameClassName} aria-label={`${document.title} workspace`} style={frameStyle}>
      <div className="source-workspace-frame-inner">
        <div className="source-workspace-strip-main">
          <div className="source-workspace-strip-overview">
            <div className="source-workspace-strip-heading">
              {showCompactReaderNav ? (
                <div
                  ref={compactReaderNavRef}
                  className={`source-workspace-nav-overflow source-workspace-nav-overflow-badge${
                    compactReaderNavOpen ? ' source-workspace-nav-overflow-open' : ''
                  }`}
                >
                  <button
                    aria-expanded={compactReaderNavOpen}
                    aria-haspopup="true"
                    aria-label="Open source workspace destinations"
                    className="status-chip source-workspace-strip-badge source-workspace-strip-badge-button source-workspace-nav-trigger"
                    type="button"
                    onClick={() => setCompactReaderNavOpen((current) => !current)}
                  >
                    <span className="source-workspace-strip-badge-button-label">{badgeLabel}</span>
                    <ChevronDownIcon />
                  </button>
                  {compactReaderNavPanel}
                </div>
              ) : (
                <span className="status-chip source-workspace-strip-badge">{badgeLabel}</span>
              )}
              {sourceTitle}
            </div>
            {sourcePreview ? <p className="source-workspace-source">{sourcePreview}</p> : null}
          </div>
          <div className="source-workspace-strip-context">
            {!readerActive ? <p className="source-workspace-description">{description}</p> : null}
            <div className="source-workspace-meta" role="list" aria-label="Active source summary">
              {sourceMetaItems.map((item) => {
                const chipClassName =
                  item.tone === 'muted' ? 'status-chip status-muted' : 'status-chip reader-meta-chip'
                if (item.onSelect) {
                  return (
                    <span key={item.label} className="source-workspace-meta-item" role="listitem">
                      <button
                        aria-label={item.ariaLabel ?? item.label}
                        className={`${chipClassName} source-workspace-meta-action`}
                        type="button"
                        onClick={item.onSelect}
                      >
                        {item.label}
                      </button>
                    </span>
                  )
                }

                return (
                  <span key={item.label} className={chipClassName} role="listitem">
                    {item.label}
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        {!showCompactReaderNav || actions ? (
          <div className="source-workspace-strip-actions">
            {!showCompactReaderNav ? (
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
            ) : null}
            {actions ? <div className="source-workspace-actions">{actions}</div> : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
