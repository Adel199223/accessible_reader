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

test('RecallShellFrame renders the collection-first rail and topbar without the library utility dock', () => {
  const { onSelectSection } = renderShell()

  expect(screen.getByRole('tablist', { name: 'Workspace sections' })).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'Library', selected: true })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument()
  expect(screen.queryByText('Reader workspace')).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Current context', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Recent work', level: 2 })).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('tab', { name: 'Graph' }))

  expect(onSelectSection).toHaveBeenCalledWith('graph')
})

test('RecallShellFrame keeps the utility dock for non-library browse sections', () => {
  renderShell({
    activeSection: 'notes',
  })

  expect(screen.getByRole('heading', { name: 'Current context', level: 2 })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Recent work', level: 2 })).toBeInTheDocument()
})

test('RecallShellFrame hides the utility dock and shows the compact source strip in focused mode', () => {
  renderShell({
    activeSection: 'notes',
    currentContext: null,
    recentItems: [],
    sourceWorkspace,
  })

  expect(screen.getByRole('tab', { name: 'Notes', selected: true })).toBeInTheDocument()
  expect(screen.getByText('Focused source')).toBeInTheDocument()
  expect(screen.getByText('Focused document')).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'Source workspace Notes', selected: true })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Current context', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Recent work', level: 2 })).not.toBeInTheDocument()
})
