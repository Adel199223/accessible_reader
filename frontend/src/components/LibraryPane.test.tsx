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
