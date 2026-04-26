import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { RecallShellFrame } from './RecallShellFrame'

import type { WorkspaceDockContext, WorkspaceSection } from '../lib/appRoute'
import type { SourceWorkspaceFrameState } from './SourceWorkspaceFrame'

afterEach(() => {
  cleanup()
})

const currentContext: WorkspaceDockContext = {
  actions: [
    {
      key: 'open-note',
      label: 'Open note',
      target: { noteId: 'note-1', section: 'notes' },
    },
  ],
  badge: 'Note',
  key: 'context-note-1',
  meta: 'Anchored to a saved source',
  section: 'notes',
  subtitle: 'Useful search note.',
  title: 'Search target only',
}

const sourceWorkspace: SourceWorkspaceFrameState = {
  activeTab: 'notes',
  counts: [{ label: '2 notes' }, { label: '1 node', tone: 'muted' }],
  description: 'Keep note work beside the live Reader instead of bouncing back to overview.',
  document: {
    availableModes: ['original', 'reflowed'],
    chunkCount: 3,
    id: 'doc-1',
    sourceLocator: 'Local paste',
    sourceType: 'paste',
    title: 'Focused document',
  },
  onSelectTab: () => undefined,
}

function renderShell(overrides?: {
  activeSection?: WorkspaceSection
  currentContext?: WorkspaceDockContext | null
  layoutMode?: 'default' | 'home' | 'reader'
  recentItems?: Array<{
    badge: string
    key: string
    subtitle?: string | null
    target: { section: WorkspaceSection; documentId?: string | null; noteId?: string | null }
    title: string
  }>
  sourceWorkspace?: SourceWorkspaceFrameState | null
}) {
  const onSelectSection = vi.fn()

  render(
    <RecallShellFrame
      activeSection={overrides?.activeSection ?? 'library'}
      currentContext={overrides?.currentContext ?? currentContext}
      headerActions={
        <>
          <button type="button">Search</button>
          <button type="button">New</button>
        </>
      }
      hero={{
        compact: false,
        description: 'Unused hero copy',
        eyebrow: 'Recall',
        title: 'Recall',
      }}
      layoutMode={overrides?.layoutMode}
      onActivateTarget={() => undefined}
      onSelectSection={onSelectSection}
      recentItems={
        overrides?.recentItems ?? [
          {
            badge: 'Source',
            key: 'recent-doc-1',
            subtitle: 'Recently opened',
            target: { documentId: 'doc-1', section: 'library' },
            title: 'Focused document',
          },
        ]
      }
      sourceWorkspace={overrides?.sourceWorkspace ?? null}
    >
      <section aria-label="Primary content">
        <h2>Shell content</h2>
      </section>
    </RecallShellFrame>,
  )

  return { onSelectSection }
}

test('RecallShellFrame renders the icon-first rail and topbar without the old utility dock chrome', () => {
  const { onSelectSection } = renderShell()

  expect(screen.getByRole('tablist', { name: 'Workspace sections' })).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'Home', selected: true })).toBeInTheDocument()
  expect(screen.queryByRole('tab', { name: 'Notes' })).not.toBeInTheDocument()
  expect(document.querySelector('.workspace-rail-brand-copy')).toBeNull()
  expect(document.querySelector('.workspace-shell-secondary')).toBeNull()
  expect(screen.getByRole('tab', { name: 'Home', selected: true })).toHaveAttribute('title', 'Home')
  expect(screen.getByRole('tab', { name: 'Graph' })).toHaveAttribute('title', 'Graph')
  expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument()
  expect(screen.queryByText('Reader workspace')).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Current context', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Recent work', level: 2 })).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('tab', { name: 'Graph' }))

  expect(onSelectSection).toHaveBeenCalledWith('graph')
})

test('RecallShellFrame keeps graph browse mode on the slimmer topbar without the shared utility dock', () => {
  renderShell({
    activeSection: 'graph',
  })

  expect(screen.getByRole('heading', { name: 'Recall', level: 1 })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Current context', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Recent work', level: 2 })).not.toBeInTheDocument()
})

test('RecallShellFrame home mode hides the shared topbar so Home can own its compact Recall-like chrome', () => {
  renderShell({
    activeSection: 'library',
    layoutMode: 'home',
  })

  expect(screen.queryByRole('button', { name: 'Search' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'New' })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Recall', level: 1 })).not.toBeInTheDocument()
  expect(screen.getByRole('tablist', { name: 'Workspace sections' })).toBeInTheDocument()
})

test('RecallShellFrame keeps Reader mode on the quieter topbar without the old eyebrow copy', () => {
  renderShell({
    activeSection: 'reader',
    currentContext: null,
    layoutMode: 'reader',
    recentItems: [],
    sourceWorkspace: null,
  })

  const shellHeader = document.querySelector('header.workspace-topbar')
  expect(shellHeader).not.toBeNull()
  expect(shellHeader).toHaveClass('workspace-topbar-quiet')
  expect(shellHeader).toHaveClass('workspace-topbar-reader')
  expect(screen.getByRole('heading', { name: 'Reader', level: 1 })).toBeInTheDocument()
  expect(screen.queryByText('Reader workspace')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument()
})

test('RecallShellFrame compacts the Reader topbar into actions only when a Reader document is open', () => {
  renderShell({
    activeSection: 'reader',
    currentContext: null,
    layoutMode: 'reader',
    recentItems: [],
    sourceWorkspace: {
      ...sourceWorkspace,
      activeTab: 'reader',
      readerLayout: 'compact',
    },
  })

  const shellHeader = document.querySelector('header.workspace-topbar')
  expect(shellHeader).not.toBeNull()
  expect(shellHeader).toHaveClass('workspace-topbar-quiet')
  expect(shellHeader).toHaveClass('workspace-topbar-reader')
  expect(shellHeader).toHaveClass('workspace-topbar-reader-compact')
  expect(shellHeader).toHaveAttribute('aria-label', 'Reader workspace controls')
  expect(document.querySelector('.workspace-topbar-actions')).toHaveClass('workspace-topbar-actions-reader-compact')
  expect(screen.queryByRole('heading', { name: 'Reader', level: 1 })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument()
})

test('RecallShellFrame hides the utility dock and shows the compact source strip in focused mode', () => {
  renderShell({
    activeSection: 'library',
    currentContext: null,
    recentItems: [],
    sourceWorkspace,
  })

  expect(screen.getByRole('tab', { name: 'Home', selected: true })).toBeInTheDocument()
  expect(screen.getByText('Focused source')).toBeInTheDocument()
  expect(screen.getByText('Focused document')).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'Source workspace Notebook', selected: true })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Current context', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Recent work', level: 2 })).not.toBeInTheDocument()
})

test('RecallShellFrame forwards the compact Reader source-strip mode into the shell strip', () => {
  renderShell({
    activeSection: 'library',
    currentContext: null,
    layoutMode: 'default',
    recentItems: [],
    sourceWorkspace: {
      ...sourceWorkspace,
      activeTab: 'reader',
      readerLayout: 'compact',
      readerLineWidthCh: 72,
    },
  })

  const sourceWorkspaceRegion = screen.getByRole('region', { name: 'Focused document workspace' })

  expect(sourceWorkspaceRegion).toHaveClass('source-workspace-frame-reader-compact')
  expect(sourceWorkspaceRegion).toHaveStyle('--reader-line-width: 72ch')
  expect(screen.getByRole('button', { name: 'Open source workspace destinations' })).toBeInTheDocument()
  expect(screen.queryByRole('tab', { name: 'Source workspace Notebook' })).not.toBeInTheDocument()
})
