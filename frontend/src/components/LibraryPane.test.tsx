import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { LibraryPane } from './LibraryPane'

import type { DocumentRecord } from '../types'

const documents: DocumentRecord[] = [
  {
    id: 'doc-1',
    title: 'Alpha document',
    source_type: 'paste',
    created_at: '2026-03-12T00:00:00Z',
    updated_at: '2026-03-12T00:00:00Z',
    available_modes: ['original', 'reflowed'],
    progress_by_mode: {},
  },
  {
    id: 'doc-2',
    title: 'Beta document',
    source_type: 'txt',
    created_at: '2026-03-12T00:00:00Z',
    updated_at: '2026-03-12T00:00:00Z',
    available_modes: ['original', 'reflowed'],
    progress_by_mode: {},
  },
]

afterEach(() => {
  cleanup()
})

test('LibraryPane shows a search-specific empty state when the filter has no matches', () => {
  render(
    <LibraryPane
      activeDocumentId="doc-1"
      deletingDocumentId={null}
      documents={[]}
      hasAnyDocuments
      loading={false}
      open
      searchValue="missing"
      onDelete={async () => undefined}
      onSearchChange={() => undefined}
      onSelect={() => undefined}
      onToggleOpen={() => undefined}
    />,
  )

  expect(screen.getByText('No documents match this search yet.')).toBeInTheDocument()
})

test('LibraryPane passes the selected document back to the parent', () => {
  const onSelect = vi.fn()

  render(
    <LibraryPane
      activeDocumentId="doc-1"
      deletingDocumentId={null}
      documents={documents}
      hasAnyDocuments
      loading={false}
      open
      searchValue=""
      onDelete={async () => undefined}
      onSearchChange={() => undefined}
      onSelect={onSelect}
      onToggleOpen={() => undefined}
    />,
  )

  fireEvent.click(screen.getByText('Alpha document'))

  expect(onSelect).toHaveBeenCalledWith(documents[0])
})

test('LibraryPane marks only the active row as active and keeps other rows passive', () => {
  render(
    <LibraryPane
      activeDocumentId="doc-1"
      deletingDocumentId={null}
      documents={documents}
      hasAnyDocuments
      loading={false}
      open
      searchValue=""
      onDelete={async () => undefined}
      onSearchChange={() => undefined}
      onSelect={() => undefined}
      onToggleOpen={() => undefined}
    />,
  )

  expect(screen.getByTitle('Alpha document')).toHaveClass('library-item-active')
  expect(screen.getByTitle('Alpha document')).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByTitle('Beta document')).toHaveClass('library-item-passive')
  expect(screen.getByTitle('Beta document')).toHaveAttribute('aria-pressed', 'false')
})

test('LibraryPane keeps long titles accessible while using the shorter Home search wording', () => {
  render(
    <LibraryPane
      activeDocumentId="doc-1"
      deletingDocumentId={null}
      documents={documents}
      hasAnyDocuments
      loading={false}
      open
      searchValue=""
      onDelete={async () => undefined}
      onSearchChange={() => undefined}
      onSelect={() => undefined}
      onToggleOpen={() => undefined}
    />,
  )

  expect(screen.getByPlaceholderText('Search Home')).toBeInTheDocument()
  expect(screen.getByTitle('Alpha document')).toHaveAttribute('title', 'Alpha document')
})

test('LibraryPane hides search and rows when collapsed but keeps the disclosure action', () => {
  render(
    <LibraryPane
      activeDocumentId="doc-1"
      deletingDocumentId={null}
      documents={documents}
      hasAnyDocuments
      loading={false}
      open={false}
      searchValue=""
      onDelete={async () => undefined}
      onSearchChange={() => undefined}
      onSelect={() => undefined}
      onToggleOpen={() => undefined}
    />,
  )

  expect(screen.getByRole('button', { name: 'Show' })).toBeInTheDocument()
  expect(screen.queryByPlaceholderText('Search Home')).not.toBeInTheDocument()
  expect(screen.queryByTitle('Alpha document')).not.toBeInTheDocument()
})

test('LibraryPane can render as embedded dock content without card chrome', () => {
  const { container } = render(
    <LibraryPane
      activeDocumentId="doc-1"
      deletingDocumentId={null}
      documents={documents}
      embedded
      hasAnyDocuments
      loading={false}
      open
      searchValue=""
      onDelete={async () => undefined}
      onSearchChange={() => undefined}
      onSelect={() => undefined}
      onToggleOpen={() => undefined}
    />,
  )

  const root = container.querySelector('.library-pane')
  expect(root).toHaveClass('library-pane-embedded')
  expect(root).not.toHaveClass('card')
})

test('LibraryPane can stay open without rendering the disclosure toggle', () => {
  render(
    <LibraryPane
      activeDocumentId="doc-1"
      deletingDocumentId={null}
      documents={documents}
      embedded
      hasAnyDocuments
      loading={false}
      open={false}
      searchValue=""
      showToggle={false}
      onDelete={async () => undefined}
      onSearchChange={() => undefined}
      onSelect={() => undefined}
      onToggleOpen={() => undefined}
    />,
  )

  expect(screen.queryByRole('button', { name: 'Hide' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Show' })).not.toBeInTheDocument()
  expect(screen.getByPlaceholderText('Search Home')).toBeInTheDocument()
  expect(screen.getByTitle('Alpha document')).toBeInTheDocument()
})

test('LibraryPane can hide its visible header chrome while keeping search accessible', () => {
  render(
    <LibraryPane
      activeDocumentId="doc-1"
      deletingDocumentId={null}
      documents={documents}
      embedded
      hasAnyDocuments
      loading={false}
      open
      searchLabel="Search saved sources"
      searchPlaceholder="Search saved sources"
      searchValue=""
      showHeader={false}
      showSearchLabel={false}
      showToggle={false}
      title="Source library"
      onDelete={async () => undefined}
      onSearchChange={() => undefined}
      onSelect={() => undefined}
      onToggleOpen={() => undefined}
    />,
  )

  expect(screen.queryByRole('heading', { name: 'Source library', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByText('2 saved')).not.toBeInTheDocument()
  expect(screen.queryByText('Search')).not.toBeInTheDocument()
  expect(screen.getByRole('searchbox', { name: 'Search saved sources' })).toBeInTheDocument()
})

test('LibraryPane exposes delete through the row actions instead of a visible trash button', async () => {
  const onDelete = vi.fn(async () => undefined)

  render(
    <LibraryPane
      activeDocumentId="doc-1"
      deletingDocumentId={null}
      documents={documents}
      hasAnyDocuments
      loading={false}
      open
      searchValue=""
      onDelete={onDelete}
      onSearchChange={() => undefined}
      onSelect={() => undefined}
      onToggleOpen={() => undefined}
    />,
  )

  fireEvent.click(screen.getByRole('button', { name: /More actions for Alpha document/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

  expect(onDelete).toHaveBeenCalledWith(documents[0])
})
