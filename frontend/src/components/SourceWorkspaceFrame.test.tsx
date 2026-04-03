import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { SourceWorkspaceFrame } from './SourceWorkspaceFrame'

afterEach(() => {
  cleanup()
})

test('SourceWorkspaceFrame adds compact Reader-active chrome when Reader owns the source workspace at rest', () => {
  const onSelectTab = vi.fn()
  const description = 'Reader stays primary while the dock keeps nearby source context close.'
  const fileName = 'reader-source.html'

  const { container } = render(
    <SourceWorkspaceFrame
      activeTab="reader"
      counts={[{ label: '5 notes' }]}
      description={description}
      document={{
        availableModes: ['original', 'reflowed'],
        fileName,
        id: 'doc-reader',
        sourceType: 'html',
        title: 'Reader stays here',
      }}
      onSelectTab={onSelectTab}
      readerLayout="compact"
      readerLineWidthCh={72}
    />,
  )

  expect(container.querySelector('.source-workspace-frame')).toHaveClass('source-workspace-frame-reader-active')
  expect(container.querySelector('.source-workspace-frame')).toHaveClass('source-workspace-frame-reader-compact')
  expect(container.querySelector('.source-workspace-frame')).toHaveStyle('--reader-line-width: 72ch')
  expect(container.querySelector('.source-workspace-frame-inner')).not.toBeNull()
  expect(screen.getByText('Source')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Reader stays here', level: 2 })).toHaveClass('source-workspace-title-heading')
  expect(screen.queryByText(description)).not.toBeInTheDocument()
  expect(screen.queryByText(fileName)).not.toBeInTheDocument()
  expect(screen.queryByText('Local source')).not.toBeInTheDocument()
  expect(container.querySelector('.source-workspace-strip-heading .source-workspace-nav-trigger')).not.toBeNull()
  expect(screen.queryByText(/^Open$/)).not.toBeInTheDocument()
  expect(screen.queryByText('2 views')).not.toBeInTheDocument()
  expect(screen.getByText('5 notes')).toBeInTheDocument()
  expect(screen.queryByRole('tab', { name: 'Source workspace Notebook' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Open source workspace destinations' })).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Open source workspace destinations' }))
  fireEvent.click(screen.getByRole('button', { name: 'Open source workspace Notebook' }))

  expect(onSelectTab).toHaveBeenCalledWith('notes')
})

test('SourceWorkspaceFrame keeps the compact destination trigger visible when Reader support is expanded', () => {
  const onSelectTab = vi.fn()
  const sourceLocator = 'https://example.com/expanded-reader-source'

  render(
    <SourceWorkspaceFrame
      activeTab="reader"
      description="Expanded support keeps the broader source workspace chrome available."
      document={{
        id: 'doc-reader-expanded',
        sourceLocator,
        sourceType: 'html',
        title: 'Expanded reader source',
      }}
      onSelectTab={onSelectTab}
      readerLayout="expanded"
      readerLineWidthCh={72}
    />,
  )

  expect(screen.getByRole('button', { name: 'Open source workspace destinations' })).toBeInTheDocument()
  expect(screen.queryByText(sourceLocator)).not.toBeInTheDocument()
  expect(screen.queryByRole('tab', { name: 'Source workspace Notebook' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Open source workspace destinations' }))
  fireEvent.click(screen.getByRole('button', { name: 'Open source workspace Notebook' }))
  expect(onSelectTab).toHaveBeenCalledWith('notes')
})

test('SourceWorkspaceFrame can expose a source-strip meta chip as an action without changing its label', () => {
  const handleOpenNotebook = vi.fn()

  render(
    <SourceWorkspaceFrame
      activeTab="reader"
      counts={[
        {
          ariaLabel: 'Open nearby notebook notes',
          label: '5 notes',
          onSelect: handleOpenNotebook,
        },
      ]}
      description="Reader keeps nearby notes in the source seam."
      document={{
        availableModes: ['original', 'reflowed'],
        id: 'doc-reader-notes',
        sourceType: 'paste',
        title: 'Reader note seam',
      }}
      onSelectTab={() => undefined}
      readerLayout="compact"
      readerLineWidthCh={72}
    />,
  )

  const noteChip = screen.getByRole('button', { name: 'Open nearby notebook notes' })
  expect(noteChip).toHaveTextContent('5 notes')

  fireEvent.click(noteChip)
  expect(handleOpenNotebook).toHaveBeenCalledTimes(1)
})

test('SourceWorkspaceFrame keeps the generic local-source fallback outside compact Reader', () => {
  render(
    <SourceWorkspaceFrame
      activeTab="overview"
      description="General source workspace copy."
      document={{
        id: 'doc-overview',
        sourceType: 'paste',
        title: 'Overview source',
      }}
      onSelectTab={() => undefined}
    />,
  )

  expect(screen.getByText('Local source')).toBeInTheDocument()
})

test('SourceWorkspaceFrame keeps source locator preview outside Reader when one exists', () => {
  const sourceLocator = 'https://example.com/search-target'

  render(
    <SourceWorkspaceFrame
      activeTab="overview"
      description="General source workspace copy."
      document={{
        id: 'doc-overview-preview',
        sourceLocator,
        sourceType: 'web',
        title: 'Overview source with locator',
      }}
      onSelectTab={() => undefined}
    />,
  )

  expect(screen.getByText(sourceLocator)).toBeInTheDocument()
})
